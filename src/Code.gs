// HALAMAN CODE UTAMA

function doPost(e) {
  bot.doPost(e);
}

// 1. Perintah /start - MEMAKSA KEYBOARD MUNCUL
bot.cmd('start', (ctx) => {
  const keyboard = {
    keyboard: [
      [{ text: "🔄 Hitung Lagi" }, { text: "ℹ️ Bantuan" }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  };

  return ctx.replyWithMarkdown(
    "🌿 *Bot Estate Planning Aktif*\n\n" +
    "Tombol menu sudah tersedia di bawah layar Anda. Silakan kirim data dengan format:\n\n" +
    "`Jarak | Buffer | No.TitikAcuan | Koordinat`",
    { reply_markup: JSON.stringify(keyboard) }
  );
});

// 2. Handler Pesan Teks & Tombol Keyboard
bot.on('message', (ctx) => {
  const text = ctx.message.text || "";

  // Respon untuk tombol menu bawah
  if (text === "🔄 Hitung Lagi") {
    return ctx.reply("Silakan tempel data Anda dengan format:\nJarak | Buffer | No.TitikAcuan | Koordinat");
  }
  
  if (text === "ℹ️ Bantuan") {
    return ctx.reply("Contoh format:\n9x9 | 2 | 1 | 103.6,-3.8 ; 103.61,-3.8 ; 103.61,-3.81");
  }

  // Deteksi jika pesan adalah data (mengandung '|')
  if (text.includes('|')) {
    return prosesKalkulasi(ctx, text);
  }
});

// 3. Perintah /hitung - HANYA UNTUK KALKULASI
bot.cmd('hitung', (ctx) => {
  // Mengambil teks setelah kata '/hitung '
  const msgText = ctx.message.text || "";
  const arg = msgText.includes(' ') ? msgText.split(' ').slice(1).join(' ') : "";

  if (!arg || !arg.includes('|')) {
    return ctx.reply("❌ Sertakan data setelah perintah /hitung.\nContoh: /hitung 9x9 | 2 | 1 | 103.6,-3.8 ; ...");
  }
  
  return prosesKalkulasi(ctx, arg);
});

// 4. Fungsi Kalkulasi (Tetap Sama)
function prosesKalkulasi(ctx, text) {
  try {
    const parts = text.split('|');
    if (parts.length < 4) return ctx.reply("❌ Format Salah! Minimal ada 3 separator '|'");

    const [dx_m, dy_m] = parts[0].trim().toLowerCase().split('x').map(n => parseFloat(n.trim()));
    const bufferM = parseFloat(parts[1].trim());
    const userIndex = parseInt(parts[2].trim()) - 1; 
    const coordString = parts[3].trim();

    const rawCoords = coordString.split(';').map(pair => {
      const lonLat = pair.split(',').map(num => parseFloat(num.trim()));
      return (lonLat.length >= 2 && !isNaN(lonLat[0])) ? lonLat : null;
    }).filter(c => c !== null);

    if (rawCoords.length < 3) return ctx.reply("❌ Koordinat minimal 3 titik.");

    const poly = [...rawCoords];
    if (poly[0].toString() !== poly[poly.length - 1].toString()) poly.push(poly[0]);
    
    const fixIndex = (userIndex >= 0 && userIndex < rawCoords.length) ? userIndex : 0;
    const startNode = rawCoords[fixIndex]; 

    const result = buildKML(poly, startNode, dx_m, dy_m, bufferM);
    
    // PERBAIKAN: Nama file tanpa karakter underscore yang bisa merusak Markdown
    const safeFileName = `Plan-${dx_m}x${dy_m}-T${fixIndex + 1}.kml`;
    const blob = Utilities.newBlob(result.kml, 'application/vnd.google-earth.kml+xml', safeFileName);

    // PERBAIKAN: Gunakan format laporan yang lebih bersih
    let laporan = "✅ *PROSES SELESAI*\n" +
                  "----------------------------------------\n" +
                  "📄 File: `" + safeFileName + "`\n" +
                  "📏 Luas: " + result.areaHa.toFixed(2) + " Ha\n" +
                  "🌴 Jarak: " + dx_m + "m x " + dy_m + "m\n" +
                  "📍 P1: Titik ke-" + (fixIndex + 1) + "\n" +
                  "🌳 Total: " + result.count + " Pokok\n" +
                  "----------------------------------------";

    return ctx.replyWithDocument(blob, { 
      caption: laporan, 
      parse_mode: "Markdown" 
    });

  } catch (e) {
    // Jika Markdown gagal, kirim sebagai teks biasa saja
    return ctx.reply("❌ Terjadi kesalahan: " + e.message);
  }
}


// Fungsi buildKML tetap sama seperti sebelumnya...
function buildKML(poly, startNode, dx_m, dy_m, bufferM) {
  const innerPoly = Helper.createInsetPoly(poly, bufferM);
  const dx = dx_m * M_TO_DEG;
  const dy = dy_m * M_TO_DEG;
  
  let areaDeg = 0;
  for (let i = 0; i < poly.length - 1; i++) {
    areaDeg += (poly[i][0] * poly[i+1][1]) - (poly[i+1][0] * poly[i][1]);
  }
  const areaHa = (Math.abs(areaDeg) / 2 / Math.pow(M_TO_DEG, 2)) / 10000;

  let boundaryKML = "";
  for (let i = 0; i < poly.length - 1; i++) {
    boundaryKML += `<Placemark><name>Sudut-${i+1}</name><styleUrl>#s_sudut</styleUrl><Point><coordinates>${poly[i][0]},${poly[i][1]},0</coordinates></Point></Placemark>`;
    Helper.getInterpolatedPoints(poly[i], poly[i+1], 10).forEach((p, j) => {
      boundaryKML += `<Placemark><name>R${i+1}-${j+1}</name><styleUrl>#s_ruas</styleUrl><Point><coordinates>${p[0]},${p[1]},0</coordinates></Point></Placemark>`;
    });
  }

  let lons = poly.map(p => p[0]), lats = poly.map(p => p[1]);
  let minX = Math.min(...lons), maxX = Math.max(...lons), minY = Math.min(...lats), maxY = Math.max(...lats);

  let startX = startNode[0] - (Math.ceil((startNode[0] - minX) / dx) * dx);
  let startY = startNode[1] - (Math.ceil((startNode[1] - minY) / dy) * dy);

  let x_range = Helper.arange(startX, maxX + dx, dx);
  let y_range = Helper.arange(startY, maxY + dy, dy);

  let tanamKML = "";
  let count = 0;
  y_range.forEach((y, i) => {
    let offset = (i % 2 !== 0) ? (dx / 2) : 0;
    x_range.forEach(x => {
      let adjX = x + offset;
      if (Helper.isPointInPoly([adjX, y], innerPoly)) {
        count++;
        tanamKML += `<Placemark><name>S-${count}</name><styleUrl>#s_tanam</styleUrl><Point><coordinates>${adjX},${y},0</coordinates></Point></Placemark>`;
      }
    });
  });

  const kmlString = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
  <Style id="s_sudut"><IconStyle><color>ff00ffff</color><scale>1.1</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/ylw-stars.png</href></Icon></IconStyle></Style>
  <Style id="s_ruas"><IconStyle><scale>0.4</scale><Icon><href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href></Icon></IconStyle><LabelStyle><scale>0</scale></LabelStyle></Style>
  <Style id="s_tanam"><IconStyle><color>ff00aa00</color><scale>0.8</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/grn-circle.png</href></Icon></IconStyle></Style>
  <Folder><name>Batas Lahan</name>
    <Placemark><name>Area Polygon</name><Style><PolyStyle><color>4000ff00</color></PolyStyle><LineStyle><color>ff00ff00</color><width>2</width></LineStyle></Style>
    <Polygon><outerBoundaryIs><LinearRing><coordinates>${poly.map(p=>p.join(',')).join(' ')}</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark>
    ${boundaryKML}
  </Folder>
  <Folder><name>Titik Tanam</name>${tanamKML}</Folder>
</Document></kml>`;

  return { kml: kmlString, areaHa: areaHa, count: count };
}
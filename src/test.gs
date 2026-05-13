/**
 * Fungsi untuk menguji logika kalkulasi tanpa menggunakan Telegram
 */
function testLogic() {
  // Simulasi data input dari user: Jarak | Buffer | Koordinat (3 titik)
  const mockInput = "8x9 | 2 | 103.6442,-3.8629 ; 103.6446,-3.8628 ; 103.6448,-3.8632";
  
  try {
    let parts = mockInput.split('|');
    let [dx_m, dy_m] = parts[0].trim().toLowerCase().split('x').map(Number);
    let bufferM = Number(parts[1].trim());
    let rawCoords = parts[2].trim().split(';').map(c => c.split(',').map(Number));

    // Validasi penutupan poligon
    if (rawCoords[0].toString() !== rawCoords[rawCoords.length-1].toString()) {
      rawCoords.push(rawCoords[0]);
    }

    Logger.log("Memulai simulasi build KML...");
    let kmlResult = buildKML(rawCoords, dx_m, dy_m, bufferM);
    
    // Periksa apakah output KML mengandung tag titik tanam
    if (kmlResult.includes("<Placemark>")) {
      Logger.log("✅ PENGUJIAN BERHASIL: KML berhasil dibuat.");
      Logger.log("Preview KML (500 karakter pertama): " + kmlResult.substring(0, 500));
    } else {
      Logger.log("⚠️ PENGUJIAN SELESAI: KML dibuat tapi mungkin kosong (cek koordinat/buffer).");
    }

  } catch (e) {
    Logger.log("❌ PENGUJIAN GAGAL: " + e.toString());
  }
}

/**
 * Fungsi untuk menguji apakah Library Lumpia sudah terhubung
 */
function testLumpiaConnection() {
  try {
    let me = bot.getMe();
    Logger.log("✅ Koneksi Bot OK: @" + me.result.username);
  } catch (e) {
    Logger.log("❌ Koneksi Bot GAGAL: Periksa Token Anda.");
  }
}
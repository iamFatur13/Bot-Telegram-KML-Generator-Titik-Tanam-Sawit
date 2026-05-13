const Helper = {
  // Fungsi arange untuk membuat deret angka (seperti np.arange di Python)
  arange: function(start, stop, step) {
    let arr = [];
    for (let i = start; i < stop; i += step) {
      arr.push(i);
    }
    return arr;
  },

  // Algoritma Ray-Casting untuk cek titik di dalam area
  isPointInPoly: function(point, polygon) {
    if (!polygon || polygon.length < 3) return false;
    let x = point[0], y = point[1];
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      let xi = polygon[i][0], yi = polygon[i][1];
      let xj = polygon[j][0], yj = polygon[j][1];
      let intersect = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  },

  // Interpolasi titik setiap 10m di sepanjang garis batas
  getInterpolatedPoints: function(p1, p2, intervalM) {
    let points = [];
    let distDeg = Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
    let distM = distDeg / M_TO_DEG;
    let numSteps = Math.floor(distM / intervalM);
    
    if (numSteps > 1) {
      for (let i = 1; i < numSteps; i++) {
        let frac = (i * intervalM) / distM;
        points.push([p1[0] + (p2[0] - p1[0]) * frac, p1[1] + (p2[1] - p1[1]) * frac]);
      }
    }
    return points;
  },

  // Membuat poligon dalam (Sempadan/Buffer Inset)
  createInsetPoly: function(poly, bufferM) {
    if (!poly || poly.length === 0) return [];
    if (bufferM <= 0) return poly;

    let bufferDeg = bufferM * M_TO_DEG;
    let cx = poly.reduce((a, b) => a + b[0], 0) / poly.length;
    let cy = poly.reduce((a, b) => a + b[1], 0) / poly.length;
    
    return poly.map(p => {
      let dx = p[0] - cx;
      let dy = p[1] - cy;
      let dist = Math.sqrt(dx * dx + dy * dy);
      if (dist === 0) return p;
      return [p[0] - (dx / dist * bufferDeg), p[1] - (dy / dist * bufferDeg)];
    });
  }
};
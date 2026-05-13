# 🌴 Oil Palm Estate Planner Bot (Telegram Version)

![Status](https://img.shields.io/badge/Status-Active-brightgreen)
![Platform](https://img.shields.io/badge/Platform-Telegram-blue)
![Engine](https://img.shields.io/badge/Engine-Google%20Apps%20Script-orange)

Solusi praktis untuk perencanaan titik tanam kelapa sawit dengan pola **Mata Lima (Triangular Grid)**. Bot ini mengonversi koordinat lahan menjadi file KML yang siap digunakan di Google Earth atau GPS genggam.

## 🚀 Latar Belakang

Sebelumnya, alat ini dikembangkan dalam versi **Python (Shapely & SimpleKML)**. Meskipun akurat, penggunaan versi desktop memiliki keterbatasan:
* **Ketergantungan Perangkat:** Harus membuka laptop/PC untuk menjalankan script.
* **Mobilitas Rendah:** Sulit digunakan secara instan saat sedang berada di lapangan (kebun).
* **Setup Rumit:** Memerlukan instalasi *environment* Python dan berbagai library.

**Versi Bot Telegram** ini hadir sebagai evolusi untuk mempermudah pekerjaan di lapangan. Dibangun menggunakan **Google Apps Script (GAS)**, perencanaan lahan kini bisa dilakukan langsung dari smartphone, kapan saja, dan di mana saja.

## ✨ Fitur Utama

* **Pola Mata Lima Presisi:** Menggunakan logika kalkulasi segitiga sama sisi (triangular grid) untuk optimasi populasi tanaman.
* **Input User-Friendly:** Penentuan titik acuan (*Anchor Point*) hanya dengan memasukkan nomor urut titik sudut lahan.
* **Output KML Instan:** Menghasilkan file KML dengan struktur folder yang rapi:
    * **Batas Lahan:** Visualisasi area poligon.
    * **Ruas Batas:** Penanda waypoint setiap 10 meter untuk memudahkan pematokan.
    * **Titik Tanam:** Koordinat presisi untuk setiap lubang tanam.
* **Laporan Statistik Otomatis:** Menampilkan estimasi luas lahan (Ha), jumlah total pokok (SPH), dan parameter jarak tanam dalam satu pesan.

## 🛠️ Arsitektur Teknologi

* **Language:** JavaScript (Google Apps Script)
* **Bot Framework:** [Lumpia JS V3](https://lumpia.js.org/) buatan [banghasan](https://github.com/banghasan)
* **API:** Telegram Bot API
* **Geospatial Logic:** Ray-casting algorithm untuk validasi poligon & Shoelace formula untuk perhitungan luas.

## 📝 Cara Penggunaan

Cukup kirimkan pesan ke Bot dengan format berikut::

```text
Jarak Tanam | Buffer | No. Titik Acuan | Daftar Koordinat  

```

Contoh
```text
8x9 | 3 | 2 | lat-long 1;lat-long 2;lat-long 3;lat-long 4
```

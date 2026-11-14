# SkyForge

SkyForge adalah proyek website yang menampilkan konsep layanan infrastruktur cloud melalui tampilan interaktif. Proyek ini dibuat sebagai bagian dari pengembangan keterampilan di bidang teknologi informasi, khususnya pengembangan website.

SkyForge dirancang agar pengguna dapat mengenal berbagai layanan cloud, melihat simulasi pengelolaan server, serta memahami cara kerja beberapa fitur infrastruktur cloud melalui satu website.

## Fitur Utama

### 1. Dashboard Cloud
Menampilkan informasi penggunaan CPU, RAM, penyimpanan, dan kondisi server. Data yang ditampilkan merupakan simulasi untuk memberikan gambaran tentang pemantauan sumber daya server.

### 2. Layanan Cloud
SkyForge menyediakan beberapa halaman layanan, yaitu:

- **Compute:** Informasi mengenai layanan komputasi dan server virtual.
- **Storage:** Informasi mengenai penyimpanan data berbasis cloud.
- **Network:** Informasi mengenai jaringan dan konektivitas.
- **Database:** Informasi mengenai layanan pengelolaan basis data.

### 3. Simulasi Deployment
Menampilkan tahapan proses deployment, mulai dari pembangunan aplikasi, pengujian, penerapan, hingga aplikasi berjalan.

### 4. Visualisasi Lokasi Server
Menggunakan CesiumJS untuk menampilkan globe tiga dimensi dengan lokasi referensi Jakarta, Singapura, dan Tokyo.

Lokasi dan informasi latensi yang ditampilkan digunakan untuk kebutuhan demonstrasi.

### 5. Kalkulator Harga
Memungkinkan pengguna menghitung perkiraan biaya layanan berdasarkan pilihan yang tersedia pada website.

### 6. Dokumentasi
Menyediakan halaman dokumentasi mengenai layanan cloud, API, CLI, dan beberapa fitur lainnya.

### 7. Formulir Konsultasi
Pengguna dapat mengirimkan informasi mengenai kebutuhan proyek melalui formulir yang terhubung dengan backend Node.js.

Data yang dikirimkan disimpan pada server dalam format JSONL.

## Teknologi yang Digunakan

| Teknologi | Penggunaan |
|---|---|
| HTML | Struktur halaman website |
| CSS | Tampilan dan tata letak |
| JavaScript | Interaksi dan simulasi |
| Node.js | Backend dan server website |
| CesiumJS | Visualisasi globe tiga dimensi |

## Cara Menjalankan

Pastikan Node.js versi 18 atau lebih baru sudah terpasang.

1. Unduh atau ekstrak proyek SkyForge.
2. Buka terminal pada folder utama proyek yang berisi `package.json`.
3. Jalankan perintah berikut:

```bash
npm start
```

4. Setelah server berjalan, buka alamat berikut melalui browser:

```text
http://127.0.0.1:8080
```

Website dapat dijalankan secara lokal untuk mencoba fitur yang tersedia.

## Struktur Proyek

Beberapa file utama yang digunakan dalam pengembangan SkyForge:

| File | Fungsi |
|---|---|
| `index.html` | Halaman utama |
| `styles.css` | Pengaturan tampilan dasar |
| `skyforge.css` | Tampilan khusus SkyForge |
| `script.js` | Interaksi pada halaman utama |
| `server.js` | Server dan API konsultasi |
| `cloud.js` | Simulasi dashboard cloud |
| `checkout.js` | Simulasi pembayaran |
| `server-globe.js` | Visualisasi globe CesiumJS |

## Batasan Proyek

SkyForge merupakan prototipe yang dibuat untuk keperluan pembelajaran dan demonstrasi dalam lomba IT.

Beberapa fitur, seperti monitoring server, deployment, informasi latensi, status layanan, dan pembayaran, masih menggunakan data simulasi.

Proyek ini belum menyediakan layanan penyewaan server cloud secara langsung.

## Tujuan Pengembangan

Melalui proyek SkyForge, pengembang ingin menerapkan pengetahuan mengenai HTML, CSS, JavaScript, dan Node.js dalam sebuah website yang memiliki beberapa fitur saling terhubung.

Proyek ini juga menjadi sarana untuk mempelajari perancangan antarmuka, pengembangan backend, visualisasi data, dan pengelolaan struktur kode.

## Penutup

SkyForge masih dapat dikembangkan lebih lanjut, baik dari segi tampilan, fitur, maupun integrasi sistem.

Pengembangan berikutnya dapat difokuskan pada peningkatan interaktivitas, penyempurnaan dashboard, dan penambahan fitur pengelolaan server yang lebih lengkap.

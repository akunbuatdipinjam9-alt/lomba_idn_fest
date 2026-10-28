# SKYFORGE

Prototype website dan console layanan cloud. Dibuat dengan HTML, CSS, dan JavaScript tanpa framework atau proses build. Globe menggunakan CesiumJS 1.121 dari CDN resmi.

## Menjalankan

Ekstrak ZIP terlebih dahulu, lalu buka `index.html`. Gunakan server statis untuk menguji perpindahan halaman dan penyimpanan browser secara konsisten. Jika Python tersedia, jalankan `python -m http.server 8080` dari folder website, lalu buka `http://localhost:8080`.

Halaman produk memakai folder dengan `index.html`, misalnya `compute/index.html`. Hosting dengan directory index dapat membukanya sebagai `/compute/`. Atur halaman tidak ditemukan pada hosting ke `404.html`. Setelah domain ditentukan, gunakan URL absolut untuk `og:image` pada metadata halaman.

## Halaman

- Homepage: produk, console preview, deployment, arsitektur, harga, FAQ, dan kontak.
- Produk: `/compute/`, `/storage/`, `/network/`, `/database/`.
- Panduan: `/docs/`, `/docs/compute/`, `/docs/storage/`, `/docs/networking/`, `/docs/api/`, `/docs/cli/`.
- Tools: `/calculator/` dan `/status/`.
- Informasi: `/contact/`, `/security/`, `/privacy/`, `/terms/`, `/changelog/`.
- Akun demo: `login.html` dan `app.html`.

## Pembagian kode

| Berkas | Tanggung jawab |
| --- | --- |
| `script.js` | Bahasa, tema, console preview, pricing paket, dialog, dan ringkasan proyek pada homepage. |
| `pointer.js` | Cursor dot/ring dan dua tombol magnetic. Memakai helper DOM dari `script.js`, sehingga dimuat setelahnya. |
| `motion.js` | Entrance, reveal, count-up, dan bagian yang mengikuti scroll. |
| `checkout.js` | Konfigurasi pesanan, promo, hasil pembayaran simulasi, dan struk demo. |
| `cloud.js` | Login demo, sesi console, instance, storage, database, billing, profil, dan activity log. |
| `cloud-extras.js` | Volume, network, dan token API demo. Dimuat sebelum `cloud.js`. |
| `public.js` | Kalkulator custom, riwayat status, copy command, dan network map. |

`styles.css` berisi gaya dasar homepage; `skyforge.css` berisi layout dan penyesuaian SKYFORGE. `motion.css`, `checkout.css`, `cloud.css`, dan `public.css` mengikuti bagian yang namanya sesuai. Aset dan lisensi berada di `assets/`; sumber gambar tercatat dalam `CREDITS.md`.

`register.css` mengatur tampilan katalog pada homepage dan halaman produk: baris layanan, daftar konfigurasi harga, catatan spesifikasi platform, dan indeks route. Hero menampilkan konfigurasi deployment contoh dengan satu tombol utama. Daftar stack berada pada bagian referensi; daftar tersebut bukan partner atau endorsement. Urutan bagian akhir tetap indeks layanan, FAQ, kontak, lalu footer.

## Penyimpanan dan batas demo

Preferensi bahasa dan tema menggunakan localStorage. Ringkasan proyek disimpan di perangkat hanya setelah pengguna memberi persetujuan. Ringkasan dapat diunduh, diedit, atau dihapus. Tidak ada email yang dikirim.

Login membuat sesi demo dalam sessionStorage. Password tidak disimpan. Instance, bucket, database, volume, jaringan, token contoh, dan activity log bertahan saat reload selama sesi tab tersedia. Logout menghapus sesi console. Settings menyediakan reset workspace. Jika penyimpanan browser diblokir, UI menampilkan pemberitahuan.

Start/Stop, Restart, dan deployment hanya mengubah resource lokal. Volume dapat dikaitkan ke instance pada region yang sama. Menghapus instance melepaskan asosiasi volume. Subnet yang sama ditolak jika sudah dipakai pada region yang sama. Token API diawali `demo_not_valid_` dan tidak memberikan akses nyata. IP `192.0.2.x` dipakai sebagai alamat dokumentasi.

Checkout memakai kartu atau dompet contoh; tidak mengumpulkan kartu asli, menarik dana, membuat langganan, atau mengirim order. Diskon tahunan paket adalah 20%. Promo FORGE10 memberi diskon tambahan 10% setelah diskon tahunan. Menutup checkout membatalkan proses yang tertunda.

Kalkulator custom memakai tarif CPU, RAM, dan SSD yang ditampilkan pada halaman. Model custom terpisah dari paket tetap. Contoh 2 vCPU, 4 GB RAM, 80 GB SSD, Jakarta menghasilkan Rp249.000/bulan. Perhitungan berada dalam `estimatePrice` di `public.js`.

Status page menghitung persentase dari insiden contoh selama 90 hari. Region dan latency tidak diukur. Endpoint API memakai domain `.example`; CLI hanya contoh command dan tidak tersedia sebagai aplikasi. Tombol Copy tidak mengeksekusi command.

## Animasi dan akses

Reduced motion menonaktifkan efek gerak. Cursor custom dan magnetic hanya aktif untuk pointer mouse. Dashboard sticky 240vh dan jalur infrastruktur 200vh aktif pada viewport minimal 1000 × 740 px; layar lebih kecil memakai navigasi chapter. Elemen formulir tetap menggunakan cursor bawaan.

## Pemeriksaan

Pemeriksaan sintaks, komentar, ID, aset, route, dan fragment sudah dijalankan. Tes DOM mencakup bahasa, tema, checkout berhasil/ditolak, harga tahunan dan promo, kalkulator custom, status 90 hari, login/logout, pengelolaan resource, API key, profil yang di-escape, activity, serta chapter scroll.

Pemeriksaan visual langsung pada browser belum dilakukan dalam sesi ini. Uji desktop dan ponsel pada hosting tujuan sebelum menampilkan prototype kepada pengguna lain.

## Globe lokasi server (CesiumJS)

Globe tersedia di homepage, tepat di atas tiga kartu region. Klik marker/kartu atau ubah pilihan region console untuk mengarahkan kamera. Tombol View all regions mengembalikan pandangan global. Mendukung drag, zoom, keyboard melalui kartu, layar kecil, dan reduced motion.

Jalankan lewat server HTTP. Koneksi internet dan browser dengan WebGL diperlukan untuk CesiumJS dan tekstur Natural Earth II dari cesium.com. Tidak membutuhkan token Cesium ion. Library dimuat saat bagian globe mendekati viewport; kartu tetap berfungsi jika pemuatan 3D gagal. Kredit bawaan Cesium tetap ditampilkan.

Data berada di objek `locations` dalam `server-globe.js`: Jakarta, Singapore, Tokyo mengikuti region demo proyek. Koordinat hanya titik acuan kota, bukan alamat fasilitas server, dan tidak menunjukkan monitoring/latensi aktual. Untuk lokasi sungguhan, ganti dengan data infrastruktur yang sudah diverifikasi.

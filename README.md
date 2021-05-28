# Tubes PRD
Sistem Speed Limit Monitoring Berbasis Arduino dan IoT
## 1. Sistem Arduino
- Sirkuit dapat diakses melalui file EAGLE .brd `Arduino_Sirkuit.brd`.

- Untuk tinkercad, dapat diakses melalui [link berikut](https://www.tinkercad.com/things/5KMD2x1jqb5-copy-of-digital-io/editel?sharecode=HZqOl72FebMQ7UGJiDajDyWcpKHz6aEv8LMwwZCvuac).
> Link tinkercad **expire 276 jam lagi (dari hari Rabu, 18 Mei 2021 pada jam 2.30AM WIB).** Jika sudah expire, hubungi kelompok.

## 2. Sistem Internet of Things (IoT)
Untuk menjalankan web client dan mock program:
- Install terlebih dahulu package dengan `npm i` pada directory ini.
- Server menggunakan redis, oleh karena itu jalankan `redis-server` terlebih dahulu di `localhost:6379`.
> **Note**: Jika ingin menggunakan storage memory, ganti `RedisDeviceStore` menjadi `MemoryDeviceStore`, kemudian hapus/comment line untuk membuat client redis.
- Jalankan server dengan `node index.js`. Gunakan `nodemon` jika ingin auto-update.

Web client dapat diakses dengan `live server` pada directory `frontend` dan mengakses `index.html`.

_Mock Program_ dapat diakses dan dijalankan sebanyak yang diinginkan dengan `node device.js`.
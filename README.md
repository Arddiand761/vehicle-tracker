# 🚗 Vehicle Tracker

Aplikasi web **Fleet Management** untuk memantau dan mengelola armada kendaraan secara real-time. Dibangun menggunakan **React + TypeScript** (frontend) dan **Express.js + TypeScript + PostgreSQL** (backend).

---

## 📸 Tampilan

| Dashboard | Kendaraan |
|---|---|
| Live map tracking kendaraan dengan status real-time | CRUD kendaraan, assign driver, start/end trip |

---

## ✨ Fitur

- 🔐 **Autentikasi** — Login/Register dengan JWT, role-based access (Admin, Operator, Viewer)
- 🗺️ **Live Tracking** — Peta real-time posisi seluruh armada menggunakan Leaflet + OpenStreetMap
- 🚗 **Manajemen Kendaraan** — CRUD kendaraan, assign/unassign driver, start/end trip
- 👤 **Manajemen Driver** — CRUD driver, riwayat perjalanan per driver
- 📊 **Laporan** — Riwayat trip dengan filter tanggal & status, summary total jarak & durasi
- 🔔 **Alert & Notifikasi** — Speeding, geofence violation, idle terlalu lama, sinyal hilang
- 📍 **Geofencing** — Definisi zona polygon, deteksi kendaraan keluar zona
- 📈 **Dashboard** — Summary armada, statistik harian, alert terbaru
- 🤖 **Dummy Simulator** — Simulasi pergerakan kendaraan otomatis tiap 5 detik

---

## 🛠️ Tech Stack

### Backend
| Tech | Keterangan |
|---|---|
| Express.js + TypeScript | REST API framework |
| PostgreSQL | Database relasional |
| JWT + bcryptjs | Autentikasi & enkripsi password |
| node-postgres (pg) | PostgreSQL client |
| Swagger UI | Dokumentasi API |

### Frontend
| Tech | Keterangan |
|---|---|
| React + TypeScript + Vite | UI framework |
| React Router DOM | Client-side routing |
| Leaflet + React Leaflet | Peta interaktif |
| Axios | HTTP client |
| Tailwind CSS | Styling |
| Lucide React | Icon library |

---

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js >= 18
- PostgreSQL >= 14
- npm

---

### 1. Clone Repository

```bash
git clone https://github.com/username/vehicle-tracker.git
cd vehicle-tracker
```

---

### 2. Setup Backend

```bash
cd tracker-vehicle-backend
npm install
```

Buat file `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vehicle_tracker
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

Buat database di PostgreSQL:
```sql
CREATE DATABASE vehicle_tracker;
```

Jalankan migration SQL (lihat folder `src/migrations/`) di pgAdmin atau psql.

Seed data dummy:
```bash
npm run seed
```

Jalankan server:
```bash
npm run dev
```

Server berjalan di `http://localhost:3000`

---

### 3. Setup Frontend

```bash
cd tracker-vehicle
npm install
```

Buat file `.env`:
```env
VITE_API_URL=http://localhost:3000/api
```

Jalankan:
```bash
npm run dev
```

Frontend berjalan di `http://localhost:5173`

---

## 📚 API Dokumentasi

Dokumentasi API tersedia secara interaktif via Swagger UI setelah backend dijalankan:

```
http://localhost:3000/api/docs
```

Fitur Swagger UI:
- Lihat semua endpoint beserta request/response schema
- Test endpoint langsung dari browser
- Klik tombol **Authorize** → masukkan JWT token hasil login untuk mengakses endpoint yang protected

---

## 👤 Akun Demo

Setelah menjalankan `npm run seed`, akun berikut tersedia:

| Role | Email | Password |
|---|---|---|
| Admin | admin@fleet.com | password123 |
| Operator | operator1@fleet.com | password123 |
| Driver | budi@fleet.com | password123 |

---

## 📁 Struktur Project

```
vehicle-tracker/
├── tracker-vehicle-backend/       # Backend Express.js
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.ts              # Koneksi PostgreSQL
│   │   │   └── swagger.ts         # Konfigurasi Swagger
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT middleware
│   │   ├── modules/
│   │   │   ├── auth/              # Register, Login
│   │   │   ├── vehicles/          # CRUD Kendaraan
│   │   │   ├── drivers/           # CRUD Driver
│   │   │   ├── trips/             # Manajemen Trip
│   │   │   ├── tracking/          # Live tracking + simulator
│   │   │   ├── alerts/            # Alert & notifikasi
│   │   │   ├── geofences/         # Zona geofence
│   │   │   └── dashboard/         # Summary & statistik
│   │   ├── seeds/
│   │   │   └── seed.ts            # Data dummy
│   │   └── app.ts                 # Entry point
│   └── package.json
│
└── tracker-vehicle/               # Frontend React
    ├── src/
    │   ├── api/
    │   │   └── axios.ts           # Axios instance + interceptor
    │   ├── components/
    │   │   ├── Layout.tsx
    │   │   └── Sidebar.tsx
    │   ├── hook/
    │   │   └── useAuth.ts
    │   ├── pages/
    │   │   ├── Login.tsx
    │   │   ├── Dashboard.tsx      # Live map + summary
    │   │   ├── Kendaraan.tsx      # CRUD kendaraan
    │   │   ├── Driver.tsx         # CRUD driver
    │   │   ├── Laporan.tsx        # Laporan trip
    │   │   └── Alerts.tsx         # Notifikasi & alert
    │   ├── types/
    │   │   └── index.ts           # Type definitions
    │   └── App.tsx
    └── package.json
```

---

## 🗺️ ERD Database

```
users ──< drivers ──< trips >── vehicles
                        │
                    locations
                        │
                      alerts
                        
geofences (standalone, dicek tiap update lokasi)
```

Tabel utama: `users`, `drivers`, `vehicles`, `trips`, `locations`, `alerts`, `geofences`

---

## 📝 Catatan

- Simulator dummy berjalan otomatis tiap **5 detik** saat backend dijalankan
- Posisi kendaraan di-seed sekitar area **Yogyakarta**
- Integrasi IoT/GPS real belum diimplementasikan (dummy only)
- Deployment belum dikonfigurasi (local development only)

---

## 📄 License

MIT License — bebas digunakan dan dimodifikasi.
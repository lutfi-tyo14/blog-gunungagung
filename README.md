# Gunung Agung Info Platform

Aplikasi web komunitas untuk berbagi, berdiskusi, dan mendapatkan informasi seputar Gunung Agung. Dibangun dengan Next.js, TypeScript, dan Supabase.

---

## ✨ Fitur Utama

- **Autentikasi**: Login & register menggunakan email/password (Supabase Auth)
- **Beranda**: Lihat daftar postingan terbaru dari komunitas
- **Buat Postingan**: Tulis postingan baru dengan gambar opsional
- **Komentar**: Diskusi di setiap postingan
- **Dashboard**: Lihat profil, postingan sendiri, dan (untuk admin) kelola user & postingan
- **Edit Profil**: Ubah username dan foto profil
- **Desain Konsisten**: UI modern, responsif, dan konsisten di seluruh halaman

---

## 🗺️ Alur Aplikasi

1. **Landing Page**: Pengguna baru diarahkan ke halaman utama dengan tombol Login & Register.
2. **Register/Login**: Pengguna membuat akun atau login. Setelah login, diarahkan ke halaman Beranda.
3. **Beranda** (`/posts`):
   - Melihat daftar postingan komunitas
   - Bisa menulis komentar di setiap postingan
   - Tombol "Buat Postingan" untuk membuat postingan baru
4. **Buat Postingan** (`/posts/new`):
   - Form untuk membuat postingan baru (judul, isi, gambar opsional)
5. **Dashboard** (`/dashboard`):
   - Lihat profil, daftar postingan sendiri
   - Admin/super admin bisa melihat & mengelola semua postingan dan user
6. **Profile** (`/profile`):
   - Edit username dan foto profil
   - Logout

---

## 🔒 Autentikasi & Hak Akses
- Hanya user terautentikasi yang bisa membuat postingan, komentar, dan mengakses dashboard/profile.
- Admin & super admin memiliki akses tambahan untuk mengelola postingan/user.

---

## ⚙️ Teknologi
- **Next.js** (App Router)
- **TypeScript**
- **Supabase** (Auth, Database, Storage)
- **Tailwind CSS** (utility-first styling)

---

## 🚀 Cara Instalasi & Menjalankan

1. **Clone repo**
   ```bash
   git clone <repo-url>
   cd uas-pbw
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Konfigurasi Supabase**
   - Buat project di [supabase.com](https://supabase.com)
   - Salin `SUPABASE_URL` dan `SUPABASE_ANON_KEY` ke file `.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=xxx
     NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
     ```
   - Pastikan tabel `posts`, `comments`, dan `profiles` sudah sesuai skema
4. **Jalankan aplikasi**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000)

---

## 📁 Struktur Halaman
- `/` : Landing page (welcome, login, register)
- `/auth/login` : Login
- `/auth/register` : Register
- `/posts` : Beranda (daftar postingan)
- `/posts/new` : Buat postingan baru
- `/posts/[id]` : Detail postingan & komentar
- `/dashboard` : Dashboard user/admin
- `/profile` : Edit profil & logout

---

## 🖼️ Catatan Desain
- Semua halaman menggunakan ornamen awan, ikon gunung, dan warna gradasi hijau-biru untuk konsistensi.
- Navbar menampilkan halaman aktif dengan bold & underline.

---

## 🟦 Penggunaan TypeScript

Aplikasi ini menggunakan TypeScript pada seluruh file utama, terutama pada file dengan ekstensi `.tsx` dan `.ts`. Berikut beberapa contoh file TypeScript di project ini:

- `app/page.tsx` — Landing page (TypeScript + JSX/React)
- `app/auth/login/page.tsx` — Halaman login (TypeScript + JSX/React)
- `app/auth/register/page.tsx` — Halaman register (TypeScript + JSX/React)
- `app/posts/page.tsx` — Beranda/daftar postingan (TypeScript + JSX/React)
- `app/posts/new/page.tsx` — Form buat postingan (TypeScript + JSX/React)
- `app/posts/[id]/page.tsx` — Detail postingan (TypeScript + JSX/React)
- `app/posts/[id]/edit/page.tsx` — Edit postingan (TypeScript + JSX/React)
- `app/dashboard/page.tsx` — Dashboard user/admin (TypeScript + JSX/React)
- `app/profile/page.tsx` — Halaman profil (TypeScript + JSX/React)
- `app/components/Navbar.tsx` — Komponen navigasi (TypeScript + JSX/React)
- `lib/supabaseClient.ts` — Inisialisasi Supabase client (TypeScript)
- `tsconfig.json` — Konfigurasi TypeScript untuk seluruh project

**Ciri-ciri file TypeScript:**
- Ekstensi `.ts` (untuk modul/helper) atau `.tsx` (untuk file React/JSX)
- Menggunakan tipe data eksplisit, misal: `const [user, setUser] = useState<User | null>(null);`
- Bisa mendefinisikan interface/type, misal:
  ```ts
  interface Post {
    id: string;
    title: string;
    ...
  }
  ```
- Lebih aman dari bug karena pengecekan tipe saat development

**Manfaat TypeScript:**
- Membantu mencegah bug tipe data
- Autocomplete & dokumentasi lebih baik di editor
- Kode lebih mudah dipelihara dan dikembangkan

---

## 📢 Kontribusi
Pull request & issue sangat diterima! Silakan fork dan kembangkan sesuai kebutuhan komunitas.

---

## Lisensi
MIT

## Environment Variables

For local development, create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

For Vercel deployment, add these environment variables in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- User authentication
- Blog post creation and management
- Comments system
- Image upload support
- Role-based access control (admin, super admin)
- Responsive design

## Build

```bash
npm run build
```

## Deployment

The application is configured for Vercel deployment. Make sure to set all required environment variables in your Vercel project settings.

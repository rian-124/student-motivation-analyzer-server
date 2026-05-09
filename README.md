# 🎓 Student Motivation Analyzer — Backend API

Backend server untuk aplikasi **Student Motivation Analyzer** yang dibangun menggunakan **NestJS** (Node.js framework berbasis TypeScript).

---

## 🚀 Cara Menjalankan

```bash
# 1. Install dependencies
npm install

# 2. Copy file environment
cp .env.example .env
# Lalu isi nilai di .env sesuai konfigurasi lokal kamu

# 3. Jalankan dalam mode development (auto-reload)
npm run start:dev

# Server berjalan di:
# http://localhost:3000/api
```

---

## 📁 Struktur Folder

```
student-motivation-analyzer-server/
│
├── src/                            ← Semua kode sumber ada di sini
│   │
│   ├── main.ts                     ← TITIK MASUK aplikasi
│   ├── app.module.ts               ← Module utama (pengumpul semua module)
│   ├── app.controller.ts           ← Controller utama
│   ├── app.service.ts              ← Service utama
│   │
│   ├── common/                     ← Kode yang dipakai BERSAMA (semua module)
│   │   ├── constants/              ← Nilai tetap (API_PREFIX, API_VERSION)
│   │   ├── decorators/             ← Custom decorator (@CurrentUser, @Roles)
│   │   ├── dto/                    ← DTO bersama (PaginationDto)
│   │   ├── enums/                  ← Tipe pilihan (Role, MotivationLevel)
│   │   ├── filters/                ← Penangkap error global
│   │   ├── guards/                 ← Penjaga akses (Auth, Roles)
│   │   ├── interceptors/           ← Pemformat response otomatis
│   │   ├── interfaces/             ← Tipe data TypeScript bersama
│   │   └── pipes/                  ← Validasi input custom
│   │
│   ├── config/                     ← Konfigurasi dari file .env
│   │   ├── app.config.ts           ← Config: PORT, NODE_ENV, CORS
│   │   ├── database.config.ts      ← Config: DB_HOST, DB_PORT, dll
│   │   ├── jwt.config.ts           ← Config: JWT_SECRET, JWT_EXPIRES_IN
│   │   └── index.ts                ← Export semua config
│   │
│   ├── database/                   ← Koneksi & setup database
│   │   ├── database.module.ts      ← Module koneksi (TypeORM/Prisma)
│   │   └── seeds/                  ← Data awal untuk database
│   │
│   └── modules/                    ← FITUR-FITUR utama aplikasi
│       ├── auth/                   ← 🔐 Login & Register
│       ├── users/                  ← 👤 Manajemen user
│       ├── students/               ← 🎓 Manajemen mahasiswa
│       ├── lecturers/              ← 👨‍🏫 Manajemen dosen
│       ├── recordings/             ← 🎙️ Upload rekaman
│       └── motivation-analysis/   ← 🧠 Analisis motivasi (AI)
│
├── test/                           ← File testing (end-to-end)
├── .env                            ← Variabel environment LOKAL (tidak di-commit)
├── .env.example                    ← Template .env (di-commit sebagai referensi)
├── nest-cli.json                   ← Konfigurasi NestJS CLI
├── tsconfig.json                   ← Konfigurasi TypeScript
└── package.json                    ← Daftar dependencies & scripts
```

---

## 🧩 Penjelasan Setiap Bagian

### 1. `main.ts` — Titik Masuk Aplikasi

File ini dijalankan pertama kali. Di sini kita setup konfigurasi global yang berlaku untuk **seluruh aplikasi**:

```typescript
// Prefix → semua endpoint diawali /api
app.setGlobalPrefix('api');

// Validasi otomatis semua input berdasarkan DTO
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

// Tangkap semua error → format jadi response yang rapi
app.useGlobalFilters(new AllExceptionsFilter());

// Bungkus semua response → format standar
app.useGlobalInterceptors(new TransformInterceptor());

// Izinkan request dari frontend (localhost:5173)
app.enableCors({ origin: 'http://localhost:5173' });
```

---

### 2. `common/` — Kode Bersama

Berisi kode yang **tidak spesifik ke satu fitur**, tapi dipakai di banyak tempat.

#### `common/filters/http-exception.filter.ts`
Menangkap semua error dan mengubahnya jadi format JSON yang konsisten:
```json
// Contoh ketika ada error 404:
{
  "statusCode": 404,
  "timestamp": "2026-05-08T14:00:00.000Z",
  "path": "/api/students/999",
  "message": "Student not found"
}
```

#### `common/interceptors/transform.interceptor.ts`
Membungkus **semua response sukses** secara otomatis:
```json
// Semua response akan dibungkus seperti ini:
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }   ← ini yang sebenarnya dikembalikan controller
}
```

#### `common/dto/pagination.dto.ts`
DTO reusable untuk endpoint yang mengembalikan daftar data:
```typescript
// Bisa langsung dipakai di semua controller:
@Get()
findAll(@Query() pagination: PaginationDto) {
  // pagination.page  → halaman berapa (default: 1)
  // pagination.limit → berapa data per halaman (default: 10)
}
```

#### `common/enums/index.ts`
Tipe pilihan yang berlaku global:
```typescript
export enum Role {
  ADMIN = 'admin',
  LECTURER = 'lecturer',
  STUDENT = 'student',
}

export enum MotivationLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}
```

---

### 3. `config/` — Konfigurasi Environment

Semua nilai konfigurasi dibaca dari file `.env`. Dibagi jadi 3 file sesuai area:

| File | Variabel yang dibaca |
|------|---------------------|
| `app.config.ts` | `PORT`, `NODE_ENV`, `API_PREFIX`, `CORS_ORIGIN` |
| `database.config.ts` | `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` |
| `jwt.config.ts` | `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` |

**Cara mengakses config di service:**
```typescript
constructor(private configService: ConfigService) {}

const port = this.configService.get<number>('app.port');
const dbHost = this.configService.get<string>('database.host');
const secret = this.configService.get<string>('jwt.secret');
```

---

### 4. `modules/` — Fitur Utama

Ini adalah inti aplikasi. Setiap module mengikuti **struktur yang sama persis**:

```
modules/students/
├── students.module.ts       ← Mendaftarkan controller & service ke NestJS
├── students.controller.ts   ← Menerima HTTP request, menentukan endpoint
├── students.service.ts      ← Logika bisnis, berkomunikasi dengan database
├── dto/
│   ├── create-student.dto.ts  ← Validasi data saat POST (buat baru)
│   ├── update-student.dto.ts  ← Validasi data saat PUT (update)
│   └── index.ts               ← Export semua DTO
└── entities/
    └── student.entity.ts    ← Representasi tabel database
```

---

## 🔄 Flow Request — Cara Kerja Ketika Ada Request Masuk

```
Client/Frontend
     │
     │ HTTP Request: POST /api/students
     │ Body: { "nim": "123", "name": "Budi" }
     ▼
┌─────────────────────────────────────────┐
│              main.ts                    │
│  Global Prefix: /api sudah di-handle    │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│           ValidationPipe                │
│  Cek apakah body sesuai CreateStudentDto│
│  ❌ Jika tidak valid → tolak, kirim 400 │
│  ✅ Jika valid → lanjut                 │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         StudentsController              │
│  @Post() create(@Body() dto)            │
│  Menerima request, panggil service      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│          StudentsService                │
│  create(createStudentDto)               │
│  Logika bisnis: simpan ke database      │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│         Database (PostgreSQL)           │
│  INSERT INTO students (nim, name) ...   │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│        TransformInterceptor             │
│  Bungkus response jadi format standar   │
└────────────────┬────────────────────────┘
                 │
                 ▼
Client menerima:
{
  "statusCode": 201,
  "message": "Success",
  "data": { "id": "uuid", "nim": "123", "name": "Budi" }
}
```

---

## ✏️ Tutorial: Cara Membuat API Baru

Contoh: membuat endpoint **GET semua mahasiswa**.

### Langkah 1 — Buat DTO (Validasi Input)

File: `src/modules/students/dto/create-student.dto.ts`

```typescript
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()        // ← wajib diisi, tidak boleh kosong
  nim: string;         // ← field NIM

  @IsString()
  @IsNotEmpty()
  name: string;        // ← field nama

  @IsString()
  @IsOptional()        // ← boleh tidak diisi
  class?: string;      // ← field kelas (opsional)
}
```

### Langkah 2 — Buat/Update Service (Logika Bisnis)

File: `src/modules/students/students.service.ts`

```typescript
@Injectable()
export class StudentsService {
  // Nanti akan inject Repository dari TypeORM di sini
  // constructor(@InjectRepository(Student) private repo: Repository<Student>) {}

  async findAll(page = 1, limit = 10) {
    // Nanti: return this.repo.findAndCount({ skip: (page-1)*limit, take: limit });
    return { data: [], total: 0, page, limit };
  }

  async create(dto: CreateStudentDto) {
    // Nanti: const student = this.repo.create(dto);
    // return this.repo.save(student);
    return { message: 'Student created', data: dto };
  }
}
```

### Langkah 3 — Buat/Update Controller (Endpoint)

File: `src/modules/students/students.controller.ts`

```typescript
@Controller('students')   // ← prefix: /api/students
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // GET /api/students?page=1&limit=10
  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.studentsService.findAll(pagination.page, pagination.limit);
  }

  // POST /api/students
  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  // GET /api/students/:id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  // PUT /api/students/:id
  @Put(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  // DELETE /api/students/:id
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
```

### Langkah 4 — Daftarkan di Module

File: `src/modules/students/students.module.ts`

```typescript
@Module({
  controllers: [StudentsController],   // ← daftarkan controller
  providers: [StudentsService],        // ← daftarkan service
  exports: [StudentsService],          // ← ekspor agar bisa dipakai module lain
})
export class StudentsModule {}
```

### Langkah 5 — Import di AppModule

File: `src/app.module.ts`

```typescript
@Module({
  imports: [
    // ... module lain
    StudentsModule,   // ← sudah didaftarkan di sini ✅
  ],
})
export class AppModule {}
```

**Selesai!** Endpoint `GET /api/students` sudah bisa diakses.

---

## 📋 Daftar Semua Endpoint

### Auth
| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/register` | Registrasi user baru |

### Users
| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| GET | `/api/users` | Ambil semua user |
| GET | `/api/users/:id` | Ambil user by ID |
| POST | `/api/users` | Buat user baru |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Hapus user |

### Students
| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| GET | `/api/students` | Ambil semua mahasiswa |
| GET | `/api/students/:id` | Ambil mahasiswa by ID |
| POST | `/api/students` | Tambah mahasiswa baru |
| PUT | `/api/students/:id` | Update data mahasiswa |
| DELETE | `/api/students/:id` | Hapus mahasiswa |

### Lecturers
| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| GET | `/api/lecturers` | Ambil semua dosen |
| GET | `/api/lecturers/:id` | Ambil dosen by ID |
| POST | `/api/lecturers` | Tambah dosen baru |
| PUT | `/api/lecturers/:id` | Update data dosen |
| DELETE | `/api/lecturers/:id` | Hapus dosen |

### Recordings
| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| POST | `/api/recordings/upload` | Upload file rekaman |
| GET | `/api/recordings` | Ambil semua rekaman |
| GET | `/api/recordings/:id` | Ambil rekaman by ID |
| DELETE | `/api/recordings/:id` | Hapus rekaman |

### Motivation Analysis
| Method | Endpoint | Keterangan |
|--------|----------|-----------|
| POST | `/api/motivation-analysis` | Mulai analisis motivasi |
| GET | `/api/motivation-analysis` | Ambil semua hasil analisis |
| GET | `/api/motivation-analysis/:id` | Ambil analisis by ID |
| GET | `/api/motivation-analysis/student/:studentId` | Ambil analisis by mahasiswa |

---

## ⚙️ Variabel Environment (`.env`)

```env
# Aplikasi
PORT=3000                              # Port server
NODE_ENV=development                   # Mode: development / production
API_PREFIX=api                         # Prefix endpoint: /api
CORS_ORIGIN=http://localhost:5173      # URL frontend yang diizinkan

# Database PostgreSQL
DB_HOST=localhost                      # Host database
DB_PORT=5432                           # Port PostgreSQL
DB_USERNAME=postgres                   # Username database
DB_PASSWORD=postgres                   # Password database
DB_NAME=student_motivation_analyzer    # Nama database

# JWT (Token Autentikasi)
JWT_SECRET=your-super-secret-key       # Kunci rahasia token (GANTI ini!)
JWT_EXPIRES_IN=1d                      # Token expired dalam 1 hari
JWT_REFRESH_EXPIRES_IN=7d              # Refresh token expired dalam 7 hari
```

> **PENTING:** File `.env` tidak akan ter-upload ke GitHub (sudah ada di `.gitignore`).
> Gunakan `.env.example` sebagai template untuk anggota tim lain.

---

## 🛠️ Scripts yang Tersedia

```bash
npm run start:dev     # Jalankan dalam mode development (auto-reload)
npm run start:prod    # Jalankan dalam mode production
npm run build         # Build TypeScript ke JavaScript
npm run lint          # Cek & perbaiki kode style
npm run test          # Jalankan unit test
npm run test:e2e      # Jalankan end-to-end test
npm run test:cov      # Cek coverage test
```

---

## 📦 Dependencies Utama

| Package | Fungsi |
|---------|--------|
| `@nestjs/common` | Core NestJS (decorator, pipe, guard, dll) |
| `@nestjs/config` | Membaca file `.env` |
| `@nestjs/mapped-types` | Membuat `UpdateDto` dari `CreateDto` otomatis |
| `class-validator` | Validasi input (`@IsString`, `@IsEmail`, dll) |
| `class-transformer` | Transformasi tipe data di DTO |
| `rxjs` | Pemrograman reaktif (dibutuhkan NestJS) |

---

## 🗺️ Rencana Pengembangan Selanjutnya

- [ ] Setup database dengan **TypeORM** + **PostgreSQL**
- [ ] Definisikan **Entity** untuk setiap module
- [ ] Implementasi **JWT Authentication** (login/register)
- [ ] Integrasi **model AI** untuk analisis motivasi
- [ ] Tambah **Swagger** untuk dokumentasi API otomatis
- [ ] Setup **unit testing** untuk setiap service

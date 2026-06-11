# Local Service Server 🛠️

Local service marketplace backend — plumber, electrician, etc. booking platform.

## Tech Stack

React, Vite, Tailwind CSS, React Router, TanStack Query, Axios, Firebase, Framer Motion, Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, Nodemailer, bKash

---

## Setup

```bash
npm install
cp .env.example .env
# .env ফাইলে সব values দাও
npm run dev
```

---

## Environment Variables

`.env.example` ফাইলটা দেখো — সব কিছু বলা আছে।

---

## API Endpoints

### 🔐 Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/register` | Public | নতুন user register |
| POST | `/login` | Public | Email/password login |
| POST | `/firebase` | Public | Google/Firebase login |
| POST | `/logout` | Auth | Logout |
| POST | `/forgot-password` | Public | OTP email পাঠাবে |
| POST | `/verify-otp` | Public | OTP verify করো |
| POST | `/reset-password` | Public | নতুন password set করো |
| GET | `/profile` | Auth | নিজের profile দেখো |
| PATCH | `/profile` | Auth | Profile update করো |

---

### 🧑‍🔧 Providers — `/api/providers`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | সব approved providers |
| GET | `/:id` | Public | একটা provider দেখো |
| POST | `/apply` | Auth | Provider হিসেবে apply করো |
| GET | `/me/profile` | Provider | নিজের provider profile |
| PATCH | `/me/profile` | Provider | নিজের profile update |
| PATCH | `/me/availability` | Provider | Available/unavailable toggle |
| PATCH | `/:id/status` | Admin | Approve/reject provider |

**Apply body:**
```json
{
  "nid": "1234567890",
  "bio": "আমি ১০ বছরের অভিজ্ঞ প্লাম্বার",
  "category": "Plumber",
  "services": ["pipe fix", "leak repair", "installation"],
  "location": {
    "division": "Dhaka",
    "district": "Dhaka",
    "upazila": "Mirpur",
    "area": "Mirpur-10",
    "address": "Block D, Road 5"
  },
  "priceRange": { "min": 300, "max": 1500 }
}
```

---

### 🛠️ Services — `/api/services`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | সব services (filter: category, minPrice, maxPrice, search) |
| GET | `/:id` | Public | একটা service |
| POST | `/` | Admin | নতুন service তৈরি |
| PATCH | `/:id` | Admin | Service update |
| PATCH | `/:id/status` | Admin | Active/inactive toggle |
| DELETE | `/:id` | Admin | Service delete |

---

### 📅 Bookings — `/api/bookings`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Auth | নতুন booking |
| GET | `/my` | Auth | আমার bookings |
| GET | `/provider/:providerId` | Provider/Admin | Provider-এর bookings |
| GET | `/all` | Admin | সব bookings |
| GET | `/:id` | Auth | একটা booking |
| PATCH | `/:id/status` | Auth | Status update |

**Booking body:**
```json
{
  "serviceId": "...",
  "providerId": "...",
  "address": "House 5, Road 3, Mirpur-10",
  "scheduledDate": "2026-06-20T10:00:00.000Z",
  "notes": "সকাল ১০টার পর আসবেন",
  "paymentMethod": "bkash"
}
```

**Status values:** `pending → accepted → in_progress → completed | cancelled`

---

### 💳 Payments — `/api/payments`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/bkash/initiate` | Auth | bKash payment শুরু করো |
| POST | `/bkash/execute` | Auth | bKash payment complete করো |
| POST | `/cash/confirm` | Provider/Admin | Cash payment confirm করো |
| GET | `/booking/:bookingId` | Auth | Payment info দেখো |
| GET | `/all` | Admin | সব payments |

**bKash flow:**
1. `POST /bkash/initiate` → `bkashURL` পাবে
2. User সেই URL-এ যাবে, bKash app-এ pay করবে
3. Callback আসবে → `POST /bkash/execute` call করো

---

### ⭐ Reviews — `/api/reviews`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/` | Auth | Review দাও (completed booking-এ) |
| GET | `/provider/:providerId` | Public | Provider-এর reviews |
| GET | `/service/:serviceId` | Public | Service-এর reviews |

---

### 🗂️ Categories — `/api/categories`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | সব categories |
| POST | `/` | Admin | নতুন category |
| PATCH | `/:id` | Admin | Update |
| DELETE | `/:id` | Admin | Delete |

---

### 📍 Locations — `/api/locations`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/` | Public | সব locations |
| GET | `/districts` | Public | সব districts |
| GET | `/thanas?district=Dhaka` | Public | Thana/upazila list |
| POST | `/` | Admin | নতুন location add |
| DELETE | `/:id` | Admin | Delete |

---

### 👑 Admin — `/api/admin`
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/stats` | Admin | Dashboard stats |
| GET | `/users` | Admin | সব users |
| PATCH | `/users/:id/status` | Admin | User enable/disable |
| PATCH | `/users/:id/role` | Admin | Role change |

---

## Authentication

সব protected routes-এ Header-এ token পাঠাতে হবে:
```
Authorization: Bearer <your_jwt_token>
```

---

## Deploy on Railway

1. GitHub-এ push করো
2. railway.app-এ নতুন project তৈরি করো
3. Environment variables দাও
4. Deploy!

## Deploy on Vercel

`vercel.json` তৈরি করো:
```json
{
  "version": 2,
  "builds": [{ "src": "src/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/index.js" }]
}
```

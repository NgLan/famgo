# 🚀 ITSS1 Project - FAMGO

> **Môn học:** ITSS1 - Kỳ 2025.1  

## 📖 Giới thiệu
[...]

## 🛠 Công nghệ sử dụng
- **Frontend:** ReactJS
- **Backend:** Node.js, ExpressJS
- **Database:** MongoDB

---

## ⚙️ Yêu cầu cài đặt (Prerequisites)
Trước khi chạy dự án, hãy đảm bảo máy của bạn đã cài đặt:
- [Node.js](https://nodejs.org/) 
- [Git](https://git-scm.com/)
- Trình quản lý gói: `npm`

---

## 📥 Hướng dẫn cài đặt & Chạy dự án

Hãy làm theo các bước dưới đây để khởi chạy dự án tại local.

### 1. Clone dự án
```bash
git clone https://github.com/NgLan/famgo.git
cd famgo
```

### 2. Cấu hình Backend
Di chuyển vào thư mục backend, cài đặt thư viện và cấu hình biến môi trường.

```bash
cd backend
npm install
```

**Cấu hình Environment:**
- Tạo file `.env` tại thư mục gốc của `backend`.
- Copy nội dung từ file `.env.example` sang file `.env` vừa tạo.
- Cập nhật các thông số trong file `.env` cho phù hợp với máy của bạn.

### 3. Cấu hình Frontend
Mở một terminal mới (giữ nguyên terminal backend), di chuyển vào thư mục frontend và cài đặt thư viện.

```bash
cd frontend
npm install
```

---

## ▶️ Khởi chạy ứng dụng

Để chạy toàn bộ hệ thống, bạn cần bật cả Backend và Frontend trên 2 terminal riêng biệt.

**Terminal 1: Chạy Backend**
```bash
cd backend
npm start
```

**Terminal 2: Chạy Frontend**
```bash
cd frontend
npm run dev
```


# 🧹 Clean Connect – Smart City Waste Management System

**Clean Connect** is a role-based web platform designed to optimize waste management in smart cities. The system bridges the gap between citizens, workers, and administrators to ensure rapid issue reporting, efficient task resolution, and real-time cleanliness monitoring.

---

## 🚀 Features

### 👥 Multi-Role System

* **Zone Admin**: Manages dustbins and workers within a specific zone; monitors reports and worker performance.
* **Worker**: Receives alerts, accepts tasks, resolves assigned issues, and earns performance points.
* **User (Citizen)**: Reports dustbin issues and tracks resolution history/status.

### 🛠 Key Functionalities

* **Zone Management**: Localized dustbin tracking.
* **Issue Flow**: Reporting with status tracking (Pending → In Progress → Resolved).
* **Gamification**: Worker leaderboard and points system (10 points per task).
* **Dashboard**: Real-time statistics and activity logs.

---

## 🧰 Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | React.js (18), React Router DOM, Axios, React Toastify, Recharts |
| **Backend** | Node.js, Express.js, Multer (Image uploads) |
| **Database** | MySQL (mysql2) |

---

## 📋 Prerequisites

* **Node.js**: v14 or higher
* **MySQL**: v5.7 or higher
* **npm**: Included with Node.js

---

## ⚙️ Installation & Setup

### 1. Project Initialization

```bash
cd C:\xampp\htdocs\clean_connect
npm install

```

### 2. Backend Configuration

```bash
cd server
npm install

```

**Database Setup:**

1. Start MySQL (via XAMPP or standalone).
2. Import schema: `mysql -u root -p < database.sql` (or use phpMyAdmin).
3. Create a `.env` file in the `server` folder:
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=clean_connect
NODE_ENV=development

```



### 3. Frontend Configuration

```bash
cd ../client
npm install

```

---

## ▶️ Running the Application

| Method | Command |
| --- | --- |
| **Full Stack (Concurrent)** | `npm run dev` (from root) |
| **Backend Only** | `cd server && npm run dev` |
| **Frontend Only** | `cd client && npm start` |

* **Frontend URL**: `http://localhost:3000`
* **Backend API**: `http://localhost:5000/api`

---

## 🔑 Demo Credentials

| Role | Email | Password |
| --- | --- | --- |
| **Zone Admin** | `admin@northzone.com` | `admin123` |
| **Worker** | `ravi@worker.com` | `worker123` |
| **User** | `rahul@user.com` | `user123` |

---

## 🎨 Design System

### Status Color Guide

* 🟢 **Green**: Clean / Resolved
* 🟡 **Yellow**: Pending / In Progress
* 🔴 **Red**: Overflowing / Reopened
* 🔵 **Blue**: Maintenance

### Rewards System

* **Points**: +10 per resolution.
* **Badges**: Gold, Silver, and Bronze rankings on the leaderboard.

---

## 🔮 Future Enhancements

* 🛰 **IoT Integration**: Smart sensors for real-time fill-level detection.
* 📱 **Mobile App**: Native support for field workers.
* 📊 **Advanced Analytics**: AI-driven route optimization for waste collection.
* 🌙 **Dark Mode**: Enhanced UI accessibility.

---

## 📜 License

This project is created for educational purposes.

---

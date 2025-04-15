# CivicStack

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built with React](https://img.shields.io/badge/built%20with-React-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/backend-Express.js-green?logo=node.js)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/database-MongoDB-brightgreen?logo=mongodb)](https://mongodb.com)

---

CivicStack is a full-stack civic technology platform designed to help local governments streamline operations, improve internal communication, and better serve their communities. It is built with the City of Las Cruces, New Mexico in mind but can be adapted to any municipality.

---

## ✨ Features

- **Constituent Issue Tracker** – Public issue submission and internal tracking
- **Work Order System** – Maintenance and IT request management
- **Recruitment Workflow** – Job posting, applications, and admin tracking
- **Digital Forms** – Dynamic forms for leave, expenses, and timesheets
- **Internal Comms Hub** – Department-wide announcements and updates
- **Development Dashboard** – Tracking of major development/permitting projects
- **Audit Log System** – Transparent system action logging
- **Admin Dashboard** – Visual summaries and metrics

---

## 🛠 Tech Stack

- **Frontend:** React, Tailwind CSS, Axios, Toastify, Lenis
- **Backend:** Node.js, Express.js, MongoDB, JWT Auth
- **Tools:** Multer (uploads), Nodemailer (email), PDFKit (PDF generation)

---

## 🚀 Getting Started

### Prerequisites

- Node.js
- MongoDB
- pnpm or npm

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/austintylerallen/civicstack.git
   cd civicstack
   ```

2. Install dependencies:
   ```bash
   pnpm install # or npm install
   ```

3. Start the backend:
   ```bash
   pnpm dev # or npm run dev
   ```

4. Start the frontend:
   ```bash
   cd client
   pnpm dev # or npm run dev
   ```

---

## 🌐 Deployment

You can deploy using services like:

- **Render** (for Node backend)
- **Vercel** or **Netlify** (for React frontend)
- **MongoDB Atlas** (cloud-hosted MongoDB)

Update your environment variables accordingly in `.env` files.

---

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

## 🏛️ Purpose

CivicStack was born out of the need to modernize local government systems. It helps unify tools and improve transparency, accountability, and efficiency across departments like Public Works, IT, HR, Planning, and more.


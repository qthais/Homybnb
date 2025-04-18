# 🏡 Homybnb

Homybnb is a modern, scalable short-term rental platform inspired by Airbnb. It allows users to list properties, make reservations, and manage bookings with a seamless and secure experience. Built with a full microservices architecture, it utilizes modern technologies for performance, scalability, and maintainability.

---

## 🌐 Live Demo

- **Live Site**: [https://homybnb.onrender.com](https://homybnb.onrender.com)  
- **Demo Video**: [Watch Demo](https://drive.google.com/)

---

## 🧰 Tech Stack

[![My Skills](https://skillicons.dev/icons?i=nextjs,tailwind,nodejs,nestjs,postgres,mongodb,git,docker)](https://skillicons.dev)

- **Next.js** – Frontend framework for building SSR and hybrid apps
- **Tailwind CSS** – Utility-first CSS for fast and responsive UI
- **Node.js** – Runtime environment for the backend
- **NestJS** – Structured and scalable backend framework with TypeScript
- **PostgreSQL** – Relational database for structured data
- **MongoDB** – NoSQL database for flexible data modeling (e.g. listings)
- **gRPC** – High-performance communication between microservices
- **Microservices Architecture** – Isolated services for auth, listings, bookings, etc.
- **Docker & Docker Compose** – Containerized environment for consistent deployment

---

## 🔐 Authentication

Homybnb uses a hybrid authentication system combining **NextAuth.js** (on the Next.js frontend) with **NestJS JWT**-based backend logic. This allows for secure, stateless session management across services with flexible support for multiple login methods..

### Supported Methods
- 📧 Email & Password (Credentials)
- 🔐 Google OAuth
- 🐱 GitHub OAuth

---

## ✨ Features

- 🛏️ **Create Listings** – Host properties with full customization  
- 🖼️ **Image Upload** – Add photos to showcase your property  
- 🗂️ **Category Selection** – Classify listings (e.g. apartment, villa, cabin) for easier discovery  
- 📍 **Map Location Selection** – Pinpoint property location using interactive map  
- 🧩 **Property Preferences** – Add amenities, guest limits, rules, and more  
- 👁️ **View Listings** – Browse through available properties with detailed previews  
- ❤️ **View Favorite Properties** – Like and save listings to your favorites for easy access  
- 🔍 **Advanced Filtering** – Filter listings by location, category, date, price, and more  
- 📅 **Calendar Integration** – Visual calendar to manage availability and view booking slots  
- ⚠️ **Schedule Conflict Detection** – Automatically prevents double bookings  
- 📆 **Reservations System** – Book properties and manage personal reservations  
- 🧾 **Manage Bookings** – Hosts can view, accept, or reject reservations for their listings  
- ❌ **Delete Listings** – Remove owned properties from the platform  
- 🧑‍💼 **Host & Guest Roles** – Role-based features for property owners and guests  
- 📱 **Responsive UI** – Works beautifully across mobile, tablet, and desktop


---

## 🚀 Docker Setup

### ⚙️ Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 📦 Clone & Run

```bash
git clone https://github.com/qthais/Homybnb.git
docker-compose up --build -d

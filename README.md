# 🛒 Inventory Microservices App

This is a full-stack microservice-based Inventory Management System built using **Node.js**, **Express**, **Prisma**, **RabbitMQ**, and **PostgreSQL**. Each service is independent and communicates asynchronously via a message broker (RabbitMQ).

---

## 📦 Services

- **Auth Service**: Handles user authentication and JWT-based login/signup.
- **Product Service**: CRUD for products. Publishes messages on product creation.
- **Inventory Service**: Manages stock. Subscribes to product creation events.
- **Notification Service**: (Planned) Sends alerts and emails.
- **Job Service**: (Planned) Handles scheduled background jobs.
- **Gateway API**: Entry point routing to various services.

---

## 🚀 Tech Stack

| Category         | Tech                         |
| ---------------- | ---------------------------- |
| Backend          | Node.js, Express, TypeScript |
| Database         | PostgreSQL + Prisma ORM      |
| Messaging        | RabbitMQ                     |
| Containerization | Docker + Docker Compose      |
| Cloud Storage    | AWS S3 (for product images)  |
| Dev Tools        | Nodemon, ESLint, Prettier    |

---

## 🧾 Features

- 🧱 Microservice architecture
- 🐇 Asynchronous message communication via RabbitMQ
- 🛠 CRUD APIs for products and inventory
- ♻️ Upsert logic for inventory management
- 📤 Message consumers with clean separation
- 🚀 Scalable and containerized setup with Docker

---

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/inventory-microservices.git
cd inventory-microservices


📬 Contact
Made with ❤️ by [Karan Barman]
📧 karanbarman1704@gmail.com
🧰 Portfolio / GitHub coming soon...
```

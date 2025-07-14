# 📝 Notes App

A full-stack Notes & Bookmark Manager where users can save, organize, and search their personal notes with tags. Built using modern technologies like Next.js, Clerk Auth, NeonDB, and Drizzle ORM.

---

## 🚀 Features

- ✅ Create, update, and delete notes
- 🔍 Search notes with keywords or tags
- 🏷️ Tag support for easy filtering
- 🔐 Authentication with **Clerk**
- ⚡ Fast and type-safe backend using **Drizzle ORM** + **Neon Postgres**
- 🎨 Responsive UI with **TailwindCSS** and **shadcn/ui**
- 🌐 RESTful API with **Express.js**

---

## 🛠 Tech Stack

### Frontend
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com)
- [Clerk](https://clerk.com) (Authentication)

### Backend
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Neon PostgreSQL](https://neon.tech/) (Cloud-hosted DB)

---

## 📦 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Rajatbisht12/Notes-app.git
cd Notes-app

# For frontend
cd client
npm install

# For backend
cd ../server
npm install
```

client/.env.local:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

server/.env

```
DATABASE_URL=your_neon_db_url
CLERK_SECRET_KEY=your_clerk_secret
PORT=5000
```

📁 Project Structure
```bash
Copy
Edit
Notes-app/
├── client/              # Next.js frontend
│   ├── components/
│   ├── pages/
│   └── utils/
├── server/              # Express backend
│   ├── controllers/
│   ├── routes/
│   ├── db/
│   └── drizzle/         # Drizzle migrations
```

✨ Future Improvements
```
 Bookmark Manager (with metadata fetching)

 Markdown support

 Note sharing

 Cloud sync

 Progressive Web App (PWA)
```


🤝 Contributing
Contributions, issues, and feature requests are welcome!

Fork the repo

Create your branch: git checkout -b feature/yourFeature

Commit changes: git commit -m 'Add new feature'

Push to your branch: git push origin feature/yourFeature

Open a Pull Request

📄 License
This project is licensed under the MIT License — see the LICENSE file for details.


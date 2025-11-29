# Solo Leveling - Life RPG

> "I alone level up."

A gamified productivity application that turns your life into an RPG. Track your habits, complete quests, and level up your real-world stats. Built with the MERN stack and designed for a premium, immersive experience.

## 🚀 Project Overview

**Solo Leveling** is a web application designed to help users gamify their self-improvement journey. Inspired by the popular manhwa, it allows users to track their progress in various categories (Intelligence, Strength, etc.), manage daily tasks as "quests," and earn rewards to upgrade their avatar and abilities.

### 🛠 Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **State Management:** React Context API

## ✨ Features

### Current Features (MVP)

- **🛡️ Authentication System**: Secure Login and Signup functionality.
- **📊 Dashboard**: Overview of player stats, current level, and active quests.
- **📈 Status Screen**: Detailed breakdown of attributes (Strength, Agility, Intelligence, etc.) and player progression.
- **📜 Quest Log**: Management system for daily, weekly, and main quests.
- **🎒 Inventory & Shop**: System to manage items and purchase upgrades/rewards.
- **🆙 Leveling System**: XP calculation and level-up celebrations.
- **📉 Analytics**: Visual representation of productivity and stat growth over time.

### 🚧 Status

**Current Status:** Active Development / MVP Phase

- Core game loop (Quest -> XP -> Level Up) is implemented.
- UI/UX is being polished for a "System" aesthetic.
- Backend API is functional for core features.

## 🔮 Future Roadmap

- [ ] **Dungeons & Raids**: Boss battles for completing major milestones.
- [ ] **Social Features**: Guilds, party systems, and leaderboards.
- [ ] **Mobile App**: Native mobile experience for on-the-go tracking.
- [ ] **Class System**: Job changes and specialized skill trees.
- [ ] **Achievements**: Badges and titles for specific accomplishments.

## 📦 Installation & Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   ```

2. **Install Dependencies**

   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../
   npm install
   ```

3. **Environment Setup**

   - Create a `.env` file in the `server` directory with:
     ```
     PORT=5000
     MONGO_URI=your_mongodb_uri
     JWT_SECRET=your_jwt_secret
     ```

4. **Run the Application**

   ```bash
   # Start the backend
   cd server
   npm run dev

   # Start the frontend (in a new terminal)
   cd ../
   npm run dev
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

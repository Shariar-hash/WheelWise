# 🌀 WheelWise – The Smart and Fair Decision Wheel

![WheelWise Banner](https://img.shields.io/badge/WheelWise-Smart%20%26%20Fair-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

An interactive, fairness-driven spin-wheel platform designed for fun, games, raffles, and challenges. Built with **provably fair algorithms**, **multiplayer engagement**, and **customizable designs**.

---

## 🎯 Features

### 🔒 Fairness and Trust
- **Provably-Fair Algorithm**: Commit-reveal scheme with server + client seeds
- **Transparency Dashboard**: View past spins and win probabilities
- **Spin Ledger**: Public audit trail with hash verification
- **Verifiable Results**: Every spin can be independently verified

### 👥 Multiplayer & Social
- **Live Spin Rooms**: Real-time collaboration with friends
- **Spectator Mode**: Perfect for streamers and party hosts
- **Live Chat**: Engage with participants during spins
- **Collaborative Wheels**: Co-create and edit wheels together

### 🎨 Customization
- **Custom Themes**: Background colors, fonts, and styles
- **Logo Upload**: Add your own branding to wheel slices
- **Sound Effects**: Custom spin and win sounds
- **Celebration Animations**: Confetti and visual effects
- **Dark/Light Mode**: Adaptive theming

### 🎮 Game Modes
1. **Classic Spin**: Single winner selection
2. **Elimination Mode**: Remove entries one by one
3. **Weighted Spins**: Adjustable probabilities per option

### 💬 Sharing & Results
- **Result Cards**: Auto-generated shareable images
- **Public Results Page**: Unique verification link per spin
- **Leaderboard**: Global rankings and statistics
- **Social Sharing**: Direct share to social platforms

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: NeonDB (PostgreSQL) with Prisma ORM
- **Authentication**: NextAuth.js
- **Real-time**: Pusher (WebSocket alternative)
- **Fairness**: Custom Provably Fair Algorithm (SHA-256)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- NeonDB account (free tier available at [neon.tech](https://neon.tech))
- Pusher account (optional, for real-time features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wheelwise.git
   cd wheelwise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database (NeonDB)
   DATABASE_URL="postgresql://username:password@your-neon-host.neon.tech/wheelwise?sslmode=require"
   DIRECT_URL="postgresql://username:password@your-neon-host.neon.tech/wheelwise"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
   
   # Pusher (optional)
   NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-key"
   PUSHER_APP_ID="your-pusher-app-id"
   PUSHER_SECRET="your-pusher-secret"
   NEXT_PUBLIC_PUSHER_CLUSTER="mt1"
   
   # OAuth (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📊 Database Schema

The project uses Prisma with NeonDB (PostgreSQL). Key models:

- **User**: Authentication and token management
- **Wheel**: Wheel configurations and metadata
- **WheelOption**: Individual wheel slices with weights
- **Spin**: Provably fair spin records
- **Room**: Live multiplayer rooms
- **Message**: Real-time chat messages
- **TokenTransaction**: Virtual currency ledger

View full schema: [`prisma/schema.prisma`](prisma/schema.prisma)

---

## 🔐 Provably Fair Algorithm

WheelWise uses a **commit-reveal cryptographic scheme**:

1. **Server Seed**: Generated server-side (kept secret until after spin)
2. **Client Seed**: User-provided or random client seed
3. **Nonce**: Incremental counter for each spin
4. **Hash**: SHA-256(serverSeed:clientSeed:nonce)
5. **Result**: Hash converted to 0-1 value, mapped to wheel options

### Verification

Every spin can be verified by:
```typescript
const hash = SHA256(`${serverSeed}:${clientSeed}:${nonce}`)
const result = parseInt(hash.substring(0, 8), 16) / 0xffffffff
```

Users can verify their spins at `/verify/[spinId]`

---

## 📁 Project Structure

```
wheelwise/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── wheels/          # Wheel CRUD
│   │   ├── spins/           # Spin creation & history
│   │   └── rooms/           # Multiplayer rooms
│   ├── wheel/               # Wheel pages
│   ├── dashboard/           # User dashboard
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── wheel/              # Wheel-related components
│   ├── layout/             # Layout components
│   └── providers/          # Context providers
├── lib/                     # Utilities
│   ├── prisma.ts           # Prisma client
│   ├── provably-fair.ts    # Fairness algorithm
│   ├── auth.ts             # NextAuth config
│   └── utils.ts            # Helper functions
├── prisma/                  # Database
│   └── schema.prisma       # Prisma schema
├── public/                  # Static assets
└── package.json            # Dependencies
```

---

## 🎮 Usage Examples

### Create a Wheel

```typescript
const wheel = await fetch('/api/wheels', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Lunch Decision',
    options: [
      { label: 'Pizza', color: '#ff6b6b', weight: 1 },
      { label: 'Sushi', color: '#4ecdc4', weight: 1 },
      { label: 'Burger', color: '#45b7d1', weight: 1 },
    ],
    gameMode: 'CLASSIC',
    isPublic: true,
  }),
})
```

### Spin the Wheel

```typescript
const spin = await fetch('/api/spins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wheelId: 'wheel-id',
    clientSeed: 'user-random-string',
    betAmount: 100, // optional
  }),
})
```

---

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project to [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### NeonDB Setup

1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string to `.env`
4. Run `npx prisma db push`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [NeonDB](https://neon.tech) - Serverless PostgreSQL
- [Prisma](https://www.prisma.io/) - Database ORM
- [NextAuth.js](https://next-auth.js.org/) - Authentication
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/wheelwise/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/wheelwise/wiki)
- **Discord**: [Join our community](https://discord.gg/wheelwise)

---

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Video recording of spins
- [ ] NFT integration for unique wheels
- [ ] Tournament brackets mode
- [ ] Advanced analytics dashboard
- [ ] API for third-party integrations
- [ ] Twitch/YouTube streaming integration

---

**Made with ❤️ by the WheelWise Team**

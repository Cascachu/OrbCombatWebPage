# OrbCombat

A web-based game download and community platform built with Next.js and NestJS.

## Features

- Game download page with screenshots and platform-specific downloads
- Community forum with real-time chat powered by WebSockets
- User authentication with JWT
- Avatar selection for forum users

## Tech Stack

**Frontend:** Next.js, TypeScript, SCSS, Socket.io Client  
**Backend:** NestJS, TypeScript, Socket.io, TypeORM, PostgreSQL, JWT

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL

### Setup

1. Clone the repo
```bash
git clone https://github.com/yourusername/orbcombat.git
cd orbcombat
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp backend/.env.example backend/.env
# Fill in your database and JWT credentials
```

4. Run the development server
```bash
npm run dev
```

Frontend runs on `http://localhost:3000`  
Backend runs on `http://localhost:4000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `DB_USER` | PostgreSQL username |
| `DB_PASS` | PostgreSQL password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret key for signing JWT tokens |

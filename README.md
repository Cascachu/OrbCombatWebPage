# OrbCombat

A web-based game download and community platform built with Next.js and NestJS.

## Features

- Game download page with screenshots and the game's download link
- Community forum with real-time chat powered by WebSockets
- User authentication with JWT
- Avatar selection for forum users

## Tech Stack

**Frontend:** Next.js, TypeScript, SCSS, Socket.io Client  
**Backend:** NestJS, TypeScript, Socket.io, TypeORM, PostgreSQL, JWT

## Running with Docker (recommended)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)
2. Clone the repo
```bash
git clone https://github.com/yourusername/orbcombat.git
cd orbcombat
```
3. Copy `.env.example` to `.env` and fill in your values
```bash
cp .env.example .env
```
4. Run everything
```bash
docker-compose up --build
```

Frontend runs on `http://localhost:3000`  
Backend runs on `http://localhost:4000`

## Running without Docker

### Prerequisites
- Node.js 20+
- PostgreSQL

### Setup

1. Clone the repo and install dependencies
```bash
git clone https://github.com/yourusername/orbcombat.git
cd orbcombat
npm install
```

2. Copy `.env.example` to `.env` and fill in your values
```bash
cp .env.example .env
```

3. Create the PostgreSQL database
```sql
CREATE DATABASE orbcombat;
```

4. Run the development server
```bash
npm run dev
```

## Peer to Peer

To access the site from other devices on the same network:

1. Find your local IP — run `ipconfig` on Windows or `ifconfig` on Mac/Linux
2. Set `NEXT_PUBLIC_API_URL=http://192.168.1.x:4000` in `.env`
3. Allow ports through firewall (Windows, run PowerShell as admin)
```powershell
New-NetFirewallRule -DisplayName "OrbCombat Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "OrbCombat Backend" -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow
```
4. Other devices can access the site at `http://192.168.1.x:3000`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DB_USER` | PostgreSQL username |
| `DB_PASS` | PostgreSQL password |
| `DB_NAME` | Database name |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `NEXT_PUBLIC_API_URL` | Backend URL (default: `http://localhost:4000`) |
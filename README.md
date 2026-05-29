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
git clone https://github.com/Cascachu/OrbCombatWebPage.git
cd OrbCombatWebPage
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
git clone https://github.com/Cascachu/OrbCombatWebPage.git
cd OrbCombatWebPage
npm install
```

2. Copy `.env.example` to `backend/.env` and fill in your values
```bash
cp .env.example backend/.env
```

3. Create the PostgreSQL database
```sql
CREATE DATABASE orbcombat;
```

4. Run the development server
```bash
npm run dev
```

Everything else is fine.

## Peer to Peer

To access the site from other devices on the same network:

1. Find your local IP — run `ipconfig` on Windows or `ifconfig` on Mac/Linux
2. Set `NEXT_PUBLIC_API_URL=http://[your ip here]:4000` in `.env`
3. Allow ports through firewall (Windows, run PowerShell as admin)
```powershell
New-NetFirewallRule -DisplayName "OrbCombat Frontend" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "OrbCombat Backend" -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow
```
4. Other devices can access the site at `http://[your ip]:3000`

## Environment Variables

| Variable | Example | Description |
|----------|---------|-------------|
| `DB_USER` | `postgres` | PostgreSQL username |
| `DB_PASS` | `mypassword` | PostgreSQL password |
| `DB_NAME` | `orbcombat` | Database name |
| `JWT_SECRET` | `my_super_secret_key` | Secret key for signing JWT tokens |
| `NEXT_PUBLIC_API_URL` | `http://localhost:4000` | Backend URL, change to your IP for peer to peer |

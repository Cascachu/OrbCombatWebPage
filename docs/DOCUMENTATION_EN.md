# OrbCombat — Project Documentation

A web application that allows users to download the game and communicate through a forum and real-time chat, built with Next.js and NestJS.

---

## 1. Application Description

OrbCombat is a web application consisting of two main parts: a game download page and a community forum with real-time chat.

### 1.1 Main Page

The OrbCombat game download page includes:

- Game description and feature list
- Screenshots section
- Game download links
- Animated background with bouncing spheres built using the Canvas API

### 1.2 Community Forum

A real-time chat allowing users to communicate. Main features:

- User registration and login using JWT
- Avatar selection during registration
- Real-time chat using WebSockets
- Online users list
- System messages when users join or leave
- Responsive design for desktop and mobile with swipe gesture support

### 1.3 Tech Stack

**Frontend:**
- Next.js 16 with TypeScript
- SCSS for styling (responsive desktop and mobile design)
- Socket.io Client for WebSocket communication
- Jest + React Testing Library for unit tests

**Backend:**
- NestJS with TypeScript
- PostgreSQL as the relational database
- TypeORM for object-relational mapping
- JWT for user authorization
- Socket.io for real-time WebSocket communication
- Jest + ts-jest for unit tests

**Infrastructure:**
- Docker + Docker Compose for containerization
- Monorepo with npm workspaces (frontend + backend in one repository)

---

## 2. Work Division

The project was completed independently by one person. The scope of work included:

| Area | Scope |
|------|-------|
| Frontend | Next.js page implementation, SCSS styling, Canvas animation, mobile responsiveness |
| Backend | NestJS implementation, REST API endpoints, WebSocket Gateway, JWT authorization |
| Database | PostgreSQL database schema design, TypeORM configuration |
| Authorization | Registration and login system, bcrypt password hashing, JWT tokens |
| WebSocket | Real-time chat, connection management, online users list |
| Docker | Docker Compose configuration, Dockerfiles for frontend and backend, database healthcheck |
| Tests | Backend unit tests (Jest) and frontend unit tests (React Testing Library) |
| Documentation | Project documentation, README, database diagrams |

---

## 3. Database

The application uses a PostgreSQL relational database. Database access is handled through TypeORM with the synchronize option enabled in development mode.

### 3.1 Database Diagram

```
┌─────────────────────────────────────────────────────┐
│                        user                         │
├──────────────┬─────────────┬───────────────────────-┤
│ id           │ INTEGER     │ PRIMARY KEY             │
│ username     │ VARCHAR     │ UNIQUE, NOT NULL        │
│ email        │ VARCHAR     │ UNIQUE, NOT NULL        │
│ password     │ VARCHAR     │ NOT NULL                │
│ avatar       │ VARCHAR     │ NOT NULL                │
│ createdAt    │ TIMESTAMP   │ NOT NULL                │
└──────────────┴─────────────┴────────────────────────┘
```

### 3.2 Table Description

The `user` table stores registered user data. Passwords are hashed using bcrypt with salt rounds = 10 before being saved to the database, ensuring that even in case of a database breach, passwords remain secure. The `avatar` field stores the filename of the selected avatar, which is served as a static file by Next.js from the `public/avatars/` folder.

### 3.3 Authorization

After login or registration, the server returns a JWT token containing the user's id and username. The token is stored in the browser's localStorage and attached to HTTP headers for every request requiring authorization. Tokens expire after 7 days.

---

## 4. Tests

The application has unit tests for both the backend and frontend. Tests are run using Jest.

### 4.1 Backend Tests

Backend unit tests were written using Jest and `@nestjs/testing`. Two services are tested: `AuthService` and `UsersService`. Dependencies are mocked using `jest.fn()`.

#### AuthService

| Test | Description | Result |
|------|-------------|--------|
| register — successful registration | Checks that a new user is registered and a JWT token is returned | ✅ PASS |
| register — email already exists | Checks that ConflictException is thrown when email is taken | ✅ PASS |
| register — username already exists | Checks that ConflictException is thrown when username is taken | ✅ PASS |
| register — password hashing | Checks that the password is hashed before saving to the database | ✅ PASS |
| login — valid credentials | Checks that a JWT token is returned with valid login credentials | ✅ PASS |
| login — wrong email | Checks that UnauthorizedException is thrown when email does not exist | ✅ PASS |
| login — wrong password | Checks that UnauthorizedException is thrown when password is incorrect | ✅ PASS |

#### UsersService

| Test | Description | Result |
|------|-------------|--------|
| findByEmail — found | Checks that a user is returned when email exists in the database | ✅ PASS |
| findByEmail — not found | Checks that null is returned when email does not exist | ✅ PASS |
| findByUsername — found | Checks that a user is returned when username exists in the database | ✅ PASS |
| findByUsername — not found | Checks that null is returned when username does not exist | ✅ PASS |
| create — user creation | Checks that a user is correctly created and saved to the database | ✅ PASS |

**Result: 12/12 tests passed**

### 4.2 Frontend Tests

Frontend unit tests were written using Jest and React Testing Library. The Forum and BackgroundSpheres components are tested.

#### Forum (forum.spec.tsx)

| Test | Description | Result |
|------|-------------|--------|
| renders login form when not logged in | Checks that the login form renders correctly | ✅ PASS |
| switches to register tab when clicked | Checks that switching to the register tab works correctly | ✅ PASS |
| shows email and password fields on login tab | Checks that email and password fields are visible on the login tab | ✅ PASS |
| shows avatar picker on register tab | Checks that the avatar picker appears on the register tab | ✅ PASS |
| renders all avatars in the picker | Checks that all avatars are displayed in the picker | ✅ PASS |
| selecting an avatar marks it as selected | Checks that selecting an avatar marks it as selected | ✅ PASS |
| shows error message on failed login | Checks that an error message appears on failed login | ✅ PASS |

#### BackgroundSpheres (BackgroundSpheres.spec.tsx)

| Test | Description | Result |
|------|-------------|--------|
| renders a canvas element | Checks that the canvas element is rendered | ✅ PASS |
| canvas has correct styles for background positioning | Checks that the canvas has correct positioning styles | ✅ PASS |

**Result: 9/9 tests passed**

**Total: 21/21 tests passed**

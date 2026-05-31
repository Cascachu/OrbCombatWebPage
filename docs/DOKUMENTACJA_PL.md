# OrbCombat — Dokumentacja Projektu

Aplikacja webowa umożliwiająca pobranie gry oraz komunikację użytkowników za pośrednictwem forum i czatu w czasie rzeczywistym, zbudowana przy użyciu Next.js i NestJS.

---

## 1. Opis Aplikacji

OrbCombat to aplikacja webowa składająca się z dwóch głównych części: strony pobierania gry oraz forum społecznościowego z czatem w czasie rzeczywistym.

### 1.1 Strona Główna

Strona pobierania gry OrbCombat zawiera:

- Opis gry i jej funkcji
- Sekcję ze zrzutami ekranu
- Linki do pobrania gry
- Animowane tło z odbijającymi się sferami wykonane przy użyciu Canvas API

### 1.2 Forum Społecznościowe

Czat w czasie rzeczywistym umożliwiający użytkownikom komunikację. Główne funkcje:

- Rejestracja i logowanie użytkowników z wykorzystaniem JWT
- Wybór awatara podczas rejestracji
- Czat w czasie rzeczywistym z wykorzystaniem WebSocketów
- Lista aktywnych użytkowników online
- Komunikaty systemowe o dołączeniu i wyjściu użytkowników
- Responsywny design dla desktop i mobile z obsługą gestów dotykowych

### 1.3 Stos Technologiczny

**Frontend:**
- Next.js 16 z TypeScript
- SCSS do stylowania (responsywny design desktop i mobile)
- Socket.io Client do komunikacji WebSocket
- Jest + React Testing Library do testów jednostkowych

**Backend:**
- NestJS z TypeScript
- PostgreSQL jako relacyjna baza danych
- TypeORM do mapowania obiektowo-relacyjnego
- JWT do autoryzacji użytkowników
- Socket.io do komunikacji WebSocket w czasie rzeczywistym
- Jest + ts-jest do testów jednostkowych

**Infrastruktura:**
- Docker + Docker Compose do konteneryzacji
- Monorepo z npm workspaces (frontend + backend w jednym repozytorium)

---

## 2. Podział Pracy

Projekt został wykonany samodzielnie przez jedną osobę. Zakres prac obejmował:

| Obszar | Zakres prac |
|--------|-------------|
| Frontend | Implementacja stron Next.js, stylowanie SCSS, animacja Canvas, responsywność mobile |
| Backend | Implementacja NestJS, endpointy REST API, WebSocket Gateway, autoryzacja JWT |
| Baza danych | Projekt schematu bazy danych PostgreSQL, konfiguracja TypeORM |
| Autoryzacja | System rejestracji i logowania, hashowanie haseł bcrypt, tokeny JWT |
| WebSocket | Czat w czasie rzeczywistym, zarządzanie połączeniami, lista użytkowników online |
| Docker | Konfiguracja Docker Compose, Dockerfile dla frontendu i backendu, healthcheck bazy danych |
| Testy | Testy jednostkowe backendu (Jest) i frontendu (React Testing Library) |
| Dokumentacja | Dokumentacja projektu, README, diagramy bazy danych |

---

## 3. Baza Danych

Aplikacja korzysta z relacyjnej bazy danych PostgreSQL. Dostęp do bazy odbywa się przez TypeORM z włączoną opcją synchronize w trybie deweloperskim.

### 3.1 Diagram Bazy Danych

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

### 3.2 Opis Tabeli

Tabela `user` przechowuje dane zarejestrowanych użytkowników. Hasła są hashowane przy użyciu bcrypt z salt rounds = 10 przed zapisaniem do bazy. Pole `avatar` przechowuje nazwę pliku wybranego awatara, który jest serwowany jako plik statyczny przez Next.js z folderu `public/avatars/`.

### 3.3 Autoryzacja

Po zalogowaniu lub rejestracji serwer zwraca token JWT zawierający id użytkownika oraz jego nazwę. Token jest przechowywany w localStorage przeglądarki i dołączany do nagłówków HTTP przy każdym zapytaniu wymagającym autoryzacji. Tokeny wygasają po 7 dniach.

---

## 4. Testy

Aplikacja posiada testy jednostkowe zarówno dla backendu jak i frontendu. Testy uruchamiane są przy użyciu Jest.

### 4.1 Testy Backendu

Testy jednostkowe backendu zostały napisane przy użyciu Jest oraz `@nestjs/testing`. Testowane są dwa serwisy: `AuthService` oraz `UsersService`. Zależności są mockowane przy użyciu `jest.fn()`.

#### AuthService

| Test | Opis | Wynik |
|------|------|-------|
| register — poprawna rejestracja | Sprawdza czy nowy użytkownik zostaje zarejestrowany i zwracany jest token JWT | ✅ PASS |
| register — email już istnieje | Sprawdza czy rzucany jest ConflictException gdy email jest zajęty | ✅ PASS |
| register — username już istnieje | Sprawdza czy rzucany jest ConflictException gdy nazwa użytkownika jest zajęta | ✅ PASS |
| register — hashowanie hasła | Sprawdza czy hasło jest hashowane przed zapisaniem do bazy | ✅ PASS |
| login — poprawne dane | Sprawdza czy zwracany jest token JWT przy poprawnych danych logowania | ✅ PASS |
| login — błędny email | Sprawdza czy rzucany jest UnauthorizedException gdy email nie istnieje | ✅ PASS |
| login — błędne hasło | Sprawdza czy rzucany jest UnauthorizedException gdy hasło jest niepoprawne | ✅ PASS |

#### UsersService

| Test | Opis | Wynik |
|------|------|-------|
| findByEmail — znaleziony | Sprawdza czy zwracany jest użytkownik gdy email istnieje w bazie | ✅ PASS |
| findByEmail — nie znaleziony | Sprawdza czy zwracane jest null gdy email nie istnieje | ✅ PASS |
| findByUsername — znaleziony | Sprawdza czy zwracany jest użytkownik gdy username istnieje w bazie | ✅ PASS |
| findByUsername — nie znaleziony | Sprawdza czy zwracane jest null gdy username nie istnieje | ✅ PASS |
| create — tworzenie użytkownika | Sprawdza czy użytkownik jest poprawnie tworzony i zapisywany do bazy | ✅ PASS |

**Wynik: 12/12 testów zaliczonych**

### 4.2 Testy Frontendu

Testy jednostkowe frontendu zostały napisane przy użyciu Jest oraz React Testing Library. Testowane są komponenty Forum oraz BackgroundSpheres.

#### Forum (forum.spec.tsx)

| Test | Opis | Wynik |
|------|------|-------|
| renders login form when not logged in | Sprawdza czy formularz logowania renderuje się poprawnie | ✅ PASS |
| switches to register tab when clicked | Sprawdza czy przełączenie na zakładkę rejestracji działa poprawnie | ✅ PASS |
| shows email and password fields on login tab | Sprawdza czy pola email i hasło są widoczne na zakładce logowania | ✅ PASS |
| shows avatar picker on register tab | Sprawdza czy selektor awatara pojawia się na zakładce rejestracji | ✅ PASS |
| renders all avatars in the picker | Sprawdza czy wszystkie awatary są wyświetlane w selektorze | ✅ PASS |
| selecting an avatar marks it as selected | Sprawdza czy wybranie awatara oznacza go jako wybrany | ✅ PASS |
| shows error message on failed login | Sprawdza czy komunikat błędu pojawia się przy niepoprawnym logowaniu | ✅ PASS |

#### BackgroundSpheres (BackgroundSpheres.spec.tsx)

| Test | Opis | Wynik |
|------|------|-------|
| renders a canvas element | Sprawdza czy element canvas jest renderowany | ✅ PASS |
| canvas has correct styles for background positioning | Sprawdza czy canvas ma poprawne style pozycjonowania | ✅ PASS |

**Wynik: 9/9 testów zaliczonych**

**Łączny wynik: 21/21 testów zaliczonych**

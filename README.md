# Employee Management System

Full-stack CRUD application: **Spring Boot + MySQL** backend, **HTML/CSS/JavaScript** frontend, admin login.

```
employee-management-system/
├── backend/            Spring Boot REST API (Java 17, Maven, Dockerfile)
├── frontend/           Static site (index.html = login, dashboard.html)
├── docker-compose.yml  Local backend + MySQL
└── README.md
```

## Admin login (default)
- Username: `akshitha`
- Password: `123456789`

For public deployment, set `ADMIN_USERNAME` / `ADMIN_PASSWORD` environment variables on the backend to override the defaults.

## Run locally

**Option A – Docker**
```bash
docker compose up --build        # API on http://localhost:8080
```
Then open `frontend/index.html` with VS Code Live Server (or `cd frontend && python -m http.server 5500`).

**Option B – without Docker**
1. Install Java 17, Maven and MySQL. Edit DB user/password if not `root`/`root` (env vars `DB_USERNAME`, `DB_PASSWORD`).
2. `cd backend && mvn spring-boot:run`  (database `ems_db` is created automatically)
3. Serve the `frontend` folder as above.

## REST API (all need admin Basic auth)
| Method | URL | Purpose |
|---|---|---|
| GET | /api/auth/login | verify admin credentials |
| GET | /api/employees?q=text | list / search |
| GET | /api/employees/{id} | get one |
| POST | /api/employees | create |
| PUT | /api/employees/{id} | update |
| DELETE | /api/employees/{id} | delete |

## Deploy publicly

### 1. Push to GitHub
```bash
cd employee-management-system
git init && git add . && git commit -m "Employee Management System"
git branch -M main
git remote add origin https://github.com/<you>/employee-management-system.git
git push -u origin main
```

### 2. MySQL database (free options: Aiven, Railway, TiDB Cloud, Clever Cloud)
Create a MySQL instance and note host, port, database, user, password. Your JDBC URL looks like:
`jdbc:mysql://HOST:PORT/DBNAME?useSSL=true&serverTimezone=UTC`
(Aiven requires SSL: use `sslMode=REQUIRED` instead of `useSSL=true`.)

### 3. Backend on Render (or Railway)
- New → **Web Service** → connect your GitHub repo
- **Root Directory:** `backend`, **Runtime:** Docker
- Environment variables:

| Name | Value |
|---|---|
| DB_URL | your JDBC URL |
| DB_USERNAME | database user |
| DB_PASSWORD | database password |
| ADMIN_USERNAME | akshitha (or your choice) |
| ADMIN_PASSWORD | a strong password |
| CORS_ALLOWED_ORIGINS | your frontend URL (add after step 4), e.g. `https://ems.netlify.app` |

Render sets `PORT` automatically. After deploy, open the backend URL: you should see `{"status":"UP"...}`.

### 4. Frontend on Netlify / Vercel / GitHub Pages
1. Edit `frontend/js/config.js` → set `API_BASE_URL` to your backend URL (e.g. `https://ems-backend.onrender.com`), commit and push.
2. Netlify: New site from Git → **Base/Publish directory:** `frontend` (no build command).
   Vercel: set Root Directory `frontend`, framework "Other".
3. Copy the frontend URL into the backend's `CORS_ALLOWED_ORIGINS`, then redeploy the backend.

## Notes
- Free Render services sleep when idle; the first request can take ~50 seconds.
- Serve everything over HTTPS (Render/Netlify do this) because the login sends Basic auth credentials.
- Tables are created automatically (`spring.jpa.hibernate.ddl-auto=update`).

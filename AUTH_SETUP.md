# Admin authentication setup

This change adds admin login/logout and protects every existing calendar API route.
It does not implement visitor demo mode yet. Existing calendar data is preserved.
There is no registration endpoint. AdminUsers stores bcrypt password hashes;
express-mysql-session stores sessions in the same Aiven database. Sessions expire
after eight hours, persist across backend restarts and are destroyed on logout.
Login has a per-IP limit of ten attempts per fifteen minutes per server instance.
Mutating requests require the configured frontend Origin and a custom header.

## 1. Create your first admin locally

Pull this branch, run `npm ci` in Backend, and add these to your ignored Backend/.env:

```
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=<random value of at least 32 characters>
ADMIN_EMAIL=<your email>
ADMIN_PASSWORD=<unique password, at least 12 characters, at most 72 UTF-8 bytes>
```

Keep your existing working DB_* variables and CA certificate. Generate a session
secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
Do not commit the result. From Backend, run `npm run create-admin`. It creates the
AdminUsers table and inserts the account; running it for an existing email fails
instead of silently replacing the password. Remove ADMIN_PASSWORD and ADMIN_EMAIL
from .env immediately afterwards. Do not put them in Render or frontend variables.
This script connects to Aiven, so the account is ready for the hosted backend too.
The session table is created automatically on first backend start.

## 2. Test locally

Backend: `npm run dev`. Frontend: `npm ci`, then `npm run dev`.
Frontend/.env should retain `VITE_API_URL=http://localhost:8081`.
FRONTEND_URL must equal the actual Vite origin (including its port).
Use localhost consistently, not a mixture of localhost and 127.0.0.1.

Verify wrong passwords fail, correct credentials load the calendar, refreshing
keeps you logged in, logout blocks access, and direct /getStudents or /ScheduleData
requests without a session return 401. Try adding and removing disposable records.
Run `npm test` in Backend and `npm run build` in Frontend.

## 3. Recommended Render deployment: one origin

Separate onrender.com sites can encounter browser third-party-cookie restrictions.
The backend can now serve the built React app as well, avoiding that issue without
weakening cookie security. Keep your existing API service and change its settings:

| Setting | Value |
| --- | --- |
| Root Directory | Empty (repository root) |
| Build Command | `npm ci --prefix Backend && npm ci --prefix Frontend && npm run build --prefix Frontend` |
| Start Command | `npm start --prefix Backend` |
| Health Check Path | `/health` |

Set these backend service environment variables in addition to the existing DB_*:

```
NODE_ENV=production
SESSION_SECRET=<a new random secret, at least 32 characters>
FRONTEND_URL=https://<your-existing-backend>.onrender.com
```

Remove VITE_API_URL from THIS backend service's environment (or set it empty), so
the bundled React app calls the same origin. If Render previously used a secret
CA file, preserve DB_CA_PATH pointing to its absolute path. The committed
Backend/certs/ca.pem continues to work without DB_CA_PATH.

After deployment, open the BACKEND URL: it now serves the login page and app.
Use this as your canonical website URL. The old static-site URL is no longer the
entry point; optionally redirect it to this URL. Do not leave an old static build
as your advertised entry point. Keep the same SESSION_SECRET on future deploys;
rotating it logs everyone out. No manual PORT variable is needed.

## Alternative: keep separate frontend/backend services

Set FRONTEND_URL to the exact static site's origin and VITE_API_URL to the API URL
on the static service. All requests include credentials; production cookies use
Secure, HttpOnly and SameSite=None, without a Domain attribute. Some browsers
block these cross-site cookies; use the recommended same-origin deployment or
custom subdomains of the same owned domain instead. CORS is restricted to the
configured frontend. Do not disable SSL verification or store session tokens in
localStorage to work around browser restrictions.

## Operational notes

Deploying the protected backend before configuring the admin account/origin will
block existing clients. Complete setup first. /health is intentionally public and
contains no calendar data. Do not re-run db/init.sql: it drops calendar tables.
The session store creates its own table, requiring CREATE privileges initially.
Test browser login/logout on the deployed URL before using real records. The
automated tests use a fake database and session store, not your live Aiven data.
For password resets use an administrative script to hash a new password and
invalidate existing sessions; no public recovery workflow is included yet.

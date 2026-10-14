# NexaCRM – Enterprise CRM System (MERN)

React + Vite frontend, Node/Express REST API, MongoDB + Mongoose, JWT auth, role-based access (Admin / Sales Manager / Sales Executive).

## Folder structure
```
nexacrm/
├── server/   (Express API)  src/{config,models,middleware,controllers,routes}, seed.js
└── client/   (React app)    src/{pages,App.jsx,configs.js,api.js,styles.css}
```

## RUN IT – step by step
1. Install **Node.js 18+** (nodejs.org) and unzip this project.
2. Get a database (pick ONE):
   - **Local:** install MongoDB Community, then use `mongodb://127.0.0.1:27017/nexacrm`
   - **Atlas (free):** mongodb.com/atlas → create free M0 cluster → Database Access: add a user/password →
     Network Access: allow `0.0.0.0/0` → Connect → Drivers → copy the connection string
     (add `/nexacrm` before the `?`, and replace `<password>`).
3. Open a terminal in the `nexacrm` folder:
```
npm run setup                 # installs server + client dependencies
cp server/.env.example server/.env      (Windows: copy server\.env.example server\.env)
cp client/.env.example client/.env      (Windows: copy client\.env.example client\.env)
```
4. Edit `server/.env`:
```
MONGODB_URI=<your connection string>
JWT_SECRET=<any long random text>
PORT=5000
CLIENT_URL=http://localhost:5173
```
5. Seed demo data, then start both servers:
```
npm run seed
npm run dev
```
(If `npm run dev` fails on Windows, open two terminals: `cd server && npm run dev` and `cd client && npm run dev`.)
6. Open **http://localhost:5173** and log in.

## Demo logins
| Role | Email | Password |
|---|---|---|
| Admin | admin@nexacrm.com | Admin@123 |
| Sales Manager | manager@nexacrm.com | Manager@123 |
| Sales Executive | sales@nexacrm.com | Sales@123 |

## What to test
- Dashboard shows KPIs and 7 charts from the database.
- Leads/Customers/Deals/Activities: create, edit, delete, search, filter, sort, pagination.
- Pipeline page: drag a lead card to another column (status saves to MongoDB).
- Leads: the green person icon converts a Qualified/Won lead into a customer.
- Log in as `sales@` – you only see your own records, no Users page, cannot delete.
- Users page (Admin only): create/edit/deactivate/delete users.

## API (all under /api, JWT `Authorization: Bearer <token>`)
`POST /auth/login`, `GET /auth/me` · CRUD for `/leads`, `/customers`, `/deals`, `/activities` (query: `search, page, limit, sort`, filters) ·
`POST /leads/:id/convert` · `/users` (Admin) · `GET /dashboard/summary`

## Deployment
1. **Database:** MongoDB Atlas as above.
2. **Backend (Render):** push to GitHub → Render → New Web Service → root directory `server`, build `npm install`, start `npm start`.
   Env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` (your Vercel URL, set after step 3). Run the seed once locally against the Atlas URI.
3. **Frontend (Vercel):** New Project → root directory `client`, framework Vite, env var `VITE_API_URL=https://<your-render-app>.onrender.com/api`.
   Add `client/vercel.json` rewrite to `/index.html` (included).
4. Update `CLIENT_URL` on Render to the Vercel URL and redeploy.

## GitHub
```
git init && git add . && git commit -m "NexaCRM" && git branch -M main
git remote add origin https://github.com/<you>/nexacrm.git && git push -u origin main
```
`.env` and `node_modules` are git-ignored.

## New in this version
Lead / customer / deal **detail pages** (`/leads/:id`, `/customers/:id`, `/deals/:id`) with a shared `ActivityTimeline` and `ActivityForm`; **Settings** (profile, password, light/dark theme, notification preferences); **notifications** (bell, unread badge, mark read/all, delete, deep links; created automatically on lead assignment, lead status change, deal stage change, deal won/lost, customer created and due follow-ups, without duplicates); **Customer Growth** chart (`GET /api/dashboard/customer-growth`); **automated tests**.
Status and stage changes are also written to the timeline as "Status Change" activities.

## Automated tests
```
npm run setup          # installs everything (incl. test tools)
npm test               # backend (Jest + Supertest) then frontend (Vitest + React Testing Library)
npm run test:server    # backend only      npm run test:client   # frontend only
npm run test:coverage  # coverage for both
cd server && npm run test:watch      cd client && npm run test:watch
```
- **Backend** (`server/tests/api.test.js`): auth, leads, customers, deals, activities, notifications, dashboard (incl. customer growth), settings, RBAC. Uses `mongodb-memory-server`, an in-memory MongoDB; `MONGODB_URI` is removed during tests, so your real database is never touched. The first run downloads a MongoDB binary (needs internet once).
- **Frontend** (`client/src/__tests__/app.test.jsx`): login, protected route, dashboard, leads page, three detail pages, timeline, settings, notification dropdown. The API module is mocked, so no server is needed.

See TESTING_AND_VIVA.md for the manual checklist and viva Q&A.

## Not included yet
Automated notification emails (the Email notifications preference is stored but nothing is sent), executives only see timeline entries they created themselves.

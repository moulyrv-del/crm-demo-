# API testing checklist (use Postman/Thunder Client; base http://localhost:5000/api)
1. POST /auth/login wrong password -> 401; correct -> 200 + token. Missing fields -> 400.
2. GET /auth/me without token -> 401; with token -> user (no password field).
3. GET /leads as sales@ -> only own leads; as admin -> all. GET /leads?search=Lead1&status=New&page=2&limit=5 -> filtered, paginated.
4. DELETE /leads/:id as sales@ or manager@ -> 403; as admin -> 200. DELETE /leads/badid -> 400. Unknown valid id -> 404.
5. Create/read/update/delete for /customers, /deals, /activities, /emails; invalid enum (e.g. status "X") -> 400.
6. POST /leads/:id/convert on a Qualified lead -> 201 customer; again -> 409; on a New lead -> 400.
7. GET /users as sales@ -> 403. As admin: POST duplicate email -> 409; PUT with password re-hashes; DELETE self -> 400.
8. GET /dashboard/summary -> KPIs match counts in the database. GET /reports as sales@ -> 403.
Manual UI: log in as each role, check sidebar (executive has no Users/Reports), drag a card in Pipeline and refresh, export the CSV in Reports, resize to mobile width.

# Viva preparation
**Problem:** small businesses track leads in spreadsheets/WhatsApp, causing lost follow-ups and no sales visibility. **Objective:** one web system for leads, customers, deals, activities with role-based access and live analytics. **Proposed system:** MERN web app (React -> REST API -> Express -> MongoDB).
**Q&A**
1. What is MERN? MongoDB, Express, React, Node.js.
2. Why MongoDB? Flexible JSON-like documents, easy fit with JS, Mongoose gives schemas/validation.
3. What is REST? Stateless HTTP API style using GET/POST/PUT/DELETE on resource URLs.
4. What is JWT? Signed token holding the user id; sent in the Authorization header; server verifies it with JWT_SECRET.
5. Why hash passwords? So a database leak does not expose passwords; bcrypt adds salt and is slow to brute-force.
6. What is RBAC? Access depends on role. Enforced in the backend (`authorize` middleware, data scoping) and mirrored in the UI.
7. Why not rely on hidden buttons? Anyone can call the API directly; only server checks are secure.
8. What is middleware? Function running between request and handler (auth, validation, errors).
9. What is Mongoose? ODM that adds schemas, validation and queries over MongoDB.
10. What are references/populate? Storing an ObjectId (e.g. lead.assignedTo) and joining the user's data when reading.
11. How is pagination done? skip/limit on the server so only one page is sent.
12. How does the dashboard work? MongoDB aggregation ($group) and counts computed per request, no hard-coded numbers.
13. Weighted pipeline? Sum of deal value x probability for open deals.
14. How does the Kanban work? HTML5 drag-and-drop; on drop a PUT /leads/:id updates status.
15. What is CORS? Browser rule on cross-origin calls; the server allows only CLIENT_URL.
16. Why .env? Keeps secrets out of code and GitHub.
17. How is lead conversion done? Creates a Customer from the lead, links it, sets status Won; blocked if already converted.
18. What is React state/hook? State holds changing data; useEffect runs side effects like API calls.
19. How are errors handled? Central Express error handler returns a consistent JSON message; frontend shows toasts/alerts.
20. Future scope? Real email via SendGrid, notifications, file attachments, audit logs, automated tests, detail pages with timelines.

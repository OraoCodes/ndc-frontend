# Quick Start Guide

## 🚀 Getting Up and Running

### Prerequisites Check
```bash
node --version  # Should be 22+
pnpm --version  # Should be 10.14.0+
```

### First Time Setup (5 minutes)

```bash
# 1. Install dependencies
pnpm install

# 2. Create .env file
echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
echo "PORT=8080" >> .env

# 3. Start development server
pnpm dev
```

**That's it!** Open http://localhost:8080

---

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `server/index.ts` | Main server entry point, route registration |
| `server/db/setup.ts` | Database schema & initialization |
| `client/App.tsx` | React Router configuration |
| `client/lib/api.ts` | API client functions (frontend → backend) |
| `shared/api.ts` | Shared TypeScript types |

---

## 🔌 API Endpoints Quick Reference

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login

### Counties
- `GET /counties` - List all
- `GET /counties/:name/performance` - Get performance data
- `POST /counties/:id/performance` - Save performance

### Data Access
- `GET /counties/summary-performance/water` - Water rankings
- `GET /counties/summary-performance/waste` - Waste rankings
- `GET /indicators` - List all indicators
- `GET /publications` - List publications

---

## 🛠️ Common Tasks

### Add a New API Endpoint

1. Create `server/routes/my-route.ts`:
```typescript
export function createMyRoutes(db: Database): Router {
  const router = Router();
  router.get('/', (req, res) => res.json({ message: 'Hello' }));
  return router;
}
```

2. Register in `server/index.ts`:
```typescript
app.use('/my-route', createMyRoutes(db));
```

### Add a New Page

1. Create `client/pages/MyPage.tsx`
2. Add route in `client/App.tsx`:
```typescript
<Route path="/my-page" element={<MyPage />} />
```

### Access Database

```typescript
// In route handler:
const db = await setupDatabase(); // Or use passed db instance
const result = db.prepare('SELECT * FROM counties').all();
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 8080 in use | Change port in `vite.config.ts` or set `PORT` env var |
| Database locked | Close other connections, restart server |
| Module not found | Check `tsconfig.json` paths match `vite.config.ts` aliases |
| Type errors | Run `pnpm typecheck` to see all errors |

---

## 📦 Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Test production build locally
NODE_ENV=production pnpm start
```

---

## 🔐 Security Checklist (Before Production)

- [ ] Set `JWT_SECRET` environment variable (remove fallback)
- [ ] Add authentication middleware to protected routes
- [ ] Configure CORS for specific domains
- [ ] Add input validation (Zod schemas)
- [ ] Enable rate limiting on auth endpoints
- [ ] Review file upload security

---

## 📚 Next Steps

1. Read `TECHNICAL_OVERVIEW.md` for deep dive
2. Review `server/routes/` to understand API structure
3. Check `client/pages/` to see page components
4. Explore `server/db/setup.ts` for database schema

---

*For detailed information, see `TECHNICAL_OVERVIEW.md`*


# NDC Frontend - Comprehensive Technical Overview

## Executive Summary

This is a **full-stack TypeScript application** for managing and tracking Kenya's National Determined Contributions (NDC) at the county level. The system tracks climate action performance across water and waste management sectors, providing scoring, rankings, and detailed analytics for Kenyan counties.

**Application Type**: Single Page Application (SPA) with integrated Express backend  
**Primary Use Case**: Climate action tracking and performance monitoring for Kenyan counties  
**Deployment**: Supports both VPS (Apache + systemd) and serverless (Netlify Functions) deployments

---

## 1. Technology Stack

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 22+ | Server runtime |
| **Package Manager** | PNPM | 10.14.0 | Dependency management |
| **Language** | TypeScript | 5.9.2 | Type-safe development |
| **Build Tool** | Vite | 7.1.2 | Fast build & dev server |

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI framework |
| React Router | 6.30.1 | Client-side routing (SPA mode) |
| TanStack Query | 5.84.2 | Server state management |
| TailwindCSS | 3.4.17 | Utility-first CSS |
| Radix UI | Various | Accessible component primitives |
| Framer Motion | 12.23.12 | Animation library |
| Recharts | 2.12.7 | Data visualization |
| Three.js + React Three Fiber | 0.176.0 / 8.18.0 | 3D map rendering |
| React Hook Form | 7.62.0 | Form management |
| Zod | 3.25.76 | Schema validation |

### Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| Express | 5.1.0 | Web framework |
| @supabase/supabase-js | 2.86.2 | Supabase client library |
| JWT (jsonwebtoken) | 9.0.2 | Authentication tokens |
| bcrypt | 6.0.0 | Password hashing |
| CORS | 2.8.5 | Cross-origin resource sharing |
| dotenv | 17.2.1 | Environment variable management |

### Development Tools

- **Vitest** (3.2.4): Testing framework
- **SWC** (1.13.3): Fast TypeScript/JavaScript compiler
- **Prettier** (3.6.2): Code formatting
- **TypeScript**: Type checking (strict mode disabled)

---

## 2. Project Structure

```
ndc_frontend/
├── client/                    # React SPA frontend
│   ├── pages/                 # Route components
│   │   ├── Dashboard.tsx      # Admin dashboard
│   │   ├── HomePage.tsx       # Public homepage
│   │   ├── Counties.tsx       # County management (protected)
│   │   ├── County/            # County detail pages
│   │   ├── Water-Management/  # Water sector pages
│   │   ├── Waste-Management/  # Waste sector pages
│   │   └── ...
│   ├── components/            # React components
│   │   ├── ui/               # Radix UI component library (50+ components)
│   │   ├── InteractiveMap.tsx
│   │   ├── PrivateRoute.tsx  # Route protection
│   │   └── ...
│   ├── context/              # React Context providers
│   │   └── AuthContext.tsx   # Authentication state
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utilities
│   │   ├── api.ts           # API client functions
│   │   └── utils.ts         # Helper functions
│   ├── App.tsx              # Root component + routing
│   ├── main.tsx             # Entry point
│   └── global.css           # TailwindCSS + theme
│
├── server/                   # Express API backend
│   ├── index.ts             # Server factory & entry point
│   ├── node-build.ts        # Production server entry
│   ├── db/
│   │   └── setup.ts         # Database initialization & schema
│   └── routes/              # API route handlers
│       ├── auth.ts          # Authentication (login/register)
│       ├── counties.ts      # County CRUD + performance
│       ├── thematicAreas.ts  # Thematic area management
│       ├── indicator.ts     # Indicator CRUD
│       ├── publications.ts  # Publication/file management
│       ├── score.ts         # Score aggregation endpoints
│       └── summary.ts       # Summary performance data
│
├── shared/                   # Shared types between client & server
│   └── api.ts               # TypeScript interfaces
│
├── netlify/                  # Serverless deployment
│   └── functions/
│       └── api.ts            # Netlify Functions wrapper
│
├── deploy/                   # VPS deployment scripts
│   ├── deploy.sh            # Deployment automation
│   ├── ndc.service          # systemd unit file
│   └── apache-ndc.conf      # Apache vhost config
│
├── public/                   # Static assets
├── vite.config.ts           # Vite client build config
├── vite.config.server.ts   # Vite server build config
├── tailwind.config.ts       # TailwindCSS configuration
└── tsconfig.json            # TypeScript configuration
```

---

## 3. Backend Architecture

### 3.1 Entry Points

#### Development Mode
- **File**: `vite.config.ts`
- **Port**: 8080 (single port for frontend + backend)
- **Integration**: Vite dev server proxies API requests to Express via custom plugin
- **Hot Reload**: Both client and server code reload automatically

#### Production Mode
- **Standalone Server**: `server/node-build.ts` → `server/index.ts` → `startServer()`
- **Port**: Configurable via `PORT` env var (default: 3000)
- **Static Serving**: Express serves built SPA from `dist/spa/`
- **Serverless**: `netlify/functions/api.ts` wraps Express app with `serverless-http`

### 3.2 Server Initialization Flow

```typescript
// server/index.ts
1. Load environment variables (dotenv)
2. Initialize Express server (no database setup needed - uses Supabase)
3. Create Express app
4. Apply middleware (CORS, JSON parsing, body size limits)
5. Register route handlers
6. Configure static file serving (production only)
7. Return app instance (for middleware mounting or standalone)
```

### 3.3 API Layer Structure

#### Route Organization

All routes are organized in `server/routes/` with factory functions that accept the database instance:

```typescript
// Pattern: create[Resource]Routes(db: Database): Router
export function createCountiesRoutes(db: Database): Router
export function createThematicAreasRoutes(db: Database): Router
export function createIndicatorsRoutes(db: Database): Router
export function createPublicationsRoutes(db: Database): Router
export function createSummaryRoutes(db: Database): Router
```

#### API Endpoints

**Authentication** (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

**Counties** (`/counties`)
- `GET /counties` - List all counties
- `GET /counties/:id` - Get county by ID
- `POST /counties` - Create county
- `PUT /counties/:id` - Update county
- `DELETE /counties/:id` - Delete county
- `GET /counties/:name/performance` - Get county performance data
- `POST /counties/:id/performance` - Save/update county performance
- `GET /counties/summary-performance/:sector` - Get sector rankings

**Thematic Areas** (`/thematic-areas`)
- `GET /thematic-areas` - List all
- `GET /thematic-areas/:id` - Get by ID
- `POST /thematic-areas` - Create
- `PUT /thematic-areas/:id` - Update
- `DELETE /thematic-areas/:id` - Delete

**Indicators** (`/indicators`)
- `GET /indicators` - List all indicators
- `POST /indicators` - Create indicator
- `PUT /indicators/:id` - Update indicator
- `DELETE /indicators/:id` - Delete indicator

**Publications** (`/publications`)
- `GET /publications` - List all
- `GET /publications/:id` - Get metadata
- `GET /publications/:id/download` - Download file
- `POST /publications` - Upload (base64 encoded)
- `DELETE /publications/:id` - Delete

**Scores** (`/api/scores`)
- `GET /api/scores/water` - Water sector scores
- `GET /api/scores/waste` - Waste sector scores

**Summary** (`/counties/summary-performance`)
- `GET /counties/summary-performance/water` - Water summary
- `GET /counties/summary-performance/waste` - Waste summary

**Utility**
- `GET /ping` - Health check

### 3.4 Database Architecture

#### Database: Supabase (PostgreSQL)

**Tables:**

1. **`thematic_areas`**
   - `id` (INTEGER PRIMARY KEY)
   - `name` (TEXT UNIQUE)
   - `description` (TEXT)

2. **`counties`**
   - `id` (INTEGER PRIMARY KEY)
   - `name` (TEXT UNIQUE)
   - `population` (INTEGER)
   - `thematic_area_id` (INTEGER, FK)

3. **`users`**
   - `id` (INTEGER PRIMARY KEY)
   - `fullName` (TEXT)
   - `email` (TEXT UNIQUE)
   - `organisation` (TEXT)
   - `phoneNumber` (TEXT)
   - `position` (TEXT)
   - `password` (TEXT, bcrypt hashed)
   - `role` (TEXT, default: 'user')
   - `createdAt` (TEXT)
   - `updatedAt` (TEXT)

4. **`county_performance`**
   - `id` (INTEGER PRIMARY KEY)
   - `county_id` (INTEGER, FK)
   - `year` (INTEGER)
   - `sector` (TEXT, CHECK: 'water' | 'waste')
   - `overall_score` (REAL)
   - `sector_score` (REAL)
   - `governance` (REAL)
   - `mrv` (REAL)
   - `mitigation` (REAL)
   - `adaptation` (REAL)
   - `finance` (REAL)
   - `indicators_json` (TEXT, JSON string)
   - `created_at` (TEXT)
   - `updated_at` (TEXT)
   - UNIQUE(county_id, year, sector)

5. **`indicators`**
   - `id` (INTEGER PRIMARY KEY)
   - `sector` (TEXT, CHECK: 'water' | 'waste')
   - `thematic_area` (TEXT)
   - `indicator_text` (TEXT)
   - `weight` (REAL, default: 10)
   - `created_at` (TEXT)
   - `updated_at` (TEXT)
   - UNIQUE(sector, indicator_text)

6. **`publications`**
   - `id` (INTEGER PRIMARY KEY)
   - `title` (TEXT)
   - `date` (TEXT)
   - `summary` (TEXT)
   - `filename` (TEXT)
   - `file_blob` (BLOB) - Binary file storage

**Database Initialization:**
- Schema creation happens in `server/db/setup.ts`
- Pre-populated with 60+ indicators (water + waste sectors)
- Indicators organized by thematic areas: Governance, MRV, Mitigation, Adaptation & Resilience, Finance & Resource Mobilization

### 3.5 Authentication & Authorization

#### Authentication Flow

1. **Registration** (`POST /auth/register`)
   - Validates: fullName, email, password
   - Checks for existing email
   - Hashes password with bcrypt (10 rounds)
   - Creates user with role 'user'
   - Returns JWT token (7-day expiry)

2. **Login** (`POST /auth/login`)
   - Validates email/password
   - Verifies password with bcrypt
   - Returns JWT token + user data

3. **Token Management**
   - **Secret**: `JWT_SECRET` env var (fallback: hardcoded - **SECURITY RISK**)
   - **Expiry**: 7 days
   - **Storage**: localStorage (client-side)
   - **Validation**: Client-side JWT decode + expiry check

#### Authorization

**Current State**: ⚠️ **INCOMPLETE**
- Frontend: `PrivateRoute` component checks `isAuthenticated` state
- Backend: **NO authentication middleware** - all routes are publicly accessible
- Only `/counties` route is protected on frontend (via `PrivateRoute`)

**Missing**: Server-side JWT verification middleware for protected endpoints

### 3.6 Middleware Stack

```typescript
// Applied in order:
1. CORS - Allows cross-origin requests
2. express.json() - Parses JSON bodies (10MB limit)
3. express.urlencoded() - Parses URL-encoded bodies (10MB limit)
4. Route handlers
5. Static file serving (production only)
6. SPA fallback (production only)
```

**Missing Middleware:**
- Authentication/authorization middleware
- Request logging
- Rate limiting
- Input validation (Zod schemas exist but not enforced)
- Error handling middleware

---

## 4. Data Flow

### 4.1 End-to-End Request Flow

#### Public Route Example: View County Performance

```
1. User visits /county/Nairobi
   ↓
2. React Router renders CountyPage component
   ↓
3. Component calls: api.getCountyPerformance('Nairobi', '2025')
   ↓
4. Client API (client/lib/api.ts) makes fetch request
   ↓
5. Request hits: GET /counties/Nairobi/performance?year=2025
   ↓
6. Express routes to: createCountiesRoutes → performance handler
   ↓
7. Database query: JOIN counties + county_performance
   ↓
8. Response: JSON with scores, indicators, thematic breakdowns
   ↓
9. React component updates state via TanStack Query
   ↓
10. UI renders charts, tables, scorecards
```

#### Protected Route Example: Save County Performance

```
1. Admin logs in → JWT stored in localStorage
   ↓
2. Admin navigates to /counties (protected route)
   ↓
3. PrivateRoute checks AuthContext.isAuthenticated
   ↓
4. If authenticated, renders Counties component
   ↓
5. Admin submits performance data
   ↓
6. POST /counties/:id/performance (with data)
   ↓
7. ⚠️ NO AUTH CHECK - Route accepts request
   ↓
8. Database INSERT/UPDATE county_performance
   ↓
9. Response: { success: true }
```

### 4.2 Database Query Patterns

**Database Queries**: All queries use Supabase client library with Row Level Security (RLS):

```typescript
// Pattern used throughout:
const { data, error } = await supabase
  .from('counties')
  .select('*')
  .eq('id', id)
  .single();
```

**Common Operations:**
- **Read**: `.select()` with filters (`.eq()`, `.gt()`, etc.)
- **Write**: `.insert()`, `.update()`, `.delete()`
- **Security**: Row Level Security (RLS) policies enforce access control

---

## 5. External Services & Integrations

### Current Integrations

**None** - This is a self-contained application with:
- No external APIs
- No third-party services
- Files stored in Supabase Storage (cloud-based)
- No email service
- No payment processing

### Deployment Platforms

1. **Netlify** (serverless)
   - Configuration: `netlify.toml`
   - Function: `netlify/functions/api.ts`
   - Build: Client-only, server runs as serverless function

2. **VPS** (traditional)
   - Apache reverse proxy
   - systemd service
   - Node.js standalone server
   - Configuration: `deploy/` directory

---

## 6. Security Analysis

### ⚠️ Critical Issues

1. **No Server-Side Authentication**
   - All API endpoints are publicly accessible
   - JWT tokens are generated but never verified on backend
   - Anyone can modify county performance data

2. **Hardcoded JWT Secret**
   ```typescript
   const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key-2025';
   ```
   - Fallback secret is in source code
   - Should fail if `JWT_SECRET` is not set

3. **SQL Injection Risk** (Low)
   - Using prepared statements mitigates risk
   - But no input validation/sanitization layer

4. **CORS Configuration**
   - Currently allows all origins (`cors()` with no config)
   - Should restrict to known domains in production

5. **File Upload Security**
   - No file type validation
   - No file size limits beyond 10MB
   - Files stored in database (not ideal for large files)

6. **Password Policy**
   - No minimum length requirements
   - No complexity requirements

### Recommendations

1. **Implement Authentication Middleware**
   ```typescript
   // server/middleware/auth.ts
   export const authenticateToken = (req, res, next) => {
     const token = req.headers['authorization']?.split(' ')[1];
     if (!token) return res.status(401).json({ error: 'Unauthorized' });
     // Verify JWT...
   };
   ```

2. **Add Input Validation**
   - Use Zod schemas for request validation
   - Already have Zod in dependencies

3. **Environment Variables**
   - Require `JWT_SECRET` in production
   - Add `.env.example` file
   - Document required env vars

4. **Rate Limiting**
   - Add express-rate-limit for auth endpoints
   - Prevent brute force attacks

---

## 7. Code Quality & Technical Debt

### Issues Found

1. **TypeScript Strict Mode Disabled**
   ```json
   "strict": false,
   "noImplicitAny": false,
   "strictNullChecks": false
   ```
   - Reduces type safety benefits
   - Many `any` types in codebase

2. **Mixed File Extensions**
   - Some files are `.tsx`, others `.jsx`
   - Inconsistent naming (e.g., `CountyData.jsx` vs `CountyData.tsx`)

3. **Duplicate Database Connections**
   - ~~`server/routes/auth.ts` creates its own DB connection~~ (removed - using Supabase Auth)
   - ~~`server/routes/score.ts` creates its own DB connection~~ (removed - using Supabase)
   - ~~Should use shared instance from `setupDatabase()`~~ (no longer applicable)

4. **Error Handling**
   - Inconsistent error responses
   - Some routes return generic "Server error"
   - No centralized error handling

5. **Code Comments**
   - Many "FIX" comments in `server/index.ts`
   - Suggests incomplete refactoring

6. **Unused Dependencies**
   - `pdfjs-dist` - PDF rendering library (used for publication thumbnails)
   - ~~`sqlite` package alongside `better-sqlite3`~~ (removed - migrated to Supabase)

7. ~~**Database File Location**~~ (no longer applicable - using Supabase)
   - ~~`ndc.db` in root directory~~ (removed)
   - Database is now cloud-hosted on Supabase

### Positive Aspects

✅ **Good Practices:**
- Prepared statements for SQL queries
- TypeScript interfaces in `shared/api.ts`
- Modular route organization
- Factory pattern for route creation
- Environment variable usage (though incomplete)

---

## 8. Dependencies Status

### Recent/Modern Versions
- React 18.3.1 ✅
- Express 5.1.0 ✅ (very recent)
- Vite 7.1.2 ✅
- TypeScript 5.9.2 ✅

### Potential Concerns
- **Express 5.1.0**: Very new version, may have breaking changes from v4
- **Supabase**: Production-ready PostgreSQL database with built-in scaling
- **bcrypt 6.0.0**: Latest version, good

### Missing Dependencies (Recommended)
- `express-rate-limit` - Rate limiting
- `helmet` - Security headers
- `express-validator` or use Zod - Input validation
- `winston` or `pino` - Structured logging

---

## 9. Getting Started for New Developers

### Prerequisites

- **Node.js**: 22+ (check with `node --version`)
- **PNPM**: 10.14.0+ (install: `npm install -g pnpm`)
- **Git**: For version control

### Initial Setup

```bash
# 1. Clone repository
git clone <repository-url>
cd ndc_frontend

# 2. Install dependencies
pnpm install

# 3. Create environment file
cp .env.example .env  # If exists, or create manually
# Add required variables:
# JWT_SECRET=your-secret-key-here
# PORT=8080 (optional, defaults to 3000 for production)

# 4. Database is hosted on Supabase (no local setup needed)
# Configure Supabase environment variables (see SUPABASE_MIGRATION_GUIDE.md)

# 5. Start development server
pnpm dev
# Server runs on http://localhost:8080
# Frontend + Backend on same port
```

### Development Workflow

#### Adding a New API Endpoint

1. **Create route handler** in `server/routes/my-route.ts`:
```typescript
import { Router } from 'express';
import { supabase } from '@/lib/supabase-api';

export function createMyRoutes(): Router {
  const router = Router();
  
  router.get('/', (req, res) => {
    const data = db.prepare('SELECT * FROM my_table').all();
    res.json(data);
  });
  
  return router;
}
```

2. **Register in** `server/index.ts`:
```typescript
import { createMyRoutes } from './routes/my-route';

// In createServer():
app.use('/my-endpoint', createMyRoutes(db));
```

3. **Add TypeScript interface** in `shared/api.ts`:
```typescript
export interface MyData {
  id: number;
  name: string;
}
```

4. **Create client API function** in `client/lib/api.ts`:
```typescript
export const api = {
  // ... existing
  getMyData: async (): Promise<MyData[]> => 
    request<MyData[]>('/my-endpoint'),
};
```

5. **Use in React component**:
```typescript
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['myData'],
  queryFn: api.getMyData,
});
```

#### Adding a New Page

1. **Create component** in `client/pages/MyPage.tsx`
2. **Add route** in `client/App.tsx`:
```typescript
import MyPage from './pages/MyPage';

<Route path="/my-page" element={<MyPage />} />
```

#### Database Changes

1. **Modify schema** in `server/db/setup.ts`
2. **Use migrations** (not currently implemented - consider adding)
3. **Or manually run SQL** on existing database

### Testing

```bash
# Run tests (if any exist)
pnpm test

# Type checking
pnpm typecheck
```

### Building for Production

```bash
# Build both client and server
pnpm build

# Output:
# - dist/spa/ - Client build (static files)
# - dist/server/ - Server build (Node.js)

# Start production server
pnpm start
# Runs on PORT env var or 3000
```

### Common Issues

1. ~~**Database locked errors**~~ (resolved)
   - ~~SQLite doesn't handle concurrent writes well~~ (migrated to Supabase PostgreSQL)
   - PostgreSQL handles concurrent operations natively

2. **Port already in use**
   - Change `PORT` in `.env` or `vite.config.ts`

3. **Module resolution errors**
   - Ensure `tsconfig.json` paths match `vite.config.ts` aliases
   - Restart dev server after config changes

---

## 10. Deployment Options

### Option 1: Netlify (Serverless)

```bash
# Build client
pnpm build:client

# Deploy (via Netlify CLI or Git integration)
netlify deploy --prod
```

**Configuration**: `netlify.toml`
- Functions directory: `netlify/functions`
- Publish directory: `dist/spa`
- API routes proxied to serverless function

### Option 2: VPS (Traditional)

**Requirements:**
- Ubuntu/Debian server
- Node.js 22+
- Apache or Nginx
- systemd

**Deployment Steps:**
```bash
# On VPS
cd /path/to/repo
chmod +x deploy/deploy.sh
./deploy/deploy.sh

# Manual steps if needed:
# 1. Copy Apache config
sudo cp deploy/apache-ndc.conf /etc/apache2/sites-available/ndc.conf
sudo a2ensite ndc.conf

# 2. Install systemd service
sudo cp deploy/ndc.service /etc/systemd/system/
sudo systemctl enable ndc.service
sudo systemctl start ndc.service

# 3. Check logs
sudo journalctl -u ndc.service -f
```

---

## 11. Key Features & Business Logic

### Core Functionality

1. **County Performance Tracking**
   - Tracks performance across water and waste sectors
   - Scores calculated across 5 thematic areas:
     - Governance
     - MRV (Monitoring, Reporting, Verification)
     - Mitigation
     - Adaptation & Resilience
     - Finance & Resource Mobilization

2. **Indicator Management**
   - 60+ pre-configured indicators
   - Customizable weights
   - Sector-specific indicators

3. **Rankings & Analytics**
   - County rankings by sector
   - Performance categorization (Outstanding, Satisfactory, Good, Average, Poor)
   - Year-over-year tracking

4. **Publication Management**
   - Upload PDFs and documents
   - Store in database as BLOB
   - Download functionality

5. **Public Portal**
   - Public-facing county pages
   - Interactive maps
   - Performance visualizations

---

## 12. Recommendations for Integration

### Immediate Priorities

1. **🔴 CRITICAL: Add Authentication Middleware**
   - Protect all write operations
   - Verify JWT tokens on backend
   - Add role-based access control (RBAC)

2. **🔴 CRITICAL: Environment Variables**
   - Require `JWT_SECRET` in production
   - Document all required env vars
   - Add `.env.example`

3. **🟡 HIGH: Input Validation**
   - Implement Zod schemas for all endpoints
   - Validate file uploads
   - Sanitize user inputs

4. **🟡 HIGH: Error Handling**
   - Centralized error middleware
   - Consistent error response format
   - Proper HTTP status codes

### Medium Priority

5. **Database Migration System**
   - Consider adding a migration tool (e.g., `kysely`, `drizzle`)
   - Version control schema changes

6. **Logging**
   - Add structured logging
   - Log API requests/responses
   - Error tracking

7. **Testing**
   - Add unit tests for routes
   - Integration tests for API
   - E2E tests for critical flows

### Long-term

8. **Database Migration**
   - Consider PostgreSQL for production
   - Better concurrency handling
   - More robust for multi-user scenarios

9. ~~**File Storage**~~ (completed)
   - ✅ Moved from SQLite BLOB to Supabase Storage
   - ✅ Better for large files
   - ✅ Improved performance

10. **API Documentation**
    - Add OpenAPI/Swagger documentation
    - Document all endpoints
    - Include request/response examples

---

## Conclusion

This is a **well-structured full-stack application** with modern tooling and a clear separation of concerns. The codebase is generally clean and follows good patterns, but has **critical security gaps** that must be addressed before production use.

**Strengths:**
- Modern tech stack
- TypeScript throughout
- Good project organization
- Flexible deployment options

**Weaknesses:**
- No server-side authentication
- Missing input validation
- Incomplete error handling
- TypeScript strict mode disabled

**Overall Assessment:** 
The foundation is solid, but requires security hardening and production-readiness improvements before handling sensitive data or public deployment.

---

*Last Updated: Based on codebase analysis as of current date*
*For questions or clarifications, refer to the codebase or contact the development team.*


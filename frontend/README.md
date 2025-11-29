# Blog App Frontend

React + TypeScript + Vite frontend for the Blog Application with shadcn/ui components.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6
- **Rich Text Editor**: TipTap
- **Animations**: Framer Motion

## Prerequisites

- Node.js 18+ or Bun
- Backend API running (see `../backend/README.md`)

## Local Development (Without Docker)

### 1. Install Dependencies

Using npm:
```bash
npm install
```

Using Bun (faster):
```bash
bun install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:
```bash
cp env.example .env
```

Update `.env` with your backend URL:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Start Development Server

Using npm:
```bash
npm run dev
```

Using Bun:
```bash
bun run dev
```

The app will be available at: http://localhost:8080

### 4. Build for Production

```bash
npm run build
# or
bun run build
```

The built files will be in the `dist/` directory.

## Docker Deployment

### Prerequisites

1. **Create the shared Docker network** (if not already created):
```bash
docker network create blogapp_network
```

2. **Ensure backend and database are running:**
```bash
# Check running containers
docker ps | grep blogapp
```

### Build and Run

1. **Build the Docker image:**
```bash
docker compose build
```

This uses the `.Dockerfile` which:
- Uses `oven/bun:1` for faster dependency installation
- Builds the production bundle with `bun run build`
- Serves static files via NGINX Alpine

2. **Start the frontend container:**
```bash
docker compose up -d
```

3. **Check logs:**
```bash
docker compose logs -f
# or
docker logs -f blogapp-frontend
```

### Verify Deployment

1. **Check container status:**
```bash
docker ps | grep blogapp-frontend
```

2. **Test direct access:**
```bash
curl -I http://localhost:8081
```

3. **Access via NGINX proxy:**
```bash
curl -I http://localhost
```

### Container Details

**Exposed Ports:**
- `8081:80` - Frontend served on host port 8081

**Network:**
- Connected to `blogapp_network`
- Accessible to NGINX as `blogapp-frontend:80`

**Build Process:**
```dockerfile
# Build stage with Bun
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

# Production stage with NGINX
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

### Rebuild After Changes

```bash
# Rebuild without cache
docker compose build --no-cache

# Restart container
docker compose up -d
```

## Environment Variables

### Development (`.env`)

```env
VITE_API_URL=http://localhost:8000
```

### Production (Docker)

The frontend is a static build, so environment variables are baked in at build time. To change the API URL:

1. Update `.env`
2. Rebuild the image: `docker compose build --no-cache`
3. Restart: `docker compose up -d`

## Project Structure

```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # shadcn/ui components
│   │   └── ...          # Custom components
│   ├── pages/           # Route pages
│   │   ├── Feed.tsx     # Public blog feed
│   │   ├── Dashboard.tsx # User's posts
│   │   ├── Write.tsx    # Create post
│   │   ├── Edit.tsx     # Edit post
│   │   ├── BlogPost.tsx # Single post view
│   │   └── Profile.tsx  # User profile
│   ├── lib/
│   │   ├── api.ts       # Axios instance and API calls
│   │   └── utils.ts     # Utility functions
│   ├── store/
│   │   └── authStore.ts # Zustand auth state
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
├── .Dockerfile          # Multi-stage Docker build
├── docker-compose.yml   # Container orchestration
├── vite.config.ts       # Vite configuration
└── tailwind.config.ts   # Tailwind configuration
```

## Features

✅ **Authentication**
- User registration with OTP verification
- Login/Logout
- Protected routes
- JWT token management
- Profile updates
- Password change

✅ **Blog Management**
- Create/Edit/Delete posts
- Draft vs Published status
- Rich text editor (TipTap)
- Cover image support
- Tag management
- Auto-calculated read time

✅ **Social Features**
- Like/Unlike posts
- Bookmark posts
- Comments
- User profiles

✅ **UI/UX**
- Responsive design
- Dark/Light mode (next-themes)
- Smooth animations (Framer Motion)
- Loading states
- Error handling
- Toast notifications (Sonner)

## API Integration

The frontend communicates with the backend via Axios. All API calls are in `src/lib/api.ts`.

### Authentication Flow

1. **Register**: `POST /api/auth/register`
2. **Verify OTP**: `POST /api/auth/verify`
3. **Login**: `POST /api/auth/login`
4. **Get User**: `GET /api/auth/me`

### Blog Operations

- **Get Posts**: `GET /api/posts`
- **Get My Posts**: `GET /api/posts/my-posts`
- **Create Post**: `POST /api/posts`
- **Update Post**: `PUT /api/posts/:id`
- **Delete Post**: `DELETE /api/posts/:id`

### Axios Interceptor

Automatically handles:
- Adding JWT token to requests
- 401 responses (clears auth and redirects to login)
- Error logging

## Troubleshooting

### Build Fails

**Bun lockfile out of sync:**
```bash
# Remove lockfile and reinstall
rm bun.lockb
bun install
```

**Node modules issues:**
```bash
# Clean install
rm -rf node_modules
npm install
```

### Container Issues

**Port 8081 already in use:**
```bash
# Check what's using the port
lsof -i :8081

# Change port in docker-compose.yml
ports:
  - "8082:80"  # Use 8082 instead
```

**NGINX not serving files:**
```bash
# Check if files were built
docker exec blogapp-frontend ls /usr/share/nginx/html

# Should see: index.html, assets/, etc.
```

**API calls failing:**
- Check `VITE_API_URL` in `.env`
- Verify backend is running: `curl http://localhost:8000/health`
- Check CORS settings in backend
- Rebuild after changing `.env`: `docker compose build --no-cache`

### Development Issues

**Hot reload not working:**
- Ensure dev server is running on `0.0.0.0` (see `vite.config.ts`)
- Check if port 8080 is accessible

**API calls fail in development:**
- Verify backend is running on port 8000
- Check `VITE_API_URL` in `.env`
- Check browser console for CORS errors

## Accessing the Application

### Via Direct Container Access
- Frontend: http://localhost:8081

### Via NGINX Proxy (Recommended)
- Frontend: http://localhost
- API: http://localhost/api
- phpMyAdmin: http://localhost/phpmyadmin

## Network Configuration

The frontend container is connected to `blogapp_network` and can be accessed by:
- `blogapp-nginx` - NGINX reverse proxy (proxies to `blogapp-frontend:80`)

## Scripts

```bash
# Development
npm run dev          # Start dev server
bun run dev          # Start dev server (Bun)

# Build
npm run build        # Build for production
bun run build        # Build for production (Bun)

# Preview production build
npm run preview      # Preview production build

# Linting
npm run lint         # Run ESLint
```

## Testing Checklist

After deployment:

- [ ] Can access frontend at http://localhost (via NGINX)
- [ ] Can register a new user
- [ ] Can verify OTP and login
- [ ] Can create a new blog post
- [ ] Can edit own blog post
- [ ] Can delete own blog post
- [ ] Can view public feed
- [ ] Can add comments
- [ ] Can like/unlike posts
- [ ] Can bookmark posts
- [ ] Can update profile
- [ ] Can change password
- [ ] Can logout
- [ ] Protected routes redirect to login when not authenticated

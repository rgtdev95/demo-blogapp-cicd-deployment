# Blog App – Migration from Frontend-Only to Full-Stack (React + FastAPI + MySQL)

## Phase 1: Frontend Analysis & Feature Inventory
- [ ] Thoroughly analyze the current React frontend code
- [ ] Extract and document **all existing features** including but not limited to:
  - User authentication (Login, Sign-up, Logout, session/token management)
  - Blog management (Create post, Edit post, Delete post, List posts, View single post)
  - Rich text editor integration (if any)
  - Post images/upload handling
  - Comments system (Add comment, View comments, nested replies if exists)
  - Like / Unlike functionality (on posts and/or comments)
  - Author/profile display
  - Pagination / infinite scroll (if implemented)
  - Search / filtering (by tag, category, date, etc.)
  - Any admin-only features or guards
  - Responsive design / mobile behaviour
- [x] Add the complete feature list below this section in this file

### Complete Feature List (Extracted from Frontend Analysis)

#### Technology Stack
- React 18 + TypeScript + Vite
- shadcn/ui components (Radix UI)
- TipTap rich text editor
- Zustand state management
- React Router v6
- React Hook Form + Zod validation
- Framer Motion animations

#### Authentication Features (MUST IMPLEMENT)
- ✅ User Registration (signup with name, email, password)
- ✅ Email/OTP Verification (currently accepts any 6-digit code)
- ✅ User Login (email + password, min 8 chars)
- ✅ User Logout
- ✅ Protected Routes (redirect to login if not authenticated)
- ✅ Session Persistence (currently localStorage, will use JWT)
- ✅ User Profile with avatar (Dicebear API for now)

#### Blog Post Management (MUST IMPLEMENT)
- ✅ Create Blog Post with:
  - Title (required)
  - Rich text content (HTML from TipTap editor)
  - Cover image URL
  - Tags (array)
  - SEO title (optional)
  - SEO description (optional)
  - Auto-calculated read time (words / 200)
  - Auto-generated excerpt
- ✅ Save as Draft vs Publish (isDraft boolean)
- ✅ Edit Blog Post (all fields editable)
- ✅ Delete Blog Post (with confirmation dialog)
- ✅ View Own Posts (dashboard with grid layout)
- ✅ Filter by Draft/Published status

#### Public Feed Features (MUST IMPLEMENT)
- ✅ Public blog feed (paginated, 12 per page)
- ✅ View individual blog post (public access)
- ✅ Display author information (name, avatar)
- ✅ Show metadata (read time, published date, tags)

#### Social Features (MUST IMPLEMENT)
- ✅ Like/Unlike posts (toggle, with count)
- ✅ Save/Bookmark posts (toggle)
- ✅ Share posts (Web Share API + clipboard fallback)
- ✅ Comments system:
  - View comments on posts
  - Add comment (auth required)
  - Display author info + timestamp
  - Relative timestamps (Today, Yesterday, X days ago)
- ✅ Follow author button (UI present, needs backend)

#### User Profile Features (MUST IMPLEMENT)
- ✅ View/Edit profile:
  - Name
  - Email
  - Bio
  - Avatar (image upload with drag-and-drop)
- ✅ Change password (requires current password)
- ✅ Form validation with Zod

#### Features NOT in Current Frontend (DO NOT IMPLEMENT)
- ❌ Image upload to server (currently uses URLs only)
- ❌ Search functionality
- ❌ Filter by tags/categories
- ❌ Nested comment replies
- ❌ Edit/delete comments
- ❌ View other user profiles
- ❌ Saved posts list page
- ❌ Liked posts list page
- ❌ Admin panel
- ❌ Password reset/forgot password
- ❌ Email notifications
- ❌ Real-time updates

#### Data Models Identified
**User**: id, name, email, avatar (optional)
**Blog**: id, title, excerpt, content (HTML), coverImage, publishedAt, readTime, isDraft, tags[], seoTitle, seoDescription
**Comment**: id, author {name, avatar}, content, createdAt
**Like**: post_id, user_id (many-to-many)
**Bookmark**: post_id, user_id (many-to-many)



## Phase 2: Backend Setup with FastAPI + MySQL + phpMyAdmin (Docker Compose)
- [ ] Create the recommended folder structure:
- [ ] Set up Docker Compose with three services: 
- FastAPI backend (uvicorn)
- MySQL 8 database
- Use folder: database
- phpMyAdmin (for easy DB inspection)
- [ ] Implement basic FastAPI project structure (main.py, routers/, models/, schemas/, database.py, dependencies.py)
- [ ] Configure SQLAlchemy 2.0 + async support (or sync if preferred) with MySQL
- [ ] Add proper CORS middleware and environment variables (.env)

## Phase 3: Implement Features One by One (KISS Approach)
We will follow the **KISS principle** – implement only what exists in the current frontend, nothing extra.

### Checklist (to be checked off as we complete each endpoint + frontend integration)

#### Authentication
- [ ] POST /api/auth/register
- [ ] POST /api/auth/login
- [ ] POST /api/auth/logout (invalidate token if using server sessions)
- [ ] GET  /api/auth/me (protected route)
- [ ] JWT authentication (or FastAPI Users if faster)
- [ ] Password hashing (bcrypt)

#### Blog Posts
- [ ] GET    /api/posts (public, with pagination)
- [ ] GET    /api/posts/{id} (public)
- [ ] POST   /api/posts (protected – authenticated user)
- [ ] PUT    /api/posts/{id} (protected – owner only)
- [ ] DELETE /api/posts/{id} (protected – owner only)

#### Comments
- [ ] GET    /api/posts/{post_id}/comments
- [ ] POST   /api/posts/{post_id}/comments (protected)
- [ ] DELETE /api/comments/{id} (protected – owner only)

#### Likes
- [ ] POST   /api/posts/{post_id}/like
- [ ] DELETE /api/posts/{post_id}/like
- [ ] (Optional) GET /api/posts/{post_id}/likes-count

#### Additional (only if already in frontend)
- [ ] Image upload endpoint (with local storage or Cloudinary)
- [ ] Tags / Categories
- [ ] Search endpoint
- [ ] User profile posts

## Phase 4: Frontend Integration
- [ ] Update all API calls in React to point to new FastAPI backend
- [ ] Use axios or fetch wrappers in src/api/
- [ ] Add interceptors for auth token
- [ ] Handle loading/error states properly
- [ ] Test every feature end-to-end

## Phase 5: Final Touches
- [ ] Add proper error handling & validation messages
- [ ] Rate limiting (optional but nice)
- [ ] Logging
- [ ] Seed initial data (admin user, sample posts)
- [ ] Write README with setup instructions
- [ ] Prepare for deployment (Docker + production env)

We will work sequentially and check off items as we go — no feature creep, only replicate what already works in the current frontend.
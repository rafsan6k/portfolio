## Plan: Admin Panel with Full Content Management

### Phase 1: Enable Lovable Cloud
- Activate Lovable Cloud for database, auth, and edge functions

### Phase 2: Database Schema
Create tables for all editable content:
- `profiles` — admin user profiles
- `user_roles` — role-based access (admin role)
- `site_content` — key-value store for all text content (hero title, about text, etc.)
- `projects` — portfolio projects (title, desc, category, tags, URLs, image)
- `skills` — skills with categories and proficiency levels
- `social_links` — contact/social media links
- `booking_settings` — booking section content

All tables with RLS policies (admin-only write, public read).

### Phase 3: Admin Panel UI
- `/admin/login` — admin login page
- `/admin` — dashboard with sidebar navigation
- `/admin/projects` — CRUD for projects (add/edit/delete)
- `/admin/skills` — manage skills and categories
- `/admin/content` — edit all website text (hero, about, booking sections)
- `/admin/contact` — update social links and contact info
- Auth guard protecting all `/admin/*` routes

### Phase 4: Frontend Integration
- Update all sections (Hero, About, Skills, Projects, Contact, Booking, Footer) to fetch content from the database instead of hardcoded values
- Show fallback/default content while loading

### Notes
- Admin credentials: user signs up and gets manually assigned admin role
- All website text editable via a simple key-value content editor
- This is a multi-step build — I'll implement it incrementally
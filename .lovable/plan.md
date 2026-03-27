

# Plan: Admin-Manageable Social Media Links

## Summary
Create a `social_links` database table so the admin can edit social media URLs from the dashboard. The `FloatingSocial` component will fetch links from the database instead of using hardcoded values.

## Steps

### 1. Database Migration
Create a `social_links` table with columns: `id`, `platform` (whatsapp/facebook/instagram/tiktok), `url`, `is_active`, `updated_at`. Seed it with default placeholder URLs. Add RLS: public SELECT, admin-only UPDATE/INSERT/DELETE.

### 2. Add "Social Links" Tab to Admin Dashboard
- Add a new tab "التواصل الاجتماعي" (social icon) to the admin dashboard tabs list
- Show editable input fields for each platform (WhatsApp, Facebook, Instagram, TikTok)
- Each row shows the platform icon, name, and an editable URL input
- Save button updates all links at once
- Toggle to enable/disable each platform

### 3. Update FloatingSocial Component
- Fetch social links from the `social_links` table on mount
- Replace the hardcoded `socials` array with database-driven data
- Only show active platforms
- Keep the existing icons and colors mapped by platform name
- Fallback to defaults if fetch fails

### Technical Details
- Table schema: `social_links (id uuid PK, platform text UNIQUE, url text, is_active boolean DEFAULT true, updated_at timestamptz DEFAULT now())`
- RLS: `SELECT` for public, `UPDATE/INSERT/DELETE` for admin only
- Seed data inserted via migration for all 4 platforms
- FloatingSocial uses `useEffect` + `useState` to load links, with static fallback


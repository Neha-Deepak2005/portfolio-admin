# Portfolio CMS – Admin Panel (React + Vite + Tailwind)

The custom-built admin dashboard for the Portfolio CMS. It talks to the Flask backend (`../portfolio-backend`) through its REST API, using JWT login.

```bash
copy .env.example .env.local   # Mac/Linux: cp
npm install
npm run dev                    # http://localhost:5173  (backend must be running on :5000)
npm run build                  # production build in dist/
```

Screens: Login, Dashboard, About/Profile, Projects, Skills, Blog Posts, Experience, Education, Testimonials, Services, Social Links, Media Library, Messages, Settings.

**Deploy (Vercel / Netlify):** import this folder and set `VITE_API_URL=https://<your-backend>` and `VITE_SITE_URL=https://<your-portfolio>`. `vercel.json` already handles page refreshes.
Also add the admin URL to `CORS_ORIGINS` in the backend.

# Alex Morgan — Portfolio

A minimalistic, responsive personal portfolio with a cream-colored aesthetic, glass navbar, smooth animations, and a production-ready Node.js/Express backend for the contact form.

---

## 📁 File Structure

```
portfolio/
├── public/               ← Frontend (served as static files)
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server.js             ← Express backend
├── package.json
├── .env.example          ← Copy to .env and fill in values
└── README.md
```

> Move `index.html`, `style.css`, and `script.js` into a `/public` folder before running the backend.

---

## 🚀 Local Development

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your SMTP credentials
```

### 3. Run the dev server
```bash
npm run dev       # uses nodemon for hot reload
# or
npm start         # production mode
```

Visit `http://localhost:3000`

---

## 📧 Contact Form Setup (Gmail SMTP)

1. Enable 2-Factor Authentication on your Gmail account.
2. Generate an **App Password** at [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
3. Set `SMTP_USER` to your Gmail address and `SMTP_PASS` to the App Password in `.env`.

> **Alternative providers:** You can swap `nodemailer` for [Resend](https://resend.com) (free tier, simpler) or [SendGrid](https://sendgrid.com) with minimal changes to `server.js`.

---

## ☁️ Deployment

### Option A: Vercel (Recommended — Free)
Vercel hosts static files and serverless functions perfectly.

1. Move frontend files into `/public`
2. Create `/api/contact.js` (Vercel serverless format):

```js
// api/contact.js
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  // copy the POST /api/contact handler body from server.js here
}
```

3. Deploy:
```bash
npm install -g vercel
vercel login
vercel --prod
```

4. Add env vars in the Vercel dashboard under **Settings → Environment Variables**.

---

### Option B: Railway (Full Node.js — Free tier)

1. Push your project to GitHub.
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub.
3. Set environment variables in the Railway dashboard.
4. Railway auto-detects `npm start` and gives you a public URL.

---

### Option C: Render (Free tier)

1. Push to GitHub.
2. Create a new **Web Service** on [render.com](https://render.com).
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add env vars in the Render dashboard.

---

### Option D: VPS (DigitalOcean / Hetzner)

```bash
# On your server
git clone your-repo
cd portfolio
npm install --production
cp .env.example .env && nano .env

# Run with PM2 (keeps it alive)
npm install -g pm2
pm2 start server.js --name portfolio
pm2 save
pm2 startup
```

Use **Nginx** as a reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then get a free SSL cert with Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 🎨 Customization

### Change your name / details
Edit `index.html` — search for `Alex Morgan` and replace throughout.

### Change the accent color
In `style.css`, update:
```css
--accent-warm: #c8633a; /* change to any color */
```

### Add your photo
Replace the `.image-placeholder` div in `index.html` with:
```html
<img src="/images/your-photo.jpg" alt="Alex Morgan" class="profile-photo" />
```
And add CSS:
```css
.profile-photo { width: 100%; aspect-ratio: 3/4; object-fit: cover; border-radius: 4px; }
```

### Add/remove sections
Each section has an id. Remove the `<section>` block from HTML and the corresponding `<li>` from the navbar.

---

## 🔒 Security Features

- **Helmet.js** — sets secure HTTP headers
- **Rate limiting** — 5 contact submissions per IP per 15 minutes
- **Input validation** — express-validator on all form fields
- **HTML sanitization** — escapeHtml prevents XSS in emails
- **CORS** — locked to your domain via `ALLOWED_ORIGIN`

---

## 📱 Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. Mobile responsive down to 320px.

---

## License

MIT — free to use and adapt for your own portfolio.

// ═══════════════════════════════════════════════════
//   PORTFOLIO BACKEND — server.js
//   Node.js + Express | Contact Form + Rate Limiting
// ═══════════════════════════════════════════════════

require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const path       = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Vercel routes traffic through a proxy, so we must tell Express to trust it
app.set('trust proxy', true);

// ─── MIDDLEWARE ──────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    },
  },
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// Serve the frontend from a /public directory
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  etag: true,
}));

// ─── RATE LIMITER ─────────────────────────────────────
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // max 5 contact submissions per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait 15 minutes and try again.' },
});

const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(globalLimiter);

// ─── NODEMAILER TRANSPORTER ───────────────────────────
// Uses Gmail SMTP — swap out for SendGrid, Resend, etc.
// See .env.example for required env vars.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // use an App Password for Gmail
  },
});

// Verify transporter on startup (non-blocking)
transporter.verify((err) => {
  if (err) {
    console.warn('[Mail] Transporter not ready:', err.message);
  } else {
    console.log('[Mail] SMTP transporter ready ✓');
  }
});

// ─── ROUTES ──────────────────────────────────────────

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Contact form
app.post(
  '/api/contact',
  contactLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 80 })
      .withMessage('Name must be between 2 and 80 characters.'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address.'),
    body('subject')
      .trim()
      .isLength({ min: 3, max: 120 })
      .withMessage('Subject must be between 3 and 120 characters.'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 2000 })
      .withMessage('Message must be between 10 and 2000 characters.'),
  ],
  async (req, res) => {
    // Validate inputs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors.array()[0].msg,
      });
    }

    const { name, email, subject, message } = req.body;
    const toEmail   = process.env.CONTACT_TO_EMAIL   || process.env.SMTP_USER;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || process.env.SMTP_USER;

    // Email to YOU (the portfolio owner)
    const ownerMail = {
      from: `"Portfolio Contact" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      html: `
        <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:2rem;background:#f5f0e8;border-radius:8px;">
          <h2 style="font-size:1.4rem;margin-bottom:1.5rem;color:#1a1a1a;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:0.5rem 0;color:#6b6b6b;width:100px;">From:</td><td style="color:#1a1a1a;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding:0.5rem 0;color:#6b6b6b;">Email:</td><td><a href="mailto:${escapeHtml(email)}" style="color:#c8633a;">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:0.5rem 0;color:#6b6b6b;">Subject:</td><td style="color:#1a1a1a;">${escapeHtml(subject)}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid rgba(26,26,26,0.12);margin:1.5rem 0;" />
          <p style="color:#3a3a3a;line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</p>
          <hr style="border:none;border-top:1px solid rgba(26,26,26,0.12);margin:1.5rem 0;" />
          <p style="font-size:0.75rem;color:#a8a8a8;">Sent from your portfolio contact form · ${new Date().toUTCString()}</p>
        </div>
      `,
    };

    // Auto-reply to the sender
    const autoReply = {
      from: `"Alex Morgan" <${fromEmail}>`,
      to: email,
      subject: `Thanks for reaching out, ${name}!`,
      html: `
        <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:2rem;background:#f5f0e8;border-radius:8px;">
          <h2 style="font-size:1.4rem;margin-bottom:1rem;color:#1a1a1a;">Hey ${escapeHtml(name)},</h2>
          <p style="color:#3a3a3a;line-height:1.7;">Thanks for your message! I've received your inquiry and will get back to you within 1–2 business days.</p>
          <p style="color:#3a3a3a;line-height:1.7;margin-top:1rem;">In the meantime, feel free to check out my work on <a href="https://github.com/alexmorgan" style="color:#c8633a;">GitHub</a>.</p>
          <hr style="border:none;border-top:1px solid rgba(26,26,26,0.12);margin:1.5rem 0;" />
          <p style="color:#6b6b6b;">Best,<br /><strong style="color:#1a1a1a;">Alex Morgan</strong></p>
          <p style="font-size:0.75rem;color:#a8a8a8;margin-top:1rem;">This is an automated reply — please do not reply directly to this email.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(ownerMail);
      await transporter.sendMail(autoReply);

      console.log(`[Contact] Message from ${email} sent successfully.`);
      return res.status(200).json({ message: 'Message sent successfully.' });
    } catch (err) {
      console.error('[Contact] Mail error:', err.message);
      return res.status(500).json({ error: 'Failed to send message. Please try again.' });
    }
  }
);

// Catch-all: serve index.html for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ─── ERROR HANDLER ─────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Error]', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─── START ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n  Portfolio Server running at http://localhost:${PORT}`);
  console.log(`  Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

// ─── HELPERS ───────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

module.exports = app; // for testing

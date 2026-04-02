require('dotenv').config();
const nodemailer = require('nodemailer');

// Helper to escape HTML to prevent XSS in emails
function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: false, // STARTTLS
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

module.exports = async function handler(req, res) {
    // Basic CORS for Vercel
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name, email, subject, message } = req.body;

    // Manual Input Validation
    if (!name || name.trim().length < 2 || name.trim().length > 80) {
        return res.status(400).json({ error: 'Name must be between 2 and 80 characters.' });
    }
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!subject || subject.trim().length < 3 || subject.trim().length > 120) {
        return res.status(400).json({ error: 'Subject must be between 3 and 120 characters.' });
    }
    if (!message || message.trim().length < 10 || message.trim().length > 2000) {
        return res.status(400).json({ error: 'Message must be between 10 and 2000 characters.' });
    }

    const toEmail = process.env.CONTACT_TO_EMAIL || process.env.SMTP_USER;
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
        from: `"Bheshraj Upreti" <${fromEmail}>`,
        to: email,
        subject: `Thanks for reaching out, ${name}!`,
        html: `
        <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:2rem;background:#f5f0e8;border-radius:8px;">
          <h2 style="font-size:1.4rem;margin-bottom:1rem;color:#1a1a1a;">Hey ${escapeHtml(name)},</h2>
          <p style="color:#3a3a3a;line-height:1.7;">Thanks for your message! I've received your inquiry and will get back to you within 1–2 business days.</p>
          <p style="color:#3a3a3a;line-height:1.7;margin-top:1rem;">In the meantime, feel free to check out my work on <a href="https://github.com/Bheshraj-git" style="color:#c8633a;">GitHub</a>.</p>
          <hr style="border:none;border-top:1px solid rgba(26,26,26,0.12);margin:1.5rem 0;" />
          <p style="color:#6b6b6b;">Best Regards,<br /><strong style="color:#1a1a1a;">Bheshraj Upreti</strong></p>
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

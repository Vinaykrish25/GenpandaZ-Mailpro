<<<<<<< HEAD
# 🐼 GenPandaz MailPro

> **AI-Powered Outreach Email Generator for Students & Freelancers**

GenPandaz MailPro is a lightweight, AI-assisted cold email platform built specifically for job seekers, freelancers, and early-stage founders who need high-quality, personalized outreach emails — without the complexity or cost of enterprise tools.

---

## ✨ Features

### ✍️ AI Email Generation
- 9 email modes: **HR Outreach, Client Approach, Reply Generator, Follow Up, LinkedIn Note, Referral Ask, Thank You, Apology, Cold Pitch**
- 4 writing tones: **Formal, Friendly, Bold, Concise**
- Powered by **Groq LLaMA 3.3-70b** (free API)
- AI rewrite tools: **Rewrite, Shorten, Expand, Fix Grammar**
- Spam score indicator before sending

### 📬 Multi-Account Email Sending
- Send from up to **3 Gmail accounts** (Primary, Secondary, Work)
- **CC / BCC** support on every email
- Resume (PDF) attachment support
- Daily send limit tracker (10/day free, 30/day pro)

### 👥 Contact Manager
- Add, edit, delete contacts
- Tag-based segmentation: Job Seeker, Freelance, Client, Referral, General
- Personalization tokens: `{{first_name}}`, `{{company}}`, `{{position}}`
- Data stored locally in `data/contacts.json` — zero database setup

### 📊 Campaigns & Analytics
- Campaign history with open rate tracking
- Deliverability engine dashboard (SPF, DKIM, Bounce Rate, Send Pacing)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| AI | Groq API (LLaMA 3.3-70b-versatile) |
| Email Sending | Nodemailer + Gmail SMTP |
| Storage | JSON file (`data/contacts.json`) |
| Fonts | Syne + Nunito (Google Fonts) |

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/genpandaz-mailpro.git
cd genpandaz-mailpro
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of your project:

```env
# ── AI (Required) ──
GROQ_API_KEY=your_groq_api_key_here

# ── Primary Gmail Account (Required) ──
GMAIL_USER=yourname@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx

# ── Secondary Gmail Account (Optional) ──
GMAIL_USER_2=yourother@gmail.com
GMAIL_APP_PASSWORD_2=xxxx xxxx xxxx xxxx

# ── Work Gmail Account (Optional) ──
GMAIL_USER_3=work@gmail.com
GMAIL_APP_PASSWORD_3=xxxx xxxx xxxx xxxx
```

**Where to get these:**
- **Groq API Key** → [console.groq.com](https://console.groq.com) (free)
- **Gmail App Password** → Google Account → Security → 2-Step Verification → App Passwords

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
genpandaz-mailpro/
├── app/
│   ├── page.tsx                    # Main UI (all tabs + compose)
│   └── api/
│       ├── generate/
│       │   └── route.ts            # Groq AI email generation
│       ├── send/
│       │   └── route.ts            # Nodemailer email sending (CC/BCC/multi-account)
│       └── contacts/
│           └── route.ts            # Contact CRUD API (GET/POST/PUT/DELETE)
├── data/
│   └── contacts.json               # Auto-created on first contact add
├── .env.local                      # Your secrets (never commit this!)
├── .gitignore
└── README.md
```

---

## 🔑 API Routes

| Method | Route | Description |
|---|---|---|
| `POST` | `/api/generate` | Generate email using Groq AI |
| `POST` | `/api/send` | Send email via Gmail (supports CC, BCC, multi-account) |
| `GET` | `/api/contacts` | Fetch all contacts |
| `POST` | `/api/contacts` | Add new contact |
| `PUT` | `/api/contacts` | Update existing contact |
| `DELETE` | `/api/contacts?id=xxx` | Delete a contact |

---

## 📧 Email Modes

| Mode | Use Case |
|---|---|
| HR Outreach | Cold email to recruiter or HR |
| Client Approach | Business proposal to a potential client |
| Reply Generator | Craft a reply to any received email |
| Follow Up | Follow up after no response |
| LinkedIn Note | Short connection request message |
| Referral Ask | Ask a company employee for a referral |
| Thank You | Post-interview thank you note |
| Apology | Professional apology email |
| Cold Pitch | Short punchy cold pitch |

---

## ⚙️ Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for LLaMA AI |
| `GMAIL_USER` | Yes | Primary Gmail address |
| `GMAIL_APP_PASSWORD` | Yes | Primary Gmail App Password |
| `GMAIL_USER_2` | No | Secondary Gmail address |
| `GMAIL_APP_PASSWORD_2` | No | Secondary Gmail App Password |
| `GMAIL_USER_3` | No | Work Gmail address |
| `GMAIL_APP_PASSWORD_3` | No | Work Gmail App Password |

---

## 🔒 Security Notes

- **Never commit `.env.local`** — it is already in `.gitignore`
- Gmail App Passwords are not your regular Gmail password — generate them separately
- `data/contacts.json` is also in `.gitignore` to protect your contact data

---

## 🗺️ Roadmap

- [ ] PostgreSQL database integration
- [ ] Chrome extension for Gmail
- [ ] LinkedIn integration
- [ ] Resume-based AI personalization
- [ ] Follow-up automation scheduler
- [ ] Multi-language email support
- [ ] Email open tracking (pixel)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👨‍💻 Built By

**Prathab Murugan** — Built as part of the GenPandaz MailPro vision for democratizing professional outreach for students and freelancers.

> *"The AI Outreach Assistant for Professional Cold Emails."*
=======
# Genpandazmailpro
>>>>>>> 2d96e00850afcb10145b63626d76adabf72e9d70

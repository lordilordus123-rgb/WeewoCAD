const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const app = express();
const DB_PATH = path.join(__dirname, 'db.json');
const PORT = process.env.PORT || 3000;

// CORS Middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// Helper Functions
function readDB() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { users: [] };
  }
}

function writeDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

// Setup mail transporter from ENV if available
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
}

async function sendVerificationEmail(email, username, token) {
  const confirmUrl = `http://localhost:${PORT}/confirm?token=${token}`;
  const subject = 'WeewooCAD: Bitte E‑Mail bestätigen';
  const text = `Hallo ${username || ''},\n\nbitte bestätige deine E‑Mail mit folgendem Link:\n${confirmUrl}\n\nFalls du dich nicht registriert hast, kannst du diese Nachricht ignorieren.`;

  if (!transporter) {
    console.log('MAIL (dev) -> to:', email);
    console.log('Subject:', subject);
    console.log(text);
    return;
  }

  await transporter.sendMail({
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to: email,
    subject,
    text
  });
}

// API Routes BEFORE static file serving
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) return res.status(400).json({ message: 'Missing fields' });

  // simple email check
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) return res.status(400).json({ message: 'Invalid email' });

  const db = readDB();
  const exists = db.users.find(u => u.username === username || u.email === email);
  if (exists) return res.status(409).json({ message: 'Username or email already in use' });

  const id = Date.now();
  const passwordHash = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(24).toString('hex');
  const tokenExpires = Date.now() + 24 * 3600 * 1000; // 24h
  // Auto-confirm if no mail transporter configured (dev mode)
  const confirmed = !transporter;
  const newUser = { id, username, email, passwordHash, confirmed, verificationToken, tokenExpires };
  db.users.push(newUser);
  writeDB(db);

  // send verification email (don't block response)
  if (transporter) {
    sendVerificationEmail(email, username, verificationToken).catch(err => console.error('Mail error', err));
  }

  return res.status(201).json({ message: 'Registered', confirmed });
});

app.get('/confirm', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Token fehlt');

  const db = readDB();
  const user = db.users.find(u => u.verificationToken === token);
  if (!user) return res.status(400).send('Ungültiger Token');
  if (user.tokenExpires && Date.now() > user.tokenExpires) return res.status(400).send('Token abgelaufen');

  user.confirmed = true;
  delete user.verificationToken;
  delete user.tokenExpires;
  writeDB(db);

  // redirect to server view after confirmation
  return res.redirect('/serverview-index.html');
});

app.post('/login', async (req, res) => {
  const { user, password } = req.body || {};
  if (!user || !password) return res.status(400).json({ message: 'Missing fields' });

  const db = readDB();
  const isEmail = user.includes('@');
  const found = db.users.find(u => (isEmail ? u.email === user : u.username === user));
  if (!found) return res.status(404).json({ message: 'Account nicht gefunden' });

  if (!found.confirmed) return res.status(403).json({ message: 'Bitte bestätige zuerst deine E‑Mail' });

  const ok = await bcrypt.compare(password, found.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Ungültiges Passwort' });

  return res.status(200).json({ message: 'OK' });
});

// Static file serving AFTER API routes
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => console.log(`Server läuft auf http://localhost:${PORT}`));

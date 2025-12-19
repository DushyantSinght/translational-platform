const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5500;
const JWT_SECRET = "super-secret-key"; // ⚠️ move to env in production

// In-memory users (reset when server restarts)
let users = [
  {
    name: "Demo User",
    birthDate: "2000-01-01",
    email: "demo@user.com",
    password: "password123", // plain text for demo only
  },
];

// Health check
app.get("/api/health", (_, res) => {
  res.json({ status: "ok", port: PORT });
});

// ✅ SIGNUP: name + birthDate + email + password
app.post("/api/signup", (req, res) => {
  const { name, birthDate, email, password } = req.body;

  if (!name || !birthDate || !email || !password) {
    return res.status(400).json({
      error: "Name, birth date, email and password are required",
    });
  }

  if (name.trim().length < 3) {
    return res.status(400).json({ error: "Name must be at least 3 characters" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 8) {
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  }

  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  if (!hasLetter || !hasNumber) {
    return res.status(400).json({
      error: "Password must contain at least one letter and one number",
    });
  }

  const birth = new Date(birthDate);
  const now = new Date();
  if (isNaN(birth.getTime()) || birth > now) {
    return res.status(400).json({ error: "Invalid birth date" });
  }
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 13) {
    return res.status(400).json({ error: "You must be at least 13 years old" });
  }

  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = { name, birthDate, email, password };
  users.push(newUser);

  const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: "2h" });
  return res.json({
    token,
    email,
    name,
    birthDate,
    message: "Signup successful",
  });
});

// ✅ LOGIN: email + password
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ error: "Email and password are required" });
  }

  const user = users.find(
    (u) => u.email === email && u.password === password
  );
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = jwt.sign(
    { email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
  return res.json({
    token,
    email: user.email,
    name: user.name,
    birthDate: user.birthDate,
    message: "Login successful",
  });
});

// ✅ AUTH MIDDLEWARE
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { email, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ✅ LibreTranslate Servers
const LIBRE = [
  "https://translate.argosopentech.com/translate",
  "https://libretranslate.de/translate",
];

// ✅ Google Translator (backup unofficial)
async function translateGoogle(text, from, to) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(
      text
    )}`;
    const res = await fetch(url);
    const data = await res.json();
    return data[0].map((x) => x[0]).join("");
  } catch {
    return null;
  }
}

// ✅ LibreTranslate Try
async function translateLibre(url, payload) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      timeout: 5500,
    });
    const data = await res.json();
    return data.translatedText || null;
  } catch {
    return null;
  }
}

// Translation API (PROTECTED)
app.post("/api/translate", authMiddleware, async (req, res) => {
  const { text, source, target } = req.body;

  if (!text) {
    return res.json({ error: "Missing text" });
  }

  const payload = {
    q: text,
    source,
    target,
    format: "text",
  };

  // STEP 1: LIBRE TRY
  for (const server of LIBRE) {
    const out = await translateLibre(server, payload);
    if (out && out !== text) {
      return res.json({ translated: out, api: server, success: true });
    }
  }

  // STEP 2: GOOGLE BACKUP
  const google = await translateGoogle(text, source, target);
  if (google && google !== text) {
    return res.json({
      translated: google,
      api: "Google Fallback",
      success: true,
    });
  }

  // STEP 3: FINAL FAIL
  return res.json({
    translated: `${text} (Translation service unavailable)`,
    success: false,
    api: "all-blocked",
  });
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});

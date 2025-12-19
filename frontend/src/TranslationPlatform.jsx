import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Copy,
  Volume2,
  RotateCw,
  Trash2,
  Globe,
  Clock,
  MessageSquare,
  BookOpen,
} from "lucide-react";

const backendUrl = "http://localhost:5500";

export default function TranslationPlatform() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [isSourceFocused, setIsSourceFocused] = useState(false);
  const [activePage, setActivePage] = useState("translate"); // "translate" | "history" | "about"

  // auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userBirthDate, setUserBirthDate] = useState("");

  const [authMode, setAuthMode] = useState("login"); // "login" | "signup"
  const [authName, setAuthName] = useState("");
  const [authBirthDate, setAuthBirthDate] = useState("");
  const [authEmail, setAuthEmail] = useState("demo@user.com");
  const [authPassword, setAuthPassword] = useState("password123");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authFieldErrors, setAuthFieldErrors] = useState({});

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);


  const recognitionRef = useRef(null);

  // Load history & auth from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("translationHistory");
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }

    const savedToken = localStorage.getItem("authToken");
    const savedEmail = localStorage.getItem("authEmail");
    const savedName = localStorage.getItem("authName");
    const savedBirthDate = localStorage.getItem("authBirthDate");
    if (savedToken) {
      setAuthToken(savedToken);
      setUserEmail(savedEmail || "");
      setUserName(savedName || "");
      setUserBirthDate(savedBirthDate || "");
      setIsLoggedIn(true);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("translationHistory", JSON.stringify(history));
  }, [history]);

  const languages = {
    en: "English",
    hi: "Hindi",
    te: "Telugu",
    ta: "Tamil",
    bn: "Bengali",
    kn: "Kannada",
    ml: "Malayalam",
    mr: "Marathi",
    gu: "Gujarati",
    pa: "Punjabi",
    or: "Odia",
    ur: "Urdu",
    fr: "French",
    de: "German",
    es: "Spanish",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ja: "Japanese",
    zh: "Chinese",
    ko: "Korean",
    ar: "Arabic",
    tr: "Turkish",
    pl: "Polish",
    nl: "Dutch",
    sv: "Swedish",
    uk: "Ukrainian",
    vi: "Vietnamese",
    id: "Indonesian",
    th: "Thai",
    he: "Hebrew",
    el: "Greek",
  };

  // 🔍 validate signup/login form
  const validateAuthForm = () => {
    const errors = {};

    // Name (only for signup)
    if (authMode === "signup") {
      if (!authName.trim()) {
        errors.name = "Name is required";
      } else if (authName.trim().length < 3) {
        errors.name = "Name must be at least 3 characters";
      }
    }

    // Birth date (only for signup)
    if (authMode === "signup") {
      if (!authBirthDate) {
        errors.birthDate = "Birth date is required";
      } else {
        const birth = new Date(authBirthDate);
        const now = new Date();
        if (isNaN(birth.getTime())) {
          errors.birthDate = "Invalid date";
        } else if (birth > now) {
          errors.birthDate = "Birth date cannot be in the future";
        } else {
          let age = now.getFullYear() - birth.getFullYear();
          const m = now.getMonth() - birth.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
            age--;
          }
          if (age < 13) {
            errors.birthDate = "You must be at least 13 years old";
          }
        }
      }
    }

    // Email
    if (!authEmail.trim()) {
      errors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(authEmail.trim())) {
        errors.email = "Enter a valid email address";
      }
    }

    // Password
    if (!authPassword) {
      errors.password = "Password is required";
    } else if (authPassword.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else {
      const hasLetter = /[A-Za-z]/.test(authPassword);
      const hasNumber = /[0-9]/.test(authPassword);
      if (!hasLetter || !hasNumber) {
        errors.password = "Password must contain letters and numbers";
      }
    }

    setAuthFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 🔐 LOGIN / SIGNUP handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthFieldErrors({});

    const isValid = validateAuthForm();
    if (!isValid) return;

    setAuthLoading(true);

    const endpoint =
      authMode === "login" ? "/api/login" : "/api/signup";

    const body = {
      email: authEmail,
      password: authPassword,
    };

    if (authMode === "signup") {
      body.name = authName;
      body.birthDate = authBirthDate;
    }

    try {
      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setAuthError(data.error || "Authentication failed");
        setAuthLoading(false);
        return;
      }

      setAuthToken(data.token);
      setUserEmail(data.email);
      setUserName(data.name || "");
      setUserBirthDate(data.birthDate || "");
      setIsLoggedIn(true);

      localStorage.setItem("authToken", data.token);
      localStorage.setItem("authEmail", data.email || "");
      localStorage.setItem("authName", data.name || "");
      localStorage.setItem("authBirthDate", data.birthDate || "");
    } catch (err) {
      console.error("AUTH ERROR:", err);
      setAuthError("Cannot reach auth server");
    }

    setAuthLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthToken("");
    setUserEmail("");
    setUserName("");
    setUserBirthDate("");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authEmail");
    localStorage.removeItem("authName");
    localStorage.removeItem("authBirthDate");
  };

  // TRANSLATE
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    if (!authToken) {
      setError("Please login first to translate.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${backendUrl}/api/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          text: sourceText,
          source: sourceLang,
          target: targetLang,
        }),
      });

      if (res.status === 401) {
        setError("Session expired or invalid. Please login again.");
        setIsLoggedIn(false);
        setAuthToken("");
        localStorage.removeItem("authToken");
        localStorage.removeItem("authEmail");
        localStorage.removeItem("authName");
        localStorage.removeItem("authBirthDate");
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.translated) {
        setTranslatedText(data.translated);
        if (!data.success) setError("⚠️ Fallback mode – API unavailable");

        const newEntry = {
          id: Date.now(),
          sourceText,
          translatedText: data.translated,
          sourceLang,
          targetLang,
          timestamp: new Date().toLocaleString(),
        };
        setHistory((prev) => [newEntry, ...prev]);
      } else {
        setError(data.error || "❌ Translation failed");
      }
    } catch (err) {
      console.error("TRANSLATE ERROR:", err);
      setError("❌ Backend not reachable");
    }

    setLoading(false);
  };

  // SPEECH INPUT
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setError("Speech not supported");

    if (recognitionRef.current) recognitionRef.current.abort();

    recognitionRef.current = new SR();
    recognitionRef.current.lang = sourceLang;
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.onresult = (e) => {
      setSourceText(e.results[0][0].transcript);
      setLoading(false);
    };
    recognitionRef.current.onstart = () => setLoading(true);
    recognitionRef.current.onend = () => setLoading(false);
    recognitionRef.current.onerror = (e) => {
      setError("Speech recognition error: " + e.error);
      setLoading(false);
    };
    recognitionRef.current.start();
  };

  // SPEAK OUT
  const speak = () => {
    if (!translatedText) return;

    const utter = new SpeechSynthesisUtterance(translatedText);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find((v) =>
      v.lang.toLowerCase().startsWith(targetLang)
    );

    utter.voice = voice || voices[0];
    utter.lang = utter.voice ? utter.voice.lang : targetLang;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  };

  // SWAP
  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText("");
    if (recognitionRef.current) recognitionRef.current.abort();
  };

  const handleHistoryDelete = (id) => {
    setHistory(history.filter((h) => h.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
  };

  return (
    <div className="app-wrapper">
      {/* If NOT logged in, show login/signup card */}
      {!isLoggedIn ? (
        <div className="translation-container">
          <h1 className="header">
            <Globe size={32} className="header-icon" /> TranslateHub
          </h1>
          <p className="subtext">
            {authMode === "login"
              ? "Login to use the translator"
              : "Sign up to start translating"}
          </p>

          {authError && <p className="error-message">{authError}</p>}

          <form onSubmit={handleAuthSubmit} className="login-form">
            {authMode === "signup" && (
              <>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={authName}
                    onChange={(e) => {
                      setAuthName(e.target.value);
                      setAuthFieldErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    className="input-textarea"
                    style={{ minHeight: "auto" }}
                  />
                  {authFieldErrors.name && (
                    <p className="field-error">{authFieldErrors.name}</p>
                  )}
                </div>

                <div className="input-group">
                  <input
                    type="date"
                    placeholder="Birth Date"
                    value={authBirthDate}
                    onChange={(e) => {
                      setAuthBirthDate(e.target.value);
                      setAuthFieldErrors((prev) => ({ ...prev, birthDate: "" }));
                    }}
                    className="input-textarea"
                    style={{ minHeight: "auto", marginTop: "10px" }}
                  />
                  {authFieldErrors.birthDate && (
                    <p className="field-error">{authFieldErrors.birthDate}</p>
                  )}
                </div>
              </>
            )}

            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={authEmail}
                onChange={(e) => {
                  setAuthEmail(e.target.value);
                  setAuthFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                className="input-textarea"
                style={{ minHeight: "auto", marginTop: "10px" }}
              />
              {authFieldErrors.email && (
                <p className="field-error">{authFieldErrors.email}</p>
              )}
            </div>

            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={authPassword}
                onChange={(e) => {
                  setAuthPassword(e.target.value);
                  setAuthFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
                className="input-textarea"
                style={{ minHeight: "auto", marginTop: "10px" }}
              />
              {authFieldErrors.password && (
                <p className="field-error">{authFieldErrors.password}</p>
              )}
            </div>

            <div className="action-buttons">
              <button
                type="submit"
                className="base-button primary-button"
                disabled={authLoading}
              >
                {authLoading
                  ? authMode === "login"
                    ? "Logging in..."
                    : "Signing up..."
                  : authMode === "login"
                  ? "Login"
                  : "Sign Up"}
              </button>
            </div>
          </form>

          <p className="history-empty">
            {authMode === "login" ? (
              <>
                Demo credentials: <br />
                <code>demo@user.com</code> / <code>password123</code>
                <br />
                <br />
                Don&apos;t have an account?{" "}
                <button
                  className="link-button"
                  type="button"
                  onClick={() => {
                    setAuthMode("signup");
                    setAuthError("");
                    setAuthName("");
                    setAuthBirthDate("");
                    setAuthEmail("");
                    setAuthPassword("");
                    setAuthFieldErrors({});
                  }}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="link-button"
                  type="button"
                  onClick={() => {
                    setAuthMode("login");
                    setAuthError("");
                    setAuthEmail("demo@user.com");
                    setAuthPassword("password123");
                    setAuthFieldErrors({});
                  }}
                >
                  Login
                </button>
              </>
            )}
          </p>
        </div>
      ) : (
        <>
          {/* Top Navigation with Logout */}
          <nav className="top-nav">
            <div className="top-nav-left">
              <button
                className={`nav-button ${
                  activePage === "translate" ? "nav-button-active" : ""
                }`}
                onClick={() => setActivePage("translate")}
              >
                <MessageSquare size={18} />
                Translate
              </button>
              <button
                className={`nav-button ${
                  activePage === "history" ? "nav-button-active" : ""
                }`}
                onClick={() => setActivePage("history")}
              >
                <Clock size={18} />
                History
              </button>
              <button
                className={`nav-button ${
                  activePage === "about" ? "nav-button-active" : ""
                }`}
                onClick={() => setActivePage("about")}
              >
                <BookOpen size={18} />
                About
              </button>
            </div>
            <div
  className="top-nav-right user-menu-wrapper"
  onMouseEnter={() => setIsUserMenuOpen(true)}
  onMouseLeave={() => setIsUserMenuOpen(false)}
>
  <button className="user-menu-button">
    {/* Show short text on button: name or email */}
    {userName ? userName.split(" ")[0] : userEmail.split("@")[0]}
  </button>

  {isUserMenuOpen && (
    <div className="user-menu-dropdown">
      <div className="user-menu-line user-menu-main">
        {userName || userEmail}
      </div>
      {userBirthDate && (
        <div className="user-menu-line user-menu-sub">
          DOB: {userBirthDate}
        </div>
      )}
      <button className="user-menu-logout" onClick={handleLogout}>
        Logout
      </button>
    </div>
  )}
</div>
          </nav>

          <div className="translation-container">
            <h1 className="header">
              <Globe size={32} className="header-icon" /> TranslateHub
            </h1>
            <p className="subtext">
              30+ Languages • Idioms • Speech Synthesis
            </p>

            {error && <p className="error-message">{error}</p>}

            {/* PAGE: TRANSLATE */}
            {activePage === "translate" && (
              <>
                <div className="language-selector">
                  <select
                    className="select-lang"
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value)}
                    disabled={loading}
                  >
                    {Object.entries(languages).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={swapLanguages}
                    className="swap-button"
                    title="Swap Languages"
                    disabled={loading}
                  >
                    <RotateCw size={18} />
                  </button>

                  <select
                    className="select-lang"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    disabled={loading}
                  >
                    {Object.entries(languages).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>

                <textarea
                  rows="5"
                  placeholder="Enter text..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  className={`input-textarea ${
                    isSourceFocused ? "input-textarea-focus" : ""
                  }`}
                  onFocus={() => setIsSourceFocused(true)}
                  onBlur={() => setIsSourceFocused(false)}
                  disabled={loading}
                />

                <div className="action-buttons">
                  <button
                    onClick={startListening}
                    className="base-button"
                    title="Start Speech Input"
                    disabled={loading}
                  >
                    <Mic size={20} /> Speak
                  </button>
                  <button
                    onClick={handleTranslate}
                    disabled={loading || !sourceText.trim()}
                    className={`base-button primary-button ${
                      loading ? "disabled-button" : ""
                    }`}
                    title="Translate Text"
                  >
                    {loading ? (
                      "PROCESSING..."
                    ) : (
                      <>
                        <MessageSquare size={20} /> Translate
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows="5"
                  placeholder="Translated text will appear here"
                  value={translatedText}
                  readOnly
                  className="input-textarea translated-textarea"
                />

                <div className="action-buttons">
                  <button
                    onClick={() =>
                      translatedText &&
                      navigator.clipboard.writeText(translatedText)
                    }
                    disabled={!translatedText}
                    className="base-button"
                    title="Copy Translated Text"
                  >
                    <Copy size={20} /> Copy
                  </button>
                  <button
                    onClick={speak}
                    disabled={!translatedText}
                    className="base-button"
                    title="Listen to Translation"
                  >
                    <Volume2 size={20} /> Listen
                  </button>
                </div>
              </>
            )}

            {/* PAGE: HISTORY */}
            {activePage === "history" && (
              <div className="history-section">
                <h2 className="history-header">
                  <BookOpen size={24} /> Translation History
                </h2>
                {history.length === 0 ? (
                  <p className="history-empty">
                    No translations recorded yet. Start translating!
                  </p>
                ) : (
                  <div className="history-list">
                    {history.map((item) => (
                      <div key={item.id} className="history-item">
                        <p className="history-meta">
                          <span>
                            {languages[item.sourceLang]} ➡️{" "}
                            {languages[item.targetLang]}
                          </span>
                          <span className="history-timestamp">
                            <Clock size={14} />
                            {item.timestamp}
                          </span>
                        </p>
                        <p className="history-text history-source-text">
                          Source: {item.sourceText}
                        </p>
                        <p className="history-text history-translated-text">
                          Translation: {item.translatedText}
                        </p>
                        <button
                          onClick={() => handleHistoryDelete(item.id)}
                          className="delete-button"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {history.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="clear-all-button"
                    title="Clear all saved history"
                  >
                    <Trash2 size={16} /> Clear All History
                  </button>
                )}
              </div>
            )}
            {/* PAGE: ABOUT */}
            {activePage === "about" && (
              <div className="about-section">
                <h2>About TranslateHub</h2>
                <p>
                  <strong>TranslateHub</strong> is a secure, full-stack language translation
                  platform designed to provide accurate multilingual translations with
                  speech support and user-specific history tracking.
                  </p>
                  <h3>Key Features</h3>
                  <ul>
                    <li>Multi-language text translation (30+ languages)</li>
                    <li>User authentication with login and signup</li>
                    <li>JWT-based session security</li>
                    <li>Speech-to-text input using browser speech recognition</li>
                    <li>Text-to-speech output for translated content</li>
                    <li>Personal translation history stored locally</li>
                    <li>Fallback translation mechanism for higher reliability</li>
                  </ul>
                  <h3>How the System Works</h3>
                  <ul>
                    <li>
                      Users create an account or log in using email and password credentials.
                      </li>
                      <li>
                        On successful authentication, the backend issues a secure JWT token.
                      </li>
                      <li>
                        All translation requests are protected and require a valid token.
                      </li>
                      <li>
                        The backend first attempts translation via LibreTranslate servers.
                      </li>
                      <li>
                        If unavailable, the system automatically falls back to Google Translate.
                      </li>
                      <li>
                        Translated results are returned to the frontend and displayed instantly.
                      </li>
                      <li>
                        Translation history is saved locally for quick access and review.
                      </li>
                  </ul>
                  <h3>Technology Stack</h3>
                <ul>
                  <li><strong>Frontend:</strong> React.js</li>
                  <li><strong>Backend:</strong> Node.js, Express.js</li>
                  <li><strong>Authentication:</strong> JSON Web Tokens (JWT)</li>
                  <li><strong>APIs:</strong> LibreTranslate, Google Translate (fallback)</li>
                  <li><strong>Browser APIs:</strong> Speech Recognition, Speech Synthesis</li>
                </ul>

                <p className="about-note">
                  This project demonstrates real-world full-stack development practices,
                  including authentication, API integration, error handling, and responsive
                  user experience design.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

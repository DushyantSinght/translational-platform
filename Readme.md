# 🌐 TranslateHub

TranslateHub is a full-stack, secure language translation platform that provides
multi-language text translation with speech support, user authentication, and
personal translation history.

---

## 🚀 Features

- 🌍 Translate text between **30+ languages**
- 🔐 Secure **Login & Signup** with JWT authentication
- 🎙️ **Speech-to-Text** input using browser APIs
- 🔊 **Text-to-Speech** output for translated text
- 🕘 Personal **translation history**
- 🔄 **Fallback translation system** for reliability
- 🧭 Clean multi-page UI (Translate, History, About)

---

## 🧠 How It Works

1. Users sign up or log in using email and password.
2. The backend validates credentials and issues a **JWT token**.
3. All translation requests require a valid token.
4. The backend attempts translation using **LibreTranslate** servers.
5. If unavailable, it automatically falls back to **Google Translate**.
6. The translated result is returned to the frontend.
7. Translation history is stored locally in the browser.

---

## 🏗️ Tech Stack

### Frontend
- React.js
- Lucide Icons
- Web Speech API (Speech Recognition & Synthesis)

### Backend
- Node.js
- Express.js
- JSON Web Tokens (JWT)
- LibreTranslate API
- Google Translate (fallback)

---

TranslateHub/
├── frontend/
│ └── src/
│ ├── TranslationPlatform.jsx
│ ├── styles.css
│ └── main.jsx
│
├── backend/
│ ├── server.js
│ └── package.json
│
└── README.md

---

## 🔐 Authentication

- Signup requires:
  - Full Name
  - Birth Date
  - Email
  - Password
- Password validation:
  - Minimum 8 characters
  - Must contain letters and numbers
- JWT tokens expire automatically for security.

> ⚠️ Passwords are stored in plain text **for demo purposes only**.  
> In production, passwords must be hashed using `bcrypt`.

---

## 🧪 Demo Credentials

Email: demo@user.com

Password: password123


---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/TranslateHub.git
cd TranslateHub

2️⃣ Backend Setup
cd backend
npm install
node server.js


Backend will run on:

http://localhost:5500

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev


Frontend will run on:

http://localhost:5173

📌 API Endpoints
Method	Endpoint	Description
POST	/api/signup	Create new user
POST	/api/login	Authenticate user
POST	/api/translate	Translate text (protected)
GET	/api/health	Server health check
🛡️ Security Notes

JWT used for protected routes

Authorization header required:

Authorization: Bearer <token>


Tokens expire after 2 hours

📈 Future Improvements

Store users and history in a database (MongoDB)

Password hashing with bcrypt

Refresh tokens

Admin dashboard

Rate limiting

Cloud deployment

👨‍💻 Author

Dushyant Singh Tanwar

Full-Stack Developer

MERN Stack | Firebase | Node.js | React.js

📄 License

This project is open-source and available under the MIT License.

<p align="center">
  <img src="https://img.shields.io/badge/SIH-2025-success?style=for-the-badge&logo=government&logoColor=white" alt="SIH 2025"/>
  <img src="https://img.shields.io/badge/Problem-SIH25018-blue?style=for-the-badge" alt="Problem Statement"/>
  <img src="https://img.shields.io/badge/Status-Live%20Prototype-brightgreen?style=for-the-badge" alt="Status"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="License"/>
</p>

<h1 align="center">🏥 RuralCare Connect</h1>

<p align="center">
  <strong>AI-Powered Telemedicine Platform for Rural India</strong><br>
  <em>Bridging the healthcare gap between rural communities and quality medical care</em>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-demo">Demo</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-developer">Developer</a>
</p>

---

## 🎯 Problem Statement

**SIH25018** — *Development of Telemedicine Solutions for Remote and Rural Areas*

> Over 65% of India's population lives in rural areas, yet 80% of doctors are in urban centers. Patients in villages like **Nabha, Punjab** travel 40–100 km for basic consultations, losing wages, time, and sometimes lives. RuralCare Connect solves this by bringing doctors to patients through technology — even on a 2G connection.

---

## ✨ Features

### 🤖 AI-Powered Symptom Checker
- Conversational chatbot powered by an intelligent triage engine
- Assesses symptoms and suggests urgency level (Low / Medium / High / Emergency)
- Recommends specialist type and provides first-aid guidance
- Works entirely offline — no API dependency

### 📹 Video Consultation Engine
- One-click teleconsult with doctors across specialties
- Simulated WebRTC-based video call interface
- In-call controls: mute, camera toggle, screen share, chat
- Auto-generates consultation summary & prescription post-call

### 🗺️ Nearby Doctors & Facility Finder
- Geo-aware search for nearby clinics, PHCs, and hospitals
- Filter by specialty, distance, availability, and rating
- Real-time slot availability and instant booking

### 📋 Patient Portal & Dashboard
- Personalized dashboard with health score (0–100)
- Upcoming appointments tracker with reminders
- Complete health records manager (lab reports, prescriptions, vaccination history)
- Vitals monitoring: Heart Rate, BP, SpO₂, Temperature, Blood Sugar, BMI
- Profile management with medical history

### 🆘 SOS Emergency System
- One-tap emergency activation
- Dispatches nearest ambulance with live ETA
- Auto-shares GPS location with emergency contacts
- Direct helpline connectivity (112 / 108)

### 🌐 Multilingual Support
- Full interface translation: **English, Hindi (हिंदी), Punjabi (ਪੰਜਾਬੀ)**
- One-click language switcher accessible from every page
- All UI labels, buttons, and content translated

### 📱 Low-Bandwidth Mode
- Optimized for 2G/3G networks common in rural India
- Disables animations, reduces image quality, simplifies DOM
- Toggle switch in the header for instant activation

### 🏗️ Modular Architecture
- Clean separation: `index.html` (landing) → `portal.html` (dashboard)
- Independent JS modules for each feature
- Easy to extend with new features or integrate with a backend

---

## 🖥️ Demo

### Landing Page
| Feature | Description |
|---------|-------------|
| **Hero Section** | Animated gradient banner with CTA buttons |
| **AI Chatbot** | Floating chat widget with symptom triage |
| **Doctor Cards** | Specialist profiles with ratings & booking |
| **Stats Counter** | Live animated statistics (patients, villages, consultations) |
| **Testimonials** | Patient success stories carousel |

### Patient Portal
| Tab | Description |
|-----|-------------|
| **Dashboard** | Welcome banner, stats cards, health score ring, vitals grid |
| **Appointments** | Upcoming/past appointments, booking modal with time slots |
| **Health Records** | Lab reports, prescriptions, vaccination timeline |
| **My Profile** | Personal & medical info editor |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Structure** | HTML5 (Semantic) |
| **Styling** | Vanilla CSS3 (Custom Properties, Grid, Flexbox, Animations) |
| **Logic** | Vanilla JavaScript (ES6+) |
| **Typography** | Google Fonts — Plus Jakarta Sans, Fraunces |
| **Icons** | Font Awesome 6.5 |
| **Hosting** | GitHub Pages / Netlify |

> **Zero dependencies. Zero build step. Zero frameworks.**
> Opens directly in any browser — perfect for low-resource environments.

---

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Edge, Safari)
- That's it! No Node.js, no npm, no build tools needed.

### Run Locally

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ruralcare-connect.git

# Navigate to the project
cd ruralcare-connect

# Open in browser (any of these work)
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux
```

### Deploy to GitHub Pages

1. Push code to a GitHub repository
2. Go to **Settings** → **Pages**
3. Set source branch to `main` and folder to `/ (root)`
4. Your site will be live at `https://YOUR_USERNAME.github.io/ruralcare-connect/`

### Deploy to Netlify (Drag & Drop)

1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag your entire project folder onto the page
3. Done! Live URL generated instantly.

---

## 📁 Architecture

```
ruralcare-connect/
│
├── index.html              # 🏠 Main landing page (hero, features, AI chat, doctors)
├── portal.html             # 📊 Patient portal dashboard
│
├── styles.css              # 🎨 Landing page styles (35KB)
├── portal-styles.css       # 🎨 Portal dashboard styles (29KB)
│
├── app.js                  # ⚙️ Main app logic (routing, modals, language switcher)
├── portal.js               # ⚙️ Portal logic (tabs, booking engine, notifications)
├── data.js                 # 📦 App data & multilingual translations (42KB)
│
├── symptom-checker.js      # 🤖 AI symptom triage chatbot engine
├── video-consult.js        # 📹 Video consultation simulator
├── doctors-finder.js       # 🗺️ Doctor search & facility finder
├── emergency.js            # 🆘 SOS emergency system
├── records.js              # 📋 Health records manager
│
├── .github/                # 🔧 GitHub configuration
└── README.md               # 📄 This file
```

---

## 🎨 Design Philosophy

- **Mobile-First** — Designed for the smartphones rural India actually uses
- **Accessible** — High contrast, large touch targets, screen-reader friendly
- **Fast** — No frameworks, no CDN dependencies for core logic, instant load
- **Beautiful** — Glassmorphism, smooth gradients, micro-animations, premium feel
- **Inclusive** — Multilingual (EN/HI/PA), low-bandwidth mode, works offline

---

## 🗺️ Roadmap

- [x] Landing page with hero, features, and footer
- [x] AI Symptom Checker chatbot
- [x] Video Consultation simulator
- [x] Nearby Doctors & Facility Finder
- [x] SOS Emergency System
- [x] Multilingual support (EN / HI / PA)
- [x] Low-bandwidth mode
- [x] Patient Portal with dashboard
- [x] Appointment booking engine
- [x] Health records & prescription manager
- [x] Vaccination timeline
- [ ] Backend API integration (Node.js / Django)
- [ ] Real video calling (WebRTC / Twilio)
- [ ] Database integration (PostgreSQL / Firebase)
- [ ] Push notifications
- [ ] Wearable device sync (IoT vitals)

---

## 🏆 Smart India Hackathon 2025

| Detail | Info |
|--------|------|
| **Problem ID** | SIH25018 |
| **Problem Statement** | Development of Telemedicine Solutions for Remote and Rural Areas |
| **Category** | Software |
| **Theme** | MedTech / BioTech / HealthTech |
| **Target Region** | Nabha, Patiala District, Punjab |
| **Target Users** | Rural patients, ASHA workers, PHC doctors |

---

## 👨‍💻 Developer

<p align="center">
  <strong>Satyajit Mohanty</strong><br>
  <em>Full-Stack Developer & SIH 2025 Participant</em>
</p>

<p align="center">
  <a href="https://github.com/YOUR_USERNAME">
    <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/>
  </a>
  <a href="https://linkedin.com/in/YOUR_LINKEDIN">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/>
  </a>
</p>

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ for Rural India<br>
  <strong>RuralCare Connect</strong> — <em>Healthcare Without Boundaries</em>
</p>

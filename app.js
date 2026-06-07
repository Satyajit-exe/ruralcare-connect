// RuralCare Connect - Central Coordinator Logic (app.js)

// Global Application State
const appState = {
  currentLanguage: 'en',
  currentTheme: 'light',
  isLowBandwidth: false,
  currentView: 'home',
  // Active patient data
  patient: {
    name: "Satyajit Mohanty",
    age: 20,
    gender: "Male",
    location: "Bhubaneswar, Odisha",
    vitalsHistory: [
      { date: "01 Jun", hr: 72, bpSys: 120, bpDia: 80, spo2: 98 },
      { date: "02 Jun", hr: 75, bpSys: 122, bpDia: 81, spo2: 97 },
      { date: "03 Jun", hr: 70, bpSys: 118, bpDia: 79, spo2: 99 },
      { date: "04 Jun", hr: 74, bpSys: 120, bpDia: 80, spo2: 98 },
      { date: "05 Jun", hr: 82, bpSys: 130, bpDia: 85, spo2: 96 },
      { date: "06 Jun", hr: 78, bpSys: 124, bpDia: 82, spo2: 98 },
      { date: "07 Jun", hr: 73, bpSys: 120, bpDia: 80, spo2: 98 }
    ],
    prescriptions: [
      {
        id: "pres-101",
        date: "02 June 2026",
        doctor: "Dr. Sunita Devi",
        specialty: "General Physician",
        diagnosis: "Mild Seasonal Flu",
        medicines: "Tab Paracetamol 650mg (TDS x 3 days), Syr Levocetirizine (HS x 5 days)"
      }
    ]
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Setup view routing based on window URL hash
  window.addEventListener('hashchange', handleRouting);
  handleRouting(); // Initial routing trigger

  // Set event listeners for language dropdown
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }

  // Set event listener for dark mode switch
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Set event listener for low-bandwidth mode switch
  const bandwidthToggle = document.getElementById('bandwidthToggle');
  if (bandwidthToggle) {
    bandwidthToggle.addEventListener('click', toggleBandwidthMode);
  }

  // Register Modal Close Events
  document.querySelectorAll('.modal-close, .modal-overlay').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target === el || el.classList.contains('modal-close')) {
        closeAllModals();
      }
    });
  });

  // Mobile navigation hamburger toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isVisible = navLinks.style.display === 'flex';
      navLinks.style.display = isVisible ? 'none' : 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '72px';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.background = 'var(--card-bg)';
      navLinks.style.padding = '20px';
      navLinks.style.boxShadow = 'var(--shadow)';
    });
  }

  // Set initial rendering translation
  translateDOM();
}

// Single Page Application routing helper
function handleRouting() {
  const hash = window.location.hash.substring(1) || 'home';
  appState.currentView = hash;

  // Deactivate all views and activate current view
  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.remove('active');
  });

  const activeView = document.getElementById(`view-${hash}`);
  if (activeView) {
    activeView.classList.add('active');
    window.scrollTo(0, 0);
  } else {
    // Fallback to home
    document.getElementById('view-home').classList.add('active');
  }

  // Highlight current nav link
  document.querySelectorAll('.nav-links a').forEach(link => {
    const linkHash = link.getAttribute('href').substring(1);
    if (linkHash === hash) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Trigger page-specific initializers if any
  if (hash === 'dashboard' && typeof initDashboard === 'function') {
    initDashboard();
  }
  if (hash === 'emergency' && typeof initEmergencyConsole === 'function') {
    initEmergencyConsole();
  }
}

// Navigate to hash view programmatically
function navigateTo(viewName) {
  window.location.hash = `#${viewName}`;
}

// Translations renderer - translates all elements carrying `data-i18n` attribute
function translateDOM() {
  const lang = appState.currentLanguage;
  const dict = RURALCARE_DATA.translations[lang];

  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (dict && dict[key]) {
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.setAttribute('placeholder', dict[key]);
      } else {
        element.textContent = dict[key];
      }
    }
  });
}

// Language Swapper
function setLanguage(langCode) {
  if (['en', 'hi', 'pb', 'or'].includes(langCode)) {
    appState.currentLanguage = langCode;
    const langSelect = document.getElementById('langSelect');
    if (langSelect) langSelect.value = langCode;
    translateDOM();
    
    // Alert modules about language change
    if (typeof refreshAIAssistant === 'function') refreshAIAssistant();
    if (typeof renderDoctorsList === 'function') renderDoctorsList();
  }
}

// Theme Switcher (Dark / Light Mode)
function toggleTheme() {
  const body = document.body;
  const btn = document.getElementById('themeToggle');
  
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    appState.currentTheme = 'light';
    if (btn) btn.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    body.classList.add('dark-mode');
    appState.currentTheme = 'dark';
    if (btn) btn.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

// Low-Bandwidth Mode Toggler
function toggleBandwidthMode() {
  const body = document.body;
  const btn = document.getElementById('bandwidthToggle');
  
  appState.isLowBandwidth = !appState.isLowBandwidth;
  
  if (appState.isLowBandwidth) {
    body.classList.add('low-bandwidth');
    if (btn) btn.classList.add('active');
    showNotification("Low-Bandwidth Mode Active", "Avatars and background gradients hidden. Consultations restricted to low-data audio/text.");
  } else {
    body.classList.remove('low-bandwidth');
    if (btn) btn.classList.remove('active');
    showNotification("Normal Network Mode Active", "Full audio-video consultation enabled.");
  }
}

// Modal Controllers
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.remove('active');
  });
}

// Simple floating notification engine
function showNotification(title, message) {
  const banner = document.createElement('div');
  banner.style.position = 'fixed';
  banner.style.bottom = '24px';
  banner.style.right = '24px';
  banner.style.background = 'var(--white)';
  banner.style.border = '1.5px solid var(--border)';
  banner.style.padding = '16px 20px';
  banner.style.borderRadius = '16px';
  banner.style.boxShadow = 'var(--shadow-lg)';
  banner.style.zIndex = '1200';
  banner.style.maxWidth = '340px';
  banner.style.animation = 'fadeUp 0.3s ease-out forwards';
  
  banner.innerHTML = `
    <h4 style="font-size:14px;color:var(--green);font-weight:700;margin-bottom:4px;">${title}</h4>
    <p style="font-size:12px;color:var(--text);">${message}</p>
  `;
  
  document.body.appendChild(banner);
  setTimeout(() => {
    banner.style.animation = 'fadeUp 0.3s ease-in reverse forwards';
    setTimeout(() => banner.remove(), 300);
  }, 4000);
}

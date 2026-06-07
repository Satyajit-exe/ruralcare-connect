// RuralCare Connect - Patient Portal Interactive Script (portal.js)

// Patient Data State (Defaulting to Satyajit Mohanty)
const portalState = {
  patient: {
    name: "Satyajit Mohanty",
    id: "RCC-20481",
    healthScore: 82,
    age: 23,
    gender: "Male",
    phone: "9876543210",
    location: "Nabha Rural, Patiala District, Punjab",
    email: "satyajit@gmail.com",
    bloodGroup: "O+",
    allergies: "Sulfonamides, Dust Pollens",
    chronic: "Mild Hypertension"
  },
  
  appointments: [
    {
      id: "appt-1",
      day: "12",
      mon: "Jun",
      year: "2026",
      time: "10:30 AM",
      doctor: "Dr. Harpreet Singh",
      specialty: "Cardiologist",
      type: "📹 Video Call",
      fee: 299,
      status: "Confirmed",
      online: true,
      docId: "doc-1"
    },
    {
      id: "appt-2",
      day: "18",
      mon: "Jun",
      year: "2026",
      time: "2:00 PM",
      doctor: "Dr. Sunita Devi",
      specialty: "General Physician",
      type: "📞 Audio Call",
      fee: 150,
      status: "Pending",
      online: true,
      docId: "doc-2"
    },
    {
      id: "appt-3",
      day: "05",
      mon: "Jun",
      year: "2026",
      time: "11:00 AM",
      doctor: "Dr. Gurpreet Bajwa",
      specialty: "Pediatrician",
      type: "📹 Video Call",
      fee: 200,
      status: "Completed",
      online: true,
      docId: "doc-3"
    }
  ],

  prescriptions: [
    {
      id: "rx-101",
      name: "Metoprolol 25mg + Aspirin 75mg",
      doctor: "Dr. Harpreet Singh",
      date: "5 Jun 2026",
      dosage: "1-0-1 after meals",
      icon: "💊"
    },
    {
      id: "rx-102",
      name: "Paracetamol 500mg + ORS Liquid",
      doctor: "Dr. Sunita Devi",
      date: "28 May 2026",
      dosage: "As needed for fever",
      icon: "🌿"
    },
    {
      id: "rx-103",
      name: "Vitamin D3 + B12 Supplements",
      doctor: "Dr. Gurpreet Bajwa",
      date: "10 May 2026",
      dosage: "Once daily in morning",
      icon: "🩺"
    }
  ],

  records: [
    { name: "Blood Glucose fasting report.pdf", date: "24 May 2026", size: "1.2 MB", type: "lab", icon: "📊" },
    { name: "Chest X-Ray Digital Plate.jpg", date: "12 Apr 2026", size: "3.4 MB", type: "scan", icon: "📷" },
    { name: "Cardiac ECG Waveform chart.pdf", date: "08 Jan 2026", size: "950 KB", type: "cardio", icon: "❤️" }
  ],

  notifications: [
    { id: 1, title: "Upcoming Appointment", desc: "Video consult with Dr. Harpreet Singh tomorrow at 10:30 AM.", time: "1 hour ago", unread: true, icon: "📅", bg: "#EFF6FF", color: "#3B82F6" },
    { id: 2, title: "New Prescription Uploaded", desc: "Dr. Sunita Devi has shared your digital Rx prescription chart.", time: "2 days ago", unread: true, icon: "💊", bg: "#F5F3FF", color: "#8B5CF6" },
    { id: 3, title: "Vaccination Reminder", desc: "Your Hepatitis B booster dose is scheduled for 25th June.", time: "4 days ago", unread: false, icon: "💉", bg: "#FEF3C7", color: "#F59E0B" }
  ],

  selectedDoctorId: null,
  selectedTimeSlot: null
};

// Start portal initialization
document.addEventListener('DOMContentLoaded', () => {
  initPortal();
});

function initPortal() {
  renderPatientData();
  renderAppointmentsList();
  renderPrescriptionsList();
  renderRecordsGrid();
  renderNotificationsList();
  bindProfileForm();
}

// Render dynamic patient state elements
function renderPatientData() {
  const patient = portalState.patient;
  
  // Sidebar elements
  const avatarEl = document.querySelector('.patient-avatar');
  const nameEl = document.querySelector('.patient-info-name');
  const idEl = document.querySelector('.patient-info-id');
  const scoreEl = document.querySelector('.health-score .score');
  
  if (avatarEl) {
    // Generate initials
    const initials = patient.name.split(' ').map(n => n[0]).join('');
    avatarEl.textContent = initials;
  }
  if (nameEl) nameEl.textContent = patient.name;
  if (idEl) idEl.textContent = `ID: ${patient.id}`;
  if (scoreEl) scoreEl.textContent = patient.healthScore;

  // Welcome Header banner in Dashboard tab
  const welcomeBannerHeader = document.querySelector('.welcome-text h2');
  const welcomeBannerText = document.querySelector('.welcome-text p');
  if (welcomeBannerHeader) {
    // Get first name
    const firstName = patient.name.split(' ')[0];
    welcomeBannerHeader.textContent = `Good Morning, ${firstName} 👋`;
  }
  if (welcomeBannerText) {
    welcomeBannerText.innerHTML = `You have ${getUpcomingApptsCount()} upcoming appointments. Your health score is <strong style="color:#A7F3D0">${patient.healthScore}/100</strong> — Great!`;
  }

  // Dashboard Stats card counts
  updateStatsCounters();
}

function getUpcomingApptsCount() {
  return portalState.appointments.filter(a => a.status === 'Confirmed' || a.status === 'Pending').length;
}

function updateStatsCounters() {
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards.length >= 4) {
    // 1. Appointments Count
    statCards[0].querySelector('.val').textContent = getUpcomingApptsCount();
    // 2. Active Prescriptions Count
    statCards[1].querySelector('.val').textContent = portalState.prescriptions.length;
    // 3. Health Records Count
    statCards[2].querySelector('.val').textContent = portalState.records.length;
  }
}

// Render appointments to dashboard view and appointments tab
function renderAppointmentsList() {
  const dashContainer = document.querySelector('#tab-dashboard .card:nth-of-type(1) .card-body');
  const apptTabContainer = document.querySelector('#tab-appointments');

  // Render to Dashboard Panel list
  if (dashContainer) {
    const activeAppts = portalState.appointments.slice(0, 3); // Take top 3
    dashContainer.innerHTML = activeAppts.map(a => {
      const statusClass = a.status === 'Confirmed' ? 'status-confirmed' : a.status === 'Pending' ? 'status-pending' : 'status-completed';
      return `
        <div class="appt-item">
          <div class="appt-date-box" style="${a.status === 'Completed' ? 'background:#F1F5F9;' : ''}">
            <span class="day" style="${a.status === 'Completed' ? 'color:var(--text-3);' : ''}">${a.day}</span>
            <span class="mon" style="${a.status === 'Completed' ? 'color:var(--text-3);' : ''}">${a.mon}</span>
          </div>
          <div class="appt-doctor-avatar" style="${a.status === 'Completed' ? 'background:#F5F3FF;' : ''}">👨‍⚕️</div>
          <div class="appt-info">
            <div class="appt-doc-name">${a.doctor}</div>
            <div class="appt-spec">${a.specialty} · ${a.type}</div>
            <div class="appt-time"><i class="fas fa-clock" style="color:var(--text-3)"></i> ${a.time}</div>
          </div>
          <span class="appt-status ${statusClass}">${a.status}</span>
          ${a.status === 'Confirmed' ? 
            `<button onclick="joinSimulatedVideoCall('${a.docId}')" class="join-btn"><i class="fas fa-video"></i> Join</button>` : ''
          }
        </div>
      `;
    }).join('');
  }

  // Render to Appointments Tab View
  if (apptTabContainer) {
    // Keep filter bar intact at the top
    const filterHeader = `
      <div class="appt-filters">
        <button class="filter-tab active" onclick="filterAppointmentsTab('All', this)">All</button>
        <button class="filter-tab" onclick="filterAppointmentsTab('Upcoming', this)">Upcoming</button>
        <button class="filter-tab" onclick="filterAppointmentsTab('Completed', this)">Completed</button>
        <button class="book-appt-btn" onclick="openBookingModal()">
          <i class="fas fa-plus"></i> Book New Appointment
        </button>
      </div>
      <div id="apptTabList"></div>
    `;
    
    apptTabContainer.innerHTML = filterHeader;
    renderFilteredAppointments('All');
  }
}

function renderFilteredAppointments(filterType) {
  const container = document.getElementById('apptTabList');
  if (!container) return;

  const filtered = portalState.appointments.filter(a => {
    if (filterType === 'All') return true;
    if (filterType === 'Upcoming') return a.status === 'Confirmed' || a.status === 'Pending';
    if (filterType === 'Completed') return a.status === 'Completed';
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:40px; background:white; border-radius:16px; border:1px solid var(--border); color:var(--text-3)">
        <i class="far fa-calendar-times" style="font-size:36px; margin-bottom:10px;"></i>
        <h4>No appointments match this filter.</h4>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(a => {
    const statusClass = a.status === 'Confirmed' ? 'status-confirmed' : a.status === 'Pending' ? 'status-pending' : 'status-completed';
    return `
      <div class="appt-full-card" style="${a.status === 'Completed' ? 'opacity:0.75;' : ''}">
        <div class="appt-full-date">
          <span class="big-day">${a.day}</span>
          <span class="month-yr">${a.mon} ${a.year}</span>
        </div>
        <div class="appt-divider"></div>
        <div style="font-size:28px">👨‍⚕️</div>
        <div class="appt-full-info">
          <div class="appt-full-doctor">${a.doctor} — ${a.specialty}</div>
          <div class="appt-full-meta">
            <span><i class="fas fa-clock"></i> ${a.time}</span>
            <span><i class="fas fa-video"></i> ${a.type}</span>
            <span><i class="fas fa-rupee-sign"></i> ₹${a.fee}</span>
          </div>
          <div class="appt-type-tag" style="${a.status === 'Completed' ? 'background:#F1F5F9; color:var(--text-3);' : ''}">${a.type}</div>
        </div>
        <div>
          <span class="appt-status ${statusClass}" style="display:block; margin-bottom:10px; text-align:center;">${a.status}</span>
        </div>
        <div class="appt-full-actions">
          ${a.status === 'Confirmed' ? 
            `<button onclick="joinSimulatedVideoCall('${a.docId}')" class="btn-sm btn-sm-primary"><i class="fas fa-video"></i> Join Now</button>` : ''
          }
          ${a.status !== 'Completed' ? 
            `<button onclick="cancelAppointment('${a.id}')" class="btn-sm btn-sm-danger"><i class="fas fa-times"></i> Cancel</button>` : 
            `<button onclick="reprintPrescription('${a.id}')" class="btn-sm btn-sm-outline"><i class="fas fa-print"></i> Prescription</button>`
          }
        </div>
      </div>
    `;
  }).join('');
}

function filterAppointmentsTab(filter, btn) {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderFilteredAppointments(filter);
}

// simulated video consultation launcher
function joinSimulatedVideoCall(docId) {
  alert("Redirecting to Telehealth Call Room...");
  // Redirect to main site call view
  window.location.href = `index.html#consultation`;
}

function cancelAppointment(apptId) {
  if (confirm("Are you sure you want to cancel this appointment?")) {
    portalState.appointments = portalState.appointments.filter(a => a.id !== apptId);
    renderAppointmentsList();
    renderPatientData();
    showCustomNotification("Appointment Cancelled", "The slot has been cleared successfully.");
  }
}

// Render active prescriptions list
function renderPrescriptionsList() {
  const container = document.querySelector('#tab-dashboard .card:nth-of-type(2) .card-body');
  if (!container) return;

  container.innerHTML = portalState.prescriptions.map(rx => {
    return `
      <div class="prescription-item">
        <div class="rx-icon">${rx.icon}</div>
        <div class="rx-info">
          <div class="rx-name">${rx.name}</div>
          <div class="rx-dose">${rx.doctor} · ${rx.date} · ${rx.dosage}</div>
        </div>
        <div onclick="reprintPrescription('${rx.id}')" class="rx-download" title="Print prescription"><i class="fas fa-print"></i></div>
      </div>
    `;
  }).join('');
}

function reprintPrescription(rxId) {
  alert(`Printing Prescription ${rxId}...\nGenerating clean PDF layout.`);
  window.print();
}

// Render dynamic health record grids
function renderRecordsGrid() {
  const container = document.getElementById('recordsTabGrid');
  const timeline = document.getElementById('recordsVaccineTimeline');

  // Populate records grid
  if (container) {
    container.innerHTML = portalState.records.map(r => {
      let iconBg = '#EFF6FF';
      if (r.type === 'scan') iconBg = '#FFF1F2';
      if (r.type === 'cardio') iconBg = '#F5F3FF';

      return `
        <div class="record-card">
          <div class="record-type-icon" style="background:${iconBg}">${r.icon}</div>
          <div class="record-title">${r.name}</div>
          <div class="record-meta">Lab Report PDF<br>Uploaded on ${r.date} · ${r.size}</div>
          <div class="record-footer">
            <span class="record-date"><i class="far fa-calendar"></i> ${r.date}</span>
            <div class="record-actions">
              <button onclick="alert('Viewing report ${r.name}')" class="record-btn" title="View"><i class="fas fa-eye"></i></button>
              <button onclick="alert('Downloading report')" class="record-btn" title="Download"><i class="fas fa-download"></i></button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Populate vaccination timeline mock
  if (timeline) {
    const vaccines = [
      { name: "Hepatitis B Booster Dose", date: "Due by 25 Jun 2026", done: false },
      { name: "Influenza Seasonal Dose", date: "Administered on 20 May 2026", done: true },
      { name: "Tetanus Toxoid (TT)", date: "Administered on 10 Jan 2026", done: true },
      { name: "Covid Booster (Precautionary)", date: "Administered on 14 Aug 2025", done: true }
    ];

    timeline.innerHTML = vaccines.map(v => {
      return `
        <div class="vaccine-item">
          <div class="vaccine-dot ${v.done ? 'dot-done' : 'dot-pending'}">
            ${v.done ? '✓' : '⏰'}
          </div>
          <div class="vaccine-info">
            <div class="vaccine-name">${v.name}</div>
            <div class="vaccine-date">${v.date}</div>
            <span class="vaccine-tag ${v.done ? 'tag-done' : 'tag-due'}">${v.done ? 'Completed' : 'Upcoming'}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

function handlePortalFileUpload() {
  const fileName = prompt("Enter description for new medical record (e.g. Lipid Profile):");
  if (!fileName) return;

  const newRec = {
    name: `${fileName}.pdf`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    size: "620 KB",
    type: "lab",
    icon: "📊"
  };

  portalState.records.unshift(newRec);
  renderRecordsGrid();
  renderPatientData();
  showCustomNotification("Document Uploaded", "Document successfully encrypted and saved to your health vault.");
}

// Render notifications slide drawer items
function renderNotificationsList() {
  const container = document.getElementById('notifPanelList');
  const badge = document.querySelector('.notif-dot');
  const navBadge = document.querySelector('.nav-badge');

  if (container) {
    container.innerHTML = portalState.notifications.map(n => {
      return `
        <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="markNotificationRead(${n.id})">
          <div class="notif-icon" style="background:${n.bg}; color:${n.color};">${n.icon}</div>
          <div>
            <div class="notif-text-title">${n.title}</div>
            <div class="notif-text-desc">${n.desc}</div>
            <div class="notif-time">${n.time}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Count unread
  const unreadCount = portalState.notifications.filter(n => n.unread).length;
  if (badge) badge.style.display = unreadCount > 0 ? 'block' : 'none';
  if (navBadge) navBadge.textContent = unreadCount;
}

function markNotificationRead(id) {
  const notif = portalState.notifications.find(n => n.id === id);
  if (notif && notif.unread) {
    notif.unread = false;
    renderNotificationsList();
  }
}

function clearAllNotifications() {
  portalState.notifications.forEach(n => n.unread = false);
  renderNotificationsList();
  showCustomNotification("Cleared", "All notifications marked as read.");
}

// Form logic to save profile fields
function bindProfileForm() {
  const p = portalState.patient;
  
  // Set default values in fields
  setInputVal('profName', p.name);
  setInputVal('profAge', p.age);
  setInputVal('profGender', p.gender);
  setInputVal('profPhone', p.phone);
  setInputVal('profEmail', p.email);
  setInputVal('profBlood', p.bloodGroup);
  setInputVal('profLoc', p.location);
  setInputVal('profAllergies', p.allergies);
  setInputVal('profChronic', p.chronic);

  // Bind Submit event
  const form = document.getElementById('profileForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Update state
      p.name = getInputVal('profName');
      p.age = parseInt(getInputVal('profAge'));
      p.gender = getInputVal('profGender');
      p.phone = getInputVal('profPhone');
      p.email = getInputVal('profEmail');
      p.bloodGroup = getInputVal('profBlood');
      p.location = getInputVal('profLoc');
      p.allergies = getInputVal('profAllergies');
      p.chronic = getInputVal('profChronic');

      // Update UI elements
      renderPatientData();
      showCustomNotification("Profile Saved", "Personal medical file has been updated.");
    });
  }
}

function setInputVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
function getInputVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

// Dynamic Client-side Navigation Router
function showTab(tabId, el) {
  // 1. Deactivate all tabs content
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // 2. Activate target tab content
  const target = document.getElementById(`tab-${tabId}`);
  if (target) {
    target.classList.add('active');
  }

  // 3. Update active sidebar item styling
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  if (el) {
    el.classList.add('active');
  }

  // 4. Update page title
  const titleEl = document.getElementById('pageTitle');
  if (titleEl) {
    titleEl.textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1);
  }

  closeSidebar();
}

// Sidebars drawer switches
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebarOverlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('open');
}

// Notification slide panels switches
function toggleNotif() {
  document.getElementById('notifPanel').classList.toggle('open');
}

// Appointment booking overlay modals logic
function openBookingModal() {
  const modal = document.getElementById('bookingModal');
  if (!modal) return;

  modal.classList.add('open');
  renderBookingModalDoctors();
}

function closeModal() {
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.classList.remove('open');
    portalState.selectedDoctorId = null;
    portalState.selectedTimeSlot = null;
  }
}

function renderBookingModalDoctors() {
  const container = document.getElementById('bookingModalDoctorList');
  if (!container) return;

  // Render online doctors from main database
  const onlineDocs = RURALCARE_DATA.doctors.filter(d => d.online);

  container.innerHTML = onlineDocs.map(d => {
    const isSelected = portalState.selectedDoctorId === d.id ? 'selected' : '';
    return `
      <div class="doc-select-item ${isSelected}" onclick="selectBookingDoctor('${d.id}')">
        <div class="doc-sel-avatar" style="background:#E0F2FE;">👨‍⚕️</div>
        <div>
          <div class="doc-sel-name">${d.name}</div>
          <div class="doc-sel-spec">${d.specialty} · ${d.experience} yrs exp</div>
        </div>
        <div class="doc-sel-fee">₹${d.fee}</div>
      </div>
    `;
  }).join('');
}

function selectBookingDoctor(docId) {
  portalState.selectedDoctorId = docId;
  renderBookingModalDoctors();
  renderBookingModalTimeSlots();
}

function renderBookingModalTimeSlots() {
  const container = document.getElementById('bookingModalTimeSlots');
  if (!container) return;

  if (!portalState.selectedDoctorId) {
    container.innerHTML = `<div style="grid-column:1/-1; text-align:center; font-size:12px; color:var(--text-3); padding:10px;">Select a doctor first.</div>`;
    return;
  }

  const slots = [
    { time: "09:00 AM", available: true },
    { time: "10:30 AM", available: false },
    { time: "11:00 AM", available: true },
    { time: "01:30 PM", available: true },
    { time: "03:00 PM", available: true },
    { time: "04:30 PM", available: false }
  ];

  container.innerHTML = slots.map(s => {
    if (!s.available) {
      return `<div class="time-slot unavailable">${s.time}</div>`;
    }
    const isSelected = portalState.selectedTimeSlot === s.time ? 'selected' : '';
    return `<div class="time-slot ${isSelected}" onclick="selectBookingTimeSlot('${s.time}')">${s.time}</div>`;
  }).join('');
}

function selectBookingTimeSlot(time) {
  portalState.selectedTimeSlot = time;
  renderBookingModalTimeSlots();
}

// Complete appointment creation
function confirmAppointmentBooking() {
  if (!portalState.selectedDoctorId || !portalState.selectedTimeSlot) {
    alert("Please choose both a doctor and an available time slot first.");
    return;
  }

  const doc = RURALCARE_DATA.doctors.find(d => d.id === portalState.selectedDoctorId);
  if (!doc) return;

  const date = new Date();
  date.setDate(date.getDate() + 2); // Book for 2 days later

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const newAppt = {
    id: `appt-${Math.floor(100 + Math.random() * 900)}`,
    day: String(date.getDate()).padStart(2, '0'),
    mon: monthNames[date.getMonth()],
    year: String(date.getFullYear()),
    time: portalState.selectedTimeSlot,
    doctor: doc.name,
    specialty: doc.specialty,
    type: "📹 Video Call",
    fee: doc.fee,
    status: "Confirmed",
    online: true,
    docId: doc.id
  };

  // Push to local list
  portalState.appointments.unshift(newAppt);

  // Update DOM lists
  renderAppointmentsList();
  renderPatientData();
  closeModal();

  showCustomNotification("Appointment Booked", `Consultation confirmed with ${doc.name} at ${newAppt.time}.`);
}

function showCustomNotification(title, message) {
  // Alert simple browser toaster
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
  banner.style.animation = 'fadeIn 0.3s ease-out forwards';
  
  banner.innerHTML = `
    <h4 style="font-size:14px; color:var(--green); font-weight:700; margin-bottom:4px;">${title}</h4>
    <p style="font-size:12px; color:var(--text-2);">${message}</p>
  `;
  
  document.body.appendChild(banner);
  setTimeout(() => {
    banner.style.animation = 'fadeIn 0.3s ease-in reverse forwards';
    setTimeout(() => banner.remove(), 300);
  }, 4000);
}

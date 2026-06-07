// RuralCare Connect - Doctor Finder Directory Module (doctors-finder.js)

let activeCategoryFilter = "All";

document.addEventListener('DOMContentLoaded', () => {
  initDoctorFinder();
});

function initDoctorFinder() {
  const specTabsContainer = document.getElementById('searchSpecTabs');
  const searchInput = document.getElementById('searchDirectoryInput');
  const locationInput = document.getElementById('searchDirectoryLocation');
  const langSelect = document.getElementById('searchDirectoryLang');
  const searchBtn = document.getElementById('searchDirectoryBtn');

  // Bind directory search controls
  if (searchBtn) {
    searchBtn.addEventListener('click', filterDoctors);
  }
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') filterDoctors();
    });
  }

  // Initialize specialty filters click handlers
  if (specTabsContainer) {
    specTabsContainer.querySelectorAll('.spec-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        specTabsContainer.querySelectorAll('.spec-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        activeCategoryFilter = e.target.textContent.trim();
        filterDoctors();
      });
    });
  }

  // Initial draw
  renderDoctorsList(RURALCARE_DATA.doctors);
}

// Render dynamic list cards
function renderDoctorsList(list) {
  const container = document.getElementById('doctorsDirectoryGrid');
  if (!container) return;

  const lang = appState.currentLanguage;

  if (list.length === 0) {
    container.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--muted);">
        <i class="fas fa-user-md-slash" style="font-size:40px; margin-bottom:12px;"></i>
        <h4>No doctors match your criteria in Nabha sector.</h4>
        <p style="font-size:13px; margin-top:4px;">Try modifying search terms or selecting 'All Languages'.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(d => {
    return `
      <div class="doctor-card">
        <div class="dc-top">
          <div class="dc-avatar" style="background:#E0F2FE">
            <span class="doctor-avatar-fallback" style="display:none;">🏥</span>
            ${d.avatar}
          </div>
          <div>
            <div class="dc-name">${d.name}</div>
            <div class="dc-spec">${d.specialty}</div>
            <div class="dc-exp">${d.experience} yrs experience</div>
          </div>
          <div class="dc-badge ${d.online ? 'badge-online' : 'badge-offline'}">
            ${d.online ? '🟢 Online' : '🔴 Offline'}
          </div>
        </div>
        <div class="dc-stats">
          <div class="dc-stat"><i class="fas fa-star star"></i> ${d.rating}</div>
          <div class="dc-stat"><i class="fas fa-users"></i> ${d.patients} patients</div>
        </div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:8px; display:flex; gap:4px; align-items:center;">
          <i class="fas fa-language" style="color:var(--green)"></i>
          <span>Languages: <strong>${d.languages.join(', ')}</strong></span>
        </div>
        <div style="font-size:12px; color:var(--muted); margin-bottom:12px;">
          <i class="fas fa-hospital" style="color:var(--green)"></i> ${d.clinic}
        </div>
        <div class="dc-fee" style="margin-top:auto;">
          Consultation fee: <strong>₹${d.fee}</strong>
        </div>
        <button onclick="handleDoctorBookingClick('${d.id}')" class="dc-book-btn" ${d.online ? '' : 'style="background:var(--muted);"'}>
          ${d.online ? 'Book Appointment' : 'Leave Voice Message'}
        </button>
      </div>
    `;
  }).join('');
}

// Filter engine for Doctor finder search-box & tabs
function filterDoctors() {
  const queryInput = document.getElementById('searchDirectoryInput');
  const query = queryInput ? queryInput.value.toLowerCase().trim() : '';

  const locationInput = document.getElementById('searchDirectoryLocation');
  const locQuery = locationInput ? locationInput.value.toLowerCase().trim() : '';

  const langSelect = document.getElementById('searchDirectoryLang');
  const selectedLang = langSelect ? langSelect.value : 'All Languages';

  const filtered = RURALCARE_DATA.doctors.filter(d => {
    // 1. Specialty tab check
    if (activeCategoryFilter !== "All" && d.specialty !== activeCategoryFilter) {
      return false;
    }

    // 2. Query search input match (specialty, name, clinic)
    const matchesQuery = !query || 
      d.name.toLowerCase().includes(query) || 
      d.specialty.toLowerCase().includes(query) || 
      d.clinic.toLowerCase().includes(query);

    // 3. Location matching
    const matchesLoc = !locQuery || d.clinic.toLowerCase().includes(locQuery);

    // 4. Language match
    const matchesLang = selectedLang === 'All Languages' || d.languages.includes(selectedLang);

    return matchesQuery && matchesLoc && matchesLang;
  });

  renderDoctorsList(filtered);
}

// Booking click flow
function handleDoctorBookingClick(doctorId) {
  const doc = RURALCARE_DATA.doctors.find(d => d.id === doctorId);
  if (!doc) return;

  if (!doc.online) {
    showNotification("Doctor Offline", `Voice message recording system engaged. Doctors will call back via SMS link.`);
    return;
  }

  // Populate appointment verification modal
  const modal = document.getElementById('modalAppointment');
  if (modal) {
    modal.innerHTML = `
      <div class="modal-content">
        <button class="modal-close" onclick="closeAllModals()">&times;</button>
        <h3 style="color:var(--green); font-size:20px; font-weight:800; margin-bottom:12px;">Confirm Telehealth Appointment</h3>
        
        <div style="display:flex; align-items:center; gap:12px; border:1px solid var(--border); padding:12px; border-radius:12px; margin-bottom:20px; background:var(--bg);">
          <span style="font-size:32px;">${doc.avatar}</span>
          <div>
            <h4 style="font-size:14px; font-weight:700;">${doc.name}</h4>
            <p style="font-size:12px; color:var(--muted);">${doc.specialty}</p>
            <p style="font-size:11px; color:var(--green); font-weight:600; margin-top:2px;">Online Consultation Slot Ready</p>
          </div>
        </div>

        <div style="margin-bottom:20px;">
          <label style="font-size:12px; font-weight:600; display:block; margin-bottom:6px;">Select Language for consultation:</label>
          <select id="bookingLangSel" style="width:100%; padding:10px; border:1.5px solid var(--border); border-radius:8px; outline:none; background:var(--bg);">
            ${doc.languages.map(l => `<option value="${l}">${l}</option>`).join('')}
          </select>
        </div>

        <div style="margin-bottom:24px; font-size:12px; color:var(--muted); line-height:1.5;">
          * Telehealth session operates in low-bandwidth WebRTC mode if enabled.<br>
          * Consultation fee of <strong>₹${doc.fee}</strong> is covered under Nabha rural clinical health grants.
        </div>

        <div style="display:flex; gap:10px;">
          <button onclick="confirmAppointmentBooking('${doc.id}')" class="btn-primary" style="flex:1; justify-content:center;">Confirm & Launch Call</button>
          <button onclick="closeAllModals()" class="btn-outline" style="flex:1; justify-content:center;">Cancel</button>
        </div>
      </div>
    `;

    openModal('modalAppointment');
  }
}

function confirmAppointmentBooking(doctorId) {
  closeAllModals();
  // Join the telehealth session
  if (typeof joinConsultationRoom === 'function') {
    joinConsultationRoom(doctorId);
  }
}

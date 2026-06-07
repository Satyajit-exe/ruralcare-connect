// RuralCare Connect - Emergency SOS Console Module (emergency.js)

let audioContext = null;
let sirenOscillator = null;
let sirenVolume = null;
let sirenTimer = null;
let ambulanceTrackTimer = null;

// Initialize Emergency Console components
function initEmergencyConsole() {
  renderEmergencyHospitals();
  simulateAmbulanceTracker();
}

// Play a simulated SOS siren using the HTML5 Web Audio API
function toggleEmergencySiren(btn) {
  if (sirenOscillator) {
    // Stop siren
    stopSiren();
    if (btn) {
      btn.innerHTML = '<i class="fas fa-volume-up"></i> Play Alarm Siren';
      btn.style.background = 'var(--green)';
    }
  } else {
    // Start siren
    startSiren();
    if (btn) {
      btn.innerHTML = '<i class="fas fa-volume-mute"></i> Mute Alarm Siren';
      btn.style.background = 'var(--emergency)';
    }
  }
}

function startSiren() {
  try {
    // Initialize Web Audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create oscillator and gain node
    sirenOscillator = audioContext.createOscillator();
    sirenVolume = audioContext.createGain();
    
    sirenOscillator.type = 'sawtooth';
    sirenVolume.gain.setValueAtTime(0.08, audioContext.currentTime); // Low safe volume
    
    sirenOscillator.connect(sirenVolume);
    sirenVolume.connect(audioContext.destination);
    
    sirenOscillator.start();

    // Fluctuate frequency to sound like a warning siren
    let high = true;
    sirenTimer = setInterval(() => {
      if (!sirenOscillator) return;
      // Siren wobble: oscillate between 600Hz and 1000Hz
      sirenOscillator.frequency.setValueAtTime(high ? 1000 : 600, audioContext.currentTime);
      sirenOscillator.frequency.exponentialRampToValueAtTime(high ? 600 : 1000, audioContext.currentTime + 0.4);
      high = !high;
    }, 450);

    showNotification("SOS Alarm Active", "Siren warning sounding locally. Emergency responders have been pinged with your location.");
  } catch (error) {
    console.error("Audio Context not supported in browser", error);
  }
}

function stopSiren() {
  if (sirenTimer) {
    clearInterval(sirenTimer);
    sirenTimer = null;
  }
  if (sirenOscillator) {
    sirenOscillator.stop();
    sirenOscillator.disconnect();
    sirenOscillator = null;
  }
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

// Render local Nabha hospitals
function renderEmergencyHospitals() {
  const container = document.getElementById('sosHospitalList');
  if (!container) return;

  const lang = appState.currentLanguage;

  container.innerHTML = RURALCARE_DATA.hospitals.map(h => {
    const isCritical = h.beds <= 8;
    return `
      <div class="sos-hospital-card">
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div>
            <h4 style="font-size:15px; font-weight:700; color:var(--dark);">${h.name}</h4>
            <p style="font-size:12px; color:var(--muted); margin-top:2px;"><i class="fas fa-map-marker-alt"></i> ${h.location} (${h.distance} km)</p>
          </div>
          <a href="tel:${h.phone}" class="btn-outline" style="padding:6px 12px; font-size:12px; display:inline-flex; align-items:center; gap:4px; border-color:var(--emergency); color:var(--emergency);"><i class="fas fa-phone"></i> Call</a>
        </div>
        <div class="hospital-beds">
          <div class="bed-badge available">
            <strong>${h.beds}</strong> General Beds Avail.
          </div>
          <div class="bed-badge ${isCritical ? 'critical' : 'available'}">
            <strong>${h.icus}</strong> ICU Beds Avail.
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Simulate Ambulance Tracker progress
function simulateAmbulanceTracker() {
  const ambulanceIcon = document.getElementById('mapAmbulanceIcon');
  const trackerText = document.getElementById('ambTrackerText');
  const progressBar = document.getElementById('ambTrackerProgress');

  if (!ambulanceIcon || !trackerText || !progressBar) return;

  if (ambulanceTrackTimer) clearInterval(ambulanceTrackTimer);

  // Simulated coordinate bounds for ambulance route (Nabha outer sectors to target)
  const route = [
    { bottom: 200, right: 300, text: "Ambulance dispatched from Nabha Civil Hospital. Est: 10 mins.", pct: 10 },
    { bottom: 170, right: 240, text: "Ambulance passing Circular Road. Est: 7 mins.", pct: 35 },
    { bottom: 130, right: 180, text: "Ambulance entering Nabha Rural bypass. Est: 4 mins.", pct: 60 },
    { bottom: 90, right: 100, text: "Ambulance approaching village square. Est: 2 mins.", pct: 85 },
    { bottom: 50, right: 50, text: "Ambulance arrived at patient location.", pct: 100 }
  ];

  let step = 0;
  
  // Set initial position
  updateAmbulanceDOM(route[0]);

  ambulanceTrackTimer = setInterval(() => {
    step++;
    if (step >= route.length) {
      clearInterval(ambulanceTrackTimer);
      return;
    }
    updateAmbulanceDOM(route[step]);
  }, 5000);
}

function updateAmbulanceDOM(pt) {
  const ambulanceIcon = document.getElementById('mapAmbulanceIcon');
  const trackerText = document.getElementById('ambTrackerText');
  const progressBar = document.getElementById('ambTrackerProgress');

  if (ambulanceIcon) {
    ambulanceIcon.style.bottom = `${pt.bottom}px`;
    ambulanceIcon.style.right = `${pt.right}px`;
  }
  if (trackerText) {
    trackerText.textContent = pt.text;
  }
  if (progressBar) {
    progressBar.style.width = `${pt.pct}%`;
  }
}

// Request ambulance manually
function requestAmbulance() {
  showNotification("Ambulance Requested", "Dispatched coordinate lock sent to nearest ambulance team. Live tracking updated.");
  simulateAmbulanceTracker();
}

// Ensure audio context stops if page changes
window.addEventListener('hashchange', () => {
  stopSiren();
  if (ambulanceTrackTimer) clearInterval(ambulanceTrackTimer);
});

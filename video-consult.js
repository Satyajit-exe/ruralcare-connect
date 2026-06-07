// RuralCare Connect - Telemedicine Video Consult Simulation Module (video-consult.js)

let activeDoctor = null;
let vitalsTimer = null;
let whiteboardCanvas = null;
let whiteboardCtx = null;
let isDrawing = false;

document.addEventListener('DOMContentLoaded', () => {
  initWhiteboard();
});

// Joins virtual consultation room with specified doctor
function joinConsultationRoom(doctorId) {
  activeDoctor = RURALCARE_DATA.doctors.find(d => d.id === doctorId) || RURALCARE_DATA.doctors[0];
  navigateTo('consultation');

  const container = document.getElementById('consultActiveArea');
  if (!container) return;

  // 1. Show WebRTC connecting loader
  container.innerHTML = `
    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:400px; color:var(--dark);">
      <i class="fas fa-circle-notch fa-spin" style="font-size: 48px; color:var(--green); margin-bottom: 20px;"></i>
      <h3 style="font-size: 20px; font-weight:700;">Establishing Secure Connection...</h3>
      <p style="font-size: 14px; color:var(--muted); margin-top:6px;">Connecting to ${activeDoctor.name} (${activeDoctor.specialty})</p>
      <div style="margin-top:24px; font-family: monospace; font-size:11px; color:var(--muted); text-align:center;">
        [ICE Candidate Gathering] ... [SDP Offer Sent]<br>
        [WebRTC Peer Connected]
      </div>
    </div>
  `;

  // 2. Simulate 2.5s delay to establish connection
  setTimeout(() => {
    renderActiveConsultRoom();
    startVitalsSimulation();
  }, 2500);
}

// Renders full consultation layout
function renderActiveConsultRoom() {
  const container = document.getElementById('consultActiveArea');
  if (!container) return;

  const isLow = appState.isLowBandwidth;

  container.innerHTML = `
    <div class="consult-grid">
      <!-- Left side: Video streams / Call window -->
      <div>
        <div class="video-screen-container">
          <div class="remote-video" style="background: ${isLow ? '#0F3027' : '#1e293b'};">
            ${isLow ? 
              `<div style="text-align:center;">
                <i class="fas fa-microphone" style="font-size:48px; color:var(--green-light); margin-bottom:16px;"></i>
                <h3>Low-Bandwidth Audio Connection Active</h3>
                <p style="font-size:13px; opacity:0.7; margin-top:4px;">${activeDoctor.name} is speaking...</p>
               </div>` : 
              `<div style="text-align:center;">
                <span style="font-size:72px; display:block; margin-bottom:12px;">👨‍⚕️</span>
                <h3>${activeDoctor.name}</h3>
                <p style="font-size:14px; opacity:0.8;">${activeDoctor.specialty} · ${activeDoctor.clinic}</p>
               </div>`
            }
          </div>
          
          <!-- Local Webcam preview (hidden if low bandwidth) -->
          <div class="local-video-preview" style="background:#475569; display: ${isLow ? 'none' : 'flex'}">
            <span>🤳 Satya Pal (You)</span>
          </div>

          <!-- In-call controls -->
          <div class="video-controls">
            <button onclick="toggleMuteCall(this)" class="vid-btn"><i class="fas fa-microphone"></i></button>
            <button onclick="toggleVideoCall(this)" class="vid-btn" style="display:${isLow ? 'none':'flex'};"><i class="fas fa-video"></i></button>
            <button onclick="hangupCall()" class="vid-btn btn-hangup"><i class="fas fa-phone-slash"></i></button>
          </div>
        </div>

        <!-- Abnormal Vitals Alert Ticker -->
        <div id="vitalsAlertTicker" class="vitals-alert-ticker" style="display:none;">
          <i class="fas fa-exclamation-triangle"></i>
          <span>ALERT: Critical vital values detected. Pulse rate climbing. Doctor notified.</span>
        </div>

        <!-- Interactive Whiteboard Drawer -->
        <div class="whiteboard-container">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h4 style="font-size:14px; font-weight:700; color:var(--dark);"><i class="fas fa-pen-fancy"></i> Patient-Doctor Explanation Board</h4>
            <button onclick="clearWhiteboard()" class="btn-outline" style="padding:4px 10px; font-size:11px;">Clear Board</button>
          </div>
          <canvas id="whiteboardCanvas" class="whiteboard-canvas"></canvas>
          <p style="font-size:11px; color:var(--muted); margin-top:4px;">Draw with your mouse/finger to help describe localized pain points.</p>
        </div>
      </div>

      <!-- Right side: Patient vitals, Prescription & In-call Chat -->
      <div style="display:flex; flex-direction:column; gap:20px;">
        
        <!-- Live Patient Vitals Display -->
        <div class="char-card" style="background:var(--white); border:1px solid var(--border); border-radius:16px; padding:20px;">
          <h4 style="font-size:15px; font-weight:700; color:var(--dark); margin-bottom:14px;"><i class="fas fa-heartbeat"></i> Live Patient Vitals (Simulated)</h4>
          <div style="display:grid; grid-template-columns: repeat(3,1fr); gap:10px;">
            <div class="vital-chip" style="background:var(--bg)">
              <div class="val" id="liveValHR" style="color:var(--green)">72</div>
              <div class="lbl">Pulse (bpm)</div>
            </div>
            <div class="vital-chip" style="background:var(--bg)">
              <div class="val" id="liveValSpO2" style="color:var(--green)">98%</div>
              <div class="lbl">SpO₂</div>
            </div>
            <div class="vital-chip" style="background:var(--bg)">
              <div class="val" id="liveValBP" style="color:var(--green)">120/80</div>
              <div class="lbl">Blood Pressure</div>
            </div>
          </div>
        </div>

        <!-- Consult Room Chat -->
        <div class="char-card" style="background:var(--white); border:1px solid var(--border); border-radius:16px; padding:20px; display:flex; flex-direction:column; height:240px;">
          <h4 style="font-size:14px; font-weight:700; color:var(--dark); margin-bottom:10px;"><i class="fas fa-comments"></i> Consultation Chat</h4>
          <div id="consultChatMessages" style="flex:1; overflow-y:auto; font-size:13px; display:flex; flex-direction:column; gap:8px; margin-bottom:10px; padding-right:4px;">
            <div style="color:var(--muted); font-style:italic; text-align:center; margin-bottom:4px;">Consultation Session Started</div>
            <div style="align-self:flex-start; background:var(--bg); padding:6px 12px; border-radius:12px; max-width:85%;">${activeDoctor.name}: Hello, I can hear you. How can I help you today?</div>
          </div>
          <div style="display:flex; gap:6px;">
            <input type="text" id="consultChatInput" placeholder="Type message to doctor..." style="flex:1; padding:8px 12px; border:1px solid var(--border); border-radius:8px; font-size:13px; outline:none; background:var(--bg); color:var(--text);" onkeypress="handleConsultChatKeyPress(event)">
            <button onclick="sendConsultChatMessage()" class="btn-primary" style="padding:8px 14px; border-radius:8px;"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>

        <!-- E-Prescription Form (simulates doctor writing recommendation) -->
        <div class="char-card" style="background:var(--white); border:1px solid var(--border); border-radius:16px; padding:20px;">
          <h4 style="font-size:15px; font-weight:700; color:var(--dark); margin-bottom:10px;"><i class="fas fa-file-medical"></i> Doctor E-Prescription Panel</h4>
          <p style="font-size:12px; color:var(--muted); margin-bottom:12px;">Mock prescription recommendation. Fill details and trigger generation.</p>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <div class="form-group" style="gap:2px;">
              <label style="font-size:11px;">Diagnosis / Clinical Impression</label>
              <input type="text" id="prescriptionDiag" value="Acute Upper Respiratory Infection" style="padding:8px; font-size:13px;">
            </div>
            <div class="form-group" style="gap:2px;">
              <label style="font-size:11px;">Recommended Medicines & Dosage</label>
              <textarea id="prescriptionMeds" style="padding:8px; font-size:13px; min-height:60px;">Tab Amoxicillin 500mg (TDS x 5 days)&#10;Tab Paracetamol 650mg (BD x 3 days as needed)&#10;Syp Cough Relief (10ml TDS x 5 days)</textarea>
            </div>
            <button onclick="generatePrescription()" class="btn-primary" style="width:100%; justify-content:center; margin-top:8px;"><i class="fas fa-print"></i> Issue & Print Prescription</button>
          </div>
        </div>

      </div>
    </div>
  `;

  // Bind drawing canvas events
  initWhiteboard();
}

// Fluctuate patient vitals every 2.5 seconds
function startVitalsSimulation() {
  if (vitalsTimer) clearInterval(vitalsTimer);

  let ticks = 0;

  vitalsTimer = setInterval(() => {
    const liveValHR = document.getElementById('liveValHR');
    const liveValSpO2 = document.getElementById('liveValSpO2');
    const liveValBP = document.getElementById('liveValBP');
    const alertTicker = document.getElementById('vitalsAlertTicker');

    if (!liveValHR) return; // session ended

    ticks++;

    // Base fluctuations
    let hr = 72 + Math.floor(Math.random() * 5) - 2;
    let spo2 = 98;
    let sys = 120 + Math.floor(Math.random() * 4) - 2;
    let dia = 80 + Math.floor(Math.random() * 4) - 2;

    // Simulate clinical anomaly at tick 5 (e.g. drop in SpO2, spike in heart rate)
    if (ticks >= 5 && ticks <= 9) {
      hr = 104 + Math.floor(Math.random() * 4);
      spo2 = 94; // Critical
      sys = 138;
      dia = 88;

      if (liveValHR) liveValHR.style.color = 'var(--emergency)';
      if (liveValSpO2) liveValSpO2.style.color = 'var(--emergency)';
      if (liveValBP) liveValBP.style.color = 'var(--emergency)';
      if (alertTicker) alertTicker.style.display = 'flex';
    } else {
      if (liveValHR) liveValHR.style.color = 'var(--green)';
      if (liveValSpO2) liveValSpO2.style.color = 'var(--green)';
      if (liveValBP) liveValBP.style.color = 'var(--green)';
      if (alertTicker) alertTicker.style.display = 'none';
    }

    if (liveValHR) liveValHR.textContent = hr;
    if (liveValSpO2) liveValSpO2.textContent = `${spo2}%`;
    if (liveValBP) liveValBP.textContent = `${sys}/${dia}`;
  }, 2500);
}

function stopVitalsSimulation() {
  if (vitalsTimer) {
    clearInterval(vitalsTimer);
    vitalsTimer = null;
  }
}

// In-call chat actions
function handleConsultChatKeyPress(event) {
  if (event.key === 'Enter') sendConsultChatMessage();
}

function sendConsultChatMessage() {
  const input = document.getElementById('consultChatInput');
  const chatArea = document.getElementById('consultChatMessages');
  if (!input || !input.value.trim() || !chatArea) return;

  const userText = input.value.trim();
  
  // Append user message
  const userMsg = document.createElement('div');
  userMsg.style.alignSelf = 'flex-end';
  userMsg.style.background = 'var(--green)';
  userMsg.style.color = 'white';
  userMsg.style.padding = '6px 12px';
  userMsg.style.borderRadius = '12px';
  userMsg.style.maxWidth = '85%';
  userMsg.textContent = userText;
  chatArea.appendChild(userMsg);
  chatArea.scrollTop = chatArea.scrollHeight;

  input.value = '';

  // Simulate Doctor replying after 1.5s
  setTimeout(() => {
    const replies = [
      "I see. That's helpful information. Make sure to rest and follow the prescription dosage carefully.",
      "Got it. Please download the prescription sheet below and hand it to your local Nabha pharmacist.",
      "Do you have any known allergies to antibiotics like Amoxicillin?",
      "Perfect. We will monitor your symptoms. Call back if the chest pain persists."
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];

    const docMsg = document.createElement('div');
    docMsg.style.alignSelf = 'flex-start';
    docMsg.style.background = 'var(--bg)';
    docMsg.style.padding = '6px 12px';
    docMsg.style.borderRadius = '12px';
    docMsg.style.maxWidth = '85%';
    docMsg.textContent = `${activeDoctor.name}: ${replyText}`;
    chatArea.appendChild(docMsg);
    chatArea.scrollTop = chatArea.scrollHeight;
  }, 1500);
}

// Drawing Whiteboard Setup
function initWhiteboard() {
  const canvas = document.getElementById('whiteboardCanvas');
  if (!canvas) return;

  whiteboardCanvas = canvas;
  whiteboardCtx = canvas.getContext('2d');
  
  // Set logical dimensions matching CSS layout bounding box
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  whiteboardCtx.lineWidth = 3;
  whiteboardCtx.lineCap = 'round';
  whiteboardCtx.strokeStyle = '#EF4444'; // Red pointer marker

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);

  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startDrawing(e.touches[0]);
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    draw(e.touches[0]);
  });
  canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
  isDrawing = true;
  const rect = whiteboardCanvas.getBoundingClientRect();
  whiteboardCtx.beginPath();
  whiteboardCtx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

function draw(e) {
  if (!isDrawing) return;
  const rect = whiteboardCanvas.getBoundingClientRect();
  whiteboardCtx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
  whiteboardCtx.stroke();
}

function stopDrawing() {
  isDrawing = false;
}

function clearWhiteboard() {
  if (whiteboardCtx && whiteboardCanvas) {
    whiteboardCtx.clearRect(0, 0, whiteboardCanvas.width, whiteboardCanvas.height);
  }
}

// In-call helper buttons actions
function toggleMuteCall(btn) {
  const icon = btn.querySelector('i');
  if (icon.classList.contains('fa-microphone')) {
    icon.className = 'fas fa-microphone-slash';
    btn.style.background = 'var(--emergency)';
  } else {
    icon.className = 'fas fa-microphone';
    btn.style.background = 'rgba(255,255,255,0.2)';
  }
}

function toggleVideoCall(btn) {
  const icon = btn.querySelector('i');
  if (icon.classList.contains('fa-video')) {
    icon.className = 'fas fa-video-slash';
    btn.style.background = 'var(--emergency)';
  } else {
    icon.className = 'fas fa-video';
    btn.style.background = 'rgba(255,255,255,0.2)';
  }
}

function hangupCall() {
  stopVitalsSimulation();
  showNotification("Consultation Ended", `Session with ${activeDoctor.name} terminated successfully.`);
  navigateTo('dashboard');
}

// Prescription Generator logic
function generatePrescription() {
  const diagnosis = document.getElementById('prescriptionDiag').value.trim();
  const medicines = document.getElementById('prescriptionMeds').value.trim();

  if (!diagnosis || !medicines) {
    showNotification("Missing Details", "Please write down diagnosis and medicines recommendation first.");
    return;
  }

  // Create mock prescription item
  const newPres = {
    id: `pres-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
    doctor: activeDoctor.name,
    specialty: activeDoctor.specialty,
    diagnosis: diagnosis,
    medicines: medicines.replace(/\n/g, '<br>')
  };

  // Push to patient database records
  appState.patient.prescriptions.unshift(newPres);

  // Render Printable modal view
  const modalPres = document.getElementById('modalPrescription');
  if (modalPres) {
    modalPres.innerHTML = `
      <div class="modal-content print-area">
        <button class="modal-close" onclick="closeAllModals()">&times;</button>
        <div style="border-bottom: 2px solid var(--green); padding-bottom: 16px; margin-bottom: 20px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3 style="color:var(--green); font-size:24px; font-weight:800;">RuralCare Connect</h3>
            <p style="font-size:12px; color:var(--muted); margin-top:2px;">Government Telehealth Portal · Punjab Health Authority</p>
          </div>
          <div style="text-align:right;">
            <h4 style="font-size:15px; font-weight:700;">${newPres.doctor}</h4>
            <p style="font-size:12px; color:var(--muted);">${newPres.specialty}</p>
            <p style="font-size:11px; color:var(--muted);">Reg No: MCI-PB-${Math.floor(20000 + Math.random() * 80000)}</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; font-size:13px; background:var(--bg); padding:12px; border-radius:12px;">
          <div>
            <p><strong>Patient Name:</strong> ${appState.patient.name}</p>
            <p><strong>Age/Gender:</strong> ${appState.patient.age} / ${appState.patient.gender}</p>
          </div>
          <div>
            <p><strong>Date:</strong> ${newPres.date}</p>
            <p><strong>Prescription ID:</strong> ${newPres.id}</p>
          </div>
        </div>

        <div style="margin-bottom:24px;">
          <h4 style="font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:4px; margin-bottom:8px; color:var(--green);">Diagnosis</h4>
          <p style="font-size:14px; font-weight:600; color:var(--dark);">${newPres.diagnosis}</p>
        </div>

        <div style="margin-bottom:24px;">
          <h4 style="font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:4px; margin-bottom:8px; color:var(--green);">Rx (Recommended Medicines)</h4>
          <p style="font-size:14px; line-height:1.8; font-family: monospace; white-space: pre-line; color:var(--dark);">${newPres.medicines}</p>
        </div>

        <div style="border-top:1px solid var(--border); padding-top:20px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11px; color:var(--muted);">
            * Generated digitally. Verification QR code attached.<br>
            * Hand this printout to your nearest pharmacy store in Nabha.
          </div>
          <div style="text-align:right;">
            <div style="width:120px; height:40px; border:1px dashed var(--muted); border-radius:4px; display:flex; align-items:center; justify-content:center; font-size:10px; color:var(--muted); margin-bottom:4px;">Digital Signature</div>
            <p style="font-size:11px; font-weight:600;">Authorized Signatory</p>
          </div>
        </div>

        <div style="margin-top:24px; display:flex; gap:10px;">
          <button onclick="window.print()" class="btn-primary" style="flex:1; justify-content:center;"><i class="fas fa-print"></i> Print Prescription</button>
          <button onclick="closeAllModals(); hangupCall();" class="btn-outline" style="flex:1; justify-content:center;">Finish Consultation</button>
        </div>
      </div>
    `;

    openModal('modalPrescription');
  }
}

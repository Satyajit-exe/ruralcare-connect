// RuralCare Connect - Patient Health Vault Module (records.js)

// Initialize Dashboard components
function initDashboard() {
  renderPatientInfo();
  renderPrescriptionsList();
  drawVitalsChart();
  renderUploadedDocuments();
}

function renderPatientInfo() {
  const nameEl = document.getElementById('dashPatientName');
  const detailsEl = document.getElementById('dashPatientDetails');

  if (nameEl) nameEl.textContent = appState.patient.name;
  if (detailsEl) {
    detailsEl.textContent = `${appState.patient.age} Yrs · ${appState.patient.gender} · ${appState.patient.location}`;
  }
}

// Render dynamic list of issued prescriptions
function renderPrescriptionsList() {
  const container = document.getElementById('dashPrescriptionsList');
  if (!container) return;

  if (appState.patient.prescriptions.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--muted); font-size:13px;">No prescriptions available in vault.</div>`;
    return;
  }

  container.innerHTML = appState.patient.prescriptions.map(pres => {
    return `
      <div class="prescription-card">
        <div class="pres-info">
          <h4>${pres.diagnosis}</h4>
          <p>${pres.doctor} (${pres.specialty}) · ${pres.date}</p>
          <p style="font-size:11px; font-family:monospace; color:var(--muted); margin-top:4px;">Rx: ${pres.medicines.replace(/<br>/g, ', ')}</p>
        </div>
        <button onclick="viewExistingPrescription('${pres.id}')" class="btn-outline" style="padding:6px 12px; font-size:12px; display:inline-flex; align-items:center; gap:4px;"><i class="fas fa-eye"></i> View</button>
      </div>
    `;
  }).join('');
}

// Display selected prescription in printable modal
function viewExistingPrescription(presId) {
  const pres = appState.patient.prescriptions.find(p => p.id === presId);
  if (!pres) return;

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
            <h4 style="font-size:15px; font-weight:700;">${pres.doctor}</h4>
            <p style="font-size:12px; color:var(--muted);">${pres.specialty}</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; font-size:13px; background:var(--bg); padding:12px; border-radius:12px;">
          <div>
            <p><strong>Patient Name:</strong> ${appState.patient.name}</p>
            <p><strong>Age/Gender:</strong> ${appState.patient.age} / ${appState.patient.gender}</p>
          </div>
          <div>
            <p><strong>Date:</strong> ${pres.date}</p>
            <p><strong>Prescription ID:</strong> ${pres.id}</p>
          </div>
        </div>

        <div style="margin-bottom:24px;">
          <h4 style="font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:4px; margin-bottom:8px; color:var(--green);">Diagnosis</h4>
          <p style="font-size:14px; font-weight:600; color:var(--dark);">${pres.diagnosis}</p>
        </div>

        <div style="margin-bottom:24px;">
          <h4 style="font-size:14px; font-weight:700; border-bottom:1px solid var(--border); padding-bottom:4px; margin-bottom:8px; color:var(--green);">Rx (Recommended Medicines)</h4>
          <p style="font-size:14px; line-height:1.8; font-family: monospace; white-space: pre-line; color:var(--dark);">${pres.medicines}</p>
        </div>

        <div style="border-top:1px solid var(--border); padding-top:20px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:11px; color:var(--muted);">
            * Generated digitally. Verification QR code attached.<br>
            * Hand this printout to your nearest pharmacy store in Nabha.
          </div>
          <div style="text-align:right;">
            <p style="font-size:11px; font-weight:600;">Authorized Signatory</p>
          </div>
        </div>

        <div style="margin-top:24px; display:flex; gap:10px;">
          <button onclick="window.print()" class="btn-primary" style="flex:1; justify-content:center;"><i class="fas fa-print"></i> Print Prescription</button>
          <button onclick="closeAllModals()" class="btn-outline" style="flex:1; justify-content:center;">Close</button>
        </div>
      </div>
    `;

    openModal('modalPrescription');
  }
}

// Draw a beautiful canvas-based line chart of vitals history
function drawVitalsChart() {
  const canvas = document.getElementById('vitalsCanvasChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  
  // Set logical dimensions
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  
  ctx.clearRect(0, 0, width, height);

  const data = appState.patient.vitalsHistory;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  // Grid bounds for vitals: Heart Rate (60 to 120 bpm)
  const minVal = 50;
  const maxVal = 130;

  // Draw chart helper grid lines
  ctx.strokeStyle = appState.currentTheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  ctx.lineWidth = 1;
  ctx.fillStyle = appState.currentTheme === 'dark' ? '#8AA499' : '#4B6B5D';
  ctx.font = '10px sans-serif';

  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const yVal = minVal + ((maxVal - minVal) / gridSteps) * i;
    const y = paddingTop + graphHeight - (graphHeight / gridSteps) * i;
    
    // Draw horizontal grid line
    ctx.beginPath();
    ctx.moveTo(paddingLeft, y);
    ctx.lineTo(width - paddingRight, y);
    ctx.stroke();

    // Draw Y axis labels
    ctx.fillText(Math.round(yVal), 10, y + 4);
  }

  // Draw timeline node plots
  const points = [];
  const xStep = graphWidth / (data.length - 1);

  data.forEach((val, idx) => {
    const x = paddingLeft + idx * xStep;
    const y = paddingTop + graphHeight - ((val.hr - minVal) / (maxVal - minVal)) * graphHeight;
    points.push({ x, y, label: val.date, hr: val.hr });
  });

  // Draw trend line
  ctx.beginPath();
  ctx.strokeStyle = '#0FC47F'; // Bright green line for Pulse
  ctx.lineWidth = 3.5;
  points.forEach((pt, idx) => {
    if (idx === 0) {
      ctx.moveTo(pt.x, pt.y);
    } else {
      ctx.lineTo(pt.x, pt.y);
    }
  });
  ctx.stroke();

  // Draw visual gradient fill under line
  const grad = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);
  grad.addColorStop(0, 'rgba(15, 196, 127, 0.25)');
  grad.addColorStop(1, 'rgba(15, 196, 127, 0.0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  points.forEach((pt, idx) => {
    if (idx === 0) {
      ctx.moveTo(pt.x, height - paddingBottom);
      ctx.lineTo(pt.x, pt.y);
    } else {
      ctx.lineTo(pt.x, pt.y);
    }
  });
  ctx.lineTo(points[points.length - 1].x, height - paddingBottom);
  ctx.closePath();
  ctx.fill();

  // Draw visual point circles & Date X axis labels
  ctx.fillStyle = '#0FC47F';
  ctx.font = '9px sans-serif';
  points.forEach(pt => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw coordinate dots outline
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw temperature/pulse value text above dot
    ctx.fillStyle = appState.currentTheme === 'dark' ? 'white' : 'var(--dark)';
    ctx.fillText(`${pt.hr} bpm`, pt.x - 16, pt.y - 10);

    // Draw date labels on X axis
    ctx.fillStyle = appState.currentTheme === 'dark' ? '#8AA499' : '#4B6B5D';
    ctx.fillText(pt.label, pt.x - 14, height - 10);
  });
}

// Upload Report simulation
let patientDocuments = [
  { name: "Blood Glucose Report.pdf", date: "24 May 2026", size: "1.2 MB" },
  { name: "Chest X-Ray Digital Copy.jpg", date: "12 Apr 2026", size: "3.4 MB" }
];

function renderUploadedDocuments() {
  const container = document.getElementById('dashDocumentsList');
  if (!container) return;

  container.innerHTML = patientDocuments.map(doc => {
    return `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:12px 16px; margin-bottom:8px;">
        <div>
          <h5 style="font-size:13px; font-weight:700; color:var(--dark);"><i class="far fa-file-pdf"></i> ${doc.name}</h5>
          <p style="font-size:11px; color:var(--muted); margin-top:2px;">Uploaded on ${doc.date} · ${doc.size}</p>
        </div>
        <button class="btn-outline" style="padding:4px 10px; font-size:11px; border-color:var(--muted); color:var(--muted);"><i class="fas fa-trash"></i> Delete</button>
      </div>
    `;
  }).join('');
}

function handleReportUpload() {
  const docTitle = prompt("Enter report description (e.g. CBC Blood Test):");
  if (!docTitle) return;

  const newDoc = {
    name: `${docTitle}.pdf`,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    size: "820 KB"
  };

  patientDocuments.unshift(newDoc);
  renderUploadedDocuments();
  showNotification("Document Saved", "Lab report uploaded to secure cloud vault.");
}

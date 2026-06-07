// RuralCare Connect - AI Symptom Checker Chatbot Module (symptom-checker.js)

document.addEventListener('DOMContentLoaded', () => {
  initSymptomChecker();
});

let isRecording = false;

function initSymptomChecker() {
  const chatInput = document.getElementById('chatInput');
  const chatSendBtn = document.getElementById('chatSendBtn');
  const chatVoiceBtn = document.getElementById('chatVoiceBtn');

  if (chatSendBtn && chatInput) {
    chatSendBtn.addEventListener('click', handleUserMessage);
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleUserMessage();
    });
  }

  if (chatVoiceBtn) {
    chatVoiceBtn.addEventListener('click', toggleVoiceInput);
  }

  // Set default initial AI message
  refreshAIAssistant();
}

// Resets/Re-translates initial chatbot prompt
function refreshAIAssistant() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  chatMessages.innerHTML = '';
  
  const introTexts = {
    en: "Namaste! I am your RuralCare AI Health Assistant. Describe your symptoms or medical questions in English, Hindi, Punjabi or Odia. You can also tap the microphone icon to speak.",
    hi: "नमस्ते! मैं आपका रूरलकेयर एआई स्वास्थ्य सहायक हूं। अपने लक्षणों या चिकित्सा संबंधी प्रश्नों का वर्णन अंग्रेजी, हिंदी, पंजाबी या ओडिया में करें। आप बोलने के लिए माइक्रोफ़ोन आइकन पर भी टैप कर सकते हैं।",
    pb: "ਨਮਸਤੇ! ਮੈਂ ਤੁਹਾਡਾ ਰੂਰਲਕੇਅਰ AI ਸਿਹਤ ਸਹਾਇਕ ਹਾਂ। ਆਪਣੇ ਲੱਛਣਾਂ ਜਾਂ ਡਾਕਟਰੀ ਪ੍ਰਸ਼ਨਾਂ ਦਾ ਵਰਣਨ ਅੰਗਰੇਜ਼ੀ, ਹਿੰਦੀ, ਪੰਜਾਬੀ ਜਾਂ ਉੜੀਆ ਵਿੱਚ ਕਰੋ। ਤੁਸੀਂ ਬੋਲਣ ਲਈ ਮਾਈਕ੍ਰੋਫੋਨ ਆਈਕਨ 'ਤੇ ਵੀ ਟੈਪ ਕਰ ਸਕਦੇ ਹੋ।",
    or: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର ରୁରାଲ୍‌କେୟାର AI ସ୍ୱାସ୍ଥ୍ୟ ସହାୟକ। ଆପଣଙ୍କର ଲକ୍ଷଣ କିମ୍ବା ମେଡିକାଲ୍ ପ୍ରଶ୍ନଗୁଡ଼ିକ ଇଂରାଜୀ, ହିନ୍ଦୀ, ପଞ୍ଜାବୀ କିମ୍ବା ଓଡ଼ିଆରେ ବର୍ଣ୍ଣନା କରନ୍ତୁ। ଆପଣ କହିବା ପାଇଁ ମାଇକ୍ରୋଫୋନ୍ ଆଇକନ୍ ଉପରେ ମଧ୍ୟ ଟ୍ୟାପ୍ କରିପାରିବେ।"
  };

  appendChatMessage(introTexts[appState.currentLanguage] || introTexts['en'], 'ai');
}

function handleUserMessage() {
  const chatInput = document.getElementById('chatInput');
  if (!chatInput) return;

  const text = chatInput.value.trim();
  if (!text) return;

  // Append user message
  appendChatMessage(text, 'user');
  chatInput.value = '';

  // Simulate AI Thinking
  showChatLoading();

  setTimeout(() => {
    removeChatLoading();
    analyzeSymptoms(text);
  }, 1000);
}

// Analyze typed symptom string
function analyzeSymptoms(text) {
  const normalized = text.toLowerCase();
  let matchedKey = null;

  // Basic symptom detection rules
  if (normalized.includes('chest') || normalized.includes('heart') || normalized.includes('breath') || normalized.includes('दर्द छाती') || normalized.includes('ਦਿਲ') || normalized.includes('ଛାତି')) {
    matchedKey = 'chest_pain';
  } else if (normalized.includes('child') || normalized.includes('kid') || normalized.includes('baby') || normalized.includes('बच्चा') || normalized.includes('ਬੱਚੇ') || normalized.includes('ପିଲା')) {
    matchedKey = 'child_fever';
  } else if (normalized.includes('skin') || normalized.includes('rash') || normalized.includes('itch') || normalized.includes('त्वचा') || normalized.includes('ਖਾਰਸ਼') || normalized.includes('ଚର୍ମ')) {
    matchedKey = 'skin_rash';
  } else if (normalized.includes('preg') || normalized.includes('period') || normalized.includes('pregnancy') || normalized.includes('गर्भवती') || normalized.includes('ਗਰਭ') || normalized.includes('ଗର୍ଭବତୀ')) {
    matchedKey = 'pregnancy_check';
  } else if (normalized.includes('fever') || normalized.includes('cold') || normalized.includes('cough') || normalized.includes('headache') || normalized.includes('बुखार') || normalized.includes('ਬੁਖਾਰ') || normalized.includes('ଜ୍ୱର')) {
    matchedKey = 'fever';
  }

  const lang = appState.currentLanguage;

  if (matchedKey && RURALCARE_DATA.symptomMatrix[matchedKey]) {
    const data = RURALCARE_DATA.symptomMatrix[matchedKey];
    
    // Build diagnostic summary block
    const cardHtml = `
      <p style="margin-bottom: 8px;"><strong>${getAIResponseIntro()}</strong></p>
      <div class="ai-result-card">
        <div class="ai-result-row">
          <span class="key">${lang === 'hi' ? 'अनुशंसित विशेषज्ञ' : lang === 'pb' ? 'ਸਿਫਾਰਸ਼ੀ ਮਾਹਰ' : lang === 'or' ? 'ସୁପାରିଶ ବିଶେଷଜ୍ଞ' : 'Recommended Specialist'}</span>
          <span class="val" style="color:var(--green-light); font-weight:700;">${data.specialty}</span>
        </div>
        <div class="ai-result-row">
          <span class="key">${lang === 'hi' ? 'प्राथमिकता स्तर' : lang === 'pb' ? 'ਤਰਜੀਹ ਪੱਧਰ' : lang === 'or' ? 'ପ୍ରାଥମିକତା ସ୍ତର' : 'Priority Level'}</span>
          <span class="val ${data.urgencyClass}">${data.priorityText[lang]}</span>
        </div>
        <div class="ai-result-row">
          <span class="key">${lang === 'hi' ? 'एआई सटीकता' : lang === 'pb' ? 'AI ਸ਼ੁੱਧਤਾ' : lang === 'or' ? 'AI ସଠିକତା' : 'AI Confidence'}</span>
          <span class="val confidence">${data.confidence} Match</span>
        </div>
      </div>
      <p style="margin-top: 10px; font-size:13px; font-style:italic; line-height:1.5; color:rgba(255,255,255,0.85);">
        <strong>Advice:</strong> ${data.advice[lang]}
      </p>
      <div class="ai-action-area">
        ${data.urgency === 'High' ? 
          `<button onclick="navigateTo('emergency')" class="ai-action-btn btn-sos-trigger"><i class="fas fa-exclamation-triangle"></i> Activate SOS</button>` : 
          `<button onclick="searchSpecialty('${data.specialty}')" class="ai-action-btn"><i class="fas fa-search"></i> Find ${data.specialty}s</button>`
        }
        <button onclick="startInstantConsultation('${data.specialty}')" class="ai-action-btn"><i class="fas fa-video"></i> Start Consult</button>
      </div>
    `;
    appendChatMessage(cardHtml, 'ai', true);
  } else {
    // Default reply
    const genericResponse = {
      en: "I've analyzed your inputs, but they are not specific enough to match. Based on standard protocol, we recommend checking with a General Physician for diagnosis.",
      hi: "मैंने आपके विवरण का विश्लेषण किया है, लेकिन वे पूरी तरह स्पष्ट नहीं हैं। मानक प्रोटोकॉल के आधार पर, हम सामान्य जांच के लिए एक जनरल फिजिशियन से परामर्श करने की सलाह देते हैं।",
      pb: "ਮੈਂ ਤੁਹਾਡੇ ਵੇਰਵੇ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਹੈ, ਪਰ ਉਹ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸਪੱਸ਼ਟ ਨਹੀਂ ਹਨ। ਮਿਆਰੀ ਪ੍ਰੋਟੋਕੋਲ ਦੇ ਅਧਾਰ 'ਤੇ, ਅਸੀਂ ਸਲਾਹ ਦਿੰਦੇ ਹਾਂ ਕਿ ਇੱਕ ਜਨਰਲ ਫਿਜ਼ੀਸ਼ੀਅਨ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।",
      or: "ମୁଁ ଆପଣଙ୍କର ବିବରଣୀ ବିଶ୍ଳେଷଣ କଲି, କିନ୍ତୁ ଏହା ସମ୍ପୂର୍ଣ୍ଣ ସ୍ପଷ୍ଟ ନୁହେଁ। ମାନକ ନିୟମ ଅନୁସାରେ, ଆମେ ଜଣେ ଜେନେରାଲ୍ ଫିଜିସିଆନ୍ ସହ ପରାମର୍ଶ କରିବାକୁ ସୁପାରିଶ କରୁଛୁ।"
    };
    const cardHtml = `
      <p>${genericResponse[lang]}</p>
      <div class="ai-action-area">
        <button onclick="searchSpecialty('General Physician')" class="ai-action-btn"><i class="fas fa-search"></i> Search Physicians</button>
        <button onclick="startInstantConsultation('General Physician')" class="ai-action-btn"><i class="fas fa-video"></i> Instant Call</button>
      </div>
    `;
    appendChatMessage(cardHtml, 'ai', true);
  }
}

function getAIResponseIntro() {
  const intros = {
    en: "Analysis complete. Here are my findings:",
    hi: "विश्लेषण पूरा हुआ। मेरे निष्कर्ष इस प्रकार हैं:",
    pb: "ਵਿਸ਼ਲੇਸ਼ਣ ਪੂਰਾ ਹੋਇਆ। ਮੇਰੇ ਨਤੀਜੇ ਇਸ ਤਰ੍ਹਾਂ ਹਨ:",
    or: "ବିଶ୍ଳେଷଣ ସମାପ୍ତ। ମୋର ତଥ୍ୟ ନିମ୍ନରେ ଦିଆଗଲା:"
  };
  return intros[appState.currentLanguage] || intros['en'];
}

function appendChatMessage(content, sender, isHTML = false) {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-msg ${sender}`;
  
  if (isHTML) {
    msgDiv.innerHTML = content;
  } else {
    msgDiv.textContent = content;
  }

  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
}

function showChatLoading() {
  const chatMessages = document.getElementById('chatMessages');
  if (!chatMessages) return;

  const loaderDiv = document.createElement('div');
  loaderDiv.className = 'chat-msg ai chat-loader';
  loaderDiv.id = 'chatLoader';
  loaderDiv.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> AI is thinking...`;
  
  chatMessages.appendChild(loaderDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeChatLoading() {
  const loader = document.getElementById('chatLoader');
  if (loader) loader.remove();
}

// Simulated Speech to Text
function toggleVoiceInput() {
  const micBtn = document.getElementById('chatVoiceBtn');
  const chatInput = document.getElementById('chatInput');
  if (!micBtn || !chatInput) return;

  // HTML5 Web Speech API integration
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (SpeechRecognition) {
    const recognition = new SpeechRecognition();
    recognition.lang = appState.currentLanguage === 'pb' ? 'pa-IN' : 
                       appState.currentLanguage === 'hi' ? 'hi-IN' : 
                       appState.currentLanguage === 'or' ? 'or-IN' : 'en-US';
    recognition.interimResults = false;

    if (!isRecording) {
      isRecording = true;
      micBtn.classList.add('recording');
      micBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
      appState.currentView === 'home' ? null : showNotification("Listening...", "Speak your symptoms clearly into your microphone.");
      recognition.start();
    } else {
      isRecording = false;
      micBtn.classList.remove('recording');
      micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      recognition.stop();
      return;
    }

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      chatInput.value = text;
      isRecording = false;
      micBtn.classList.remove('recording');
      micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      handleUserMessage();
    };

    recognition.onerror = () => {
      isRecording = false;
      micBtn.classList.remove('recording');
      micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      simulateFallbackSpeechInput(chatInput);
    };
  } else {
    // If browser doesn't support Web Speech API, run visual mock simulation
    simulateFallbackSpeechInput(chatInput);
  }
}

// Fallback visual simulation of speech input
function simulateFallbackSpeechInput(chatInput) {
  const micBtn = document.getElementById('chatVoiceBtn');
  if (!micBtn) return;

  if (!isRecording) {
    isRecording = true;
    micBtn.classList.add('recording');
    micBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
    chatInput.placeholder = "Listening... (Simulating Nabha local dialect)";
    
    setTimeout(() => {
      isRecording = false;
      micBtn.classList.remove('recording');
      micBtn.innerHTML = '<i class="fas fa-microphone"></i>';
      chatInput.placeholder = RURALCARE_DATA.translations[appState.currentLanguage].ai_chat_placeholder;
      
      const mockSpokenSymptoms = {
        en: "I have chest pain and breathlessness since morning",
        hi: "मुझे सुबह से छाती में तेज दर्द और सांस लेने में तकलीफ हो रही है",
        pb: "ਮੈਨੂੰ ਸਵੇਰ ਤੋਂ ਛਾਤੀ ਵਿੱਚ ਦਰਦ ਅਤੇ ਸਾਹ ਲੈਣ ਵਿੱਚ ਤਕਲੀਫ਼ ਹੋ ਰਹੀ ਹੈ",
        or: "ମୋତେ ସକାଳୁ ଛାତିରେ ଯନ୍ତ୍ରଣା ଏବଂ ନିଶ୍ୱାସ ନେବାରେ କଷ୍ଟ ଅନୁଭବ ହେଉଛି"
      };

      chatInput.value = mockSpokenSymptoms[appState.currentLanguage] || mockSpokenSymptoms['en'];
      handleUserMessage();
    }, 2500);
  }
}

// Callback actions triggered from chatbot
function searchSpecialty(specialty) {
  navigateTo('search');
  // Set search text and trigger filter
  const searchInput = document.querySelector('.search-box input');
  if (searchInput) {
    searchInput.value = specialty;
    // Trigger render function in other file
    if (typeof filterDoctors === 'function') filterDoctors();
  }
}

function startInstantConsultation(specialty) {
  // Find first available doctor matching specialty
  const matchDoc = RURALCARE_DATA.doctors.find(d => d.specialty === specialty && d.online);
  const targetDoc = matchDoc || RURALCARE_DATA.doctors[0]; // fallback
  
  if (typeof joinConsultationRoom === 'function') {
    joinConsultationRoom(targetDoc.id);
  }
}

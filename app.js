// ==========================================
// KONFIGURASI BACKEND (MIDDLEWARE GAS)
// ==========================================
// ⚠️ GANTIKAN URL DI BAWAH DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzdjp4_1jPIze7W2R78tkV74Tv888j18UUa-J_A88TE9sZF-RTt8gagWOd-Br4PvbrR/exec';

// State Permainan
let gameState = {
  name: '',
  score: 0,
  currentLevel: null,
  currentMalay: '',
  targetEnglish: '',
  availableWords: [],
  selectedWords: []
};

// Antrian untuk offline sync (Logik Penghantaran Data)
let syncQueue = JSON.parse(localStorage.getItem('kacakata_sync_queue')) || [];

// Audio Context (untuk menghasilkan bunyi dinamik)
let audioCtx;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// ==========================================
// LOGIK BUNYI (WEB AUDIO API)
// ==========================================
function playSuccessSound() {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'sine';
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Arpeggio yang menyeronokkan (C Major Chord)
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(523.25, now);       // C5
  osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
  osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
  osc.frequency.setValueAtTime(1046.50, now + 0.3); // C6
  
  gainNode.gain.setValueAtTime(0.1, now);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 1);
  
  osc.start(now);
  osc.stop(now + 1);
}

function playErrorSound() {
  initAudio();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  // Bunyi pelik / salah (jatuh frekuensi)
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
  
  gainNode.gain.setValueAtTime(0.1, now);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.5);
  
  osc.start(now);
  osc.stop(now + 0.5);
}

// ==========================================
// REGISTRASI SERVICE WORKER (PWA)
// ==========================================
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker didaftarkan'))
    .catch(err => console.error('Ralat SW:', err));
}

// ==========================================
// INIT & PENGURUSAN UI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadLocalData();
  initEventListeners();
  checkNetworkStatus();
  
  window.addEventListener('online', () => {
    checkNetworkStatus();
    processSyncQueue();
  });
  window.addEventListener('offline', checkNetworkStatus);
});

function loadLocalData() {
  const savedName = localStorage.getItem('kacakata_name');
  const savedScore = localStorage.getItem('kacakata_score');
  
  if (savedName) {
    document.getElementById('input-name').value = savedName;
    gameState.name = savedName;
  }
  if (savedScore) {
    gameState.score = parseInt(savedScore);
    document.getElementById('display-score').textContent = gameState.score;
  }
}

function initEventListeners() {
  document.getElementById('btn-start-game').addEventListener('click', startGameSetup);
  document.getElementById('btn-settings').addEventListener('click', () => {
    toggleScreen('screen-setup');
  });
  
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const level = e.currentTarget.getAttribute('data-level');
      startGameLevel(level);
    });
  });

  document.getElementById('btn-check').addEventListener('click', checkAnswer);
  document.getElementById('btn-clear').addEventListener('click', clearBoard);
  
  // Init audio interaction pad mana-mana klik di body kali pertama
  document.body.addEventListener('click', initAudio, { once: true });
}

function toggleScreen(screenId) {
  ['screen-setup', 'screen-levels', 'screen-game'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');
  
  if (screenId === 'screen-setup') {
    document.getElementById('header-section').classList.add('hidden');
  } else {
    document.getElementById('header-section').classList.remove('hidden');
  }
}

// ==========================================
// LOGIK PERMAINAN
// ==========================================
function startGameSetup() {
  const name = document.getElementById('input-name').value.trim();

  if (!name) {
    Swal.fire('Ralat', 'Sila masukkan Nama anda.', 'error');
    return;
  }

  gameState.name = name;
  localStorage.setItem('kacakata_name', name);
  document.getElementById('display-name').textContent = name;
  toggleScreen('screen-levels');
}

async function startGameLevel(level) {
  if (GAS_WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
     Swal.fire('Konfigurasi Diperlukan', 'Sila letakkan URL Google Apps Script pada pembolehubah GAS_WEB_APP_URL dalam fail app.js', 'warning');
     return;
  }

  gameState.currentLevel = level;
  document.getElementById('current-level-badge').textContent = `Tahap ${level}`;
  toggleScreen('screen-game');
  
  await fetchQuestionFromAI(level);
}

// ==========================================
// INTEGRASI MIDDLEWARE (GAS -> GROQ)
// ==========================================
async function fetchQuestionFromAI(level) {
  document.getElementById('loading-indicator').classList.remove('hidden');
  document.getElementById('loading-text').textContent = 'Cikgu AI sedang membina soalan...';
  document.getElementById('game-content').classList.add('hidden');
  document.getElementById('answer-area').innerHTML = '';
  document.getElementById('word-pool').innerHTML = '';
  gameState.selectedWords = [];
  gameState.availableWords = [];

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'getQuestion',
        level: level
      })
    });

    if (!response.ok) throw new Error(`Rangkaian Gagal: ${response.status}`);
    
    const result = await response.json();
    
    if (result.status === 'error') {
      throw new Error(result.message);
    }

    const parsedData = JSON.parse(result.data);
    
    if (!parsedData.malay || !parsedData.english) {
      throw new Error("Format JSON dari AI tidak lengkap.");
    }

    setupBoard(parsedData.malay, parsedData.english);

  } catch (error) {
    console.error(error);
    Swal.fire('Ralat Server/AI', error.message || 'Gagal menyambung ke pelayan.', 'error');
    toggleScreen('screen-levels');
  } finally {
    document.getElementById('loading-indicator').classList.add('hidden');
  }
}

// ==========================================
// LOGIK MENDAPATKAN KLU BILA SALAH
// ==========================================
async function fetchClueFromAI() {
  if (!navigator.onLine) {
    Swal.fire('Hampir Tepat!', 'Sila cuba susun semula. (Klu dari AI tidak dapat diambil ketika luar talian)', 'warning');
    clearBoard();
    return;
  }

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({
        action: 'getClue',
        malay: gameState.currentMalay,
        english: gameState.targetEnglish
      })
    });

    const result = await response.json();
    
    if (result.status === 'success') {
      Swal.fire({
        title: 'Klu Cikgu AI 💡',
        text: result.data,
        icon: 'info',
        confirmButtonColor: '#ec4899',
        confirmButtonText: 'Saya Faham, Cuba Lagi'
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Gagal mendapatkan klu:", error);
    Swal.fire('Hampir Tepat!', 'Susunan masih kurang tepat. Sila cuba lagi!', 'warning');
  }
  clearBoard();
}

// ==========================================
// LOGIK ANTARAMUKA PAPAN (BOARD)
// ==========================================
function setupBoard(malay, english) {
  gameState.currentMalay = malay;
  gameState.targetEnglish = english.replace(/[.,!?]/g, '').trim();
  
  document.getElementById('malay-sentence').textContent = malay;
  document.getElementById('game-content').classList.remove('hidden');

  let words = gameState.targetEnglish.split(' ');
  words = shuffleArray(words);
  
  gameState.availableWords = words.map((word, index) => ({ id: `word-${index}`, text: word }));
  
  renderBoard();
}

function shuffleArray(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function renderBoard() {
  const poolEl = document.getElementById('word-pool');
  const answerEl = document.getElementById('answer-area');
  
  poolEl.innerHTML = '';
  answerEl.innerHTML = '';

  gameState.availableWords.forEach(wordObj => {
    const btn = createWordTile(wordObj, () => moveWord(wordObj, 'toAnswer'));
    poolEl.appendChild(btn);
  });

  gameState.selectedWords.forEach(wordObj => {
    const btn = createWordTile(wordObj, () => moveWord(wordObj, 'toPool'));
    btn.classList.replace('bg-white/30', 'bg-purple-600/80');
    answerEl.appendChild(btn);
  });
}

function createWordTile(wordObj, clickHandler) {
  const div = document.createElement('div');
  div.className = 'word-tile bg-white/30 border border-white/40 text-white font-bold py-2 px-4 rounded-xl shadow-sm text-lg';
  div.textContent = wordObj.text;
  div.onclick = clickHandler;
  return div;
}

function moveWord(wordObj, direction) {
  if (direction === 'toAnswer') {
    gameState.availableWords = gameState.availableWords.filter(w => w.id !== wordObj.id);
    gameState.selectedWords.push(wordObj);
  } else {
    gameState.selectedWords = gameState.selectedWords.filter(w => w.id !== wordObj.id);
    gameState.availableWords.push(wordObj);
  }
  renderBoard();
}

function clearBoard() {
  if (gameState.selectedWords.length > 0) {
    gameState.availableWords = [...gameState.availableWords, ...gameState.selectedWords];
    gameState.selectedWords = [];
    renderBoard();
  }
}

// ==========================================
// SEMAKAN JAWAPAN & MARKAH
// ==========================================
function checkAnswer() {
  if (gameState.selectedWords.length === 0) return;

  const userAnswer = gameState.selectedWords.map(w => w.text).join(' ').toLowerCase();
  const correctAnswer = gameState.targetEnglish.toLowerCase();

  if (userAnswer === correctAnswer) {
    // BILA BETUL - Bunyi Menyeronokkan
    playSuccessSound();
    
    let points = parseInt(gameState.currentLevel) * 10;
    gameState.score += points;
    localStorage.setItem('kacakata_score', gameState.score);
    document.getElementById('display-score').textContent = gameState.score;
    
    syncScoreToGAS(points);

    Swal.fire({
      title: 'Tepat Sekali!',
      text: `Anda mendapat +${points} mata.`,
      icon: 'success',
      confirmButtonText: 'Teruskan',
      confirmButtonColor: '#9333ea'
    }).then(() => {
      fetchQuestionFromAI(gameState.currentLevel);
    });
  } else {
    // BILA SALAH - Bunyi Pelik
    playErrorSound();
    
    // Jika Salah, panggil klu AI
    Swal.fire({
      title: 'Menyemak...',
      text: 'Menganalisis susunan anda...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    fetchClueFromAI();
  }
}

// ==========================================
// PENGHANTARAN DATA (GAS) & OFFLINE SYNC
// ==========================================
function checkNetworkStatus() {
  const isOnline = navigator.onLine;
  const icon = document.getElementById('wifi-icon');
  const text = document.getElementById('sync-text');
  
  if (isOnline) {
    icon.setAttribute('data-lucide', 'wifi');
    icon.classList.remove('text-red-400');
    icon.classList.add('text-green-400');
    text.textContent = 'Dalam Talian';
    lucide.createIcons();
  } else {
    icon.setAttribute('data-lucide', 'wifi-off');
    icon.classList.remove('text-green-400');
    icon.classList.add('text-red-400');
    text.textContent = 'Luar Talian (Data Disimpan)';
    lucide.createIcons();
  }
}

async function syncScoreToGAS(pointsAdded) {
  const payload = {
    action: 'saveScore',
    name: gameState.name,
    score: gameState.score,
    level: gameState.currentLevel,
    timestamp: new Date().toISOString(),
    isOfflineSync: false
  };

  if (!navigator.onLine) {
    payload.isOfflineSync = true;
    syncQueue.push(payload);
    localStorage.setItem('kacakata_sync_queue', JSON.stringify(syncQueue));
    console.log('Disimpan secara offline:', payload);
    return;
  }

  sendData(payload);
}

async function processSyncQueue() {
  if (syncQueue.length === 0 || !navigator.onLine) return;
  
  console.log(`Menyegerak ${syncQueue.length} data offline...`);
  
  const currentQueue = [...syncQueue];
  syncQueue = [];
  localStorage.setItem('kacakata_sync_queue', JSON.stringify(syncQueue));

  for (let payload of currentQueue) {
    await sendData(payload);
  }
}

async function sendData(payload) {
  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload)
    });
    console.log('Data berjaya dihantar ke GAS MURID', payload);
  } catch (err) {
    console.error('Ralat menghantar data:', err);
    payload.isOfflineSync = true;
    syncQueue.push(payload);
    localStorage.setItem('kacakata_sync_queue', JSON.stringify(syncQueue));
  }
}

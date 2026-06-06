// ==========================================
// KONFIGURASI BACKEND (MIDDLEWARE GAS)
// ==========================================
// ⚠️ GANTIKAN URL DI BAWAH DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxsSqLbaKMr7_LCwrJbjhTLOipIpyUuZdCvds3O3EhW0-HNA0hDZ7udpPy5LfMagicL/exec';

// State Permainan
let gameState = {
  name: '',
  score: 0,
  currentLevel: null,
  questionPool: [], // Menyimpan array kumpulan soalan 40-50 yang diambil/dijana
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
  
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(523.25, now);
  osc.frequency.setValueAtTime(659.25, now + 0.1);
  osc.frequency.setValueAtTime(783.99, now + 0.2);
  osc.frequency.setValueAtTime(1046.50, now + 0.3);
  
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
  initEventListeners();
  loadLocalData(); // Ini akan menguruskan skip login jika nama wujud
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
  
  if (savedScore) {
    gameState.score = parseInt(savedScore);
    document.getElementById('display-score').textContent = gameState.score;
  }
  
  if (savedName) {
    document.getElementById('input-name').value = savedName;
    gameState.name = savedName;
    document.getElementById('display-name').textContent = savedName;
    // PERSISTENT LOGIN: Terus lompat ke paparan tahap
    toggleScreen('screen-levels');
  } else {
    toggleScreen('screen-setup');
  }
}

function initEventListeners() {
  document.getElementById('btn-start-game').addEventListener('click', startGameSetup);
  document.getElementById('btn-settings').addEventListener('click', () => {
    // Boleh kembali ke tetapan untuk tukar nama
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
  
  // Butang UI Kumpulan Soalan (Batch)
  document.getElementById('btn-generate-more').addEventListener('click', () => {
    fetchQuestionBatch(gameState.currentLevel, true);
  });
  document.getElementById('btn-back-levels').addEventListener('click', () => {
    toggleScreen('screen-levels');
  });

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
// LOGIK PERMAINAN & KUMPULAN SOALAN (BATCH)
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

function startGameLevel(level) {
  if (GAS_WEB_APP_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE') {
     Swal.fire('Konfigurasi Diperlukan', 'Sila letakkan URL Google Apps Script pada pembolehubah GAS_WEB_APP_URL dalam fail app.js', 'warning');
     return;
  }
  gameState.currentLevel = level;
  document.getElementById('current-level-badge').textContent = `Tahap ${level}`;
  toggleScreen('screen-game');
  
  // Reset state game UI
  document.getElementById('end-batch-ui').classList.add('hidden');
  
  // Panggil Batch
  fetchQuestionBatch(level, false);
}

async function fetchQuestionBatch(level, forceRegenerate) {
  document.getElementById('loading-indicator').classList.remove('hidden');
  document.getElementById('game-content').classList.add('hidden');
  document.getElementById('end-batch-ui').classList.add('hidden');
  
  if (forceRegenerate) {
     document.getElementById('loading-text').textContent = 'AI sedang membina 50 soalan baru...';
  } else {
     document.getElementById('loading-text').textContent = 'Menyemak fail Pangkalan Data...';
  }

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'getBatchQuestions',
        level: level,
        forceRegenerate: forceRegenerate
      })
    });

    if (!response.ok) throw new Error(`Rangkaian Gagal: ${response.status}`);
    
    const result = await response.json();
    
    if (result.status === 'error') {
      throw new Error(result.message);
    }

    // Shuffle array soalan yang diterima supaya murid berasa rawak setiap masa
    gameState.questionPool = shuffleArray(result.data);
    
    if(gameState.questionPool.length === 0) {
       throw new Error("Tiada soalan diterima dari pelayan AI.");
    }

    // Tunjuk soalan pertama dari pool
    loadNextQuestionFromPool();

  } catch (error) {
    console.error(error);
    Swal.fire('Ralat Sistem/AI', error.message || 'Gagal memuat turun data soalan.', 'error');
    toggleScreen('screen-levels');
  } finally {
    document.getElementById('loading-indicator').classList.add('hidden');
  }
}

function loadNextQuestionFromPool() {
  if (gameState.questionPool.length === 0) {
    // Apabila soalan habis dijawab, tunjukkan butang 'Soalan Tambahan'
    document.getElementById('game-content').classList.add('hidden');
    document.getElementById('end-batch-ui').classList.remove('hidden');
    return;
  }
  
  // Kemaskini Baki Soalan
  document.getElementById('questions-left-badge').textContent = `Baki: ${gameState.questionPool.length}`;

  // Ambil soalan pada index pertama tanpa buang lagi, kita buang apabila dijawab betul
  let currentQ = gameState.questionPool[0];
  setupBoard(currentQ.malay, currentQ.english);
}

// ==========================================
// LOGIK MENDAPATKAN KLU BILA SALAH
// ==========================================
async function fetchClueFromAI() {
  if (!navigator.onLine) {
    Swal.fire('Hampir Tepat!', 'Sila cuba susun semula. (Klu AI tergendala kerana luar talian)', 'warning');
    clearBoard();
    return;
  }
  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
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
        confirmButtonText: 'Saya Faham'
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    Swal.fire('Hampir Tepat!', 'Susunan masih kurang tepat. Cuba lagi!', 'warning');
  }
  clearBoard();
}

// ==========================================
// LOGIK ANTARAMUKA PAPAN (BOARD)
// ==========================================
function setupBoard(malay, english) {
  gameState.currentMalay = malay;
  gameState.targetEnglish = english.replace(/[.,!?]/g, '').trim();
  gameState.selectedWords = [];
  
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
    playSuccessSound();
    
    let points = parseInt(gameState.currentLevel) * 10;
    gameState.score += points;
    localStorage.setItem('kacakata_score', gameState.score);
    document.getElementById('display-score').textContent = gameState.score;
    
    syncScoreToGAS(points);

    Swal.fire({
      title: 'Tepat Sekali!',
      text: `Mata terkumpul: +${points}`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    }).then(() => {
      // Buang soalan yang telah dijawab dengan betul dari array Pool
      gameState.questionPool.shift(); 
      loadNextQuestionFromPool();
    });
  } else {
    playErrorSound();
    Swal.fire({ title: 'Menyemak...', text: 'Menganalisis susunan anda...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
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
  } else {
    icon.setAttribute('data-lucide', 'wifi-off');
    icon.classList.remove('text-green-400');
    icon.classList.add('text-red-400');
    text.textContent = 'Luar Talian (Disimpan)';
  }
  lucide.createIcons();
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
    return;
  }
  sendData(payload);
}

async function processSyncQueue() {
  if (syncQueue.length === 0 || !navigator.onLine) return;
  const currentQueue = [...syncQueue];
  syncQueue = [];
  localStorage.setItem('kacakata_sync_queue', JSON.stringify(syncQueue));

  for (let payload of currentQueue) {
    await sendData(payload);
  }
}

async function sendData(payload) {
  try {
    await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    payload.isOfflineSync = true;
    syncQueue.push(payload);
    localStorage.setItem('kacakata_sync_queue', JSON.stringify(syncQueue));
  }
}

// ==========================================
// KONFIGURASI BACKEND
// ==========================================
// ⚠️ GANTIKAN URL DI BAWAH DENGAN URL WEB APP ANDA
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwVXGcOCk_j5sjsMBBE1GLJrzMhjXYeICJQO46hyDYD7yOJw4GvaiW_LCfVWeTdQ3TE/exec';

// State Permainan
let gameState = {
  name: '',
  score: 0,
  targetLanguage: 'Bahasa Inggeris', // Default
  currentLevel: null,
  questionPool: [],
  currentMalay: '',
  targetSentence: '',
  availableWords: [], // Array of {id, word, pron}
  selectedWords: []
};

let syncQueue = JSON.parse(localStorage.getItem('kacakata_sync_queue')) || [];
let audioCtx;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

// ==========================================
// BUNYI SFX CERIA
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
  osc.type = 'square'; // Bunyi sikit macam retro game over
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
  gainNode.gain.setValueAtTime(0.05, now);
  gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
  osc.start(now);
  osc.stop(now + 0.4);
}

// Pendaftaran PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.error('Ralat SW:', err));
}

// ==========================================
// INIT & PENGURUSAN UI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadLocalData();
  checkNetworkStatus();
  
  window.addEventListener('online', () => {
    checkNetworkStatus();
    processSyncQueue();
    if(!document.getElementById('screen-setup').classList.contains('hidden')) {
      fetchLeaderboard();
    }
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
    toggleScreen('screen-language'); // Terus ke pilih bahasa
  } else {
    toggleScreen('screen-setup');
    fetchLeaderboard();
  }
}

function initEventListeners() {
  document.getElementById('btn-start-game').addEventListener('click', startGameSetup);
  
  // Pilihan Preset Bahasa (Termasuk 10 Bahasa Baru)
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.getAttribute('data-lang');
      selectLanguage(lang);
    });
  });

  // Pilihan Bahasa Custom
  document.getElementById('btn-custom-lang').addEventListener('click', () => {
    const val = document.getElementById('input-custom-lang').value.trim();
    if(val) selectLanguage(val);
    else Swal.fire('Oops!', 'Sila taip nama bahasa di ruangan tersebut.', 'warning');
  });
  
  document.getElementById('btn-settings').addEventListener('click', () => {
    toggleScreen('screen-language');
  });

  document.getElementById('btn-logout').addEventListener('click', () => {
    Swal.fire({
      title: 'Log Keluar?',
      text: 'Markah kamu telah disimpan selamat.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ec4899',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('kacakata_name');
        localStorage.removeItem('kacakata_score');
        location.reload();
      }
    });
  });
  
  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const level = e.currentTarget.getAttribute('data-level');
      startGameLevel(level);
    });
  });

  document.getElementById('btn-check').addEventListener('click', checkAnswer);
  document.getElementById('btn-clear').addEventListener('click', clearBoard);
  
  document.getElementById('btn-generate-more').addEventListener('click', () => {
    fetchQuestionBatch(gameState.currentLevel, true);
  });
  document.getElementById('btn-back-levels').addEventListener('click', () => {
    toggleScreen('screen-levels');
  });

  document.body.addEventListener('click', initAudio, { once: true });
}

function toggleScreen(screenId) {
  ['screen-setup', 'screen-language', 'screen-levels', 'screen-game'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
  });
  document.getElementById(screenId).classList.remove('hidden');
  
  if (screenId === 'screen-setup' || screenId === 'screen-language') {
    document.getElementById('header-section').classList.add('hidden');
  } else {
    document.getElementById('header-section').classList.remove('hidden');
  }
}

// ==========================================
// LOGIK PENDAFTARAN & BAHASA
// ==========================================
async function fetchLeaderboard() {
  if (!navigator.onLine) return;
  document.getElementById('leaderboard-section').classList.remove('hidden');
  const listEl = document.getElementById('leaderboard-list');
  
  try {
    const res = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'getLeaderboard' })
    });
    const result = await res.json();
    
    listEl.innerHTML = '';
    if (result.status === 'success' && result.data.length > 0) {
      result.data.forEach((p, index) => {
        let rankIcon = index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : `<span class="text-cyan-500 font-bold w-6 inline-block text-center">${index+1}.</span>`;
        listEl.innerHTML += `
          <div class="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border-2 border-cyan-50">
            <span class="font-bold flex items-center gap-3 text-gray-700">
              <span class="text-xl">${rankIcon}</span> 
              <span>${p.name}</span>
            </span>
            <span class="font-extrabold text-yellow-500 bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-200">${p.score} <span class="text-xs text-yellow-600 font-medium">pt</span></span>
          </div>
        `;
      });
    } else {
      listEl.innerHTML = '<div class="text-center text-sm text-gray-500 py-2">Jadilah juara yang pertama!</div>';
    }
  } catch (e) {
    listEl.innerHTML = '<div class="text-center text-sm text-red-400 py-2">Gagal muat rekod.</div>';
  }
}

async function startGameSetup() {
  const name = document.getElementById('input-name').value.trim();
  if (!name) return Swal.fire('Alamak!', 'Sila tulis nama kamu dahulu.', 'error');

  if (name.toLowerCase() === (localStorage.getItem('kacakata_name') || '').toLowerCase()) {
     toggleScreen('screen-language');
     return;
  }

  if (!navigator.onLine) return Swal.fire('Luar Talian', 'Perlu internet untuk daftar nama kali pertama.', 'warning');

  Swal.fire({ title: 'Menyemak Nama...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'checkName', name: name })
    });
    const data = await response.json();

    if (data.status === 'exists') {
      Swal.fire('Oops', data.message, 'error');
    } else {
      Swal.close();
      gameState.name = name;
      gameState.score = 0;
      localStorage.setItem('kacakata_name', name);
      localStorage.setItem('kacakata_score', 0);
      document.getElementById('display-name').textContent = name;
      document.getElementById('display-score').textContent = 0;
      toggleScreen('screen-language');
    }
  } catch (error) {
    Swal.fire('Ralat Talian', 'Gagal sambung ke pangkalan data.', 'error');
  }
}

function selectLanguage(lang) {
  gameState.targetLanguage = lang;
  document.getElementById('badge-selected-lang').innerHTML = `<i data-lucide="globe-2" class="inline w-4 h-4 mr-1"></i> Mod Belajar: ${lang}`;
  document.getElementById('game-target-lang').textContent = lang;
  lucide.createIcons();
  toggleScreen('screen-levels');
}

// ==========================================
// LOGIK PERMAINAN & SOALAN
// ==========================================
function startGameLevel(level) {
  if (!GAS_WEB_APP_URL.startsWith('https://script.google.com/')) return Swal.fire('Perhatian', 'Sila setup Web App URL', 'warning');
  
  gameState.currentLevel = level;
  document.getElementById('current-level-badge').textContent = `Tahap ${level}`;
  toggleScreen('screen-game');
  document.getElementById('end-batch-ui').classList.add('hidden');
  
  fetchQuestionBatch(level, false);
}

async function fetchQuestionBatch(level, forceRegenerate) {
  document.getElementById('loading-indicator').classList.remove('hidden');
  document.getElementById('game-content').classList.add('hidden');
  document.getElementById('end-batch-ui').classList.add('hidden');
  
  document.getElementById('loading-text').textContent = forceRegenerate ? 'Membina silibus baru...' : 'Menyemak buku latihan AI...';

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'getBatchQuestions',
        level: level,
        language: gameState.targetLanguage,
        forceRegenerate: forceRegenerate
      })
    });
    
    if (!response.ok) throw new Error(`Rangkaian Gagal`);
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);

    gameState.questionPool = shuffleArray(result.data);
    if(gameState.questionPool.length === 0) throw new Error("Tiada soalan diterima.");

    loadNextQuestionFromPool();

  } catch (error) {
    Swal.fire('Ralat AI', error.message, 'error');
    toggleScreen('screen-levels');
  } finally {
    document.getElementById('loading-indicator').classList.add('hidden');
  }
}

function loadNextQuestionFromPool() {
  if (gameState.questionPool.length === 0) {
    document.getElementById('game-content').classList.add('hidden');
    document.getElementById('end-batch-ui').classList.remove('hidden');
    playSuccessSound(); // Bunyi habis level
    return;
  }
  
  document.getElementById('questions-left-badge').textContent = `Baki: ${gameState.questionPool.length}`;
  let currentQ = gameState.questionPool[0];
  setupBoard(currentQ.malay, currentQ.target_sentence, currentQ.words);
}

async function fetchClueFromAI() {
  if (!navigator.onLine) {
    Swal.fire('Hampir!', 'Sila susun semula.', 'warning');
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
        english: gameState.targetSentence,
        language: gameState.targetLanguage
      })
    });
    const result = await response.json();
    if (result.status === 'success') {
      Swal.fire({
        title: 'Klu Cikgu AI 💡',
        text: result.data,
        icon: 'info',
        confirmButtonColor: '#06b6d4',
        confirmButtonText: 'Terima Kasih Cikgu'
      });
    }
  } catch (error) {
    Swal.fire('Hampir Tepat!', 'Cuba ubah sikit.', 'warning');
  }
  clearBoard();
}

// ==========================================
// PAPAN JAWAPAN (BOARD UI CERIA)
// ==========================================
function setupBoard(malay, targetSentence, wordsArray) {
  gameState.currentMalay = malay;
  gameState.targetSentence = targetSentence.replace(/[.,!?]/g, '').trim();
  gameState.selectedWords = [];
  
  document.getElementById('malay-sentence').textContent = malay;
  document.getElementById('game-content').classList.remove('hidden');

  // Shuffle perkataan berserta prononciation
  let shuffledWords = shuffleArray([...wordsArray]);
  gameState.availableWords = shuffledWords.map((item, index) => ({
    id: `word-${index}`,
    word: item.word,
    pron: item.pron
  }));
  
  renderBoard();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderBoard() {
  const poolEl = document.getElementById('word-pool');
  const answerEl = document.getElementById('answer-area');
  
  // Clear pool except the absolute positioning background text for answer area
  poolEl.innerHTML = '';
  Array.from(answerEl.children).forEach(child => {
    if(!child.classList.contains('absolute')) answerEl.removeChild(child);
  });

  gameState.availableWords.forEach(wordObj => {
    const btn = createWordTile(wordObj, () => moveWord(wordObj, 'toAnswer'));
    poolEl.appendChild(btn);
  });

  gameState.selectedWords.forEach(wordObj => {
    const btn = createWordTile(wordObj, () => moveWord(wordObj, 'toPool'));
    // Ubah rupa untuk letak di jawapan
    btn.classList.replace('border-cyan-400', 'border-pink-500');
    btn.classList.replace('bg-white', 'bg-pink-50');
    btn.style.zIndex = 10;
    answerEl.appendChild(btn);
  });
}

function createWordTile(wordObj, clickHandler) {
  const div = document.createElement('div');
  div.className = 'word-tile bg-white border-4 border-cyan-400 text-gray-800 font-bold py-2 px-4 rounded-2xl shadow-sm flex flex-col items-center justify-center min-w-[70px] z-10';
  
  const wordSpan = document.createElement('span');
  wordSpan.className = 'text-xl drop-shadow-sm';
  wordSpan.textContent = wordObj.word;
  
  const pronSpan = document.createElement('span');
  pronSpan.className = 'text-xs text-pink-500 mt-1 font-medium bg-pink-50 px-2 py-0.5 rounded-full';
  pronSpan.textContent = wordObj.pron;
  
  div.appendChild(wordSpan);
  div.appendChild(pronSpan);
  div.onclick = clickHandler;
  return div;
}

function moveWord(wordObj, direction) {
  initAudio(); // Activate audio on first user gesture
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
// SEMAKAN JAWAPAN
// ==========================================
function checkAnswer() {
  if (gameState.selectedWords.length === 0) return;

  const userAnswer = gameState.selectedWords.map(w => w.word).join(' ').toLowerCase().trim();
  const correctAnswer = gameState.targetSentence.toLowerCase().trim();

  if (userAnswer === correctAnswer) {
    playSuccessSound();
    let points = parseInt(gameState.currentLevel) * 15; // Lebihkan point sikit bg semangat
    gameState.score += points;
    localStorage.setItem('kacakata_score', gameState.score);
    document.getElementById('display-score').textContent = gameState.score;
    
    syncScoreToGAS(gameState.score);

    Swal.fire({
      title: 'Tepat Sekali! 🌟',
      text: `Dapat +${points} Markah`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false,
      backdrop: `rgba(236, 72, 153, 0.4)`
    }).then(() => {
      gameState.questionPool.shift(); 
      loadNextQuestionFromPool();
    });
  } else {
    playErrorSound();
    Swal.fire({ title: 'Menyemak...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    fetchClueFromAI();
  }
}

// ==========================================
// PENGHANTARAN DATA & OFFLINE
// ==========================================
function checkNetworkStatus() {
  const isOnline = navigator.onLine;
  const icon = document.getElementById('wifi-icon');
  const text = document.getElementById('sync-text');
  
  if (isOnline) {
    icon.setAttribute('data-lucide', 'wifi');
    icon.classList.remove('text-red-500');
    icon.classList.add('text-cyan-500');
    text.textContent = 'Online';
  } else {
    icon.setAttribute('data-lucide', 'wifi-off');
    icon.classList.remove('text-cyan-500');
    icon.classList.add('text-red-500');
    text.textContent = 'Offline';
  }
  lucide.createIcons();
}

async function syncScoreToGAS(currentScore) {
  const payload = {
    action: 'saveScore',
    name: gameState.name,
    score: currentScore,
    level: gameState.currentLevel,
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
  for (let payload of currentQueue) await sendData(payload);
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

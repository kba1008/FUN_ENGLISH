// ==========================================
// KONFIGURASI BACKEND
// ==========================================
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzyTdG6B6LmvuhRGe8SyBkRLPteeaSoOTa9wwW49gvb5ywh7VxVFfrcWLiMbwcSHD9q/exec';

// Tetapan admin (boleh diubah dalam mod admin)
let adminSettings = JSON.parse(localStorage.getItem('kacakata_admin_settings')) || {
  audioRate: 0.7,
  audioPitch: 1.0,
  audioWordPause: true,
  defaultMotherTongue: 'Bahasa Melayu',
  passwordHash: '101010' // boleh tukar dalam mod admin
};
function saveAdminSettings() { localStorage.setItem('kacakata_admin_settings', JSON.stringify(adminSettings)); }

// State Permainan
let gameState = {
  name: '',
  score: 0,
  motherTongue: adminSettings.defaultMotherTongue || 'Bahasa Melayu',
  targetLanguage: 'Bahasa Inggeris',
  currentLevel: null,
  questionPool: [],
  currentIndex: 0,
  currentMalay: '',
  targetSentence: '',
  availableWords: [],
  selectedWords: []
};

let syncQueue = JSON.parse(localStorage.getItem('kacakata_sync_queue')) || [];
let audioCtx;
let answerSortable = null;

function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

// ==========================================
// TEXT-TO-SPEECH
// ==========================================
const LANG_CODE_MAP = {
  'bahasa inggeris': 'en-US', 'english': 'en-US',
  'bahasa arab': 'ar-SA', 'arabic': 'ar-SA',
  'bahasa mandarin': 'zh-CN', 'mandarin': 'zh-CN', 'cina': 'zh-CN',
  'bahasa jepun': 'ja-JP', 'japanese': 'ja-JP',
  'bahasa korea': 'ko-KR', 'korean': 'ko-KR',
  'bahasa perancis': 'fr-FR', 'french': 'fr-FR',
  'bahasa sepanyol': 'es-ES', 'spanish': 'es-ES',
  'bahasa jerman': 'de-DE', 'german': 'de-DE',
  'bahasa itali': 'it-IT', 'italian': 'it-IT',
  'bahasa tamil': 'ta-IN', 'tamil': 'ta-IN',
  'bahasa hindi': 'hi-IN', 'hindi': 'hi-IN',
  'bahasa thai': 'th-TH', 'thai': 'th-TH',
  'bahasa rusia': 'ru-RU', 'russian': 'ru-RU',
  'bahasa indonesia': 'id-ID',
  'bahasa melayu': 'ms-MY', 'malay': 'ms-MY'
};

function codeForLanguage(langName) {
  const raw = (langName || '').toString().trim().toLowerCase();
  if (LANG_CODE_MAP[raw]) return LANG_CODE_MAP[raw];
  for (const key in LANG_CODE_MAP) {
    if (raw.includes(key)) return LANG_CODE_MAP[key];
  }
  return 'en-US';
}
function getTargetLangCode() { return codeForLanguage(gameState.targetLanguage); }
function getMotherLangCode() { return codeForLanguage(gameState.motherTongue); }

function pickVoice(langCode) {
  const voices = window.speechSynthesis.getVoices();
  const p = (langCode || '').toLowerCase();
  return voices.find(v => v.lang && v.lang.toLowerCase() === p)
      || voices.find(v => v.lang && v.lang.toLowerCase().startsWith(p.split('-')[0]))
      || voices.find(v => v.default)
      || voices[0];
}

// Senarai butang audio yang sedang aktif - elak spam click
const audioButtons = new Set();
function lockAudioButtons() {
  ['btn-play-question', 'btn-play-target'].forEach(id => {
    const b = document.getElementById(id);
    if (b) { b.disabled = true; b.classList.add('audio-playing'); audioButtons.add(b); }
  });
}
function unlockAudioButtons() {
  audioButtons.forEach(b => { b.disabled = false; b.classList.remove('audio-playing'); });
  audioButtons.clear();
}

function speakText(text, langCode, onAllDone) {
  if (!('speechSynthesis' in window)) {
    Swal.fire('Maaf', 'Pelayar anda tidak menyokong audio bacaan.', 'warning');
    if (onAllDone) onAllDone();
    return;
  }
  if (!text) { if (onAllDone) onAllDone(); return; }
  window.speechSynthesis.cancel();

  const voice = pickVoice(langCode || 'en-US');
  const lang = voice ? voice.lang : (langCode || 'en-US');

  // Beri amaran jika tiada voice padan
  if (!voice || !voice.lang.toLowerCase().startsWith((langCode || '').split('-')[0].toLowerCase())) {
    // tiada voice tepat - guna apa yang ada, tapi maklum sekali sahaja
    if (!sessionStorage.getItem('voice_warn_' + langCode)) {
      sessionStorage.setItem('voice_warn_' + langCode, '1');
      console.warn(`Tiada voice TTS tepat untuk ${langCode}, guna default.`);
    }
  }

  const words = adminSettings.audioWordPause
    ? String(text).trim().split(/\s+/).filter(Boolean)
    : [String(text)];

  let pending = words.length;
  const done = () => { if (--pending <= 0) { unlockAudioButtons(); if (onAllDone) onAllDone(); } };

  words.forEach((w, i) => {
    const utter = new SpeechSynthesisUtterance(w);
    if (voice) utter.voice = voice;
    utter.lang = lang;
    utter.rate = adminSettings.audioRate;
    utter.pitch = adminSettings.audioPitch;
    utter.volume = 1;
    utter.onend = done;
    utter.onerror = done;
    window.speechSynthesis.speak(utter);
  });
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {};
}

function playCurrentQuestion() {
  const text = (gameState.currentMalay || document.getElementById('malay-sentence').textContent || '').trim();
  if (!text) return;
  lockAudioButtons();
  speakText(text, getMotherLangCode());
}

function playTargetSentence() {
  const text = (gameState.targetSentence || '').trim();
  if (!text) {
    Swal.fire('Belum sedia', 'Soalan belum dimuatkan.', 'info');
    return;
  }
  lockAudioButtons();
  speakText(text, getTargetLangCode());
}

// ==========================================
// PENGURUSAN RALAT
// ==========================================
function showErrorDialog(title, errorMsg, solution) {
  Swal.fire({
    icon: 'error',
    title: title,
    html: `
      <div class="text-left mt-3 text-sm bg-red-50 p-4 rounded-2xl border-2 border-red-200 shadow-inner">
        <p class="font-extrabold text-red-600 mb-1">⚠️ Punca Masalah:</p>
        <p class="text-gray-700 mb-4 font-medium">${errorMsg}</p>
        <p class="font-extrabold text-green-600 mb-1">💡 Jalan Penyelesaian:</p>
        <p class="text-gray-700 font-medium">${solution}</p>
      </div>
    `,
    confirmButtonColor: '#ec4899',
    confirmButtonText: 'Baiklah'
  });
}

window.addEventListener('error', function(event) {
  console.error("Global Error: ", event.error);
  if (event.error && event.error.message && event.error.message.includes("replace")) {
    showErrorDialog("Ralat Tidak Dijangka", "Kerosakan struktur teks.", "Sila segar semula halaman.");
  }
});

// ==========================================
// SFX
// ==========================================
function playSuccessSound() {
  initAudio();
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'sine'; osc.connect(g); g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(523.25, now);
  osc.frequency.setValueAtTime(659.25, now + 0.1);
  osc.frequency.setValueAtTime(783.99, now + 0.2);
  osc.frequency.setValueAtTime(1046.50, now + 0.3);
  g.gain.setValueAtTime(0.1, now);
  g.gain.exponentialRampToValueAtTime(0.00001, now + 1);
  osc.start(now); osc.stop(now + 1);
}
function playErrorSound() {
  initAudio();
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = 'square'; osc.connect(g); g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
  g.gain.setValueAtTime(0.05, now);
  g.gain.exponentialRampToValueAtTime(0.00001, now + 0.4);
  osc.start(now); osc.stop(now + 0.4);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(err => console.error('Ralat SW:', err));
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadLocalData();
  checkNetworkStatus();

  window.addEventListener('online', () => {
    checkNetworkStatus();
    processSyncQueue();
    if(!document.getElementById('screen-setup').classList.contains('hidden')) fetchLeaderboard();
  });
  window.addEventListener('offline', checkNetworkStatus);
});

function loadLocalData() {
  const savedName = localStorage.getItem('kacakata_name');
  const savedScore = localStorage.getItem('kacakata_score');
  const savedMother = localStorage.getItem('kacakata_mother_tongue');

  if (savedMother) {
    gameState.motherTongue = savedMother;
    const sel = document.getElementById('select-mother-tongue');
    if (sel) sel.value = savedMother;
  }

  if (savedScore) {
    gameState.score = parseInt(savedScore);
    document.getElementById('display-score').textContent = gameState.score;
  }

  if (savedName) {
    document.getElementById('input-name').value = savedName;
    gameState.name = savedName;
    document.getElementById('display-name').textContent = savedName;
    document.getElementById('display-mother-tongue').textContent = gameState.motherTongue;
    toggleScreen('screen-language');
  } else {
    toggleScreen('screen-setup');
    fetchLeaderboard();
  }
}

function initEventListeners() {
  document.getElementById('btn-start-game').addEventListener('click', startGameSetup);

  document.getElementById('select-mother-tongue').addEventListener('change', (e) => {
    gameState.motherTongue = e.target.value;
    localStorage.setItem('kacakata_mother_tongue', gameState.motherTongue);
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.getAttribute('data-lang');
      selectLanguage(lang);
    });
  });

  document.getElementById('btn-custom-lang').addEventListener('click', () => {
    const val = document.getElementById('input-custom-lang').value.trim();
    if(val) selectLanguage(val);
    else Swal.fire('Oops!', 'Sila taip nama bahasa.', 'warning');
  });

  document.getElementById('btn-settings').addEventListener('click', () => toggleScreen('screen-language'));

  document.getElementById('btn-logout').addEventListener('click', () => {
    Swal.fire({
      title: 'Log Keluar?', text: 'Markah disimpan selamat.', icon: 'question',
      showCancelButton: true, confirmButtonColor: '#ec4899', cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Ya, Keluar', cancelButtonText: 'Batal'
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
  document.getElementById('btn-prev-question').addEventListener('click', goPrevQuestion);
  document.getElementById('btn-skip-question').addEventListener('click', goNextQuestion);

  document.getElementById('btn-play-question').addEventListener('click', playCurrentQuestion);
  document.getElementById('btn-play-target').addEventListener('click', playTargetSentence);

  document.getElementById('btn-generate-more').addEventListener('click', () => {
    fetchQuestionBatch(gameState.currentLevel, true);
  });
  document.getElementById('btn-back-levels').addEventListener('click', () => toggleScreen('screen-levels'));

  // Mod Admin
  document.getElementById('btn-admin').addEventListener('click', openAdminLogin);
  document.getElementById('app-title').addEventListener('click', () => {
    // tap title 5x cepat = shortcut admin
    appTitleTapCount = (appTitleTapCount || 0) + 1;
    clearTimeout(appTitleTapTimer);
    appTitleTapTimer = setTimeout(() => appTitleTapCount = 0, 1500);
    if (appTitleTapCount >= 5) { appTitleTapCount = 0; openAdminLogin(); }
  });

  document.body.addEventListener('click', initAudio, { once: true });
}
let appTitleTapCount = 0, appTitleTapTimer;

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
// LOGIK PENDAFTARAN
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
          </div>`;
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

  // Simpan bahasa ibunda
  const motherSel = document.getElementById('select-mother-tongue');
  if (motherSel) {
    gameState.motherTongue = motherSel.value;
    localStorage.setItem('kacakata_mother_tongue', gameState.motherTongue);
  }
  document.getElementById('display-mother-tongue').textContent = gameState.motherTongue;

  if (name.toLowerCase() === (localStorage.getItem('kacakata_name') || '').toLowerCase()) {
     toggleScreen('screen-language');
     return;
  }

  if (!navigator.onLine) return Swal.fire('Luar Talian', 'Perlu internet untuk daftar nama kali pertama.', 'warning');

  Swal.fire({ title: 'Menyemak Nama...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'checkName', name: name })
    });
    const data = await response.json();

    if (data.status === 'exists') {
      const savedScore = parseInt(data.score) || 0;
      const confirm = await Swal.fire({
        title: `Selamat kembali, ${name}! 👋`,
        html: `Nama ini telah berdaftar dengan markah <b>${savedScore}</b>.<br>Sambung semula?`,
        icon: 'question', showCancelButton: true,
        confirmButtonColor: '#ec4899', cancelButtonColor: '#9ca3af',
        confirmButtonText: 'Ya, Sambung', cancelButtonText: 'Guna Nama Lain'
      });
      if (confirm.isConfirmed) {
        gameState.name = name; gameState.score = savedScore;
        localStorage.setItem('kacakata_name', name);
        localStorage.setItem('kacakata_score', savedScore);
        document.getElementById('display-name').textContent = name;
        document.getElementById('display-score').textContent = savedScore;
        toggleScreen('screen-language');
      }
    } else {
      Swal.close();
      gameState.name = name; gameState.score = 0;
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
  document.getElementById('badge-selected-lang').innerHTML = `🌍 Belajar: ${lang}`;
  document.getElementById('game-target-lang').textContent = lang;
  lucide.createIcons();
  toggleScreen('screen-levels');
}

// ==========================================
// LOGIK PERMAINAN
// ==========================================
function startGameLevel(level) {
  if (!GAS_WEB_APP_URL.startsWith('https://script.google.com/')) return Swal.fire('Perhatian', 'Sila setup Web App URL', 'warning');

  gameState.currentLevel = level;
  gameState.currentIndex = 0;
  document.getElementById('current-level-badge').textContent = `Tahap ${level}`;
  toggleScreen('screen-game');
  document.getElementById('end-batch-ui').classList.add('hidden');

  // Hanya jana soalan SELEPAS bahasa + tahap dipilih
  fetchQuestionBatch(level, false);
}

async function fetchQuestionBatch(level, forceRegenerate) {
  document.getElementById('loading-indicator').classList.remove('hidden');
  document.getElementById('game-content').classList.add('hidden');
  document.getElementById('end-batch-ui').classList.add('hidden');
  document.getElementById('loading-text').textContent = forceRegenerate ? 'Membina silibus baru...' : 'Menyemak buku latihan AI...';

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'getBatchQuestions',
        level: level,
        language: gameState.targetLanguage,
        motherTongue: gameState.motherTongue,
        forceRegenerate: forceRegenerate
      })
    });

    if (!response.ok) throw new Error(`Rangkaian gagal.`);
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    if (!result.data || !Array.isArray(result.data)) throw new Error("Data bukan array soalan.");

    const pick = (o, keys) => {
      if (!o) return undefined;
      for (const k of keys) {
        const found = Object.keys(o).find(x => x.toLowerCase().trim() === k.toLowerCase());
        if (found && o[found] != null) return o[found];
      }
    };
    const normalized = result.data.map(q => {
      if (!q || typeof q !== 'object') return null;
      const source = pick(q, ['source','malay','melayu','bm','mother','ibunda']);
      const target = pick(q, ['target_sentence','target','translation','english','sentence','ayat']);
      let words = pick(q, ['words','word_list','tokens','perkataan']);
      if (!source || !target) return null;
      if (!Array.isArray(words)) {
        words = String(target).split(/\s+/).filter(Boolean).map(w => ({ word: w, pron: w }));
      }
      words = words.map(w => {
        if (typeof w === 'string') return { word: w, pron: w };
        if (!w || typeof w !== 'object') return null;
        const word = pick(w, ['word','text','token','perkataan']);
        const pron = pick(w, ['pron','pronunciation','sebutan','phonetic','ipa','romaji']);
        return word ? { word: String(word), pron: String(pron || word) } : null;
      }).filter(Boolean);
      if (words.length === 0) return null;
      return { malay: String(source), target_sentence: String(target), words };
    }).filter(Boolean);

    if (normalized.length === 0) {
      if (!forceRegenerate) return fetchQuestionBatch(level, true);
      throw new Error("Format data soalan korup.");
    }

    gameState.questionPool = shuffleArray(normalized);
    gameState.currentIndex = 0;
    loadQuestionAtIndex();

  } catch (error) {
    let solution = "Sila periksa internet & cuba lagi.";
    if (error.message.includes("Format") || error.message.includes("korup")) {
      solution = "Sila tekan butang Tahap semula; jika gagal, padam Cache Soalan dalam Sheets.";
    } else if (error.message.includes("API") || error.message.includes("Groq")) {
      solution = "Pastikan API Key Groq sah dalam sheet 'API_KEY'.";
    }
    showErrorDialog('Ralat Memuatkan Soalan ⚠️', error.message, solution);
    toggleScreen('screen-levels');
  } finally {
    document.getElementById('loading-indicator').classList.add('hidden');
  }
}

function loadQuestionAtIndex() {
  const total = gameState.questionPool.length;
  if (total === 0 || gameState.currentIndex >= total) {
    document.getElementById('game-content').classList.add('hidden');
    document.getElementById('end-batch-ui').classList.remove('hidden');
    playSuccessSound();
    return;
  }
  if (gameState.currentIndex < 0) gameState.currentIndex = 0;

  document.getElementById('questions-progress-badge').textContent =
    `Soalan ${gameState.currentIndex + 1}/${total}`;

  // Disable Prev/Skip buttons jika di hujung
  document.getElementById('btn-prev-question').disabled = gameState.currentIndex === 0;
  document.getElementById('btn-skip-question').disabled = gameState.currentIndex >= total - 1;

  const q = gameState.questionPool[gameState.currentIndex];
  setupBoard(q.malay, q.target_sentence, q.words);
}

function goPrevQuestion() {
  if (gameState.currentIndex > 0) {
    gameState.currentIndex--;
    loadQuestionAtIndex();
  }
}
function goNextQuestion() {
  if (gameState.currentIndex < gameState.questionPool.length - 1) {
    gameState.currentIndex++;
    loadQuestionAtIndex();
  }
}

async function fetchClueFromAI() {
  if (!navigator.onLine) {
    Swal.fire('Hampir!', 'Cuba susun semula.', 'warning'); clearBoard(); return;
  }
  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'getClue',
        malay: gameState.currentMalay,
        english: gameState.targetSentence,
        language: gameState.targetLanguage,
        motherTongue: gameState.motherTongue
      })
    });
    const result = await response.json();
    if (result.status === 'success') {
      Swal.fire({
        title: 'Klu Cikgu AI 💡', text: result.data, icon: 'info',
        confirmButtonColor: '#06b6d4', confirmButtonText: 'Terima Kasih'
      });
    }
  } catch (error) {
    Swal.fire('Hampir Tepat!', 'Cuba ubah sikit.', 'warning');
  }
  clearBoard();
}

// ==========================================
// PAPAN JAWAPAN + DRAG REORDER
// ==========================================
function setupBoard(malay, targetSentence, wordsArray) {
  try {
    if (!malay || !targetSentence || !Array.isArray(wordsArray)) {
      throw new Error("Data soalan tidak lengkap.");
    }
    gameState.currentMalay = malay.toString();
    gameState.targetSentence = targetSentence.toString().replace(/[.,!?]/g, '').trim();
    gameState.selectedWords = [];

    document.getElementById('malay-sentence').textContent = malay;
    document.getElementById('game-content').classList.remove('hidden');

    let shuffled = shuffleArray([...wordsArray]);
    gameState.availableWords = shuffled.map((item, idx) => ({
      id: `word-${Date.now()}-${idx}`, word: item.word, pron: item.pron
    }));

    renderBoard();
  } catch (error) {
    showErrorDialog("Ralat Papan Jawapan", error.message, "Tekan Back & pilih tahap semula.");
    toggleScreen('screen-levels');
  }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function renderBoard() {
  const poolEl = document.getElementById('word-pool');
  const answerEl = document.getElementById('answer-area');
  const placeholder = document.getElementById('answer-placeholder');

  poolEl.innerHTML = '';
  Array.from(answerEl.children).forEach(child => {
    if (child.id !== 'answer-placeholder') answerEl.removeChild(child);
  });

  gameState.availableWords.forEach(w => {
    poolEl.appendChild(createWordTile(w, () => moveWord(w, 'toAnswer'), false));
  });

  gameState.selectedWords.forEach(w => {
    const tile = createWordTile(w, () => moveWord(w, 'toPool'), true);
    answerEl.appendChild(tile);
  });

  // Tunjuk/sembunyi placeholder
  if (placeholder) placeholder.style.display = gameState.selectedWords.length ? 'none' : '';

  // Init Sortable (drag reorder) dalam answer-area
  if (answerSortable) { try { answerSortable.destroy(); } catch(e){} }
  if (window.Sortable) {
    answerSortable = Sortable.create(answerEl, {
      animation: 180,
      delay: 180,           // 180ms hold-to-drag (elak conflict dgn click)
      delayOnTouchOnly: true,
      filter: '#answer-placeholder',
      preventOnFilter: false,
      onEnd: (evt) => {
        // Bina semula selectedWords ikut susunan baru DOM
        const ids = Array.from(answerEl.children)
          .filter(c => c.dataset && c.dataset.wid)
          .map(c => c.dataset.wid);
        const map = new Map(gameState.selectedWords.map(w => [w.id, w]));
        gameState.selectedWords = ids.map(id => map.get(id)).filter(Boolean);
      }
    });
  }
}

function createWordTile(wordObj, clickHandler, isSelected) {
  const div = document.createElement('div');
  div.dataset.wid = wordObj.id;
  div.className = `word-tile ${isSelected ? 'bg-pink-50 border-pink-500' : 'bg-white border-cyan-400'} border-4 text-gray-800 font-bold py-2 px-4 rounded-2xl shadow-sm flex flex-col items-center justify-center min-w-[70px] z-10`;

  const wordSpan = document.createElement('span');
  wordSpan.className = 'text-xl drop-shadow-sm';
  wordSpan.textContent = wordObj.word;

  const pronSpan = document.createElement('span');
  pronSpan.className = 'text-xs text-pink-500 mt-1 font-medium bg-pink-50 px-2 py-0.5 rounded-full';
  pronSpan.textContent = wordObj.pron || '-';

  div.appendChild(wordSpan);
  div.appendChild(pronSpan);
  div.onclick = clickHandler;
  return div;
}

function moveWord(wordObj, direction) {
  initAudio();
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
    let points = parseInt(gameState.currentLevel) * 15;
    gameState.score += points;
    localStorage.setItem('kacakata_score', gameState.score);
    document.getElementById('display-score').textContent = gameState.score;
    syncScoreToGAS(gameState.score);

    Swal.fire({
      title: 'Tepat Sekali! 🌟', text: `Dapat +${points} Markah`,
      icon: 'success', timer: 1500, showConfirmButton: false,
      backdrop: `rgba(236, 72, 153, 0.4)`
    }).then(() => {
      // Buang soalan yang dah jawab betul, jangan papar semula
      gameState.questionPool.splice(gameState.currentIndex, 1);
      // currentIndex tunjuk soalan seterusnya (sama index, sebab dah shift)
      if (gameState.currentIndex >= gameState.questionPool.length) {
        gameState.currentIndex = gameState.questionPool.length;
      }
      loadQuestionAtIndex();
    });
  } else {
    playErrorSound();
    Swal.fire({ title: 'Menyemak...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
    fetchClueFromAI();
  }
}

// ==========================================
// OFFLINE & SYNC
// ==========================================
function checkNetworkStatus() {
  const isOnline = navigator.onLine;
  const icon = document.getElementById('wifi-icon');
  const text = document.getElementById('sync-text');
  if (isOnline) {
    icon.setAttribute('data-lucide', 'wifi');
    icon.classList.remove('text-red-500'); icon.classList.add('text-cyan-500');
    text.textContent = 'Online';
  } else {
    icon.setAttribute('data-lucide', 'wifi-off');
    icon.classList.remove('text-cyan-500'); icon.classList.add('text-red-500');
    text.textContent = 'Offline';
  }
  lucide.createIcons();
}

async function syncScoreToGAS(currentScore) {
  const payload = {
    action: 'saveScore', name: gameState.name, score: currentScore,
    level: gameState.currentLevel, isOfflineSync: false
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
  const cq = [...syncQueue]; syncQueue = [];
  localStorage.setItem('kacakata_sync_queue', JSON.stringify(syncQueue));
  for (let p of cq) await sendData(p);
}
async function sendData(payload) {
  try {
    await fetch(GAS_WEB_APP_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    payload.isOfflineSync = true;
    syncQueue.push(payload);
    localStorage.setItem('kacakata_sync_queue', JSON.stringify(syncQueue));
  }
}

// ==========================================
// MOD ADMIN
// ==========================================
function openAdminLogin() {
  Swal.fire({
    title: '🔒 Mod Admin',
    input: 'password',
    inputLabel: 'Masukkan kata laluan admin',
    inputPlaceholder: '••••••',
    inputAttributes: { autocapitalize: 'off', autocorrect: 'off' },
    showCancelButton: true,
    confirmButtonText: 'Masuk',
    cancelButtonText: 'Batal',
    confirmButtonColor: '#ec4899'
  }).then(r => {
    if (r.isConfirmed) {
      if (r.value === adminSettings.passwordHash) openAdminPanel();
      else Swal.fire('Salah', 'Kata laluan tidak betul.', 'error');
    }
  });
}

function openAdminPanel() {
  const queueLen = syncQueue.length;
  Swal.fire({
    title: '⚙️ Panel Admin',
    width: 600,
    html: `
      <div class="text-left space-y-4">
        <div class="bg-cyan-50 p-3 rounded-xl border-2 border-cyan-200">
          <label class="font-bold text-cyan-700 block mb-1">🔊 Kelajuan Audio: <span id="adm-rate-val">${adminSettings.audioRate}</span></label>
          <input id="adm-rate" type="range" min="0.3" max="1.4" step="0.05" value="${adminSettings.audioRate}" class="w-full">
          <div class="flex justify-between text-xs text-gray-500"><span>Perlahan</span><span>Normal</span><span>Pantas</span></div>
        </div>

        <div class="bg-pink-50 p-3 rounded-xl border-2 border-pink-200">
          <label class="font-bold text-pink-700 block mb-1">🎵 Nada (Pitch): <span id="adm-pitch-val">${adminSettings.audioPitch}</span></label>
          <input id="adm-pitch" type="range" min="0.5" max="1.8" step="0.05" value="${adminSettings.audioPitch}" class="w-full">
        </div>

        <div class="bg-yellow-50 p-3 rounded-xl border-2 border-yellow-200">
          <label class="font-bold text-yellow-700 flex items-center gap-2">
            <input id="adm-pause" type="checkbox" ${adminSettings.audioWordPause ? 'checked' : ''}>
            Jeda antara perkataan (mod OKU)
          </label>
        </div>

        <div class="bg-emerald-50 p-3 rounded-xl border-2 border-emerald-200">
          <label class="font-bold text-emerald-700 block mb-1">🏠 Bahasa Ibunda Default</label>
          <select id="adm-mother" class="w-full p-2 rounded-lg border-2 border-emerald-300">
            ${['Bahasa Melayu','Bahasa Inggeris','Bahasa Indonesia','Bahasa Mandarin','Bahasa Tamil','Bahasa Arab','Bahasa Hindi','Bahasa Jepun','Bahasa Korea','Bahasa Thai','Bahasa Sepanyol','Bahasa Perancis','Bahasa Jerman','Bahasa Itali','Bahasa Rusia']
              .map(l => `<option ${adminSettings.defaultMotherTongue === l ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </div>

        <div class="bg-purple-50 p-3 rounded-xl border-2 border-purple-200">
          <label class="font-bold text-purple-700 block mb-1">🔑 Tukar Kata Laluan Admin</label>
          <input id="adm-newpass" type="text" placeholder="Biarkan kosong = tidak tukar" class="w-full p-2 rounded-lg border-2 border-purple-300">
        </div>

        <div class="bg-gray-50 p-3 rounded-xl border-2 border-gray-200 text-sm">
          📊 Status: ${queueLen} skor menunggu sync · Markah: ${gameState.score}
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button id="adm-test-audio" class="bg-cyan-500 text-white font-bold py-2 px-3 rounded-xl">🔊 Uji Audio</button>
          <button id="adm-regen" class="bg-pink-500 text-white font-bold py-2 px-3 rounded-xl">♻️ Jana Baru</button>
          <button id="adm-clear-local" class="bg-amber-500 text-white font-bold py-2 px-3 rounded-xl col-span-2">🗑️ Padam Data Tempatan</button>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '💾 Simpan',
    cancelButtonText: 'Tutup',
    confirmButtonColor: '#10b981',
    didOpen: () => {
      const rate = document.getElementById('adm-rate');
      const pitch = document.getElementById('adm-pitch');
      rate.oninput = () => document.getElementById('adm-rate-val').textContent = rate.value;
      pitch.oninput = () => document.getElementById('adm-pitch-val').textContent = pitch.value;

      document.getElementById('adm-test-audio').onclick = () => {
        adminSettings.audioRate = parseFloat(rate.value);
        adminSettings.audioPitch = parseFloat(pitch.value);
        speakText('Helo, ini ujian audio.', getMotherLangCode());
      };
      document.getElementById('adm-regen').onclick = () => {
        Swal.close();
        if (gameState.currentLevel) fetchQuestionBatch(gameState.currentLevel, true);
        else Swal.fire('Info', 'Sila masuk ke permainan dahulu.', 'info');
      };
      document.getElementById('adm-clear-local').onclick = () => {
        Swal.fire({
          title: 'Padam semua data tempatan?',
          text: 'Nama, markah & cache di pelayar akan hilang.',
          icon: 'warning', showCancelButton: true,
          confirmButtonColor: '#dc2626'
        }).then(c => {
          if (c.isConfirmed) {
            localStorage.clear();
            location.reload();
          }
        });
      };
    },
    preConfirm: () => {
      adminSettings.audioRate = parseFloat(document.getElementById('adm-rate').value);
      adminSettings.audioPitch = parseFloat(document.getElementById('adm-pitch').value);
      adminSettings.audioWordPause = document.getElementById('adm-pause').checked;
      adminSettings.defaultMotherTongue = document.getElementById('adm-mother').value;
      const np = document.getElementById('adm-newpass').value.trim();
      if (np) adminSettings.passwordHash = np;
      saveAdminSettings();
      return true;
    }
  }).then(r => {
    if (r.isConfirmed) Swal.fire('Disimpan ✅', 'Tetapan admin dikemaskini.', 'success');
  });
}

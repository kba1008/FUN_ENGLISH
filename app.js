// ==========================================
// KONFIGURASI BACKEND
// ==========================================
let GAS_WEB_APP_URL = localStorage.getItem('kacakata_gas_url') ||
  'https://script.google.com/macros/s/AKfycbx9j8LPEkS9B5Pi3cOYWEpKo9SVXoGRf0JreRH17iiOlUgMh8GC3dgXOVj_Q3cwYy33/exec';

// Tetapan Admin
const ADMIN_PASSWORD = '101010';
let adminSettings = JSON.parse(localStorage.getItem('kacakata_admin_settings') || '{}');
if (typeof adminSettings.audioRate !== 'number') adminSettings.audioRate = 0.9;
if (typeof adminSettings.audioPitch !== 'number') adminSettings.audioPitch = 1.0;

function saveAdminSettings() {
  localStorage.setItem('kacakata_admin_settings', JSON.stringify(adminSettings));
}

// Peta Bahasa -> Kod BCP47 (untuk pilih suara TTS yang sesuai)
const LANG_CODE_MAP = {
  'Bahasa Inggeris': 'en-US', 'English': 'en-US',
  'Bahasa Arab': 'ar-SA', 'Arab': 'ar-SA',
  'Bahasa Jepun': 'ja-JP', 'Jepun': 'ja-JP',
  'Bahasa Korea': 'ko-KR', 'Korea': 'ko-KR',
  'Bahasa Mandarin': 'zh-CN', 'Mandarin': 'zh-CN', 'Cina': 'zh-CN',
  'Bahasa Perancis': 'fr-FR', 'Perancis': 'fr-FR',
  'Bahasa Sepanyol': 'es-ES', 'Sepanyol': 'es-ES',
  'Bahasa Jerman': 'de-DE', 'Jerman': 'de-DE',
  'Bahasa Rusia': 'ru-RU', 'Rusia': 'ru-RU',
  'Bahasa Thai': 'th-TH', 'Thai': 'th-TH',
  'Bahasa Itali': 'it-IT', 'Itali': 'it-IT',
  'Bahasa Melayu': 'ms-MY', 'Melayu': 'ms-MY'
};
function getLangCode(name) {
  if (!name) return 'en-US';
  if (LANG_CODE_MAP[name]) return LANG_CODE_MAP[name];
  const lower = name.toLowerCase();
  for (const k in LANG_CODE_MAP) if (lower.includes(k.toLowerCase().replace('bahasa ',''))) return LANG_CODE_MAP[k];
  return 'en-US';
}

let _voicesCache = [];
function loadVoices() {
  return new Promise((resolve) => {
    let v = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    if (v && v.length) { _voicesCache = v; return resolve(v); }
    if (!window.speechSynthesis) return resolve([]);
    speechSynthesis.onvoiceschanged = () => {
      _voicesCache = speechSynthesis.getVoices();
      resolve(_voicesCache);
    };
    setTimeout(() => resolve(speechSynthesis.getVoices() || []), 800);
  });
}
function pickVoice(langCode) {
  const voices = _voicesCache.length ? _voicesCache : (window.speechSynthesis ? speechSynthesis.getVoices() : []);
  if (!voices.length) return null;
  let exact = voices.find(v => v.lang && v.lang.toLowerCase() === langCode.toLowerCase());
  if (exact) return exact;
  const prefix = langCode.split('-')[0].toLowerCase();
  let near = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
  return near || null;
}

// Audio guard: hanya satu sesi audio pada satu masa
let _audioPlaying = false;
function setAudioButtonsDisabled(disabled) {
  document.querySelectorAll('[data-audio-btn]').forEach(b => { b.disabled = disabled; });
}
async function speakText(text, langName) {
  if (!text || !window.speechSynthesis) return;
  if (_audioPlaying) return;
  _audioPlaying = true;
  setAudioButtonsDisabled(true);
  try {
    await loadVoices();
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const code = getLangCode(langName);
    u.lang = code;
    const v = pickVoice(code);
    if (v) u.voice = v;
    u.rate = adminSettings.audioRate;
    u.pitch = adminSettings.audioPitch;
    await new Promise((resolve) => {
      u.onend = resolve;
      u.onerror = resolve;
      speechSynthesis.speak(u);
      // safety timeout
      setTimeout(resolve, Math.max(3000, text.length * 220));
    });
  } finally {
    _audioPlaying = false;
    setAudioButtonsDisabled(false);
  }
}

// State Permainan
let gameState = {
  name: '', score: 0,
  targetLanguage: 'Bahasa Inggeris',
  currentLevel: null,
  questionPool: [],
  currentMalay: '', targetSentence: '',
  availableWords: [], selectedWords: []
};

let syncQueue = JSON.parse(localStorage.getItem('kacakata_sync_queue')) || [];
let audioCtx;
function initAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

// Dialog ralat
function showErrorDialog(title, errorMsg, solution) {
  Swal.fire({
    icon: 'error', title,
    html: `<div class="text-left mt-3 text-sm bg-red-50 p-4 rounded-2xl border-2 border-red-200 shadow-inner">
      <p class="font-extrabold text-red-600 mb-1">Punca:</p>
      <p class="text-gray-700 mb-4 font-medium">${errorMsg}</p>
      <p class="font-extrabold text-green-600 mb-1">Penyelesaian:</p>
      <p class="text-gray-700 font-medium">${solution}</p></div>`,
    confirmButtonColor: '#ec4899', confirmButtonText: 'Baiklah'
  });
}
window.addEventListener('error', (e) => console.error('Global:', e.error));

// SFX
function playSuccessSound() {
  initAudio();
  const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
  osc.type='sine'; osc.connect(g); g.connect(audioCtx.destination);
  const n = audioCtx.currentTime;
  osc.frequency.setValueAtTime(523.25,n); osc.frequency.setValueAtTime(659.25,n+0.1);
  osc.frequency.setValueAtTime(783.99,n+0.2); osc.frequency.setValueAtTime(1046.5,n+0.3);
  g.gain.setValueAtTime(0.1,n); g.gain.exponentialRampToValueAtTime(0.00001,n+1);
  osc.start(n); osc.stop(n+1);
}
function playErrorSound() {
  initAudio();
  const osc=audioCtx.createOscillator(); const g=audioCtx.createGain();
  osc.type='square'; osc.connect(g); g.connect(audioCtx.destination);
  const n=audioCtx.currentTime;
  osc.frequency.setValueAtTime(200,n); osc.frequency.exponentialRampToValueAtTime(50,n+0.4);
  g.gain.setValueAtTime(0.05,n); g.gain.exponentialRampToValueAtTime(0.00001,n+0.4);
  osc.start(n); osc.stop(n+0.4);
}

// PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
}

document.addEventListener('DOMContentLoaded', () => {
  initEventListeners();
  loadLocalData();
  checkNetworkStatus();
  loadVoices();
  window.addEventListener('online', () => { checkNetworkStatus(); processSyncQueue(); });
  window.addEventListener('offline', checkNetworkStatus);
});

function loadLocalData() {
  const n = localStorage.getItem('kacakata_name');
  const s = localStorage.getItem('kacakata_score');
  if (s) { gameState.score = parseInt(s); document.getElementById('display-score').textContent = gameState.score; }
  if (n) {
    document.getElementById('input-name').value = n;
    gameState.name = n; document.getElementById('display-name').textContent = n;
    toggleScreen('screen-language');
  } else {
    toggleScreen('screen-setup'); fetchLeaderboard();
  }
}

function initEventListeners() {
  document.getElementById('btn-start-game').addEventListener('click', startGameSetup);
  document.querySelectorAll('.lang-btn').forEach(btn => btn.addEventListener('click', e => selectLanguage(e.currentTarget.getAttribute('data-lang'))));
  document.getElementById('btn-custom-lang').addEventListener('click', () => {
    const v = document.getElementById('input-custom-lang').value.trim();
    if (v) selectLanguage(v); else Swal.fire('Oops!','Sila taip nama bahasa.','warning');
  });
  document.getElementById('btn-settings').addEventListener('click', () => toggleScreen('screen-language'));
  document.getElementById('btn-logout').addEventListener('click', () => {
    Swal.fire({title:'Log Keluar?',icon:'question',showCancelButton:true,confirmButtonColor:'#ec4899',confirmButtonText:'Ya, Keluar',cancelButtonText:'Batal'})
      .then(r => { if (r.isConfirmed) { localStorage.removeItem('kacakata_name'); localStorage.removeItem('kacakata_score'); location.reload(); }});
  });
  document.querySelectorAll('.level-btn').forEach(btn => btn.addEventListener('click', e => startGameLevel(e.currentTarget.getAttribute('data-level'))));
  document.getElementById('btn-check').addEventListener('click', checkAnswer);
  document.getElementById('btn-clear').addEventListener('click', clearBoard);
  document.getElementById('btn-listen').addEventListener('click', listenCurrentAnswer);
  document.getElementById('btn-listen').setAttribute('data-audio-btn','1');
  document.getElementById('btn-generate-more').addEventListener('click', () => fetchQuestionBatch(gameState.currentLevel, true));
  document.getElementById('btn-back-levels').addEventListener('click', () => toggleScreen('screen-levels'));
  document.getElementById('btn-admin').addEventListener('click', openAdminPanel);
  document.body.addEventListener('click', initAudio, { once: true });
}

function toggleScreen(id) {
  ['screen-setup','screen-language','screen-levels','screen-game'].forEach(s => document.getElementById(s).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  document.getElementById('header-section').classList.toggle('hidden', id==='screen-setup'||id==='screen-language');
}

// ==========================================
// MOD ADMIN
// ==========================================
function openAdminPanel() {
  Swal.fire({
    title: '🔐 Mod Admin',
    input: 'password',
    inputLabel: 'Masukkan kata laluan admin',
    inputPlaceholder: '••••••',
    inputAttributes: { autocapitalize:'off', autocorrect:'off' },
    showCancelButton: true, confirmButtonColor:'#ec4899', cancelButtonText:'Batal',
    confirmButtonText: 'Masuk',
    preConfirm: (val) => {
      if (val !== ADMIN_PASSWORD) { Swal.showValidationMessage('Kata laluan salah!'); return false; }
      return true;
    }
  }).then(r => { if (r.isConfirmed) showAdminControls(); });
}

function showAdminControls() {
  const rate = adminSettings.audioRate;
  const pitch = adminSettings.audioPitch;
  Swal.fire({
    title: '⚙️ Panel Admin',
    width: 560,
    html: `
      <div class="text-left space-y-4 text-sm">
        <div class="p-4 bg-purple-50 border-2 border-purple-200 rounded-2xl">
          <label class="block font-bold text-purple-700 mb-2">🔊 Kelajuan Audio: <span id="rate-val">${rate.toFixed(2)}x</span></label>
          <input id="audio-rate" type="range" min="0.4" max="1.6" step="0.05" value="${rate}" class="w-full">
          <label class="block font-bold text-purple-700 mt-3 mb-2">🎵 Pitch Audio: <span id="pitch-val">${pitch.toFixed(2)}</span></label>
          <input id="audio-pitch" type="range" min="0.5" max="1.8" step="0.05" value="${pitch}" class="w-full">
          <button id="test-audio" class="mt-3 w-full bg-purple-500 text-white font-bold py-2 rounded-xl">▶ Uji Audio</button>
        </div>
        <div class="p-4 bg-cyan-50 border-2 border-cyan-200 rounded-2xl">
          <label class="block font-bold text-cyan-700 mb-2">🔗 URL Backend (Google Apps Script)</label>
          <input id="gas-url" type="text" value="${GAS_WEB_APP_URL}" class="w-full bg-white border-2 border-cyan-200 rounded-xl px-3 py-2 text-xs">
        </div>
        <div class="p-4 bg-red-50 border-2 border-red-200 rounded-2xl space-y-2">
          <button id="reset-score" class="w-full bg-red-500 text-white font-bold py-2 rounded-xl">🗑️ Reset Markah Tempatan</button>
          <button id="clear-queue" class="w-full bg-orange-500 text-white font-bold py-2 rounded-xl">🧹 Kosongkan Baris Gilir Sinkronisasi</button>
          <button id="logout-admin" class="w-full bg-gray-700 text-white font-bold py-2 rounded-xl">🚪 Log Keluar Pelajar</button>
        </div>
      </div>
    `,
    showCancelButton: true, confirmButtonText: 'Simpan', cancelButtonText: 'Tutup', confirmButtonColor:'#10b981',
    didOpen: () => {
      const rateEl = document.getElementById('audio-rate');
      const pitchEl = document.getElementById('audio-pitch');
      rateEl.addEventListener('input', () => document.getElementById('rate-val').textContent = parseFloat(rateEl.value).toFixed(2)+'x');
      pitchEl.addEventListener('input', () => document.getElementById('pitch-val').textContent = parseFloat(pitchEl.value).toFixed(2));
      document.getElementById('test-audio').addEventListener('click', () => {
        adminSettings.audioRate = parseFloat(rateEl.value);
        adminSettings.audioPitch = parseFloat(pitchEl.value);
        speakText('Hello, this is a test of the audio speed.', gameState.targetLanguage || 'Bahasa Inggeris');
      });
      document.getElementById('reset-score').addEventListener('click', () => {
        gameState.score = 0; localStorage.setItem('kacakata_score',0);
        document.getElementById('display-score').textContent = 0;
        Swal.fire('Selesai','Markah tempatan telah direset.','success');
      });
      document.getElementById('clear-queue').addEventListener('click', () => {
        syncQueue = []; localStorage.removeItem('kacakata_sync_queue');
        Swal.fire('Selesai','Baris gilir kosong.','success');
      });
      document.getElementById('logout-admin').addEventListener('click', () => {
        localStorage.removeItem('kacakata_name'); localStorage.removeItem('kacakata_score'); location.reload();
      });
    },
    preConfirm: () => {
      adminSettings.audioRate = parseFloat(document.getElementById('audio-rate').value);
      adminSettings.audioPitch = parseFloat(document.getElementById('audio-pitch').value);
      const url = document.getElementById('gas-url').value.trim();
      if (url) { GAS_WEB_APP_URL = url; localStorage.setItem('kacakata_gas_url', url); }
      saveAdminSettings();
      return true;
    }
  }).then(r => { if (r.isConfirmed) Swal.fire({icon:'success',title:'Tetapan disimpan',timer:1200,showConfirmButton:false}); });
}

// ==========================================
// LEADERBOARD & DAFTAR
// ==========================================
async function fetchLeaderboard() {
  if (!navigator.onLine) return;
  document.getElementById('leaderboard-section').classList.remove('hidden');
  const listEl = document.getElementById('leaderboard-list');
  try {
    const res = await fetch(GAS_WEB_APP_URL, { method:'POST', headers:{'Content-Type':'text/plain;charset=utf-8'}, body: JSON.stringify({action:'getLeaderboard'}) });
    const result = await res.json();
    listEl.innerHTML = '';
    if (result.status === 'success' && result.data.length > 0) {
      result.data.forEach((p, i) => {
        const icon = i===0?'👑':i===1?'🥈':i===2?'🥉':`<span class="text-cyan-500 font-bold w-6 inline-block text-center">${i+1}.</span>`;
        listEl.innerHTML += `<div class="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border-2 border-cyan-50"><span class="font-bold flex items-center gap-3 text-gray-700"><span class="text-xl">${icon}</span><span>${p.name}</span></span><span class="font-extrabold text-yellow-500 bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-200">${p.score} pt</span></div>`;
      });
    } else {
      listEl.innerHTML = '<div class="text-center text-sm text-gray-500 py-2">Jadilah juara yang pertama!</div>';
    }
  } catch { listEl.innerHTML = '<div class="text-center text-sm text-red-400 py-2">Gagal muat rekod.</div>'; }
}

async function startGameSetup() {
  const name = document.getElementById('input-name').value.trim();
  if (!name) return Swal.fire('Alamak!','Sila tulis nama kamu.','error');
  if (name.toLowerCase() === (localStorage.getItem('kacakata_name')||'').toLowerCase()) { toggleScreen('screen-language'); return; }
  if (!navigator.onLine) return Swal.fire('Luar Talian','Perlu internet untuk daftar.','warning');
  Swal.fire({title:'Menyemak Nama...',allowOutsideClick:false,didOpen:()=>Swal.showLoading()});
  try {
    const res = await fetch(GAS_WEB_APP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'checkName',name})});
    const data = await res.json();
    if (data.status === 'exists') { Swal.fire('Oops',data.message,'error'); return; }
    Swal.close();
    gameState.name = name; gameState.score = 0;
    localStorage.setItem('kacakata_name',name); localStorage.setItem('kacakata_score',0);
    document.getElementById('display-name').textContent = name;
    document.getElementById('display-score').textContent = 0;
    toggleScreen('screen-language');
  } catch { Swal.fire('Ralat Talian','Gagal sambung ke pangkalan data.','error'); }
}

function selectLanguage(lang) {
  gameState.targetLanguage = lang;
  document.getElementById('badge-selected-lang').innerHTML = `<i data-lucide="globe-2" class="inline w-4 h-4 mr-1"></i> Mod Belajar: ${lang}`;
  document.getElementById('game-target-lang').textContent = lang;
  lucide.createIcons();
  toggleScreen('screen-levels');
}

// ==========================================
// PERMAINAN
// ==========================================
function startGameLevel(level) {
  if (!GAS_WEB_APP_URL.startsWith('https://script.google.com/')) return Swal.fire('Perhatian','Sila setup Web App URL melalui Admin','warning');
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
    const res = await fetch(GAS_WEB_APP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'getBatchQuestions',level,language:gameState.targetLanguage,forceRegenerate})});
    if (!res.ok) throw new Error('Rangkaian gagal.');
    const result = await res.json();
    if (result.status === 'error') throw new Error(result.message);
    if (!Array.isArray(result.data)) throw new Error('Format data tidak sah.');

    const pick = (o,keys) => { if(!o) return; for (const k of keys){ const f=Object.keys(o).find(x=>x.toLowerCase().trim()===k.toLowerCase()); if (f && o[f]!=null) return o[f]; } };
    const normalized = result.data.map(q => {
      if (!q||typeof q!=='object') return null;
      const malay = pick(q,['malay','melayu','bm','bahasa_melayu','source']);
      const target = pick(q,['target_sentence','target','translation','english','sentence','ayat']);
      let words = pick(q,['words','word_list','tokens','perkataan']);
      if (!malay||!target) return null;
      if (!Array.isArray(words)) words = String(target).split(/\s+/).filter(Boolean).map(w=>({word:w,pron:w}));
      words = words.map(w => {
        if (typeof w==='string') return {word:w,pron:w};
        if (!w||typeof w!=='object') return null;
        const word = pick(w,['word','text','token','perkataan']);
        const pron = pick(w,['pron','pronunciation','sebutan','phonetic','ipa','romaji']);
        return word ? {word:String(word), pron:String(pron||word)} : null;
      }).filter(Boolean);
      if (!words.length) return null;
      return { malay:String(malay), target_sentence:String(target), words };
    }).filter(Boolean);

    if (!normalized.length) {
      if (!forceRegenerate) return fetchQuestionBatch(level, true);
      throw new Error('Format soalan korup.');
    }
    gameState.questionPool = shuffleArray(normalized);
    loadNextQuestionFromPool();
  } catch (e) {
    showErrorDialog('Ralat Memuatkan Soalan', e.message, 'Sila cuba semula atau guna Admin > Reset.');
    toggleScreen('screen-levels');
  } finally {
    document.getElementById('loading-indicator').classList.add('hidden');
  }
}

function loadNextQuestionFromPool() {
  if (!gameState.questionPool.length) {
    document.getElementById('game-content').classList.add('hidden');
    document.getElementById('end-batch-ui').classList.remove('hidden');
    playSuccessSound(); return;
  }
  document.getElementById('questions-left-badge').textContent = `Baki: ${gameState.questionPool.length}`;
  const q = gameState.questionPool[0];
  setupBoard(q.malay, q.target_sentence, q.words);
}

async function fetchClueFromAI() {
  if (!navigator.onLine) { Swal.fire('Hampir!','Sila susun semula.','warning'); clearBoard(); return; }
  try {
    const r = await fetch(GAS_WEB_APP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'getClue',malay:gameState.currentMalay,english:gameState.targetSentence,language:gameState.targetLanguage})});
    const result = await r.json();
    if (result.status==='success') Swal.fire({title:'Klu Cikgu AI 💡',text:result.data,icon:'info',confirmButtonColor:'#06b6d4',confirmButtonText:'Terima Kasih'});
  } catch { Swal.fire('Hampir Tepat!','Cuba ubah sikit.','warning'); }
  clearBoard();
}

// ==========================================
// PAPAN JAWAPAN (DENGAN DRAG-REORDER)
// ==========================================
let sortablePool = null, sortableAnswer = null;

function setupBoard(malay, targetSentence, wordsArray) {
  try {
    gameState.currentMalay = String(malay);
    gameState.targetSentence = String(targetSentence).replace(/[.,!?؟。、，]/g,'').trim();
    gameState.selectedWords = [];
    document.getElementById('malay-sentence').textContent = malay;
    document.getElementById('game-content').classList.remove('hidden');
    const shuffled = shuffleArray([...wordsArray]);
    gameState.availableWords = shuffled.map((it,i) => ({ id:`word-${i}-${Date.now()}`, word: it.word, pron: it.pron }));
    renderBoard();
  } catch (e) {
    showErrorDialog('Ralat Papan', e.message, 'Sila kembali dan cuba semula.');
    toggleScreen('screen-levels');
  }
}

function shuffleArray(a) { for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

function renderBoard() {
  const poolEl = document.getElementById('word-pool');
  const ansEl = document.getElementById('answer-area');
  const placeholder = document.getElementById('answer-placeholder');

  poolEl.innerHTML = '';
  Array.from(ansEl.querySelectorAll('.word-tile')).forEach(el => el.remove());

  gameState.availableWords.forEach(w => poolEl.appendChild(createWordTile(w,'pool')));
  gameState.selectedWords.forEach(w => ansEl.appendChild(createWordTile(w,'answer')));

  if (placeholder) placeholder.style.display = gameState.selectedWords.length ? 'none' : 'block';

  // Inisialisasi Sortable untuk drag-reorder
  if (sortableAnswer) sortableAnswer.destroy();
  if (sortablePool) sortablePool.destroy();
  sortableAnswer = Sortable.create(ansEl, {
    group: 'words', animation: 180, filter: '.absolute', preventOnFilter: false,
    onEnd: syncStateFromDOM
  });
  sortablePool = Sortable.create(poolEl, {
    group: 'words', animation: 180, onEnd: syncStateFromDOM
  });
}

function syncStateFromDOM() {
  const ansEl = document.getElementById('answer-area');
  const poolEl = document.getElementById('word-pool');
  const collect = (parent) => Array.from(parent.querySelectorAll('.word-tile')).map(el => ({
    id: el.dataset.id, word: el.dataset.word, pron: el.dataset.pron
  }));
  gameState.selectedWords = collect(ansEl);
  gameState.availableWords = collect(poolEl);
  const placeholder = document.getElementById('answer-placeholder');
  if (placeholder) placeholder.style.display = gameState.selectedWords.length ? 'none' : 'block';
}

function createWordTile(wordObj, area) {
  const div = document.createElement('div');
  div.className = 'word-tile bg-white border-4 text-gray-800 font-bold py-2 px-4 rounded-2xl shadow-sm flex flex-col items-center justify-center min-w-[70px] z-10 ' +
    (area==='answer' ? 'border-pink-500 bg-pink-50' : 'border-cyan-400');
  div.dataset.id = wordObj.id; div.dataset.word = wordObj.word; div.dataset.pron = wordObj.pron || '';

  const top = document.createElement('div');
  top.className = 'flex items-center gap-1';
  const wordSpan = document.createElement('span');
  wordSpan.className = 'text-xl drop-shadow-sm';
  wordSpan.textContent = wordObj.word;
  top.appendChild(wordSpan);

  // Butang audio kecil per perkataan
  const spk = document.createElement('button');
  spk.className = 'ml-1 p-1 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200';
  spk.setAttribute('data-audio-btn','1');
  spk.title = 'Dengar perkataan';
  spk.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>';
  spk.onclick = (e) => { e.stopPropagation(); speakText(wordObj.word, gameState.targetLanguage); };
  top.appendChild(spk);

  const pronSpan = document.createElement('span');
  pronSpan.className = 'text-xs text-pink-500 mt-1 font-medium bg-pink-50 px-2 py-0.5 rounded-full';
  pronSpan.textContent = wordObj.pron || '-';

  div.appendChild(top); div.appendChild(pronSpan);

  // Click untuk pindah cepat (selain drag)
  div.onclick = () => {
    initAudio();
    if (area === 'pool') {
      gameState.availableWords = gameState.availableWords.filter(w => w.id !== wordObj.id);
      gameState.selectedWords.push(wordObj);
    } else {
      gameState.selectedWords = gameState.selectedWords.filter(w => w.id !== wordObj.id);
      gameState.availableWords.push(wordObj);
    }
    renderBoard();
  };
  return div;
}

function clearBoard() {
  if (gameState.selectedWords.length) {
    gameState.availableWords = [...gameState.availableWords, ...gameState.selectedWords];
    gameState.selectedWords = [];
    renderBoard();
  }
}

function listenCurrentAnswer() {
  syncStateFromDOM();
  const text = gameState.selectedWords.map(w => w.word).join(' ').trim();
  if (!text) { Swal.fire({icon:'info',title:'Letak perkataan dahulu',timer:1200,showConfirmButton:false}); return; }
  speakText(text, gameState.targetLanguage);
}

function checkAnswer() {
  syncStateFromDOM();
  if (!gameState.selectedWords.length) return;
  const user = gameState.selectedWords.map(w=>w.word).join(' ').toLowerCase().trim();
  const correct = gameState.targetSentence.toLowerCase().trim();
  if (user === correct) {
    playSuccessSound();
    const pts = parseInt(gameState.currentLevel) * 15;
    gameState.score += pts;
    localStorage.setItem('kacakata_score',gameState.score);
    document.getElementById('display-score').textContent = gameState.score;
    syncScoreToGAS(gameState.score);
    // Sebut jawapan dalam bahasa sasaran sebagai pengukuhan
    speakText(gameState.targetSentence, gameState.targetLanguage);
    Swal.fire({title:'Tepat Sekali! 🌟',text:`+${pts} Markah`,icon:'success',timer:1500,showConfirmButton:false,backdrop:'rgba(236,72,153,0.4)'})
      .then(()=>{ gameState.questionPool.shift(); loadNextQuestionFromPool(); });
  } else {
    playErrorSound();
    Swal.fire({title:'Menyemak...',allowOutsideClick:false,didOpen:()=>Swal.showLoading()});
    fetchClueFromAI();
  }
}

function checkNetworkStatus() {
  const on = navigator.onLine;
  const i = document.getElementById('wifi-icon'); const t = document.getElementById('sync-text');
  i.setAttribute('data-lucide', on?'wifi':'wifi-off');
  i.classList.toggle('text-cyan-500', on); i.classList.toggle('text-red-500', !on);
  t.textContent = on?'Online':'Offline';
  lucide.createIcons();
}
async function syncScoreToGAS(s) {
  const p = { action:'saveScore', name:gameState.name, score:s, level:gameState.currentLevel, isOfflineSync:false };
  if (!navigator.onLine) { p.isOfflineSync=true; syncQueue.push(p); localStorage.setItem('kacakata_sync_queue',JSON.stringify(syncQueue)); return; }
  sendData(p);
}
async function processSyncQueue() {
  if (!syncQueue.length||!navigator.onLine) return;
  const cur=[...syncQueue]; syncQueue=[]; localStorage.setItem('kacakata_sync_queue',JSON.stringify(syncQueue));
  for (const p of cur) await sendData(p);
}
async function sendData(p) {
  try { await fetch(GAS_WEB_APP_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(p)}); }
  catch { p.isOfflineSync=true; syncQueue.push(p); localStorage.setItem('kacakata_sync_queue',JSON.stringify(syncQueue)); }
}

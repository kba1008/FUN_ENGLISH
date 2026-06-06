/**
 * GOOGLE APPS SCRIPT (Code.gs)
 * Dikemaskini untuk Sistem Berbilang Bahasa (10 Bahasa Pilihan) & Sebutan Fonetik.
 * FORENSIC FIX: Ditukar kepada model 'meta-llama/llama-4-scout-17b-16e-instruct' atas arahan pengguna.
 * FORENSIC FIX 2: Ditambah semakan ketat JSON & pengurusan ralat canggih elak ralat 'undefined replace'.
 */

const SHEET_MURID = "MURID";
const SHEET_SOALAN = "SOALAN";
const SHEET_API_KEY = "API_KEY";

// ==========================================
// 1. MACROS & CUSTOM MENUS
// ==========================================

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🎮 Admin Game')
    .addItem('🛠️ Setup Database & API', 'setupDatabase')
    .addItem('🗑️ Padam Semua Markah Pelajar', 'clearData')
    .addItem('♻️ Padam Cache Soalan', 'clearSoalan')
    .addToUi();
}

function setupDatabase() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Setup Sheet MURID
  let sheetMurid = ss.getSheetByName(SHEET_MURID);
  if (!sheetMurid) {
    sheetMurid = ss.insertSheet(SHEET_MURID);
  }
  sheetMurid.getRange('A1:E1').setValues([['Timestamp', 'Nama', 'Tahap', 'Markah Terkini', 'Status Sinkronisasi']]);
  sheetMurid.getRange('A1:E1').setFontWeight('bold').setBackground('#ec4899').setFontColor('#ffffff');
  sheetMurid.setFrozenRows(1);
  sheetMurid.setColumnWidth(1, 150);

  // Setup Sheet SOALAN (Cache Pool Multi-Language)
  let sheetSoalan = ss.getSheetByName(SHEET_SOALAN);
  if (!sheetSoalan) {
    sheetSoalan = ss.insertSheet(SHEET_SOALAN);
  }
  sheetSoalan.getRange('A1:E1').setValues([['Tahap', 'Bahasa Sasaran', 'Bahasa Melayu', 'Ayat Sasaran', 'Data Perkataan (JSON)']]);
  sheetSoalan.getRange('A1:E1').setFontWeight('bold').setBackground('#06b6d4').setFontColor('#ffffff');
  sheetSoalan.setFrozenRows(1);

  // Setup API_KEY Sheet
  let sheetAPI = ss.getSheetByName(SHEET_API_KEY);
  if (!sheetAPI) {
    sheetAPI = ss.insertSheet(SHEET_API_KEY);
    sheetAPI.getRange('A1').setValue('SILA_MASUKKAN_GROQ_API_KEY_ANDA_DI_SINI');
    sheetAPI.getRange('A1').setBackground('#fde047');
    sheetAPI.getRange('A2').setValue('<- Masukkan API key bermula dengan gsk_ di petak A1');
    sheetAPI.autoResizeColumn(1);
  }
  
  SpreadsheetApp.getUi().alert('Setup Berjaya! Sila letakkan API Key anda di petak A1 dalam sheet "API_KEY".');
}

function clearData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Amaran', 'Adakah anda pasti mahu memadam SEMUA rekod pemain dalam sheet MURID?', ui.ButtonSet.YES_NO);
  if (response == ui.Button.YES) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MURID);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).clearContent();
    }
    ui.alert('Data murid berjaya dipadam.');
  }
}

function clearSoalan() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SOALAN);
  if (sheet && sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 5).clearContent();
  }
  SpreadsheetApp.getUi().alert('Cache pool SOALAN berjaya dibersihkan. AI akan menjana soalan baru kelak.');
}

// ==========================================
// 2. WEB APP ENDPOINTS (doPost / doGet)
// ==========================================

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    if (action === 'saveScore') return handleSaveScore(payload);
    else if (action === 'getBatchQuestions') return handleGetBatchQuestions(payload);
    else if (action === 'getClue') return handleGetClue(payload);
    else if (action === 'checkName') return handleCheckName(payload);
    else if (action === 'getLeaderboard') return handleGetLeaderboard();
    else throw new Error("Tindakan tidak sah.");

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleCheckName(payload) {
  const name = payload.name.trim();
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MURID);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: "available" })).setMimeType(ContentService.MimeType.JSON);
  
  let data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][1].toString().trim().toLowerCase() === name.toLowerCase()) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "exists", 
        message: "Nama telah digunakan sebelum ini. Sambung semula latihan?",
        score: parseInt(data[i][3]) || 0,
        level: data[i][2] || 1
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ status: "available" })).setMimeType(ContentService.MimeType.JSON);
}

function handleGetLeaderboard() {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MURID);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify({ status: "success", data: [] })).setMimeType(ContentService.MimeType.JSON);
  
  let data = sheet.getDataRange().getValues();
  let players = [];
  
  for (let i = 1; i < data.length; i++) {
    if(data[i][1]) {
      players.push({
        name: data[i][1],
        score: parseInt(data[i][3]) || 0
      });
    }
  }
  
  players.sort((a, b) => b.score - a.score);
  let top10 = players.slice(0, 10);
  
  return ContentService.createTextOutput(JSON.stringify({ 
    status: "success", 
    data: top10 
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleSaveScore(payload) {
  const name = payload.name || "Unknown";
  const score = parseInt(payload.score) || 0;
  const level = payload.level || 1;
  const timestamp = new Date();
  const syncStatus = payload.isOfflineSync ? "Disegerak Offline" : "Live Sync";

  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_MURID);
  if (!sheet) {
     sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_MURID);
     sheet.getRange('A1:E1').setValues([['Timestamp', 'Nama', 'Tahap', 'Markah Terkini', 'Status Sinkronisasi']]);
  }

  let data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][1].toString().trim().toLowerCase() === name.trim().toLowerCase()) {
      rowIndex = i + 1;
      break;
    }
  }

  if (rowIndex > -1) {
    let currentScore = parseInt(sheet.getRange(rowIndex, 4).getValue()) || 0;
    if (score > currentScore) {
      sheet.getRange(rowIndex, 1).setValue(timestamp);
      sheet.getRange(rowIndex, 3).setValue(level);
      sheet.getRange(rowIndex, 4).setValue(score);
      sheet.getRange(rowIndex, 5).setValue(syncStatus);
    }
  } else {
    sheet.appendRow([timestamp, name, level, score, syncStatus]);
  }

  return ContentService.createTextOutput(JSON.stringify({status: "success"})).setMimeType(ContentService.MimeType.JSON);
}

function getApiKey() {
  const sheetAPI = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_API_KEY);
  if (!sheetAPI) throw new Error("Sila jalankan Admin Game -> Setup Database");
  const apiKey = sheetAPI.getRange("A1").getValue();
  if (!apiKey || apiKey.includes('SILA_MASUKKAN')) throw new Error("Sila masukkan Groq API Key yang sah di dalam sheet 'API_KEY'.");
  return apiKey;
}

function callGroqApi(apiKey, prompt) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    payload: JSON.stringify({
      // FORENSIC FIX: Ditukar kepada model yang diminta pengguna (meta-llama/llama-4-scout-17b-16e-instruct)
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7
    }),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  
  if (response.getResponseCode() !== 200) {
    throw new Error(data.error ? data.error.message : "Ralat sambungan pelayan Groq AI.");
  }
  return data.choices[0].message.content.trim();
}

// ===== AUTO-NORMALIZER: tukar mana-mana variasi key kepada format standard =====
function pickKey(obj, candidates) {
  if (!obj || typeof obj !== 'object') return undefined;
  const keys = Object.keys(obj);
  for (const cand of candidates) {
    const found = keys.find(k => k.toLowerCase().trim() === cand.toLowerCase());
    if (found !== undefined && obj[found] !== undefined && obj[found] !== null) return obj[found];
  }
  return undefined;
}

function normalizeWord(w, fallbackIndex) {
  if (typeof w === 'string') return { word: w, pron: w };
  if (!w || typeof w !== 'object') return null;
  const word = pickKey(w, ['word', 'text', 'token', 'perkataan', 'kata']);
  const pron = pickKey(w, ['pron', 'pronunciation', 'sebutan', 'phonetic', 'phonetics', 'ipa', 'romaji']);
  if (!word) return null;
  return { word: String(word), pron: String(pron || word) };
}

function normalizeQuestion(q) {
  if (!q || typeof q !== 'object') return null;
  const malay = pickKey(q, ['malay', 'melayu', 'bm', 'bahasa_melayu', 'malay_sentence', 'source', 'sumber']);
  const target = pickKey(q, ['target_sentence', 'target', 'translation', 'english', 'sentence', 'ayat', 'ayat_sasaran', 'terjemahan']);
  let wordsRaw = pickKey(q, ['words', 'word_list', 'tokens', 'perkataan', 'kata']);

  if (!malay || !target) return null;

  // Jika words tiada, bina automatik dari target sentence
  if (!Array.isArray(wordsRaw)) {
    wordsRaw = String(target).split(/\s+/).filter(Boolean).map(w => ({ word: w, pron: w }));
  }

  const words = wordsRaw.map((w, i) => normalizeWord(w, i)).filter(Boolean);
  if (words.length === 0) return null;

  return { malay: String(malay), target_sentence: String(target), words: words };
}

function extractJsonArray(content) {
  if (!content) return null;
  let txt = String(content).trim();
  // Buang markdown fences
  txt = txt.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  // Cuba parse terus
  try { const p = JSON.parse(txt); if (Array.isArray(p)) return p; if (p && Array.isArray(p.data)) return p.data; if (p && Array.isArray(p.questions)) return p.questions; } catch(e) {}
  // Cari array pertama dalam teks
  const first = txt.indexOf('[');
  const last = txt.lastIndexOf(']');
  if (first !== -1 && last > first) {
    const slice = txt.substring(first, last + 1);
    try { const p = JSON.parse(slice); if (Array.isArray(p)) return p; } catch(e) {}
  }
  return null;
}

function handleGetBatchQuestions(payload) {
  const level = payload.level;
  const language = payload.language || "Bahasa Inggeris";
  const forceRegenerate = payload.forceRegenerate === true;
  
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_SOALAN);
  if(!sheet) {
     setupDatabase();
     sheet = ss.getSheetByName(SHEET_SOALAN);
  }

  let data = sheet.getDataRange().getValues();
  let existingQuestions = [];
  let rowsToDelete = [];
  let corruptRows = [];
  
  // Semak cache berdasarkan Tahap DAN Bahasa Sasaran
  for(let i=1; i<data.length; i++) {
    if(data[i][0] == level && data[i][1] && data[i][1].toString().toLowerCase() === language.toLowerCase()) {
       try {
         const q = normalizeQuestion({
           malay: data[i][2],
           target_sentence: data[i][3],
           words: JSON.parse(data[i][4])
         });
         if (q) {
           existingQuestions.push(q);
           rowsToDelete.push(i + 1);
         } else {
           corruptRows.push(i + 1);
         }
       } catch(e){
         corruptRows.push(i + 1);
       }
    }
  }

  // AUTO-PADAM baris cache yang korup supaya tak ganggu masa depan
  if (corruptRows.length > 0) {
    for (let i = corruptRows.length - 1; i >= 0; i--) {
      try { sheet.deleteRow(corruptRows[i]); } catch(e){}
    }
  }

  if (!forceRegenerate && existingQuestions.length >= 5) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      source: "cache",
      data: existingQuestions
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const apiKey = getApiKey();
  let difficulty = '';
  if (level == 1) difficulty = 'sangat mudah, pendek (2-4 patah perkataan), sesuai kanak-kanak / pemula.';
  if (level == 2) difficulty = 'sederhana (4-7 patah perkataan), membina ayat biasa.';
  if (level == 3) difficulty = 'agak kompleks (7-10 patah perkataan).';

  const buildPrompt = (strictMode) => `Anda pakar pelbagai bahasa. Bina 15 soalan rawak dalam Bahasa Melayu yang ${difficulty}. Terjemahkan ayat tersebut dengan tepat ke dalam ${language}.

HANYA berikan output JSON array tulen, tanpa markdown atau penerangan. Contoh:
[
  {
    "malay": "Saya suka makan epal",
    "target_sentence": "Watashi wa ringo o taberu no ga suki desu",
    "words": [
      {"word": "Watashi", "pron": "wa-ta-shi"},
      {"word": "ringo", "pron": "ring-go"}
    ]
  }
]

WAJIB${strictMode ? ' (PERCUBAAN AKHIR – jangan ubah format)' : ''}: setiap objek MESTI ada 3 kekunci huruf kecil "malay", "target_sentence", "words". Setiap item dalam "words" MESTI ada "word" dan "pron". JANGAN gunakan nama lain seperti "english", "sentence", "translation", "pronunciation". JANGAN tambah teks lain.`;

  // AUTO-RETRY sehingga 3x jika AI keluarkan format korup
  let parsedData = [];
  let lastError = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      let content = callGroqApi(apiKey, buildPrompt(attempt >= 2));
      const arr = extractJsonArray(content);
      if (!arr) { lastError = 'Tidak jumpa JSON array dalam respons AI.'; continue; }
      const normalized = arr.map(normalizeQuestion).filter(Boolean);
      if (normalized.length > 0) { parsedData = normalized; break; }
      lastError = 'Semua item gagal normalisasi (kekunci hilang).';
    } catch (err) {
      lastError = err.message || String(err);
    }
  }

  // Jika AI masih gagal tetapi kita ada cache lama, guna cache
  if (parsedData.length === 0) {
    if (existingQuestions.length > 0) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        source: "cache_fallback",
        data: existingQuestions,
        notice: "AI gagal menjana format baharu, guna cache sedia ada. Punca: " + lastError
      })).setMimeType(ContentService.MimeType.JSON);
    }
    throw new Error("AI gagal menjana soalan dalam format yang betul selepas 3 percubaan. Punca: " + lastError);
  }

  if (rowsToDelete.length > 0) {
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      try { sheet.deleteRow(rowsToDelete[i]); } catch(e){}
    }
  }

  let rowsToAppend = parsedData.map(q => [level, language, q.malay, q.target_sentence, JSON.stringify(q.words)]);
  if (rowsToAppend.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, 5).setValues(rowsToAppend);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    source: "ai_generated",
    data: parsedData
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleGetClue(payload) {
  const apiKey = getApiKey();
  const malay = payload.malay;
  const english = payload.english; 
  const language = payload.language;

  const prompt = `Murid salah menyusun terjemahan ${language}.
Maksud asal: "${malay}"
Jawapan sebenar: "${english}"

Berikan SATU klu ringkas (maksimum 15 patah perkataan) dalam Bahasa Melayu. Beri petunjuk hukum tatabahasa atau permulaan ayat tanpa memberi jawapan penuh terus.`;

  const clue = callGroqApi(apiKey, prompt);

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    data: clue
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput("Sistem Kaca Kata Multi-Language dengan Pengurusan Ralat Canggih Aktif.");
}

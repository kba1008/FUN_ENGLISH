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

// Versi khas untuk jana soalan – guna JSON mode + system message ketat.
function callGroqApiJson(apiKey, prompt) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    payload: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: 'You are a strict JSON generator. You MUST output valid JSON only, no markdown, no commentary. Use EXACTLY the schema requested with lowercase English keys.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
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
  const malay = pickKey(q, ['malay', 'melayu', 'bm', 'bahasa_melayu', 'malay_sentence', 'source', 'sumber', 'soalan', 'question', 'malay_text', 'bm_sentence', 'asal']);
  const target = pickKey(q, ['target_sentence', 'target', 'translation', 'english', 'english_sentence', 'sentence', 'ayat', 'ayat_sasaran', 'terjemahan', 'translated', 'answer', 'jawapan', 'target_text']);
  let wordsRaw = pickKey(q, ['words', 'word_list', 'tokens', 'perkataan', 'kata', 'word_array', 'word_data', 'translation_words']);

  if (!malay || !target) return null;

  // Jika words tiada, bina automatik dari target sentence
  if (!Array.isArray(wordsRaw)) {
    wordsRaw = String(target).split(/\s+/).filter(Boolean).map(w => ({ word: w, pron: w }));
  }

  const words = wordsRaw.map((w, i) => normalizeWord(w, i)).filter(Boolean);
  if (words.length === 0) return null;

  return { malay: String(malay), target_sentence: String(target), words: words };
}

// Cari semua array dalam JSON secara rekursif dan kumpul item yang nampak seperti soalan.
function deepCollectQuestions(node, out) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      var item = node[i];
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        var q = normalizeQuestion(item);
        if (q) out.push(q);
        else deepCollectQuestions(item, out);
      } else {
        deepCollectQuestions(item, out);
      }
    }
  } else if (typeof node === 'object') {
    for (var k in node) deepCollectQuestions(node[k], out);
  }
}

function extractJsonArray(content) {
  if (!content) return null;
  let txt = String(content).trim();
  // Buang markdown fences
  txt = txt.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  // Cuba parse terus
  try {
    const p = JSON.parse(txt);
    if (Array.isArray(p)) return p;
    if (p && typeof p === 'object') {
      // Cari array utama dengan kekunci biasa
      var candidates = ['questions', 'data', 'soalan', 'items', 'list', 'results', 'output'];
      for (var i = 0; i < candidates.length; i++) {
        if (Array.isArray(p[candidates[i]])) return p[candidates[i]];
      }
      // Jika tiada, cari mana-mana property yang merupakan array objek
      for (var k in p) {
        if (Array.isArray(p[k]) && p[k].length && typeof p[k][0] === 'object') return p[k];
      }
      // Jika objek tunggal yang sah, balut sebagai array
      return [p];
    }
  } catch(e) {}
  // Cari array pertama dalam teks
  const first = txt.indexOf('[');
  const last = txt.lastIndexOf(']');
  if (first !== -1 && last > first) {
    const slice = txt.substring(first, last + 1);
    try { const p = JSON.parse(slice); if (Array.isArray(p)) return p; } catch(e) {}
  }
  // Last resort: cari object pertama
  const ofirst = txt.indexOf('{');
  const olast = txt.lastIndexOf('}');
  if (ofirst !== -1 && olast > ofirst) {
    try { const p = JSON.parse(txt.substring(ofirst, olast + 1)); return [p]; } catch(e) {}
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

  const buildPrompt = (strictMode) => `Tugas: Bina 15 soalan terjemahan untuk pelajar.
Bahasa sumber: Bahasa Melayu (${difficulty})
Bahasa sasaran: ${language}

OUTPUT JSON SAHAJA dengan struktur INI TEPAT (tiada teks lain):
{
  "questions": [
    {
      "malay": "<ayat dalam Bahasa Melayu>",
      "target_sentence": "<terjemahan dalam ${language}>",
      "words": [
        {"word": "<perkataan dalam ${language}>", "pron": "<sebutan fonetik mudah>"}
      ]
    }
  ]
}

Peraturan WAJIB${strictMode ? ' (PERCUBAAN AKHIR)' : ''}:
- Gunakan TEPAT kekunci huruf kecil ini: "questions", "malay", "target_sentence", "words", "word", "pron".
- JANGAN guna nama lain seperti "english", "sentence", "translation", "pronunciation", "bahasa_melayu".
- "words" mesti senarai setiap perkataan dalam "target_sentence" mengikut urutan.
- "pron" ialah sebutan fonetik mudah (contoh: "ring-go", "ai lavv yu").
- Hasilkan 15 soalan berbeza, rawak, sesuai untuk pelajar OKU.
- Output JSON object sahaja. Tiada markdown, tiada komen.`;

  // AUTO-RETRY sehingga 3x jika AI keluarkan format korup
  let parsedData = [];
  let lastError = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      let content = callGroqApiJson(apiKey, buildPrompt(attempt >= 2));
      const arr = extractJsonArray(content);
      let normalized = arr ? arr.map(normalizeQuestion).filter(Boolean) : [];
      // Fallback: deep-scan jika normalisasi flat gagal
      if (normalized.length === 0) {
        try {
          const parsed = JSON.parse(content);
          const out = [];
          deepCollectQuestions(parsed, out);
          if (out.length > 0) normalized = out;
        } catch (e) {}
      }
      if (normalized.length > 0) { parsedData = normalized; break; }
      lastError = 'Semua item gagal normalisasi (kekunci hilang). Sampel respons: ' + String(content).substring(0, 200);
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

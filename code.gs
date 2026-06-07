/**
 * GOOGLE APPS SCRIPT (Code.gs)
 * Kaca Kata - Multi Language + Multi Mother-Tongue + Tatabahasa Tepat
 * Versi: v10
 */

const SHEET_MURID = "MURID";
const SHEET_SOALAN = "SOALAN";
const SHEET_API_KEY = "API_KEY";

// ==========================================
// 1. MACROS & MENUS
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

  let sheetMurid = ss.getSheetByName(SHEET_MURID);
  if (!sheetMurid) sheetMurid = ss.insertSheet(SHEET_MURID);
  sheetMurid.getRange('A1:E1').setValues([['Timestamp', 'Nama', 'Tahap', 'Markah Terkini', 'Status Sinkronisasi']]);
  sheetMurid.getRange('A1:E1').setFontWeight('bold').setBackground('#ec4899').setFontColor('#ffffff');
  sheetMurid.setFrozenRows(1);
  sheetMurid.setColumnWidth(1, 150);

  let sheetSoalan = ss.getSheetByName(SHEET_SOALAN);
  if (!sheetSoalan) sheetSoalan = ss.insertSheet(SHEET_SOALAN);
  // NOTE: Kolum 3 (Ayat Sumber) kini menyimpan ayat bahasa ibunda; kolum 6 = bahasa ibunda
  sheetSoalan.getRange('A1:F1').setValues([['Tahap', 'Bahasa Sasaran', 'Ayat Sumber', 'Ayat Sasaran', 'Data Perkataan (JSON)', 'Bahasa Ibunda']]);
  sheetSoalan.getRange('A1:F1').setFontWeight('bold').setBackground('#06b6d4').setFontColor('#ffffff');
  sheetSoalan.setFrozenRows(1);

  let sheetAPI = ss.getSheetByName(SHEET_API_KEY);
  if (!sheetAPI) {
    sheetAPI = ss.insertSheet(SHEET_API_KEY);
    sheetAPI.getRange('A1').setValue('SILA_MASUKKAN_GROQ_API_KEY_ANDA_DI_SINI');
    sheetAPI.getRange('A1').setBackground('#fde047');
    sheetAPI.getRange('A2').setValue('<- Masukkan API key bermula dengan gsk_ di A1');
    sheetAPI.autoResizeColumn(1);
  }

  SpreadsheetApp.getUi().alert('Setup Berjaya! Letakkan API Key anda di A1 dalam sheet "API_KEY".');
}

function clearData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert('Amaran', 'Padam SEMUA rekod murid?', ui.ButtonSet.YES_NO);
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
    sheet.getRange(2, 1, sheet.getLastRow() - 1, 6).clearContent();
  }
  SpreadsheetApp.getUi().alert('Cache SOALAN dibersihkan.');
}

// ==========================================
// 2. ENDPOINTS
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
      status: "error", message: error.toString()
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
        status: "exists", score: parseInt(data[i][3]) || 0, level: data[i][2] || 1
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
    if(data[i][1]) players.push({ name: data[i][1], score: parseInt(data[i][3]) || 0 });
  }
  players.sort((a, b) => b.score - a.score);
  return ContentService.createTextOutput(JSON.stringify({
    status: "success", data: players.slice(0, 10)
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
      rowIndex = i + 1; break;
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
  if (!apiKey || apiKey.toString().includes('SILA_MASUKKAN')) throw new Error("Sila masukkan Groq API Key di sheet 'API_KEY'.");
  return apiKey;
}

function callGroqApi(apiKey, prompt) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const options = {
    method: 'post', contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    payload: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5
    }),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  if (response.getResponseCode() !== 200) throw new Error(data.error ? data.error.message : "Ralat Groq.");
  return data.choices[0].message.content.trim();
}

function callGroqApiJson(apiKey, prompt) {
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const options = {
    method: 'post', contentType: 'application/json',
    headers: { 'Authorization': `Bearer ${apiKey}` },
    payload: JSON.stringify({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        { role: 'system', content: 'You are an expert language teacher and strict JSON generator. Always output grammatically perfect, natural sentences. Use lowercase English keys exactly as requested. No markdown, no commentary.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      response_format: { type: 'json_object' }
    }),
    muteHttpExceptions: true
  };
  const response = UrlFetchApp.fetch(url, options);
  const data = JSON.parse(response.getContentText());
  if (response.getResponseCode() !== 200) throw new Error(data.error ? data.error.message : "Ralat Groq.");
  return data.choices[0].message.content.trim();
}

// ===== NORMALIZER =====
function pickKey(obj, candidates) {
  if (!obj || typeof obj !== 'object') return undefined;
  const keys = Object.keys(obj);
  for (const cand of candidates) {
    const found = keys.find(k => k.toLowerCase().trim() === cand.toLowerCase());
    if (found !== undefined && obj[found] !== undefined && obj[found] !== null) return obj[found];
  }
  return undefined;
}
function normalizeWord(w) {
  if (typeof w === 'string') return { word: w, pron: w };
  if (!w || typeof w !== 'object') return null;
  const word = pickKey(w, ['word', 'text', 'token', 'perkataan', 'kata']);
  const pron = pickKey(w, ['pron', 'pronunciation', 'sebutan', 'phonetic', 'phonetics', 'ipa', 'romaji']);
  if (!word) return null;
  return { word: String(word), pron: String(pron || word) };
}
function normalizeQuestion(q) {
  if (!q || typeof q !== 'object') return null;
  const source = pickKey(q, ['source','malay','melayu','bm','bahasa_melayu','source_sentence','mother','ibunda','question','asal']);
  const target = pickKey(q, ['target_sentence','target','translation','english','sentence','ayat','terjemahan','jawapan','target_text']);
  let wordsRaw = pickKey(q, ['words','word_list','tokens','perkataan','kata','word_data','translation_words']);
  if (!source || !target) return null;
  if (!Array.isArray(wordsRaw)) {
    wordsRaw = String(target).split(/\s+/).filter(Boolean).map(w => ({ word: w, pron: w }));
  }
  const words = wordsRaw.map(normalizeWord).filter(Boolean);
  if (words.length === 0) return null;
  return { source: String(source), target_sentence: String(target), words: words };
}
function deepCollectQuestions(node, out) {
  if (!node) return;
  if (Array.isArray(node)) {
    for (var i = 0; i < node.length; i++) {
      var item = node[i];
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        var q = normalizeQuestion(item);
        if (q) out.push(q); else deepCollectQuestions(item, out);
      } else deepCollectQuestions(item, out);
    }
  } else if (typeof node === 'object') {
    for (var k in node) deepCollectQuestions(node[k], out);
  }
}
function extractJsonArray(content) {
  if (!content) return null;
  let txt = String(content).trim();
  txt = txt.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  try {
    const p = JSON.parse(txt);
    if (Array.isArray(p)) return p;
    if (p && typeof p === 'object') {
      var cands = ['questions', 'data', 'soalan', 'items', 'list', 'results', 'output'];
      for (var i = 0; i < cands.length; i++) if (Array.isArray(p[cands[i]])) return p[cands[i]];
      for (var k in p) if (Array.isArray(p[k]) && p[k].length && typeof p[k][0] === 'object') return p[k];
      return [p];
    }
  } catch(e) {}
  const first = txt.indexOf('['), last = txt.lastIndexOf(']');
  if (first !== -1 && last > first) {
    try { const p = JSON.parse(txt.substring(first, last + 1)); if (Array.isArray(p)) return p; } catch(e) {}
  }
  const of_ = txt.indexOf('{'), ol = txt.lastIndexOf('}');
  if (of_ !== -1 && ol > of_) {
    try { return [JSON.parse(txt.substring(of_, ol + 1))]; } catch(e) {}
  }
  return null;
}

// ==========================================
// JANA SOALAN (HANYA bila bahasa+tahap dipilih)
// ==========================================
function handleGetBatchQuestions(payload) {
  const level = payload.level;
  const language = payload.language || "Bahasa Inggeris";
  const motherTongue = payload.motherTongue || "Bahasa Melayu";
  const forceRegenerate = payload.forceRegenerate === true;

  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_SOALAN);
  if(!sheet) { setupDatabase(); sheet = ss.getSheetByName(SHEET_SOALAN); }

  // Pastikan ada 6 kolum (untuk fail lama)
  if (sheet.getLastColumn() < 6) {
    sheet.getRange(1, 6).setValue('Bahasa Ibunda');
  }

  let data = sheet.getDataRange().getValues();
  let existingQuestions = [];
  let rowsToDelete = [];
  let corruptRows = [];

  for(let i=1; i<data.length; i++) {
    const rowMother = (data[i][5] || 'Bahasa Melayu').toString().toLowerCase();
    if(data[i][0] == level
       && data[i][1] && data[i][1].toString().toLowerCase() === language.toLowerCase()
       && rowMother === motherTongue.toLowerCase()) {
       try {
         const q = normalizeQuestion({
           source: data[i][2], target_sentence: data[i][3], words: JSON.parse(data[i][4])
         });
         if (q) { existingQuestions.push(q); rowsToDelete.push(i + 1); }
         else corruptRows.push(i + 1);
       } catch(e){ corruptRows.push(i + 1); }
    }
  }

  if (corruptRows.length > 0) {
    for (let i = corruptRows.length - 1; i >= 0; i--) {
      try { sheet.deleteRow(corruptRows[i]); } catch(e){}
    }
  }

  if (!forceRegenerate && existingQuestions.length >= 5) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success", source: "cache",
      data: existingQuestions.map(q => ({ malay: q.source, target_sentence: q.target_sentence, words: q.words }))
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const apiKey = getApiKey();
  let difficulty = '';
  if (level == 1) difficulty = 'sangat mudah & pendek (2-4 patah perkataan), sesuai pemula/kanak-kanak.';
  else if (level == 2) difficulty = 'sederhana (4-7 patah perkataan), ayat harian biasa.';
  else difficulty = 'kompleks (7-10 patah perkataan), ayat majmuk yang masih natural.';

  const buildPrompt = (strictMode) => `Anda adalah CIKGU BAHASA pakar. Tugas: bina 15 pasangan ayat terjemahan untuk pelajar.

BAHASA SUMBER (bahasa ibunda pelajar): ${motherTongue}
BAHASA SASARAN (yang ingin dipelajari): ${language}
TAHAP: ${difficulty}

WAJIB PATUH:
1. Setiap ayat dalam ${motherTongue} MESTI menggunakan TATABAHASA & EJAAN yang BETUL 100%.
2. Setiap terjemahan dalam ${language} MESTI gramatis, natural, dan benar dari segi struktur ayat penutur jati. JANGAN terjemah secara harfiah perkataan demi perkataan.
3. Kekalkan makna yang sama antara kedua-dua ayat.
4. Gunakan kosa kata harian yang sesuai dengan tahap pelajar.
5. Untuk bahasa bukan rumi (Arab/Mandarin/Jepun/Korea/Thai/Hindi/Tamil/Rusia), kekalkan tulisan asli dalam "word" dan beri "pron" dalam rumi yang mudah disebut.
6. "words" mesti pecahan TEPAT bagi "target_sentence" mengikut urutan asal.

OUTPUT JSON SAHAJA (tiada teks lain) dengan struktur INI TEPAT:
{
  "questions": [
    {
      "source": "<ayat dalam ${motherTongue}>",
      "target_sentence": "<terjemahan natural & gramatis dalam ${language}>",
      "words": [
        {"word": "<perkataan dalam ${language}>", "pron": "<sebutan rumi mudah>"}
      ]
    }
  ]
}

Kekunci JSON WAJIB${strictMode ? ' (PERCUBAAN AKHIR)' : ''}: "questions", "source", "target_sentence", "words", "word", "pron". Semua huruf kecil. JANGAN ubah nama kekunci. JANGAN guna markdown.`;

  let parsedData = [];
  let lastError = '';
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      let content = callGroqApiJson(apiKey, buildPrompt(attempt >= 2));
      const arr = extractJsonArray(content);
      let normalized = arr ? arr.map(normalizeQuestion).filter(Boolean) : [];
      if (normalized.length === 0) {
        try {
          const parsed = JSON.parse(content);
          const out = []; deepCollectQuestions(parsed, out);
          if (out.length > 0) normalized = out;
        } catch (e) {}
      }
      if (normalized.length > 0) { parsedData = normalized; break; }
      lastError = 'Normalisasi gagal. Sampel: ' + String(content).substring(0, 200);
    } catch (err) {
      lastError = err.message || String(err);
    }
  }

  if (parsedData.length === 0) {
    if (existingQuestions.length > 0) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success", source: "cache_fallback",
        data: existingQuestions.map(q => ({ malay: q.source, target_sentence: q.target_sentence, words: q.words })),
        notice: "AI gagal jana, guna cache. " + lastError
      })).setMimeType(ContentService.MimeType.JSON);
    }
    throw new Error("AI gagal jana soalan selepas 3 percubaan. " + lastError);
  }

  if (rowsToDelete.length > 0) {
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      try { sheet.deleteRow(rowsToDelete[i]); } catch(e){}
    }
  }

  let rowsToAppend = parsedData.map(q => [level, language, q.source, q.target_sentence, JSON.stringify(q.words), motherTongue]);
  if (rowsToAppend.length > 0) {
    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToAppend.length, 6).setValues(rowsToAppend);
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success", source: "ai_generated",
    data: parsedData.map(q => ({ malay: q.source, target_sentence: q.target_sentence, words: q.words }))
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleGetClue(payload) {
  const apiKey = getApiKey();
  const source = payload.malay;
  const target = payload.english;
  const language = payload.language;
  const motherTongue = payload.motherTongue || 'Bahasa Melayu';

  const prompt = `Seorang murid salah menyusun terjemahan ${language}.
Ayat asal (${motherTongue}): "${source}"
Jawapan yang betul (${language}): "${target}"

Berikan SATU klu ringkas (maksimum 15 patah perkataan) dalam ${motherTongue}. Beri petunjuk tatabahasa atau permulaan ayat sahaja — JANGAN beri jawapan penuh.`;

  const clue = callGroqApi(apiKey, prompt);
  return ContentService.createTextOutput(JSON.stringify({
    status: "success", data: clue
  })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput("Sistem Kaca Kata v10 (Multi Mother-Tongue + Strict Grammar) Aktif.");
}

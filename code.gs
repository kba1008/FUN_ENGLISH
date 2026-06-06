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
        message: "Nama telah digunakan. Sila letak nama panggilan lain."
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
  
  // Semak cache berdasarkan Tahap DAN Bahasa Sasaran
  for(let i=1; i<data.length; i++) {
    if(data[i][0] == level && data[i][1].toString().toLowerCase() === language.toLowerCase()) {
       try {
         existingQuestions.push({
           malay: data[i][2],
           target_sentence: data[i][3],
           words: JSON.parse(data[i][4])
         });
         rowsToDelete.push(i + 1);
       } catch(e){}
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

  // Hadkan kepada 15 soalan kerana saiz JSON besar dengan cara sebutan
  const prompt = `Anda pakar pelbagai bahasa. Bina 15 soalan rawak dalam Bahasa Melayu yang ${difficulty}. Terjemahkan ayat tersebut dengan tepat ke dalam ${language}.

HANYA berikan output dalam format tatasusunan JSON (JSON array) seperti contoh ini SAHAJA tanpa sebarang teks markdown atau penerangan:
[
  {
    "malay": "Saya suka makan epal",
    "target_sentence": "Watashi wa ringo o taberu no ga suki desu",
    "words": [
      {"word": "Watashi", "pron": "wa-ta-shi"},
      {"word": "wa", "pron": "wa"},
      {"word": "ringo", "pron": "ring-go"},
      {"word": "o", "pron": "o"},
      {"word": "taberu", "pron": "ta-be-ru"},
      {"word": "no", "pron": "no"},
      {"word": "ga", "pron": "ga"},
      {"word": "suki", "pron": "su-ki"},
      {"word": "desu", "pron": "de-su"}
    ]
  }
]

PENTING: Anda MESTI mengekalkan kunci objek (object keys) "malay", "target_sentence", dan "words" menggunakan huruf kecil dan ejaan yang tepat untuk memastikan sistem tidak ralat (Cannot read properties of undefined). Di dalam tatasusunan "words", pastikan setiap objek mempunyai kunci "word" dan "pron". Kunci ini adalah mandatori dan tidak boleh diubah!`;

  let content = callGroqApi(apiKey, prompt);
  
  if (content.startsWith('```json')) content = content.replace(/^```json/, '');
  if (content.startsWith('```')) content = content.replace(/^```/, '');
  if (content.endsWith('```')) content = content.replace(/```$/, '');
  content = content.trim();

  let parsedData;
  try {
    parsedData = JSON.parse(content);
    if (!Array.isArray(parsedData)) throw new Error("Format yang dikembalikan bukan bentuk tatasusunan (Array).");
    
    // PENGURUSAN RALAT CANGGIH: Validate setiap rekod supaya tak jadi ralat undefined kat frontend
    parsedData = parsedData.filter(q => q && q.malay && q.target_sentence && Array.isArray(q.words));
    
    if (parsedData.length === 0) throw new Error("Struktur JSON dikembalikan secara sintaksis sah, tetapi kekunci wajib (keys) seperti 'malay', 'target_sentence' atau 'words' telah diabaikan atau salah ejaan oleh AI.");

  } catch (err) {
    throw new Error("Format ralat dari AI. Punca: " + err.message);
  }

  if (rowsToDelete.length > 0) {
    for (let i = rowsToDelete.length - 1; i >= 0; i--) {
      sheet.deleteRow(rowsToDelete[i]);
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

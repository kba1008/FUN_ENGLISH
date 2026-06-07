// ==========================================
// KONFIGURASI BACKEND
// ==========================================
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxuSBUyw9uV-CSB8ZK4l-EdpgtK3VoyxIOiL3oHhREVQ1EwVdaCpJKaGTPHJ94XDbGE/exec';

// ==========================================
// I18N — KAMUS UI MENGIKUT BAHASA IBUNDA
// ==========================================
const I18N = {
  'Bahasa Melayu': {
    app_title:'Kaca Kata - Kuasai Pelbagai Bahasa', tagline:'Belajar pelbagai bahasa dunia dengan mudah & menyeronokkan!',
    label_name:'Nama Panggilan Kamu', ph_name:'Contoh: Ali, Sarah...', label_mother:'Bahasa Ibunda',
    mother_hint:'Seluruh aplikasi & soalan akan ditukar mengikut bahasa ini.', mother_current:'Bahasa Ibunda Semasa',
    btn_next:'Seterusnya 🚀', btn_admin:'🔒 Mod Admin', leaderboard_title:'Juara Bahasa',
    lang_pick_title:'Pilih Bahasa Sasaran 🌍', lang_pick_sub:'Kamu ingin belajar bahasa apa hari ini?',
    lang_custom:'Atau taip bahasa lain:', ph_custom:'Contoh: Bahasa Itali', btn_start:'Mula',
    level_title:'Pilih Tahap Kesukaran 🚀', level_hint:'💡 Soalan hanya dijana selepas anda pilih tahap',
    level1_title:'Tahap 1: Asas', level1_desc:'Sangat Mudah (Pemula)',
    level2_title:'Tahap 2: Biasa', level2_desc:'Sederhana (Membina Ayat)',
    level3_title:'Tahap 3: Hebat', level3_desc:'Sukar (Ayat Kompleks)',
    loading_thinking:'Cikgu AI Sedang Berfikir...', loading_sub:'Sedang menyediakan soalan baru.',
    btn_read:'Baca Soalan', btn_listen:'Dengar Petikan 🎧', instruction_prefix:'Susun ayat dalam',
    btn_prev:'Sebelum', btn_skip:'Lompat', btn_check:'Semak', btn_clear:'Semula',
    answer_placeholder:'Tekan perkataan di bawah · Tahan & seret untuk ubah susunan',
    end_title:'Hebat! 🎉', end_sub:'Kamu berjaya habiskan semua soalan modul ini.',
    btn_continue:'Teruskan Belajar', btn_change_level:'Tukar Tahap / Bahasa',
    settings_btn:'Tetapan', logout_btn:'Log Keluar',
    correct_title:'Tepat Sekali! 🌟', correct_pts:'Dapat +{p} Markah',
    err_name:'Sila tulis nama dahulu.', err_offline:'Perlu internet untuk daftar.', checking_name:'Menyemak Nama...',
    welcome_back:'Selamat kembali, {n}! 👋', welcome_html:'Nama ini berdaftar dengan markah <b>{s}</b>.<br>Sambung?',
    yes_continue:'Ya, Sambung', other_name:'Guna Nama Lain',
    logout_q:'Log Keluar?', logout_text:'Markah disimpan selamat.', yes_logout:'Ya, Keluar', cancel:'Batal',
    clue_title:'Klu Cikgu AI 💡', thanks:'Terima Kasih', almost:'Hampir Tepat! Cuba ubah sikit.',
    learning_badge:'🌍 Belajar: {l}'
  },
  'Bahasa Inggeris': {
    app_title:'Kaca Kata - Master Many Languages', tagline:'Learn world languages the easy & fun way!',
    label_name:'Your Nickname', ph_name:'e.g. Ali, Sarah...', label_mother:'Mother Tongue',
    mother_hint:'The whole app & questions switch to this language.', mother_current:'Current mother tongue',
    btn_next:'Next 🚀', btn_admin:'🔒 Admin Mode', leaderboard_title:'Language Champions',
    lang_pick_title:'Pick a Target Language 🌍', lang_pick_sub:'Which language do you want to learn today?',
    lang_custom:'Or type another language:', ph_custom:'e.g. Italian', btn_start:'Start',
    level_title:'Choose Difficulty 🚀', level_hint:'💡 Questions are generated after you pick a level',
    level1_title:'Level 1: Basic', level1_desc:'Very easy (Beginners)',
    level2_title:'Level 2: Normal', level2_desc:'Medium (Building sentences)',
    level3_title:'Level 3: Pro', level3_desc:'Hard (Complex sentences)',
    loading_thinking:'AI Teacher is thinking...', loading_sub:'Preparing new questions.',
    btn_read:'Read Question', btn_listen:'Hear Phrase 🎧', instruction_prefix:'Arrange the sentence in',
    btn_prev:'Previous', btn_skip:'Skip', btn_check:'Check', btn_clear:'Reset',
    answer_placeholder:'Tap words below · Hold & drag to reorder',
    end_title:'Awesome! 🎉', end_sub:'You finished all the questions in this module.',
    btn_continue:'Keep Learning', btn_change_level:'Change Level / Language',
    settings_btn:'Settings', logout_btn:'Log Out',
    correct_title:'Spot On! 🌟', correct_pts:'+{p} points',
    err_name:'Please type your name first.', err_offline:'Need internet to register.', checking_name:'Checking name...',
    welcome_back:'Welcome back, {n}! 👋', welcome_html:'This name has <b>{s}</b> points.<br>Continue?',
    yes_continue:'Yes, continue', other_name:'Use another name',
    logout_q:'Log out?', logout_text:'Your score is saved.', yes_logout:'Yes, log out', cancel:'Cancel',
    clue_title:'AI Teacher Hint 💡', thanks:'Thanks', almost:'Almost! Tweak it a bit.',
    learning_badge:'🌍 Learning: {l}'
  },
  'Bahasa Indonesia': {
    app_title:'Kaca Kata - Kuasai Banyak Bahasa', tagline:'Belajar bahasa dunia dengan mudah & menyenangkan!',
    label_name:'Nama Panggilan Kamu', ph_name:'Contoh: Ali, Sarah...', label_mother:'Bahasa Ibu',
    mother_hint:'Seluruh aplikasi & soal akan mengikuti bahasa ini.', mother_current:'Bahasa Ibu Saat Ini',
    btn_next:'Lanjut 🚀', btn_admin:'🔒 Mode Admin', leaderboard_title:'Juara Bahasa',
    lang_pick_title:'Pilih Bahasa Target 🌍', lang_pick_sub:'Bahasa apa yang ingin kamu pelajari hari ini?',
    lang_custom:'Atau ketik bahasa lain:', ph_custom:'Contoh: Bahasa Italia', btn_start:'Mulai',
    level_title:'Pilih Tingkat Kesulitan 🚀', level_hint:'💡 Soal hanya dibuat setelah kamu pilih tingkat',
    level1_title:'Tingkat 1: Dasar', level1_desc:'Sangat Mudah (Pemula)',
    level2_title:'Tingkat 2: Biasa', level2_desc:'Menengah (Membangun Kalimat)',
    level3_title:'Tingkat 3: Hebat', level3_desc:'Sulit (Kalimat Kompleks)',
    loading_thinking:'AI Sedang Berpikir...', loading_sub:'Menyiapkan soal baru.',
    btn_read:'Baca Soal', btn_listen:'Dengar Frasa 🎧', instruction_prefix:'Susun kalimat dalam',
    btn_prev:'Sebelumnya', btn_skip:'Lewati', btn_check:'Periksa', btn_clear:'Ulang',
    answer_placeholder:'Ketuk kata di bawah · Tahan & seret untuk mengurutkan',
    end_title:'Hebat! 🎉', end_sub:'Kamu menyelesaikan semua soal modul ini.',
    btn_continue:'Lanjut Belajar', btn_change_level:'Ganti Tingkat / Bahasa',
    settings_btn:'Pengaturan', logout_btn:'Keluar',
    correct_title:'Tepat Sekali! 🌟', correct_pts:'+{p} poin',
    err_name:'Mohon tulis nama dulu.', err_offline:'Butuh internet untuk daftar.', checking_name:'Memeriksa Nama...',
    welcome_back:'Selamat datang kembali, {n}! 👋', welcome_html:'Nama ini punya <b>{s}</b> poin.<br>Lanjut?',
    yes_continue:'Ya, Lanjut', other_name:'Pakai Nama Lain',
    logout_q:'Keluar?', logout_text:'Skor disimpan aman.', yes_logout:'Ya, Keluar', cancel:'Batal',
    clue_title:'Petunjuk Guru AI 💡', thanks:'Terima Kasih', almost:'Hampir! Coba ubah sedikit.',
    learning_badge:'🌍 Belajar: {l}'
  },
  'Bahasa Mandarin': {
    app_title:'Kaca Kata - 掌握多国语言', tagline:'轻松快乐地学习世界各国语言！',
    label_name:'你的昵称', ph_name:'例如: 小明, Sarah...', label_mother:'母语',
    mother_hint:'整个应用与题目会切换到这个语言。', mother_current:'当前母语',
    btn_next:'下一步 🚀', btn_admin:'🔒 管理员模式', leaderboard_title:'语言冠军榜',
    lang_pick_title:'选择目标语言 🌍', lang_pick_sub:'今天你想学什么语言？',
    lang_custom:'或输入其他语言：', ph_custom:'例如：意大利语', btn_start:'开始',
    level_title:'选择难度 🚀', level_hint:'💡 选择级别后才会生成题目',
    level1_title:'第1级：基础', level1_desc:'非常简单（初学者）',
    level2_title:'第2级：普通', level2_desc:'中等（造句）',
    level3_title:'第3级：高手', level3_desc:'困难（复杂句子）',
    loading_thinking:'AI老师正在思考...', loading_sub:'正在准备新题目。',
    btn_read:'朗读题目', btn_listen:'听原句 🎧', instruction_prefix:'用这个语言排列句子：',
    btn_prev:'上一题', btn_skip:'跳过', btn_check:'检查', btn_clear:'重置',
    answer_placeholder:'点击下方词语 · 长按拖动可重新排列',
    end_title:'太棒了！🎉', end_sub:'你完成了本模块的所有题目。',
    btn_continue:'继续学习', btn_change_level:'更换级别 / 语言',
    settings_btn:'设置', logout_btn:'退出',
    correct_title:'完全正确！🌟', correct_pts:'+{p} 分',
    err_name:'请先输入名字。', err_offline:'注册需要联网。', checking_name:'检查名字中...',
    welcome_back:'欢迎回来，{n}！👋', welcome_html:'此名字已有 <b>{s}</b> 分。<br>继续吗？',
    yes_continue:'是，继续', other_name:'用别的名字',
    logout_q:'退出？', logout_text:'分数已安全保存。', yes_logout:'是，退出', cancel:'取消',
    clue_title:'AI老师提示 💡', thanks:'谢谢', almost:'差一点！再调整一下。',
    learning_badge:'🌍 学习中：{l}'
  },
  'Bahasa Tamil': {
    app_title:'Kaca Kata - பல மொழிகளைக் கற்றுக்கொள்', tagline:'உலக மொழிகளை எளிதாக மகிழ்ச்சியாகக் கற்றுக்கொள்!',
    label_name:'உங்கள் செல்லப்பெயர்', ph_name:'எ.கா: Ali, Sarah...', label_mother:'தாய் மொழி',
    mother_hint:'முழு பயன்பாடும் கேள்விகளும் இந்த மொழிக்கு மாறும்.', mother_current:'தற்போதைய தாய்மொழி',
    btn_next:'அடுத்து 🚀', btn_admin:'🔒 நிர்வாக முறை', leaderboard_title:'மொழி வீரர்கள்',
    lang_pick_title:'இலக்கு மொழியைத் தேர்ந்தெடு 🌍', lang_pick_sub:'இன்று எந்த மொழியைக் கற்க விரும்புகிறாய்?',
    lang_custom:'அல்லது வேறு மொழியை தட்டச்சு செய்க:', ph_custom:'எ.கா: இத்தாலியன்', btn_start:'தொடங்கு',
    level_title:'சிரம நிலையைத் தேர்ந்தெடு 🚀', level_hint:'💡 நிலை தேர்ந்தெடுத்த பிறகே கேள்விகள் உருவாக்கப்படும்',
    level1_title:'நிலை 1: அடிப்படை', level1_desc:'மிக எளிது (ஆரம்பகர்)',
    level2_title:'நிலை 2: சாதாரண', level2_desc:'நடுத்தர (வாக்கிய அமைப்பு)',
    level3_title:'நிலை 3: சிறப்பு', level3_desc:'கடினம் (சிக்கலான வாக்கியங்கள்)',
    loading_thinking:'AI ஆசிரியர் சிந்திக்கிறார்...', loading_sub:'புதிய கேள்விகள் தயாராகின்றன.',
    btn_read:'கேள்வியை படி', btn_listen:'வாக்கியம் கேள் 🎧', instruction_prefix:'இந்த மொழியில் வாக்கியத்தை அமை:',
    btn_prev:'முந்தைய', btn_skip:'தாண்டு', btn_check:'சரிபார்', btn_clear:'மீட்டமை',
    answer_placeholder:'கீழே உள்ள சொற்களை அழுத்து · இழுத்து மறு வரிசை',
    end_title:'அருமை! 🎉', end_sub:'இந்த தொகுதியின் அனைத்து கேள்விகளையும் முடித்தாய்.',
    btn_continue:'தொடர்ந்து கற்றுக்கொள்', btn_change_level:'நிலை / மொழி மாற்று',
    settings_btn:'அமைப்புகள்', logout_btn:'வெளியேறு',
    correct_title:'சரியானது! 🌟', correct_pts:'+{p} புள்ளிகள்',
    err_name:'முதலில் பெயரை எழுது.', err_offline:'பதிய இணையம் தேவை.', checking_name:'பெயரை சரிபார்க்கிறது...',
    welcome_back:'மீண்டும் வரவேற்கிறோம், {n}! 👋', welcome_html:'இந்த பெயரில் <b>{s}</b> புள்ளிகள் உள்ளன.<br>தொடரவா?',
    yes_continue:'ஆம், தொடர்', other_name:'வேறு பெயர் பயன்படுத்து',
    logout_q:'வெளியேறவா?', logout_text:'மதிப்பெண் பாதுகாப்பாக சேமிக்கப்பட்டது.', yes_logout:'ஆம், வெளியேறு', cancel:'ரத்து',
    clue_title:'AI ஆசிரியர் குறிப்பு 💡', thanks:'நன்றி', almost:'கிட்டத்தட்ட! கொஞ்சம் மாற்று.',
    learning_badge:'🌍 கற்றல்: {l}'
  },
  'Bahasa Arab': {
    app_title:'Kaca Kata - أتقن لغات عديدة', tagline:'تعلم لغات العالم بسهولة ومتعة!',
    label_name:'اسمك المستعار', ph_name:'مثال: علي، سارة...', label_mother:'اللغة الأم',
    mother_hint:'سيتم تبديل التطبيق والأسئلة إلى هذه اللغة.', mother_current:'اللغة الأم الحالية',
    btn_next:'التالي 🚀', btn_admin:'🔒 وضع المدير', leaderboard_title:'أبطال اللغة',
    lang_pick_title:'اختر اللغة المستهدفة 🌍', lang_pick_sub:'أي لغة تريد أن تتعلم اليوم؟',
    lang_custom:'أو اكتب لغة أخرى:', ph_custom:'مثال: الإيطالية', btn_start:'ابدأ',
    level_title:'اختر مستوى الصعوبة 🚀', level_hint:'💡 يتم إنشاء الأسئلة بعد اختيار المستوى',
    level1_title:'المستوى 1: أساسي', level1_desc:'سهل جدًا (للمبتدئين)',
    level2_title:'المستوى 2: عادي', level2_desc:'متوسط (بناء الجمل)',
    level3_title:'المستوى 3: متقدم', level3_desc:'صعب (جمل معقدة)',
    loading_thinking:'المعلم الذكي يفكر...', loading_sub:'يتم تجهيز أسئلة جديدة.',
    btn_read:'اقرأ السؤال', btn_listen:'استمع للعبارة 🎧', instruction_prefix:'رتب الجملة بـ',
    btn_prev:'السابق', btn_skip:'تخطى', btn_check:'تحقق', btn_clear:'إعادة',
    answer_placeholder:'انقر الكلمات أدناه · اضغط واسحب لإعادة الترتيب',
    end_title:'رائع! 🎉', end_sub:'لقد أنهيت جميع أسئلة هذه الوحدة.',
    btn_continue:'تابع التعلم', btn_change_level:'غير المستوى / اللغة',
    settings_btn:'إعدادات', logout_btn:'خروج',
    correct_title:'تمامًا! 🌟', correct_pts:'+{p} نقطة',
    err_name:'اكتب اسمك أولاً.', err_offline:'يلزم الإنترنت للتسجيل.', checking_name:'جاري التحقق...',
    welcome_back:'مرحبًا بعودتك، {n}! 👋', welcome_html:'هذا الاسم له <b>{s}</b> نقطة.<br>متابعة؟',
    yes_continue:'نعم، تابع', other_name:'استخدم اسمًا آخر',
    logout_q:'خروج؟', logout_text:'تم حفظ النقاط بأمان.', yes_logout:'نعم، خروج', cancel:'إلغاء',
    clue_title:'تلميح المعلم 💡', thanks:'شكرًا', almost:'قريب! عدّل قليلًا.',
    learning_badge:'🌍 تتعلم: {l}'
  },
  'Bahasa Hindi': {
    app_title:'Kaca Kata - कई भाषाओं में महारत', tagline:'दुनिया की भाषाएँ आसानी से और मज़े से सीखें!',
    label_name:'आपका उपनाम', ph_name:'जैसे: Ali, Sarah...', label_mother:'मातृभाषा',
    mother_hint:'पूरा ऐप और सवाल इसी भाषा में बदल जाएंगे।', mother_current:'वर्तमान मातृभाषा',
    btn_next:'अगला 🚀', btn_admin:'🔒 एडमिन मोड', leaderboard_title:'भाषा चैंपियन',
    lang_pick_title:'लक्ष्य भाषा चुनें 🌍', lang_pick_sub:'आज कौन सी भाषा सीखना चाहते हो?',
    lang_custom:'या कोई और भाषा लिखें:', ph_custom:'जैसे: इतालवी', btn_start:'शुरू',
    level_title:'कठिनाई स्तर चुनें 🚀', level_hint:'💡 स्तर चुनने के बाद ही सवाल बनेंगे',
    level1_title:'स्तर 1: बेसिक', level1_desc:'बहुत आसान (शुरुआती)',
    level2_title:'स्तर 2: सामान्य', level2_desc:'मध्यम (वाक्य बनाना)',
    level3_title:'स्तर 3: एडवांस', level3_desc:'कठिन (जटिल वाक्य)',
    loading_thinking:'AI टीचर सोच रहे हैं...', loading_sub:'नए सवाल तैयार हो रहे हैं।',
    btn_read:'सवाल पढ़ें', btn_listen:'वाक्य सुनें 🎧', instruction_prefix:'इस भाषा में वाक्य बनाओ:',
    btn_prev:'पिछला', btn_skip:'छोड़ें', btn_check:'जाँच', btn_clear:'फिर से',
    answer_placeholder:'नीचे शब्द दबाओ · पकड़ कर खींचो क्रम बदलने के लिए',
    end_title:'बहुत बढ़िया! 🎉', end_sub:'तुमने इस मॉड्यूल के सभी सवाल पूरे किए।',
    btn_continue:'सीखते रहो', btn_change_level:'स्तर / भाषा बदलें',
    settings_btn:'सेटिंग', logout_btn:'लॉग आउट',
    correct_title:'सही! 🌟', correct_pts:'+{p} अंक',
    err_name:'पहले नाम लिखें।', err_offline:'पंजीकरण के लिए इंटरनेट चाहिए।', checking_name:'नाम जाँच रहा है...',
    welcome_back:'वापसी पर स्वागत है, {n}! 👋', welcome_html:'इस नाम के <b>{s}</b> अंक हैं।<br>जारी रखें?',
    yes_continue:'हाँ, जारी', other_name:'दूसरा नाम',
    logout_q:'लॉग आउट?', logout_text:'अंक सुरक्षित हैं।', yes_logout:'हाँ, बाहर', cancel:'रद्द',
    clue_title:'AI टीचर का संकेत 💡', thanks:'धन्यवाद', almost:'लगभग सही! थोड़ा बदलो।',
    learning_badge:'🌍 सीख रहे हो: {l}'
  },
  'Bahasa Jepun': {
    app_title:'Kaca Kata - 多言語マスター', tagline:'世界の言語を楽しく簡単に学ぼう！',
    label_name:'ニックネーム', ph_name:'例: Ali, Sarah...', label_mother:'母語',
    mother_hint:'アプリ全体と問題がこの言語に切り替わります。', mother_current:'現在の母語',
    btn_next:'次へ 🚀', btn_admin:'🔒 管理モード', leaderboard_title:'言語チャンピオン',
    lang_pick_title:'学ぶ言語を選ぼう 🌍', lang_pick_sub:'今日はどの言語を学びますか？',
    lang_custom:'または他の言語を入力:', ph_custom:'例: イタリア語', btn_start:'スタート',
    level_title:'難易度を選ぶ 🚀', level_hint:'💡 レベル選択後に問題が生成されます',
    level1_title:'レベル1: 基礎', level1_desc:'とても簡単（初心者向け）',
    level2_title:'レベル2: 普通', level2_desc:'中級（文を作る）',
    level3_title:'レベル3: 上級', level3_desc:'難しい（複雑な文）',
    loading_thinking:'AI先生が考えています...', loading_sub:'新しい問題を準備中。',
    btn_read:'問題を読む', btn_listen:'フレーズを聞く 🎧', instruction_prefix:'この言語で文を並べよう:',
    btn_prev:'前へ', btn_skip:'スキップ', btn_check:'確認', btn_clear:'リセット',
    answer_placeholder:'下の単語をタップ · 長押しでドラッグして並べ替え',
    end_title:'すごい！🎉', end_sub:'このモジュールの全問題を完了！',
    btn_continue:'学習を続ける', btn_change_level:'レベル/言語を変える',
    settings_btn:'設定', logout_btn:'ログアウト',
    correct_title:'正解！🌟', correct_pts:'+{p}ポイント',
    err_name:'名前を入力してください。', err_offline:'登録にはネットが必要。', checking_name:'名前を確認中...',
    welcome_back:'おかえり、{n}！👋', welcome_html:'この名前は <b>{s}</b> ポイントあります。<br>続けますか？',
    yes_continue:'はい、続ける', other_name:'別の名前を使う',
    logout_q:'ログアウト？', logout_text:'スコアは保存済み。', yes_logout:'はい、ログアウト', cancel:'キャンセル',
    clue_title:'AI先生のヒント 💡', thanks:'ありがとう', almost:'惜しい！少し直して。',
    learning_badge:'🌍 学習中: {l}'
  },
  'Bahasa Korea': {
    app_title:'Kaca Kata - 다국어 마스터', tagline:'세계의 언어를 즐겁고 쉽게 배우세요!',
    label_name:'닉네임', ph_name:'예: Ali, Sarah...', label_mother:'모국어',
    mother_hint:'앱 전체와 문제가 이 언어로 전환됩니다.', mother_current:'현재 모국어',
    btn_next:'다음 🚀', btn_admin:'🔒 관리자 모드', leaderboard_title:'언어 챔피언',
    lang_pick_title:'학습할 언어 선택 🌍', lang_pick_sub:'오늘 어떤 언어를 배울까요?',
    lang_custom:'또는 다른 언어 입력:', ph_custom:'예: 이탈리아어', btn_start:'시작',
    level_title:'난이도 선택 🚀', level_hint:'💡 레벨 선택 후 문제 생성',
    level1_title:'레벨 1: 기초', level1_desc:'아주 쉬움 (초보자)',
    level2_title:'레벨 2: 보통', level2_desc:'중급 (문장 만들기)',
    level3_title:'레벨 3: 고급', level3_desc:'어려움 (복잡한 문장)',
    loading_thinking:'AI 선생님이 생각 중...', loading_sub:'새 문제 준비 중.',
    btn_read:'문제 읽기', btn_listen:'문장 듣기 🎧', instruction_prefix:'이 언어로 문장 배열:',
    btn_prev:'이전', btn_skip:'건너뛰기', btn_check:'확인', btn_clear:'다시',
    answer_placeholder:'아래 단어 탭 · 길게 눌러 끌어 순서 변경',
    end_title:'대단해! 🎉', end_sub:'이 모듈의 모든 문제를 완료했어요.',
    btn_continue:'계속 학습', btn_change_level:'레벨/언어 변경',
    settings_btn:'설정', logout_btn:'로그아웃',
    correct_title:'정답! 🌟', correct_pts:'+{p}점',
    err_name:'이름을 먼저 입력하세요.', err_offline:'등록에 인터넷 필요.', checking_name:'이름 확인 중...',
    welcome_back:'다시 만나서 반가워, {n}! 👋', welcome_html:'이 이름은 <b>{s}</b>점.<br>계속할까요?',
    yes_continue:'네, 계속', other_name:'다른 이름 사용',
    logout_q:'로그아웃?', logout_text:'점수는 안전하게 저장됨.', yes_logout:'네, 로그아웃', cancel:'취소',
    clue_title:'AI 선생님 힌트 💡', thanks:'감사합니다', almost:'아쉽다! 조금만 바꿔봐.',
    learning_badge:'🌍 학습 중: {l}'
  },
  'Bahasa Thai': {
    app_title:'Kaca Kata - เก่งหลายภาษา', tagline:'เรียนภาษาโลกได้ง่ายและสนุก!',
    label_name:'ชื่อเล่นของคุณ', ph_name:'เช่น: Ali, Sarah...', label_mother:'ภาษาแม่',
    mother_hint:'แอปและคำถามทั้งหมดจะเปลี่ยนเป็นภาษานี้', mother_current:'ภาษาแม่ปัจจุบัน',
    btn_next:'ถัดไป 🚀', btn_admin:'🔒 โหมดแอดมิน', leaderboard_title:'แชมป์ภาษา',
    lang_pick_title:'เลือกภาษาเป้าหมาย 🌍', lang_pick_sub:'วันนี้อยากเรียนภาษาอะไร?',
    lang_custom:'หรือพิมพ์ภาษาอื่น:', ph_custom:'เช่น: ภาษาอิตาลี', btn_start:'เริ่ม',
    level_title:'เลือกระดับความยาก 🚀', level_hint:'💡 คำถามจะสร้างหลังเลือกระดับ',
    level1_title:'ระดับ 1: พื้นฐาน', level1_desc:'ง่ายมาก (มือใหม่)',
    level2_title:'ระดับ 2: ปกติ', level2_desc:'กลาง (สร้างประโยค)',
    level3_title:'ระดับ 3: เก่ง', level3_desc:'ยาก (ประโยคซับซ้อน)',
    loading_thinking:'ครู AI กำลังคิด...', loading_sub:'กำลังเตรียมคำถามใหม่',
    btn_read:'อ่านคำถาม', btn_listen:'ฟังประโยค 🎧', instruction_prefix:'เรียงประโยคในภาษา',
    btn_prev:'ก่อนหน้า', btn_skip:'ข้าม', btn_check:'ตรวจ', btn_clear:'รีเซ็ต',
    answer_placeholder:'แตะคำด้านล่าง · กดค้างลากเพื่อจัดลำดับ',
    end_title:'เยี่ยม! 🎉', end_sub:'คุณทำคำถามครบทุกข้อในชุดนี้',
    btn_continue:'เรียนต่อ', btn_change_level:'เปลี่ยนระดับ/ภาษา',
    settings_btn:'ตั้งค่า', logout_btn:'ออกจากระบบ',
    correct_title:'ถูกต้อง! 🌟', correct_pts:'+{p} คะแนน',
    err_name:'กรุณาพิมพ์ชื่อก่อน', err_offline:'ต้องมีอินเทอร์เน็ตเพื่อสมัคร', checking_name:'กำลังตรวจชื่อ...',
    welcome_back:'ยินดีต้อนรับกลับ, {n}! 👋', welcome_html:'ชื่อนี้มี <b>{s}</b> คะแนน<br>ทำต่อ?',
    yes_continue:'ใช่, ทำต่อ', other_name:'ใช้ชื่ออื่น',
    logout_q:'ออก?', logout_text:'คะแนนถูกบันทึกแล้ว', yes_logout:'ใช่, ออก', cancel:'ยกเลิก',
    clue_title:'คำใบ้ครู AI 💡', thanks:'ขอบคุณ', almost:'เกือบแล้ว! ลองปรับนิดหน่อย',
    learning_badge:'🌍 กำลังเรียน: {l}'
  },
  'Bahasa Sepanyol': {
    app_title:'Kaca Kata - Domina Varios Idiomas', tagline:'¡Aprende idiomas del mundo de forma fácil y divertida!',
    label_name:'Tu Apodo', ph_name:'Ej: Ali, Sarah...', label_mother:'Idioma Materno',
    mother_hint:'Toda la app y las preguntas cambiarán a este idioma.', mother_current:'Idioma materno actual',
    btn_next:'Siguiente 🚀', btn_admin:'🔒 Modo Admin', leaderboard_title:'Campeones de Idiomas',
    lang_pick_title:'Elige Idioma Objetivo 🌍', lang_pick_sub:'¿Qué idioma quieres aprender hoy?',
    lang_custom:'O escribe otro idioma:', ph_custom:'Ej: Italiano', btn_start:'Empezar',
    level_title:'Elige Dificultad 🚀', level_hint:'💡 Las preguntas se generan tras elegir nivel',
    level1_title:'Nivel 1: Básico', level1_desc:'Muy Fácil (Principiantes)',
    level2_title:'Nivel 2: Normal', level2_desc:'Medio (Construir frases)',
    level3_title:'Nivel 3: Pro', level3_desc:'Difícil (Frases complejas)',
    loading_thinking:'El Profe IA está pensando...', loading_sub:'Preparando preguntas nuevas.',
    btn_read:'Leer Pregunta', btn_listen:'Escuchar Frase 🎧', instruction_prefix:'Ordena la frase en',
    btn_prev:'Anterior', btn_skip:'Saltar', btn_check:'Comprobar', btn_clear:'Reiniciar',
    answer_placeholder:'Toca las palabras · Mantén y arrastra para reordenar',
    end_title:'¡Genial! 🎉', end_sub:'Terminaste todas las preguntas de este módulo.',
    btn_continue:'Seguir Aprendiendo', btn_change_level:'Cambiar Nivel/Idioma',
    settings_btn:'Ajustes', logout_btn:'Salir',
    correct_title:'¡Exacto! 🌟', correct_pts:'+{p} puntos',
    err_name:'Escribe tu nombre primero.', err_offline:'Necesitas internet para registrarte.', checking_name:'Comprobando nombre...',
    welcome_back:'¡Bienvenido de vuelta, {n}! 👋', welcome_html:'Este nombre tiene <b>{s}</b> puntos.<br>¿Continuar?',
    yes_continue:'Sí, continuar', other_name:'Usar otro nombre',
    logout_q:'¿Salir?', logout_text:'Tu puntuación está guardada.', yes_logout:'Sí, salir', cancel:'Cancelar',
    clue_title:'Pista del Profe IA 💡', thanks:'Gracias', almost:'¡Casi! Ajusta un poco.',
    learning_badge:'🌍 Aprendiendo: {l}'
  },
  'Bahasa Perancis': {
    app_title:'Kaca Kata - Maîtrise Plusieurs Langues', tagline:'Apprends les langues du monde facilement et avec plaisir !',
    label_name:'Ton Surnom', ph_name:'Ex: Ali, Sarah...', label_mother:'Langue Maternelle',
    mother_hint:'Toute l\'app et les questions passent à cette langue.', mother_current:'Langue maternelle actuelle',
    btn_next:'Suivant 🚀', btn_admin:'🔒 Mode Admin', leaderboard_title:'Champions des Langues',
    lang_pick_title:'Choisis la Langue Cible 🌍', lang_pick_sub:'Quelle langue veux-tu apprendre aujourd\'hui ?',
    lang_custom:'Ou tape une autre langue :', ph_custom:'Ex: Italien', btn_start:'Commencer',
    level_title:'Choisis la Difficulté 🚀', level_hint:'💡 Les questions sont générées après ton choix',
    level1_title:'Niveau 1: Base', level1_desc:'Très Facile (Débutants)',
    level2_title:'Niveau 2: Normal', level2_desc:'Moyen (Construire des phrases)',
    level3_title:'Niveau 3: Pro', level3_desc:'Difficile (Phrases complexes)',
    loading_thinking:'Le Prof IA réfléchit...', loading_sub:'Préparation des nouvelles questions.',
    btn_read:'Lire la Question', btn_listen:'Écouter la Phrase 🎧', instruction_prefix:'Range la phrase en',
    btn_prev:'Précédent', btn_skip:'Passer', btn_check:'Vérifier', btn_clear:'Réinitialiser',
    answer_placeholder:'Touche les mots · Maintiens et glisse pour réordonner',
    end_title:'Super ! 🎉', end_sub:'Tu as fini toutes les questions de ce module.',
    btn_continue:'Continuer', btn_change_level:'Changer Niveau/Langue',
    settings_btn:'Paramètres', logout_btn:'Déconnexion',
    correct_title:'Parfait ! 🌟', correct_pts:'+{p} points',
    err_name:'Écris ton nom d\'abord.', err_offline:'Internet requis pour s\'inscrire.', checking_name:'Vérification du nom...',
    welcome_back:'Re-bienvenue, {n} ! 👋', welcome_html:'Ce nom a <b>{s}</b> points.<br>Continuer ?',
    yes_continue:'Oui, continuer', other_name:'Autre nom',
    logout_q:'Déconnexion ?', logout_text:'Ton score est sauvegardé.', yes_logout:'Oui, sortir', cancel:'Annuler',
    clue_title:'Indice du Prof IA 💡', thanks:'Merci', almost:'Presque ! Ajuste un peu.',
    learning_badge:'🌍 Apprentissage : {l}'
  },
  'Bahasa Jerman': {
    app_title:'Kaca Kata - Mehrere Sprachen Meistern', tagline:'Lerne Weltsprachen einfach und mit Spaß!',
    label_name:'Dein Spitzname', ph_name:'z.B. Ali, Sarah...', label_mother:'Muttersprache',
    mother_hint:'Die ganze App und Fragen wechseln zu dieser Sprache.', mother_current:'Aktuelle Muttersprache',
    btn_next:'Weiter 🚀', btn_admin:'🔒 Admin-Modus', leaderboard_title:'Sprach-Champions',
    lang_pick_title:'Zielsprache wählen 🌍', lang_pick_sub:'Welche Sprache willst du heute lernen?',
    lang_custom:'Oder andere Sprache eingeben:', ph_custom:'z.B. Italienisch', btn_start:'Start',
    level_title:'Schwierigkeit wählen 🚀', level_hint:'💡 Fragen werden nach Wahl generiert',
    level1_title:'Stufe 1: Basis', level1_desc:'Sehr einfach (Anfänger)',
    level2_title:'Stufe 2: Normal', level2_desc:'Mittel (Sätze bauen)',
    level3_title:'Stufe 3: Pro', level3_desc:'Schwer (Komplexe Sätze)',
    loading_thinking:'KI-Lehrer denkt nach...', loading_sub:'Neue Fragen werden vorbereitet.',
    btn_read:'Frage lesen', btn_listen:'Satz hören 🎧', instruction_prefix:'Ordne den Satz auf',
    btn_prev:'Zurück', btn_skip:'Überspringen', btn_check:'Prüfen', btn_clear:'Zurücksetzen',
    answer_placeholder:'Wörter unten antippen · Halten & ziehen zum Sortieren',
    end_title:'Toll! 🎉', end_sub:'Du hast alle Fragen dieses Moduls geschafft.',
    btn_continue:'Weiterlernen', btn_change_level:'Stufe/Sprache wechseln',
    settings_btn:'Einstellungen', logout_btn:'Abmelden',
    correct_title:'Richtig! 🌟', correct_pts:'+{p} Punkte',
    err_name:'Bitte zuerst Namen eingeben.', err_offline:'Internet zum Registrieren nötig.', checking_name:'Name prüfen...',
    welcome_back:'Willkommen zurück, {n}! 👋', welcome_html:'Dieser Name hat <b>{s}</b> Punkte.<br>Weiter?',
    yes_continue:'Ja, weiter', other_name:'Anderen Namen',
    logout_q:'Abmelden?', logout_text:'Punkte sind gespeichert.', yes_logout:'Ja, abmelden', cancel:'Abbrechen',
    clue_title:'KI-Lehrer Tipp 💡', thanks:'Danke', almost:'Fast! Etwas anpassen.',
    learning_badge:'🌍 Lernen: {l}'
  },
  'Bahasa Itali': {
    app_title:'Kaca Kata - Padroneggia Più Lingue', tagline:'Impara le lingue del mondo facilmente e con divertimento!',
    label_name:'Il Tuo Soprannome', ph_name:'Es: Ali, Sarah...', label_mother:'Lingua Madre',
    mother_hint:'Tutta l\'app e le domande passano a questa lingua.', mother_current:'Lingua madre attuale',
    btn_next:'Avanti 🚀', btn_admin:'🔒 Modalità Admin', leaderboard_title:'Campioni delle Lingue',
    lang_pick_title:'Scegli Lingua Obiettivo 🌍', lang_pick_sub:'Quale lingua vuoi imparare oggi?',
    lang_custom:'O scrivi altra lingua:', ph_custom:'Es: Tedesco', btn_start:'Inizia',
    level_title:'Scegli Difficoltà 🚀', level_hint:'💡 Le domande sono generate dopo la scelta',
    level1_title:'Livello 1: Base', level1_desc:'Molto Facile (Principianti)',
    level2_title:'Livello 2: Normale', level2_desc:'Medio (Costruire frasi)',
    level3_title:'Livello 3: Pro', level3_desc:'Difficile (Frasi complesse)',
    loading_thinking:'L\'IA Insegnante sta pensando...', loading_sub:'Preparazione nuove domande.',
    btn_read:'Leggi Domanda', btn_listen:'Ascolta Frase 🎧', instruction_prefix:'Ordina la frase in',
    btn_prev:'Precedente', btn_skip:'Salta', btn_check:'Controlla', btn_clear:'Reset',
    answer_placeholder:'Tocca parole · Tieni e trascina per riordinare',
    end_title:'Fantastico! 🎉', end_sub:'Hai finito tutte le domande del modulo.',
    btn_continue:'Continua', btn_change_level:'Cambia Livello/Lingua',
    settings_btn:'Impostazioni', logout_btn:'Esci',
    correct_title:'Esatto! 🌟', correct_pts:'+{p} punti',
    err_name:'Scrivi prima il nome.', err_offline:'Serve internet per registrarsi.', checking_name:'Verifica nome...',
    welcome_back:'Bentornato, {n}! 👋', welcome_html:'Questo nome ha <b>{s}</b> punti.<br>Continuare?',
    yes_continue:'Sì, continua', other_name:'Altro nome',
    logout_q:'Esci?', logout_text:'Punteggio salvato.', yes_logout:'Sì, esci', cancel:'Annulla',
    clue_title:'Suggerimento IA 💡', thanks:'Grazie', almost:'Quasi! Aggiusta un po\'.',
    learning_badge:'🌍 Stai imparando: {l}'
  },
  'Bahasa Rusia': {
    app_title:'Kaca Kata - Освой много языков', tagline:'Учи языки мира легко и весело!',
    label_name:'Ваш никнейм', ph_name:'Напр: Ali, Sarah...', label_mother:'Родной язык',
    mother_hint:'Всё приложение и вопросы перейдут на этот язык.', mother_current:'Текущий родной язык',
    btn_next:'Дальше 🚀', btn_admin:'🔒 Режим админа', leaderboard_title:'Чемпионы языков',
    lang_pick_title:'Выберите целевой язык 🌍', lang_pick_sub:'Какой язык учим сегодня?',
    lang_custom:'Или введите другой язык:', ph_custom:'Напр: Итальянский', btn_start:'Старт',
    level_title:'Выберите сложность 🚀', level_hint:'💡 Вопросы создаются после выбора уровня',
    level1_title:'Уровень 1: Основы', level1_desc:'Очень легко (Новички)',
    level2_title:'Уровень 2: Обычный', level2_desc:'Средний (Составление фраз)',
    level3_title:'Уровень 3: Про', level3_desc:'Сложно (Сложные фразы)',
    loading_thinking:'AI-учитель думает...', loading_sub:'Готовлю новые вопросы.',
    btn_read:'Прочитать', btn_listen:'Послушать фразу 🎧', instruction_prefix:'Составьте фразу на',
    btn_prev:'Назад', btn_skip:'Пропуск', btn_check:'Проверить', btn_clear:'Сброс',
    answer_placeholder:'Нажми слова · Удерживай и тяни для сортировки',
    end_title:'Отлично! 🎉', end_sub:'Вы прошли все вопросы модуля.',
    btn_continue:'Продолжить', btn_change_level:'Сменить уровень/язык',
    settings_btn:'Настройки', logout_btn:'Выход',
    correct_title:'Точно! 🌟', correct_pts:'+{p} очков',
    err_name:'Сначала введите имя.', err_offline:'Нужен интернет для регистрации.', checking_name:'Проверка имени...',
    welcome_back:'С возвращением, {n}! 👋', welcome_html:'У этого имени <b>{s}</b> очков.<br>Продолжить?',
    yes_continue:'Да, продолжить', other_name:'Другое имя',
    logout_q:'Выйти?', logout_text:'Счёт сохранён.', yes_logout:'Да, выйти', cancel:'Отмена',
    clue_title:'Подсказка AI 💡', thanks:'Спасибо', almost:'Почти! Чуть поправь.',
    learning_badge:'🌍 Изучаешь: {l}'
  }
};

function t(key, vars) {
  const lang = gameState.motherTongue || 'Bahasa Melayu';
  const dict = I18N[lang] || I18N['Bahasa Melayu'];
  let s = dict[key] || I18N['Bahasa Melayu'][key] || key;
  if (vars) for (const k in vars) s = s.replace(new RegExp('\\{'+k+'\\}', 'g'), vars[k]);
  return s;
}

function applyI18n() {
  const lang = gameState.motherTongue || 'Bahasa Melayu';
  // html lang attr (rtl untuk Arab)
  document.documentElement.setAttribute('lang', codeForLanguage(lang).split('-')[0]);
  document.documentElement.setAttribute('dir', lang === 'Bahasa Arab' ? 'rtl' : 'ltr');

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });
  // Badge bahasa sasaran
  if (gameState.targetLanguage) {
    const badge = document.getElementById('badge-selected-lang');
    if (badge) badge.textContent = t('learning_badge', { l: gameState.targetLanguage });
  }
  // Sync select bahasa ibunda
  ['select-mother-tongue', 'select-mother-tongue-2'].forEach(id => {
    const s = document.getElementById(id); if (s) s.value = lang;
  });
  const dm = document.getElementById('display-mother-tongue');
  if (dm) dm.textContent = lang;
}

// ==========================================
// Tetapan admin
// ==========================================
let adminSettings = JSON.parse(localStorage.getItem('kacakata_admin_settings')) || {
  audioRate: 0.95,
  audioPitch: 1.0,
  audioWordPause: false,   // DEFAULT off — audio lebih natural, tak robotik
  defaultMotherTongue: 'Bahasa Melayu',
  passwordHash: '101010'
};
// Migrasi tetapan lama yang masih ada audioWordPause=true atau rate=0.7
if (adminSettings.audioRate <= 0.75) adminSettings.audioRate = 0.95;
function saveAdminSettings() { localStorage.setItem('kacakata_admin_settings', JSON.stringify(adminSettings)); }

// State Permainan
let gameState = {
  name: '',
  score: 0,
  motherTongue: localStorage.getItem('kacakata_mother_tongue') || adminSettings.defaultMotherTongue || 'Bahasa Melayu',
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
  // Unlock Web Audio API sahaja (untuk SFX beep)
  // TTS TIDAK perlukan unlock khas — button click IS user gesture
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

// Fallback rantaian voice (cth: ms-MY tiada → id-ID; ta-IN tiada → hi-IN)
const VOICE_FALLBACK = {
  'ms-MY': ['ms-MY', 'ms', 'id-ID', 'id'],
  'ta-IN': ['ta-IN', 'ta', 'hi-IN', 'hi'],
  'hi-IN': ['hi-IN', 'hi'],
  'ar-SA': ['ar-SA', 'ar-EG', 'ar-XA', 'ar'],
  'th-TH': ['th-TH', 'th'],
  'zh-CN': ['zh-CN', 'zh-TW', 'zh-HK', 'zh'],
  'ja-JP': ['ja-JP', 'ja'],
  'ko-KR': ['ko-KR', 'ko'],
  'ru-RU': ['ru-RU', 'ru'],
  'de-DE': ['de-DE', 'de-AT', 'de'],
  'fr-FR': ['fr-FR', 'fr-CA', 'fr'],
  'es-ES': ['es-ES', 'es-MX', 'es-US', 'es'],
  'it-IT': ['it-IT', 'it'],
  'id-ID': ['id-ID', 'id', 'ms-MY', 'ms'],
  'en-US': ['en-US', 'en-GB', 'en-AU', 'en']
};

// ==========================================
// VOICE CACHE — muatkan latar belakang
// ==========================================
let _cachedVoices = [];

if ('speechSynthesis' in window) {
  const _loadVoices = () => {
    const v = window.speechSynthesis.getVoices() || [];
    if (v.length) _cachedVoices = v;
  };
  window.speechSynthesis.onvoiceschanged = _loadVoices;
  try { _loadVoices(); } catch(e) {}
}

// Pilih suara terbaik mengikut langCode, guna getVoices() segar + cache
function pickVoice(langCode) {
  const live = (typeof window.speechSynthesis !== 'undefined')
    ? (window.speechSynthesis.getVoices() || []) : [];
  const voices = live.length ? live : _cachedVoices;
  if (!voices.length) return null;
  const chain = VOICE_FALLBACK[langCode] || [langCode, langCode.split('-')[0]];
  for (const tag of chain) {
    const t = tag.toLowerCase();
    let v = voices.find(x => x.lang && x.lang.toLowerCase() === t);
    if (v) return v;
    v = voices.find(x => x.lang && x.lang.toLowerCase().startsWith(t + '-'));
    if (v) return v;
    v = voices.find(x => x.lang && x.lang.toLowerCase() === t.split('-')[0]);
    if (v) return v;
  }
  return voices.find(x => x.default) || voices[0] || null;
}

// ==========================================
// AUDIO BUTTONS LOCK/UNLOCK
// ==========================================
const audioButtons = new Set();
const _btnOrigText = new Map();

function lockAudioButtons() {
  ['btn-play-question', 'btn-play-target'].forEach(id => {
    const b = document.getElementById(id);
    if (!b) return;
    // Simpan teks asal
    if (!_btnOrigText.has(id)) {
      const span = b.querySelector('span');
      _btnOrigText.set(id, span ? span.innerHTML : b.innerHTML);
    }
    b.disabled = true;
    b.classList.add('audio-playing');
    // Tukar icon kepada speaker bergetar
    const icon = b.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', 'volume-2');
      lucide.createIcons({ nodes: [icon] });
    }
    audioButtons.add(b);
  });
}

function unlockAudioButtons() {
  audioButtons.forEach(b => {
    b.disabled = false;
    b.classList.remove('audio-playing');
    // Pulihkan teks asal
    const id = b.id;
    const origIcon = id === 'btn-play-question' ? 'volume-2' : 'headphones';
    const icon = b.querySelector('i');
    if (icon) {
      icon.setAttribute('data-lucide', origIcon);
      lucide.createIcons({ nodes: [icon] });
    }
  });
  audioButtons.clear();
}

// ==========================================
// PENGURUSAN RALAT AUDIO — mesej berguna mengikut jenis ralat
// ==========================================
const TTS_ERROR_INFO = {
  'not-allowed':           { ms: 'Audio tidak dibenarkan oleh browser.',           fix: 'Muat semula halaman, kemudian tekan butang audio sebagai tindakan PERTAMA anda.' },
  'interrupted':           { ms: 'Audio terganggu di tengah jalan.',               fix: 'Tekan butang audio sekali lagi.' },
  'canceled':              { ms: 'Audio dibatalkan oleh sistem.',                   fix: 'Tekan butang audio sekali lagi.' },
  'synthesis-unavailable': { ms: 'Enjin TTS tidak wujud pada peranti ini.',         fix: 'Buka Tetapan → Kebolehcapaian → Text-to-Speech → aktifkan Google TTS / Samsung TTS.' },
  'synthesis-failed':      { ms: 'Enjin TTS gagal membina audio.',                 fix: 'Cuba tukar bahasa sasaran atau restart browser.' },
  'language-unavailable':  { ms: 'Bahasa ini tidak dipasang pada peranti anda.',   fix: 'Tetapan → Kebolehcapaian → TTS → Muat Turun Data Bahasa.' },
  'voice-unavailable':     { ms: 'Tiada suara untuk bahasa ini ditemui.',           fix: 'Pasang data bahasa tambahan dalam Tetapan → TTS.' },
  'text-too-long':         { ms: 'Teks terlalu panjang untuk TTS.',                fix: 'Aktifkan mod "Word Pause" dalam Tetapan Admin.' },
  'invalid-argument':      { ms: 'Parameter TTS tidak sah (ralat dalaman).',        fix: 'Muat semula halaman dan cuba semula.' },
  'network':               { ms: 'Ralat rangkaian ketika memuat audio.',            fix: 'Semak sambungan internet anda.' },
};

function _showTtsError(errorCode, langCode, voiceName, speechStarted) {
  const info = TTS_ERROR_INFO[errorCode] || {
    ms:  `Ralat tidak diketahui: "${errorCode || 'tiada kod'}"`,
    fix: 'Cuba muat semula halaman atau guna browser lain (Chrome/Safari).'
  };

  const allVoices = window.speechSynthesis ? (window.speechSynthesis.getVoices() || []) : [];
  const ua = navigator.userAgent;
  const browserShort = /iPhone|iPad|iPod/.test(ua) ? 'iOS Safari'
    : /Samsung/.test(ua) ? 'Samsung Internet'
    : /Chrome/.test(ua) ? 'Chrome'
    : /Firefox/.test(ua) ? 'Firefox'
    : 'Browser tidak dikenal';

  const debugLines = [
    `🔴 Jenis ralat: <b>${errorCode || '(tiada)'}</b>`,
    `🌐 Bahasa diminta: <b>${langCode}</b>`,
    `🎙 Suara digunakan: <b>${voiceName || '(pilih auto)'}</b>`,
    `📱 Browser: <b>${browserShort}</b>`,
    `🗣 Bilangan suara tersedia: <b>${allVoices.length}</b>`,
    `▶️ Audio sempat bermula: <b>${speechStarted ? 'Ya' : 'Tidak — gagal sebelum bermula'}</b>`,
  ].join('<br>');

  Swal.fire({
    icon: 'error',
    title: '🔇 Audio Gagal',
    html: `
      <div class="text-left text-sm space-y-3">
        <p class="font-bold text-red-600 text-base">${info.ms}</p>
        <div class="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3">
          <p class="font-bold text-amber-700 mb-1">💡 Penyelesaian:</p>
          <p class="text-gray-700">${info.fix}</p>
        </div>
        <details class="bg-gray-50 border-2 border-gray-200 rounded-2xl p-3 cursor-pointer">
          <summary class="font-bold text-gray-500 text-xs">🔧 Info Diagnostik (untuk laporan ralat)</summary>
          <div class="mt-2 text-xs text-gray-600 leading-relaxed">${debugLines}</div>
        </details>
      </div>`,
    confirmButtonColor: '#ec4899',
    confirmButtonText: 'OK, Faham',
    showCancelButton: true,
    cancelButtonText: '📋 Salin Info',
    cancelButtonColor: '#6b7280',
  }).then(r => {
    if (r.dismiss === Swal.DismissReason.cancel) {
      const plain = [
        `Ralat: ${errorCode || 'tiada'}`,
        `Bahasa: ${langCode}`,
        `Suara: ${voiceName || 'auto'}`,
        `Browser: ${browserShort}`,
        `Bilangan suara: ${allVoices.length}`,
        `Sempat bermula: ${speechStarted ? 'Ya' : 'Tidak'}`,
        `UA: ${ua}`,
      ].join('\n');
      navigator.clipboard.writeText(plain).catch(() => {});
      Swal.fire({ toast: true, icon: 'success', title: 'Disalin!', timer: 1500, showConfirmButton: false, position: 'top' });
    }
  });
}

// ==========================================
// speakText — synchronous, iOS + Android safe
// Dipanggil DARI button click (user gesture) — speak() terus, tiada unlock perantara
// ==========================================
function speakText(text, langCode, onAllDone) {
  // 1. Semak sokongan TTS
  if (!('speechSynthesis' in window)) {
    Swal.fire({
      icon: 'warning', title: '🔇 TTS Tidak Disokong',
      html: '<p>Browser anda tidak menyokong Text-to-Speech.</p><p class="mt-2 text-sm text-gray-500">Sila guna <b>Chrome</b> atau <b>Safari</b> terkini.</p>',
      confirmButtonColor: '#ec4899'
    });
    if (onAllDone) onAllDone();
    return;
  }

  const str = String(text || '').trim();
  if (!str) { if (onAllDone) onAllDone(); return; }

  // Selalu cancel dahulu — selamat kerana kita dalam user gesture (button click)
  // PENTING: Jangan letak SEBARANG await/setTimeout sebelum speak() — akan buang gesture context
  window.speechSynthesis.cancel();

  const voice = pickVoice(langCode || 'en-US');
  const lang  = voice ? voice.lang : (langCode || 'en-US');
  const rate  = (adminSettings.audioRate  > 0) ? adminSettings.audioRate  : 0.95;
  const pitch = (adminSettings.audioPitch > 0) ? adminSettings.audioPitch : 1.0;
  const voiceName = voice ? (voice.name || voice.lang) : null;

  // 2. Amaran jika tiada suara langsung (mungkin belum dimuatkan)
  const allVoices = window.speechSynthesis.getVoices() || [];
  if (allVoices.length === 0) {
    console.warn('[TTS] Tiada suara dimuatkan lagi — cuba dengan utter.lang sahaja');
  }

  const words = adminSettings.audioWordPause
    ? str.split(/\s+/).filter(Boolean)
    : [str];

  let idx = 0;
  let _watchdog;
  let _speechStarted = false;   // jejak sama ada audio sempat bermula

  function speakNext() {
    clearTimeout(_watchdog);
    if (idx >= words.length) {
      unlockAudioButtons();
      if (onAllDone) onAllDone();
      return;
    }
    const utter = new SpeechSynthesisUtterance(words[idx++]);
    if (voice) utter.voice = voice;
    utter.lang   = lang;
    utter.rate   = rate;
    utter.pitch  = pitch;
    utter.volume = 1;

    utter.onstart = () => { _speechStarted = true; };
    utter.onend   = speakNext;
    utter.onerror = (e) => {
      clearTimeout(_watchdog);
      unlockAudioButtons();
      if (onAllDone) onAllDone();
      // Abaikan ralat "canceled" — ia dijana secara normal apabila kita cancel()
      const code = (e && e.error) ? e.error : '';
      if (code === 'canceled' || code === 'interrupted') return;
      _showTtsError(code, lang, voiceName, _speechStarted);
    };

    window.speechSynthesis.speak(utter);

    // Watchdog: iOS kadang-kadang senyap tanpa onend/onerror
    // Jika tiada respons dalam 12s, tunjuk ralat "tidak bermula"
    _watchdog = setTimeout(() => {
      window.speechSynthesis.cancel();
      unlockAudioButtons();
      if (onAllDone) onAllDone();
      if (!_speechStarted) {
        // TTS tidak pernah bermula — tunjuk ralat diagnostik
        _showTtsError('synthesis-failed', lang, voiceName, false);
      }
    }, 12000);
  }
  speakNext();
}

function playCurrentQuestion() {
  const text = (gameState.currentMalay || document.getElementById('malay-sentence').textContent || '').trim();
  if (!text) return;
  lockAudioButtons();
  speakText(text, getMotherLangCode());
}

function playTargetSentence() {
  const text = (gameState.targetSentence || '').trim();
  if (!text) { Swal.fire('-', 'Soalan belum dimuatkan.', 'info'); return; }
  lockAudioButtons();
  speakText(text, getTargetLangCode());
}

// ==========================================
// PENGURUSAN RALAT
// ==========================================
function showErrorDialog(title, errorMsg, solution) {
  Swal.fire({
    icon: 'error', title,
    html: `<div class="text-left mt-3 text-sm bg-red-50 p-4 rounded-2xl border-2 border-red-200">
      <p class="font-bold text-red-600 mb-1">⚠️ ${errorMsg}</p>
      <p class="text-gray-700">💡 ${solution}</p></div>`,
    confirmButtonColor: '#ec4899', confirmButtonText: 'OK'
  });
}

// ==========================================
// SFX
// ==========================================
function playSuccessSound() {
  initAudio();
  const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
  osc.type='sine'; osc.connect(g); g.connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  [523.25, 659.25, 783.99, 1046.50].forEach((f,i)=>osc.frequency.setValueAtTime(f, now+i*0.1));
  g.gain.setValueAtTime(0.1, now);
  g.gain.exponentialRampToValueAtTime(0.00001, now + 1);
  osc.start(now); osc.stop(now + 1);
}
function playErrorSound() {
  initAudio();
  const osc = audioCtx.createOscillator(); const g = audioCtx.createGain();
  osc.type='square'; osc.connect(g); g.connect(audioCtx.destination);
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
  applyI18n();
  checkNetworkStatus();

  window.addEventListener('online', () => {
    checkNetworkStatus(); processSyncQueue();
    if(!document.getElementById('screen-setup').classList.contains('hidden')) fetchLeaderboard();
  });
  window.addEventListener('offline', checkNetworkStatus);
});

function loadLocalData() {
  const savedName = localStorage.getItem('kacakata_name');
  const savedScore = localStorage.getItem('kacakata_score');
  const savedMother = localStorage.getItem('kacakata_mother_tongue');
  if (savedMother) gameState.motherTongue = savedMother;

  if (savedScore) {
    gameState.score = parseInt(savedScore);
    document.getElementById('display-score').textContent = gameState.score;
  }

  if (savedName) {
    document.getElementById('input-name').value = savedName;
    gameState.name = savedName;
    document.getElementById('display-name').textContent = savedName;
    toggleScreen('screen-language');
  } else {
    toggleScreen('screen-setup');
    fetchLeaderboard();
  }
}

function onMotherTongueChange(newLang) {
  if (!newLang || newLang === gameState.motherTongue) return;
  gameState.motherTongue = newLang;
  localStorage.setItem('kacakata_mother_tongue', newLang);
  // Reset soal yang sedia ada — paksa generate baru ikut bahasa baru
  gameState.questionPool = [];
  gameState.currentIndex = 0;
  applyI18n();
}

function initEventListeners() {
  document.getElementById('btn-start-game').addEventListener('click', startGameSetup);

  ['select-mother-tongue', 'select-mother-tongue-2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', e => onMotherTongueChange(e.target.value));
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', e => selectLanguage(e.currentTarget.getAttribute('data-lang')));
  });

  document.getElementById('btn-custom-lang').addEventListener('click', () => {
    const val = document.getElementById('input-custom-lang').value.trim();
    if(val) selectLanguage(val);
    else Swal.fire('-', t('err_name'), 'warning');
  });

  document.getElementById('btn-settings').addEventListener('click', () => toggleScreen('screen-language'));

  document.getElementById('btn-logout').addEventListener('click', () => {
    Swal.fire({
      title: t('logout_q'), text: t('logout_text'), icon: 'question',
      showCancelButton: true, confirmButtonColor: '#ec4899', cancelButtonColor: '#9ca3af',
      confirmButtonText: t('yes_logout'), cancelButtonText: t('cancel')
    }).then((r) => {
      if (r.isConfirmed) {
        localStorage.removeItem('kacakata_name');
        localStorage.removeItem('kacakata_score');
        location.reload();
      }
    });
  });

  document.querySelectorAll('.level-btn').forEach(btn => {
    btn.addEventListener('click', e => startGameLevel(e.currentTarget.getAttribute('data-level')));
  });

  document.getElementById('btn-check').addEventListener('click', checkAnswer);
  document.getElementById('btn-clear').addEventListener('click', clearBoard);
  document.getElementById('btn-prev-question').addEventListener('click', goPrevQuestion);
  document.getElementById('btn-skip-question').addEventListener('click', goNextQuestion);
  document.getElementById('btn-play-question').addEventListener('click', playCurrentQuestion);
  document.getElementById('btn-play-target').addEventListener('click', playTargetSentence);

  document.getElementById('btn-generate-more').addEventListener('click', () => fetchQuestionBatch(gameState.currentLevel, true));
  document.getElementById('btn-back-levels').addEventListener('click', () => toggleScreen('screen-levels'));

  document.getElementById('btn-admin').addEventListener('click', openAdminLogin);
  document.getElementById('app-title').addEventListener('click', () => {
    appTitleTapCount = (appTitleTapCount || 0) + 1;
    clearTimeout(appTitleTapTimer);
    appTitleTapTimer = setTimeout(() => appTitleTapCount = 0, 1500);
    if (appTitleTapCount >= 5) { appTitleTapCount = 0; openAdminLogin(); }
  });

  // Unlock Web Audio API (untuk SFX beep) pada interaksi pertama
  document.body.addEventListener('touchstart', initAudio, { once: true, passive: true });
  document.body.addEventListener('click',      initAudio, { once: true, passive: true });
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
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'getLeaderboard' })
    });
    const result = await res.json();
    listEl.innerHTML = '';
    if (result.status === 'success' && result.data.length > 0) {
      result.data.forEach((p, i) => {
        const icon = i===0?'👑':i===1?'🥈':i===2?'🥉':`<span class="text-cyan-500 font-bold w-6 inline-block text-center">${i+1}.</span>`;
        listEl.innerHTML += `<div class="flex justify-between items-center bg-white p-3 rounded-2xl shadow-sm border-2 border-cyan-50">
          <span class="font-bold flex items-center gap-3 text-gray-700"><span class="text-xl">${icon}</span><span>${p.name}</span></span>
          <span class="font-extrabold text-yellow-500 bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-200">${p.score} pt</span></div>`;
      });
    } else {
      listEl.innerHTML = '<div class="text-center text-sm text-gray-500 py-2">—</div>';
    }
  } catch (e) {
    listEl.innerHTML = '<div class="text-center text-sm text-red-400 py-2">—</div>';
  }
}

async function startGameSetup() {
  const name = document.getElementById('input-name').value.trim();
  if (!name) return Swal.fire('-', t('err_name'), 'error');

  const motherSel = document.getElementById('select-mother-tongue');
  if (motherSel) onMotherTongueChange(motherSel.value);
  document.getElementById('display-mother-tongue').textContent = gameState.motherTongue;

  if (name.toLowerCase() === (localStorage.getItem('kacakata_name') || '').toLowerCase()) {
    toggleScreen('screen-language'); applyI18n(); return;
  }

  if (!navigator.onLine) return Swal.fire('-', t('err_offline'), 'warning');

  Swal.fire({ title: t('checking_name'), allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'checkName', name })
    });
    const data = await response.json();

    if (data.status === 'exists') {
      const savedScore = parseInt(data.score) || 0;
      const confirm = await Swal.fire({
        title: t('welcome_back', {n: name}),
        html: t('welcome_html', {s: savedScore}),
        icon: 'question', showCancelButton: true,
        confirmButtonColor: '#ec4899', cancelButtonColor: '#9ca3af',
        confirmButtonText: t('yes_continue'), cancelButtonText: t('other_name')
      });
      if (confirm.isConfirmed) {
        gameState.name = name; gameState.score = savedScore;
        localStorage.setItem('kacakata_name', name);
        localStorage.setItem('kacakata_score', savedScore);
        document.getElementById('display-name').textContent = name;
        document.getElementById('display-score').textContent = savedScore;
        toggleScreen('screen-language'); applyI18n();
      }
    } else {
      Swal.close();
      gameState.name = name; gameState.score = 0;
      localStorage.setItem('kacakata_name', name);
      localStorage.setItem('kacakata_score', 0);
      document.getElementById('display-name').textContent = name;
      document.getElementById('display-score').textContent = 0;
      toggleScreen('screen-language'); applyI18n();
    }
  } catch (error) {
    Swal.fire('-', 'Ralat sambungan.', 'error');
  }
}

function selectLanguage(lang) {
  gameState.targetLanguage = lang;
  document.getElementById('badge-selected-lang').textContent = t('learning_badge', {l: lang});
  document.getElementById('game-target-lang').textContent = lang;
  lucide.createIcons();
  toggleScreen('screen-levels');
}

// ==========================================
// LOGIK PERMAINAN
// ==========================================
function startGameLevel(level) {
  if (!GAS_WEB_APP_URL.startsWith('https://script.google.com/')) return Swal.fire('-', 'Sila setup Web App URL', 'warning');
  gameState.currentLevel = level;
  gameState.currentIndex = 0;
  document.getElementById('current-level-badge').textContent = `${t('level1_title').split(':')[0].trim().replace(/[0-9]/,'')} ${level}`;
  toggleScreen('screen-game');
  document.getElementById('end-batch-ui').classList.add('hidden');
  fetchQuestionBatch(level, false);
}

async function fetchQuestionBatch(level, forceRegenerate) {
  document.getElementById('loading-indicator').classList.remove('hidden');
  document.getElementById('game-content').classList.add('hidden');
  document.getElementById('end-batch-ui').classList.add('hidden');
  document.getElementById('loading-text').textContent = t('loading_thinking');

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'getBatchQuestions',
        level, language: gameState.targetLanguage,
        motherTongue: gameState.motherTongue,
        forceRegenerate
      })
    });
    if (!response.ok) throw new Error(`Rangkaian gagal.`);
    const result = await response.json();
    if (result.status === 'error') throw new Error(result.message);
    if (!result.data || !Array.isArray(result.data)) throw new Error("Format data rosak.");

    const pick = (o, keys) => {
      if (!o) return undefined;
      for (const k of keys) {
        const f = Object.keys(o).find(x => x.toLowerCase().trim() === k.toLowerCase());
        if (f && o[f] != null) return o[f];
      }
    };
    const normalized = result.data.map(q => {
      if (!q || typeof q !== 'object') return null;
      const source = pick(q, ['source','malay','melayu','bm','mother','ibunda']);
      const target = pick(q, ['target_sentence','target','translation','english','sentence','ayat']);
      let words = pick(q, ['words','word_list','tokens','perkataan']);
      if (!source || !target) return null;
      if (!Array.isArray(words)) words = String(target).split(/\s+/).filter(Boolean).map(w => ({ word: w, pron: w }));
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
      throw new Error("Format data korup.");
    }

    gameState.questionPool = shuffleArray(normalized);
    gameState.currentIndex = 0;
    loadQuestionAtIndex();
  } catch (error) {
    showErrorDialog('Ralat ⚠️', error.message, "Cuba lagi atau padam Cache Soalan.");
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
  document.getElementById('questions-progress-badge').textContent = `${gameState.currentIndex + 1}/${total}`;
  document.getElementById('btn-prev-question').disabled = gameState.currentIndex === 0;
  document.getElementById('btn-skip-question').disabled = gameState.currentIndex >= total - 1;
  const q = gameState.questionPool[gameState.currentIndex];
  setupBoard(q.malay, q.target_sentence, q.words);
}

function goPrevQuestion() { if (gameState.currentIndex > 0) { gameState.currentIndex--; loadQuestionAtIndex(); } }
function goNextQuestion() { if (gameState.currentIndex < gameState.questionPool.length - 1) { gameState.currentIndex++; loadQuestionAtIndex(); } }

async function fetchClueFromAI() {
  if (!navigator.onLine) { Swal.fire('-', t('almost'), 'warning'); clearBoard(); return; }
  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({
        action: 'getClue', malay: gameState.currentMalay, english: gameState.targetSentence,
        language: gameState.targetLanguage, motherTongue: gameState.motherTongue
      })
    });
    const result = await response.json();
    if (result.status === 'success') {
      Swal.fire({ title: t('clue_title'), text: result.data, icon: 'info',
        confirmButtonColor: '#06b6d4', confirmButtonText: t('thanks') });
    }
  } catch (e) { Swal.fire('-', t('almost'), 'warning'); }
  clearBoard();
}

function setupBoard(malay, targetSentence, wordsArray) {
  try {
    if (!malay || !targetSentence || !Array.isArray(wordsArray)) throw new Error("Data tidak lengkap.");
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
    showErrorDialog("Ralat Papan", error.message, "Pilih tahap semula.");
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
  Array.from(answerEl.children).forEach(c => { if (c.id !== 'answer-placeholder') answerEl.removeChild(c); });
  gameState.availableWords.forEach(w => poolEl.appendChild(createWordTile(w, () => moveWord(w, 'toAnswer'), false)));
  gameState.selectedWords.forEach(w => answerEl.appendChild(createWordTile(w, () => moveWord(w, 'toPool'), true)));
  if (placeholder) placeholder.style.display = gameState.selectedWords.length ? 'none' : '';
  if (answerSortable) { try { answerSortable.destroy(); } catch(e){} }
  if (window.Sortable) {
    answerSortable = Sortable.create(answerEl, {
      animation: 180, delay: 180, delayOnTouchOnly: true,
      filter: '#answer-placeholder', preventOnFilter: false,
      onEnd: () => {
        const ids = Array.from(answerEl.children).filter(c => c.dataset && c.dataset.wid).map(c => c.dataset.wid);
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
  const w = document.createElement('span'); w.className='text-xl drop-shadow-sm'; w.textContent=wordObj.word;
  const p = document.createElement('span'); p.className='text-xs text-pink-500 mt-1 font-medium bg-pink-50 px-2 py-0.5 rounded-full'; p.textContent=wordObj.pron || '-';
  div.appendChild(w); div.appendChild(p);
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

function checkAnswer() {
  if (gameState.selectedWords.length === 0) return;
  const u = gameState.selectedWords.map(w => w.word).join(' ').toLowerCase().trim();
  const c = gameState.targetSentence.toLowerCase().trim();
  if (u === c) {
    playSuccessSound();
    const points = parseInt(gameState.currentLevel) * 15;
    gameState.score += points;
    localStorage.setItem('kacakata_score', gameState.score);
    document.getElementById('display-score').textContent = gameState.score;
    syncScoreToGAS(gameState.score);
    Swal.fire({
      title: t('correct_title'), text: t('correct_pts', {p: points}),
      icon: 'success', timer: 1500, showConfirmButton: false,
      backdrop: `rgba(236, 72, 153, 0.4)`
    }).then(() => {
      gameState.questionPool.splice(gameState.currentIndex, 1);
      if (gameState.currentIndex >= gameState.questionPool.length) gameState.currentIndex = gameState.questionPool.length;
      loadQuestionAtIndex();
    });
  } else {
    playErrorSound();
    Swal.fire({ title: '...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
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
  const payload = { action: 'saveScore', name: gameState.name, score: currentScore, level: gameState.currentLevel, isOfflineSync: false };
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
    title: '🔒 Admin', input: 'password', inputLabel: 'Password',
    showCancelButton: true, confirmButtonText: 'OK', cancelButtonText: t('cancel'),
    confirmButtonColor: '#ec4899'
  }).then(r => {
    if (r.isConfirmed) {
      if (r.value === adminSettings.passwordHash) openAdminPanel();
      else Swal.fire('-', 'Password salah.', 'error');
    }
  });
}

function openAdminPanel() {
  Swal.fire({
    title: '⚙️ Admin Panel', width: 600,
    html: `<div class="text-left space-y-4">
      <div class="bg-cyan-50 p-3 rounded-xl border-2 border-cyan-200">
        <label class="font-bold text-cyan-700 block mb-1">🔊 Rate: <span id="adm-rate-val">${adminSettings.audioRate}</span></label>
        <input id="adm-rate" type="range" min="0.5" max="1.4" step="0.05" value="${adminSettings.audioRate}" class="w-full">
      </div>
      <div class="bg-pink-50 p-3 rounded-xl border-2 border-pink-200">
        <label class="font-bold text-pink-700 block mb-1">🎵 Pitch: <span id="adm-pitch-val">${adminSettings.audioPitch}</span></label>
        <input id="adm-pitch" type="range" min="0.5" max="1.8" step="0.05" value="${adminSettings.audioPitch}" class="w-full">
      </div>
      <div class="bg-yellow-50 p-3 rounded-xl border-2 border-yellow-200">
        <label class="font-bold text-yellow-700 flex items-center gap-2">
          <input id="adm-pause" type="checkbox" ${adminSettings.audioWordPause ? 'checked' : ''}>
          Jeda antara perkataan (mod OKU — audio jadi 'robotik' tapi jelas)
        </label>
      </div>
      <div class="bg-emerald-50 p-3 rounded-xl border-2 border-emerald-200">
        <label class="font-bold text-emerald-700 block mb-1">🏠 Default Mother Tongue</label>
        <select id="adm-mother" class="w-full p-2 rounded-lg border-2 border-emerald-300">
          ${Object.keys(I18N).map(l => `<option ${adminSettings.defaultMotherTongue === l ? 'selected' : ''}>${l}</option>`).join('')}
        </select>
      </div>
      <div class="bg-purple-50 p-3 rounded-xl border-2 border-purple-200">
        <label class="font-bold text-purple-700 block mb-1">🔑 New Password</label>
        <input id="adm-newpass" type="text" placeholder="kosong = no change" class="w-full p-2 rounded-lg border-2 border-purple-300">
      </div>
      <div class="grid grid-cols-2 gap-2">
        <button id="adm-test-audio" class="bg-cyan-500 text-white font-bold py-2 px-3 rounded-xl">🔊 Test</button>
        <button id="adm-regen" class="bg-pink-500 text-white font-bold py-2 px-3 rounded-xl">♻️ Regen</button>
        <button id="adm-clear-local" class="bg-amber-500 text-white font-bold py-2 px-3 rounded-xl col-span-2">🗑️ Clear Local</button>
      </div>
    </div>`,
    showCancelButton: true, confirmButtonText: '💾 Save', cancelButtonText: 'Close',
    confirmButtonColor: '#10b981',
    didOpen: () => {
      const rate = document.getElementById('adm-rate');
      const pitch = document.getElementById('adm-pitch');
      rate.oninput = () => document.getElementById('adm-rate-val').textContent = rate.value;
      pitch.oninput = () => document.getElementById('adm-pitch-val').textContent = pitch.value;
      document.getElementById('adm-test-audio').onclick = () => {
        adminSettings.audioRate = parseFloat(rate.value);
        adminSettings.audioPitch = parseFloat(pitch.value);
        adminSettings.audioWordPause = document.getElementById('adm-pause').checked;
        // Test ayat dalam bahasa ibunda semasa
        const samples = {
          'Bahasa Melayu':'Helo, hari ini cuaca sangat cerah dan indah.',
          'Bahasa Inggeris':'Hello, the weather today is bright and lovely.',
          'Bahasa Indonesia':'Halo, cuaca hari ini cerah dan indah.',
          'Bahasa Mandarin':'你好，今天天气晴朗又美丽。',
          'Bahasa Arab':'مرحبا، الطقس اليوم مشمس وجميل.',
          'Bahasa Jepun':'こんにちは、今日は晴れて気持ちいいです。',
          'Bahasa Korea':'안녕하세요, 오늘 날씨가 매우 좋습니다.'
        };
        const txt = samples[gameState.motherTongue] || 'Hello, this is an audio test.';
        speakText(txt, getMotherLangCode());
      };
      document.getElementById('adm-regen').onclick = () => {
        Swal.close();
        if (gameState.currentLevel) fetchQuestionBatch(gameState.currentLevel, true);
      };
      document.getElementById('adm-clear-local').onclick = () => {
        if (confirm('Padam semua data tempatan?')) { localStorage.clear(); location.reload(); }
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
  });
}

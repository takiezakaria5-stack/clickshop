const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, uploadDir); },
    filename: (req, file, cb) => { cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)); }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 } 
});

const DB_FILE = path.join(__dirname, 'database.json');

let db = {
    stores: [],
    siteSettings: {
        logoUrl: "https://i.ibb.co/6P82W8h/default-avatar.png",
        whatsapp: "213700000000",
        telegramBotToken: "",
        announcementType: "text",
        announcementText: "📢 مكان مخصص للإعلانات والعروض الخاصة بك هنا",
        announcementImage: ""
    },
    activeCodes: [
        { code: "CS-9X4F-7B2K", createdAt: "2026-11-15 10:00" },
        { code: "CS-3M8R-9P1W", createdAt: "2026-11-15 10:05" },
        { code: "CS-5V2X-4H8N", createdAt: "2026-11-15 10:10" }
    ],
    usedCodes: []
};

// تحميل البيانات بقراءة آمنة ومستقرة
if (fs.existsSync(DB_FILE)) {
    try {
        const fileData = fs.readFileSync(DB_FILE, 'utf8');
        if (fileData.trim() !== '') {
            db = JSON.parse(fileData);
        }
    } catch (e) {
        console.error("Error reading database.json:", e);
    }
}

function saveDB() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
    } catch (e) {
        console.error("Error saving database.json:", e);
    }
}

async function sendTelegramNotification(chatId, message) {
    if (!chatId || !db.siteSettings.telegramBotToken) return;
    try {
        const fetch = (await import('node-fetch')).default;
        await fetch(`https://api.telegram.org/bot${db.siteSettings.telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
        });
    } catch (e) {}
}

const states = ["01. أدرار", "02. الشلف", "03. الأغواط", "04. أم البواقي", "05. باتنة", "06. بجاية", "07. بسكرة", "08. بشار", "09. البليدة", "10. البويرة", "11. تمنراست", "12. تبسة", "13. تلمسان", "14. تيارت", "15. تيزي وزو", "16. الجزائر", "17. الجلفة", "18. جيجل", "19. سطيف", "20. سعيدة", "21. سكيكدة", "22. سيدي بلعباس", "23. عنابة", "24. قالمة", "25. قسنطينة", "26. المدية", "27. مستغانم", "28. المسيلة", "29. معسكر", "30. ورقلة", "31. وهران", "32. البيض", "33. إليزي", "34. برج بوعريريج", "35. بومرداس", "36. الطارف", "37. تندوف", "38. تسيمسيلت", "39. الوادي", "40. خنشلة", "41. سوق اهراس", "42. تيبازة", "43. ميلة", "44. عين الدفلى", "45. نعامة", "46. عين تيموشنت", "47. غرداية", "48. غليزان", "49. المغير", "50. المنيعة", "51. أولاد جلال", "52. برج باجي مختار", "53. بني عباس", "54. تيميمون", "55. تقرت", "56. جانت", "57. المغير", "58. المنيعة"];

const storeColors = [
    { name: "كشميري", code: "#d4b996" },
    { name: "زيتوني", code: "#4a5d4e" },
    { name: "كحلي", code: "#1b2a4a" },
    { name: "شوكولاتي", code: "#3d2314" },
    { name: "فحمي", code: "#2b2b2b" },
    { name: "كريمي", code: "#f5f2eb" },
    { name: "رمادي", code: "#7d8491" },
    { name: "تبغي", code: "#8c6239" }
];

app.get('/manifest.json', (req, res) => {
    res.json({
        name: "ClickShop Pro",
        short_name: "ClickShop",
        start_url: "/",
        display: "standalone",
        background_color: "#1b2a4a",
        theme_color: "#1b2a4a",
        icons: [
            { src: db.siteSettings.logoUrl, sizes: "192x192", type: "image/png" },
            { src: db.siteSettings.logoUrl, sizes: "512x512", type: "image/png" }
        ]
    });
});

app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        self.addEventListener('install', (e) => { e.waitUntil(self.skipWaiting()); });
        self.addEventListener('activate', (e) => { e.clients.claim(); });
        self.addEventListener('fetch', (e) => { e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); });
    `);
});

function renderLayout(title, content, extraHead = '') {
    let siteLogoHTML = `<div class="logo-circle">Logo</div>`;
    if (db.siteSettings.logoUrl && db.siteSettings.logoUrl !== "https://i.ibb.co/6P82W8h/default-avatar.png") {
        siteLogoHTML = `<img src="${db.siteSettings.logoUrl}" style="width:44px; height:44px; border-radius:50%; object-fit:cover; border:2px solid #fff;">`;
    }

    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${title}</title>
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#1b2a4a">
        <style>
            * { box-sizing: border-box; font-family: Tahoma, Arial, sans-serif; }
            body { margin: 0; padding: 0; background: #f3f4f6; color: #111827; width: 100%; overflow-x: hidden; }
            .navbar { background: #1b2a4a; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; color: #fff; width: 100%; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .brand { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; color: #fff; }
            .brand h1 { margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px; }
            .logo-circle { background: #fff; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #1b2a4a; font-weight: bold; font-size: 11px; box-shadow: 0 2px 5px rgba(0,0,0,0.15); }
            
            .pwa-install-banner { background: #d4b996; color: #1b2a4a; padding: 10px 15px; text-align: center; font-size: 13px; font-weight: bold; display: none; cursor: pointer; border-bottom: 1px solid #b8976d; }

            .lang-dropdown { position: relative; display: inline-block; }
            .lang-main-btn { background: rgba(255,255,255,0.2); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; }
            .lang-content { display: none; position: absolute; left: 0; background-color: #fff; min-width: 100px; box-shadow: 0px 8px 16px rgba(0,0,0,0.2); border-radius: 6px; z-index: 1; overflow: hidden; }
            .lang-content button { color: #111827; padding: 8px 12px; text-decoration: none; display: block; border: none; background: none; width: 100%; text-align: right; font-size: 12px; cursor: pointer; font-weight: bold; }
            .lang-content button:hover { background-color: #f3f4f6; color: #1b2a4a; }
            .lang-dropdown:hover .lang-content { display: block; }

            .hero-section { background: linear-gradient(135deg, #1b2a4a 0%, #2b3a5a 100%); color: #fff; padding: 30px 15px; text-align: center; width: 100%; }
            .card-box { background: #fff; margin: -20px 12px 15px 12px; padding: 20px; border-radius: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); color: #111827; text-align: right; }
            .announcement-box { border: 2px dashed #d4b996; background: #fdfbf7; padding: 12px; border-radius: 10px; margin-bottom: 18px; text-align: center; min-height: 90px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
            .btn { display: block; width: 100%; padding: 13px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; border: none; cursor: pointer; text-align: center; }
            .btn-green { background: #1b2a4a; color: #fff; }
            .btn-blue { background: #3d2314; color: #fff; }
            label { display: block; font-size: 13px; font-weight: bold; margin-bottom: 5px; color: #1b2a4a; }
            input, select, textarea { width: 100%; padding: 11px; margin-bottom: 12px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #fff; color: #111827; }
            input:focus, select:focus, textarea:focus { outline: none; border-color: #1b2a4a; }
        </style>
        ${extraHead}
    </head>
    <body>
        <div id="installBanner" class="pwa-install-banner" onclick="installPWA()">
            📱 انقر هنا لتثبيت تطبيق ClickShop على شاشة هاتفك الرئيسية!
        </div>
        <div class="navbar">
            <a href="/admin-login" class="brand" title="لوحة المدير العام">
                ${siteLogoHTML}
                <h1>ClickShop</h1>
            </a>
            <div class="lang-dropdown">
                <button class="lang-main-btn">🌐 اللغات ▾</button>
                <div class="lang-content">
                    <button onclick="setLang('ar')">العربية</button>
                    <button onclick="setLang('fr')">Français</button>
                    <button onclick="setLang('en')">English</button>
                </div>
            </div>
        </div>
        ${content}
        <script>
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                deferredPrompt = e;
                document.getElementById('installBanner').style.display = 'block';
            });

            function installPWA() {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    deferredPrompt.userChoice.then((choiceResult) => {
                        if (choiceResult.outcome === 'accepted') {
                            document.getElementById('installBanner').style.display = 'none';
                        }
                        deferredPrompt = null;
                    });
                }
            }

            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('/sw.js');
            }

            function setLang(l){
                const t1 = document.getElementById('t1');
                const t2 = document.getElementById('t2');
                const desc = document.getElementById('desc');
                const b1 = document.getElementById('b1');
                const b2 = document.getElementById('b2');
                if(!t1) return;
                if(l==='fr'){
                    t1.innerText="Créez votre boutique pro en secondes";
                    t2.innerText="Comment fonctionne ClickShop ?";
                    desc.innerText="Nous travaillons 24/7 pour assurer la stabilité de votre boutique, recevoir les commandes instantanément via Telegram et WhatsApp !";
                    b1.innerText="🚀 Créer ma nouvelle boutique";
                    b2.innerText="⚙️ Connexion Marchand";
                }else if(l==='en'){
                    t1.innerText="Create your pro store in seconds";
                    t2.innerText="How does ClickShop work?";
                    desc.innerText="We work 24/7 to ensure your store stability, receive customer orders instantly via Telegram and WhatsApp!";
                    b1.innerText="🚀 Create New Store";
                    b2.innerText="⚙️ Merchant Login";
                }else{
                    t1.innerText="أطلق متجرك الإلكتروني الاحترافي في دقائق";
                    t2.innerText="كيف تعمل منصة ClickShop؟ ⚙️";
                    desc.innerText="نحن نعمل على مدار الساعة طوال أيام الأسبوع (24/7) لضمان استقرار متجرك، استقبال طلبات الزبائن وتنبيهك فورياً عبر التيليغرام والواتساب!";
                    b1.innerText="🚀 ابدأ إنشاء متجرك الجديد";
                    b2.innerText="⚙️ تسجيل دخول التجار";
                }
            }
        </script>
    </body>
    </html>`;
}

app.get('/', (req, res) => {
    let announcementHTML = '';
    if (db.siteSettings.announcementType === 'image' && db.siteSettings.announcementImage) {
        announcementHTML = `<img src="${db.siteSettings.announcementImage}" style="width:100%; max-height:180px; object-fit:cover; border-radius:8px;">`;
    } else {
        announcementHTML = `<span style="color:#3d2314; font-size:14px; font-weight:bold;">${db.siteSettings.announcementText}</span>`;
    }

    const html = `
        <div class="hero-section">
            <h1 id="t1" style="font-size: 22px; margin: 0 0 10px 0; line-height: 1.4;">أطلق متجرك الإلكتروني الاحترافي في دقائق</h1>
            <p style="font-size: 13px; margin: 0 auto; max-width: 450px; opacity: 0.9; line-height: 1.6;">منصة ClickShop تمنحك كل الأدوات اللازمة لإدارة منتجاتك، استقبال طلباتك، وتوسيع تجارتك بكل سهولة واحترافية.</p>
            <div style="margin-top: 15px;">
                <a href="/register-page" class="btn" style="background:#fff; color:#1b2a4a; display:inline-block; width:auto; padding:9px 20px; font-size:14px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">ابدأ متجرك الآن 🚀</a>
            </div>
        </div>

        <div class="card-box">
            <div class="announcement-box">
                ${announcementHTML}
            </div>
            
            <h3 id="t2" style="color:#1b2a4a; font-size:16px; margin-top:0; text-align:center;">كيف تعمل منصة ClickShop؟ ⚙️</h3>
            <p id="desc" style="font-size:13px; color:#4b5563; line-height:1.6; text-align:center; margin-bottom:20px;">
                نحن نعمل على مدار الساعة طوال أيام الأسبوع (<b>24/7</b>) لضمان استقرار متجرك، استقبال طلبات الزبائن وتنبيهك فورياً عبر التيليغرام والواتساب!
            </p>

            <div style="display:flex; flex-direction:column; gap:12px;">
                <a href="/register-page" id="b1" class="btn btn-green">🚀 ابدأ إنشاء متجرك الجديد</a>
                <a href="/login-store" id="b2" class="btn btn-blue">⚙️ تسجيل دخول التجار</a>
            </div>
        </div>
    `;
    res.send(renderLayout('ClickShop - منصة المتاجر الإلكترونية', html));
});

app.get('/admin-login', (req, res) => {
    const html = `
        <div style="padding:15px; max-width:450px; margin:0 auto; width:100%;">
            <div class="card-box" style="margin:20px 0; text-align:center;">
                <h2 style="color:#1b2a4a; margin-top:0; font-size:18px;">لوحة تحكم المدير العام 🛠️</h2>
                <form action="/admin-auth" method="POST">
                    <input type="password" name="adminPassword" placeholder="كلمة المرور السرية" required>
                    <button type="submit" class="btn btn-green">دخول</button>
                </form>
                <a href="/" style="display:block; color:#6b7280; text-decoration:none; margin-top:15px; font-size:13px;">← عودة للرئيسية</a>
            </div>
        </div>
    `;
    res.send(renderLayout('دخول المدير العام', html));
});

app.post('/admin-auth', (req, res) => {
    if (req.body.adminPassword === 'kenouni19') {
        res.redirect('/admin-dashboard');
    } else {
        res.send(`<script>alert('كلمة المرور خطأ!'); window.location.href='/admin-login';</script>`);
    }
});

app.get('/admin-dashboard', (req, res) => {
    const html = `
        <div style="padding:15px; max-width:600px; margin:0 auto; width:100%;">
            <div class="card-box" style="margin:15px 0;">
                <h2 style="color:#1b2a4a; text-align:center; margin-top:0; font-size:18px;">لوحة تحكم المدير العام 🛠️</h2>
                
                <h3 style="font-size:15px; color:#1b2a4a; font-weight:bold;">تخصيص شعار المنصة (Logo):</h3>
                <form action="/admin/update-logo" method="POST" enctype="multipart/form-data" style="margin-bottom:20px; background:#f9fafb; padding:12px; border-radius:8px; border:1px solid #e5e7eb;">
                    <label>اختر صورة الشعار من الهاتف (Gallery):</label>
                    <input type="file" name="logoFile" accept="image/*" required style="margin-bottom:10px; background:#fff;">
                    <button type="submit" class="btn" style="background:#1b2a4a; color:#fff; padding:10px;">حفظ وتحديث شعار المنصة 🖼️</button>
                </form>

                <h3 style="font-size:15px; color:#1b2a4a; font-weight:bold;">تخصيص مساحة الإعلانات:</h3>
                <form action="/admin/update-announcement" method="POST" enctype="multipart/form-data" style="margin-bottom:20px; background:#f9fafb; padding:12px; border-radius:8px; border:1px solid #e5e7eb;">
                    <label>نوع الإعلان:</label>
                    <select name="announcementType" style="margin-bottom:10px;">
                        <option value="text" ${db.siteSettings.announcementType === 'text' ? 'selected' : ''}>نص إعلاني</option>
                        <option value="image" ${db.siteSettings.announcementType === 'image' ? 'selected' : ''}>صورة من المعرض</option>
                    </select>

                    <label>النص الإعلاني:</label>
                    <input type="text" name="announcementText" value="${db.siteSettings.announcementText}" style="margin-bottom:10px;">

                    <label>اختر صورة الإعلان من الهاتف (Gallery):</label>
                    <input type="file" name="announcementImageFile" accept="image/*" style="margin-bottom:10px; background:#fff;">
                    
                    <button type="submit" class="btn" style="background:#d4b996; color:#1b2a4a; padding:10px;">حفظ وتحديث الإعلان 📢</button>
                </form>

                <label>توليد كود تفعيل جديد:</label>
                <form action="/admin/generate-code" method="POST" style="margin-bottom:15px;">
                    <button type="submit" class="btn btn-green" style="padding:10px;">توليد كود تفعيل عشوائي ⚡</button>
                </form>

                <label>الأكواد المتاحة (${db.activeCodes.length}):</label>
                <div style="background:#f9fafb; padding:10px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:15px; max-height:140px; overflow-y:auto;">
                    ${db.activeCodes.map(c => `<div style="font-size:12px; margin-bottom:5px; display:flex; justify-content:space-between; border-bottom:1px solid #eee; padding-bottom:4px;"><span>🔑 <b>${c.code}</b></span><span style="color:#6b7280;">${c.createdAt}</span></div>`).join('')}
                </div>

                <label>المتاجر المسجلة (${db.stores.length}):</label>
                ${db.stores.length === 0 ? '<p style="color:#6b7280; font-size:12px;">لا توجد متاجر مسجلة بعد.</p>' : ''}
                ${db.stores.map((s, idx) => `<div style="background:#f9fafb; padding:8px; border:1px solid #e5e7eb; border-radius:6px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px; color:#1b2a4a; font-weight:bold;"><b>${s.storeName}</b></span><div style="display:flex; gap:5px;"><a href="/store/${s.storeSlug}" target="_blank" style="background:#1b2a4a; color:#fff; padding:4px 8px; text-decoration:none; border-radius:4px; font-size:11px;">زيارة</a><form action="/admin/delete-store" method="POST" style="margin:0;"><input type="hidden" name="storeIndex" value="${idx}"><button type="submit" style="background:#dc2626; color:#fff; border:none; padding:4px 8px; cursor:pointer; border-radius:4px; font-size:11px;">حذف</button></form></div></div>`).join('')}
                
                <a href="/" style="display:block; text-align:center; color:#6b7280; text-decoration:none; margin-top:15px; font-size:13px;">← تسجيل الخروج للرئيسية</a>
            </div>
        </div>
    `;
    res.send(renderLayout('لوحة تحكم المدير', html));
});

app.post('/admin/update-logo', upload.single('logoFile'), (req, res) => {
    if (req.file) {
        db.siteSettings.logoUrl = '/uploads/' + req.file.filename;
        saveDB();
    }
    res.redirect('/admin-dashboard');
});

app.post('/admin/update-announcement', upload.single('announcementImageFile'), (req, res) => {
    db.siteSettings.announcementType = req.body.announcementType || 'text';
    db.siteSettings.announcementText = req.body.announcementText || '';
    if (req.file) {
        db.siteSettings.announcementImage = '/uploads/' + req.file.filename;
    }
    saveDB();
    res.redirect('/admin-dashboard');
});

app.post('/admin/generate-code', (req, res) => {
    const randomCode = 'CS-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const now = new Date();
    const dateStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    db.activeCodes.push({ code: randomCode, createdAt: dateStr });
    saveDB();
    res.redirect('/admin-dashboard');
});

app.post('/admin/delete-store', (req, res) => {
    if (req.body.storeIndex !== undefined) {
        db.stores.splice(parseInt(req.body.storeIndex), 1);
        saveDB();
    }
    res.redirect('/admin-dashboard');
});

app.get('/register-page', (req, res) => {
    const timerScript = `
        <script>
            let timeLeft = 75;
            function startTimer() {
                let timerElement = document.getElementById('timer');
                let interval = setInterval(() => {
                    let minutes = Math.floor(timeLeft / 60);
                    let seconds = timeLeft % 60;
                    timerElement.innerText = (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
                    if (timeLeft <= 0) {
                        clearInterval(interval);
                        timerElement.innerText = "انتهت صلاحية الجلسة!";
                    }
                    timeLeft--;
                }, 1000);
            }
            window.onload = startTimer;
        </script>
    `;
    const html = `
        <div style="padding:12px; max-width:500px; margin:0 auto; width:100%;">
            <div class="card-box" style="margin:10px 0;">
                <h2 style="color:#1b2a4a; text-align:center; margin-top:0; font-size:18px;">بيانات متجرك الجديد</h2>
                
                <div style="border: 2px solid #1b2a4a; background:#f4f6f9; padding:10px; border-radius:8px; margin-bottom:15px; text-align:center; color:#1b2a4a; font-weight:bold; font-size:13px;">
                    الوقت المتبقي لإدخال كود التفعيل:<br>
                    <span id="timer" style="color:#dc2626; font-size:20px; display:inline-block; margin-top:3px;">01:15</span>
                </div>

                <form action="/register" method="POST">
                    <label>كود التفعيل:</label>
                    <input type="text" name="activationCode" placeholder="مثال: CS-XXXX-XXXX" required style="border-color:#1b2a4a;">
                    
                    <label>اسم المتجر:</label>
                    <input type="text" name="storeName" placeholder="مثال: ClickShop Store" required>
                    
                    <label>رابط المتجر بالإنجليزية (Slug):</label>
                    <input type="text" name="storeSlug" placeholder="clickshop-store" required>
                    
                    <label>مجال التجارة:</label>
                    <select name="storeCategory" required>
                        <option value="ملابس وأزياء">ملابس وأزياء</option>
                        <option value="إلكترونيات وتكنولوجيا">إلكترونيات وتكنولوجيا</option>
                        <option value="صحة وجمال">صحة وجمال</option>
                        <option value="أجهزة منزلية">أجهزة منزلية</option>
                    </select>

                    <label>لون واجهة المتجر (أولد موني):</label>
                    <select name="storeColor">
                        ${storeColors.map(c => `<option value="${c.code}">${c.name}</option>`).join('')}
                    </select>

                    <label>اسم صاحب المتجر:</label>
                    <input type="text" name="ownerName" placeholder="الاسم الكامل" required>
                    
                    <label>رقم واتساب:</label>
                    <input type="text" name="whatsapp" value="213700000000" required>
                    
                    <label>معرف تيليغرام (Chat ID للإشعارات):</label>
                    <input type="text" name="telegramChatId" placeholder="اختياري للتنبيهات الفورية">
                    
                    <label>كلمة المرور لوحة التحكم:</label>
                    <input type="password" name="password" placeholder="********" required>
                    
                    <button type="submit" class="btn btn-green">إنشاء المتجر 🚀</button>
                </form>
                <a href="/" style="display:block; text-align:center; color:#6b7280; text-decoration:none; margin-top:15px; font-size:13px;">← عودة للرئيسية</a>
            </div>
        </div>
    `;
    res.send(renderLayout('إنشاء متجر جديد', html, timerScript));
});

app.post('/register', (req, res) => {
    const { activationCode, storeName, storeSlug, storeCategory, storeColor, ownerName, whatsapp, telegramChatId, password } = req.body;
    const idx = db.activeCodes.findIndex(c => c.code === activationCode.trim());
    if (idx === -1) return res.send(renderLayout('خطأ', '<div style="padding:20px;"><div class="card-box" style="text-align:center;"><h3 style="color:red; font-size:16px;">كود التفعيل غير صالح أو تم استخدامه!</h3><a href="/register-page" class="btn btn-green">عودة</a></div></div>'));
    if (db.stores.find(s => s.storeSlug === storeSlug.trim())) return res.send(renderLayout('خطأ', '<div style="padding:20px;"><div class="card-box" style="text-align:center;"><h3 style="color:red; font-size:16px;">رابط المتجر محجوز مسبقاً!</h3><a href="/register-page" class="btn btn-green">عودة</a></div></div>'));
    
    const expiry = new Date(); expiry.setMonth(expiry.getMonth() + 6);
    db.stores.push({ activationCode: activationCode.trim(), storeName, storeSlug: storeSlug.trim(), storeCategory, storeColor: storeColor || '#1b2a4a', ownerName, whatsapp: whatsapp || "213700000000", telegramChatId: telegramChatId || "", logoUrl: "https://i.ibb.co/6P82W8h/default-avatar.png", defaultShippingPrice: 500, password, products: [], orders: [], expiryDate: expiry.toISOString() });
    db.activeCodes.splice(idx, 1);
    db.usedCodes.push(activationCode.trim());
    saveDB();
    
    const html = `
        <div style="padding:15px; max-width:450px; margin:0 auto; width:100%;">
            <div class="card-box" style="text-align:center; margin:20px 0;">
                <h2 style="color:#1b2a4a; margin-top:0; font-size:18px;">مبروك ${ownerName}! تم إنشاء المتجر 🚀</h2>
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:18px;">
                    <a href="/store/${storeSlug.trim()}" class="btn" style="background:#3d2314; color:#fff;">فتح المتجر 🛒</a>
                    <a href="/store/${storeSlug.trim()}/login" class="btn btn-green">لوحة التحكم ⚙️</a>
                </div>
            </div>
        </div>
    `;
    res.send(renderLayout('تم إنشاء المتجر', html));
});

app.get('/login-store', (req, res) => {
    const html = `
        <div style="padding:15px; max-width:400px; margin:0 auto; width:100%;">
            <div class="card-box" style="margin:20px 0;">
                <h2 style="color:#1b2a4a; margin-top:0; font-size:18px;">تسجيل دخول التجار ⚙️</h2>
                <form action="/login-store-direct" method="POST">
                    <label>رابط المتجر بالإنجليزية (Slug):</label>
                    <input type="text" name="storeSlug" placeholder="مثال: my-store" required>
                    <label>كلمة المرور:</label>
                    <input type="password" name="password" placeholder="كلمة مرور لوحة التحكم" required>
                    <button type="submit" class="btn btn-green">دخول لوحة التحكم 🚀</button>
                </form>
                <a href="/" style="display:block; text-align:center; color:#6b7280; text-decoration:none; margin-top:15px; font-size:13px;">← عودة للرئيسية</a>
            </div>
        </div>
    `;
    res.send(renderLayout('دخول التجار', html));
});

app.post('/login-store-direct', (req, res) => {
    const { storeSlug, password } = req.body;
    const store = db.stores.find(s => s.storeSlug === storeSlug.trim());
    if (store && store.password === password) {
        res.redirect(`/store/${store.storeSlug}/dashboard`);
    } else {
        res.send(`<script>alert('رابط المتجر أو كلمة المرور خطأ!'); window.location.href='/login-store';</script>`);
    }
});

app.get('/store/:slug/login', (req, res) => {
    const html = `
        <div style="padding:15px; max-width:400px; margin:0 auto; width:100%;">
            <div class="card-box" style="text-align:center; margin:20px 0;">
                <h2 style="color:#1b2a4a; margin-top:0; font-size:18px;">كلمة مرور لوحة التحكم</h2>
                <form action="/store/${req.params.slug}/auth" method="POST">
                    <input type="password" name="password" placeholder="أدخل كلمة المرور" required>
                    <button type="submit" class="btn btn-green">دخول</button>
                </form>
                <a href="/store/${req.params.slug}" style="display:block; margin-top:15px; color:#6b7280; text-decoration:none; font-size:13px;">← عودة للمتجر</a>
            </div>
        </div>
    `;
    res.send(renderLayout('تسجيل الدخول', html));
});

app.post('/store/:slug/auth', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (store && store.password === req.body.password) {
        res.redirect(`/store/${store.storeSlug}/dashboard`);
    } else {
        res.send(`<script>alert('كلمة المرور خطأ!'); window.location.href='/store/${req.params.slug}/login';</script>`);
    }
});

app.get('/store/:slug/dashboard', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (!store) return res.send('المتجر غير موجود');
    if (store.defaultShippingPrice === undefined) store.defaultShippingPrice = 500;

    const html = `
        <div style="padding:12px; max-width:600px; margin:0 auto; width:100%;">
            <div class="card-box" style="margin:10px 0;">
                <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                    <a href="/store/${store.storeSlug}" target="_blank" style="background:#3d2314; color:#fff; padding:6px 10px; text-decoration:none; border-radius:6px; font-size:12px; font-weight:bold;">معاينة المتجر 🛒</a>
                    <a href="/" style="background:#4b5563; color:#fff; padding:6px 10px; text-decoration:none; border-radius:6px; font-size:12px; font-weight:bold;">الرئيسية 🏠</a>
                </div>
                <h2 style="color:${store.storeColor || '#1b2a4a'}; text-align:center; margin-top:0; font-size:18px;">لوحة تحكم: ${store.storeName}</h2>
                <hr style="border:0; border-top:1px solid #eee; margin:12px 0;">
                
                <h3 style="font-size:15px; margin-top:0; color:#1b2a4a; font-weight:bold;">تخصيص شعار المتجر (Logo):</h3>
                <form action="/store/${store.storeSlug}/update-logo" method="POST" enctype="multipart/form-data" style="margin-bottom:20px; background:#f9fafb; padding:12px; border-radius:8px; border:1px solid #e5e7eb;">
                    <label>اختر صورة الشعار من الهاتف (Gallery):</label>
                    <input type="file" name="storeLogoFile" accept="image/*" required style="margin-bottom:10px; background:#fff;">
                    <button type="submit" class="btn" style="background:${store.storeColor || '#1b2a4a'}; color:#fff; padding:10px;">حفظ وتحديث شعار المتجر 🖼️</button>
                </form>

                <h3 style="font-size:15px; margin-top:0; color:#1b2a4a; font-weight:bold;">سعر التوصيل الافتراضي:</h3>
                <form action="/store/${store.storeSlug}/update-shipping" method="POST" style="margin-bottom:20px; background:#f9fafb; padding:12px; border-radius:8px; border:1px solid #e5e7eb;">
                    <label>سعر التوصيل (دج):</label>
                    <input type="number" name="defaultShippingPrice" value="${store.defaultShippingPrice}" required style="margin-bottom:10px;">
                    <button type="submit" class="btn" style="background:#3d2314; color:#fff; padding:10px;">حفظ سعر التوصيل 🚚</button>
                </form>

                <h3 style="font-size:15px; margin-top:0; color:#1b2a4a; font-weight:bold;">إضافة منتج (${store.products.length}/10)</h3>
                ${store.products.length >= 10 ? '<p style="color:red; font-size:12px;">بلغت الحد الأقصى للمنتجات.</p>' : `
                <form action="/store/${store.storeSlug}/add-product" method="POST" enctype="multipart/form-data">
                    <label>اسم المنتج:</label>
                    <input type="text" name="productName" required>
                    <label>السعر (دج):</label>
                    <input type="text" name="productPrice" required>
                    <label>وصف المنتج وتفاصيله:</label>
                    <textarea name="productDesc" rows="3" placeholder="اكتب وصفاً جذاباً للمنتج..." required></textarea>
                    <label>صور المنتج (يمكنك اختيار حتى 10 صور من معرض الهاتف):</label>
                    <input type="file" name="productImages" accept="image/*" multiple required style="background:#fff;">
                    <label>الأنواع / الألوان المتاحة (افصل بينها بفاصلة):</label>
                    <input type="text" name="colors" placeholder="أحمر، أبيض، أسود">
                    <label>المقاسات المتاحة (اختياري، افصل بينها بفاصلة):</label>
                    <input type="text" name="sizes" placeholder="S, M, L">
                    <button type="submit" class="btn" style="background:${store.storeColor || '#1b2a4a'}; color:#fff;">إضافة المنتج ➕</button>
                </form>`}

                <h3 style="margin-top:20px; font-size:15px; color:#1b2a4a; font-weight:bold;">الطلبات الواردة (${store.orders.length}):</h3>
                ${store.orders.length === 0 ? '<p style="color:#6b7280; font-size:12px;">لا توجد طلبات مسجلة بعد.</p>' : ''}
                ${store.orders.map(o => `
                    <div style="background:#f9fafb; padding:10px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:8px; font-size:12px;">
                        <div><b>#${o.trackingId}</b> - <span style="color:#1b2a4a; font-weight:bold;">${o.productName}</span> (المنتج: ${o.itemPrice} دج | التوصيل: ${o.shippingPrice} دج | المجموع: <b>${o.price} دج</b>)</div>
                        <div style="color:#374151; margin-top:4px;">الزبون: <b>${o.firstName} ${o.lastName}</b> | الهاتف: <a href="tel:${o.phone}" style="color:#2563eb; font-weight:bold;">${o.phone}</a> | الولاية: ${o.state}</div>
                        <div style="color:#4b5563; margin-top:3px;">الكمية: <b>${o.quantity}</b> | اللون: ${o.color || 'غير محدد'} | المقاس: ${o.size || 'غير محدد'}</div>
                    </div>
                `).join('')}

                <h3 style="margin-top:20px; font-size:15px; color:#1b2a4a; font-weight:bold;">المنتجات الحالية:</h3>
                ${store.products.length === 0 ? '<p style="color:#6b7280; font-size:12px;">لا توجد منتجات مضافة بعد.</p>' : ''}
                ${store.products.map((p, i) => `
                    <div style="background:#f9fafb; padding:10px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:13px; color:#1b2a4a; font-weight:bold;"><b>${p.name}</b> - ${p.price} دج</span>
                        <form action="/store/${store.storeSlug}/delete-product" method="POST" style="margin:0;">
                            <input type="hidden" name="productIndex" value="${i}">
                            <button type="submit" style="background:#dc2626; color:#fff; border:none; padding:5px 8px; cursor:pointer; border-radius:6px; font-size:11px;">حذف</button>
                        </form>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    res.send(renderLayout(`لوحة تحكم ${store.storeName}`, html));
});

app.post('/store/:slug/update-logo', upload.single('storeLogoFile'), (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (store && req.file) {
        store.logoUrl = '/uploads/' + req.file.filename;
        saveDB();
    }
    res.redirect(`/store/${req.params.slug}/dashboard`);
});

app.post('/store/:slug/update-shipping', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (store) {
        store.defaultShippingPrice = parseFloat(req.body.defaultShippingPrice) || 0;
        saveDB();
    }
    res.redirect(`/store/${req.params.slug}/dashboard`);
});

app.post('/store/:slug/add-product', upload.array('productImages', 10), (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (store && store.products.length < 10) {
        let imageUrls = ["https://i.ibb.co/6P82W8h/default-avatar.png"];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(f => '/uploads/' + f.filename);
        }
        store.products.push({ 
            name: req.body.productName, 
            price: req.body.productPrice, 
            desc: req.body.productDesc || "",
            images: imageUrls, 
            colors: req.body.colors || "", 
            sizes: req.body.sizes || "" 
        });
        saveDB();
    }
    res.redirect(`/store/${store.storeSlug}/dashboard`);
});

app.post('/store/:slug/delete-product', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (store && req.body.productIndex !== undefined) {
        store.products.splice(parseInt(req.body.productIndex), 1);
        saveDB();
    }
    res.redirect(`/store/${store.storeSlug}/dashboard`);
});

app.post('/store/:slug/checkout', async (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (!store) return res.send('المتجر غير موجود');
    if (store.defaultShippingPrice === undefined) store.defaultShippingPrice = 500;

    const { productName, price, firstName, lastName, phone, state, quantity, color, size } = req.body;
    const trackingId = 'TRK-' + Math.floor(100000 + Math.random() * 900000);
    
    const unitPrice = parseFloat(price);
    const qty = parseInt(quantity || 1);
    const itemsTotal = unitPrice * qty;
    const shipping = store.defaultShippingPrice;
    const grandTotal = itemsTotal + shipping;
    
    store.orders.unshift({ 
        trackingId, 
        productName, 
        itemPrice: itemsTotal, 
        shippingPrice: shipping, 
        price: grandTotal, 
        firstName, 
        lastName, 
        phone, 
        state, 
        quantity: qty, 
        color, 
        size 
    });
    saveDB();

    if (store.telegramChatId) {
        const msg = `🛒 *طلب جديد في متجرك!*\\n- التتبع: #${trackingId}\\n- الزبون: ${firstName} ${lastName}\\n- الهاتف: ${phone}\\n- الولاية: ${state}\\n- المنتج: ${productName}\\n- الكمية: ${qty}\\n- سعر المنتجات: ${itemsTotal} دج\\n- سعر التوصيل: ${shipping} دج\\n- *المجموع الإجمالي: ${grandTotal} دج*\\n- اللون: ${color || 'غير محدد'} | المقاس: ${size || 'غير محدد'}`;
        await sendTelegramNotification(store.telegramChatId, msg);
    }

    const wa = encodeURIComponent(`السلام عليكم، طلب جديد:%0A- التتبع: #${trackingId}%0A- الاسم: ${firstName} ${lastName}%0A- الهاتف: ${phone}%0A- الولاية: ${state}%0A- المنتج: ${productName}%0A- الكمية: ${qty}%0A- سعر المنتجات: ${itemsTotal} دج%0A- سعر التوصيل: ${shipping} دج%0A- المجموع الإجمالي: ${grandTotal} دج%0A- اللون: ${color || 'غير محدد'}%0A- المقاس: ${size || 'غير محدد'}`);
    
    const html = `
        <style>
            * { box-sizing: border-box; font-family: Tahoma, Arial, sans-serif; }
            body { margin: 0; padding: 0; background: #f3f4f6; color: #111827; }
        </style>
        <div style="padding:15px; max-width:450px; margin:40px auto; width:100%;">
            <div style="background:#fff; padding:25px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.08); text-align:center;">
                <h2 style="color:${store.storeColor || '#1b2a4a'}; margin-top:0;">تم إرسال الطلب بنجاح! 🎉</h2>
                <p style="color:#4b5563; font-size:13px; margin-bottom:18px;">رقم التتبع الخاص بك: <b>#${trackingId}</b><br>المجموع الإجمالي (مع التوصيل): <b>${grandTotal} دج</b></p>
                <a href="https://wa.me/${store.whatsapp}?text=${wa}" style="display:block; background:#25d366; color:#fff; padding:13px; border-radius:8px; text-decoration:none; font-weight:bold; font-size:15px;">تأكيد الطلب عبر واتساب التاجر 📱</a>
            </div>
        </div>
        <script>setTimeout(()=>{window.location.href="https://wa.me/${store.whatsapp}?text=${wa}";},2000);</script>
    `;
    res.send(html);
});

app.get('/store/:slug', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (!store) return res.status(404).send('المتجر غير موجود');
    const themeColor = store.storeColor || '#1b2a4a';
    if (store.defaultShippingPrice === undefined) store.defaultShippingPrice = 500;
    
    let storeLogoHTML = `<div style="background:#fff; border-radius:50%; width:40px; height:40px; display:flex; align-items:center; justify-content:center; color:${themeColor}; font-weight:bold; font-size:10px; box-shadow:0 2px 5px rgba(0,0,0,0.15);">Logo</div>`;
    if (store.logoUrl && store.logoUrl !== "https://i.ibb.co/6P82W8h/default-avatar.png") {
        storeLogoHTML = `<img src="${store.logoUrl}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid #fff;">`;
    }

    res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>${store.storeName}</title>
            <style>
                * { box-sizing: border-box; font-family: Tahoma, Arial, sans-serif; }
                body { margin: 0; padding: 0; background: #fdfbf7; color: #111827; width: 100%; overflow-x: hidden; }
                .store-header { background: ${themeColor}; color: #fff; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 5px rgba(0,0,0,0.1); width: 100%; }
                .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 12px; }
                
                .product-card { background: #fff; border-radius: 14px; overflow: hidden; margin-bottom: 18px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
                .product-images-grid { display: flex; gap: 8px; padding: 12px; overflow-x: auto; background: #faf9f6; }
                .product-thumb { width: 90px; height: 90px; object-fit: cover; border-radius: 8px; cursor: pointer; border: 1.5px solid #d4b996; transition: 0.2s; flex-shrink: 0; }
                .product-thumb:hover { transform: scale(1.03); }
                .main-img-container { width: 100%; height: 280px; overflow: hidden; background: #000; position: relative; }
                .main-product-img { width: 100%; height: 100%; object-fit: cover; cursor: pointer; }

                .product-info { padding: 15px; text-align: right; }
                .product-title { font-size: 19px; font-weight: bold; margin: 0 0 5px 0; color: #1b2a4a; }
                .product-price { font-size: 18px; font-weight: bold; color: ${themeColor}; margin-bottom: 10px; }
                .product-desc { font-size: 13px; color: #4b5563; line-height: 1.6; margin-bottom: 12px; }
                .product-meta { font-size: 12px; color: #6b7280; margin-bottom: 15px; }
                
                .order-btn { display: block; width: 100%; background: ${themeColor}; color: #fff; border: none; padding: 13px; border-radius: 8px; font-weight: bold; font-size: 15px; cursor: pointer; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
                .order-btn:hover { opacity: 0.9; }

                .lightbox-modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); justify-content: center; align-items: center; z-index: 300; padding: 15px; }
                .lightbox-img { max-width: 100%; max-height: 85vh; border-radius: 8px; object-fit: contain; }

                .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); justify-content: center; align-items: center; z-index: 200; padding: 12px; }
                .modal-content { background: #fff; padding: 18px; border-radius: 12px; width: 100%; max-width: 400px; max-height: 90vh; overflow-y: auto; text-align: right; }
                label { display: block; font-size: 12px; font-weight: bold; margin-bottom: 4px; color: #374151; }
                input, select { width: 100%; padding: 10px; margin-bottom: 10px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; }
                
                .price-summary { background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; margin-bottom: 12px; font-size: 13px; }
                .price-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
                .price-total { display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; color: ${themeColor}; border-top: 1px dashed #d1d5db; padding-top: 6px; margin-top: 4px; }
            </style>
        </head>
        <body>
            <header class="store-header">
                <a href="/store/${store.storeSlug}/login" style="display:flex; align-items:center; gap:10px; text-decoration:none; color:#fff;" title="تسجيل دخول التاجر">
                    ${storeLogoHTML}
                    <h1 style="font-size:18px; margin:0;">🛒 ${store.storeName}</h1>
                </a>
            </header>
            
            <div class="container">
                ${store.products.length === 0 ? '<div style="background:#fff; padding:30px; border-radius:12px; text-align:center; color:#6b7280; font-size:14px;">لا توجد منتجات معروضة حالياً في هذا المتجر.</div>' : ''}
                ${store.products.map((p, idx) => {
                    let imgs = p.images || [p.image || "https://i.ibb.co/6P82W8h/default-avatar.png"];
                    return `
                    <div class="product-card">
                        <div class="main-img-container">
                            <img src="${imgs[0]}" id="mainImg_${idx}" class="main-product-img" onclick="openLightbox(this.src)">
                        </div>
                        
                        ${imgs.length > 1 ? `
                        <div class="product-images-grid">
                            ${imgs.map(img => `<img src="${img}" class="product-thumb" onclick="document.getElementById('mainImg_${idx}').src='${img}'">`).join('')}
                        </div>` : ''}

                        <div class="product-info">
                            <h3 class="product-title">${p.name}</h3>
                            <div class="product-price">${p.price} دج</div>
                            <div class="product-desc">${p.desc || 'لا يوجد وصف مضاف لهذا المنتج.'}</div>
                            <div class="product-meta">${p.colors ? 'الألوان: ' + p.colors : ''} ${p.sizes ? ' | المقاسات: ' + p.sizes : ''}</div>
                            
                            <button onclick="openModal('${p.name}', '${p.price}', '${p.colors || ''}', '${p.sizes || ''}')" class="order-btn">اطلب الآن 🛍️</button>
                        </div>
                    </div>`;
                }).join('')}
            </div>

            <div id="lightbox" class="lightbox-modal" onclick="this.style.display='none'">
                <img id="lightboxImg" class="lightbox-img">
            </div>

            <div id="m" class="modal">
                <div class="modal-content">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <h3 style="font-size:16px; margin:0; color:${themeColor};">إتمام الطلب</h3>
                        <button onclick="document.getElementById('m').style.display='none'" style="background:#ef4444; color:#fff; border:none; padding:4px 8px; cursor:pointer; border-radius:6px; font-size:11px; font-weight:bold;">إغلاق ✕</button>
                    </div>
                    <form action="/store/${store.storeSlug}/checkout" method="POST">
                        <input type="hidden" name="productName" id="pn">
                        <input type="hidden" name="price" id="pp">
                        <label>الاسم:</label><input type="text" name="firstName" required>
                        <label>اللقب:</label><input type="text" name="lastName" required>
                        <label>رقم الهاتف:</label><input type="tel" name="phone" required>
                        <label>الولاية:</label>
                        <select name="state" required>
                            <option value="">اختر الولاية</option>
                            ${states.map(st => `<option value="${st}">${st}</option>`).join('')}
                        </select>
                        
                        <label>الكمية:</label>
                        <input type="number" name="quantity" id="qtyInput" value="1" min="1" required oninput="calculateTotal()">
                        
                        <div id="colorContainer" style="display:none;">
                            <label>اختر اللون:</label>
                            <select name="color" id="cs"></select>
                        </div>
                        <div id="sizeContainer" style="display:none;">
                            <label>اختر المقاس:</label>
                            <select name="size" id="ss"></select>
                        </div>

                        <div class="price-summary">
                            <div class="price-row"><span>سعر المنتجات:</span> <span id="itemsPriceText">0 دج</span></div>
                            <div class="price-row"><span>سعر التوصيل:</span> <span>${store.defaultShippingPrice} دج</span></div>
                            <div class="price-total"><span>المجموع الإجمالي:</span> <span id="grandTotalText">0 دج</span></div>
                        </div>

                        <button type="submit" style="width:100%; background:#25d366; color:#fff; padding:12px; border:none; border-radius:8px; font-weight:bold; margin-top:6px; cursor:pointer; font-size:14px;">إرسال الطلب عبر واتساب 🚀</button>
                    </form>
                </div>
            </div>

            <script>
                let currentUnitPrice = 0;
                const shippingCost = ${store.defaultShippingPrice};

                function openLightbox(src){
                    document.getElementById('lightboxImg').src = src;
                    document.getElementById('lightbox').style.display = 'flex';
                }

                function openModal(n,p,cols,szs){
                    document.getElementById('pn').value=n;
                    document.getElementById('pp').value=p;
                    currentUnitPrice = parseFloat(p);
                    document.getElementById('qtyInput').value = 1;
                    calculateTotal();
                    
                    let cBox = document.getElementById('colorContainer');
                    let c = document.getElementById('cs');
                    if(cols && cols.trim() !== ''){
                        c.innerHTML='';
                        cols.split(/[,،]/).forEach(x=>{ 
                            let tc = x.trim();
                            if(tc){ let o=document.createElement('option'); o.value=tc; o.innerHTML=tc; c.appendChild(o); }
                        });
                        cBox.style.display = 'block';
                    } else {
                        cBox.style.display = 'none';
                        c.innerHTML='<option value="">مفترض</option>';
                    }

                    let sBox = document.getElementById('sizeContainer');
                    let s = document.getElementById('ss');
                    if(szs && szs.trim() !== ''){
                        s.innerHTML='';
                        szs.split(/[,،]/).forEach(x=>{ 
                            let ts = x.trim();
                            if(ts){ let o=document.createElement('option'); o.value=ts; o.innerHTML=ts; s.appendChild(o); }
                        });
                        sBox.style.display = 'block';
                    } else {
                        sBox.style.display = 'none';
                        s.innerHTML='<option value="">مفترض</option>';
                    }

                    document.getElementById('m').style.display='flex';
                }

                function calculateTest(){
                    // دالة حسابية مساعدة لتجنب أي أخطاء في الـ DOM
                }

                function calculateTotal(){
                    let qty = parseInt(document.getElementById('qtyInput').value) || 1;
                    let itemsTotal = currentUnitPrice * qty;
                    let grandTotal = itemsTotal + shippingCost;
                    
                    document.getElementById('itemsPriceText').innerText = itemsTotal + ' دج';
                    document.getElementById('grandTotalText').innerText = grandTotal + ' دج';
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server running on port ${PORT}`); 
});

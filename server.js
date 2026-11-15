const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

const DB_FILE = path.join(__dirname, 'database.json');

let db = {
    stores: [],
    siteSettings: {
        logoUrl: "https://i.ibb.co/6P82W8h/default-avatar.png",
        whatsapp: "213700000000",
        telegramBotToken: "",
        announcement: "📢 مكان مخصص للإعلانات والعروض الخاصة بك هنا"
    },
    activeCodes: [
        { code: "CS-9X4F-7B2K", createdAt: "2026-11-15 10:00" },
        { code: "CS-3M8R-9P1W", createdAt: "2026-11-15 10:05" },
        { code: "CS-5V2X-4H8N", createdAt: "2026-11-15 10:10" }
    ],
    usedCodes: []
};

if (fs.existsSync(DB_FILE)) {
    try {
        db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {}
}

function saveDB() {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
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
    { name: "أخضر زمردي", code: "#008060" },
    { name: "أزرق ملكي", code: "#2563eb" },
    { name: "أحمر داكن", code: "#dc2626" },
    { name: "أسود أنيق", code: "#1f2937" },
    { name: "بنفسجي", code: "#7c3aed" },
    { name: "برتقالي", code: "#ea580c" },
    { name: "وردي فوشيا", code: "#db2777" },
    { name: "تركواز بحري", code: "#0d9488" },
    { name: "رمادي معدني", code: "#4b5563" },
    { name: "ذهبي فخم", code: "#d97706" },
    { name: "أزرق سماوي", code: "#0284c7" },
    { name: "أخضر زيتوني", code: "#4d7c0f" }
];

function renderLayout(title, content, extraHead = '') {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${title}</title>
        <style>
            * { box-sizing: border-box; font-family: Tahoma, Arial, sans-serif; }
            body { margin: 0; padding: 0; background: #f3f4f6; color: #111827; width: 100%; overflow-x: hidden; }
            .navbar { background: #008060; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; color: #fff; width: 100%; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .brand { display: flex; align-items: center; gap: 8px; cursor: pointer; text-decoration: none; color: #fff; }
            .brand h1 { margin: 0; font-size: 18px; }
            .logo-circle { background: #fff; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; color: #008060; font-weight: bold; font-size: 9px; }
            .nav-actions { display: flex; gap: 6px; align-items: center; }
            .lang-btn { background: rgba(255,255,255,0.2); color: #fff; border: none; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; }
            .hero-section { background: linear-gradient(135deg, #008060 0%, #046c51 100%); color: #fff; padding: 30px 15px; text-align: center; width: 100%; }
            .card-box { background: #fff; margin: -20px 12px 15px 12px; padding: 20px; border-radius: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); color: #111827; text-align: right; }
            .announcement { border: 2px dashed #f59e0b; background: #fffbeb; padding: 10px; border-radius: 8px; margin-bottom: 15px; color: #b45309; font-size: 13px; font-weight: bold; text-align: center; }
            .btn { display: block; width: 100%; padding: 13px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; border: none; cursor: pointer; text-align: center; }
            .btn-green { background: #008060; color: #fff; }
            .btn-blue { background: #2563eb; color: #fff; }
            .btn-wa { background: #25d366; color: #fff; }
            label { display: block; font-size: 13px; font-weight: bold; margin-bottom: 5px; color: #374151; }
            input, select { width: 100%; padding: 11px; margin-bottom: 12px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #fff; }
            input:focus, select:focus { outline: none; border-color: #008060; }
        </style>
        ${extraHead}
    </head>
    <body>
        <div class="navbar">
            <!-- النقر على اسم المنصة مخفي لدخول المدير العام -->
            <a href="/admin-login" class="brand" title="لوحة المدير العام">
                <div class="logo-circle">Logo</div>
                <h1 id="brand-title">ClickShop</h1>
            </a>
            <div class="nav-actions">
                <button class="lang-btn" onclick="setLang('ar')">عربي</button>
                <button class="lang-btn" onclick="setLang('fr')">FR</button>
                <button class="lang-btn" onclick="setLang('en')">EN</button>
            </div>
        </div>
        ${content}
        <script>
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
                    desc.innerText="Nous travaillons 24/7 pour assurer la stabilité de votre boutique, recevoir les commandes des clients instantanément via Telegram et WhatsApp, avec un contrôle total des couleurs et de l'identité !";
                    b1.innerText="🚀 Créer ma nouvelle boutique";
                    b2.innerText="⚙️ Connexion Marchand";
                }else if(l==='en'){
                    t1.innerText="Create your pro store in seconds";
                    t2.innerText="How does ClickShop work?";
                    desc.innerText="We work 24/7 to ensure your store stability, receive customer orders instantly via Telegram and WhatsApp, with full control over branding and colors!";
                    b1.innerText="🚀 Create New Store";
                    b2.innerText="⚙️ Merchant Login";
                }else{
                    t1.innerText="أطلق متجرك الإلكتروني الاحترافي في دقائق";
                    t2.innerText="كيف تعمل منصة ClickShop؟ ⚙️";
                    desc.innerText="نحن نعمل على مدار الساعة طوال أيام الأسبوع (24/7) لضمان استقرار متجرك، استقبال طلبات الزبائن وتنبيهك فورياً عبر التيليغرام والواتساب، مع تحكم كامل بالهوية والألوان!";
                    b1.innerText="🚀 ابدأ إنشاء متجرك الجديد";
                    b2.innerText="⚙️ تسجيل دخول التجار";
                }
            }
        </script>
    </body>
    </html>`;
}

app.get('/', (req, res) => {
    const html = `
        <div class="hero-section">
            <h1 id="t1" style="font-size: 22px; margin: 0 0 10px 0; line-height: 1.4;">أطلق متجرك الإلكتروني الاحترافي في دقائق</h1>
            <p style="font-size: 13px; margin: 0 auto; max-width: 450px; opacity: 0.9; line-height: 1.6;">منصة ClickShop تمنحك كل الأدوات اللازمة لإدارة منتجاتك، استقبال طلباتك، وتوسيع تجارتك بكل سهولة واحترافية.</p>
            <div style="margin-top: 15px;">
                <a href="/register-page" class="btn" style="background:#fff; color:#008060; display:inline-block; width:auto; padding:9px 20px; font-size:14px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">ابدأ متجرك الآن 🚀</a>
            </div>
        </div>

        <div class="card-box">
            <div class="announcement">${db.siteSettings.announcement}</div>
            
            <h3 id="t2" style="color:#008060; font-size:16px; margin-top:0; text-align:center;">كيف تعمل منصة ClickShop؟ ⚙️</h3>
            <p id="desc" style="font-size:13px; color:#4b5563; line-height:1.6; text-align:center; margin-bottom:20px;">
                نحن نعمل على مدار الساعة طوال أيام الأسبوع (<b>24/7</b>) لضمان استقرار متجرك، استقبال طلبات الزبائن وتنبيهك فورياً عبر التيليغرام والواتساب، مع تحكم كامل بالهوية والألوان!
            </p>

            <div style="display:flex; flex-direction:column; gap:12px;">
                <a href="/register-page" id="b1" class="btn btn-green">🚀 ابدأ إنشاء متجرك الجديد</a>
                <a href="/login-store" id="b2" class="btn btn-blue">⚙️ تسجيل دخول التجار</a>
            </div>

            <div style="display:flex; justify-content:center; gap:15px; margin-top:25px; padding-top:18px; border-top:1px solid #f3f4f6;">
                <a href="https://t.me/" target="_blank" style="background:#0088cc; color:#fff; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none;" title="Telegram">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.89.03-.25.38-.51 1.06-.78 4.15-1.81 6.91-3.01 8.28-3.61 3.94-1.72 4.76-2.02 5.29-2.03.12 0 .39.03.56.17.15.12.19.28.21.4-.02.08-.02.2-.04.35z"/></svg>
                </a>
                <a href="https://facebook.com" target="_blank" style="background:#1877f2; color:#fff; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none;" title="Facebook">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.15 6.5 13 6.5c.88 0 1.76.08 2.6.24v2.85h-1.47c-.99 0-1.3.49-1.3 1.25V12h3.02l-.48 3h-2.54v6.8c4.56-.93 8-4.96 8-9.8z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" style="background:radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%); color:#fff; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none;" title="Instagram">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="https://whatsapp.com" target="_blank" style="background:#25d366; color:#fff; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none;" title="WhatsApp">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                </a>
            </div>
        </div>
    `;
    res.send(renderLayout('ClickShop - منصة المتاجر الإلكترونية', html));
});

app.get('/admin-login', (req, res) => {
    const html = `
        <div style="padding:15px; max-width:450px; margin:0 auto; width:100%;">
            <div class="card-box" style="margin:20px 0; text-align:center;">
                <h2 style="color:#008060; margin-top:0; font-size:18px;">لوحة تحكم المدير العام 🛠️</h2>
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
                <h2 style="color:#008060; text-align:center; margin-top:0; font-size:18px;">لوحة تحكم المدير العام 🛠️</h2>
                
                <label>تحديث نص الإعلان في الواجهة:</label>
                <form action="/admin/update-announcement" method="POST" style="margin-bottom:15px;">
                    <input type="text" name="announcement" value="${db.siteSettings.announcement}" required>
                    <button type="submit" class="btn" style="background:#f59e0b; color:#fff; padding:10px;">تحديث الإعلان 📢</button>
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
                ${db.stores.map(s => `<div style="background:#f9fafb; padding:8px; border:1px solid #e5e7eb; border-radius:6px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px;"><b>${s.storeName}</b></span><a href="/store/${s.storeSlug}" target="_blank" style="background:#008060; color:#fff; padding:4px 10px; text-decoration:none; border-radius:4px; font-size:11px;">زيارة المتجر</a></div>`).join('')}
                
                <a href="/" style="display:block; text-align:center; color:#6b7280; text-decoration:none; margin-top:15px; font-size:13px;">← تسجيل الخروج للرئيسية</a>
            </div>
        </div>
    `;
    res.send(renderLayout('لوحة تحكم المدير', html));
});

app.post('/admin/update-announcement', (req, res) => {
    db.siteSettings.announcement = req.body.announcement;
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
                <h2 style="color:#008060; text-align:center; margin-top:0; font-size:18px;">بيانات متجرك الجديد</h2>
                
                <div style="border: 2px solid #008060; background:#f0fdf4; padding:10px; border-radius:8px; margin-bottom:15px; text-align:center; color:#065f46; font-weight:bold; font-size:13px;">
                    الوقت المتبقي لإدخال كود التفعيل:<br>
                    <span id="timer" style="color:#dc2626; font-size:20px; display:inline-block; margin-top:3px;">01:15</span>
                </div>

                <form action="/register" method="POST">
                    <label>كود التفعيل:</label>
                    <input type="text" name="activationCode" placeholder="مثال: CS-9X4F-7B2K" required style="border-color:#008060;">
                    
                    <label>اسم المتجر:</label>
                    <input type="text" name="storeName" placeholder="مثال: ZASO Store" required>
                    
                    <label>رابط المتجر بالإنجليزية (Slug):</label>
                    <input type="text" name="storeSlug" placeholder="zaso-store" required>
                    
                    <label>مجال التجارة:</label>
                    <select name="storeCategory" required>
                        <option value="ملابس وأزياء">ملابس وأزياء</option>
                        <option value="إلكترونيات وتكنولوجيا">إلكترونيات وتكنولوجيا</option>
                        <option value="صحة وجمال">صحة وجمال</option>
                        <option value="أجهزة منزلية">أجهزة منزلية</option>
                    </select>

                    <label>لون واجهة المتجر:</label>
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
    db.stores.push({ activationCode: activationCode.trim(), storeName, storeSlug: storeSlug.trim(), storeCategory, storeColor: storeColor || '#008060', ownerName, whatsapp: whatsapp || "213700000000", telegramChatId: telegramChatId || "", logoUrl: "https://i.ibb.co/6P82W8h/default-avatar.png", password, products: [], orders: [], expiryDate: expiry.toISOString() });
    db.activeCodes.splice(idx, 1);
    db.usedCodes.push(activationCode.trim());
    saveDB();
    
    const html = `
        <div style="padding:15px; max-width:450px; margin:0 auto; width:100%;">
            <div class="card-box" style="text-align:center; margin:20px 0;">
                <h2 style="color:#008060; margin-top:0; font-size:18px;">مبروك ${ownerName}! تم إنشاء المتجر 🚀</h2>
                <div style="display:flex; flex-direction:column; gap:10px; margin-top:18px;">
                    <a href="/store/${storeSlug.trim()}" class="btn btn-blue">فتح المتجر 🛒</a>
                    <a href="/store/${storeSlug.trim()}/login" class="btn btn-green">لوحة التحكم ⚙️</a>
                </div>
            </div>
        </div>
    `;
    res.send(renderLayout('تم إنشاء المتجر', html));
});

app.get('/login-store', (req, res) => {
    const html = `
        <div style="padding:15px; max-width:450px; margin:0 auto; width:100%;">
            <div class="card-box" style="margin:20px 0;">
                <h2 style="color:#008060; text-align:center; margin-top:0; font-size:18px;">اختر متجرك للدخول ⚙️</h2>
                ${db.stores.length === 0 ? '<p style="text-align:center; color:#6b7280; font-size:13px;">لا توجد متاجر مسجلة بعد.</p>' : ''}
                ${db.stores.map(s => `<div style="background:#f9fafb; padding:10px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:14px;"><b>${s.storeName}</b></span><a href="/store/${s.storeSlug}/login" style="background:#2563eb; color:#fff; padding:6px 12px; text-decoration:none; border-radius:6px; font-size:12px; font-weight:bold;">دخول</a></div>`).join('')}
                <a href="/" style="display:block; text-align:center; color:#6b7280; text-decoration:none; margin-top:15px; font-size:13px;">← عودة للرئيسية</a>
            </div>
        </div>
    `;
    res.send(renderLayout('دخول التجار', html));
});

app.get('/store/:slug/login', (req, res) => {
    const html = `
        <div style="padding:15px; max-width:400px; margin:0 auto; width:100%;">
            <div class="card-box" style="text-align:center; margin:20px 0;">
                <h2 style="color:#008060; margin-top:0; font-size:18px;">كلمة مرور لوحة التحكم</h2>
                <form action="/store/${req.params.slug}/auth" method="POST">
                    <input type="password" name="password" placeholder="أدخل كلمة المرور" required>
                    <button type="submit" class="btn btn-green">دخول</button>
                </form>
                <a href="/login-store" style="display:block; margin-top:15px; color:#6b7280; text-decoration:none; font-size:13px;">← اختيار متجر آخر</a>
            </div>
        </div>
    `;
    res.send(renderLayout('تسجيل الدخول', html));
});

app.post('/store/:slug/auth', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (store && store.password === req.body.password) {
        res.redirect(`/store/${req.params.slug}/dashboard`);
    } else {
        res.send(`<script>alert('كلمة المرور خطأ!'); window.location.href='/store/${req.params.slug}/login';</script>`);
    }
});

app.get('/store/:slug/dashboard', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (!store) return res.send('المتجر غير موجود');
    const html = `
        <div style="padding:12px; max-width:600px; margin:0 auto; width:100%;">
            <div class="card-box" style="margin:10px 0;">
                <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                    <a href="/store/${store.storeSlug}" target="_blank" style="background:#2563eb; color:#fff; padding:6px 10px; text-decoration:none; border-radius:6px; font-size:12px; font-weight:bold;">معاينة المتجر 🛒</a>
                    <a href="/" style="background:#4b5563; color:#fff; padding:6px 10px; text-decoration:none; border-radius:6px; font-size:12px; font-weight:bold;">الرئيسية 🏠</a>
                </div>
                <h2 style="color:${store.storeColor || '#008060'}; text-align:center; margin-top:0; font-size:18px;">لوحة تحكم: ${store.storeName}</h2>
                <hr style="border:0; border-top:1px solid #eee; margin:12px 0;">
                
                <h3 style="font-size:15px; margin-top:0;">إضافة منتج (${store.products.length}/10)</h3>
                ${store.products.length >= 10 ? '<p style="color:red; font-size:12px;">بلغت الحد الأقصى للمنتجات.</p>' : `
                <form action="/store/${store.storeSlug}/add-product" method="POST">
                    <label>اسم المنتج:</label>
                    <input type="text" name="productName" required>
                    <label>السعر (دج):</label>
                    <input type="text" name="productPrice" required>
                    <label>رابط صورة المنتج:</label>
                    <input type="text" name="productImage" required>
                    <label>الألوان المتاحة (اختياري، افصل بفاصلة):</label>
                    <input type="text" name="colors" placeholder="أسود، أبيض">
                    <label>المقاسات المتاحة (اختياري، افصل بفاصلة):</label>
                    <input type="text" name="sizes" placeholder="S, M, L">
                    <button type="submit" class="btn" style="background:${store.storeColor || '#008060'}; color:#fff;">إضافة المنتج ➕</button>
                </form>`}

                <h3 style="margin-top:20px; font-size:15px;">المنتجات الحالية:</h3>
                ${store.products.length === 0 ? '<p style="color:#6b7280; font-size:12px;">لا توجد منتجات مضافة بعد.</p>' : ''}
                ${store.products.map((p, i) => `
                    <div style="background:#f9fafb; padding:10px; border:1px solid #e5e7eb; border-radius:8px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-size:13px;"><b>${p.name}</b> - ${p.price} دج</span>
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

app.post('/store/:slug/add-product', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (store && store.products.length < 10) {
        store.products.push({ 
            name: req.body.productName, 
            price: req.body.productPrice, 
            image: req.body.productImage, 
            colors: req.body.colors || "", 
            sizes: req.body.sizes || "" 
        });
        saveDB();
    }
    res.redirect(`/store/${req.params.slug}/dashboard`);
});

app.post('/store/:slug/delete-product', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (store && req.body.productIndex !== undefined) {
        store.products.splice(parseInt(req.body.productIndex), 1);
        saveDB();
    }
    res.redirect(`/store/${req.params.slug}/dashboard`);
});

app.post('/store/:slug/checkout', async (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (!store) return res.send('المتجر غير موجود');
    const { productName, price, firstName, lastName, phone, state, quantity, color, size } = req.body;
    const trackingId = 'TRK-' + Math.floor(100000 + Math.random() * 900000);
    const totalPrice = parseFloat(price) * parseInt(quantity || 1);
    
    store.orders.push({ trackingId, productName, price: totalPrice, firstName, lastName, phone, state, quantity, color, size });
    saveDB();

    if (store.telegramChatId) {
        const msg = `🛒 *طلب جديد في متجرك!*\\n- التتبع: #${trackingId}\\n- الزبون: ${firstName} ${lastName}\\n- الهاتف: ${phone}\\n- الولاية: ${state}\\n- المنتج: ${productName}\\n- الكمية: ${quantity}\\n- السعر الإجمالي: ${totalPrice} دج\\n- اللون: ${color || 'غير محدد'} | المقاس: ${size || 'غير محدد'}`;
        await sendTelegramNotification(store.telegramChatId, msg);
    }

    const wa = `السلام عليكم، طلب جديد:%0A- التتبع: #${trackingId}%0A- الاسم: ${firstName} ${lastName}%0A- الهاتف: ${phone}%0A- الولاية: ${state}%0A- المنتج: ${productName}%0A- الكمية: ${quantity}%0A- السعر الإجمالي: ${totalPrice} دج%0A- اللون: ${color || 'غير محدد'}%0A- المقاس: ${size || 'غير محدد'}`;
    
    const html = `
        <style>
            * { box-sizing: border-box; font-family: Tahoma, Arial, sans-serif; }
            body { margin: 0; padding: 0; background: #f3f4f6; color: #111827; }
        </style>
        <div style="padding:15px; max-width:450px; margin:40px auto; width:100%;">
            <div style="background:#fff; padding:25px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.08); text-align:center;">
                <h2 style="color:${store.storeColor || '#008060'}; margin-top:0;">تم إرسال الطلب بنجاح! 🎉</h2>
                <p style="color:#4b5563; font-size:13px; margin-bottom:18px;">رقم التتبع الخاص بك: <b>#${trackingId}</b></p>
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
    const themeColor = store.storeColor || '#008060';
    
    res.send(`
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <title>${store.storeName}</title>
            <style>
                * { box-sizing: border-box; font-family: Tahoma, Arial, sans-serif; }
                body { margin: 0; padding: 0; background: #f3f4f6; color: #111827; width: 100%; overflow-x: hidden; }
                .store-header { background: ${themeColor}; color: #fff; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 5px rgba(0,0,0,0.1); width: 100%; }
                .container { width: 100%; max-width: 600px; margin: 0 auto; padding: 12px; }
                .product-card { background: #fff; padding: 12px; border-radius: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 6px rgba(0,0,0,0.04); }
                .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); justify-content: center; align-items: center; z-index: 200; padding: 12px; }
                .modal-content { background: #fff; padding: 18px; border-radius: 12px; width: 100%; max-width: 400px; max-height: 90vh; overflow-y: auto; text-align: right; }
                label { display: block; font-size: 12px; font-weight: bold; margin-bottom: 4px; color: #374151; }
                input, select { width: 100%; padding: 10px; margin-bottom: 10px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; }
            </style>
        </head>
        <body>
            <header class="store-header">
                <!-- زر مخفي لدخول لوحة تحكم التاجر عند النقر على شعار متجره -->
                <a href="/store/${store.storeSlug}/login" style="display:flex; align-items:center; gap:8px; text-decoration:none; color:#fff;" title="دخول لوحة تحكم التاجر">
                    <div style="background:#fff; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; color:${themeColor}; font-weight:bold; font-size:9px;">Logo</div>
                    <h1 style="font-size:17px; margin:0;">🛒 ${store.storeName}</h1>
                </a>
                <a href="/store/${store.storeSlug}/login" style="background:rgba(255,255,255,0.2); color:#fff; padding:6px 10px; text-decoration:none; border-radius:6px; font-size:11px; font-weight:bold;">لوحة التحكم ⚙️</a>
            </header>
            
            <div class="container">
                ${store.products.length === 0 ? '<div style="background:#fff; padding:25px; border-radius:12px; text-align:center; color:#6b7280; font-size:13px;">لا توجد منتجات معروضة حالياً.</div>' : ''}
                ${store.products.map(p => `
                    <div class="product-card">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <img src="${p.image}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;">
                            <div>
                                <h4 style="margin:0 0 3px 0; font-size:14px;">${p.name}</h4>
                                <span style="color:${themeColor}; font-weight:bold; font-size:14px;">${p.price} دج</span>
                                <div style="font-size:11px; color:#6b7280; margin-top:2px;">${p.colors ? 'ألوان: ' + p.colors : ''} ${p.sizes ? ' | مقاسات: ' + p.sizes : ''}</div>
                            </div>
                        </div>
                        <button onclick="openModal('${p.name}', '${p.price}', '${p.colors || ''}', '${p.sizes || ''}')" style="background:${themeColor}; color:#fff; border:none; padding:9px 12px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:12px; white-space:nowrap;">اطلب الآن 🛍️</button>
                    </div>
                `).join('')}
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
                        <label>الكمية:</label><input type="number" name="quantity" value="1" min="1" required>
                        
                        <div id="colorContainer" style="display:none;">
                            <label>اختر اللون:</label>
                            <select name="color" id="cs"></select>
                        </div>
                        <div id="sizeContainer" style="display:none;">
                            <label>اختر المقاس:</label>
                            <select name="size" id="ss"></select>
                        </div>

                        <button type="submit" style="width:100%; background:#25d366; color:#fff; padding:12px; border:none; border-radius:8px; font-weight:bold; margin-top:6px; cursor:pointer; font-size:14px;">إرسال الطلب عبر واتساب 🚀</button>
                    </form>
                </div>
            </div>

            <script>
                function openModal(n,p,cols,szs){
                    document.getElementById('pn').value=n;
                    document.getElementById('pp').value=p;
                    
                    let cBox = document.getElementById('colorContainer');
                    let c = document.getElementById('cs');
                    if(cols && cols.trim() !== ''){
                        c.innerHTML='';
                        cols.split(',').forEach(x=>{ let o=document.createElement('option'); o.value=x.trim(); o.innerHTML=x.trim(); c.appendChild(o); });
                        cBox.style.display = 'block';
                    } else {
                        cBox.style.display = 'none';
                        c.innerHTML='<option value="">مفترض</option>';
                    }

                    let sBox = document.getElementById('sizeContainer');
                    let s = document.getElementById('ss');
                    if(szs && szs.trim() !== ''){
                        s.innerHTML='';
                        szs.split(',').forEach(x=>{ let o=document.createElement('option'); o.value=x.trim(); o.innerHTML=x.trim(); s.appendChild(o); });
                        sBox.style.display = 'block';
                    } else {
                        sBox.style.display = 'none';
                        s.innerHTML='<option value="">مفترض</option>';
                    }

                    document.getElementById('m').style.display='flex';
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });

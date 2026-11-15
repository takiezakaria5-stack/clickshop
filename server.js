const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
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
        instagram: "https://instagram.com",
        facebook: "https://facebook.com",
        telegram: "https://t.me",
        telegramBotToken: ""
    },
    activeCodes: [
        "9X4F7B2K", "3M8R9P1W", "5V2X4H8N", "1K9L6D3Z", "8T4Y2F5X"
    ],
    usedCodes: []
};

if (fs.existsSync(DB_FILE)) {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        db = JSON.parse(data);
    } catch (e) {
        console.log("Error loading DB, using default.", e);
    }
}

function saveDB() {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// ملفات PWA
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        "name": "ClickShop - منصة المتاجر الجزائرية",
        "short_name": "ClickShop",
        "start_url": "/",
        "display": "standalone",
        "background_color": "#f3f4f6",
        "theme_color": "#008060",
        "icons": [
            {"src": db.siteSettings.logoUrl, "sizes": "192x192", "type": "image/png"},
            {"src": db.siteSettings.logoUrl, "sizes": "512x512", "type": "image/png"}
        ]
    }));
});

app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`
        self.addEventListener('install', (e) => {});
        self.addEventListener('fetch', (e) => {
            e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
        });
    `);
});

function sendTelegramNotification(chatId, message) {
    const token = db.siteSettings.telegramBotToken;
    if (!token || !chatId) return;
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}&parse_mode=Markdown`;
    https.get(url, (res) => {}).on('error', (e) => {});
}

const algerianStates = [
    "01. أدرار", "02. الشلف", "03. الأغواط", "04. أم البواقي", "05. باتنة", "06. بجاية", "07. بسكرة", "08. بشار", "09. البليدة", "10. البويرة",
    "11. تمنراست", "12. تبسة", "13. تلمسان", "14. تيارت", "15. تيزي وزو", "16. الجزائر", "17. الجلفة", "18. جيجل", "19. سطيف", "20. سعيدة",
    "21. سكيكدة", "22. سيدي بلعباس", "23. عنابة", "24. قالمة", "25. قسنطينة", "26. المدية", "27. مستغانم", "28. المسيلة", "29. معسكر", "30. ورقلة",
    "31. وهران", "32. البيض", "33. إليزي", "34. برج بوعريريج", "35. بومرداس", "36. الطارف", "37. تندوف", "38. تسيمسيلت", "39. الوادي", "40. خنشلة",
    "41. سوق اهراس", "42. تيبازة", "43. ميلة", "44. عين الدفلى", "45. نعامة", "46. عين تيموشنت", "47. غرداية", "48. غليزان", "49. المغير", "50. المنيعة",
    "51. أولاد جلال", "52. برج باجي مختار", "53. بني عباس", "54. تيميمون", "55. تقرت", "56. جانت", "57. المغير", "58. المنيعة",
    "59. تيزي وزو", "60. برج عجيال", "61. مسعد", "62. أفلو", "63. الأبيضسيد الشيخ", "64. قصر الشلالة", "65. عين صالح", "66. عين قزام", "67. الرويسات", "68. مسيسة", "69. البرمة"
];

app.get('/', (req, res) => {
    res.send(`
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8"><title>ClickShop - منصة المتاجر الجزائرية</title>
            <link rel="manifest" href="/manifest.json">
            <style>
                body { font-family: Tahoma; background: #f3f4f6; margin: 0; padding: 40px; text-align: center; }
                .card { background: #fff; padding: 40px; max-width: 500px; margin: auto; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                h1 { color: #008060; margin-bottom: 10px; }
                p { color: #555; margin-bottom: 30px; }
                .btn { display: block; width: 100%; padding: 14px; margin: 12px 0; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; cursor: pointer; text-decoration: none; }
                .btn-register { background: #008060; color: #fff; }
                .btn-login { background: #2563eb; color: #fff; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>🛒 منصة ClickShop</h1>
                <p>أنشئ متجرك الإلكتروني الاحترافي في الجزائر وابعث طلباتك مباشرة لتليغرام وواتساب</p>
                <a href="/register-page" class="btn btn-register">إنشاء متجر جديد (كود تفعيل) 🚀</a>
                <a href="/login-store" class="btn btn-login">تسجيل دخول التاجر (لوحة التحكم) ⚙️</a>
            </div>
            <script>
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/sw.js');
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/register-page', (req, res) => {
    res.send(`
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8"><title>إنشاء متجر جديد</title>
            <link rel="manifest" href="/manifest.json">
            <style>
                body { font-family: Tahoma; background: #f3f4f6; padding: 30px; text-align: center; }
                .card { background: #fff; padding: 30px; max-width: 450px; margin: auto; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: right; }
                input, select { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; }
                .btn { background: #008060; color: white; border: none; padding: 12px; width: 100%; font-weight: bold; border-radius: 5px; cursor: pointer; margin-top: 15px; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2 style="color: #008060; text-align:center;">فتح متجر جديد</h2>
                <form action="/register" method="POST">
                    <label>كود التفعيل السري (8 خانات):</label>
                    <input type="text" name="activationCode" placeholder="مثال: X8K2M9P4" required style="font-family:monospace; text-transform:uppercase;">
                    <label>اسم المتجر:</label>
                    <input type="text" name="storeName" placeholder="مثال: متجر الأيقونة" required>
                    <label>رابط المتجر (Slug):</label>
                    <input type="text" name="storeSlug" placeholder="مثال: el-aykouna" required>
                    <label>مجال المتجر:</label>
                    <input type="text" name="storeCategory" placeholder="ملابس، أحذية..." required>
                    <label>لون واجهة المتجر:</label>
                    <select name="storeColor">
                        <option value="green">أخضر (افتراضي)</option>
                        <option value="blue">أزرق داكن</option>
                        <option value="black">أسود أنيق</option>
                        <option value="red">أحمر جريء</option>
                    </select>
                    <label>اسم المالك:</label>
                    <input type="text" name="ownerName" placeholder="اسمك الكامل" required>
                    <label>كلمة مرور لوحة التحكم:</label>
                    <input type="password" name="password" placeholder="كلمة المرور الخاصة بمتجرك" required>
                    <button type="submit" class="btn">إنشاء المتجر 🚀</button>
                </form>
                <br><a href="/" style="display:block; text-align:center; color:#555; text-decoration:none;">العودة للرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/login-store', (req, res) => {
    res.send(`
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8"><title>تسجيل دخول التاجر</title>
            <link rel="manifest" href="/manifest.json">
            <style>
                body { font-family: Tahoma; background: #f3f4f6; padding: 40px; text-align: center; }
                .card { background: #fff; padding: 30px; max-width: 450px; margin: auto; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: right; }
                button { width: 100%; padding: 10px; margin: 10px 0; border: none; border-radius: 5px; font-size: 14px; font-weight: bold; cursor: pointer; }
            </style>
        </head>
        <body>
            <div class="card">
                <h2 style="color: #008060; text-align:center;">اختر متجرك لتسجيل الدخول</h2>
                ${db.stores.length === 0 ? '<p style="text-align:center; color:#666;">لا توجد متاجر مسجلة بعد.</p>' : ''}
                ${db.stores.map(s => `
                    <div style="background:#f9fafb; padding:12px; border:1px solid #ddd; border-radius:6px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                        <span><b>${s.storeName}</b> (${s.ownerName})</span>
                        <a href="/store/${s.storeSlug}/login" style="background:#2563eb; color:#fff; padding:6px 12px; text-decoration:none; border-radius:4px; font-size:13px; font-weight:bold;">دخول ⚙️</a>
                    </div>
                `).join('')}
                <br><a href="/" style="display:block; text-align:center; color:#555; text-decoration:none;">العودة للرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

app.post('/admin/settings', (req, res) => {
    const { whatsapp, telegramBotToken, base64Logo } = req.body;
    if (base64Logo) {
        try {
            const matches = base64Logo.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const ext = matches[1] === 'jpeg' ? 'jpg' :

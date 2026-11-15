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

// الصفحة الرئيسية للمنصة (خيار إنشاء متجر أو تسجيل دخول التاجر)
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

// صفحة إنشاء المتجر
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
                    
                    <label>رابط المتجر (Slug بالإنجليزية أو أرقام):</label>
                    <input type="text" name="storeSlug" placeholder="مثال: el-aykouna" required>
                    
                    <label>مجال المتجر:</label>
                    <input type="text" name="storeCategory" placeholder="مثال: ملابس، أحذية، إلكترونيات..." required>
                    
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
                <br>
                <a href="/" style="display:block; text-align:center; color:#555; text-decoration:none;">العودة للرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

// صفحة اختيار المتجر لتسجيل الدخول للوحة التحكم
app.get('/login-store', (req, res) => {
    res.send(`
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8"><title>تسجيل دخول التاجر</title>
            <link rel="manifest" href="/manifest.json">
            <style>
                body { font-family: Tahoma; background: #f3f4f6; padding: 40px; text-align: center; }
                .card { background: #fff; padding: 30px; max-width: 450px; margin: auto; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); text-align: right; }
                select, button { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; }
                .btn { background: #008060; color: white; border: none; font-weight: bold; cursor: pointer; }
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
                <br>
                <a href="/" style="display:block; text-align:center; color:#555; text-decoration:none;">العودة للرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

app.post('/admin/settings', (req, res) => {
    const { whatsapp, instagram, facebook, telegram, telegramBotToken, base64Logo } = req.body;
    if (base64Logo) {
        try {
            const matches = base64Logo.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                const bitmap = Buffer.from(matches[2], 'base64');
                const filename = `logo-${Date.now()}.${ext}`;
                fs.writeFileSync(path.join(uploadDir, filename), bitmap);
                db.siteSettings.logoUrl = `/uploads/${filename}`;
            }
        } catch (e) {}
    }
    if (whatsapp) db.siteSettings.whatsapp = whatsapp;
    if (telegramBotToken !== undefined) db.siteSettings.telegramBotToken = telegramBotToken;
    saveDB();
    res.redirect('/admin/dashboard');
});

// مولد الأكواد السرية XXXXXXXX
app.post('/admin/generate-codes', (req, res) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let newCode = '';
    for (let i = 0; i < 8; i++) {
        newCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    db.activeCodes.push(newCode);
    saveDB();
    res.redirect('/admin/dashboard');
});

// تسجيل متجر جديد
app.post('/register', (req, res) => {
    const { activationCode, storeName, storeSlug, storeCategory, storeColor, ownerName, password } = req.body;
    const codeIndex = db.activeCodes.indexOf(activationCode);
    
    if (codeIndex === -1) {
        return res.status(400).send(`<html dir="rtl" lang="ar"><body style="font-family:Tahoma; text-align:center; padding:50px;"><h2>كود التفعيل غير صالح أو مستعمل!</h2><a href="/register-page">العودة</a></body></html>`);
    }

    const slugExists = db.stores.find(s => s.storeSlug === storeSlug);
    if (slugExists) {
        return res.status(400).send(`<html dir="rtl" lang="ar"><body style="font-family:Tahoma; text-align:center; padding:50px;"><h2>رابط المتجر محجوز مسبقاً.</h2><a href="/register-page">العودة</a></body></html>`);
    }

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6);

    db.stores.push({ 
        activationCode, 
        storeName, 
        storeSlug, 
        storeCategory, 
        storeColor: storeColor || 'green', 
        ownerName, 
        password,
        whatsapp: "213700000000",
        telegramChatId: "",
        logoUrl: "https://i.ibb.co/6P82W8h/default-avatar.png",
        products: [],
        orders: [],
        expiryDate: expiryDate.toISOString()
    });

    db.activeCodes.splice(codeIndex, 1);
    db.usedCodes.push(activationCode);
    saveDB();

    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>تم الانشاء بنجاح</title><link rel="manifest" href="/manifest.json"></head>
        <body style="font-family: Tahoma; text-align: center; padding: 50px; background: #f3f4f6;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 450px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #008060;">مبروك يا ${ownerName}! تم إنشاء المتجر بنجاح 🚀</h2>
                <p style="margin-top: 15px;">اسم المتجر: <b>${storeName}</b></p>
                <p style="color: #2563eb; font-size:14px; margin-top:5px;">الباقة: 10 منتجات (صالحة لمدة 6 أشهر)</p>
                <input type="text" value="https://clickshop-b19x.onrender.com/store/${storeSlug}" readonly style="width: 100%; padding: 10px; text-align: center; font-family: monospace; background: #f9fafb; border: 1px solid #d1d5db; border-radius: 5px; margin: 10px 0;" onclick="this.select();">
                <br>
                <a href="/store/${storeSlug}" target="_blank" style="display: inline-block; margin-top: 10px; background: #2563eb; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">فتح المتجر مباشرة 🛒</a>
                <br><br>
                <a href="/store/${storeSlug}/login" style="display: inline-block; background: #008060; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">لوحة تحكم التاجر ⚙️</a>
                <br>
                <a href="/" style="display: inline-block; margin-top: 15px; color: #4b5563; text-decoration: none;">العودة للرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'kenouni19') {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.get('/admin/dashboard', (req, res) => {
    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>لوحة تحكم المنصة</title><link rel="manifest" href="/manifest.json"></head>
        <style>
            body { font-family: Tahoma; background: #f3f4f6; padding: 20px; text-align: center; }
            .box { background: #fff; padding: 25px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-bottom: 20px; text-align: right; }
            .box h2, .box h3 { text-align: center; }
            ul { padding-right: 20px; max-height: 120px; overflow-y: auto; background: #f9fafb; padding: 10px; border-radius: 5px; border: 1px solid #e5e7eb; }
            li { margin-bottom: 5px; font-family: monospace; font-size: 14px; }
            .form-group { margin-bottom: 12px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px; }
            input { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 5px; }
            .btn { background: #008060; color: white; border: none; padding: 10px; width: 100%; font-weight: bold; border-radius: 5px; cursor: pointer; margin-top: 10px; }
            .gen-btn { background: #2563eb; color: white; border: none; padding: 12px; width: 100%; font-weight: bold; border-radius: 5px; cursor: pointer; margin-bottom: 15px; }
        </style>
        </head>
        <body>
            <div class="box">
                <h2 style="color: #008060;">لوحة تحكم مدير منصة ClickShop</h2>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                <h3 style="color: #2563eb; margin-bottom: 10px;">مولد الأكواد السرية (XXXXXXXX)</h3>
                <form action="/admin/generate-codes" method="POST">
                    <button type="submit" class="gen-btn">توليد كود سري جديد ⚡</button>
                </form>
                <p style="font-size:13px; color:#555;">الأكواد النشطة السرية (${db.activeCodes.length}):</p>
                <ul>${db.activeCodes.map(c => `<li>${c}</li>`).join('')}</ul>
            </div>
            <div class="box">
                <h3 style="color: #059669;">المتاجر المسجلة (${db.stores.length}):</h3>
                <ul>${db.stores.map(s => `<li><b>${s.storeName}</b> (${s.ownerName}) - <a href="/store/${s.storeSlug}" target="_blank">رابط</a> | <a href="/store/${s.storeSlug}/login">التحكم</a></li>`).join('')}</ul>
            </div>
            <br><a href="/" style="color:#555; text-decoration:none;">العودة للرئيسية</a>
        </body>
        </html>
    `);
});

app.get('/store/:slug/login', (req, res) => {
    const slug = req.params.slug;
    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>تسجيل دخول التاجر</title><link rel="manifest" href="/manifest.json"></head>
        <style>body{font-family:Tahoma; background:#f3f4f6; padding:50px; text-align:center;} .card{background:#fff; padding:30px; max-width:400px; margin:auto; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);}</style>
        <body>
            <div class="card">
                <h2>تسجيل دخول لوحة المتجر</h2>
                <form action="/store/${slug}/auth" method="POST">
                    <input type="password" name="password" placeholder="أدخل كلمة مرور متجرك" required style="width:100%; padding:10px; margin:15px 0; border:1px solid #ccc; border-radius:5px;">
                    <button type="submit" style="width:100%; background:#008060; color:#fff; padding:10px; border:none; border-radius:5px; font-weight:bold;">دخول</button>
                </form>
                <br><a href="/" style="color:#555; text-decoration:none; font-size:13px;">العودة للرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

app.post('/store/:slug/auth', (req, res) => {
    const slug = req.params.slug;
    const { password } = req.body;
    const store = db.stores.find(s => s.storeSlug === slug);
    if (store && store.password === password) {
        res.redirect(`/store/${slug}/dashboard`);
    } else {
        res.send(`<script>alert('كلمة المرور خاطئة!'); window.location.href='/store/${slug}/login';</script>`);
    }
});

// لوحة تحكم التاجر مع إمكانية تحديد الألوان والقياسات وصورة المنتج بحرية
app.get('/store/:slug/dashboard', (req, res) => {
    const slug = req.params.slug;
    const store = db.stores.find(s => s.storeSlug === slug);
    if (!store) return res.send('المتجر غير موجود');

    const isExpired = new Date() > new Date(store.expiryDate);

    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>لوحة تحكم ${store.storeName}</title><link rel="manifest" href="/manifest.json"></head>
        <style>
            body { font-family: Tahoma; background: #f3f4f6; padding: 20px; text-align: center; }
            .box { background: #fff; padding: 25px; border-radius: 10px; max-width: 700px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-bottom: 20px; text-align: right; }
            .box h2, .box h3 { text-align: center; }
            input, select, button { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; }
            .btn { background: #008060; color: white; border: none; font-weight: bold; cursor: pointer; }
            .product-item, .order-item { background: #f9fafb; padding: 12px; border: 1px solid #e5e7eb; border-radius: 5px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
            .del-btn { background: #dc2626; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; width: auto; }
            .print-btn { background: #2563eb; color: white; text-decoration: none; padding: 5px 10px; border-radius: 4px; font-size: 13px; font-weight: bold; }
            .logo-preview { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; display: inline-block; vertical-align: middle; margin-left: 10px; border: 2px solid #008060; }
        </style>
        <body>
            <div class="box">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <a href="/store/${slug}" target="_blank" style="background:#2563eb; color:#fff; padding:8px 15px; text-decoration:none; border-radius:5px; font-weight:bold; font-size:13px;">معاينة المتجر 🛒</a>
                    <a href="/" style="background:#4b5563; color:#fff; padding:8px 15px; text-decoration:none; border-radius:5px; font-weight:bold; font-size:13px;">الرئيسية 🏠</a>
                </div>
                <h2 style="color: #008060;">
                    <img src="${store.logoUrl}" class="logo-preview">
                    لوحة تحكم متجر: ${store.storeName}
                </h2>
                <p style="text-align:center; font-size:13px; color:#555;">المالك: <b>${store.ownerName}</b> | انتهاء الاشتراك: <b>${new Date(store.expiryDate).toLocaleDateString()}</b></p>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                
                ${isExpired ? `
                    <div style="background:#fee2e2; color:#b91c1c; padding:15px; border-radius:5px; text-align:center; font-weight:bold;">
                        ⚠️ انتهت صلاحية اشتراك متجرك! يرجى التواصل مع الإدارة.
                    </div>
                ` : `
                    <h3>إعدادات المتجر (واتساب، تيليغرام والشعار)</h3>
                    <form action="/store/${slug}/update-settings" method="POST">
                        <label style="font-size:12px; font-weight:bold;">رقم الواتساب:</label>
                        <input type="text" name="whatsapp" value="${store.whatsapp}" required>
                        <label style="font-size:12px; font-weight:bold;">معرف تيليغرام (Chat ID):</label>
                        <input type="text" name="telegramChatId" value="${store.telegramChatId || ''}" placeholder="123456789">
                        <label style="font-size:12px; font-weight:bold;">تغيير الشعار:</label>
                        <input type="file" accept="image/*" onchange="let r = new FileReader(); r.onload = ()=>document.getElementById('logoB64').value=r.result; r.readAsDataURL(this.files[0]);">
                        <input type="hidden" name="logoB64" id="logoB64">
                        <button type="submit" class="btn">حفظ الإعدادات 💾</button>
                    </form>

                    <h3 style="margin-top: 25px;">إضافة منتج جديد (العدد الحالي: ${store.products.length} / 10)</h3>
                    ${store.products.length >= 10 ? `
                        <p style="color: #dc2626; font-weight: bold; text-align: center;">بلغت الحد الأقصى للباقة (10 منتجات).</p>
                    ` : `
                        <form action="/store/${slug}/add-product" method="POST">
                            <input type="text" name="productName" placeholder="اسم المنتج" required>
                            <input type="text" name="productPrice" placeholder="السعر (دج)" required>
                            <input type="text" name="productImage" placeholder="رابط صورة المنتج (مثال: https://... أو رابط صورة جاهز)" required>
                            
                            <label style="font-size:12px; font-weight:bold; margin-top:5px; display:block;">الألوان المتاحة (افصل بينها بفاصلة):</label>
                            <input type="text" name="colors" placeholder="مثال: أسود، أبيض، أحمر" value="أسود، أبيض" required>
                            
                            <label style="font-size:12px; font-weight:bold; margin-top:5px; display:block;">القياسات / الأحجام المتاحة (افصل بينها بفاصلة):</label>
                            <input type="text" name="sizes" placeholder="مثال: S, M, L, XL أو 38,39,40 أو قياس موحد" value="قياس موحد" required>
                            
                            <button type="submit" class="btn" style="margin-top:15px;">إضافة المنتج ➕</button>
                        </form>
                    `}
                `}

                <h3 style="margin-top: 25px;">قائمة المنتجات (${store.products.length})</h3>
                <div>
                    ${store.products.length === 0 ? '<p style="text-align:center; color:#666;">لا توجد منتجات حالياً.</p>' : ''}
                    ${store.products.map((p, index) => `
                        <div class="product-item">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <img src="${p.image || 'https://i.ibb.co/6P82W8h/default-avatar.png'}" style="width:40px; height:40px; object-fit:cover; border-radius:4px;">
                                <span><b>${p.name}</b> - ${p.price} دج<br><small style="color:#555;">ألوان: ${p.colors} | قياسات: ${p.sizes}</small></span>
                            </div>
                            <form action="/store/${slug}/delete-product" method="POST" style="margin:0;">
                                <input type="hidden" name="productIndex" value="${index}">
                                <button type="submit" class="del-btn">حذف</button>
                            </form>
                        </div>
                    `).join('')}
                </div>

                <h3 style="margin-top: 25px; color: #2563eb;">الطلبات الواردة (${store.orders.length})</h3>
                <div>
                    ${store.orders.length === 0 ? '<p style="text-align:center; color:#666;">لا توجد طلبات جديدة.</p>' : ''}
                    ${store.orders.map(o => `
                        <div class="order-item" style="display:block; text-align:right;">
                            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #ddd; padding-bottom:5px; margin-bottom:5px;">
                                <span><b>رقم التتبع: #${o.trackingId}</b></span>
                                <a href="/store/${slug}/print-order/${o.trackingId}" target="_blank" class="print-btn">طباعة البوليصة 🖨️</a>
                            </div>
                            <p style="margin:3px 0;"><b>الزبون:</b> ${o.firstName} ${o.lastName} (${o.phone})</p>
                            <p style="margin:3px 0;"><b>الولاية:</b> ${o.state}</p>
                            <p style="margin:3px 0;"><b>الطلب:</b> ${o.productName} - ${o.price} دج (اللون: ${o.color}, المقاس: ${o.size})</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        </body>
        </html>
    `);
});

app.post('/store/:slug/update-settings', (req, res) => {
    const slug = req.params.slug;
    const store = db.stores.find(s => s.storeSlug === slug);
    const { whatsapp, telegramChatId, logoB64 } = req.body;
    if (store) {
        if (whatsapp) store.whatsapp = whatsapp;
        if (telegramChatId !== undefined) store.telegramChatId = telegramChatId;
        if (logoB64) {
            try {
                const matches = logoB64.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
                if (matches && matches.length === 3) {
                    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                    const bitmap = Buffer.from(matches[2], 'base64');
                    const filename = `store-logo-${Date.now()}.${ext}`;
                    fs.writeFileSync(path.join(uploadDir, filename), bitmap);
                    store.logoUrl = `/uploads/${filename}`;
                }
            } catch (e) {}
        }
        saveDB();
    }
    res.redirect(`/store/${slug}/dashboard`);
});

// إضافة منتج بالصورة والألوان والقياسات التي يحددها التاجر
app.post('/store/:slug/add-product', (req, res) => {
    const slug = req.params.slug;
    const store = db.stores.find(s => s.storeSlug === slug);
    if (!store) return res.send('المتجر غير موجود');

    const isExpired = new Date() > new Date(store.expiryDate);
    if (isExpired || store.products.length >= 10) {
        return res.send(`<script>alert('انتهى الاشتراك أو بلغت 10 منتجات.'); window.location.href='/store/${slug}/dashboard';</script>`);
    }

    const { productName, productPrice, productImage, colors, sizes } = req.body;
    if (productName && productPrice) {
        store.products.push({ 
            name: productName, 
            price: productPrice, 
            image: productImage || 'https://i.ibb.co/6P82W8h/default-avatar.png',
            colors: colors || 'حسب الطلب',
            sizes: sizes || 'قياس موحد'
        });
        saveDB();
    }
    res.redirect(`/store/${slug}/dashboard`);
});

app.post('/store/:slug/delete-product', (req, res) => {
    const slug = req.params.slug;
    const store = db.stores.find(s => s.storeSlug === slug);
    const { productIndex } = req.body;
    if (store && productIndex !== undefined) {
        store.products.splice(parseInt(productIndex), 1);
        saveDB();
    }
    res.redirect(`/store/${slug}/dashboard`);
});

app.get('/store/:slug/print-order/:trackingId', (req, res) => {
    const { slug, trackingId } = req.params;
    const store = db.stores.find(s => s.storeSlug === slug);
    if (!store) return res.send('المتجر غير موجود');
    const order = store.orders.find(o => o.trackingId === trackingId);
    if (!order) return res.send('الطلب غير موجود');

    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>بوليصة شحن - #${order.trackingId}</title><link rel="manifest" href="/manifest.json"></head>
        <style>
            body { font-family: Tahoma; padding: 20px; text-align: center; background: #fff; color: #000; }
            .invoice { border: 2px dashed #000; padding: 20px; max-width: 400px; margin: auto; text-align: right; }
            h2 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            p { font-size: 16px; margin: 8px 0; }
            @media print { .no-print { display: none; } }
        </style>
        <body onload="window.print()">
            <div class="invoice">
                <h2>📦 بوليصة شحن - ${store.storeName}</h2>
                <p><b>رقم التتبع:</b> #${order.trackingId}</p>
                <hr>
                <p><b>الاسم:</b> ${order.firstName}${order.lastName}</p>
                <p><b>الهاتف:</b> ${order.phone}</p>
                <p><b>الولاية:</b> ${order.state}</p>
                <hr>
                <p><b>المنتج:</b> ${order.productName} (${order.price} دج)</p>
                <p><b>اللون:</b> ${order.color} | <b>المقاس:</b> ${order.size}</p>
                <hr>
                <p style="text-align: center; font-size: 14px; margin-top: 15px;">شكراً لثقتكم بنا!</p>
            </div>
            <br class="no-print">
            <button class="no-print" onclick="window.print()" style="padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">طباعة البوليصة 🖨️</button>
        </body>
        </html>
    `);
});

app.post('/store/:slug/checkout', (req, res) => {
    const slug = req.params.slug;
    const store = db.stores.find(s => s.storeSlug === slug);
    if (!store) return res.send('المتجر غير موجود');

    const { productName, price, firstName, lastName, phone, state, color, size } = req.body;
    const trackingId = 'TRK-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = { trackingId, productName, price, firstName, lastName, phone, state, color, size };
    store.orders.push(newOrder);
    saveDB();

    if (store.telegramChatId) {
        const tgMsg = `🚨 *طلب جديد في متجرك (${store.storeName})!*\\n\\n` +
                      `📦 التتبع: \`#${trackingId}\`\\n` +
                      `👤 الزبون: ${firstName} ${lastName}\\n` +
                      `📞 الهاتف: ${phone}\\n` +
                      `📍 الولاية: ${state}\\n` +
                      `🛍️ المنتج: ${productName} (${price}دج)\\n` +
                      `🎨 اللون: ${color} | المقاس: ${size}`;
        sendTelegramNotification(store.telegramChatId, tgMsg);
    }

    const whatsappMsg = `السلام عليكم، أود تأكيد طلبي:%0A- رقم التتبع: #${trackingId}%0A- الاسم: ${firstName}${lastName}%0A- الهاتف: ${phone}%0A- الولاية: ${state}%0A- المنتج: ${productName} (${price}دج)%0A- اللون: ${color}%0A- المقاس: ${size}`;
    
    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>تم إرسال الطلب</title><link rel="manifest" href="/manifest.json"></head>
        <body style="font-family: Tahoma; text-align: center; padding: 50px; background: #f3f4f6;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 450px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #008060;">تم إرسال طلبك بنجاح! 🎉</h2>
                <p style="margin-top: 15px;">رقم التتبع: <b>#${trackingId}</b></p>
                <p style="color: #666; font-size:14px;">جاري تحويلك لتأكيد الطلب عبر الواتساب...</p>
                <a href="https://wa.me/${store.whatsapp}?text=${whatsappMsg}" style="display: inline-block; margin-top: 20px; background: #25d366; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">تأكيد الطلب عبر واتساب التاجر 📱</a>
            </div>
            <script>
                setTimeout(() => { window.location.href = "https://wa.me/${store.whatsapp}?text=${whatsappMsg}"; }, 2000);
            </script>
        </body>
        </html>
    `);
});

// عرض متجر الزبون مع خيارات الألوان والقياسات وصور المنتجات الحقيقية
app.get('/store/:slug', (req, res) => {
    const storeSlug = req.params.slug;
    const store = db.stores.find(s => s.storeSlug === storeSlug);
    if (!store) return res.status(404).send('المتجر غير موجود');

    const headerBg = store.storeColor === 'blue' ? '#1e3a8a' : store.storeColor === 'black' ? '#111' : store.storeColor === 'red' ? '#b91c1c' : '#008060';

    res.send(`
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>${store.storeName}</title>
            <link rel="manifest" href="/manifest.json">
            <style>
                body { font-family: Tahoma; background: #f9fafb; margin: 0; padding: 0; text-align: center; }
                header { background: ${headerBg}; color: white; padding: 25px; display: flex; align-items: center; justify-content: space-between; padding-left: 20px; padding-right: 20px; }
                .store-logo { width: 55px; height: 55px; border-radius: 50%; object-fit: cover; border: 2px solid white; }
                .container { max-width: 800px; margin: 30px auto; background: white; padding: 25px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: right; }
                .product-card { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
                .product-img { width: 70px; height: 70px; object-fit: cover; border-radius: 6px; margin-left: 15px; }
                .buy-btn { background: #008060; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; cursor: pointer; }
                .modal { display:

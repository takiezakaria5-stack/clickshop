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
        telegramBotToken: ""
    },
    activeCodes: ["9X4F7B2K", "3M8R9P1W", "5V2X4H8N"],
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

const states = ["01. أدرار", "02. الشلف", "03. الأغواط", "04. أم البواقي", "05. باتنة", "06. بجاية", "07. بسكرة", "08. بشار", "09. البليدة", "10. البويرة", "11. تمنراست", "12. تبسة", "13. تلمسان", "14. تيارت", "15. تيزي وزو", "16. الجزائر", "17. الجلفة", "18. جيجل", "19. سطيف", "20. سعيدة", "21. سكيكدة", "22. سيدي بلعباس", "23. عنابة", "24. قالمة", "25. قسنطينة", "26. المدية", "27. مستغانم", "28. المسيلة", "29. معسكر", "30. ورقلة", "31. وهران", "32. البيض", "33. إليزي", "34. برج بوعريريج", "35. بومرداس", "36. الطارف", "37. تندوف", "38. تسيمسيلت", "39. الوادي", "40. خنشلة", "41. سوق اهراس", "42. تيبازة", "43. ميلة", "44. عين الدفلى", "45. نعامة", "46. عين تيموشنت", "47. غرداية", "48. غليزان", "49. المغير", "50. المنيعة", "51. أولاد جلال", "52. برج باجي مختار", "53. بني عباس", "54. تيميمون", "55. تقرت", "56. جانت", "57. المغير", "58. المنيعة", "59. تيزي وزو", "60. برج عجيال", "61. مسعد", "62. أفلو", "63. الأبيضسيد الشيخ", "64. قصر الشلالة", "65. عين صالح", "66. عين قزام", "67. الرويسات", "68. مسيسة", "69. البرمة"];

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

app.get('/', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>ClickShop - منصة المتاجر الإلكترونية</title>
        </head>
        <body style="font-family:Tahoma; background:#f3f4f6; margin:0; padding:0; text-align:center;">
            <div style="background:#008060; padding:12px 25px; display:flex; justify-content:space-between; align-items:center; color:#fff; box-shadow:0 2px 10px rgba(0,0,0,0.1);">
                <div style="display:flex; gap:8px;">
                    <button onclick="setLang('ar')" style="background:rgba(255,255,255,0.2); border:none; color:#fff; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">العربية</button>
                    <button onclick="setLang('fr')" style="background:rgba(255,255,255,0.2); border:none; color:#fff; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">Français</button>
                    <button onclick="setLang('en')" style="background:rgba(255,255,255,0.2); border:none; color:#fff; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:12px;">English</button>
                </div>
                <h2 style="margin:0; font-size:20px; cursor:pointer;" onclick="window.location.href='/admin-login'">ClickShop 🛒</h2>
            </div>

            <div style="max-width:480px; margin:25px auto; background:#fff; padding:25px; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.06);">
                <div style="border: 2px dashed #f59e0b; background:#fffbeb; padding:12px; border-radius:8px; margin-bottom:20px; color:#b45309; font-size:13px; font-weight:bold;">
                    📢 مكان مخصص للإعلانات والعروض الخاصة بك هنا
                </div>

                <h2 id="t1" style="color:#111827; margin-bottom:8px; font-size:22px;">أنشئ متجرك الإلكتروني الاحترافي في ثوانٍ</h2>
                <p id="t2" style="color:#4b5563; font-size:13px; margin-bottom:20px; line-height:1.5;">منصة متكاملة لإطلاق تجارتك الذكية، بتحكم كامل في الهوية، الألوان، وبأمان تام عبر أكواد التفعيل الحصرية.</p>
                
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <a href="/register-page" id="b1" style="display:block; background:#008060; color:#fff; padding:12px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:15px;">🚀 ابدأ إنشاء متجرك الآن</a>
                    <a href="/login-store" id="b2" style="display:block; background:#2563eb; color:#fff; padding:12px; border-radius:6px; text-decoration:none; font-weight:bold; font-size:15px;">⚙️ تسجيل دخول التجار</a>
                </div>

                <div style="display:flex; justify-content:center; gap:12px; margin-top:25px;">
                    <a href="https://t.me/" target="_blank" style="background:#0088cc; color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none; font-size:16px;">✈️</a>
                    <a href="https://facebook.com" target="_blank" style="background:#1877f2; color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none; font-size:16px;">f</a>
                    <a href="https://instagram.com" target="_blank" style="background:#e4405f; color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none; font-size:16px;">📷</a>
                    <a href="https://whatsapp.com" target="_blank" style="background:#25d366; color:#fff; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; text-decoration:none; font-size:16px;">💬</a>
                </div>
            </div>
            <script>
                function setLang(l){
                    if(l==='fr'){
                        document.getElementById('t1').innerText="Créez votre boutique pro en secondes";
                        document.getElementById('t2').innerText="Plateforme e-commerce intégrée avec contrôle total des couleurs et sécurité.";
                        document.getElementById('b1').innerText="🚀 Créer ma boutique";
                        document.getElementById('b2').innerText="⚙️ Connexion Marchand";
                    }else if(l==='en'){
                        document.getElementById('t1').innerText="Create your pro store in seconds";
                        document.getElementById('t2').innerText="Integrated e-commerce platform with full color control and security.";
                        document.getElementById('b1').innerText="🚀 Create Store Now";
                        document.getElementById('b2').innerText="⚙️ Merchant Login";
                    }else{
                        document.getElementById('t1').innerText="أنشئ متجرك الإلكتروني الاحترافي في ثوانٍ";
                        document.getElementById('t2').innerText="منصة متكاملة لإطلاق تجارتك الذكية، بتحكم كامل في الهوية، الألوان، وبأمان تام عبر أكواد التفعيل الحصرية.";
                        document.getElementById('b1').innerText="🚀 ابدأ إنشاء متجرك الآن";
                        document.getElementById('b2').innerText="⚙️ تسجيل دخول التجار";
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.get('/admin-login', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>دخول المدير العام</title></head>
        <body style="font-family:Tahoma; background:#f3f4f6; padding:40px; text-align:center;">
            <div style="background:#fff; padding:25px; max-width:380px; margin:auto; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                <h2 style="color:#008060; font-size:20px;">لوحة تحكم المدير العام</h2>
                <form action="/admin-auth" method="POST">
                    <input type="password" name="adminPassword" placeholder="كلمة المرور السرية" required style="width:100%; padding:10px; margin:12px 0; border:1px solid #ccc; border-radius:5px;">
                    <button type="submit" style="width:100%; background:#008060; color:#fff; padding:10px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">دخول 🛠️</button>
                </form>
                <br><a href="/" style="color:#555; text-decoration:none; font-size:12px;">← عودة للرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

app.post('/admin-auth', (req, res) => {
    if (req.body.adminPassword === 'kenouni19') {
        res.redirect('/admin-dashboard');
    } else {
        res.send(`<script>alert('كلمة المرور خطأ!'); window.location.href='/admin-login';</script>`);
    }
});

app.get('/admin-dashboard', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>لوحة المدير العام</title></head>
        <body style="font-family:Tahoma; background:#f3f4f6; padding:25px; text-align:center;">
            <div style="background:#fff; padding:25px; max-width:650px; margin:auto; border-radius:10px; text-align:right; box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                <h2 style="color:#008060; text-align:center; font-size:20px;">لوحة تحكم المدير العام 🛠️</h2>
                <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
                <p><b>عدد المتاجر النشطة:</b> ${db.stores.length}</p>
                <p><b>الأكواد المتاحة:</b> ${db.activeCodes.length}</p>
                <h3 style="margin-top:15px; font-size:16px;">المتاجر المسجلة:</h3>
                ${db.stores.length === 0 ? '<p style="color:#666; font-size:13px;">لا توجد متاجر بعد.</p>' : ''}
                ${db.stores.map(s => `<div style="background:#f9fafb; padding:10px; border:1px solid #e5e7eb; border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:14px;"><b>${s.storeName}</b> (${s.storeSlug})</span><a href="/store/${s.storeSlug}" target="_blank" style="background:#008060; color:#fff; padding:5px 10px; text-decoration:none; border-radius:4px; font-size:12px;">زيارة المتجر</a></div>`).join('')}
                <br><a href="/" style="display:block; text-align:center; color:#555; text-decoration:none; margin-top:15px; font-size:13px;">← تسجيل الخروج للرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/register-page', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>إنشاء متجر</title></head>
        <body style="font-family:Tahoma; background:#f3f4f6; padding:25px; text-align:center;">
            <div style="background:#fff; padding:25px; max-width:420px; margin:auto; border-radius:10px; text-align:right; box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                <h2 style="color:#008060; text-align:center; font-size:20px;">فتح متجر جديد</h2>
                <form action="/register" method="POST">
                    <label style="font-size:13px;">كود التفعيل (8 خانات):</label>
                    <input type="text" name="activationCode" required style="width:100%; padding:8px; margin:6px 0 12px 0; border:1px solid #ccc; border-radius:5px;">
                    <label style="font-size:13px;">اسم المتجر:</label>
                    <input type="text" name="storeName" required style="width:100%; padding:8px; margin:6px 0 12px 0; border:1px solid #ccc; border-radius:5px;">
                    <label style="font-size:13px;">رابط المتجر (Slug بالإنجليزية):</label>
                    <input type="text" name="storeSlug" required style="width:100%; padding:8px; margin:6px 0 12px 0; border:1px solid #ccc; border-radius:5px;">
                    <label style="font-size:13px;">مجال المتجر:</label>
                    <input type="text" name="storeCategory" required style="width:100%; padding:8px; margin:6px 0 12px 0; border:1px solid #ccc; border-radius:5px;">
                    <label style="font-size:13px;">لون واجهة المتجر:</label>
                    <select name="storeColor" style="width:100%; padding:8px; margin:6px 0 12px 0; border:1px solid #ccc; border-radius:5px;">
                        ${storeColors.map(c => `<option value="${c.code}">${c.name}</option>`).join('')}
                    </select>
                    <label style="font-size:13px;">اسم المالك:</label>
                    <input type="text" name="ownerName" required style="width:100%; padding:8px; margin:6px 0 12px 0; border:1px solid #ccc; border-radius:5px;">
                    <label style="font-size:13px;">رقم واتساب:</label>
                    <input type="text" name="whatsapp" value="213700000000" required style="width:100%; padding:8px; margin:6px 0 12px 0; border:1px solid #ccc; border-radius:5px;">
                    <label style="font-size:13px;">معرف تيليغرام (Chat ID للإشعارات):</label>
                    <input type="text" name="telegramChatId" placeholder="اختياري للتنبيهات الفورية" style="width:100%; padding:8px; margin:6px 0 12px 0; border:1px solid #ccc; border-radius:5px;">
                    <label style="font-size:13px;">كلمة المرور:</label>
                    <input type="password" name="password" required style="width:100%; padding:8px; margin:6px 0 15px 0; border:1px solid #ccc; border-radius:5px;">
                    <button type="submit" style="background:#008060; color:#fff; border:none; padding:11px; width:100%; font-weight:bold; border-radius:5px; cursor:pointer;">إنشاء المتجر 🚀</button>
                </form>
                <br><a href="/" style="display:block; text-align:center; color:#555; text-decoration:none; font-size:13px;">الرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

app.post('/register', (req, res) => {
    const { activationCode, storeName, storeSlug, storeCategory, storeColor, ownerName, whatsapp, telegramChatId, password } = req.body;
    const idx = db.activeCodes.indexOf(activationCode);
    if (idx === -1) return res.send('كود التفعيل غير صالح أو مستعمل! <a href="/register-page">عودة</a>');
    if (db.stores.find(s => s.storeSlug === storeSlug)) return res.send('رابط المتجر محجوز مسبقاً. <a href="/register-page">عودة</a>');
    const expiry = new Date(); expiry.setMonth(expiry.getMonth() + 6);
    db.stores.push({ activationCode, storeName, storeSlug, storeCategory, storeColor: storeColor || '#008060', ownerName, whatsapp: whatsapp || "213700000000", telegramChatId: telegramChatId || "", logoUrl: "https://i.ibb.co/6P82W8h/default-avatar.png", password, products: [], orders: [], expiryDate: expiry.toISOString() });
    db.activeCodes.splice(idx, 1);
    db.usedCodes.push(activationCode);
    saveDB();
    res.send(`<html dir="rtl"><body style="font-family:Tahoma; text-align:center; padding:50px;"><div style="background:#fff; padding:30px; max-width:420px; margin:auto; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.08);"><h2 style="color:#008060; font-size:20px;">مبروك ${ownerName}! تم إنشاء المتجر 🚀</h2><a href="/store/${storeSlug}" style="display:inline-block; background:#2563eb; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold; font-size:14px;">فتح المتجر 🛒</a><br><br><a href="/store/${storeSlug}/login" style="display:inline-block; background:#008060; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold; font-size:14px;">لوحة التحكم ⚙️</a></div></body></html>`);
});

app.get('/login-store', (req, res) => {
    res.send(`<html dir="rtl"><head><meta charset="UTF-8"><title>دخول التاجر</title></head><body style="font-family:Tahoma; background:#f3f4f6; padding:30px; text-align:center;"><div style="background:#fff; padding:25px; max-width:420px; margin:auto; border-radius:10px; text-align:right; box-shadow:0 4px 15px rgba(0,0,0,0.08);"><h2 style="color:#008060; text-align:center; font-size:20px;">اختر متجرك للدخول</h2>${db.stores.length === 0 ? '<p style="text-align:center; color:#666; font-size:13px;">لا توجد متاجر مسجلة بعد.</p>' : ''}${db.stores.map(s => `<div style="background:#f9fafb; padding:10px; border:1px solid #e5e7eb; border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:14px;"><b>${s.storeName}</b></span><a href="/store/${s.storeSlug}/login" style="background:#2563eb; color:#fff; padding:5px 10px; text-decoration:none; border-radius:4px; font-size:12px;">دخول ⚙️</a></div>`).join('')}<br><a href="/" style="display:block; text-align:center; color:#555; text-decoration:none; font-size:13px;">الرئيسية</a></div></body></html>`);
});

app.get('/store/:slug/login', (req, res) => {
    res.send(`<html dir="rtl"><head><meta charset="UTF-8"><title>دخول التاجر</title></head><body style="font-family:Tahoma; background:#f3f4f6; padding:40px; text-align:center;"><div style="background:#fff; padding:25px; max-width:380px; margin:auto; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.08);"><h2 style="font-size:18px;">كلمة مرور المتجر</h2><form action="/store/${req.params.slug}/auth" method="POST"><input type="password" name="password" required style="width:100%; padding:10px; margin:12px 0; border:1px solid #ccc; border-radius:5px;"><button type="submit" style="width:100%; background:#008060; color:#fff; padding:10px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">دخول</button></form><br><a href="/login-store" style="color:#555; text-decoration:none; font-size:12px;">← اختيار متجر آخر</a></div></body></html>`);
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
    res.send(`
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>لوحة تحكم ${store.storeName}</title></head>
        <body style="font-family:Tahoma; background:#f3f4f6; padding:20px; text-align:center;">
            <div style="background:#fff; padding:25px; max-width:650px; margin:auto; border-radius:10px; text-align:right; box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px;">
                    <a href="/store/${store.storeSlug}" target="_blank" style="background:#2563eb; color:#fff; padding:6px 12px; text-decoration:none; border-radius:5px; font-size:13px;">معاينة المتجر 🛒</a>
                    <a href="/" style="background:#4b5563; color:#fff; padding:6px 12px; text-decoration:none; border-radius:5px; font-size:13px;">الرئيسية 🏠</a>
                </div>
                <h2 style="color:${store.storeColor || '#008060'}; text-align:center; font-size:20px;">لوحة تحكم: ${store.storeName}</h2>
                <hr style="border:0; border-top:1px solid #eee; margin:15px 0;">
                <h3 style="font-size:16px;">إضافة منتج جديد وتخصيص مواصفاته (العدد: ${store.products.length}/10)</h3>
                ${store.products.length >= 10 ? '<p style="color:red; font-size:13px;">بلغت الحد الأقصى.</p>' : `
                <form action="/store/${store.storeSlug}/add-product" method="POST">
                    <label style="font-size:12px;">اسم المنتج:</label>
                    <input type="text" name="productName" required style="width:100%; padding:8px; margin:4px 0 10px 0; border:1px solid #ccc; border-radius:4px;">
                    <label style="font-size:12px;">السعر (دج):</label>
                    <input type="text" name="productPrice" required style="width:100%; padding:8px; margin:4px 0 10px 0; border:1px solid #ccc; border-radius:4px;">
                    <label style="font-size:12px;">رابط صورة المنتج:</label>
                    <input type="text" name="productImage" required style="width:100%; padding:8px; margin:4px 0 10px 0; border:1px solid #ccc; border-radius:4px;">
                    <label style="font-size:12px;">الألوان المتاحة (افصل بينها بفاصلة، اتركها فارغة إذا لا تريد ألوان):</label>
                    <input type="text" name="colors" placeholder="أسود، أبيض، أحمر" style="width:100%; padding:8px; margin:4px 0 10px 0; border:1px solid #ccc; border-radius:4px;">
                    <label style="font-size:12px;">القياسات / المقاسات (افصل بينها بفاصلة، اتركها فارغة إذا لا تريد مقاسات):</label>
                    <input type="text" name="sizes" placeholder="S, M, L, XL أو قياس موحد" style="width:100%; padding:8px; margin:4px 0 10px 0; border:1px solid #ccc; border-radius:4px;">
                    <button type="submit" style="background:${store.storeColor || '#008060'}; color:#fff; border:none; padding:10px; width:100%; font-weight:bold; margin-top:5px; cursor:pointer; border-radius:5px; font-size:14px;">إضافة المنتج للمتجر ➕</button>
                </form>`}
                <h3 style="margin-top:20px; font-size:16px;">المنتجات الحالية:</h3>
                ${store.products.length === 0 ? '<p style="color:#666; font-size:13px;">لا توجد منتجات مضافة بعد.</p>' : ''}
                ${store.products.map((p, i) => `<div style="background:#f9fafb; padding:10px; border:1px solid #e5e7eb; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;"><span style="font-size:13px;"><b>${p.name}</b> - ${p.price} دج</span><form action="/store/${store.storeSlug}/delete-product" method="POST" style="margin:0;"><input type="hidden" name="productIndex" value="${i}"><button type="submit" style="background:red; color:#fff; border:none; padding:4px 8px; cursor:pointer; border-radius:4px; font-size:12px;">حذف</button></form></div>`).join('')}
            </div>
        </body>
        </html>
    `);
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
    
    res.send(`
        <html dir="rtl">
        <body style="font-family:Tahoma; text-align:center; padding:40px; background:#f3f4f6;">
            <div style="background:#fff; padding:30px; max-width:420px; margin:auto; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.08);">
                <h2 style="color:${store.storeColor || '#008060'}; font-size:20px;">تم إرسال الطلب بنجاح! 🎉</h2>
                <p style="color:#555; font-size:13px; margin:10px 0 20px 0;">رقم التتبع الخاص بك: <b>#(${trackingId})</b></p>
                <a href="https://wa.me/${store.whatsapp}?text=${wa}" style="display:inline-block; background:#25d366; color:#fff; padding:12px 20px; text-decoration:none; border-radius:5px; font-weight:bold; font-size:14px;">تأكيد الطلب عبر واتساب التاجر 📱</a>
            </div>
            <script>setTimeout(()=>{window.location.href="https://wa.me/${store.whatsapp}?text=${wa}";},2000);</script>
        </body>
        </html>
    `);
});

app.get('/store/:slug', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (!store) return res.status(404).send('المتجر غير موجود');
    const themeColor = store.storeColor || '#008060';
    res.send(`
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>${store.storeName}</title></head>
        <body style="font-family:Tahoma; background:#f9fafb; margin:0; text-align:center;">
            <header style="background:${themeColor}; color:#fff; padding:15px 25px; display:flex; justify-content:space-between; align-items:center;">
                <h1 style="font-size:18px; margin:0;">🛒 ${store.storeName}</h1>
                <a href="/store/${store.storeSlug}/login" style="background:rgba(255,255,255,0.2); color:#fff; padding:6px 12px; text-decoration:none; border-radius:5px; font-size:12px;">لوحة التحكم ⚙️</a>
            </header>
            <div style="max-width:700px; margin:25px auto; background:#fff; padding:20px; border-radius:10px; text-align:right; box-shadow:0 4px 15px rgba(0,0,0,0.05);">
                <h3 style="text-align:center; color:${themeColor}; font-size:18px;">قائمة المنتجات</h3>
                ${store.products.length === 0 ? '<p style="text-align:center; color:#666; font-size:13px;">لا توجد منتجات معروضة حالياً.</p>' : ''}
                ${store.products.map(p => `
                    <div style="background:#f3f4f6; padding:12px; border-radius:8px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${p.image}" style="width:55px; height:55px; object-fit:cover; border-radius:6px;">
                            <div>
                                <h4 style="margin:0 0 4px 0; font-size:15px;">${p.name}</h4>
                                <span style="color:${themeColor}; font-weight:bold; font-size:14px;">${p.price} دج</span>
                                <div style="font-size:11px; color:#555; margin-top:2px;">${p.colors ? 'ألوان: ' + p.colors : ''} ${p.sizes ? ' | مقاسات: ' + p.sizes : ''}</div>
                            </div>
                        </div>
                        <button onclick="openModal('${p.name}', '${p.price}', '${p.colors || ''}', '${p.sizes || ''}')" style="background:${themeColor}; color:#fff; border:none; padding:8px 14px; border-radius:5px; font-weight:bold; cursor:pointer; font-size:13px;">اطلب الآن 🛍️</button>
                    </div>
                `).join('')}
            </div>

            <div id="m" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center;">
                <div style="background:#fff; padding:20px; border-radius:10px; width:90%; max-width:380px; text-align:right; box-shadow:0 4px 20px rgba(0,0,0,0.15);">
                    <button onclick="document.getElementById('m').style.display='none'" style="background:red; color:#fff; border:none; padding:4px 8px; float:left; cursor:pointer; border-radius:4px; font-size:11px;">إغلاق</button>
                    <h3 style="font-size:16px; margin-top:0;">إتمام الطلب</h3>
                    <form action="/store/${store.storeSlug}/checkout" method="POST">
                        <input type="hidden" name="productName" id="pn">
                        <input type="hidden" name="price" id="pp">
                        <label style="font-size:12px;">الاسم:</label><input type="text" name="firstName" required style="width:100%; padding:7px; margin:3px 0 8px 0; border:1px solid #ccc; border-radius:4px;">
                        <label style="font-size:12px;">اللقب:</label><input type="text" name="lastName" required style="width:100%; padding:7px; margin:3px 0 8px 0; border:1px solid #ccc; border-radius:4px;">
                        <label style="font-size:12px;">رقم الهاتف:</label><input type="text" name="phone" required style="width:100%; padding:7px; margin:3px 0 8px 0; border:1px solid #ccc; border-radius:4px;">
                        <label style="font-size:12px;">الولاية:</label>
                        <select name="state" required style="width:100%; padding:7px; margin:3px 0 8px 0; border:1px solid #ccc; border-radius:4px;">
                            <option value="">اختر الولاية</option>
                            ${states.map(st => `<option value="${st}">${st}</option>`).join('')}
                        </select>
                        <label style="font-size:12px;">الكمية:</label><input type="number" name="quantity" value="1" min="1" required style="width:100%; padding:7px; margin:3px 0 8px 0; border:1px solid #ccc; border-radius:4px;">
                        
                        <div id="colorContainer" style="display:none;">
                            <label style="font-size:12px;">اختر اللون:</label>
                            <select name="color" id="cs" style="width:100%; padding:7px; margin:3px 0 8px 0; border:1px solid #ccc; border-radius:4px;"></select>
                        </div>
                        <div id="sizeContainer" style="display:none;">
                            <label style="font-size:12px;">اختر المقاس / القياس:</label>
                            <select name="size" id="ss" style="width:100%; padding:7px; margin:3px 0 8px 0; border:1px solid #ccc; border-radius:4px;"></select>
                        </div>

                        <button type="submit" style="width:100%; background:#25d366; color:#fff; padding:10px; border:none; border-radius:5px; font-weight:bold; margin-top:8px; cursor:pointer; font-size:14px;">إرسال الطلب عبر واتساب 🚀</button>
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

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

app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({
        "name": "ClickShop", "short_name": "ClickShop", "start_url": "/", "display": "standalone",
        "background_color": "#f3f4f6", "theme_color": "#008060",
        "icons": [{"src": db.siteSettings.logoUrl, "sizes": "192x192", "type": "image/png"}]
    }));
});

app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`self.addEventListener('fetch', (e) => { e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); });`);
});

const states = ["01. أدرار", "02. الشلف", "03. الأغواط", "04. أم البواقي", "05. باتنة", "06. بجاية", "07. بسكرة", "08. بشار", "09. البليدة", "10. البويرة", "11. تمنراست", "12. تبسة", "13. تلمسان", "14. تيارت", "15. تيزي وزو", "16. الجزائر", "17. الجلفة", "18. جيجل", "19. سطيف", "20. سعيدة", "21. سكيكدة", "22. سيدي بلعباس", "23. عنابة", "24. قالمة", "25. قسنطينة", "26. المدية", "27. مستغانم", "28. المسيلة", "29. معسكر", "30. ورقلة", "31. وهران", "32. البيض", "33. إليزي", "34. برج بوعريريج", "35. بومرداس", "36. الطارف", "37. تندوف", "38. تسيمسيلت", "39. الوادي", "40. خنشلة", "41. سوق اهراس", "42. تيبازة", "43. ميلة", "44. عين الدفلى", "45. نعامة", "46. عين تيموشنت", "47. غرداية", "48. غليزان", "49. المغير", "50. المنيعة", "51. أولاد جلال", "52. برج باجي مختار", "53. بني عباس", "54. تيميمون", "55. تقرت", "56. جانت", "57. المغير", "58. المنيعة", "59. تيزي وزو", "60. برج عجيال", "61. مسعد", "62. أفلو", "63. الأبيضسيد الشيخ", "64. قصر الشلالة", "65. عين صالح", "66. عين قزام", "67. الرويسات", "68. مسيسة", "69. البرمة"];

// 12 لوناً احترافياً للمتاجر
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

// الصفحة الرئيسية (الاسم يوديك لدخول المدير، والزرين تحت بعضهما بوضوح)
app.get('/', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>ClickShop</title>
            <link rel="manifest" href="/manifest.json">
        </head>
        <body style="font-family:Tahoma; background:#f3f4f6; padding:40px; text-align:center; margin:0;">
            <div style="background:#fff; padding:40px; max-width:450px; margin:40px auto; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.1); text-align:center;">
                <h1 style="color:#008060; margin-bottom:10px; cursor:pointer;" onclick="window.location.href='/admin-login'" title="لوحة تحكم المدير العام">🛒 منصة ClickShop</h1>
                <p style="color:#666; margin-bottom:30px;">أنشئ متجرا إلكترونيا بكل سهولة وقم بإدارة أعمالك باحترافية</p>
                
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <a href="/register-page" style="display:block; background:#008060; color:#fff; padding:14px; border-radius:8px; text-decoration:none; font-weight:bold; box-shadow:0 2px 5px rgba(0,128,96,0.2);">إنشاء متجر جديد 🚀</a>
                    <a href="/login-store" style="display:block; background:#2563eb; color:#fff; padding:14px; border-radius:8px; text-decoration:none; font-weight:bold; box-shadow:0 2px 5px rgba(37,99,235,0.2);">تسجيل دخول التجار ⚙️</a>
                </div>
            </div>
        </body>
        </html>
    `);
});

// صفحة تسجيل دخول المدير العام بكلمة السر kenouni19
app.get('/admin-login', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>دخول المدير العام</title></head>
        <body style="font-family:Tahoma; background:#f3f4f6; padding:50px; text-align:center;">
            <div style="background:#fff; padding:30px; max-width:400px; margin:auto; border-radius:10px;">
                <h2 style="color:#008060;">لوحة تحكم المدير العام</h2>
                <p style="color:#666; font-size:13px;">أدخل كلمة المرور الخاصة بك</p>
                <form action="/admin-auth" method="POST">
                    <input type="password" name="adminPassword" placeholder="كلمة المرور السرية" required style="width:100%; padding:10px; margin:15px 0; border:1px solid #ccc; border-radius:5px;">
                    <button type="submit" style="width:100%; background:#008060; color:#fff; padding:10px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">دخول 🛠️</button>
                </form>
                <br><a href="/" style="color:#555; text-decoration:none; font-size:13px;">← عودة للرئيسية</a>
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
        <body style="font-family:Tahoma; background:#f3f4f6; padding:30px; text-align:center;">
            <div style="background:#fff; padding:30px; max-width:600px; margin:auto; border-radius:10px; text-align:right;">
                <h2 style="color:#008060; text-align:center;">لوحة تحكم المدير العام 🛠️</h2>
                <hr>
                <p><b>عدد المتاجر النشطة:</b> ${db.stores.length}</p>
                <p><b>الأكواد المفعلة:</b> ${db.activeCodes.length} كود متاح</p>
                <h3 style="margin-top:20px;">المتاجر المسجلة:</h3>
                ${db.stores.length === 0 ? '<p style="color:#666;">لا توجد متاجر بعد.</p>' : ''}
                ${db.stores.map(s => `<div style="background:#f9fafb; padding:10px; border:1px solid #ddd; border-radius:6px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;"><span><b>${s.storeName}</b> (${s.storeSlug})</span><a href="/store/${s.storeSlug}" target="_blank" style="background:#008060; color:#fff; padding:5px 10px; text-decoration:none; border-radius:4px; font-size:12px;">زيارة المتجر</a></div>`).join('')}
                <br><a href="/" style="display:block; text-align:center; color:#555; text-decoration:none; margin-top:20px;">← تسجيل الخروج للرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

// صفحة إنشاء المتجر مع 12 لوناً
app.get('/register-page', (req, res) => {
    res.send(`
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>إنشاء متجر</title></head>
        <body style="font-family:Tahoma; background:#f3f4f6; padding:30px; text-align:center;">
            <div style="background:#fff; padding:30px; max-width:450px; margin:auto; border-radius:10px; text-align:right;">
                <h2 style="color:#008060; text-align:center;">فتح متجر جديد</h2>
                <form action="/register" method="POST">
                    <label>كود التفعيل (8 خانات):</label>
                    <input type="text" name="activationCode" required style="width:100%; padding:10px; margin:8px 0; border:1px solid #ccc; border-radius:5px;">
                    
                    <label>اسم المتجر:</label>
                    <input type="text" name="storeName" required style="width:100%; padding:10px; margin:8px 0; border:1px solid #ccc; border-radius:5px;">
                    
                    <label>رابط المتجر (Slug بالإنجليزية):</label>
                    <input type="text" name="storeSlug" required style="width:100%; padding:10px; margin:8px 0; border:1px solid #ccc; border-radius:5px;">
                    
                    <label>مجال المتجر:</label>
                    <input type="text" name="storeCategory" required style="width:100%; padding:10px; margin:8px 0; border:1px solid #ccc; border-radius:5px;">
                    
                    <label>لون واجهة المتجر (12 لوناً):</label>
                    <select name="storeColor" style="width:100%; padding:10px; margin:8px 0; border:1px solid #ccc; border-radius:5px;">
                        ${storeColors.map(c => `<option value="${c.code}">${c.name}</option>`).join('')}
                    </select>
                    
                    <label>اسم المالك:</label>
                    <input type="text" name="ownerName" required style="width:100%; padding:10px; margin:8px 0; border:1px solid #ccc; border-radius:5px;">
                    
                    <label>كلمة المرور:</label>
                    <input type="password" name="password" required style="width:100%; padding:10px; margin:8px 0; border:1px solid #ccc; border-radius:5px;">
                    
                    <button type="submit" style="background:#008060; color:#fff; border:none; padding:12px; width:100%; font-weight:bold; border-radius:5px; cursor:pointer; margin-top:15px;">إنشاء المتجر 🚀</button>
                </form>
                <br><a href="/" style="display:block; text-align:center; color:#555; text-decoration:none;">الرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/login-store', (req, res) => {
    res.send(`<html dir="rtl"><head><meta charset="UTF-8"><title>دخول التاجر</title></head><body style="font-family:Tahoma; background:#f3f4f6; padding:40px; text-align:center;"><div style="background:#fff; padding:30px; max-width:450px; margin:auto; border-radius:10px; text-align:right;"><h2 style="color:#008060; text-align:center;">اختر متجرك للدخول</h2>${db.stores.length === 0 ? '<p style="text-align:center; color:#666;">لا توجد متاجر مسجلة بعد.</p>' : ''}${db.stores.map(s => `<div style="background:#f9fafb; padding:12px; border:1px solid #ddd; border-radius:6px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;"><span><b>${s.storeName}</b></span><a href="/store/${s.storeSlug}/login" style="background:#2563eb; color:#fff; padding:6px 12px; text-decoration:none; border-radius:4px; font-size:13px;">دخول ⚙️</a></div>`).join('')}<br><a href="/" style="display:block; text-align:center; color:#555; text-decoration:none;">الرئيسية</a></div></body></html>`);
});

app.post('/register', (req, res) => {
    const { activationCode, storeName, storeSlug, storeCategory, storeColor, ownerName, password } = req.body;
    const idx = db.activeCodes.indexOf(activationCode);
    if (idx === -1) return res.send('كود التفعيل غير صالح أو مستعمل! <a href="/register-page">عودة</a>');
    if (db.stores.find(s => s.storeSlug === storeSlug)) return res.send('رابط المتجر محجوز مسبقاً. <a href="/register-page">عودة</a>');
    const expiry = new Date(); expiry.setMonth(expiry.getMonth() + 6);
    db.stores.push({ activationCode, storeName, storeSlug, storeCategory, storeColor: storeColor || '#008060', ownerName, password, whatsapp: "213700000000", telegramChatId: "", logoUrl: "https://i.ibb.co/6P82W8h/default-avatar.png", products: [], orders: [], expiryDate: expiry.toISOString() });
    db.activeCodes.splice(idx, 1);
    db.usedCodes.push(activationCode);
    saveDB();
    res.send(`<html dir="rtl"><body style="font-family:Tahoma; text-align:center; padding:50px;"><div style="background:#fff; padding:30px; max-width:450px; margin:auto; border-radius:10px;"><h2 style="color:#008060;">مبروك ${ownerName}! تم إنشاء المتجر 🚀</h2><a href="/store/${storeSlug}" style="display:inline-block; background:#2563eb; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">فتح المتجر 🛒</a><br><br><a href="/store/${storeSlug}/login" style="display:inline-block; background:#008060; color:#fff; padding:10px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">لوحة التحكم ⚙️</a></div></body></html>`);
});

app.get('/store/:slug/login', (req, res) => {
    res.send(`<html dir="rtl"><head><meta charset="UTF-8"><title>دخول التاجر</title></head><body style="font-family:Tahoma; background:#f3f4f6; padding:50px; text-align:center;"><div style="background:#fff; padding:30px; max-width:400px; margin:auto; border-radius:10px;"><h2>كلمة مرور المتجر</h2><form action="/store/${req.params.slug}/auth" method="POST"><input type="password" name="password" required style="width:100%; padding:10px; margin:15px 0; border:1px solid #ccc; border-radius:5px;"><button type="submit" style="width:100%; background:#008060; color:#fff; padding:10px; border:none; border-radius:5px; font-weight:bold; cursor:pointer;">دخول</button></form><br><a href="/login-store" style="color:#555; text-decoration:none; font-size:13px;">← اختيار متجر آخر</a></div></body></html>`);
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
    res.send(`<html dir="rtl"><head><meta charset="UTF-8"><title>لوحة تحكم ${store.storeName}</title></head><body style="font-family:Tahoma; background:#f3f4f6; padding:20px; text-align:center;"><div style="background:#fff; padding:25px; max-width:700px; margin:auto; border-radius:10px; text-align:right;"><div style="display:flex; justify-content:space-between; margin-bottom:15px;"><a href="/store/${store.storeSlug}" target="_blank" style="background:#2563eb; color:#fff; padding:8px 15px; text-decoration:none; border-radius:5px;">معاينة المتجر 🛒</a><a href="/" style="background:#4b5563; color:#fff; padding:8px 15px; text-decoration:none; border-radius:5px;">الرئيسية 🏠</a></div><h2 style="color:${store.storeColor || '#008060'}; text-align:center;">لوحة تحكم: ${store.storeName}</h2><hr><h3>إضافة منتج (العدد: ${store.products.length}/10)</h3>${store.products.length >= 10 ? '<p style="color:red;">بلغت الحد الأقصى.</p>' : `<form action="/store/${store.storeSlug}/add-product" method="POST"><input type="text" name="productName" placeholder="اسم المنتج" required style="width:100%; padding:8px; margin:5px 0; border:1px solid #ccc; border-radius:5px;"><input type="text" name="productPrice" placeholder="السعر (دج)" required style="width:100%; padding:8px; margin:5px 0; border:1px solid #ccc; border-radius:5px;"><input type="text" name="productImage" placeholder="رابط صورة المنتج" required style="width:100%; padding:8px; margin:5px 0; border:1px solid #ccc; border-radius:5px;"><input type="text" name="colors" value="أسود، أبيض" required style="width:100%; padding:8px; margin:5px 0; border:1px solid #ccc; border-radius:5px;"><input type="text" name="sizes" value="قياس موحد" required style="width:100%; padding:8px; margin:5px 0; border:1px solid #ccc; border-radius:5px;"><button type="submit" style="background:${store.storeColor || '#008060'}; color:#fff; border:none; padding:10px; width:100%; font-weight:bold; margin-top:10px; cursor:pointer; border-radius:5px;">إضافة المنتج ➕</button></form>`}<h3 style="margin-top:25px;">المنتجات</h3>${store.products.map((p, i) => `<div style="background:#f9fafb; padding:10px; border:1px solid #ddd; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;"><span><b>${p.name}</b> - ${p.price}دج</span><form action="/store/${store.storeSlug}/delete-product" method="POST" style="margin:0;"><input type="hidden" name="productIndex" value="${i}"><button type="submit" style="background:red; color:#fff; border:none; padding:5px 10px; cursor:pointer; border-radius:4px;">حذف</button></form></div>`).join('')}</div></body></html>`);
});

app.post('/store/:slug/add-product', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (store && store.products.length < 10) {
        store.products.push({ name: req.body.productName, price: req.body.productPrice, image: req.body.productImage, colors: req.body.colors, sizes: req.body.sizes });
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

app.post('/store/:slug/checkout', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (!store) return res.send('المتجر غير موجود');
    const { productName, price, firstName, lastName, phone, state, color, size } = req.body;
    const trackingId = 'TRK-' + Math.floor(100000 + Math.random() * 900000);
    store.orders.push({ trackingId, productName, price, firstName, lastName, phone, state, color, size });
    saveDB();
    const wa = `السلام عليكم، طلب جديد:%0A- التتبع: #${trackingId}%0A- الاسم: ${firstName} ${lastName}%0A- الهاتف: ${phone}%0A- الولاية: ${state}%0A- المنتج: ${productName} (${price}دج)%0A- اللون: ${color}%0A- المقاس: ${size}`;
    res.send(`<html dir="rtl"><body style="font-family:Tahoma; text-align:center; padding:50px;"><div style="background:#fff; padding:30px; max-width:450px; margin:auto; border-radius:10px;"><h2 style="color:${store.storeColor || '#008060'};">تم إرسال الطلب بنجاح!</h2><a href="https://wa.me/${store.whatsapp}?text=${wa}" style="display:inline-block; background:#25d366; color:#fff; padding:12px 20px; text-decoration:none; border-radius:5px; font-weight:bold;">تأكيد عبر واتساب التاجر 📱</a></div><script>setTimeout(()=>{window.location.href="https://wa.me/${store.whatsapp}?text=${wa}";},2000);</script></body></html>`);
});

// واجهة متجر الزبون (تأخذ اللون المخصص الذي اختاره التاجر)
app.get('/store/:slug', (req, res) => {
    const store = db.stores.find(s => s.storeSlug === req.params.slug);
    if (!store) return res.status(404).send('المتجر غير موجود');
    const themeColor = store.storeColor || '#008060';
    res.send(`
        <html dir="rtl">
        <head><meta charset="UTF-8"><title>${store.storeName}</title></head>
        <body style="font-family:Tahoma; background:#f9fafb; margin:0; text-align:center;">
            <header style="background:${themeColor}; color:#fff; padding:20px; display:flex; justify-content:space-between; align-items:center; padding-left:20px; padding-right:20px;">
                <h1 style="font-size:20px; margin:0;">🛒 ${store.storeName}</h1>
                <a href="/store/${store.storeSlug}/login" style="background:rgba(255,255,255,0.2); color:#fff; padding:6px 12px; text-decoration:none; border-radius:5px; font-size:13px;">لوحة التحكم ⚙️</a>
            </header>
            <div style="max-width:800px; margin:30px auto; background:#fff; padding:25px; border-radius:10px; text-align:right;">
                <h3 style="text-align:center; color:${themeColor};">قائمة المنتجات</h3>
                ${store.products.length === 0 ? '<p style="text-align:center; color:#666;">لا توجد منتجات.</p>' : ''}
                ${store.products.map(p => `
                    <div style="background:#f3f4f6; padding:15px; border-radius:8px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${p.image}" style="width:60px; height:60px; object-fit:cover; border-radius:6px;">
                            <div>
                                <h4 style="margin:0 0 5px 0;">${p.name}</h4>
                                <span style="color:${themeColor}; font-weight:bold;">${p.price} دج</span>
                                <div style="font-size:12px; color:#555;">ألوان: ${p.colors} | قياسات: ${p.sizes}</div>
                            </div>
                        </div>
                        <button onclick="openModal('${p.name}', '${p.price}', '${p.colors}', '${p.sizes}')" style="background:${themeColor}; color:#fff; border:none; padding:10px 15px; border-radius:5px; font-weight:bold; cursor:pointer;">اطلب الآن 🛍️</button>
                    </div>
                `).join('')}
            </div>

            <div id="m" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); justify-content:center; align-items:center;">
                <div style="background:#fff; padding:25px; border-radius:10px; width:90%; max-width:400px; text-align:right;">
                    <button onclick="document.getElementById('m').style.display='none'" style="background:red; color:#fff; border:none; padding:5px 10px; float:left; cursor:pointer; border-radius:4px;">إغلاق</button>
                    <h3>إتمام الطلب</h3>
                    <form action="/store/${store.storeSlug}/checkout" method="POST">
                        <input type="hidden" name="productName" id="pn">
                        <input type="hidden" name="price" id="pp">
                        <label>الاسم:</label><input type="text" name="firstName" required style="width:100%; padding:8px; margin:5px 0; border:1px solid #ccc; border-radius:4px;">
                        <label>اللقب:</label><input type="text" name="lastName" required style="width:100%; padding:8px; margin:5px 0; border:1px solid #ccc; border-radius:4px;">
                        <label>الهاتف:</label><input type="text" name="phone" required style="width:100%; padding:8px; margin:5px 0; border:1px solid #ccc; border-radius:4px;">
                        <label>الولاية:</label>
                        <select name="state" required style="width:100%; padding:8px; margin:5px 0; border:1px solid #ccc; border-radius:4px;">
                            <option value="">اختر الولاية</option>
                            ${states.map(st => `<option value="${st}">${st}</option>`).join('')}
                        </select>
                        <label>اللون:</label><select name="color" id="cs" required style="width:100%; padding:8px; margin:5px 0; border:1px solid #ccc; border-radius:4px;"></select>
                        <label>القياس:</label><select name="size" id="ss" required style="width:100%; padding:8px; margin:5px 0; border:1px solid #ccc; border-radius:4px;"></select>
                        <button type="submit" style="width:100%; background:#25d366; color:#fff; padding:12px; border:none; border-radius:5px; font-weight:bold; margin-top:10px; cursor:pointer;">إرسال الطلب 🚀</button>
                    </form>
                </div>
            </div>

            <script>
                function openModal(n,p,cols,szs){
                    document.getElementById('pn').value=n;
                    document.getElementById('pp').value=p;
                    let c=document.getElementById('cs'); c.innerHTML='';
                    cols.split(',').forEach(x=>{ let o=document.createElement('option'); o.value=x.trim(); o.innerHTML=x.trim(); c.appendChild(o); });
                    let s=document.getElementById('ss'); s.innerHTML='';
                    szs.split(',').forEach(x=>{ let o=document.createElement('option'); o.value=x.trim(); o.innerHTML=x.trim(); s.appendChild(o); });
                    document.getElementById('m').style.display='flex';
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });

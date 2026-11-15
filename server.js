const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir, { recursive: true });
}

let stores = [];

let siteSettings = {
    logoUrl: "https://i.ibb.co/6P82W8h/default-avatar.png",
    whatsapp: "213700000000",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
    telegram: "https://t.me"
};

let activeCodes = [
    "CS-9X4F-7B2K", "CS-3M8R-9P1W", "CS-5V2X-4H8N", "CS-1K9L-6D3Z", "CS-8T4Y-2F5X",
    "CS-6C3W-8J9M", "CS-2H7P-1Q4V", "CS-4N1Z-5K6B", "CS-7D9F-3X2R", "CS-9L2K-8M7T",
    "CS-3W5H-4P1Y", "CS-1V8X-9N6C", "CS-5R2J-7Z3Q", "CS-8F4M-6B1K", "CS-2P9T-5W4D",
    "CS-6X3K-8H7N", "CS-4Z1V-9Q2R", "CS-7M5W-1F8L", "CS-9B6Y-2D3P", "CS-3K8F-4X9T",
    "CS-1H2N-7J6C", "CS-5Q4R-3V1Z", "CS-8W9X-6M2K", "CS-2D7L-5P8H", "CS-6F1T-9B4W",
    "CS-4V3Y-8Z2F", "CS-7K9P-1N5X", "CS-9R2M-4H3Q", "CS-3X6C-7D1L", "CS-1T5V-8K9B"
];

let usedCodes = [];

const algerianStates = [
    "01. أدرار", "02. الشلف", "03. الأغواط", "04. أم البواقي", "05. باتنة", "06. بجاية", "07. بسكرة", "08. بشار", "09. البليدة", "10. البويرة",
    "11. تمنراست", "12. تبسة", "13. تلمسان", "14. تيارت", "15. تيزي وزو", "16. الجزائر", "17. الجلفة", "18. جيجل", "19. سطيف", "20. سعيدة",
    "21. سكيكدة", "22. سيدي بلعباس", "23. عنابة", "24. قالمة", "25. قسنطينة", "26. المدية", "27. مستغانم", "28. المسيلة", "29. معسكر", "30. ورقلة",
    "31. وهران", "32. البيض", "33. إليزي", "34. برج بوعريريج", "35. بومرداس", "36. الطارف", "37. تندوف", "38. تسيمسيلت", "39. الوادي", "40. خنشلة",
    "41. سوق اهراس", "42. تيبازة", "43. ميلة", "44. عين الدفلى", "45. نعامة", "46. عين تيموشنت", "47. غرداية", "48. غليزان", "49. المغير", "50. المنيعة",
    "51. أولاد جلال", "52. برج باجي مختار", "53. بني عباس", "54. تيميمون", "55. تقرت", "56. جانت", "57. المغير", "58. المنيعة",
    "59. تيزي وزو (جديدة)", "60. برج عجيال", "61. مسعد", "62. أفلو", "63. الأبيضسيد الشيخ", "64. قصر الشلالة", "65. عين صالح", "66. عين قزام", "67. الرويسات", "68. مسيسة", "69. البرمة"
];

app.get('/api/settings', (req, res) => {
    res.json(siteSettings);
});

app.post('/admin/settings', (req, res) => {
    const { whatsapp, instagram, facebook, telegram, base64Logo } = req.body;
    if (base64Logo) {
        try {
            const matches = base64Logo.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches && matches.length === 3) {
                const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
                const bitmap = Buffer.from(matches[2], 'base64');
                const filename = `logo-${Date.now()}.${ext}`;
                fs.writeFileSync(path.join(uploadDir, filename), bitmap);
                siteSettings.logoUrl = `/uploads/${filename}`;
            }
        } catch (e) { console.log(e); }
    }
    if (whatsapp) siteSettings.whatsapp = whatsapp;
    if (instagram) siteSettings.instagram = instagram;
    if (facebook) siteSettings.facebook = facebook;
    if (telegram) siteSettings.telegram = telegram;
    res.redirect('/admin/dashboard');
});

// تسجيل متجر جديد مع حساب مدة الصلاحية (6 أشهر)
app.post('/register', (req, res) => {
    const { activationCode, storeName, storeSlug, storeCategory, storeColor, ownerName, password } = req.body;
    const codeIndex = activeCodes.indexOf(activationCode);
    
    if (codeIndex === -1) {
        return res.status(400).send(`<html dir="rtl" lang="ar"><body style="font-family:Tahoma; text-align:center; padding:50px;"><h2>كود التفعيل غير صالح أو مستعمل!</h2><a href="/">العودة</a></body></html>`);
    }

    const slugExists = stores.find(s => s.storeSlug === storeSlug);
    if (slugExists) {
        return res.status(400).send('رابط المتجر محجوز مسبقاً.');
    }

    // حساب تاريخ انتهاء الاشتراك بعد 6 أشهر من اليوم
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6);

    stores.push({ 
        activationCode, 
        storeName, 
        storeSlug, 
        storeCategory, 
        storeColor, 
        ownerName, 
        password,
        whatsapp: "213700000000",
        logoUrl: "https://i.ibb.co/6P82W8h/default-avatar.png",
        products: [],
        orders: [],
        expiryDate: expiryDate.toISOString() // حفظ تاريخ انتهاء الباقة
    });

    activeCodes.splice(codeIndex, 1);
    usedCodes.push(activationCode);

    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>تم الانشاء بنجاح</title></head>
        <body style="font-family: Tahoma; text-align: center; padding: 50px; background: #f3f4f6;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 450px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #008060;">مبروك يا زكرياء! تم إنشاء المتجر بنجاح 🚀</h2>
                <p style="margin-top: 15px;">اسم المتجر: <b>${storeName}</b></p>
                <p style="color: #2563eb; font-size:14px; margin-top:5px;">الباقة المبدئية: 10 منتجات (صالحة لمدة 6 أشهر)</p>
                <p style="margin-top: 10px;">رابط المتجر الكامل:</p>
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
        <head><meta charset="UTF-8"><title>لوحة تحكم المنصة</title>
        <style>
            body { font-family: Tahoma; background: #f3f4f6; padding: 20px; text-align: center; }
            .box { background: #fff; padding: 25px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-bottom: 20px; text-align: right; }
            .box h2, .box h3 { text-align: center; }
            ul { padding-right: 20px; max-height: 130px; overflow-y: auto; background: #f9fafb; padding: 10px; border-radius: 5px; border: 1px solid #e5e7eb; }
            li { margin-bottom: 5px; font-family: monospace; font-size: 14px; }
            .form-group { margin-bottom: 12px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px; }
            input { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 5px; }
            .btn { background: #008060; color: white; border: none; padding: 10px; width: 100%; font-weight: bold; border-radius: 5px; cursor: pointer; margin-top: 10px; }
        </style>
        </head>
        <body>
            <div class="box">
                <h2 style="color: #008060;">لوحة تحكم مدير منصة ClickShop</h2>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                <h3 style="color: #2563eb; margin-bottom: 15px;">إعدادات الشعار العام ومواقع التواصل</h3>
                <form action="/admin/settings" method="POST">
                    <div class="form-group"><label>شعار المنصة:</label><input type="file" accept="image/*" onchange="let r = new FileReader(); r.onload = ()=>document.getElementById('b64').value=r.result; r.readAsDataURL(this.files[0]);"><input type="hidden" name="base64Logo" id="b64"></div>
                    <div class="form-group"><label>الواتساب:</label><input type="text" name="whatsapp" value="${siteSettings.whatsapp}"></div>
                    <div class="form-group"><label>إنستغرام:</label><input type="text" name="instagram" value="${siteSettings.instagram}"></div>
                    <div class="form-group"><label>فيسبوك:</label><input type="text" name="facebook" value="${siteSettings.facebook}"></div>
                    <div class="form-group"><label>تلغرام:</label><input type="text" name="telegram" value="${siteSettings.telegram}"></div>
                    <button type="submit" class="btn">حفظ الإعدادات 💾</button>
                </form>
            </div>
            <div class="box">
                <h3 style="color: #059669;">المتاجر المسجلة (${stores.length}):</h3>
                <ul>
                    ${stores.map(s => `<li><b>${s.storeName}</b> (ينتهي في: ${new Date(s.expiryDate).toLocaleDateString()}) - <a href="/store/${s.storeSlug}" target="_blank">رابط</a> | <a href="/store/${s.storeSlug}/login">التحكم</a></li>`).join('')}
                </ul>
            </div>
        </body>
        </html>
    `);
});

app.get('/store/:slug/login', (req, res) => {
    const slug = req.params.slug;
    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>تسجيل دخول التاجر</title>
        <style>body{font-family:Tahoma; background:#f3f4f6; padding:50px; text-align:center;} .card{background:#fff; padding:30px; max-width:400px; margin:auto; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);}</style>
        </head>
        <body>
            <div class="card">
                <h2>تسجيل دخول لوحة المتجر</h2>
                <form action="/store/${slug}/auth" method="POST">
                    <input type="password" name="password" placeholder="أدخل كلمة مرور متجرك" required style="width:100%; padding:10px; margin:15px 0; border:1px solid #ccc; border-radius:5px;">
                    <button type="submit" style="width:100%; background:#008060; color:#fff; padding:10px; border:none; border-radius:5px; font-weight:bold;">دخول</button>
                </form>
            </div>
        </body>
        </html>
    `);
});

app.post('/store/:slug/auth', (req, res) => {
    const slug = req.params.slug;
    const { password } = req.body;
    const store = stores.find(s => s.storeSlug === slug);
    if (store && store.password === password) {
        res.redirect(`/store/${slug}/dashboard`);
    } else {
        res.send(`<script>alert('كلمة المرور خاطئة!'); window.location.href='/store/${slug}/login';</script>`);
    }
});

// لوحة تحكم التاجر مع التحقق من انتهاء الصلاحية وسقف الـ 10 منتجات
app.get('/store/:slug/dashboard', (req, res) => {
    const slug = req.params.slug;
    const store = stores.find(s => s.storeSlug === slug);
    if (!store) return res.send('المتجر غير موجود');

    // التحقق هل انتهت فترة الـ 6 أشهر؟
    const isExpired = new Date() > new Date(store.expiryDate);

    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>لوحة تحكم ${store.storeName}</title>
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
            .alert-expired { background: #fee2e2; color: #b91c1c; padding: 15px; border-radius: 5px; text-align: center; font-weight: bold; margin-bottom: 15px; }
        </style>
        </head>
        <body>
            <div class="box">
                <h2 style="color: #008060;">
                    <img src="${store.logoUrl}" class="logo-preview">
                    لوحة تحكم متجر: ${store.storeName}
                </h2>
                <p style="text-align:center; font-size:13px; color:#555;">تاريخ انتهاء الاشتراك: <b>${new Date(store.expiryDate).toLocaleDateString()}</b></p>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                
                ${isExpired ? `
                    <div class="alert-expired">
                        ⚠️ انتهت صلاحية اشتراك متجرك (6 أشهر)! يرجى التواصل مع الإدارة لتجديد الباقة واستئناف إضافة المنتجات.
                    </div>
                ` : `
                    <h3>إعدادات المتجر (واتساب والشعار)</h3>
                    <form action="/store/${slug}/update-settings" method="POST">
                        <label style="font-size:12px; font-weight:bold;">رقم الواتساب الخاص بك:</label>
                        <input type="text" name="whatsapp" value="${store.whatsapp}" required>
                        <label style="font-size:12px; font-weight:bold;">تغيير الشعار:</label>
                        <input type="file" accept="image/*" onchange="let r = new FileReader(); r.onload = ()=>document.getElementById('logoB64').value=r.result; r.readAsDataURL(this.files[0]);">
                        <input type="hidden" name="logoB64" id="logoB64">
                        <button type="submit" class="btn">حفظ الإعدادات 💾</button>
                    </form>

                    <h3 style="margin-top: 25px;">إضافة منتج جديد (العدد الحالي: ${store.products.length} / 10 بحد أقصى)</h3>
                    ${store.products.length >= 10 ? `
                        <p style="color: #dc2626; font-weight: bold; text-align: center;">لقد وصلت للحد الأقصى للباقة (10 منتجات). قم بحذف منتج لإضافة غيره أو تواصل لترقية الباقة.</p>
                    ` : `
                        <form action="/store/${slug}/add-product" method="POST">
                            <input type="text" name="productName" placeholder="اسم المنتج" required>
                            <input type="text" name="productPrice" placeholder="السعر (دج)" required>
                            <label style="font-size:12px; font-weight:bold;">نوع القياسات:</label>
                            <select name="sizeType">
                                <option value="shoes">أحذية (أرقام: 36 إلى 45)</option>
                                <option value="clothes">ملابس (أحجام: S إلى XXL)</option>
                                <option value="none">بدون قياس (حجم موحد)</option>
                            </select>
                            <button type="submit" class="btn">إضافة المنتج ➕</button>
                        </form>
                    `}
                `}

                <h3 style="margin-top: 25px;">قائمة المنتجات (${store.products.length})</h3>
                <div>
                    ${store.products.length === 0 ? '<p style="text-align:center; color:#666;">لا توجد منتجات حالياً.</p>' : ''}
                    ${store.products.map((p, index) => `
                        <div class="product-item">
                            <span><b>${p.name}</b> - ${p.price} دج</span>
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
                            <p style="margin:3px 0;"><b>الطلب:</b> ${o.productName} - ${o.price} دج (لون: ${o.color}, مقاس: ${o.size})</p>
                        </div>
                    `).join('')}
                </div>
                <br>
                <a href="/store/${slug}" target="_blank" style="display:block; text-align:center; background:#2563eb; color:#fff; padding:10px; text-decoration:none; border-radius:5px; font-weight:bold;">معاينة المتجر 🛒</a>
            </div>
        </body>
        </html>
    `);
});

app.post('/store/:slug/update-settings', (req, res) => {
    const slug = req.params.slug;
    const store = stores.find(s => s.storeSlug === slug);
    const { whatsapp, logoB64 } = req.body;
    if (store) {
        if (whatsapp) store.whatsapp = whatsapp;
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
            } catch (e) { console.log(e); }
        }
    }
    res.redirect(`/store/${slug}/dashboard`);
});

// إضافة منتج مع التحقق من سقف الـ 10 منتجات وصلاحية الـ 6 أشهر
app.post('/store/:slug/add-product', (req, res) => {
    const slug = req.params.slug;
    const store = stores.find(s => s.storeSlug === slug);
    if (!store) return res.send('المتجر غير موجود');

    const isExpired = new Date() > new Date(store.expiryDate);
    if (isExpired || store.products.length >= 10) {
        return res.send(`<script>alert('عذراً، إما أن اشتراكك انتهى أو أنك بلغت الحد الأقصى (10 منتجات).'); window.location.href='/store/${slug}/dashboard';</script>`);
    }

    const { productName, productPrice, sizeType } = req.body;
    if (productName && productPrice) {
        store.products.push({ name: productName, price: productPrice, sizeType: sizeType || 'none' });
    }
    res.redirect(`/store/${slug}/dashboard`);
});

app.post('/store/:slug/delete-product', (req, res) => {
    const slug = req.params.slug;
    const store = stores.find(s => s.storeSlug === slug);
    const { productIndex } = req.body;
    if (store && productIndex !== undefined) {
        store.products.splice(parseInt(productIndex), 1);
    }
    res.redirect(`/store/${slug}/dashboard`);
});

app.get('/store/:slug/print-order/:trackingId', (req, res) => {
    const { slug, trackingId } = req.params;
    const store = stores.find(s => s.storeSlug === slug);
    if (!store) return res.send('المتجر غير موجود');
    const order = store.orders.find(o => o.trackingId === trackingId);
    if (!order) return res.send('الطلب غير موجود');

    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>بوليصة شحن - #${order.trackingId}</title>
        <style>
            body { font-family: Tahoma; padding: 20px; text-align: center; background: #fff; color: #000; }
            .invoice { border: 2px dashed #000; padding: 20px; max-width: 400px; margin: auto; text-align: right; }
            h2 { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; }
            p { font-size: 16px; margin: 8px 0; }
            @media print { .no-print { display: none; } }
        </style>
        </head>
        <body onload="window.print()">
            <div class="invoice">
                <h2>📦 بوليصة شحن - ${store.storeName}</h2>
                <p><b>رقم التتبع:</b> #${order.trackingId}</p>
                <hr>
                <p><b>الاسم:</b> ${order.firstName} ${order.lastName}</p>
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
    const store = stores.find(s => s.storeSlug === slug);
    if (!store) return res.send('المتجر غير موجود');

    const { productName, price, firstName, lastName, phone, state, color, size, type } = req.body;
    const trackingId = 'TRK-' + Math.floor(100000 + Math.random() * 900000);

    store.orders.push({ trackingId, productName, price, firstName, lastName, phone, state, color, size, type });

    const whatsappMsg = `السلام عليكم، أود تأكيد طلبي:%0A- رقم التتبع: #${trackingId}%0A- الاسم: ${firstName} ${lastName}%0A- الهاتف: ${phone}%0A- الولاية: ${state}%0A- المنتج: ${productName} (${price}دج)%0A- اللون: ${color}%0A- القياس: ${size}`;
    
    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>تم إرسال الطلب</title></head>
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

app.get('/store/:slug', (req, res) => {
    const storeSlug = req.params.slug;
    const store = stores.find(s => s.storeSlug === storeSlug);
    if (!store) return res.status(404).send('المتجر غير موجود');

    res.send(`
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>${store.storeName}</title>
            <style>
                body { font-family: Tahoma; background: #f9fafb; margin: 0; padding: 0; text-align: center; }
                header { background: ${store.storeColor.includes('أسود') ? '#111' : store.storeColor.includes('أزرق') ? '#1e3a8a' : store.storeColor.includes('أحمر') ? '#b91c1c' : '#008060'}; color: white; padding: 30px; display: flex; align-items: center; justify-content: center; gap: 15px; }
                .store-logo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; border: 2px solid white; }
                .container { max-width: 800px; margin: 40px auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05); text-align: right; }
                .product-card { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; }
                .buy-btn { background: #008060; color: white; border: none; padding: 10px 20px; border-radius: 5px; font-weight: bold; cursor: pointer; }
                .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; }
                .modal-content { background: #fff; padding: 25px; border-radius: 10px; width: 90%; max-width: 450px; text-align: right; box-shadow: 0 4px 15px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto; }
                input, select { width: 100%; padding: 10px; margin: 8px 0; border: 1px solid #ccc; border-radius: 5px; font-size: 14px; }
                .close-btn { background: #dc2626; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; float: left; }
            </style>
        </head>
        <body>
            <header>
                <img src="${store.logoUrl}" class="store-logo" alt="Logo">
                <div>
                    <h1 style="font-size: 28px; margin:0;">🛒 ${store.storeName}</h1>
                    <p style="margin:5px 0 0 0; font-size:14px; opacity:0.9;">المالك: ${store.ownerName} | المجال: ${store.storeCategory}</p>
                </div>
            </header>
            <div class="container">
                <h3 style="text-align: center; color: #008060; margin-bottom: 20px;">قائمة المنتجات والسلع</h3>
                ${store.products.length === 0 ? '<p style="text-align:center; color:#666;">لم يتم إضافة منتجات بعد في هذا المتجر.</p>' : ''}
                ${store.products.map(p => `
                    <div class="product-card">
                        <div>
                            <h4 style="margin:0 0 5px 0; color:#1f2937;">${p.name}</h4>
                            <span style="color:#059669; font-weight:bold;">${p.price} دج</span>
                        </div>
                        <button class="buy-btn" onclick="openCheckout('${p.name}', '${p.price}', '${p.sizeType}')">اطلب الآن 🛍️</button>
                    </div>
                `).join('')}
            </div>

            <div id="checkoutModal" class="modal">
                <div class="modal-content">
                    <button class="close-btn" onclick="closeCheckout()">إغلاق X</button>
                    <h3 style="color: #008060; text-align:center; margin-bottom:15px;">إتمام الطلب</h3>
                    <form action="/store/${store.storeSlug}/checkout" method="POST">
                        <input type="hidden" name="productName" id="modalProductName">
                        <input type="hidden" name="price" id="modalProductPrice">
                        
                        <label>الاسم:</label>
                        <input type="text" name="firstName" placeholder="أدخل اسمك" required>
                        <label>اللقب:</label>
                        <input type="text" name="lastName" placeholder="أدخل لقبك" required>
                        <label>رقم الهاتف:</label>
                        <input type="text" name="phone" placeholder="07xxxxxxxx" required>
                        <label>الولاية (69 ولاية):</label>
                        <select name="state" required>
                            <option value="">اختر ولايتك</option>
                            ${algerianStates.map(state => `<option value="${state}">${state}</option>`).join('')}
                        </select>
                        <label>اللون:</label>
                        <input type="text" name="color" placeholder="مثال: أسود، أبيض..." required>
                        <label>القياس:</label>
                        <select name="size" id="sizeSelect" required></select>
                        <label>نوع المنتج:</label>
                        <input type="text" name="type" placeholder="مثال: صيفي، شتوي..." required>
                        <button type="submit" style="width:100%; background:#25d366; color:#fff; padding:12px; border:none; border-radius:5px; font-weight:bold; margin-top:15px; cursor:pointer;">إرسال الطلب وتأكيد عبر واتساب 🚀</button>
                    </form>
                </div>
            </div>

            <script>
                function openCheckout(name, price, sizeType) {
                    document.getElementById('modalProductName').value = name;
                    document.getElementById('modalProductPrice').value = price;
                    const sizeSelect = document.getElementById('sizeSelect');
                    sizeSelect.innerHTML = '';
                    if (sizeType === 'shoes') {
                        for (let i = 36; i <= 45; i++) {
                            let opt = document.createElement('option');
                            opt.value = i; opt.innerHTML = 'مقاس ' + i;
                            sizeSelect.appendChild(opt);
                        }
                    } else if (sizeType === 'clothes') {
                        ['S', 'M', 'L', 'XL', 'XXL'].forEach(sz => {
                            let opt = document.createElement('option');
                            opt.value = sz; opt.innerHTML = 'حجم ' + sz;
                            sizeSelect.appendChild(opt);
                        });
                    } else {
                        let opt = document.createElement('option');
                        opt.value = 'حجم موحد'; opt.innerHTML = 'حجم موحد (Standard)';
                        sizeSelect.appendChild(opt);
                    }
                    document.getElementById('checkoutModal').style.display = 'flex';
                }
                function closeCheckout() { document.getElementById('checkoutModal').style.display = 'none'; }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});

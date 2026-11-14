const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
// السماح بالوصول لمجلد الرفع لرؤية الصور المرفوعة
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// تأكد من وجود مجلد الرفع
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)){
    fs.existsSync(uploadDir) || fs.mkdirSync(uploadDir, { recursive: true });
}

let stores = [];

// إعدادات المنصة الافتراضية
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

app.get('/api/settings', (req, res) => {
    res.json(siteSettings);
});

// مسار تحديث الإعدادات (مع دعم رفع الصور مباشرة من الهاتف)
app.post('/admin/settings', (req, res) => {
    const { logoUrl, whatsapp, instagram, facebook, telegram, base64Logo } = req.body;
    
    // إذا قام المستخدم باختيار صورة جديدة من الهاتف كـ Base64
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
        } catch (e) {
            console.log("Error saving image:", e);
        }
    } else if (logoUrl) {
        siteSettings.logoUrl = logoUrl;
    }

    if (whatsapp) siteSettings.whatsapp = whatsapp;
    if (instagram) siteSettings.instagram = instagram;
    if (facebook) siteSettings.facebook = facebook;
    if (telegram) siteSettings.telegram = telegram;
    
    res.redirect('/admin/dashboard');
});

app.post('/register', (req, res) => {
    const { activationCode, storeName, storeSlug, storeCategory, storeColor, ownerName, password } = req.body;
    const codeIndex = activeCodes.indexOf(activationCode);
    
    if (codeIndex === -1) {
        return res.status(400).send(`
            <html dir="rtl" lang="ar">
            <body style="font-family: Tahoma; text-align: center; padding: 50px; background: #f3f4f6;">
                <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #dc2626;">خطأ في التفعيل!</h2>
                    <p style="margin-top: 15px;">كود التفعيل غير صالح، أو تم استخدامه من قبل.</p>
                    <a href="/" style="display: inline-block; margin-top: 20px; background: #008060; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">العودة</a>
                </div>
            </body>
            </html>
        `);
    }

    const slugExists = stores.find(s => s.storeSlug === storeSlug);
    if (slugExists) {
        return res.status(400).send('رابط المتجر محجوز مسبقاً.');
    }

    stores.push({ activationCode, storeName, storeSlug, storeCategory, storeColor, ownerName, password });
    activeCodes.splice(codeIndex, 1);
    usedCodes.push(activationCode);

    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>تم الانشاء بنجاح</title></head>
        <body style="font-family: Tahoma; text-align: center; padding: 50px; background: #f3f4f6;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #008060;">مبروك يا زكرياء! تم إنشاء المتجر بنجاح 🚀</h2>
                <p style="margin-top: 15px;">اسم المتجر: <b>${storeName}</b></p>
                <a href="/" style="display: inline-block; margin-top: 20px; background: #008060; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">العودة للرئيسية</a>
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
        res.status(401).json({ success: false, message: 'كلمة المرور خاطئة' });
    }
});

// لوحة التحكم مع زر اختيار الشعار من الاستوديو (Gallery)
app.get('/admin/dashboard', (req, res) => {
    res.send(`
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>لوحة التحكم - ClickShop</title>
            <style>
                body { font-family: Tahoma; background: #f3f4f6; padding: 20px; text-align: center; }
                .box { background: #fff; padding: 25px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-bottom: 20px; text-align: right; }
                .box h2, .box h3 { text-align: center; }
                ul { padding-right: 20px; max-height: 130px; overflow-y: auto; background: #f9fafb; padding: 10px; border-radius: 5px; border: 1px solid #e5e7eb; }
                li { margin-bottom: 5px; font-family: monospace; font-size: 14px; color: #1f2937; }
                .form-group { margin-bottom: 12px; }
                label { display: block; margin-bottom: 5px; font-weight: bold; font-size: 13px; color: #374151; }
                input { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 5px; font-size: 14px; }
                .btn { background: #008060; color: white; border: none; padding: 10px; width: 100%; font-weight: bold; border-radius: 5px; cursor: pointer; margin-top: 10px; }
                .btn:hover { background: #006e52; }
                .preview-logo { width: 60px; height: 60px; border-radius: 50%; object-fit: cover; display: block; margin: 10px auto; border: 2px solid #008060; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2 style="color: #008060;">لوحة تحكم مدير منصة ClickShop</h2>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                
                <h3 style="color: #2563eb; margin-bottom: 15px;">إعدادات الشعار ومواقع التواصل</h3>
                
                <div style="text-align: center; margin-bottom: 15px;">
                    <label>الشعار الحالي:</label>
                    <img src="${siteSettings.logoUrl}" class="preview-logo" alt="Current Logo">
                </div>

                <form action="/admin/settings" method="POST" id="settingsForm">
                    <div class="form-group">
                        <label>اختر صورة الشعار من الاستوديو (Gallery):</label>
                        <input type="file" id="imageInput" accept="image/*" onchange="convertImageToBase64(this)">
                        <input type="hidden" name="base64Logo" id="base64Logo">
                    </div>
                    <div class="form-group">
                        <label>رقم الواتساب:</label>
                        <input type="text" name="whatsapp" value="${siteSettings.whatsapp}" required>
                    </div>
                    <div class="form-group">
                        <label>رابط إنستغرام:</label>
                        <input type="text" name="instagram" value="${siteSettings.instagram}" required>
                    </div>
                    <div class="form-group">
                        <label>رابط فيسبوك:</label>
                        <input type="text" name="facebook" value="${siteSettings.facebook}" required>
                    </div>
                    <div class="form-group">
                        <label>رابط تلغرام:</label>
                        <input type="text" name="telegram" value="${siteSettings.telegram}" required>
                    </div>
                    <button type="submit" class="btn">حفظ وتحديث الإعدادات 💾</button>
                </form>
            </div>

            <div class="box">
                <h3 style="color: #059669;">الأكواد الصعبة المتاحة (${activeCodes.length}):</h3>
                <ul>
                    ${activeCodes.map(code => `<li>${code}</li>`).join('')}
                </ul>

                <h3 style="margin-top: 20px; color: #dc2626;">الأكواد المستعملة (${usedCodes.length}):</h3>
                <ul>
                    ${usedCodes.map(code => `<li>${code}</li>`).join('')}
                </ul>

                <h3 style="margin-top: 20px; color: #2563eb;">المتاجر المسجلة (${stores.length}):</h3>
                <ul>
                    ${stores.map(s => `<li><b>${s.storeName}</b> (${s.storeSlug}) - المالك: ${s.ownerName}</li>`).join('')}
                </ul>
            </div>

            <script>
                function convertImageToBase64(element) {
                    const file = element.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onloadend = function() {
                            document.getElementById('base64Logo').value = reader.result;
                        }
                        reader.readAsDataURL(file);
                    }
                }
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// --- قاعدة بيانات محلية مؤقتة (متاجر + 30 كود عشوائي وصعب) ---
let stores = [];

// 30 كود عشوائي، معقد، وغير مرتب تماماً
let activeCodes = [
    "CS-9X4F-7B2K", "CS-3M8R-9P1W", "CS-5V2X-4H8N", "CS-1K9L-6D3Z", "CS-8T4Y-2F5X",
    "CS-6C3W-8J9M", "CS-2H7P-1Q4V", "CS-4N1Z-5K6B", "CS-7D9F-3X2R", "CS-9L2K-8M7T",
    "CS-3W5H-4P1Y", "CS-1V8X-9N6C", "CS-5R2J-7Z3Q", "CS-8F4M-6B1K", "CS-2P9T-5W4D",
    "CS-6X3K-8H7N", "CS-4Z1V-9Q2R", "CS-7M5W-1F8L", "CS-9B6Y-2D3P", "CS-3K8F-4X9T",
    "CS-1H2N-7J6C", "CS-5Q4R-3V1Z", "CS-8W9X-6M2K", "CS-2D7L-5P8H", "CS-6F1T-9B4W",
    "CS-4V3Y-8Z2F", "CS-7K9P-1N5X", "CS-9R2M-4H3Q", "CS-3X6C-7D1L", "CS-1T5V-8K9B"
];

// الأكواد المستعملة
let usedCodes = [];

// --- مسار تسجيل متجر جديد ---
app.post('/register', (req, res) => {
    const { activationCode, storeName, storeSlug, storeCategory, storeColor, ownerName, password } = req.body;
    
    // التحقق هل الكود صالح وموجود في القائمة
    const codeIndex = activeCodes.indexOf(activationCode);
    
    if (codeIndex === -1) {
        return res.status(400).send(`
            <html dir="rtl" lang="ar">
            <body style="font-family: Tahoma; text-align: center; padding: 50px; background: #f3f4f6;">
                <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #dc2626;">خطأ في التفعيل!</h2>
                    <p style="margin-top: 15px;">كود التفعيل غير صالح، أو أنه تم استخدامه من قبل، أو غير موجود.</p>
                    <a href="/" style="display: inline-block; margin-top: 20px; background: #008060; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">العودة للمحاولة</a>
                </div>
            </body>
            </html>
        `);
    }

    const slugExists = stores.find(s => s.storeSlug === storeSlug);
    if (slugExists) {
        return res.status(400).send('رابط المتجر (Slug) محجوز مسبقاً، اختر رابطاً آخر.');
    }

    // حفظ المتجر
    stores.push({ activationCode, storeName, storeSlug, storeCategory, storeColor, ownerName, password });

    // سحب الكود من النشطة وإضافته للمستعملة (لا يمكن إعادة استخدامه)
    activeCodes.splice(codeIndex, 1);
    usedCodes.push(activationCode);

    res.send(`
        <html dir="rtl" lang="ar">
        <head><meta charset="UTF-8"><title>تم الانشاء بنجاح</title></head>
        <body style="font-family: Tahoma; text-align: center; padding: 50px; background: #f3f4f6;">
            <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #008060;">مبروك يا زكرياء! تم إنشاء المتجر بنجاح 🚀</h2>
                <p style="margin-top: 15px;">اسم المتجر: <b>${storeName}</b></p>
                <p>رابط المتجر: <b>/store/${storeSlug}</b></p>
                <a href="/" style="display: inline-block; margin-top: 20px; background: #008060; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">العودة للرئيسية</a>
            </div>
        </body>
        </html>
    `);
});

// --- نظام المشرف (Admin) بكلمة السر kenouni19 ---

app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'kenouni19') {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'كلمة المرور خاطئة' });
    }
});

// لوحة التحكم تعرض الأكواد الصعبة والمتاجر
app.get('/admin/dashboard', (req, res) => {
    res.send(`
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>لوحة التحكم - ClickShop</title>
            <style>
                body { font-family: Tahoma; background: #f3f4f6; padding: 20px; text-align: center; }
                .box { background: #fff; padding: 25px; border-radius: 10px; max-width: 600px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); margin-bottom: 20px; }
                ul { text-align: right; padding-right: 20px; max-height: 150px; overflow-y: auto; background: #f9fafb; padding: 10px; border-radius: 5px; border: 1px solid #e5e7eb; }
                li { margin-bottom: 5px; font-family: monospace; font-size: 14px; color: #1f2937; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2 style="color: #008060;">لوحة تحكم مدير منصة ClickShop</h2>
                <p>كلمة المرور المفعلة: <b>kenouni19</b></p>
                <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                
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
                    ${stores.map(s => `<li>${s.storeName} (${s.storeSlug}) - المالك: ${s.ownerName}</li>`).join('')}
                </ul>
            </div>
        </body>
        </html>
    `);
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is running smoothly on port ${PORT}`);
});

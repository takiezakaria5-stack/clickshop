const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware لتحليل البيانات ورابط الـ JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ربط مجلد الواجهة (public)
app.use(express.static(path.join(__dirname, 'public')));

// الاتصال بقاعدة بيانات MongoDB (استبدل الرابط برابطك السري إذا لزم الأمر، أو اتركه هكذا)
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://admin:admin123@cluster0.mongodb.net/clickshop?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.log('MongoDB Connection Error: ', err));

// نموذج تخزين المتاجر في قاعدة البيانات
const storeSchema = new mongoose.Schema({
    activationCode: String,
    storeName: String,
    storeSlug: { type: String, unique: true },
    storeCategory: String,
    storeColor: String,
    ownerName: String,
    password: String,
    createdAt: { type: Date, default: Date.now }
});

const Store = mongoose.model('Store', storeSchema);

// قائمة مؤقتة لتخزين الأكواد المولدة
let generatedCodes = [];

// --- مسار تسجيل متجر جديد ---
app.post('/register', async (req, res) => {
    try {
        const { activationCode, storeName, storeSlug, storeCategory, storeColor, ownerName, password } = req.body;
        
        // التحقق من كود التفعيل (يمكنك ربطه بالقائمة أو جعله إلزاميًا)
        const newStore = new Store({
            activationCode,
            storeName,
            storeSlug,
            storeCategory,
            storeColor,
            ownerName,
            password
        });

        await newStore.save();
        res.send(`
            <html dir="rtl" lang="ar">
            <head><meta charset="UTF-8"><title>تم الانشاء</title></head>
            <body style="font-family: Tahoma; text-align: center; padding: 50px; background: #f3f4f6;">
                <div style="background: white; padding: 30px; border-radius: 10px; max-width: 400px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #008060;">مبروك يا زكرياء! تم إنشاء المتجر بنجاح 🚀</h2>
                    <p style="margin-top: 15px;">رابط متجرك: <b>/store/${storeSlug}</b></p>
                    <a href="/" style="display: inline-block; margin-top: 20px; background: #008060; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">العودة للرئيسية</a>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        res.status(400).send('حدث خطأ أثناء إنشاء المتجر (ربما الرابط مستخدم مسبقاً): ' + err.message);
    }
});

// --- نظام المشرف (Admin) ---

// 1. التحقق من كلمة المرور (kenouni19)
app.post('/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'kenouni19') {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'كلمة المرور خاطئة' });
    }
});

// 2. لوحة التحكم للمشرف
app.get('/admin/dashboard', (req, res) => {
    res.send(`
        <html dir="rtl" lang="ar">
        <head>
            <meta charset="UTF-8">
            <title>لوحة التحكم - ClickShop</title>
            <style>
                body { font-family: Tahoma; background: #f3f4f6; padding: 30px; text-align: center; }
                .box { background: #fff; padding: 30px; border-radius: 10px; max-width: 500px; margin: auto; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                button { background: #008060; color: white; border: none; padding: 12px 20px; font-size: 16px; border-radius: 6px; cursor: pointer; margin-top: 15px; }
                button:hover { background: #006e52; }
                .code-display { font-size: 22px; color: #dc2626; font-weight: bold; margin-top: 15px; background: #f0fdf4; padding: 12px; border-radius: 6px; border: 1px dashed #008060; }
            </style>
        </head>
        <body>
            <div class="box">
                <h2>لوحة تحكم مدير منصة ClickShop</h2>
                <p>اضغط لتوليد كود تفعيل جديد وإعطائه للزبون:</p>
                <button onclick="generateCode()">توليد كود تفعيل جديد</button>
                <div id="codeBox" class="code-display">انقر لتوليد الكود</div>
            </div>
            <script>
                function generateCode() {
                    fetch('/admin/generate-code', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        document.getElementById('codeBox').innerText = data.code;
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// 3. توليد كود تفعيل عشوائي
app.post('/admin/generate-code', (req, res) => {
    const randomCode = 'CS-' + Math.floor(1000 + Math.random() * 9000) + '-' + Date.now().toString().slice(-4);
    generatedCodes.push(randomCode);
    res.json({ code: randomCode });
});

// تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

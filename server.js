require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rate Limiter
const ipRequests = new Map();
const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 3;

  if (!ipRequests.has(ip)) {
    ipRequests.set(ip, []);
  }
  const timestamps = ipRequests.get(ip).filter(t => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    return res.status(429).json({ error: 'تم حظر المحاولات المتكررة مؤقتاً لحماية النظام. انتظر دقيقة.' });
  }
  timestamps.push(now);
  ipRequests.set(ip, timestamps);
  next();
};

async function sendTelegramMessage(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'HTML' })
    });
  } catch (err) {
    console.error('Telegram Message Error:', err.message);
  }
}

async function sendTelegramAlert(message) {
  await sendTelegramMessage(process.env.TELEGRAM_CHAT_ID, message);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to ClickShop Database Successfully!'))
  .catch(err => console.error('Database connection error:', err));

// Schemas
const storeSchema = new mongoose.Schema({
  storeName: { type: String, required: true },
  domainSlug: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  ownerName: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  logoUrl: { type: String, default: '' },
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  primaryColor: { type: String, default: '#008060' }, // لون المتجر المخصص
  createdAt: { type: Date, default: Date.now }
});
const Store = mongoose.model('Store', storeSchema);

const licenseSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  isUsed: { type: Boolean, default: false },
  usedBySlug: { type: String, default: '' },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});
const License = mongoose.model('License', licenseSchema);

const productSchema = new mongoose.Schema({
  storeSlug: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});
const Product = mongoose.model('Product', productSchema);

async function generateNewLicenseCode() {
  const randomCode = 'CLICK-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
  const expiresAt = new Date(Date.now() + 75 * 1000); // 75 ثانية
  const newLicense = new License({ code: randomCode, expiresAt: expiresAt });
  await newLicense.save();
  return randomCode;
}

app.post('/api/admin/generate-key', async (req, res) => {
  try {
    const randomCode = await generateNewLicenseCode();
    res.status(201).json({ message: 'تم توليد الكود!', code: randomCode, expiresInSeconds: 75 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/stores/create', rateLimiter, upload.single('storeLogo'), async (req, res) => {
  try {
    const { storeName, domainSlug, category, ownerName, password, phone, licenseKey } = req.body;
    const cleanSlug = domainSlug.toLowerCase().trim();
    const cleanCode = (licenseKey || '').trim().toUpperCase();

    const license = await License.findOne({ code: cleanCode });
    if (!license) return res.status(400).json({ error: 'كود التفعيل غير صحيح!' });
    if (license.isUsed) return res.status(400).json({ error: 'هذا الكود تم استخدامه مسبقاً!' });
    if (new Date() > license.expiresAt) return res.status(400).json({ error: 'انتهت صلاحية الكود (75 ثانية)!' });

    if (await Store.findOne({ phone })) return res.status(400).json({ error: 'رقم الهاتف هذا يمتلك متجراً بالفعل!' });
    if (await Store.findOne({ domainSlug: cleanSlug })) return res.status(400).json({ error: 'رابط المتجر محجوز مسبقاً.' });

    const logoUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const newStore = new Store({ storeName, domainSlug: cleanSlug, category, ownerName, password, phone, logoUrl });
    await newStore.save();

    license.isUsed = true;
    license.usedBySlug = cleanSlug;
    await license.save();

    await sendTelegramAlert(`🚨 <b>متجر جديد!</b>\n🏪 ${storeName}\n🔗 /store/${cleanSlug}\n📞 ${phone}`);
    res.status(201).json({ message: 'تم إنشاء المتجر بنجاح!', store: newStore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/merchant/login', async (req, res) => {
  try {
    const { domainSlug, password } = req.body;
    const store = await Store.findOne({ domainSlug: domainSlug.toLowerCase().trim(), password });
    if (!store) return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
    res.json({ message: 'تم تسجيل الدخول بنجاح', store });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: تحديث إعدادات المتجر (شملنا اختيار اللون primaryColor)
app.post('/api/merchant/update-settings', upload.single('storeLogo'), async (req, res) => {
  try {
    const { storeSlug, facebook, instagram, phone, primaryColor } = req.body;
    const updateData = { facebook, instagram };
    if (phone) updateData.phone = phone;
    if (primaryColor) updateData.primaryColor = primaryColor;
    if (req.file) updateData.logoUrl = `/uploads/${req.file.filename}`;

    const updatedStore = await Store.findOneAndUpdate(
      { domainSlug: storeSlug.toLowerCase().trim() },
      updateData,
      { new: true }
    );

    if (!updatedStore) return res.status(404).json({ error: 'المتجر غير موجود' });
    res.json({ message: 'تم تحديث إعدادات المتجر بنجاح', store: updatedStore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products/add', upload.single('productImage'), async (req, res) => {
  try {
    const { storeSlug, title, price, description } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : 'https://via.placeholder.com/300';
    const newProduct = new Product({ storeSlug: storeSlug.toLowerCase().trim(), title, price, imageUrl, description });
    await newProduct.save();
    res.status(201).json({ message: 'تم إضافة المنتج بنجاح', product: newProduct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route: Storefront (يتكيف تلقائياً مع لون التاجر primaryColor)
app.get('/store/:slug', async (req, res) => {
  try {
    const store = await Store.findOne({ domainSlug: req.params.slug });
    if (!store) return res.status(404).send('<h1 style="text-align:center;margin-top:50px;">المتجر غير موجود</h1>');
    
    const products = await Product.find({ storeSlug: req.params.slug }).sort({ createdAt: -1 });
    const storeColor = store.primaryColor || '#008060'; // اللون المختار أو الافتراضي

    const productsHtml = products.length > 0 
      ? products.map(p => `
          <div class="product-card">
              <img src="${p.imageUrl}" alt="${p.title}">
              <div class="product-info">
                  <h3>${p.title}</h3>
                  <p class="desc">${p.description || ''}</p>
                  <div class="price" style="color: ${storeColor};">${p.price} د.ج</div>
                  <button class="order-btn" style="background: ${storeColor};" onclick="alert('الطلب قريباً')">اطلب الآن</button>
              </div>
          </div>
        `).join('')
      : '<p style="grid-column: 1/-1; text-align:center; color:#8c9196; padding:40px;">لا توجد منتجات حالياً.</p>';

    const logoHtml = store.logoUrl ? `<img src="${store.logoUrl}" class="store-logo" style="border: 2px solid ${storeColor};">` : '';

    res.send(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${store.storeName}</title>
          <style>
              * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, sans-serif; }
              body { background: #f6f6f7; color: #202223; }
              header { background: #fff; padding: 20px 5%; border-bottom: 1px solid #e1e3e5; display: flex; justify-content: space-between; align-items: center; }
              .header-brand { display: flex; align-items: center; gap: 12px; }
              .store-logo { width: 55px; height: 55px; border-radius: 50%; object-fit: cover; }
              header h1 { color: ${storeColor}; font-size: 1.5rem; cursor: pointer; user-select: none; }
              .badge { background: #e3f1df; color: #004c3f; padding: 5px 12px; border-radius: 20px; font-weight: bold; }
              .container { max-width: 1100px; margin: 30px auto; padding: 0 20px; }
              .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
              .product-card { background: #fff; border-radius: 10px; overflow: hidden; border: 1px solid #e1e3e5; display: flex; flex-direction: column; }
              .product-card img { width: 100%; height: 220px; object-fit: cover; background: #f0f0f0; }
              .product-info { padding: 15px; flex: 1; display: flex; flex-direction: column; }
              .product-info h3 { font-size: 1.1rem; margin-bottom: 8px; }
              .desc { color: #6d7175; font-size: 0.9rem; margin-bottom: 12px; flex: 1; }
              .price { font-size: 1.2rem; font-weight: bold; margin-bottom: 12px; }
              .order-btn { width: 100%; color: #fff; border: none; padding: 10px; border-radius: 6px; font-weight: bold; cursor: pointer; }
              footer { text-align: center; padding: 30px; background: #fff; border-top: 1px solid #e1e3e5; margin-top: 50px; }
              .social-links { display: flex; justify-content: center; gap: 15px; margin-bottom: 15px; flex-wrap: wrap; }
              .social-btn { padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; color: #fff; font-size: 0.9rem; }
              .social-btn.fb { background: #1877f2; }
              .social-btn.ig { background: #e1306c; }
              .social-btn.ph { background: ${storeColor}; }
          </style>
      </head>
      <body>
          <header>
              <div class="header-brand">
                  ${logoHtml}
                  <h1 id="storeTitle">${store.storeName}</h1>
              </div>
              <span class="badge">${store.category}</span>
          </header>
          <div class="container">
              <div class="products-grid">${productsHtml}</div>
          </div>
          <footer>
              <div class="social-links">
                ${store.facebook ? `<a href="${store.facebook}" target="_blank" class="social-btn fb">فيسبوك</a>` : ''}
                ${store.instagram ? `<a href="${store.instagram}" target="_blank" class="social-btn ig">إنستغرام</a>` : ''}
                ${store.phone ? `<a href="tel:${store.phone}" class="social-btn ph">اتصل بنا: ${store.phone}</a>` : ''}
              </div>
              <p style="color: #8c9196; font-size: 0.85rem;">مدعوم بواسطة منصة ClickShop</p>
          </footer>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('خطأ في السيرفر');
  }
});

app.listen(PORT, () => {
  console.log(`ClickShop Server is running on port ${PORT}`);
});

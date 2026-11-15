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
if (!fs.existsSync(uploadDir)){ fs.mkdirSync(uploadDir, { recursive: true }); }
const DB_FILE = path.join(__dirname, 'database.json');
let db = { stores: [], siteSettings: { logoUrl: "https://i.ibb.co/6P82W8h/default-avatar.png", whatsapp: "213700000000", telegramBotToken: "" }, activeCodes: ["9X4F7B2K", "3M8R9P1W", "5V2X4H8N"], usedCodes: [] };
if (fs.existsSync(DB_FILE)) { try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (e) {} }
function saveDB() { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
app.get('/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ "name": "ClickShop", "short_name": "ClickShop", "start_url": "/", "display": "standalone", "background_color": "#f3f4f6", "theme_color": "#008060", "icons": [{"src": db.siteSettings.logoUrl, "sizes": "192x192", "type": "image/png"}] }));
});
app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`self.addEventListener('fetch', (e) => { e.respondWith(fetch(e.request).catch(() => caches.match(e.request))); });`);

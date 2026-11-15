function renderLayout(title, content, extraHead = '') {
    return `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>${title}</title>
        <style>
            * { box-sizing: border-box; font-family: Tahoma, Arial, sans-serif; }
            body { margin: 0; padding: 0; background: #f3f4f6; color: #111827; width: 100%; overflow-x: hidden; }
            .navbar { background: #008060; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; color: #fff; width: 100%; position: sticky; top: 0; z-index: 100; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .brand { display: flex; align-items: center; gap: 10px; cursor: pointer; text-decoration: none; color: #fff; }
            .brand h1 { margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px; }
            .logo-circle { background: #fff; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #008060; font-weight: bold; font-size: 11px; box-shadow: 0 2px 5px rgba(0,0,0,0.15); }
            
            /* تصميم زر اللغات الموحد */
            .lang-dropdown { position: relative; display: inline-block; }
            .lang-main-btn { background: rgba(255,255,255,0.2); color: #fff; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px; }
            .lang-content { display: none; position: absolute; left: 0; background-color: #fff; min-width: 90px; box-shadow: 0px 8px 16px rgba(0,0,0,0.2); border-radius: 6px; z-index: 1; overflow: hidden; }
            .lang-content button { color: #111827; padding: 8px 12px; text-decoration: none; display: block; border: none; background: none; width: 100%; text-align: right; font-size: 12px; cursor: pointer; font-weight: bold; }
            .lang-content button:hover { background-color: #f3f4f6; color: #008060; }
            .lang-dropdown:hover .lang-content { display: block; }

            .hero-section { background: linear-gradient(135deg, #008060 0%, #046c51 100%); color: #fff; padding: 30px 15px; text-align: center; width: 100%; }
            .card-box { background: #fff; margin: -20px 12px 15px 12px; padding: 20px; border-radius: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.08); color: #111827; text-align: right; }
            .announcement-box { border: 2px dashed #f59e0b; background: #fffbeb; padding: 12px; border-radius: 10px; margin-bottom: 18px; text-align: center; min-height: 90px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
            .btn { display: block; width: 100%; padding: 13px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; border: none; cursor: pointer; text-align: center; }
            .btn-green { background: #008060; color: #fff; }
            .btn-blue { background: #2563eb; color: #fff; }
            label { display: block; font-size: 13px; font-weight: bold; margin-bottom: 5px; color: #374151; }
            input, select { width: 100%; padding: 11px; margin-bottom: 12px; border: 1.5px solid #d1d5db; border-radius: 8px; font-size: 14px; background: #fff; }
        </style>
        ${extraHead}
    </head>
    <body>
        <div class="navbar">
            <a href="/admin-login" class="brand" title="لوحة المدير العام">
                <div class="logo-circle">Logo</div>
                <h1>ClickShop</h1>
            </a>
            <!-- زر اللغات الموحد المنسدل -->
            <div class="lang-dropdown">
                <button class="lang-main-btn">🌐 اللغات ▾</button>
                <div class="lang-content">
                    <button onclick="setLang('ar')">العربية</button>
                    <button onclick="setLang('fr')">Français</button>
                    <button onclick="setLang('en')">English</button>
                </div>
            </div>
        </div>
        ${content}
        <script>
            function setLang(l){
                const t1 = document.getElementById('t1');
                const t2 = document.getElementById('t2');
                const desc = document.getElementById('desc');
                const b1 = document.getElementById('b1');
                const b2 = document.getElementById('b2');
                if(!t1) return;
                if(l==='fr'){
                    t1.innerText="Créez votre boutique pro en secondes";
                    t2.innerText="Comment fonctionne ClickShop ?";
                    desc.innerText="Nous travaillons 24/7 pour assurer la stabilité de votre boutique, recevoir les commandes instantanément via Telegram et WhatsApp !";
                    b1.innerText="🚀 Créer ma nouvelle boutique";
                    b2.innerText="⚙️ Connexion Marchand";
                }else if(l==='en'){
                    t1.innerText="Create your pro store in seconds";
                    t2.innerText="How does ClickShop work?";
                    desc.innerText="We work 24/7 to ensure your store stability, receive customer orders instantly via Telegram and WhatsApp!";
                    b1.innerText="🚀 Create New Store";
                    b2.innerText="⚙️ Merchant Login";
                }else{
                    t1.innerText="أطلق متجرك الإلكتروني الاحترافي في دقائق";
                    t2.innerText="كيف تعمل منصة ClickShop؟ ⚙️";
                    desc.innerText="نحن نعمل على مدار الساعة طوال أيام الأسبوع (24/7) لضمان استقرار متجرك، استقبال طلبات الزبائن وتنبيهك فورياً عبر التيليغرام والواتساب!";
                    b1.innerText="🚀 ابدأ إنشاء متجرك الجديد";
                    b2.innerText="⚙️ تسجيل دخول التجار";
                }
            }
        </script>
    </body>
    </html>`;
}

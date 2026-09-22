const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const app = express();
let lastQr = '';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage','--single-process'] }
});

client.on('qr', async (qr) => {
    lastQr = await qrcode.toDataURL(qr);
    console.log('QR READY - Scan now!');
});

client.on('ready', () => {
    console.log('KADABADA READY!');
    lastQr = 'CONNECTED';
});

client.on('message', async (msg) => {
    try {
        if (msg._data.isViewOnce) {
            const media = await msg.downloadMedia();
            if (media) {
                await client.sendMessage(msg.from, media, { caption: '🔓 *KADABADA OPENED VIEW ONCE* 🔓' });
            }
            return;
        }
    } catch(e){ console.log(e); }
});

app.get('/', (req,res)=>{
    if(lastQr==='CONNECTED') res.send('<h1 style="color:green">KADABADA CONNECTED! ✅</h1><p>Bot is running!</p>');
    else if(lastQr) res.send(`<h1>Scan This QR with WhatsApp</h1><img src="${lastQr}" style="width:320px"><br><p>Go to WhatsApp > Linked Devices > Link Device</p><script>setTimeout(()=>location.reload(),15000)</script>`);
    else res.send('<h1>Starting KADABADA... Wait 30s and refresh</h1><script>setTimeout(()=>location.reload(),10000)</script>');
});

client.initialize();
app.listen(process.env.PORT || 3000, ()=>console.log('Server live'));

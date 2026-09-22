const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const express = require('express');
const app = express();

let qrCodeData = '';

const client = new Client({
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    },
    authStrategy: new LocalAuth()
});

client.on('qr', async (qr) => {
    console.log('QR RECEIVED');
    qrCodeData = await qrcode.toDataURL(qr);
});

client.on('ready', () => {
    console.log('KADABADA BOT IS READY!');
});

client.on('message', async (msg) => {
    if (msg.body === '!ping') {
        msg.reply('pong - Kadabada Bot is alive!');
    }
});

app.get('/', (req, res) => {
    if (qrCodeData) {
        res.send(`<img src="${qrCodeData}" style="width:300px;"><h2>Scan this QR with WhatsApp</h2><script>setTimeout(()=>location.reload(),30000)</script>`);
    } else {
        res.send('<h2>Bot starting... Refresh in 10 sec. If connected, QR will disappear.</h2><script>setTimeout(()=>location.reload(),10000)</script>');
    }
});

client.initialize();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server on ' + PORT);
});

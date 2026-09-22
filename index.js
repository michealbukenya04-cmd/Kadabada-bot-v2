const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const app = express();
let lastQr = '';
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] }
});
client.on('qr', async (qr) => {
    lastQr = await qrcode.toDataURL(qr);
    console.log('QR READY');
});
client.on('ready', () => {
    console.log('KADABADA V2 READY!');
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
        if(msg.from.includes('@g.us')) return;
        const body = msg.body;
        const lower = body.toLowerCase();
        if (lower.startsWith('play ') || lower.startsWith('.play ') || lower.startsWith('song ')) {
            const query = body.slice(body.indexOf(' ')+1);
            if(!query) return msg.reply('Send: play <song name>');
            msg.reply(`🎵 Searching: *${query}*...`);
            const search = await yts(query);
            const video = search.videos[0];
            if (!video) return msg.reply('Not found!');
            await msg.reply(`Found: *${video.title}* - Downloading...`);
            const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
            const filePath = `/tmp/${Date.now()}.mp3`;
            const writeStream = fs.createWriteStream(filePath);
            stream.pipe(writeStream);
            writeStream.on('finish', async () => {
                const media = MessageMedia.fromFilePath(filePath);
                await client.sendMessage(msg.from, media, { sendAudioAsVoice: false, caption: `🎶 *${video.title}* - KADABADA BOT` });
                fs.unlinkSync(filePath);
            });
            return;
        }
        if(lower.includes('hi') || lower.includes('hello')){
            msg.reply('KADABADA BOT READY! 🔥\n🎵 play <song>\n👁️ Send View Once I open it');
        }
    } catch(e){ console.log(e); }
});
app.get('/', (req,res)=>{
    if(lastQr==='CONNECTED') res.send('<h1>KADABADA CONNECTED! ✅</h1>');
    else if(lastQr) res.send(`<h1>Scan QR</h1><img src="${lastQr}" style="width:300px"><br><script>setTimeout(()=>location.reload(),15000)</script>`);
    else res.send('<h1>Starting... Refresh 20s</h1><script>setTimeout(()=>location.reload(),10000)</script>');
});
client.initialize();
app.listen(process.env.PORT || 3000);

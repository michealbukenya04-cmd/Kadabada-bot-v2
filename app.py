from flask import Flask, request
import requests, os, datetime
from collections import deque
app=Flask(__name__)
TOKEN=os.environ.get("TOKEN")
PHONE=os.environ.get("PHONE_ID")
VERIFY="kadabada123"
LOGS=deque(maxlen=30)
@app.route('/')
def home():
    logs="<br>".join([str(l) for l in LOGS]) or "Send.ping to bot!"
    return f"<body style='background:#000;color:#0f0;padding:20px;font-family:monospace'><h2>KADABADA BOT LIVE ✅</h2><div>{logs}</div></body>"
@app.route('/webhook',methods=['GET'])
def verify():
    if request.args.get("hub.verify_token")==VERIFY:
        return request.args.get("hub.challenge")
    return "Fail",403
@app.route('/webhook',methods=['POST'])
def hook():
    try:
        data=request.get_json()
        m=data['entry'][0]['changes'][0]['value']['messages'][0]
        frm=m['from']; txt=m['text']['body']
        LOGS.append(f"{datetime.datetime.now().strftime('%H:%M')} {frm}: {txt}")
        url=f"https://graph.facebook.com/v20.0/{PHONE}/messages"
        h={"Authorization":f"Bearer {TOKEN}"}
        reply="ONLINE Chief!" if ".ping" in txt.lower() else f"Got: {txt}"
        requests.post(url,headers=h,json={"messaging_product":"whatsapp","to":frm,"text":{"body":reply}})
    except: pass
    return "OK",200
if __name__=="__main__":
    app.run(host="0.0.0.0",port=10000)
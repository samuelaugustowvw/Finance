import 'dotenv/config'
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { handleMessage } from './handler'
import express from 'express'

const app = express()
let qrCode = ''

app.get('/qr', (req, res) => {
  if (!qrCode) {
    res.send('<h2>Bot já conectado ou aguardando QR...</h2>')
    return
  }
  res.send(`
    <html>
      <body style="display:flex;align-items:center;justify-content:center;height:100vh;background:#111;">
        <div style="text-align:center;">
          <h2 style="color:white;margin-bottom:20px;">Escaneie o QR code com o WhatsApp</h2>
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCode)}" />
          <p style="color:#aaa;margin-top:10px;">Atualize a página se o QR expirar</p>
        </div>
      </body>
    </html>
  `)
})

app.listen(8080, () => console.log('QR disponível em /qr'))

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      qrCode = qr
      console.log('QR code disponível em /qr')
    }

    if (connection === 'open') {
      qrCode = ''
      console.log('✅ Finance Bot conectado!')
    }

    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) connectToWhatsApp()
    }
  })

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return
    if (msg.key.remoteJid?.endsWith('@g.us')) return
    await handleMessage(sock, msg)
  })
}

connectToWhatsApp()
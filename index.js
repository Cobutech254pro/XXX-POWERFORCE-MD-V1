// index.js
import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import * as fs from 'node:fs'; // Import the 'fs' module
import path from 'path';

// Import your command handler or other bot logic
import { handleCommand } from './handler'; // Assuming you have a handler.js

// --- Configuration ---
const SESSION_FOLDER = './auth_info'; // Folder to store authentication files

// --- Function to start the WhatsApp bot ---
async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_FOLDER);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`Using Baileys v${version}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    logger: console,
    auth: state,
    // Add other socket options as needed
  });

  // --- Event Handlers ---

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      // reconnect if not intentional close
      if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
        console.log('Connection closed unexpectedly, trying to reconnect in 5 seconds...');
        setTimeout(startWhatsAppBot, 5000);
      } else {
        console.log('Connection closed because you logged out.');
      }
    } else if (connection === 'open') {
      console.log('✅ Bot is ready!');
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg?.message) return;

    // Prevent processing self-messages and status updates
    if (msg.key.fromMe || msg.key.remoteJid === 'status@broadcast') return;

    const prefix = '!'; // Your command prefix
    if (msg.message.conversation?.startsWith(prefix) || msg.message?.imageMessage?.caption?.startsWith(prefix)) {
      await handleCommand(sock, msg, prefix);
    }
  });

  // --- QR Code Handling (only needed if no saved session) ---
  if (!fs.existsSync(path.join(__dirname, SESSION_FOLDER, 'creds.json'))) {
    sock.ev.on('qr', (qr) => {
      qrcode.generate(qr, { small: true });
      console.log('Scan the QR code above to authenticate.');
    });
  }
}

// --- Start the bot ---
startWhatsAppBot().catch(err => console.error(err));

// index.js

const {
    default: makeWASocket,
    useSingleFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    generateWAMessageFromContent,
    proto
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const config = require('./config');
const fs = require('node:fs');

// Import command handlers
const botInfoHandler = require('./commands/botinfo');
const generalHandler = require('./commands/general');
const groupHandler = require('./commands/group');
const userHandler = require('./commands/user');
const utilityHandler = require('./commands/utility');
const chatbotHandler = require('./commands/chatbot');
const downloadHandler = require('./commands/download');
const funHandler = require('./commands/fun');
const infoHandler = require('./commands/info');
const imageHandler = require('./commands/image');
const urlHandler = require('./commands/url');
const menuHandler = require('./commands/menu');

// Auth
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

let autoReadEnabled = config.autoReadDefault;
let autoTypingEnabled = config.autoTypingDefault;
let autoRecordingEnabled = config.autoRecordingDefault;
let phoneNumber = config.botOwnerNumber; // Use the configured owner number for pairing

async function startBot() {
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: !phoneNumber, // Only print QR if no phone number configured
        pairingCode: !!phoneNumber, // Request pairing code if phone number is configured
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error = new Boom(lastDisconnect.error))?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('connection closed, reconnecting:', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Bot is ready!');
            await sock.sendMessage(config.botOwnerNumber + '@s.whatsapp.net', { text: '✅ Bot is online!' });
        } else if (connection === 'connecting' && qr && !phoneNumber) {
            qrcode.generate(qr, { small: true });
            console.log('Scan QR code to pair.');
        }
    });

    sock.ev.on('requestPairingCode', async (code) => {
        // Pairing code received, you need to enter this on your WhatsApp.
        console.log(`Request Pairing Code: ${code}`);
        // In a real deployment, you might want to send this code to the bot owner securely.
        // The user will open WhatsApp > Linked Devices > Link with phone number and enter this code.
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages || !messages[0]) return;
        const msg = messages[0];
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith('@g.us');
        const messageContent = msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text ||
            msg.message?.imageMessage?.caption ||
            msg.message?.videoMessage?.caption;

        if (!messageContent) return;

        const lower = messageContent.trim().toLowerCase();
        const args = messageContent.split(' ').slice(1);

        // Auto-read
        if (autoReadEnabled) {
            await sock.readMessages([msg.key]);
        }

        // Simulate typing
        if ((autoTypingEnabled || autoRecordingEnabled) && lower.startsWith('!')) {
            await sock.sendPresenceUpdate(autoTypingEnabled ? 'composing' : 'recording', from);
        }

        // Command handling
        if (lower === '!menu') return menuHandler.handleMenuCommand(sock, msg);
        if (!isNaN(lower) && lower !== '0') return menuHandler.handleMenuSelection(sock, msg, lower);
        if (lower === '!botinfo' || lower === '!status') return botInfoHandler.handleBotInfo(sock, msg);
        if (lower === '!hello' || lower === '!hi') return generalHandler.handleHello(sock, msg);
        if (lower === '!creator' || lower === '!owner') return generalHandler.handleCreator(sock, msg);
        if (lower === '!ping') {
            const start = Date.now();
            await sock.sendMessage(from, { text: 'Pinging...' });
            const end = Date.now();
            return sock.sendMessage(from, { text: `Pong! Response time: ${end - start}ms` });
        }
        if (lower.startsWith('!say')) {
            const text = args.join(' ') || 'Please provide text to say.';
            return sock.sendMessage(from, { text });
        }
        if (lower.startsWith('!repeat')) {
            const text = args.join(' ') || 'Please provide text to repeat.';
            return sock.sendMessage(from, { text });
        }

        // Add the rest of your commands similarly:
        if (lower === '!groupinfo') return groupHandler.handleGroupInfo(sock, msg);
        if (lower.startsWith('!calculate')) return utilityHandler.handleCalculate(sock, msg, args);
        if (lower.startsWith('!translate')) return utilityHandler.handleTranslate(sock, msg, args);
        if (lower.startsWith('!chatbot activate')) return chatbotHandler.handleChatbotActivate(sock, msg);
        if (lower.startsWith('!chatbot deactivate')) return chatbotHandler.handleChatbotDeactivate(sock, msg);
        if (lower.startsWith('!weather')) return infoHandler.handleWeather(sock, msg, args);

        // Admin commands (toggle features)
        if (lower.startsWith('!autoread')) {
            autoReadEnabled = args[0]?.toLowerCase() === 'on';
            return sock.sendMessage(from, { text: `✅ Auto-read ${autoReadEnabled ? 'enabled' : 'disabled'}.` });
        }
        if (lower.startsWith('!autotyping')) {
            autoTypingEnabled = args[0]?.toLowerCase() === 'on';
            return sock.sendMessage(from, { text: `✅ Auto-typing ${autoTypingEnabled ? 'enabled' : 'disabled'}.` });
        }
        if (lower.startsWith('!autorecording')) {
            autoRecordingEnabled = args[0]?.toLowerCase() === 'on';
            return sock.sendMessage(from, { text: `✅ Auto-recording ${autoRecordingEnabled ? 'enabled' : 'disabled'}.` });
        }

        // Continue mapping your commands...
    });
}

startBot();

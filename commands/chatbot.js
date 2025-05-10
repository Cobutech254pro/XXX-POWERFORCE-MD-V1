// In your commands/chatbot.js

let chatbotEnabled = false;

async function handleChatbotActivate(sock, msg) {
  chatbotEnabled = true;
  await sock.sendMessage(msg.key.remoteJid, { text: 'Chatbot activated. I will now try to respond to your messages.' });
}

async function handleChatbotDeactivate(sock, msg) {
  chatbotEnabled = false;
  await sock.sendMessage(msg.key.remoteJid, { text: 'Chatbot deactivated. I will no longer try to respond to regular messages.' });
}

async function handleChatbotResponse(sock, msg) {
  if (chatbotEnabled && !msg.body?.startsWith('!') && !msg.key.fromMe) {
    // Basic placeholder responses
    const responses = [
      "Interesting!",
      "Tell me more.",
      "I see.",
      "That's good to know.",
      "How does that make you feel?",
    ];
    const randomIndex = Math.floor(Math.random() * responses.length);
    await sock.sendMessage(msg.key.remoteJid, { text: responses[randomIndex] });
  }
}

module.exports = {
  handleChatbotActivate,
  handleChatbotDeactivate,
  handleChatbotResponse,
};

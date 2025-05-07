// In your commands/chatbot.js

let chatbotEnabled = false;

async function handleChatbotActivate(bot, message) {
  chatbotEnabled = true;
  await bot.sendMessage(message.from, 'Chatbot activated. I will now try to respond to your messages.');
}

async function handleChatbotDeactivate(bot, message) {
  chatbotEnabled = false;
  await bot.sendMessage(message.from, 'Chatbot deactivated. I will no longer try to respond to regular messages.');
}

async function handleChatbotResponse(bot, message) {
  if (chatbotEnabled && !message.body.startsWith('!') && !message.fromMe) {
    // Basic placeholder responses
    const responses = [
      "Interesting!",
      "Tell me more.",
      "I see.",
      "That's good to know.",
      "How does that make you feel?",
    ];
    const randomIndex = Math.floor(Math.random() * responses.length);
    await bot.sendMessage(message.from, responses[randomIndex]);
  }
}

module.exports = {
  handleChatbotActivate,
  handleChatbotDeactivate,
  handleChatbotResponse,
};

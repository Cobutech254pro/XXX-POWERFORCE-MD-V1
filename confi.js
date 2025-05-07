// config.js

module.exports = {
  botOwnerNumber: '+YOUR_BOT_OWNER_NUMBER', // Replace with your WhatsApp number (including country code)
  botAdmins: ['+ADMIN_NUMBER_1', '+ADMIN_NUMBER_2'], // Array of admin WhatsApp numbers
  // Add API keys here (replace with your actual keys)
  newsApiKey: 'YOUR_NEWS_API_KEY',
  weatherApiKey: 'YOUR_WEATHER_API_KEY',
  translateApiKey: 'YOUR_TRANSLATE_API_KEY',
  // ... other API keys

  // Bot settings
  autoReadDefault: false, // Default value for auto-read on startup

  // Auto Typing/Recording Configuration
  autoTypingDefault: false, // Default value for auto-typing indicator
  autoRecordingDefault: false, 

  // Bot Display Configuration
  botImageURL: 'YOUR_BOT_IMAGE_URL', 
  botBodyText: 'Hi! I\'m a helpful WhatsApp Bot.', 
  usernamePrefix: 'BotUser', 

  // Add other configuration options as needed
};

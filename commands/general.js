// In your commands/general.js

async function handleMenuCommand(bot, message) {
  const menuText = `
🤖 *XXX-FORCE-MD VI - Command Menu*

[Image: URL_TO_YOUR_BOT_IMAGE]

Please type the number corresponding to the category you want to explore:

1.  ℹ️ Bot Information & Status
2.  ⚙️ General Commands
3.  🌍 Social Media Downloads
4.  🛡️ Group Management (in groups)
5.  🛠️ Utility Commands
6.  🎮 Fun & Games
7.  📰 Information Retrieval
8.  🖼️ Image Manipulation
9.  🔗 URL Tools
10. 👤 User Commands
11. 🌐 General

Once you select a category, you will see a list of commands within that category.
`;

  await bot.sendMessage(message.from, menuText);
}

async function handleHello(bot, message) {
  const greetings = ["Hello!", "Hi there!", "Hey!", "Greetings!"];
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  await bot.sendMessage(message.from, `${randomGreeting} How can I help you today?`);
}

async function handleCreator(bot, message) {
  await bot.sendMessage(message.from, "I was created with passion and a lot of code. You can think of me as a digital entity here to assist!");
}

module.exports = {
  handleMenuCommand,
  handleHello,
  handleCreator,
};

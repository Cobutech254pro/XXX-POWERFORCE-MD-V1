// In your commands/general.js

const menuText = `
🤖 *XXX-FORCE-MD VI - Command Menu*

[Image: URL_TO_YOUR_BOT_IMAGE]

*User:* %USERNAME%
*Bot Mode:* Deactivated (initially)
*User Country:* Kenya
*Running Time:* 0 seconds (initially, until the bot has been running longer)
*Bot Speed:* Fast (will be determined at runtime)
*Prefix:* !
*User Number:* %USERNUMBER%
*Platform:* WhatsApp

Please type the number corresponding to the category you want to explore:

1.  ℹ️ Bot Information & Status
2.  ⚙️ General Commands
3.  🌍 Social Media Downloads (Potential)
4.  🛡️ Group Management (in groups)
5.  🛠️ Utility Commands
6.  🎮 Fun & Games
7.  📰 Information Retrieval
8.  🖼️ Image Manipulation (Potential)
9.  🔗 URL Tools
10. 👤 User Commands
11. 🌐 General

Once you select a category, you will see a list of commands within that category.
`;

const botInfoMenu = `
ℹ️ *Bot Information & Status Commands:*

Please type the number for the command you want to use:

1.  \`!menu\` - Show this menu.
2.  \`!botinfo\` / \`!status\` - General bot info.
3.  \`!uptime\` - Bot running time.
4.  \`!speed\` / \`!ping\` - Response speed.
5.  \`!commands\` / \`!help\` - List commands.
6.  \`!location\` - Current location: Sare, Migori County, Kenya.
7.  \`!platform\` - Running platform (will be determined at runtime).

Type \`0\` to go back to the main menu.
`;

const generalCommandsMenu = `
⚙️ *General Commands:*

Please type the number for the command you want to use:

1.  \`!chatbot activate/deactivate\` - Toggle chat mode.
2.  \`!download\` - Download chat media/files (functionality depends on implementation).

Type \`0\` to go back to the main menu.
`;

const socialMediaMenu = `
🌍 *Social Media Downloads (Potential):*

Please type the number for the command you want to use:

1.  \`!facebookdl [URL]\` - Download from Facebook (potential).
2.  \`!igdl [URL]\` - Download from Instagram (potential).
3.  \`!tiktokdl [URL]\` - Download TikTok video (potential).
4.  \`!musicdl https://www.worldox.com/GX3Help/and,_or,_and_other_search_commands.htm\` - Download/link music (potential).

Type \`0\` to go back to the main menu.
`;

const groupManagementMenu = `
🛡️ *Group Management Commands (in groups):*

Please type the number for the command you want to use:

1.  \`!mentionall\` / \`!everyone\` - Mention all members.
2.  \`!groupinfo\` - Group details.
3.  \`!rules\` - Group rules (if set).
4.  \`!report [user mention] [reason]\` - Report user/message.
5.  \`!reportadmin [user mention] [reason]\` - Notify admins.
6.  \`!announce [message]\` - Send announcement (potential).
7.  \`!poll [question] [options]\` - Create a poll (potential).
8.  \`!find [keyword]\` - Search chat (potential).
9.  \`!welcome [message]\` - 👑 Set welcome message (admin only, potential).
10. \`!leavegroup\` - 👑 Make bot leave (admin only).
11. \`!add [number]\` - 👑 Add member (admin only, potential).
12. \`!remove [mention]\` - 👑 Remove member (admin only, potential).
13. \`!promote [mention]\` - 👑 Promote to admin (admin only, potential).
14. \`!demote [mention]\` - 👑 Demote from admin (admin only, potential).
15. \`!setname [new name]\` - 👑 Set group name (admin only, potential).
16. \`!setdescription [description]\` - 👑 Set description (admin only, potential).
17. \`!pin [message]\` - 👑 Pin message (admin only, potential).
18. \`!unpin\` - 👑 Unpin message (admin only, potential).
19. \`!mute [mention] [duration]\` - 👑 Mute user (admin only, potential).
20. \`!unmute [mention]\` - 👑 Unmute user (admin only, potential).
21. \`!adminonly on/off\` - 👑 Restrict bot to admins (admin only, potential).
22. \`!antisticker on/off\` - 👑 Manage stickers (admin only, potential).
23. \`!antilink on/off\` - 👑 Manage links (admin only, potential).
24. \`!killground\` - 👑 Remove all members (admin only!).
25. \`!antibot on/off\` - 👑 Anti-bot feature (admin only, potential).

Type \`0\` to go back to the main menu.
`;

const utilityCommandsMenu = `
🛠️ *Utility Commands:*

Please type the number for the command you want to use:

1.  \`!calculate [expression]\` - Perform a calculation (potential).
2.  \`!translate [text] to [language]\` - Translate text (potential).
3.  \`!define [word]\` - Get word definition (potential).
4.  \`!time\` - Show current time (potential).
5.  \`!date\` - Show current date (potential).
6.  \`!currency [amount] [from] to [to]\` - Convert currency (potential).

Type \`0\` to go back to the main menu.
`;

const funGamesMenu = `
🎮 *Fun & Games:*

Please type the number for the command you want to use:

1.  \`!joke\` - Tell a joke (potential).
2.  \`!meme\` - Send a meme (potential).
3.  \`!roll [number]d[sides]\` - Roll dice (e.g., !roll 2d6) (potential).
4.  \`!rps [your choice]\` - Play Rock, Paper, Scissors (potential).
5.  \`!trivia\` - Start a trivia question (potential).

Type \`0\` to go back to the main menu.
`;

const infoRetrievalMenu = `
📰 *Information Retrieval:*

Please type the number for the command you want to use:

1.  \`!news [topic]\` - Get latest news (potential).
2.  \`!weather [city]\` - Get weather for a city (potential).
3.  \`!wiki [search term]\` - Search Wikipedia (potential).
4.  \`!quote\` - Display a random quote (potential).

Type \`0\` to go back to the main menu.
`;

const imageManipulationMenu = `
🖼️ *Image Manipulation (Potential):*

Please type the number for the command you want to use (reply to an image):

1.  \`!grayscale\` - Convert to grayscale (potential).
2.  \`!blur\` - Apply blur effect (potential).

Type \`0\` to go back to the main menu.
`;

const urlToolsMenu = `
🔗 *URL Tools:*

Please type the number for the URL action you want to perform:

1.  \`!url invite\` - Generate a WhatsApp group invite link (in groups, requires admin, potential).
2.  \`!url shorten [URL]\` - Create a shortened URL (potential).
3.  \`!url expand [shortened URL]\` - Expand a shortened URL (potential).
4.  \`!url generate [type]\` - Generate a random URL of a specific type (e.g., \`!url generate identifier\`) (potential).

Type \`0\` to go back to the main menu.
`;

const userCommandsMenu = `
👤 *User Commands:*

Please type the number for the user-related action you want to perform:

1.  \`!profile\` - View your own basic profile information.
2.  \`!setprofile [name]\` - Set a custom name for your profile.
3.  \`!bio\` - View your current bio.
4.  \`!setbio [your bio text]\` - Set a short bio for your profile.
5.  \`!report [user mention] [reason]\` - Report another user (in groups).
6.  \`!warns\` - Check your warnings (if applicable, in groups, potential).
7.  \`!request [feature suggestion]\` - Suggest a feature.
8.  \`!feedback [your feedback]\` - Send general feedback.
9.  \`!contactadmin [your message]\` - Contact group admins (if possible).
10. \`!setnickname [new nickname]\` - (In groups, potential) Request a nickname.

Type \`0\` to go back to the main menu.
`;

const generalMenu = `
🌐 *General Commands:*

Please type the number for the command you want to use:

1.  \`!hello\` or \`!hi\` - Get a greeting from the bot.
2.  \`!creator\` or \`!owner\` - See information about the bot's creator (to be implemented).
3.  \`!ping\` - Check the bot's response time.
4.  \`!say [something]\` - Make the bot say something.
5.  \`!repeat [something]\` - Make the bot repeat what you said.

Type \`0\` to go back to the main menu.
`;

async function handleMenuCommand(sock, msg) {
  let menu = menuText;

  // Get user info (pushName is usually available)
  const userName = msg.pushName || "User";
  const userNumber = msg.key.remoteJid;

  // Add user-specific info to the menu
  menu = menu.replace("%USERNAME%", userName);
  menu = menu.replace("%USERNUMBER%", userNumber.split('@')[0]); // Remove @s.whatsapp.net

  await sock.sendMessage(msg.key.remoteJid, { text: menu });
}

async function handleMenuSelection(sock, msg, selectedNumber) {
  switch (selectedNumber) {
    case '1':
      await sock.sendMessage(msg.key.remoteJid, { text: botInfoMenu });
      break;
    case '2':
      await sock.sendMessage(msg.key.remoteJid, { text: generalCommandsMenu });
      break;
    case '3':
      await sock.sendMessage(msg.key.remoteJid, { text: socialMediaMenu });
      break;
    case '4':
      await sock.sendMessage(msg.key.remoteJid, { text: groupManagementMenu });
      break;
    case '5':
      await sock.sendMessage(msg.key.remoteJid, { text: utilityCommandsMenu });
      break;
    case '6':
      await sock.sendMessage(msg.key.remoteJid, { text: funGamesMenu });
      break;
    case '7':
      await sock.sendMessage(msg.key.remoteJid, { text: infoRetrievalMenu });
      break;
    case '8':
      await sock.sendMessage(msg.key.remoteJid, { text: imageManipulationMenu });
      break;
    case '9':
      await sock.sendMessage(msg.key.remoteJid, { text: urlToolsMenu });
      break;
    case '10':
      await sock.sendMessage(msg.key.remoteJid, { text: userCommandsMenu });
      break;
    case '11':
      await sock.sendMessage(msg.key.remoteJid, { text: generalMenu });
      break;
    default:
      await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid selection. Please type a number from the main menu.' });
  }
}

async function handleHello(sock, msg) {
  const greetings = ["Hello!", "Hi there!", "Hey!", "Greetings!"];
  const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
  await sock.sendMessage(msg.key.remoteJid, { text: `${randomGreeting} How can I help you today?` });
}

async function handleCreator(sock, msg) {
  await sock.sendMessage(msg.key.remoteJid, { text: "I was created with passion and a lot of code. You can think of me as a digital entity here to assist!" });
}

async function handlePing(sock, msg) {
  const startTime = Date.now();
  const sentMessage = await sock.sendMessage(msg.key.remoteJid, { text: 'Pinging...' });
  const endTime = Date.now();
  const pingTime = endTime - startTime;
  await sock.sendMessage(msg.key.remoteJid, { text: `Pong! Response time: ${pingTime}ms` }, { quoted: sentMessage });
}

async function handleSay(sock, msg, args) {
  const textToSay = args.join(' ');
  if (textToSay) {
    await sock.sendMessage(msg.key.remoteJid, { text: textToSay });
  } else {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide something for me to say (e.g., !say Hello everyone!).' });
  }
}

async function handleRepeat(sock, msg, args) {
  const textToRepeat = args.join(' ');
  if (textToRepeat) {
    await sock.sendMessage(msg.key.remoteJid, { text: textToRepeat });
  } else {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide text for me to repeat (e.g., !repeat This is fun!).' });
  }
}

module.exports = {
  handleMenuCommand,
  handleMenuSelection,
  handleHello,
  handleCreator,
  handlePing,
  handleSay,
  handleRepeat,
};

// In your commands/user.js

const userProfiles = {}; // In-memory storage for user profiles (replace with persistent storage later)
const userBios = {};     // In-memory storage for user bios (replace with persistent storage later)
const userWarnings = {}; // In-memory storage for user warnings (replace with persistent storage later)
const featureRequests = [];
const feedbackMessages = [];
const adminContacts = [];
const userNicknames = {}; // In-memory storage for user nicknames (replace with persistent storage later)

async function handleProfile(bot, message) {
  const userId = message.from;
  const profile = userProfiles[userId] || { name: 'User', joined: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  const bio = userBios[userId] || 'No bio set.';
  await bot.sendMessage(message.from, `👤 *Your Profile*\nName: ${profile.name}\nJoined: ${profile.joined}\nBio: ${bio}`);
}

async function handleSetProfile(bot, message, args) {
  const newName = args.join(' ');
  if (!newName) {
    await bot.sendMessage(message.from, 'Please provide a name to set for your profile (e.g., !setprofile John Doe).');
    return;
  }
  userProfiles[message.from] = { name: newName, joined: userProfiles[message.from]?.joined || new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  await bot.sendMessage(message.from, `✅ Your profile name has been updated to: ${newName}`);
}

async function handleBio(bot, message) {
  const bio = userBios[message.from] || 'No bio set.';
  await bot.sendMessage(message.from, `✍️ *Your Bio:*\n${bio}`);
}

async function handleSetBio(bot, message, args) {
  const newBio = args.join(' ');
  if (!newBio) {
    await bot.sendMessage(message.from, 'Please provide a bio to set for your profile (e.g., !setbio Loves coding and pizza!).');
    return;
  }
  userBios[message.from] = newBio;
  await bot.sendMessage(message.from, `✅ Your bio has been updated to:\n${newBio}`);
}

async function handleReportUser(bot, message, args) {
  if (!message.mentionedJidList || message.mentionedJidList.length === 0 || !args[1]) {
    await bot.sendMessage(message.from, 'Usage: !report @user [reason]');
    return;
  }
  const reportedUser = message.mentionedJidList[0];
  const reason = args.slice(1).join(' ');
  const reportDetails = { reporter: message.from, reported: reportedUser, reason: reason, timestamp: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  // In a real scenario, you would store this report data
  console.log('User Report:', reportDetails);
  await bot.sendMessage(message.from, `✅ User @${reportedUser.split('@')[0]} has been reported for: ${reason}`);
}

async function handleWarns(bot, message) {
  const userId = message.from;
  const warnings = userWarnings[userId] || [];
  if (warnings.length > 0) {
    let warnsText = `⚠️ *Your Warnings:*\n`;
    warnings.forEach((warn, index) => {
      warnsText += `${index + 1}. Reason: ${warn.reason} (Given on: ${warn.timestamp})\n`;
    });
    await bot.sendMessage(message.from, warnsText);
  } else {
    await bot.sendMessage(message.from, '✅ You have no warnings.');
  }
}

async function handleRequestFeature(bot, message, args) {
  const suggestion = args.join(' ');
  if (!suggestion) {
    await bot.sendMessage(message.from, 'Please provide your feature suggestion (e.g., !request Add a music download command).');
    return;
  }
  const requestDetails = { user: message.from, suggestion: suggestion, timestamp: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  featureRequests.push(requestDetails);
  console.log('Feature Request:', requestDetails);
  await bot.sendMessage(message.from, '✅ Thank you for your suggestion! It has been recorded.');
}

async function handleFeedback(bot, message, args) {
  const feedbackText = args.join(' ');
  if (!feedbackText) {
    await bot.sendMessage(message.from, 'Please provide your feedback (e.g., !feedback The bot is very helpful!).');
    return;
  }
  const feedbackDetails = { user: message.from, feedback: feedbackText, timestamp: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  feedbackMessages.push(feedbackDetails);
  console.log('Feedback Received:', feedbackDetails);
  await bot.sendMessage(message.from, '✅ Thank you for your feedback!');
}

async function handleContactAdmin(bot, message, args) {
  const adminMessage = args.join(' ');
  if (!adminMessage) {
    await bot.sendMessage(message.from, 'Please provide the message you want to send to the admins (e.g., !contactadmin I need help with...).');
    return;
  }
  const contactDetails = { user: message.from, message: adminMessage, timestamp: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  adminContacts.push(contactDetails);
  console.log('Admin Contact:', contactDetails);
  await bot.sendMessage(message.from, '✅ Your message has been sent to the bot administrators.');
  // In a real scenario, you would forward this message to the actual admin(s).
}

async function handleSetNickname(bot, message, args) {
  if (!message.mentionedJidList || message.mentionedJidList.length === 0 || !args[1]) {
    await bot.sendMessage(message.from, 'Usage: !setnickname @user [nickname]');
    return;
  }
  const targetUser = message.mentionedJidList[0];
  const nickname = args.slice(1).join(' ');
  userNicknames[targetUser] = nickname;
  await bot.sendMessage(message.from, `✅ Nickname for @${targetUser.split('@')[0]} set to: ${nickname}`);
  // Note: Nicknames are usually specific to a group and might require group context.
  // This implementation is a simple global storage.
}

module.exports = {
  handleProfile,
  handleSetProfile,
  handleBio,
  handleSetBio,
  handleReportUser,
  handleWarns,
  handleRequestFeature,
  handleFeedback,
  handleContactAdmin,
  handleSetNickname,
};

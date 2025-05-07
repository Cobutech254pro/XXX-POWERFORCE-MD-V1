// In your commands/user.js

const userProfiles = {}; // In-memory storage for user profiles (will be reset on bot restart)
// For a persistent solution, consider using a database or a JSON file.

async function handleProfile(bot, message) {
  const userId = message.from;
  const profile = userProfiles[userId] || {};
  const name = profile.name || message.pushName || 'User';
  const bio = profile.bio || 'No bio set.';

  const profileText = `*Your Profile*\n\n*Name:* ${name}\n*Bio:* ${bio}`;
  await bot.sendMessage(message.from, profileText);
}

async function handleSetProfile(bot, message, args) {
  const userId = message.from;
  const newName = args.join(' ');
  if (!newName) {
    await bot.sendMessage(message.from, 'Please provide a name to set for your profile.');
    return;
  }
  userProfiles[userId] = userProfiles[userId] || {};
  userProfiles[userId].name = newName;
  await bot.sendMessage(message.from, `Your profile name has been set to: ${newName}`);
}

async function handleBio(bot, message) {
  const userId = message.from;
  const profile = userProfiles[userId] || {};
  const bio = profile.bio || 'No bio set.';
  await bot.sendMessage(message.from, `*Your Bio:*\n\n${bio}`);
}

async function handleSetBio(bot, message, args) {
  const userId = message.from;
  const newBio = args.join(' ');
  if (!newBio) {
    await bot.sendMessage(message.from, 'Please provide a bio to set for your profile.');
    return;
  }
  userProfiles[userId] = userProfiles[userId] || {};
  userProfiles[userId].bio = newBio;
  await bot.sendMessage(message.from, `Your bio has been set to:\n\n${newBio}`);
}

async function handleReportUser(bot, message, args) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  if (!message.quotedMessage) {
    await bot.sendMessage(message.from, 'Please reply to the user you want to report.');
    return;
  }
  const reportedUser = await message.getQuotedMessage().getContact();
  const reason = args.join(' ') || 'No reason provided.';
  const reporter = message.author || message.from;
  await bot.sendMessage(message.from, `Report sent for ${reportedUser.pushName || reportedUser.number} with reason: ${reason}`);
  // You would typically log this report or notify group admins here.
}

async function handleWarns(bot, message) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const userId = message.from;
  // You'll need a system to store and retrieve user warnings per group.
  // For simplicity, we'll send a placeholder message.
  await bot.sendMessage(message.from, 'Checking your warnings... (Warning system not yet implemented).');
  // Implement logic to fetch and display user's warnings in the current group.
}

async function handleRequestFeature(bot, message, args) {
  const suggestion = args.join(' ');
  if (!suggestion) {
    await bot.sendMessage(message.from, 'Please provide your feature suggestion.');
    return;
  }
  const userId = message.from;
  await bot.sendMessage(message.from, `Thank you for your suggestion: ${suggestion}. It has been recorded.`);
  // You would typically store these suggestions (e.g., in a file or database).
}

async function handleFeedback(bot, message, args) {
  const feedbackText = args.join(' ');
  if (!feedbackText) {
    await bot.sendMessage(message.from, 'Please provide your feedback.');
    return;
  }
  const userId = message.from;
  await bot.sendMessage(message.from, `Thank you for your feedback: ${feedbackText}. It has been recorded.`);
  // You would typically store this feedback.
}

async function handleContactAdmin(bot, message, args) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const contactMessage = args.join(' ');
  if (!contactMessage) {
    await bot.sendMessage(message.from, 'Please provide the message you want to send to the admins.');
    return;
  }
  const admins = chat.participants.filter(p => p.isAdmin).map(p => p.id._serialized);
  if (admins.length === 0) {
    await bot.sendMessage(message.from, 'No admins found in this group.');
    return;
  }
  const userId = message.from;
  const userContact = await bot.getContactById(userId);
  const tagText = `👤 *Admin Contact Request:*\n\nFrom: ${userContact.pushName || userContact.number}\nMessage: ${contactMessage}`;
  let mentions = [];
  for (const adminId of admins) {
    mentions.push(adminId);
  }
  await bot.sendMessage(message.from, 'Your message has been sent to the group admins.');
  await bot.sendMessage(chat.id._serialized, tagText, { mentions });
}

async function handleSetNickname(bot, message, args) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const newNickname = args.join(' ');
  if (!newNickname) {
    await bot.sendMessage(message.from, 'Please provide the nickname you want to set.');
    return;
  }
  // This functionality might depend on the WhatsApp library and group settings.
  // It might involve sending a request to group admins or setting a local display name.
  await bot.sendMessage(message.from, `Request to set nickname "${newNickname}" has been sent (functionality may vary).`);
  // Implement the actual nickname setting or request logic.
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

// In your commands/user.js

// In-memory storage (replace with persistent storage later)
const userProfiles = {};
const userBios = {};
const userWarnings = {};
const featureRequests = [];
const feedbackMessages = [];
const adminContacts = [];
const userNicknames = {};

// Bot owner number (replace with your number including country code - ensure no leading '+')
const botOwnerNumber = 'YOUR_BOT_OWNER_NUMBER';
const botAdmins = ['ADMIN_NUMBER_1', 'ADMIN_NUMBER_2']; // Add other admin numbers (ensure no leading '+')

// In-memory state for auto-read
let autoReadEnabled = false;

async function isBotAdmin(sock, msg) {
  const sender = msg.key.participant || msg.key.remoteJid;
  const senderNumber = sender.split(':')[0] || sender.split('@')[0];
  const sockNumber = sock.user.id.split(':')[0] || sock.user.id.split('@')[0];

  if (senderNumber === botOwnerNumber) return true;
  if (botAdmins.includes(senderNumber)) return true;

  if (msg.key.remoteJid.endsWith('@g.us')) {
    const metadata = await sock.groupMetadata(msg.key.remoteJid);
    if (metadata) {
      const participant = metadata.participants.find(p => (p.id.split(':')[0] || p.id.split('@')[0]) === senderNumber);
      return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    }
  }
  return false;
}

async function handleProfile(sock, msg) {
  const userId = msg.key.remoteJid;
  const profile = userProfiles[userId] || { name: msg.pushName || 'User', joined: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  const bio = userBios[userId] || 'No bio set.';
  await sock.sendMessage(msg.key.remoteJid, { text: `👤 *Your Profile*\nName: ${profile.name}\nJoined: ${profile.joined}\nBio: ${bio}` });
}

async function handleSetProfile(sock, msg, args) {
  const newName = args.join(' ');
  if (!newName) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a name to set for your profile (e.g., !setprofile John Doe).' });
    return;
  }
  userProfiles[msg.key.remoteJid] = { name: newName, joined: userProfiles[msg.key.remoteJid]?.joined || new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  await sock.sendMessage(msg.key.remoteJid, { text: `✅ Your profile name has been updated to: ${newName}` });
}

async function handleBio(sock, msg) {
  const bio = userBios[msg.key.remoteJid] || 'No bio set.';
  await sock.sendMessage(msg.key.remoteJid, { text: `✍️ *Your Bio:*\n${bio}` });
}

async function handleSetBio(sock, msg, args) {
  const newBio = args.join(' ');
  if (!newBio) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a bio to set for your profile (e.g., !setbio Loves coding and pizza!).' });
    return;
  }
  userBios[msg.key.remoteJid] = newBio;
  await sock.sendMessage(msg.key.remoteJid, { text: `✅ Your bio has been updated to:\n${newBio}` });
}

async function handleReportUser(sock, msg, args) {
  if (!msg.quotedMessage || !args[0]) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !report [reply to user] [reason]' });
    return;
  }

  const quoted = await sock.loadMessage(msg.key.remoteJid, msg.quotedMessage.stanzaId);
  const reportedUser = quoted.key.participant || quoted.key.remoteJid;
  const reason = args.join(' ');
  const reporter = msg.key.remoteJid;
  const reportDetails = { reporter: reporter, reported: reportedUser, reason: reason, timestamp: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  console.log('User Report:', reportDetails);
  await sock.sendMessage(msg.key.remoteJid, { text: `✅ User reported for: ${reason}` });
  // In a real scenario, you would store this report data and potentially notify admins.
}

async function handleWarns(sock, msg) {
  const userId = msg.key.remoteJid;
  const warnings = userWarnings[userId] || [];
  if (warnings.length > 0) {
    let warnsText = `⚠️ *Your Warnings:*\n`;
    warnings.forEach((warn, index) => {
      warnsText += `${index + 1}. Reason: ${warn.reason} (Given on: ${warn.timestamp})\n`;
    });
    await sock.sendMessage(msg.key.remoteJid, { text: warnsText });
  } else {
    await sock.sendMessage(msg.key.remoteJid, { text: '✅ You have no warnings.' });
  }
}

async function handleRequestFeature(sock, msg, args) {
  const suggestion = args.join(' ');
  if (!suggestion) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide your feature suggestion (e.g., !request Add a music download command).' });
    return;
  }
  const requestDetails = { user: msg.key.remoteJid, suggestion: suggestion, timestamp: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  featureRequests.push(requestDetails);
  console.log('Feature Request:', requestDetails);
  await sock.sendMessage(msg.key.remoteJid, { text: '✅ Thank you for your suggestion! It has been recorded.' });
}

async function handleFeedback(sock, msg, args) {
  const feedbackText = args.join(' ');
  if (!feedbackText) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide your feedback (e.g., !feedback The bot is very helpful!).' });
    return;
  }
  const feedbackDetails = { user: msg.key.remoteJid, feedback: feedbackText, timestamp: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  feedbackMessages.push(feedbackDetails);
  console.log('Feedback Received:', feedbackDetails);
  await sock.sendMessage(msg.key.remoteJid, { text: '✅ Thank you for your feedback!' });
}

async function handleContactAdmin(sock, msg, args) {
  const adminMessage = args.join(' ');
  if (!adminMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide the message you want to send to the admins (e.g., !contactadmin I need help with...).' });
    return;
  }
  const contactDetails = { user: msg.key.remoteJid, message: adminMessage, timestamp: new Date().toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' }) };
  adminContacts.push(contactDetails);
  console.log('Admin Contact:', contactDetails);
  await sock.sendMessage(msg.key.remoteJid, { text: '✅ Your message has been sent to the bot administrators.' });
  // In a real scenario, you would forward this message to the actual admin(s).
}

async function handleSetNickname(sock, msg, args) {
  if (!msg.quotedMessage || !args[0]) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !setnickname [reply to user] [nickname]' });
    return;
  }
  const quoted = await sock.loadMessage(msg.key.remoteJid, msg.quotedMessage.stanzaId);
  const targetUser = quoted.key.participant || quoted.key.remoteJid;
  const nickname = args.join(' ');
  userNicknames[targetUser] = nickname;
  await sock.sendMessage(msg.key.remoteJid, { text: `✅ Nickname set to: ${nickname} for the user you replied to.` });
  // Note: Nicknames are usually specific to a group and might require group context.
  // This implementation is a simple global storage.
}

async function handleDeleteMessage(sock, msg) {
  if (!await isBotAdmin(sock, msg)) {
    await sock.sendMessage(msg.key.remoteJid, { text: '🚫 This command is only for bot owners and administrators.' });
    return;
  }

  if (!msg.quotedMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to the message you want to delete with the !delete command.' });
    return;
  }

  try {
    const quoted = await sock.loadMessage(msg.key.remoteJid, msg.quotedMessage.stanzaId);
    await sock.sendMessage(msg.key.remoteJid, { delete: quoted.key });
    await sock.sendMessage(msg.key.remoteJid, '✅ Message deleted successfully.');
  } catch (error) {
    console.error('Error deleting message:', error);
    await sock.sendMessage(msg.key.remoteJid, '❌ Failed to delete the message.');
  }
}

async function handleAutoRead(sock, msg, args) {
  if (!await isBotAdmin(sock, msg)) {
    await sock.sendMessage(msg.key.remoteJid, { text: '🚫 This command is only for bot owners and administrators.' });
    return;
  }

  const action = args[0] ? args[0].toLowerCase() : '';
  if (action === 'on') {
    autoReadEnabled = true;
    await sock.sendMessage(msg.key.remoteJid, { text: '✅ Auto-read enabled.' });
  } else if (action === 'off') {
    autoReadEnabled = false;
    await sock.sendMessage(msg.key.remoteJid, { text: '✅ Auto-read disabled.' });
  } else {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !autoread on | off' });
  }
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
  handleDeleteMessage,
  handleAutoRead,
};

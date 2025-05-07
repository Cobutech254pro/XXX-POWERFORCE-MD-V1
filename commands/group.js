// In your commands/group.js

async function handleGroupInfo(bot, message) {
  try {
    const chat = await message.getChat();

    if (!chat.isGroup) {
      await bot.sendMessage(message.from, 'This command can only be used in groups.');
      return;
    }

    let adminList = [];
    for (let participant of chat.participants) {
      if (participant.isAdmin) {
        const contact = await bot.getContactById(participant.id._serialized);
        adminList.push(`@${contact.number}`);
      }
    }

    const description = chat.description || 'No description set.';
    const owner = chat.owner ? `@${(await bot.getContactById(chat.owner._serialized)).number}` : 'No owner info.';

    let info = `*Group Information*\n\n`;
    info += `*Name:* ${chat.name}\n`;
    info += `*ID:* ${chat.id._serialized}\n`;
    info += `*Description:* ${description}\n`;
    info += `*Owner:* ${owner}\n`;
    info += `*Participants:* ${chat.participants.length}\n`;
    if (adminList.length > 0) {
      info += `*Admins:* ${adminList.join(', ')}\n`;
    } else {
      info += `*Admins:* No admins besides the owner (potentially).\n`;
    }
    try {
      info += `*Invite Link:* ${await chat.getInviteCode()}\n`; // This might fail if the bot doesn't have permission
    } catch (error) {
      info += `*Invite Link:* Could not retrieve invite link (requires permissions).\n`;
      console.error('Error getting invite code:', error);
    }

    await bot.sendMessage(message.from, info, { mentions: [...adminList.map(admin => admin.replace('@', ''))] });

  } catch (error) {
    console.error('Error fetching group info:', error);
    await bot.sendMessage(message.from, 'An error occurred while fetching group information.');
  }
}

async function handleMentionAll(bot, message) {
  try {
    const chat = await message.getChat();

    if (!chat.isGroup) {
      await bot.sendMessage(message.from, 'This command can only be used in groups.');
      return;
    }

    let mentions = [];
    let tagText = '📢 *Attention All*\n\n';

    for (let participant of chat.participants) {
      const contact = await bot.getContactById(participant.id._serialized);
      mentions.push(contact.number);
      tagText += `@${contact.number} `;
    }

    await bot.sendMessage(message.from, tagText.trim(), { mentions });

  } catch (error) {
    console.error('Error mentioning all:', error);
    await bot.sendMessage(message.from, 'An error occurred while trying to mention everyone.');
  }
}

async function handleRules(bot, message) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  // You'll need a way to store and retrieve group rules.
  // This could be from a database, a JSON file, or even a simple variable.
  const rules = "No spamming.\nBe respectful.\nFollow group guidelines."; // Example rules
  await bot.sendMessage(message.from, `*Group Rules:*\n\n${rules}`);
}

async function handleReport(bot, message, args) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  if (!message.quotedMessage) {
    await bot.sendMessage(message.from, 'Please reply to the message you want to report.');
    return;
  }
  const quotedMessage = await message.getQuotedMessage();
  const reason = args.join(' ') || 'No reason provided.';
  const reporter = message.author || message.from;
  await bot.sendMessage(message.from, `Report sent for message from ${quotedMessage.author || quotedMessage.from}: "${quotedMessage.body}" with reason: ${reason}`);
  // You would typically log this report or notify group admins here.
}

async function handleReportAdmin(bot, message, args) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const admins = chat.participants.filter(p => p.isAdmin).map(p => p.id._serialized);
  if (admins.length === 0) {
    await bot.sendMessage(message.from, 'No admins found in this group.');
    return;
  }
  const reason = args.join(' ') || 'No reason provided.';
  const reporter = message.author || message.from;
  let adminMentions = [];
  let adminTagText = `🚨 *Admin Notification*\n\nReport from ${reporter} regarding: ${reason}\n\n`;
  for (const adminId of admins) {
    adminMentions.push(adminId);
    adminTagText += `@${adminId.split('@')[0]} `;
  }
  await bot.sendMessage(message.from, 'Admin notification sent.');
  await bot.sendMessage(chat.id._serialized, adminTagText.trim(), { mentions: adminMentions });
}

async function handleLeaveGroup(bot, message) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const isAdmin = chat.participants.find(p => p.id._serialized === bot.info.wid._serialized && p.isAdmin);
  if (!isAdmin && chat.owner.user !== bot.info.wid.user) {
    await bot.sendMessage(message.from, 'Bot must be an admin or the group owner to use this command.');
    return;
  }
  await chat.leave();
}

async function handleAdd(bot, message, args) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const isAdmin = chat.participants.find(p => p.id._serialized === bot.info.wid._serialized && p.isAdmin);
  if (!isAdmin) {
    await bot.sendMessage(message.from, 'Bot must be an admin to use this command.');
    return;
  }
  if (args.length === 0) {
    await bot.sendMessage(message.from, 'Please provide the phone number(s) to add (e.g., !add 2547xxxxxxxx).');
    return;
  }
  const numbersToAdd = args.map(arg => arg.includes('@c.us') ? arg : `${arg}@c.us`);
  try {
    await chat.addParticipants(numbersToAdd);
    await bot.sendMessage(message.from, `Attempting to add ${numbersToAdd.join(', ')}.`);
  } catch (error) {
    console.error('Error adding participants:', error);
    await bot.sendMessage(message.from, 'Failed to add participants. Ensure the numbers are valid and the bot has permission.');
  }
}

async function handleRemove(bot, message) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const isAdmin = chat.participants.find(p => p.id._serialized === bot.info.wid._serialized && p.isAdmin);
  if (!isAdmin) {
    await bot.sendMessage(message.from, 'Bot must be an admin to use this command.');
    return;
  }
  if (!message.quotedMessage) {
    await bot.sendMessage(message.from, 'Please reply to the user you want to remove.');
    return;
  }
  const userToRemove = await message.getQuotedMessage().getContact();
  try {
    await chat.removeParticipants([userToRemove.id._serialized]);
    await bot.sendMessage(message.from, `Removed ${userToRemove.pushName || userToRemove.number} from the group.`);
  } catch (error) {
    console.error('Error removing participant:', error);
    await bot.sendMessage(message.from, 'Failed to remove participant. Ensure the bot has permission.');
  }
}

async function handlePromote(bot, message) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const isAdmin = chat.participants.find(p => p.id._serialized === bot.info.wid._serialized && p.isAdmin);
  if (!isAdmin) {
    await bot.sendMessage(message.from, 'Bot must be an admin to use this command.');
    return;
  }
  if (!message.quotedMessage) {
    await bot.sendMessage(message.from, 'Please reply to the user you want to promote.');
    return;
  }
  const userToPromote = await message.getQuotedMessage().getContact();
  try {
    await chat.promoteParticipants([userToPromote.id._serialized]);
    await bot.sendMessage(message.from, `Promoted ${userToPromote.pushName || userToPromote.number} to admin.`);
  } catch (error) {
    console.error('Error promoting participant:', error);
    await bot.sendMessage(message.from, 'Failed to promote participant. Ensure the bot has permission.');
  }
}

async function handleDemote(bot, message) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const isAdmin = chat.participants.find(p => p.id._serialized === bot.info.wid._serialized && p.isAdmin);
  if (!isAdmin) {
    await bot.sendMessage(message.from, 'Bot must be an admin to use this command.');
    return;
  }
  if (!message.quotedMessage) {
    await bot.sendMessage(message.from, 'Please reply to the user you want to demote.');
    return;
  }
  const userToDemote = await message.getQuotedMessage().getContact();
  try {
    await chat.demoteParticipants([userToDemote.id._serialized]);
    await bot.sendMessage(message.from, `Demoted ${userToDemote.pushName || userToDemote.number} from admin.`);
  } catch (error) {
    console.error('Error demoting participant:', error);
    await bot.sendMessage(message.from, 'Failed to demote participant. Ensure the bot has permission.');
  }
}

async function handleSetName(bot, message, args) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const isAdmin = chat.participants.find(p => p.id._serialized === bot.info.wid._serialized && p.isAdmin);
  if (!isAdmin) {
    await bot.sendMessage(message.from, 'Bot must be an admin to use this command.');
    return;
  }
  const newName = args.join(' ');
  if (!newName) {
    await bot.sendMessage(message.from, 'Please provide a new group name.');
    return;
  }
  try {
    await chat.setName(newName);
    await bot.sendMessage(message.from, `Group name updated to: ${newName}`);
  } catch (error) {
    console.error('Error setting group name:', error);
    await bot.sendMessage(message.from, 'Failed to set group name. Ensure the bot has permission.');
  }
}

async function handleSetDescription(bot, message, args) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const isAdmin = chat.participants.find(p => p.id._serialized === bot.info.wid._serialized && p.isAdmin);
  if (!isAdmin) {
    await bot.sendMessage(message.from, 'Bot must be an admin to use this command.');
    return;
  }
  const newDescription = args.join(' ');
  try {
    await chat.setDescription(newDescription);
    await bot.sendMessage(message.from, `Group description updated to: ${newDescription}`);
  } catch (error) {
    console.error('Error setting group description:', error);
    await bot.sendMessage(message.from, 'Failed to set group description. Ensure the bot has permission.');
  }
}

async function handlePin(bot, message) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const isAdmin = chat.participants.find(p => p.id._serialized === bot.info.wid._serialized && p.isAdmin);
  if (!isAdmin) {
    await bot.sendMessage(message.from, 'Bot must be an admin to use this command.');
    return;
  }
  if (!message.quotedMessage) {
    await bot.sendMessage(message.from, 'Please reply to the message you want to pin.');
    return;
  }
  try {
    await message.quotedMessage.pin(true);
    await bot.sendMessage(message.from, 'Message pinned successfully.');
  } catch (error) {
    console.error('Error pinning message:', error);
    await bot.sendMessage(message.from, 'Failed to pin message. Ensure the bot has permission.');
  }
}

async function handleUnpin(bot, message) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const isAdmin = chat.participants.find(p => p.id._serialized === bot.info.wid._serialized && p.isAdmin);
  if (!isAdmin) {
    await bot.sendMessage(message.from, 'Bot must be an admin to use this command.');
    return;
  }
  try {
    await chat.unpinMessage(); // Unpins the currently pinned message
    await bot.sendMessage(message.from, 'Message unpinned successfully.');
  } catch (error) {
    console.error('Error unpinning message:', error);
    await bot.sendMessage(message.from, 'Failed to unpin message. Ensure there is a message pinned and the bot has permission.');
  }
}

async function handleWarn(bot, message, args) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const isAdmin = chat.participants.find(p => p.id._serialized === bot.info.wid._serialized && p.isAdmin);
  if (!isAdmin) {
    await bot.sendMessage(message.from, 'Bot must be an admin to use this command.');
    return;
  }
  if (!message.quotedMessage) {
    await bot.sendMessage(message.from, 'Please reply to the user you want to warn.');
    return;
  }
  const userToWarn = await message.getQuotedMessage().getContact();
  const reason = args.join(' ') || 'No reason provided.';
  // You'll need a system to store and track warnings (e.g., in your data/group-settings.json).
  // For simplicity, we'll just send a message for now.
  await bot.sendMessage(message.from, `${userToWarn.pushName || userToWarn.number} warned for: ${reason}`);
  // Implement your warning storage and tracking logic here.
}

async function handleMute(bot, message, args) {
  const chat = await message.getChat();
  if (!chat.isGroup) {
    await bot.sendMessage(message.from, 'This command can only be used in groups.');
    return;
  }
  const isAdmin = chat.participants.find(p => p.id._serialized === bot.info.wid._serialized && p.isAdmin);
  if (!isAdmin) {
    await bot.sendMessage(message.from, 'Bot must be an admin to use this command.');
    return;
  }
  if (!message.quotedMessage) {
    await bot.sendMessage(message.from, 'Please reply to the user you want to mute.');
    return;
  }
  const userToMute = await message.getQuotedMessage().getContact();
  const duration = args[0] || 'temporary'; // Example: !

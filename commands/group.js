// In your commands/group.js

async function handleGroupInfo(sock, msg) {
  try {
    const chat = await sock.groupMetadata(msg.key.remoteJid);

    if (!chat) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group information.' });
      return;
    }

    let adminList = [];
    for (let participant of chat.participants) {
      if (participant.admin === 'admin' || participant.admin === 'superadmin') {
        adminList.push(participant.id.split(':')[0]); // Extract number part of JID
      }
    }

    const description = chat.description || 'No description set.';
    const owner = chat.owner ? chat.owner.split(':')[0] : 'No owner info.'; // Extract number part of JID

    let info = `*Group Information*\n\n`;
    info += `*Name:* ${chat.subject}\n`;
    info += `*ID:* ${chat.id}\n`;
    info += `*Description:* ${description}\n`;
    info += `*Owner:* @${owner}\n`;
    info += `*Participants:* ${chat.participants.length}\n`;
    if (adminList.length > 0) {
      info += `*Admins:* ${adminList.map(admin => `@${admin}`).join(', ')}\n`;
    } else {
      info += `*Admins:* No admins besides the owner (potentially).\n`;
    }
    try {
      const inviteCode = await sock.groupInviteCode(msg.key.remoteJid);
      info += `*Invite Link:* https://chat.whatsapp.com/${inviteCode}\n`;
    } catch (error) {
      info += `*Invite Link:* Could not retrieve invite link (requires permissions).\n`;
      console.error('Error getting invite code:', error);
    }

    const mentions = [...adminList.map(admin => admin + '@s.whatsapp.net'), owner + '@s.whatsapp.net'].filter(Boolean);
    await sock.sendMessage(msg.key.remoteJid, { text: info, mentions });

  } catch (error) {
    console.error('Error fetching group info:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'An error occurred while fetching group information.' });
  }
}

async function handleMentionAll(sock, msg) {
  try {
    const metadata = await sock.groupMetadata(msg.key.remoteJid);

    if (!metadata) {
      await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
      return;
    }

    let mentions = metadata.participants.map(p => p.id);
    let tagText = '📢 *Attention All*\n\n';

    for (let participant of metadata.participants) {
      tagText += `@${participant.id.split(':')[0]} `;
    }

    await sock.sendMessage(msg.key.remoteJid, { text: tagText.trim(), mentions });

  } catch (error) {
    console.error('Error mentioning all:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'An error occurred while trying to mention everyone.' });
  }
}

async function handleRules(sock, msg) {
  // You'll need a way to store and retrieve group rules (e.g., from a database or JSON).
  const rules = "No spamming.\nBe respectful.\nFollow group guidelines."; // Example rules
  await sock.sendMessage(msg.key.remoteJid, { text: `*Group Rules:*\n\n${rules}` });
}

async function handleReport(sock, msg, args) {
  if (!msg.quotedMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to the message you want to report.' });
    return;
  }
  const quotedMessage = await sock.loadMessage(msg.key.remoteJid, msg.quotedMessage.stanzaId);
  const reporter = msg.key.participant || msg.key.remoteJid;
  const reportedUser = quotedMessage?.key?.participant || quotedMessage?.key?.remoteJid;
  const reason = args.join(' ') || 'No reason provided.';

  const reportText = `Report from ${reporter.split(':')[0]} regarding message from <span class="math-inline">\{reportedUser\.split\('\:'\)\[0\]\}\: "</span>{quotedMessage?.message?.conversation || quotedMessage?.message?.extendedTextMessage?.text || '(media message)'}" with reason: ${reason}`;
  await sock.sendMessage(msg.key.remoteJid, { text: reportText });
  // You would typically log this report or notify group admins here.
}

async function handleReportAdmin(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const admins = metadata.participants.filter(p => p.admin === 'admin' || p.admin === 'superadmin').map(p => p.id);
  if (admins.length === 0) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'No admins found in this group.' });
    return;
  }
  const reporter = msg.key.participant || msg.key.remoteJid;
  const reason = args.join(' ') || 'No reason provided.';
  let adminMentions = admins;
  let adminTagText = `🚨 *Admin Notification*\n\nReport from @${reporter.split(':')[0]} regarding: ${reason}\n\n`;
  for (const adminId of admins) {
    adminTagText += `@${adminId.split(':')[0]} `;
  }
  await sock.sendMessage(msg.key.remoteJid, { text: 'Admin notification sent.' });
  await sock.sendMessage(msg.key.remoteJid, { text: adminTagText.trim(), mentions: adminMentions });
}

async function handleLeaveGroup(sock, msg) {
  try {
    await sock.groupLeave(msg.key.remoteJid);
  } catch (error) {
    console.error('Error leaving group:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to leave the group.' });
  }
}

async function handleAdd(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  if (args.length === 0) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide the phone number(s) to add (e.g., !add 2547xxxxxxxx).' });
    return;
  }
  const numbersToAdd = args.map(arg => arg.startsWith('+') ? arg.replace('+', '') : arg);
  const jidsToAdd = numbersToAdd.map(num => `${num}@s.whatsapp.net`);
  try {
    const results = await sock.groupParticipantsUpdate(msg.key.remoteJid, jidsToAdd, 'add');
    for (const jid in results) {
      const result = results[jid];
      if (result === '409') {
        await sock.sendMessage(msg.key.remoteJid, { text: `Could not add ${jid.split('@')[0]}. User may already be in the group or have a privacy setting.` });
      } else if (result === '200') {
        await sock.sendMessage(msg.key.remoteJid, { text: `Successfully added ${jid.split('@')[0]}.` });
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: `Failed to add ${jid.split('@')[0]}. Error: ${result}` });
      }
    }
  } catch (error) {
    console.error('Error adding participants:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to add participants. Ensure the numbers are valid and the bot has permission.' });
  }
}

async function handleRemove(sock, msg) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  if (!msg.quotedMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to the user you want to remove.' });
    return;
  }
  const userToRemoveJid = msg.quotedMessage.key.participant || msg.quotedMessage.key.remoteJid;
  try {
    const results = await sock.groupParticipantsUpdate(msg.key.remoteJid, [userToRemoveJid], 'remove');
    if (results[userToRemoveJid] === '200') {
      await sock.sendMessage(msg.key.remoteJid, { text: `Removed ${userToRemoveJid.split(':')[0]} from the group.` });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: `Failed to remove ${userToRemoveJid.split(':')[0]}. Error: ${results[userToRemoveJid]}` });
    }
  } catch (error) {
    console.error('Error removing participant:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to remove participant. Ensure the bot has permission.' });
  }
}

async function handlePromote(sock, msg) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  if (!msg.quotedMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to the user you want to promote.' });
    return;
  }
  const userToPromoteJid = msg.quotedMessage.key.participant || msg.quotedMessage.key.remoteJid;
  try {
    const results = await sock.groupParticipantsUpdate(msg.key.remoteJid, [userToPromoteJid], 'promote');
    if (results[userToPromoteJid] === '200') {
      await sock.sendMessage(msg.key.remoteJid, { text: `Promoted ${userToPromoteJid.split(':')[0]} to admin.` });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: `Failed to promote ${userToPromoteJid.split(':')[0]}. Error: ${results[userToPromoteJid]}` });
    }
  } catch (error) {
    console.error('Error promoting participant:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to promote participant. Ensure the bot has permission.' });
  }
}

async function handleDemote(sock, msg) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  if (!msg.quotedMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to the user you want to demote.' });
    return;
  }
  const userToDemoteJid = msg.quotedMessage.key.participant || msg.quotedMessage.key.remoteJid;
  try {
    const results = await sock.groupParticipantsUpdate(msg.key.remoteJid, [userToDemoteJid], 'demote');
    if (results[userToDemoteJid] === '200') {
      await sock.sendMessage(msg.key.remoteJid, { text: `Demoted ${userToDemoteJid.split(':')[0]} from admin.` });
    } else {
      await sock.sendMessage(msg.key.remoteJid, { text: `Failed to demote ${userToDemoteJid.split(':')[0]}. Error: ${results[userToDemoteJid]}` });
    }
  } catch (error) {
    console.error('Error demoting participant:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to demote participant. Ensure the bot has permission.' });
  }
}

async function handleSetName(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  const newName = args.join(' ');
  if (!newName) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a new group name.' });
    return;
  }
  try {
    await sock.groupUpdateSubject(msg.key.remoteJid, newName);
    await sock.sendMessage(msg.key.remoteJid, { text: `Group name updated to: ${newName}` });
  } catch (error) {
    console.error('Error setting group name:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to set group name. Ensure the bot has permission.' });
  }
}

async function handleSetDescription(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  const newDescription = args.join(' ');
  try {
    await sock.groupUpdateDescription(msg.key.remoteJid, newDescription);
    await sock.sendMessage(msg.key.remoteJid, { text: `Group description updated to: ${newDescription}` });
  } catch (error) {
    console.error('Error setting group description:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to set group description. Ensure the bot has permission.' });
  }
}// In your commands/group.js (continued)

async function handlePin(sock, msg) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  if (!msg.quotedMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to the message you want to pin.' });
    return;
  }
  try {
    await sock.chatModify({ pin: true }, msg.quotedMessage.key);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Message pinned successfully.' });
  } catch (error) {
    console.error('Error pinning message:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to pin message. Ensure the bot has permission.' });
  }
}

async function handleUnpin(sock, msg) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  try {
    await sock.chatModify({ pin: false }, await sock.fetchPinnedMessage(msg.key.remoteJid));
    await sock.sendMessage(msg.key.remoteJid, { text: 'Message unpinned successfully.' });
  } catch (error) {
    console.error('Error unpinning message:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to unpin message. Ensure there is a message pinned and the bot has permission.' });
  }
}

async function handleWarn(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  if (!msg.quotedMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to the user you want to warn.' });
    return;
  }
  const userToWarnJid = msg.quotedMessage.key.participant || msg.quotedMessage.key.remoteJid;
  const reason = args.join(' ') || 'No reason provided.';
  // You'll need a system to store and track warnings (e.g., in your data/group-settings.json).
  await sock.sendMessage(msg.key.remoteJid, { text: `@${userToWarnJid.split(':')[0]} warned for: ${reason}`, mentions: [userToWarnJid] });
  // Implement your warning storage and tracking logic here.
}

async function handleMute(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  if (!msg.quotedMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to the user you want to mute.' });
    return;
  }
  const userToMuteJid = msg.quotedMessage.key.participant || msg.quotedMessage.key.remoteJid;
  const duration = args[0] || 'temporary'; // You'll need to implement actual muting logic
  await sock.sendMessage(msg.key.remoteJid, { text: `@${userToMuteJid.split(':')[0]} muted for: ${duration}`, mentions: [userToMuteJid] });
  // Implement actual mute functionality (this often involves managing user permissions or using a separate mechanism).
}

async function handleUnmute(sock, msg) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  if (!msg.quotedMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to the user you want to unmute.' });
    return;
  }
  const userToUnmuteJid = msg.quotedMessage.key.participant || msg.quotedMessage.key.remoteJid;
  // Implement your unmute functionality here.
  await sock.sendMessage(msg.key.remoteJid, { text: `@${userToUnmuteJid.split(':')[0]} unmuted.`, mentions: [userToUnmuteJid] });
  // Implement actual unmute logic.
}

async function handleAdminOnly(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  const setting = args[0] ? args[0].toLowerCase() : '';
  // You'll need a way to store this setting per group.
  if (setting === 'on') {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot commands are now restricted to admins.' });
    // Implement logic in your message listener to check admin status for other commands.
  } else if (setting === 'off') {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot commands are now available to all members.' });
    // Implement logic to allow all members to use commands.
  } else {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !adminonly on/off' });
  }
}

async function handleAntiSticker(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  const setting = args[0] ? args[0].toLowerCase() : '';
  // Store this setting per group.
  if (setting === 'on') {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Anti-sticker is now enabled.' });
    // Implement logic in your message listener to delete stickers.
  } else if (setting === 'off') {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Anti-sticker is now disabled.' });
    // Remove the sticker deletion logic.
  } else {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !antisticker on/off' });
  }
}

async function handleAntiLink(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  const setting = args[0] ? args[0].toLowerCase() : '';
  // Store this setting per group.
  if (setting === 'on') {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Anti-link is now enabled.' });
    // Implement logic in your message listener to detect and delete links.
  } else if (setting === 'off') {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Anti-link is now disabled.' });
    // Remove the link detection logic.
  } else {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !antilink on/off' });
  }
}

async function handleKillGround(sock, msg) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const isOwner = metadata.owner?.split(':')[0] === sock.user.id.split(':')[0];
  if (!isOwner) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Only the group owner can use this command!' });
    return;
  }
  const participantsToRemove = metadata.participants
    .filter(p => !(p.admin === 'admin' || p.admin === 'superadmin') && p.id.split(':')[0] !== sock.user.id.split(':')[0])
    .map(p => p.id);

  if (participantsToRemove.length > 0) {
    try {
      const results = await sock.groupParticipantsUpdate(msg.key.remoteJid, participantsToRemove, 'remove');
      for (const jid in results) {
        if (results[jid] === '200') {
          await sock.sendMessage(msg.key.remoteJid, { text: `Removed ${jid.split(':')[0]}.` });
        } else {
          console.warn(`Failed to remove ${jid}:`, results[jid]);
        }
      }
      await sock.sendMessage(msg.key.remoteJid, { text: 'Initiating removal of all non-admin members...' });
    } catch (error) {
      console.error('Error removing all members:', error);
      await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to remove members. Ensure the bot has sufficient permissions.' });
    }
  } else {
    await sock.sendMessage(msg.key.remoteJid, { text: 'No non-admin members found to remove.' });
  }
}

async function handleAntiBot(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  const setting = args[0] ? args[0].toLowerCase() : '';
  // Store this setting per group.
  if (setting === 'on') {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Anti-bot is now enabled.' });
    // Implement logic in your message listener to identify and potentially remove other bots. This is complex and might involve heuristics.
  } else if (setting === 'off') {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Anti-bot is now disabled.' });
    // Remove the anti-bot logic.
  } else {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !antibot on/off' });
  }
}

async function handleWelcome(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  const welcomeMessage = args.join(' ');
  if (!welcomeMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a welcome message.' });
    return;
  }
  // Store this welcome message per group.
  await sock.sendMessage(msg.key.remoteJid, { text: `Welcome message set to: ${welcomeMessage}` });
  // Implement logic in your group join listener (in index.js) to send this message to new members.
}

async function handlePoll(sock, msg, args) {
  const [question, ...options] = args.join(' ').split(',');
  if (!question || options.length < 2) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !poll [question], [option1], [option2], ...' });
    return;
  }
  const trimmedOptions = options.map(opt => opt.trim());
  let pollText = `📊 *Poll: ${question.trim()}*\n\n`;
  const reactions = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯']; // Up to 10 options
  for (let i = 0; i < Math.min(trimmedOptions.length, reactions.length); i++) {
    pollText += `${reactions[i]} ${trimmedOptions[i]}\n`;
  }
  await sock.sendMessage(msg.key.remoteJid, { text: pollText });
  // You might want to implement actual poll tracking if needed, possibly using message reactions.
}

async function handleAnnounce(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.

async function handle// In your commands/group.js (continued)

async function handleAnnounce(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Bot must be an admin to use this command.' });
    return;
  }
  const announcement = args.join(' ');
  if (!announcement) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide the announcement message.' });
    return;
  }
  await sock.sendMessage(msg.key.remoteJid, { text: `📢 *Announcement:*\n\n${announcement}` });
}

async function handleFind(sock, msg, args) {
  const keyword = args.join(' ');
  if (!keyword) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a keyword to search for.' });
    return;
  }
  await sock.sendMessage(msg.key.remoteJid, { text: `Searching for messages containing "${keyword}"... (This feature is complex and might be resource-intensive or not fully implemented).` });
  // Implementing a full chat history search requires storing and indexing messages, which is beyond the scope of basic command handling.
}

async function handleBanGroup(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: '🚫 This command is only for group admins.' });
    return;
  }

  if (!args[0]?.startsWith('https://chat.whatsapp.com/')) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a valid WhatsApp group invite link (e.g., !bangroup https://chat.whatsapp.com/...).' });
    return;
  }

  const inviteLink = args[0];
  try {
    const groupInfo = await sock.groupGetInviteInfo(inviteLink);
    const groupId = groupInfo.id;
    const groupMetadataToBan = await sock.groupMetadata(groupId);

    if (!groupMetadataToBan) {
      await sock.sendMessage(msg.key.remoteJid, { text: '⚠️ Could not retrieve group information from the provided link.' });
      return;
    }

    await sock.sendMessage(msg.key.remoteJid, { text: `🔒 Attempting to ban group: ${groupMetadataToBan.subject || groupId}...` });

    // 1. Restrict sending to admins only
    await sock.groupUpdateSettings(groupId, { restrict: 'admins_only' });

    // 2. Remove all non-admin participants
    const participantsToRemove = groupMetadataToBan.participants
      .filter(p => !(p.admin === 'admin' || p.admin === 'superadmin') && p.id.split(':')[0] !== sock.user.id.split(':')[0])
      .map(p => p.id);

    if (participantsToRemove.length > 0) {
      const removalResults = await sock.groupParticipantsUpdate(groupId, participantsToRemove, 'remove');
      for (const jid in removalResults) {
        if (removalResults[jid] !== '200') {
          console.warn(`Failed to remove ${jid}:`, removalResults[jid]);
        }
      }
    }

    // 3. Revoke the invite link
    await sock.groupRevokeInvite(groupId);
    await sock.sendMessage(msg.key.remoteJid, { text: '🔗 Invite link revoked.' });

    await sock.sendMessage(msg.key.remoteJid, `✅ Group "${groupMetadataToBan.subject || groupId}" has been effectively banned (restricted to admins).`);

  } catch (error) {
    console.error('Error banning group:', error);
    await sock.sendMessage(msg.key.remoteJid, `❌ Failed to ban group. An error occurred: ${error.message}`);
  }
}

async function handleApproveJoin(sock, msg, args) {
  const metadata = await sock.groupMetadata(msg.key.remoteJid);
  if (!metadata) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not retrieve group metadata.' });
    return;
  }
  const botIsAdmin = metadata.participants.find(p => p.id.split(':')[0] === sock.user.id.split(':')[0] && (p.admin === 'admin' || p.admin === 'superadmin'));
  if (!botIsAdmin) {
    await sock.sendMessage(msg.key.remoteJid, { text: '🚫 Admin command only.' });
    return;
  }

  const userIdToApprove = args[0]; // Expecting the user's full JID (e.g., 234xxxxxxxxxx@s.whatsapp.net)

  if (!userIdToApprove?.includes('@s.whatsapp.net')) {
    await sock.sendMessage(msg.key.remoteJid, 'Usage: !approve [user JID (e.g., 234xxxxxxxxxx@s.whatsapp.net)]');
    return;
  }

  try {
    await sock.groupAcceptInvite(msg.key.remoteJid, userIdToApprove);
    await sock.sendMessage(msg.key.remoteJid, `✅ Approved join request from ${userIdToApprove.split('@')[0]}`);
  } catch (error) {
    console.error('Error approving join request:', error);
    await sock.sendMessage(msg.key.remoteJid, '❌ Could not approve the join request.');
  }
}

module.exports = {
  handleGroupInfo,
  handleMentionAll,
  handleRules,
  handleReport,
  handleReportAdmin,
  handleLeaveGroup,
  handleAdd,
  handleRemove,
  handlePromote,
  handleDemote,
  handleSetName,
  handleSetDescription,
  handlePin,
  handleUnpin,
  handleWarn,
  handleMute,
  handleUnmute,
  handleAdminOnly,
  handleAntiSticker,
  handleAntiLink,
  handleKillGround,
  handleAntiBot,
  handleWelcome,
  handlePoll,
  handleAnnounce,
  handleFind,
  handleBanGroup,
  handleApproveJoin,
};

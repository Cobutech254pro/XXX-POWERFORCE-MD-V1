// In your commands/general.js

async function handleBotInfo(bot, message) {
  const uptimeSeconds = Math.floor(process.uptime());
  const uptimeString = formatUptime(uptimeSeconds);
  const platform = process.platform;
  const nodeVersion = process.version;
  const botInfoText = `
🤖 *Bot Information*

*Bot Name:* XXX-FORCE-MD VI
*Uptime:* ${uptimeString}
*Platform:* ${platform}
*Node.js Version:* ${nodeVersion}
*Location:* Sare, Migori County, Kenya
*Current Time (EAT):* ${new Date().toLocaleTimeString('en-KE', { timeZone: 'Africa/Nairobi' })}
`;

  await bot.sendMessage(message.from, botInfoText);
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / (60 * 60 * 24));
  const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);

  let uptime = '';
  if (days > 0) {
    uptime += `${days} day${days > 1 ? 's' : ''}, `;
  }
  if (hours > 0) {
    uptime += `${hours} hour${hours > 1 ? 's' : ''}, `;
  }
  if (minutes > 0) {
    uptime += `${minutes} minute${minutes > 1 ? 's' : ''}, `;
  }
  uptime += `${secs} second${secs !== 1 ? 's' : ''}`;

  return uptime;
}

module.exports = {
  // ... other general command handlers
  handleBotInfo,
};

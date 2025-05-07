// In your commands/fun.js

async function handleJoke(bot, message) {
  // --- Placeholder for fetching a joke ---
  // You would typically use an API or a local list of jokes here.
  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Parallel lines have so much in common... it’s a shame they’ll never meet.",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
  ];
  const randomIndex = Math.floor(Math.random() * jokes.length);
  await bot.sendMessage(message.from, jokes[randomIndex]);
}

async function handleMeme(bot, message) {
  await bot.sendMessage(message.from, 'Sending a meme... (This feature is under development and may not function correctly yet.)');
  // --- Placeholder for fetching and sending a meme ---
  // This would likely involve using a meme API or accessing a collection of meme images.
  // Example using a hypothetical function:
  // try {
  //   const memeUrl = await getMemeUrl();
  //   await bot.sendImage(message.from, memeUrl, 'meme.jpg', 'Here's a meme for you!');
  // } catch (error) {
  //   console.error('Meme error:', error);
  //   await bot.sendMessage(message.from, 'Failed to fetch a meme.');
  // }
}

async function handleRoll(bot, message, args) {
  const rollFormat = /^(\d+)d(\d+)$/i;
  const match = args[0] ? args[0].match(rollFormat) : null;

  if (!match) {
    await bot.sendMessage(message.from, 'Usage: !roll [number]d[sides] (e.g., !roll 2d6)');
    return;
  }

  const numDice = parseInt(match[1]);
  const numSides = parseInt(match[2]);

  if (numDice <= 0 || numSides <= 0 || numDice > 10 || numSides > 100) {
    await bot.sendMessage(message.from, 'Please specify a valid number of dice (1-10) and sides (1-100).');
    return;
  }

  let results = [];
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    const roll = Math.floor(Math.random() * numSides) + 1;
    results.push(roll);
    total += roll;
  }

  await bot.sendMessage(message.from, `Rolled ${numDice}d${numSides}: [${results.join(', ')}] Total: ${total}`);
}

module.exports = {
  handleJoke,
  handleMeme,
  handleRoll,
};

// In your commands/utility.js

const { evaluate } = require('mathjs');

async function handleCalculate(bot, message, args) {
  const expression = args.join(' ');
  if (!expression) {
    await bot.sendMessage(message.from, 'Please provide an expression to calculate (e.g., !calculate 2 + 2 * 3).');
    return;
  }
  try {
    const result = evaluate(expression);
    await bot.sendMessage(message.from, `The result is: ${result}`);
  } catch (error) {
    console.error('Calculation error:', error);
    await bot.sendMessage(message.from, 'Invalid expression. Please try again with a valid mathematical expression.');
  }
}

async function handleTranslate(bot, message, args) {
  const text = args.slice(0, -2).join(' ');
  const targetLanguage = args.slice(-1)[0];
  if (!text || !targetLanguage || args.length < 3) {
    await bot.sendMessage(message.from, 'Usage: !translate [text] to [language code] (e.g., !translate Hello to fr)');
    return;
  }
  // You would typically use a translation API here (e.g., Google Translate API, DeepL API).
  // This example uses a placeholder response.
  await bot.sendMessage(message.from, `Translating "${text}" to ${targetLanguage}... (Translation functionality not fully implemented).`);
  // Implement translation API call and response handling.
}

async function handleDefine(bot, message, args) {
  const word = args.join(' ');
  if (!word) {
    await bot.sendMessage(message.from, 'Please provide a word to define (e.g., !define example).');
    return;
  }
  // You would typically use a dictionary API here (e.g., Merriam-Webster API).
  // This example uses a placeholder response.
  await bot.sendMessage(message.from, `Defining "${word}"... (Definition functionality not fully implemented).`);
  // Implement dictionary API call and response handling.
}

async function handleTime(bot, message) {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  await bot.sendMessage(message.from, `The current time is: ${timeString}`);
}

async function handleDate(bot, message) {
  const now = new Date();
  const dateString = now.toLocaleDateString();
  await bot.sendMessage(message.from, `Today's date is: ${dateString}`);
}

async function handleCurrency(bot, message, args) {
  if (args.length !== 4 || args[1].toLowerCase() !== 'from' || args[3].toLowerCase() !== 'to') {
    await bot.sendMessage(message.from, 'Usage: !currency [amount] from [base currency] to [target currency] (e.g., !currency 10 USD to EUR)');
    return;
  }
  const amount = parseFloat(args[0]);
  const baseCurrency = args[2].toUpperCase();
  const targetCurrency = args[4].toUpperCase();

  if (isNaN(amount)) {
    await bot.sendMessage(message.from, 'Invalid amount provided.');
    return;
  }

  // You would typically use a currency exchange rate API here (e.g., Open Exchange Rates API).
  // This example uses a placeholder response.
  await bot.sendMessage(message.from, `Converting ${amount} ${baseCurrency} to ${targetCurrency}... (Currency conversion not fully implemented).`);
  // Implement currency exchange rate API call and response handling.
}

module.exports = {
  handleCalculate,
  handleTranslate,
  handleDefine,
  handleTime,
  handleDate,
  handleCurrency,
};

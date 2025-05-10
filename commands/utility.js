// In your commands/utility.js

import { evaluate } from 'mathjs';

async function handleCalculate(sock, msg, args) {
  const expression = args.join(' ');
  if (!expression) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide an expression to calculate (e.g., !calculate 2 + 2 * 3).' });
    return;
  }
  try {
    const result = evaluate(expression);
    await sock.sendMessage(msg.key.remoteJid, { text: `The result is: ${result}` });
  } catch (error) {
    console.error('Calculation error:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid expression. Please try again with a valid mathematical expression.' });
  }
}

async function handleTranslate(sock, msg, args) {
  const text = args.slice(0, -2).join(' ');
  const targetLanguage = args.slice(-1)[0];
  if (!text || !targetLanguage || args.length < 3) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !translate [text] to [language code] (e.g., !translate Hello to fr)' });
    return;
  }
  // You would typically use a translation API here (e.g., Google Translate API, DeepL API).
  // This example uses a placeholder response.
  await sock.sendMessage(msg.key.remoteJid, { text: `Translating "${text}" to ${targetLanguage}... (Translation functionality not fully implemented).` });
  // Implement translation API call and response handling.
}

async function handleDefine(sock, msg, args) {
  const word = args.join(' ');
  if (!word) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a word to define (e.g., !define example).' });
    return;
  }
  // You would typically use a dictionary API here (e.g., Merriam-Webster API).
  // This example uses a placeholder response.
  await sock.sendMessage(msg.key.remoteJid, { text: `Defining "${word}"... (Definition functionality not fully implemented).` });
  // Implement dictionary API call and response handling.
}

async function handleTime(sock, msg) {
  const now = new Date();
  const timeString = now.toLocaleTimeString('en-KE', { timeZone: 'Africa/Nairobi' });
  await sock.sendMessage(msg.key.remoteJid, { text: `The current time in Kenya is: ${timeString}` });
}

async function handleDate(sock, msg) {
  const now = new Date();
  const dateString = now.toLocaleDateString('en-KE', { timeZone: 'Africa/Nairobi' });
  await sock.sendMessage(msg.key.remoteJid, { text: `Today's date in Kenya is: ${dateString}` });
}

async function handleCurrency(sock, msg, args) {
  if (args.length !== 4 || args[1].toLowerCase() !== 'from' || args[3].toLowerCase() !== 'to') {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !currency [amount] from [base currency] to [target currency] (e.g., !currency 10 USD to EUR)' });
    return;
  }
  const amount = parseFloat(args[0]);
  const baseCurrency = args[2].toUpperCase();
  const targetCurrency = args[4].toUpperCase();

  if (isNaN(amount)) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Invalid amount provided.' });
    return;
  }

  // You would typically use a currency exchange rate API here (e.g., Open Exchange Rates API).
  // This example uses a placeholder response.
  await sock.sendMessage(msg.key.remoteJid, { text: `Converting ${amount} ${baseCurrency} to ${targetCurrency}... (Currency conversion not fully implemented).` });
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

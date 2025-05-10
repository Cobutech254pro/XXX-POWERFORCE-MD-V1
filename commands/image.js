// In your commands/image.js

import { downloadMediaMessage } from '@whiskeysockets/baileys';
import { tmpdir } from 'os';
import { join } from 'path';
import { promises as fs } from 'fs';

async function handleGrayscale(sock, msg) {
  if (!msg.quotedMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image with the !grayscale command.' });
    return;
  }

  const quoted = await sock.loadMessage(msg.key.remoteJid, msg.quotedMessage.stanzaId);
  const media = await downloadMediaMessage(quoted, 'buffer');

  if (!media) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not download the image.' });
    return;
  }

  const mimeType = quoted.message?.imageMessage?.mimetype || quoted.message?.stickerMessage?.mimetype;
  if (!mimeType?.startsWith('image/')) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'The replied message is not a valid image or sticker.' });
    return;
  }

  await sock.sendMessage(msg.key.remoteJid, { text: 'Applying grayscale filter... (This feature is under development and may take some time or not function correctly yet.)' });

  // --- Placeholder for image processing logic (grayscale) ---
  // You would typically use an image processing library here (e.g., Jimp, sharp).
  // Example using a hypothetical function (requires Jimp to be installed: npm install jimp):
   try {
    const jimp = require('jimp');
    const image = await jimp.read(media);
   image.greyscale();
    const buffer = await image.getBufferAsync(jimp.MIME_PNG); // Or other appropriate MIME type
    await sock.sendMessage(msg.key.remoteJid, { image: buffer, caption: 'Here is your grayscale image.' });
   } catch (error) {
    console.error('Grayscale error:', error);
    await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to apply grayscale filter.' });
   
}

async function handleBlur(sock, msg, args) {
  if (!msg.quotedMessage) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please reply to an image with the !blur command.' });
    return;
  }

  const quoted = await sock.loadMessage(msg.key.remoteJid, msg.quotedMessage.stanzaId);
  const media = await downloadMediaMessage(quoted, 'buffer');

  if (!media) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Could not download the image.' });
    return;
  }

  const mimeType = quoted.message?.imageMessage?.mimetype || quoted.message?.stickerMessage?.mimetype;
  if (!mimeType?.startsWith('image/')) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'The replied message is not a valid image or sticker.' });
    return;
  }

  const blurRadius = parseInt(args[0]) || 5; // Default blur radius of 5
  if (isNaN(blurRadius) || blurRadius < 1 || blurRadius > 20) {
    await sock.sendMessage(msg.key.remoteJid, { text: 'Please provide a blur radius between 1 and 20 (e.g., !blur 10). Using default radius of 5.' });
  }

  await sock.sendMessage(msg.key.remoteJid, { text: `Applying blur with radius ${blurRadius}... (This feature is under development and may take some time or not function correctly yet.)` });

  // --- Placeholder for image processing logic (blur) ---
  
  Example using a hypothetical function (requires Jimp to be installed: npm install jimp):
  try {
    const jimp = require('jimp');
   const image = await jimp.read(media);
   image.blur(blurRadius);
     const buffer = await image.getBufferAsync(jimp.MIME_PNG); // Or other appropriate MIME type
    await sock.sendMessage(msg.key.remoteJid, { image: buffer, caption: `Here is your blurred image (radius ${blurRadius}).` });
 } catch (error) {
   console.error('Blur error:', error);
     await sock.sendMessage(msg.key.remoteJid, { text: 'Failed to apply blur filter.' });
  }
}

module.exports = {
  handleGrayscale,
  handleBlur,
};

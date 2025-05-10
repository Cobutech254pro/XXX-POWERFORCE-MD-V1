// handler.js
import { handleJoke, handleMeme, handleRoll } from './commands/fun';
import { handleGrayscale, handleBlur } from './commands/image';
import { handleNews, handleWeather, handleWiki, handleQuote } from './commands/info';
import { handleInvite, handleShorten, handleExpand, handleGenerate } from './commands/url';
import { handleProfile, handleSetProfile, handleBio, handleSetBio, handleReportUser, handleWarns, handleRequestFeature, handleFeedback, handleContactAdmin, handleSetNickname, handleDeleteMessage, handleAutoRead } from './commands/user';
import { handleCalculate, handleTranslate, handleDefine, handleTime, handleDate, handleCurrency } from './commands/utility';
import { handleMenuCommand, handleMenuSelection } from './commands/general'; // Assuming menu commands are in general.js

async function handleCommand(sock, msg, prefix) {
  const text = msg.message?.conversation || msg.message?.imageMessage?.caption || '';
  const args = text.slice(prefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (!command) return; // If no command is provided

  console.log(`Received command: ${command} with arguments: ${args}`);

  switch (command) {
    // --- Fun Commands ---
    case 'joke':
      await handleJoke(sock, msg);
      break;
    case 'meme':
      await handleMeme(sock, msg);
      break;
    case 'roll':
      await handleRoll(sock, msg, args);
      break;

    // --- Image Commands ---
    case 'grayscale':
      await handleGrayscale(sock, msg);
      break;
    case 'blur':
      await handleBlur(sock, msg, args);
      break;

    // --- Info Commands ---
    case 'news':
      await handleNews(sock, msg, args);
      break;
    case 'weather':
      await handleWeather(sock, msg, args);
      break;
    case 'wiki':
      await handleWiki(sock, msg, args);
      break;
    case 'quote':
      await handleQuote(sock, msg);
      break;

    // --- URL Commands ---
    case 'url':
      if (args[0]?.toLowerCase() === 'invite') {
        await handleInvite(sock, msg);
      } else if (args[0]?.toLowerCase() === 'shorten') {
        await handleShorten(sock, msg, args.slice(1));
      } else if (args[0]?.toLowerCase() === 'expand') {
        await handleExpand(sock, msg, args.slice(1));
      } else if (args[0]?.toLowerCase() === 'generate') {
        await handleGenerate(sock, msg, args.slice(1));
      } else {
        await sock.sendMessage(msg.key.remoteJid, { text: 'Usage: !url [invite|shorten <url>|expand <url>|generate <type>]' });
      }
      break;

    // --- User Commands ---
    case 'profile':
      await handleProfile(sock, msg);
      break;
    case 'setprofile':
      await handleSetProfile(sock, msg, args);
      break;
    case 'bio':
      await handleBio(sock, msg);
      break;
    case 'setbio':
      await handleSetBio(sock, msg, args);
      break;
    case 'report':
      await handleReportUser(sock, msg, args);
      break;
    case 'warns':
      await handleWarns(sock, msg);
      break;
    case 'request':
      await handleRequestFeature(sock, msg, args);
      break;
    case 'feedback':
      await handleFeedback(sock, msg, args);
      break;
    case 'contactadmin':
      await handleContactAdmin(sock, msg, args);
      break;
    case 'setnickname':
      await handleSetNickname(sock, msg, args);
      break;
    case 'delete':
      await handleDeleteMessage(sock, msg);
      break;
    case 'autoread':
      await handleAutoRead(sock, msg, args);
      break;

    // --- Utility Commands ---
    case 'calculate':
      await handleCalculate(sock, msg, args);
      break;
    case 'translate':
      await handleTranslate(sock, msg, args);
      break;
    case 'define':
      await handleDefine(sock, msg, args);
      break;
    case 'time':
      await handleTime(sock, msg);
      break;
    case 'date':
      await handleDate(sock, msg);
      break;
    case 'currency':
      await handleCurrency(sock, msg, args);
      break;

    // --- General Commands (Menu) ---
    case 'menu':
      await handleMenuCommand(sock, msg);
      break;
    case '0': // Assuming '0' is used to go back in menus
      await handleMenuCommand(sock, msg); // Re-display the main menu
      break;
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
    case '6':
    case '7':
    case '8':
    case '9':
    case '10':
    case '11':
      await handleMenuSelection(sock, msg, command);
      break;

    default:
      await sock.sendMessage(msg.key.remoteJid, { text: `Unknown command: ${command}. Type !menu to see available commands.` });
      break;
  }
}

export { handleCommand };

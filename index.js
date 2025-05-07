// index.js

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const config = require('./config');

// Import command handlers
const botInfoHandler = require('./commands/botinfo');
const generalHandler = require('./commands/general');
const groupHandler = require('./commands/group');
const userHandler = require('./commands/user');
const utilityHandler = require('./commands/utility');
const chatbotHandler = require('./commands/chatbot');
const downloadHandler = require('./commands/download');
const funHandler = require('./commands/fun');
const infoHandler = require('./commands/info');
const imageHandler = require('./commands/image');
const urlHandler = require('./commands/url');
const menuHandler = require('./commands/menu');

// Configuration
const botOwnerNumber = config.botOwnerNumber;
const botAdmins = config.botAdmins;
let autoReadEnabled = config.autoReadDefault;
let autoTypingEnabled = config.autoTypingDefault;
let autoRecordingEnabled = config.autoRecordingDefault;

const client = new Client({
    authStrategy: new LocalAuth(),
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('QR RECEIVED', qr);
});

client.on('ready', () => {
    console.log('Bot is ready!');
    client.sendMessage(botOwnerNumber, '✅ Bot is online!');
    // You might want to set the bot's presence or profile info here if whatsapp-web.js supports it reliably
    // client.setStatus(config.botBodyText);
    // client.setProfilePicture(config.botImageURL).catch(error => console.error("Error setting profile picture:", error));
});

client.on('message', async (message) => {
    const messageText = message.body.trim();
    const lowerCaseMessage = messageText.toLowerCase();
    const args = messageText.split(' ').slice(1);
    const chat = await message.getChat();

    // Auto-read functionality
    if (autoReadEnabled && !message.fromMe) {
        try {
            await message.markRead();
        } catch (error) {
            console.error('Error marking message as read:', error);
        }
    }

    // Auto typing/recording indicator
    if ((autoTypingEnabled || autoRecordingEnabled) && !message.fromMe && lowerCaseMessage.startsWith('!')) {
        try {
            if (autoTypingEnabled) {
                await chat.sendState('typing');
            } else if (autoRecordingEnabled) {
                await chat.sendState('recording');
            }
        } catch (error) {
            console.error('Error sending typing/recording state:', error);
        }
    }

    // Command handling
    if (lowerCaseMessage === '!menu') {
        await menuHandler.handleMenuCommand(client, message);
    } else if (!isNaN(lowerCaseMessage) && lowerCaseMessage !== '0') {
        await menuHandler.handleMenuSelection(client, message, lowerCaseMessage);
    } else if (lowerCaseMessage === '!botinfo' || lowerCaseMessage === '!status') {
        await botInfoHandler.handleBotInfo(client, message);
    } else if (lowerCaseMessage === '!hello' || lowerCaseMessage === '!hi') {
        await generalHandler.handleHello(client, message);
    } else if (lowerCaseMessage === '!creator' || lowerCaseMessage === '!owner') {
        await generalHandler.handleCreator(client, message);
    } else if (lowerCaseMessage === '!ping') {
        const start = Date.now();
        await client.sendMessage(message.from, 'Pinging...');
        const end = Date.now();
        await client.sendMessage(message.from, `Pong! Response time: ${end - start}ms`);
    } else if (lowerCaseMessage.startsWith('!say')) {
        const text = args.join(' ');
        if (text) {
            await client.sendMessage(message.from, text);
        } else {
            await client.sendMessage(message.from, 'Please provide text to say (e.g., !say Hello everyone!).');
        }
    } else if (lowerCaseMessage.startsWith('!repeat')) {
        const text = args.join(' ');
        if (text) {
            await client.sendMessage(message.from, text);
        } else {
            await client.sendMessage(message.from, 'Please provide text to repeat (e.g., !repeat This is an echo!).');
        }
    } else if (lowerCaseMessage === '!groupinfo') {
        await groupHandler.handleGroupInfo(client, message);
    } else if (lowerCaseMessage === '!mentionall' || lowerCaseMessage === '!everyone') {
        await groupHandler.handleMentionAll(client, message);
    } else if (lowerCaseMessage.startsWith('!rules')) {
        await groupHandler.handleRules(client, message, args);
    } else if (lowerCaseMessage.startsWith('!reportadmin')) {
        await groupHandler.handleReportAdmin(client, message, args);
    } else if (lowerCaseMessage === '!leavegroup') {
        await groupHandler.handleLeaveGroup(client, message);
    } else if (lowerCaseMessage.startsWith('!add')) {
        await groupHandler.handleAdd(client, message, args);
    } else if (lowerCaseMessage === '!remove') {
        await groupHandler.handleRemove(client, message);
    } else if (lowerCaseMessage === '!promote') {
        await groupHandler.handlePromote(client, message);
    } else if (lowerCaseMessage === '!demote') {
        await groupHandler.handleDemote(client, message);
    } else if (lowerCaseMessage.startsWith('!setname')) {
        await groupHandler.handleSetName(client, message, args);
    } else if (lowerCaseMessage.startsWith('!setdescription')) {
        await groupHandler.handleSetDescription(client, message, args);
    } else if (lowerCaseMessage === '!pin') {
        await groupHandler.handlePin(client, message);
    } else if (lowerCaseMessage === '!unpin') {
        await groupHandler.handleUnpin(client, message);
    } else if (lowerCaseMessage.startsWith('!warn')) {
        await groupHandler.handleWarn(client, message, args);
    } else if (lowerCaseMessage.startsWith('!mute')) {
        await groupHandler.handleMute(client, message, args);
    } else if (lowerCaseMessage === '!unmute') {
        await groupHandler.handleUnmute(client, message);
    } else if (lowerCaseMessage.startsWith('!adminonly')) {
        await groupHandler.handleAdminOnly(client, message, args);
    } else if (lowerCaseMessage.startsWith('!antisticker')) {
        await groupHandler.handleAntiSticker(client, message, args);
    } else if (lowerCaseMessage.startsWith('!antilink')) {
        await groupHandler.handleAntiLink(client, message, args);
    } else if (lowerCaseMessage === '!killground') {
        await groupHandler.handleKillGround(client, message);
    } else if (lowerCaseMessage.startsWith('!antibot')) {
        await groupHandler.handleAntiBot(client, message, args);
    } else if (lowerCaseMessage.startsWith('!welcome')) {
        await groupHandler.handleWelcome(client, message, args);
    } else if (lowerCaseMessage.startsWith('!poll')) {
        await groupHandler.handlePoll(client, message, args);
    } else if (lowerCaseMessage.startsWith('!announce')) {
        await groupHandler.handleAnnounce(client, message, args);
    } else if (lowerCaseMessage.startsWith('!find')) {
        await groupHandler.handleFind(client, message, args);
    } else if (lowerCaseMessage.startsWith('!calculate')) {
        await utilityHandler.handleCalculate(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!translate')) {
        await utilityHandler.handleTranslate(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!define')) {
        await utilityHandler.handleDefine(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage === '!time') {
        await utilityHandler.handleTime(client, message, chat); // Pass chat object
    } else if (lowerCaseMessage === '!date') {
        await utilityHandler.handleDate(client, message, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!currency')) {
        await utilityHandler.handleCurrency(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage === '!chatbot activate') {
        await chatbotHandler.handleChatbotActivate(client, message);
    } else if (lowerCaseMessage === '!chatbot deactivate') {
        await chatbotHandler.handleChatbotDeactivate(client, message);
    } else if (lowerCaseMessage.startsWith('!download')) {
        await downloadHandler.handleDownloadCommand(client, message);
    } else if (lowerCaseMessage.startsWith('!fbdown')) {
        await downloadHandler.handleFacebookDownload(client, message, args);
    } else if (lowerCaseMessage.startsWith('!igdown')) {
        await downloadHandler.handleInstagramDownload(client, message, args);
    } else if (lowerCaseMessage.startsWith('!tiktokdown')) {
        await downloadHandler.handleTiktokDownload(client, message, args);
    } else if (lowerCaseMessage.startsWith('!musicdown')) {
        await downloadHandler.handleMusicDownload(client, message, args);
    } else if (lowerCaseMessage.startsWith('!joke')) {
        await funHandler.handleJoke(client, message, chat); // Pass chat object
    } else if (lowerCaseMessage === '!meme') {
        await funHandler.handleMeme(client, message, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!roll')) {
        await funHandler.handleRoll(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!news')) {
        await infoHandler.handleNews(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!weather')) {
        await infoHandler.handleWeather(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!wiki')) {
        await infoHandler.handleWiki(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage === '!quote') {
        await infoHandler.handleQuote(client, message, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!grayscale') && message.hasMedia) {
        await imageHandler.handleGrayscale(client, message, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!blur') && message.hasMedia) {
        await imageHandler.handleBlur(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!url shorten')) {
        await urlHandler.handleShorten(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!url expand')) {
        await urlHandler.handleExpand(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage.startsWith('!url generate')) {
        await urlHandler.handleGenerate(client, message, args, chat); // Pass chat object
    } else if (lowerCaseMessage === '!profile') {
        await userHandler.handleProfile(client, message);
    } else if (lowerCaseMessage.startsWith('!setprofile')) {
        await userHandler.handleSetProfile(client, message, args);
    } else if (lowerCaseMessage === '!bio') {
        await userHandler.handleBio(client, message);
    } else if (lowerCaseMessage.startsWith('!setbio')) {
        await userHandler.handleSetBio(client, message, args);
    } else if (lowerCaseMessage.startsWith('!report ')) {
        await userHandler.handleReportUser(client, message, args);
    } else if (lowerCaseMessage === '!warns') {
        await userHandler.handleWarns(client, message);
    } else if (lowerCaseMessage.startsWith('!request')) {
        await userHandler.handleRequestFeature(client, message, args);
    } else if (lowerCaseMessage.startsWith('!feedback')) {
        await userHandler.handleFeedback(client, message, args);
    } else if (lowerCaseMessage.startsWith('!contactadmin')) {
        await userHandler.handleContactAdmin(client, message, args);
    } else if (lowerCaseMessage.startsWith('!setnickname')) {
        await userHandler.handleSetNickname(client, message, args);
    } else if (lowerCaseMessage.startsWith('!delete')) {
        await userHandler.handleDeleteMessage(client, message, args);
    } else if (lowerCaseMessage.startsWith('!autoread')) {
        if (await userHandler.isBotAdmin(message)) {
            const action = args[0] ? args[0].toLowerCase() : '';
            autoReadEnabled = action === 'on';
            await client.sendMessage(message.from, `✅ Auto-read ${autoReadEnabled ? 'enabled' : 'disabled'}.`);
        } else {
            await client.sendMessage(message.from, '🚫 Admin command only.');
        }
    } else if (lowerCaseMessage.startsWith('!autotyping')) {
        if (await userHandler.isBotAdmin(message)) {
            const action = args[0] ? args[0].toLowerCase() : '';
            autoTypingEnabled = action === 'on';
            await client.sendMessage(message.from, `✅ Auto-typing ${autoTypingEnabled ? 'enabled' : 'disabled'}.`);
        } else {
            await client.sendMessage(message.from, '🚫 Admin command only.');
        }
    } else if (lowerCaseMessage.startsWith('!autorecording')) {
        if (await userHandler.isBotAdmin(message)) {
            const action = args[0] ? args[0].toLowerCase() : '';
            autoRecordingEnabled = action === 'on';
            await client.sendMessage(message.from, `✅ Auto-recording ${autoRecordingEnabled ? 'enabled' : 'disabled'}.`);
        } else {
            await client.sendMessage(message.from, '🚫 Admin command only.');
        }
    } else if (lowerCaseMessage.startsWith('!bangroup')) {
        await groupHandler.handleBanGroup(client, message, args);
    } else if (lowerCaseMessage.startsWith('!approve')) {
        await groupHandler.handleApproveJoin(client, message, args);
    }
});

client.on('group_join_request', async (joinRequest) => {
    const { id: groupId, participants } = joinRequest;
    console.log(`New join request in group ${groupId}:`, participants.map(p => p.id._serialized));

    // Here you can implement your logic to automatically approve or log join requests
    // For example, you might want to check against a whitelist or notify admins
    // For now, let's just log the requests

    // Example of automatically approving all requests (USE WITH CAUTION):
    // for (const participant of participants) {
    //     try {
    //         await client.acceptGroupInvite(groupId, participant.id._serialized);
    //         console.log(`Automatically approved ${participant.id._serialized} in ${groupId}`);
    //     } catch (error) {
    //         console.error('Error auto-approving:', error);
    //     }
    // }
});

client.initialize();

// index.js
const { Client, GatewayIntentBits, Partials } = require("discord.js");
const fs = require("fs");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

let settings = {
    targetChannelId: null,
    logChannelId: null
};

// 設定ファイル読み込み
if (fs.existsSync("settings.json")) {
    settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));
}

function saveSettings() {
    fs.writeFileSync("settings.json", JSON.stringify(settings, null, 2));
}

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// =======================
// 管理用コマンド
// =======================
client.on("messageCreate", async (msg) => {
    if (msg.author.bot) return;

    // チャンネル設定
    if (msg.content.startsWith("!set-target")) {
        const channel = msg.mentions.channels.first();
        if (!channel) return msg.reply("チャンネルをメンションしてください");

        settings.targetChannelId = channel.id;
        saveSettings();
        return msg.reply(`ターゲットチャンネルを <#${channel.id}> に設定しました！`);
    }

    if (msg.content.startsWith("!set-log")) {
        const channel = msg.mentions.channels.first();
        if (!channel) return msg.reply("チャンネルをメンションしてください");

        settings.logChannelId = channel.id;
        saveSettings();
        return msg.reply(`ログチャンネルを <#${channel.id}> に設定しました！`);
    }
});

// =======================
// DM受信 → 匿名メッセージ送信
// =======================
client.on("messageCreate", async (msg) => {
    if (msg.channel.type !== 1) return; // DM以外は無視
    if (msg.author.bot) return;

    if (!settings.targetChannelId)
        return msg.reply("❌ まだターゲットチャンネルが設定されていません。管理者に伝えてください。");

    // 1) DM送信者へ返信
    await msg.reply("✅ あなたのメッセージは匿名で送信されました！");

    // 2) 匿名メッセージ送信
    const targetChannel = await client.channels.fetch(settings.targetChannelId);
    await targetChannel.send(`🔒 **匿名メッセージ**\n${msg.content}`);

    // 3) ログ送信
    if (settings.logChannelId) {
        const logChannel = await client.channels.fetch(settings.logChannelId);
        await logChannel.send(
            `📋 **匿名メッセージログ**\n` +
            `送信者: ${msg.author.username} (ID: ${msg.author.id})\n` +
            `日時: ${new Date().toISOString()}\n` +
            `内容: ${msg.content}\n` +
            `添付ファイル数: ${msg.attachments.size}`
        );
    }
});

client.login(process.env.DISCORD_TOKEN);

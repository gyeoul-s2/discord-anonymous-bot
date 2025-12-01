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

// ------------------
// 設定
// ------------------
let settings = {
    targetChannelId: null,
    logChannelId: null,
    replyText: "✅ あなたのメッセージは匿名で送信されました！",
    anonPrefix: "🔒 **匿名メッセージ**\n",
    logPrefix: "📋 **匿名メッセージログ**\n"
};

if (fs.existsSync("settings.json")) {
    settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));
}
function saveSettings() {
    fs.writeFileSync("settings.json", JSON.stringify(settings, null, 2));
}

const OWNER_ID = process.env.OWNER_ID;

// ------------------
// 起動
// ------------------
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// ------------------
// 管理者（あなた）専用：DMで設定変更
// ------------------
client.on("messageCreate", async (msg) => {
    if (msg.channel.type !== 1) return; // DM以外は無視
    if (msg.author.id !== OWNER_ID) return; // あなた以外のDMは匿名投稿扱い

    const content = msg.content.trim();

    // set target
    if (content.startsWith("set target")) {
        const id = content.split(" ")[2];
        settings.targetChannelId = id;
        saveSettings();
        return msg.reply(`ターゲットチャンネルIDを **${id}** に設定しました`);
    }

    // set log
    if (content.startsWith("set log")) {
        const id = content.split(" ")[2];
        settings.logChannelId = id;
        saveSettings();
        return msg.reply(`ログチャンネルIDを **${id}** に設定しました`);
    }

    // set reply
    if (content.startsWith("set reply")) {
        const text = content.replace("set reply", "").trim();
        settings.replyText = text;
        saveSettings();
        return msg.reply(`返信メッセージを更新しました：\n${text}`);
    }

    // set anon
    if (content.startsWith("set anon")) {
        const text = content.replace("set anon", "").trim();
        settings.anonPrefix = text + "\n";
        saveSettings();
        return msg.reply(`匿名メッセージのprefixを更新しました：\n${text}`);
    }

    // set logtext
    if (content.startsWith("set logtext")) {
        const text = content.replace("set logtext", "").trim();
        settings.logPrefix = text + "\n";
        saveSettings();
        return msg.reply(`ログメッセージのprefixを更新しました：\n${text}`);
    }
});

// ------------------
// 一般ユーザーのDM → 匿名メッセージ
// ------------------
client.on("messageCreate", async (msg) => {
    if (msg.channel.type !== 1) return; // DM以外無視
    if (msg.author.bot) return;
    if (msg.author.id === OWNER_ID) return; // 管理者のDMは設定コマンド扱い

    if (!settings.targetChannelId) {
        return msg.reply("❌ まだターゲットチャンネルが設定されていません。管理者に伝えてください。");
    }

    // 返信
    await msg.reply(settings.replyText);

    // 匿名メッセージ送信
    const targetChannel = await client.channels.fetch(settings.targetChannelId);
    await targetChannel.send(`${settings.anonPrefix}${msg.content}`);

    // ログ送信
    if (settings.logChannelId) {
        const logChannel = await client.channels.fetch(settings.logChannelId);
        await logChannel.send(
            settings.logPrefix +
            `送信者: ${msg.author.username} (ID: ${msg.author.id})\n` +
            `日時: ${new Date().toISOString()}\n` +
            `内容: ${msg.content}\n` +
            `添付ファイル数: ${msg.attachments.size}`
        );
    }
});

// ------------------
client.login(process.env.DISCORD_TOKEN);

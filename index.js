import { Client, GatewayIntentBits, Partials, AttachmentBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";
import http from "http";

// ------------------
// Discord Client
// ------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// ------------------
// 設定ロード
// ------------------
let settings = {
    targetChannelId: "",
    logChannelId: "",
    replyText: "✅ あなたのメッセージは匿名で送信されました！",
    anonPrefix: "🔒 **匿名メッセージ**\n",
    logPrefix: "📋 **匿名メッセージログ**\n"
};

if (fs.existsSync("settings.json")) {
    settings = JSON.parse(fs.readFileSync("settings.json", "utf8"));
} else {
    fs.writeFileSync("settings.json", JSON.stringify(settings, null, 2));
}

function saveSettings() {
    fs.writeFileSync("settings.json", JSON.stringify(settings, null, 2));
}

const OWNER_ID = process.env.OWNER_ID;

// ------------------
// HTTPサーバー（Render Web Service用）
// ------------------
const port = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is running");
}).listen(port, () => {
    console.log(`HTTP server listening on port ${port}`);
});

// ------------------
client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
});

// ------------------
// 管理者 DM コマンド（OWNER のみ）
// ------------------
client.on("messageCreate", async (msg) => {
    if (!msg.channel.isDMBased()) return;
    if (msg.author.id !== OWNER_ID) return; // OWNER以外はコマンド使えない

    const content = msg.content.trim();

    // ---- コマンド一覧 ----
    if (content.startsWith("set target")) {
        const id = content.split(" ")[2];
        settings.targetChannelId = id;
        saveSettings();
        return msg.reply(`ターゲットチャンネルを **${id}** に設定しました`);
    }

    if (content.startsWith("set log")) {
        const id = content.split(" ")[2];
        settings.logChannelId = id;
        saveSettings();
        return msg.reply(`ログチャンネルを **${id}** に設定しました`);
    }

    if (content.startsWith("set reply")) {
        const text = content.replace("set reply", "").trim();
        settings.replyText = text;
        saveSettings();
        return msg.reply("返信メッセージを更新しました！");
    }

    if (content.startsWith("set anon")) {
        const text = content.replace("set anon", "").trim();
        settings.anonPrefix = text + "\n";
        saveSettings();
        return msg.reply("匿名メッセージのprefixを更新しました！");
    }

    if (content.startsWith("set logtext")) {
        const text = content.replace("set logtext", "").trim();
        settings.logPrefix = text + "\n";
        saveSettings();
        return msg.reply("ログメッセージのprefixを更新しました！");
    }

    if (content === "show settings") {
        return msg.reply(
            `📌 現在の設定:\n` +
            `ターゲットチャンネルID: ${settings.targetChannelId}\n` +
            `ログチャンネルID: ${settings.logChannelId}\n` +
            `DM返信メッセージ: ${settings.replyText}\n` +
            `匿名メッセージprefix: ${settings.anonPrefix}\n` +
            `ログprefix: ${settings.logPrefix}`
        );
    }

    // ⚠ OWNER の「コマンドじゃない DM」は匿名送信に回したいので
    // ここでは return しない！！
});

// ------------------
// 匿名送信（OWNER も一般ユーザーも含む）
// ------------------
client.on("messageCreate", async (msg) => {
    if (!msg.channel.isDMBased()) return;
    if (msg.author.bot) return;

    // ただし OWNER のコマンドだけは除外（コマンドは上のハンドラで処理済）
    const isOwnerCommand =
        msg.author.id === OWNER_ID &&
        (
            msg.content.startsWith("set ") ||
            msg.content === "show settings"
        );

    if (isOwnerCommand) return; // コマンドは処理完了済みなので匿名送信に流さない

    // ---- 匿名送信処理 ----
    if (!settings.targetChannelId) {
        return msg.reply("❌ まだターゲットチャンネルが設定されていません。");
    }

    // DM返信
    await msg.reply(settings.replyText);

    // 添付ファイル
    const files = [];
    msg.attachments.forEach(att => files.push(new AttachmentBuilder(att.url)));

    // 匿名メッセージ Embed
    const anonEmbed = new EmbedBuilder()
        .setTitle("匿名メッセージ")
        .setDescription(msg.content || "(テキストなし)")
        .setColor(0x00FFAA)
        .setTimestamp();

    files.forEach(file =>
        anonEmbed.addFields({ name: "添付ファイル", value: file.name || "file" })
    );

    const target = await client.channels.fetch(settings.targetChannelId);
    await target.send({ embeds: [anonEmbed], files: files });

    // ログ
    if (settings.logChannelId) {
        const logEmbed = new EmbedBuilder()
            .setTitle("匿名メッセージログ")
            .setColor(0xAAAAAA)
            .setTimestamp()
            .addFields(
                { name: "送信者", value: `${msg.author.username} (ID: ${msg.author.id})` },
                { name: "内容", value: msg.content || "(テキストなし)" },
                { name: "添付ファイル数", value: `${msg.attachments.size}` }
            );

        await client.channels.fetch(settings.logChannelId)
            .then(ch => ch.send({ embeds: [logEmbed], files }));
    }
});

// ------------------
client.login(process.env.DISCORD_TOKEN);

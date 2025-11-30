import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"] // DM 受取必須
});

const TARGET_CHANNEL = process.env.TARGET_CHANNEL;
const LOG_CHANNEL = process.env.LOG_CHANNEL;

client.on("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  // ボット自身やサーバー内メッセージは無視
  if (msg.author.bot) return;
  if (!msg.channel.isDMBased()) return;

  // 匿名転送
  const target = await client.channels.fetch(TARGET_CHANNEL);
  await target.send(msg.content);

  // ログ
  const log = await client.channels.fetch(LOG_CHANNEL);
  await log.send(
    `匿名メッセージ送信: from **${msg.author.id}**\n内容: ${msg.content}`
  );
});

client.login(process.env.TOKEN);

import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

// === ここから追加（ダミーWebサーバー） ===
import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is running"));
app.listen(PORT, () => console.log(`HTTP server running on ${PORT}`));
// === 追加ここまで ===


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"]
});

const TARGET_CHANNEL = process.env.TARGET_CHANNEL;
const LOG_CHANNEL = process.env.LOG_CHANNEL;

client.on("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.channel.isDMBased()) return;

  const target = await client.channels.fetch(TARGET_CHANNEL);
  await target.send(msg.content);

  const log = await client.channels.fetch(LOG_CHANNEL);
  await log.send(
    `匿名メッセージ送信: from **${msg.author.id}**\n内容: ${msg.content}`
  );
});

client.login(process.env.TOKEN);

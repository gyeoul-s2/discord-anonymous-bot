import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
dotenv.config();

// ===== Render 対策のダミー Web サーバー =====
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => res.send("Bot is alive"));
app.head("/", (req, res) => res.sendStatus(200));
app.get("/healthz", (req, res) => res.send("ok"));

app.listen(PORT, () =>
  console.log(`HTTP server running on port ${PORT}`)
);
// =========================================

// ===== Discord Bot =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: ["CHANNEL"]
});

client.on("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (!msg.channel.isDMBased()) return;

  const target = await client.channels.fetch(process.env.TARGET_CHANNEL);
  await target.send(msg.content);

  const log = await client.channels.fetch(process.env.LOG_CHANNEL);
  await log.send(`匿名メッセージ from ${msg.author.id}\n内容: ${msg.content}`);
});

client.login(process.env.TOKEN);

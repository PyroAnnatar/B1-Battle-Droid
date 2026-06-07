import { Client, GatewayIntentBits, MessageFlags } from "discord.js";
import "dotenv/config";
import path from "path";
import playSound from "./playSound.js";
import { joinVoiceChannel } from "@discordjs/voice";
import { fileURLToPath } from "url";
import { readdir } from "fs/promises";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const choices = await readdir(path.join(__dirname, "sounds"));

client.once("clientReady", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("error", (error) => {
  console.error("Client error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
});

function huh(message) {
  if (message.content === "huh" && !message.author.bot) {
    message.channel.send("huh");
  }
}

client.on("messageCreate", huh);

client.on("interactionCreate", (interaction) => soundCommand(interaction));

async function soundCommand(interaction) {
  if (interaction.isAutocomplete()) {
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "sound") {
      const filtered = choices.filter((choice) =>
        choice.toLowerCase().startsWith(focusedOption.value.toLowerCase()),
      );

      const response = filtered.map((choice) => choice.slice(0, -4));
      await interaction.respond(
        response.map((choice) => ({ name: choice, value: choice })),
      );
    }
  }

  if (interaction.user.id !== process.env.OWNER_ID) {
    return interaction.reply({
      content: "Intruders are not allowed to use this command, sir",
      flags: MessageFlags.Ephemeral,
    });
  }

  if (!interaction.isChatInputCommand()) return;
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });

  const voiceChannel = interaction.member?.voice.channel;
  if (!voiceChannel) {
    return interaction.editReply("Uhh, you need to be in a voice channel, sir");
  }
  if (interaction.commandName === "play") {
    const soundName = interaction.options.getString("sound");
    console.log(soundName);

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    const filePath = path.join(__dirname, "sounds", `${soundName}.mp3`);

    if (choices.includes(`${soundName}.mp3`)) {
      playSound(filePath, connection);
    } else {
      return interaction.editReply("Are you okay sir?");
    }
    interaction.editReply(`Playing ${soundName}`);
    setTimeout(() => interaction.deleteReply(), 5000);
  }
}

// client.on("messageCreate", async (message) => {
//   if (!message.content.startsWith("/")) return;

//   // Check the user is in a voice channel
//   const voiceChannel = message.member?.voice.channel;
//   if (!voiceChannel) {
//     return message.reply("Uhh, you need to be in a voice channel, sir");
//   }

//   // Get the sound name from the command, e.g. "!play hello" -> "hello"
//   const soundName = message.content.slice(1).trim().toLowerCase();
//   console.log(soundName);

//   if (!soundName) {
//     return message.reply(
//       "Please provide the name of the sound you want to play!",
//     );
//   }
//   message.delete();

//   // Join
//   const connection = joinVoiceChannel({
//     channelId: voiceChannel.id,
//     guildId: message.guild.id,
//     adapterCreator: message.guild.voiceAdapterCreator,
//   });

//   const filePath = path.join(__dirname, "sounds", `${soundName}.mp3`);

//   playSound(filePath, connection);
// });

client.login(process.env.DISCORD_BOT_TOKEN);

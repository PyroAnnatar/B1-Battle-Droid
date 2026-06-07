import { REST, Routes, SlashCommandBuilder } from "discord.js";
import "dotenv/config";

const command = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a sound")
  .addStringOption((option) =>
    option
      .setName("sound")
      .setDescription("The sound to play")
      .setRequired(true)
      .setAutocomplete(true),
  );

const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

async function put() {
  try {
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_SERVER_ID,
      ),
      {
        body: [command.toJSON()],
      },
    );
  } catch (error) {
    console.error(error);
  }
}

put();

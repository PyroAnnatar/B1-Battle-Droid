import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
} from "@discordjs/voice";

let disconnectTimeoutId = null;

export default function playSound(filePath, connection) {
  const player = createAudioPlayer();
  const resource = createAudioResource(filePath);
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds

  clearTimeout(disconnectTimeoutId);

  // Play
  connection.subscribe(player);
  player.play(resource);

  // Disconnect
  player.on(AudioPlayerStatus.Idle, () => {
    disconnectTimeoutId = setTimeout(() => {
      console.log(player.state.status);
      if (player.state.status === AudioPlayerStatus.Idle) {
        connection.destroy();
      }
    }, fiveMinutes);
  });
}

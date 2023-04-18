import Phaser from "phaser";
import { Plugins } from "./enums";
import { SoundManagerPlugin, WebClientPlugin } from "./plugins";
import { MainMenuScene, PreloadScene, WelcomeScene } from "./scenes";
import { GameOverlayScene } from "./scenes/game-overlay-scene";

const phaserGame = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: 1280,
  height: 720,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 200 }
    },
  },
  scene: [PreloadScene, MainMenuScene, WelcomeScene, GameOverlayScene ],
  backgroundColor: "#000033",
  plugins: {
    global: [
      { key: Plugins.WebClient, plugin: WebClientPlugin, start: true },
      { key: Plugins.SoundManager, plugin: SoundManagerPlugin, start: true }
    ]
  }
});

export class ThatOneRoom {
  game: Phaser.Game;

  constructor() {
    this.game = phaserGame;
  }
}

import Phaser from "phaser";
import { Images, Maps, Plugins, Scenes, ServerMessages, Sounds, Spritesheets } from "../enums";
import { Button } from "../objects/ui/button";
import { StateSprite } from "../objects/ui/state_sprite";
import { GameLogicPlugin } from "../plugins";
import { PowerUpOverlay } from "../objects/powerup";
import { ServerStateMessage } from "../models";

export class MainMenuScene extends Phaser.Scene {
  gameLogic: GameLogicPlugin | null = null;
  connectingText: StateSprite | null = null;
  playerName: Phaser.GameObjects.Text | null = null;

  nextGameText: Phaser.GameObjects.Text | null = null;
  nextGame: string | null = null;

  firstPlace: Phaser.GameObjects.Text | null = null;
  secondPlace: Phaser.GameObjects.Text | null = null;
  thirdPlace: Phaser.GameObjects.Text | null = null;
  fourthPlace: Phaser.GameObjects.Text | null = null;

  stateListener: Function | undefined = undefined;
  created = false;

  constructor() {
    super({
      key: Scenes.MainMenu,
    });

    this.created = false;
  }

  async create(): Promise<void> {
    this.created = false;

    this.sound.play(Sounds.Theme, { loop: true });
    this.gameLogic = this.plugins.get(Plugins.GameLogic) as GameLogicPlugin;

    this.stateListener = (data: ServerStateMessage) => {
      if (data.endAt) {
        this.nextGame = data.endAt;
      }

      if (!data.leaderboard) {
        return;
      }

      for (let i = 0; i < data.leaderboard.length; i++) {
        if (i > 3) {
          break;
        }
        const player = data.leaderboard[i];

        switch (i) {
          case 0:
            this.firstPlace?.setText(`${player.name} (${player.score})`);
            break;
          case 1:
            this.secondPlace?.setText(`${player.name} (${player.score})`);
            break;
          case 2:
            this.thirdPlace?.setText(`${player.name} (${player.score})`);
            break;
          case 3:
            this.fourthPlace?.setText(`${player.name} (${player.score})`);
            break;
        }
      }
    };

    this.gameLogic?.event.addListener(ServerMessages.State, this.stateListener);

    const group = this.add.group([]);

    this.connectingText = new StateSprite(
      this,
      0,
      -80,
      Spritesheets.ConnectingText,
      0,
    ).setScale(2);

    this.playerName = this.add.text(-110, 30, "Your Name:", { fontSize: "16px", color: "#fff" });

    const enterButton = new Button(
      this,
      0,
      100,
      Spritesheets.EnterButton,
      () => this.onEnterButtonClicked()
    ).setScale(2);

    const juicer = new StateSprite(
        this,
        -80,
        170,
        Spritesheets.Machines,
        0, 1,
    ).setScale(3);

    const fermenter = new StateSprite(
        this,
        0,
        170,
        Spritesheets.Machines,
        2, 3
    ).setScale(3);

    const distiler = new StateSprite(
        this,
        80,
        170,
        Spritesheets.Machines,
        4, 5,
    ).setScale(3);

    await this.gameLogic.connect();

    group.add(this.connectingText, true);
    group.add(this.playerName, true);
    group.add(enterButton, true);
    group.add(juicer, true);
    group.add(fermenter, true);
    group.add(distiler, true);

    this.nextGameText = new Phaser.GameObjects.Text(this, -105, 235, 'Next Game in: 0', { fontSize: '16px', color: '#ffffff' });
    group.add(this.nextGameText, true);

    group.incX((this.cameras.main.width / 2) - 112/2);
    group.incY((this.cameras.main.height / 2) - 100);

    const instructions = new StateSprite(this, 200, 350, Spritesheets.Instructions, 0).setScale(2.5);
    this.add.existing(instructions);

    const container = new Phaser.GameObjects.Container(this, 970, 350);
    const leaderboard = new StateSprite(this, 0, 0, Spritesheets.Instructions, 1).setScale(2.5);
    container.add(leaderboard);

    this.firstPlace = new Phaser.GameObjects.Text(this, -50, -20, 'First', { fontSize: '16px', color: '#ffffff' });
    this.secondPlace = new Phaser.GameObjects.Text(this, -50, 10, 'Second', { fontSize: '16px', color: '#ffffff' });
    this.thirdPlace = new Phaser.GameObjects.Text(this, -50, 40, 'Third', { fontSize: '16px', color: '#ffffff' });
    this.fourthPlace = new Phaser.GameObjects.Text(this, -50, 70, 'Fourth', { fontSize: '16px', color: '#ffffff' });

    container.add(this.firstPlace);
    container.add(this.secondPlace);
    container.add(this.thirdPlace);
    container.add(this.fourthPlace);

    const goldenCup = new StateSprite(this, -70, -11, Spritesheets.Cups, 0).setScale(1);
    const silverCup = new StateSprite(this, -70, 19, Spritesheets.Cups, 1).setScale(1);
    const bronzeCup = new StateSprite(this, -70, 49, Spritesheets.Cups, 2).setScale(1);
    const potatoCup = new StateSprite(this, -70, 79, Spritesheets.Cups, 3).setScale(1);

    container.add(goldenCup);
    container.add(silverCup);
    container.add(bronzeCup);
    container.add(potatoCup);
    
    this.add.existing(container);
    this.created = true;
  }

  update(): void {
    if (!this.created) {
      return
    }

    if (this.gameLogic?.connected) {
      this.connectingText?.setFrame(1);
    }

    if (this.gameLogic?.playerName) {
      this.playerName?.setText(`Your Name: ${this.gameLogic.playerName}`);
    }

    if (this.nextGame && this.nextGameText) {
      const time = new Date(this.nextGame).getTime() - new Date().getTime();
      this.nextGameText?.setText(`Next Game in: ${time / 1000}`);
    }
  }

  onEnterButtonClicked(): void {
    this.gameLogic?.event.removeListener(ServerMessages.State, this.stateListener);

    this.scene.start(Scenes.Welcome);
  }
}

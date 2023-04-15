import Phaser from "phaser";
import { Images, Maps, Plugins, Scenes, Sounds, Spritesheets } from "../enums";
import { Button } from "../objects/ui/button";
import { StateSprite } from "../objects/ui/state_sprite";
import { GameLogicPlugin } from "../plugins";

export class MainMenuScene extends Phaser.Scene {
  gameLogic: GameLogicPlugin | null = null;
  connectingText: StateSprite | null = null;
  constructor() {
    super({
      key: Scenes.MainMenu,
    });
  }

  async create(): Promise<void> {
    this.sound.play(Sounds.Theme, { loop: true });
    this.gameLogic = this.plugins.get(Plugins.GameLogic) as GameLogicPlugin;

    const group = this.add.group([]);

    this.connectingText = new StateSprite(
      this,
      0,
      0,
      Spritesheets.ConnectingText,
      0,
    ).setScale(2);

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
    group.add(enterButton, true);
    group.add(juicer, true);
    group.add(fermenter, true);
    group.add(distiler, true);

    group.incX((this.cameras.main.width / 2) - 112/2);
    group.incY((this.cameras.main.height / 2) - 100);
  }

  update(): void {
    if (this.gameLogic?.connected) {
      this.connectingText?.setFrame(1);
    }
  }

  onEnterButtonClicked(): void {
    this.scene.start(Scenes.Welcome);
  }
}

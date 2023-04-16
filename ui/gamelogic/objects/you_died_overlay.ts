import Phaser from "phaser";
import { StateSprite } from "./ui/state_sprite";
import { Spritesheets } from "../enums";

export class YouDiedOverlay extends Phaser.GameObjects.Container {
  text: Phaser.GameObjects.Text | null = null;
  subText: Phaser.GameObjects.Text | null = null;
  background: Phaser.GameObjects.Rectangle | null = null;

  duration = 5000;

  icon1: StateSprite | null = null;
  icon2: StateSprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, item: number) {
    super(scene, x, y);

    this.background = new Phaser.GameObjects.Rectangle(scene, 182, 100, 330, 100, 0xe0e0e0, 0.8);
    this.text = new Phaser.GameObjects.Text(scene, 30, 50, 'YOU DIED', { fontSize: '64px', color: '#a6231c' });
    this.subText = new Phaser.GameObjects.Text(scene, 80, 120, 'Respawn in: 5 seconds', { fontSize: '16px', color: '#780000' });

    this.add(this.background);
    this.add(this.text);
    this.add(this.subText);

    this.visible = false;

    this.setScale(0.7);
  }

  activate() {
    this.setVisible(true);
    this.duration = 5000;
  }

  deactivate() {
    this.setVisible(false);
  }

  preUpdate(time: number, delta: number): void {
    this.duration -= delta;

    if (this.duration <= 0) {
      this.deactivate();
    }

    this.subText?.setText(`Respawn in: ${Math.floor(this.duration / 1000)} seconds`);
  }
}

import Phaser from "phaser";
import { StateSprite } from "./ui/state_sprite";
import { Spritesheets } from "../enums";

export class PowerUpOverlay extends Phaser.GameObjects.Container {
  item: number;
  status: Phaser.GameObjects.Text | null = null;
  duration: number;

  icon1: StateSprite | null = null;
  icon2: StateSprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, item: number) {
    super(scene, x, y);
    this.item = item;
    this.duration = 0;

    this.icon1 = new StateSprite(this.scene, 0, 0, Spritesheets.Items, item)
    this.add(this.icon1);

    this.icon2 = new StateSprite(this.scene, 85, 0, Spritesheets.Items, item)
    this.add(this.icon2);

    this.status = new Phaser.GameObjects.Text(scene, 18, -3, '10 seconds', { fontSize: '8px', color: '#ffffff' });
    this.add(this.status);

    this.visible = false;

    this.setScale(0.7);
  }

  activate(item: number, duration: number) {
    this.item = item;
    this.icon1?.setFrame(item);
    this.icon2?.setFrame(item);

    this.duration = duration;
    this.setVisible(true);
  }

  deactivate() {
    this.setVisible(false);
  }

  preUpdate(time: number, delta: number): void {
    this.duration -= delta;

    if (this.duration <= 0) {
      this.deactivate();
    }

    this.status?.setText(`${Math.floor(this.duration / 1000)} seconds`);
  }
}

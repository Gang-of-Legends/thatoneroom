import Phaser from "phaser";
import { StateSprite } from "./ui/state_sprite";
import { Spritesheets } from "../enums";

export class Item extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, frame: number) {
    super(scene, x, y);

    this.add(new StateSprite(this.scene, 0, 0, Spritesheets.Items, frame).setScale(0.4));
    this.add(new StateSprite(this.scene, 0, 0, Spritesheets.Circles, 0));
  }

  preUpdate(time: number, delta: number): void {
    this.setRotation(this.rotation + 0.2 * (delta / 1000));
  }
}

import Phaser from "phaser";
import { StateSprite } from "./ui/state_sprite";
import { Spritesheets } from "../enums";

export class Bottle extends StateSprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    icon: "water" | "rum"
  ) {
    const frame = icon === "water" ? 0 : 1;

    super(scene, x, y, Spritesheets.Bottles, frame);

    this.scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.body!.onCollide = true;

    this.addToUpdateList();
  }

  throw(velocity: number) {
    this.setVelocityX(velocity);
    this.setVelocityY(-50);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    this.setRotation(this.rotation + 0.2);
  }
}

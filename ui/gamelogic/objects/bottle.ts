import Phaser from "phaser";
import { StateSprite } from "./ui/state_sprite";
import { Images, Spritesheets } from "../enums";
import { Player } from "./player";

export class Bottle extends Phaser.Physics.Arcade.Sprite {
  assignedPlayer: Player | null = null;

  despawning: boolean = true;
  emitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

  constructor(scene: Phaser.Scene) {
    super(scene, -1000, -1000, Spritesheets.Bottles, 0);

    this.emitter = this.scene.add.particles(0, 0, Images.ParticleGlass, {
      frame: 'blue',
      scale: { start: 0.4, end: 0 },
      speed: { min: 0, max: 20 },
      blendMode: 'BLEND',
      emitting: false,
    });
    this.emitter.depth = 100;
  }

  throw(x: number, y: number, velocityX: number, velocityY: number) {
    this.despawning = false;
    this.enableBody(true, x, y, true, true);
    this.setScale(0.4);
    this.setActive(true);
    this.setVisible(true);

    this.setVelocityX(velocityX);
    this.setVelocityY(velocityY);
  }

  despawn() {
    this.despawning = true;
  }

  explode() {
    this.emitter?.explode(5, this.x, this.y);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (!this.active) {
      this.disableBody(true, true);
    }
    
    if (!this.despawning) {
      this.setRotation(this.rotation + 0.2);
    }
    
    if (this.despawning && this.body!.velocity.x != 0) {
      if (Math.abs(this.body!.velocity.x) < 10) {
        this.setVelocityX(0);
      } else {
        this.setVelocityX(this.body!.velocity.x * 0.97);
      }
    }
  }
}

export class BottleGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene: Phaser.Scene) {
    super(scene.physics.world, scene);

    this.createMultiple({
      classType: Bottle,
      frameQuantity: 30,
      active: false,
      visible: false,
      key: Spritesheets.Bottles,
    });
  }

  throw(x: number, y: number, velocityX: number, velocityY: number) {
    const bottle : Bottle = this.getFirstDead(true);
    bottle.setFrame(1);
    bottle.depth = 10;

    if (bottle) {
      bottle.throw(x, y, velocityX, velocityY);
    }
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    this.children.each((bottle: Bottle) => {
      bottle.preUpdate(time, delta);
    })
  }
}
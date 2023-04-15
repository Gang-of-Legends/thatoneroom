import Phaser from "phaser";

export class Button extends Phaser.GameObjects.Sprite {
  constructor(scene: Phaser.Scene, x : number, y : number, texture: string, private callback: () => void) {
    super(scene,x, y, texture, 0);
    this.setInteractive()
      .on("pointerover", () => this.enterButtonHoverState())
      .on("pointerout", () => this.enterButtonRestState())
      .on("pointerdown", () => this.enterButtonActiveState())
      .on("pointerup", () => {
        this.enterButtonHoverState();
      });
  }

    enterButtonHoverState() {
        this.setFrame(1);
    }

    enterButtonRestState() {
        this.setFrame(0);
    }

    enterButtonActiveState() {
        this.setFrame(2);

        this.callback();
    }

    setCallback(callback: () => void) {
    };
}

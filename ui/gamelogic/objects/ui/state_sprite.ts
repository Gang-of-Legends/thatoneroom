import Phaser from 'phaser';

export class StateSprite extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x : number, y : number, texture: string, frameFrom: number, frameTo?: number) {
        super(scene, x, y, texture, frameFrom || 0);

        if (frameTo) {
            this.animate(frameFrom, frameTo);
        }
    }

    animate(from: number, to: number) {
        this.anims.create({
            key: 'animate',
            frames: this.anims.generateFrameNumbers(this.texture.key, { frames: [ from, to ] }),
            frameRate: 8,
            repeat: -1
        })

        this.anims.play('animate');
    }
}
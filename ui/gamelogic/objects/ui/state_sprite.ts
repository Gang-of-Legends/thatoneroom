import Phaser from 'phaser';

export class StateSprite extends Phaser.GameObjects.Sprite {
    constructor(scene: Phaser.Scene, x : number, y : number, texture: string, private stateMap :{ [key:string]:number; }) {
        super(scene, x, y, texture, 0);
    }

    transition(state: string) {
        this.setFrame(this.stateMap[state]);
    }
}
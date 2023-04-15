import { PlayerStates } from "../enums";
import { Character } from "./character";

export class Enemy extends Character {
    id: string;
    target: Phaser.Math.Vector2 | null = null;
    state: PlayerStates = PlayerStates.Idle;

    constructor(scene: Phaser.Scene, x: number, y: number, id: string, tint: number | null = null) {
        super(scene, x, y, tint);
        this.id = id;
        this.setGravityY(-200);
        super.play(this.state);
    }

    changeState(movement: PlayerStates) {
        if (this.state !== movement) {
            this.state = movement;
            //this.play(this.state);
        }
    }

    update() {
        if (this.anims.get(this.state).paused) {
            this.play(this.state);
        };
    }
}
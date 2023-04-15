import { getTokenSourceMapRange } from "typescript";
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
            this.play(this.state);
        }
    }

    update() {
        this.body?.stop();
        if (this.target) {
            if (Math.abs(this.x - this.target.x) > 2 || Math.abs(this.y - this.target.y) > 2) {
                const speed = this.isFalling || this.state == PlayerStates.Jump ? 100 : 50;
                this.scene.physics.moveToObject(this, this.target, speed);
            } else {
                this.setPosition(this.target.x, this.target.y);
                this.target = null;
            }
        }
    }

    get isFalling() {
        return !this.body?.blocked.down;
    }
}
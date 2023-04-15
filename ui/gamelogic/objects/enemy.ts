import { Character } from "./character";

export class Enemy extends Character {
    id: string;

    constructor(scene: Phaser.Scene, x: number, y: number, id: string, tint: number | null = null) {
        super(scene, x, y, tint);
        this.id = id;
    }
}
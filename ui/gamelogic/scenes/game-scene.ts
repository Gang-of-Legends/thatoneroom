import Phaser from 'phaser';
import { Images } from "../enums";

export class GameScene extends Phaser.Scene {
    constructor() {
        super({
            key: "GameScene"
        });
    }

    create(): void {
        const map = this.make.tilemap({ key: "TestMap1" });
        const tileset = map.addTilesetImage('experiment1', Images.Tiles);

        //
    }
}
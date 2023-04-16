import Phaser from 'phaser';
import { Images, Scenes } from "../enums";
import { YouDiedOverlay } from '../objects/you_died_overlay';

export class GameOverlayScene extends Phaser.Scene {
    nextGame: number | null = null;
    nextGameText: Phaser.GameObjects.Text | null = null;
    youDiedOverlay: YouDiedOverlay | null = null;

    constructor() {
        super({
            key: Scenes.GameOverlay
        });
    }

    init(data: any) {
        if (data) {
            this.nextGame = data.nextGame ?? 5000;
        }else {
            this.nextGame = 5000;
        }
        console.log("initialized overlay")
    }

    create(): void {
        this.nextGameText = new Phaser.GameObjects.Text(this, 50, 166, 'Game ends in: 0', { fontSize: '16px', color: '#ff0000' }).setScale(2);
        this.add.existing(this.nextGameText);

        this.youDiedOverlay = new YouDiedOverlay(this, 0, 0, 0);
        this.youDiedOverlay.setScale(3);
        this.add.existing(this.youDiedOverlay);
    }

    update() {
        if (this.nextGame) {
            const time = new Date(this.nextGame).getTime() - new Date().getTime();
            this.nextGameText?.setText(`Game ends in: ${time / 1000}`);
        }
    }

    showDeadOverlay() {
        this.youDiedOverlay?.activate();
    }
}
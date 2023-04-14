import Phaser from 'phaser';
import { Images, Scenes, Sounds } from "../enums";

export class WelcomeScene extends Phaser.Scene {
    constructor() {
        super({
            key: Scenes.Welcome
        });
    }

    create(): void {
        this.sound.play(Sounds.Theme);
    }
}
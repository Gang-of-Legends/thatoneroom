import Phaser from 'phaser';
import { Images, Maps, Scenes, Sounds, Spritesheets } from "../enums";
import 'phaser-ui-tools';
import { Button } from '../objects/ui/button';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: Scenes.MainMenu
        });
    }

    create(): void {
        this.sound.play(Sounds.Theme, { loop: true });

        const enterButton = new Button(this, 200, 200, Spritesheets.EnterButton, () => this.onEnterButtonClicked());
        this.add.existing(enterButton).setScale(2);
    }

    onEnterButtonClicked(): void {
        this.scene.start(Scenes.Welcome);
    }
}
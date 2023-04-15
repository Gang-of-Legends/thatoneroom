import Phaser from 'phaser';
import { Images, Maps, Scenes, Sounds, Spritesheets } from "../enums";
import { Button } from '../objects/ui/button';
import { StateSprite } from '../objects/ui/state_sprite';

export class MainMenuScene extends Phaser.Scene {
    constructor() {
        super({
            key: Scenes.MainMenu
        });
    }

    create(): void {
        this.sound.play(Sounds.Theme, { loop: true });

        const connectingText = new StateSprite(this, 250, 130, Spritesheets.ConnectingText, {
            "connecting": 0,
            "connected": 1,
        });
        const enterButton = new Button(this, 250, 200, Spritesheets.EnterButton, () => this.onEnterButtonClicked());

        this.add.existing(connectingText).setScale(2);
        this.add.existing(enterButton).setScale(2);
    }

    onEnterButtonClicked(): void {
        this.scene.start(Scenes.Welcome);
    }
}
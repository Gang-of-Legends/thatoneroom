import Phaser from 'phaser';
import { Images, Maps, Plugins, Scenes, Sounds, Spritesheets } from "../enums";
import { Button } from '../objects/ui/button';
import { StateSprite } from '../objects/ui/state_sprite';
import { GameLogicPlugin } from '../plugins';

export class MainMenuScene extends Phaser.Scene {

    gameLogic: GameLogicPlugin | null = null;
    connectingText: StateSprite | null = null;
    constructor() {
        super({
            key: Scenes.MainMenu
        });
    }

    async create(): Promise<void> {
        this.sound.play(Sounds.Theme, { loop: true });
        this.gameLogic = this.plugins.get(Plugins.GameLogic) as (GameLogicPlugin);

        this.connectingText = new StateSprite(this, 250, 130, Spritesheets.ConnectingText, {
            "connecting": 0,
            "connected": 1,
        });
        await this.gameLogic.connect()
        const enterButton = new Button(this, 250, 200, Spritesheets.EnterButton, () => this.onEnterButtonClicked());

        this.add.existing(this.connectingText).setScale(2);
        this.add.existing(enterButton).setScale(2);
    }

    update(): void {
        if (this.gameLogic?.connected) {
            //this.add.existing(this.connectingText.setState("connected"));
            this.connectingText?.transition("connected");
            console.log("connected");
        }
    }

    onEnterButtonClicked(): void {
        this.scene.start(Scenes.Welcome);
    }
}
import Phaser from 'phaser';
import { Images, Maps, Scenes, Sounds } from "../enums";
import { BaseLevelScene } from './base-level-scene';
import { Bottle } from '../objects/bottle';

export class WelcomeScene extends BaseLevelScene {
    constructor() {
        super(
            Scenes.Welcome,
            {
                backgroundLayers: ["Background"],
                worldLayers: ["Map"],
                map: Maps.TestMap1
            }
        );
    }

    create(): void {
        super.create();
        this.sound.play(Sounds.Theme, { loop: true });
    }

    update(time: number, delta: number): void {
        super.update(time, delta);
    }
}
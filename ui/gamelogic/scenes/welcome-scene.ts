import Phaser from 'phaser';
import { Images, Maps, Scenes, Sounds } from "../enums";
import { BaseLevelScene } from './base-level-scene';
import { Bottle } from '../objects/bottle';
import { SceneConfig } from '../models';

export class WelcomeScene extends BaseLevelScene {


    constructor() {
        const configs = [
            {
                backgroundLayers: ["Background"],
                worldLayers: ["Map"],
                map: Maps.TestMap1
            },
            {
                backgroundLayers: ["Background", "BackgroundItems"],
                worldLayers: ["Map"],
                map: Maps.TurboMap
            }
        ];

        super(
            Scenes.Welcome,
            configs[1]
        );
    }

    create(): void {
        super.create();
    }

    update(time: number, delta: number): void {
        super.update(time, delta);
    }
}
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

        this.physics.world.on('collide', (obj1: any, obj2: any) => {
            console.log('collide')
            if (obj1 instanceof Bottle && obj2 instanceof Bottle) {
                obj1.destroy();
                obj2.destroy();
            }
        });
    }

    update(time: number, delta: number): void {
        super.update(time, delta);
    }
}
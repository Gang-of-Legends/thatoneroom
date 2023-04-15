import Phaser from 'phaser';
import { StateSprite } from './ui/state_sprite';
import { Spritesheets } from '../enums';

export class Icon extends StateSprite {
    constructor(scene: Phaser.Scene, x: number, y: number, icon: 'heart') {
        super(scene, x, y, Spritesheets.Icons, 0);
    }
}

import Phaser from "phaser";
import { Enemy } from "../objects";
import { Bottle } from "../objects/bottle";

export abstract class Colliders {

    /* Would be lovely to refactor colliders and move them here */
    /*
    public static collideEnemyWithBottle(scene: Phaser.Scene, enemy: Enemy, bottle: Bottle) {
        if (bottle.playerId != enemy.id) {
            scene.emitBlood(enemy.x, enemy.y);
            scene.sound.play(Sounds.HitEnemy);
            scene.bottleCollision(bottle);
        }
    }
    */
}
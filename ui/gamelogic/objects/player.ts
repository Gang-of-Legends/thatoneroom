import Phaser from "phaser";
import { Plugins, Sounds, Spritesheets } from "../enums";
import { GameLogicPlugin } from "../plugins";
import { Character } from "./character";
import { Bottle } from "./bottle";

export class Player extends Character {
    private isWalking: boolean;
    private isJumping: boolean;
    private isIdling: boolean;
    private isDead: boolean;
    private speed: number;
    private jumpVelocity: number;
    private onCooldown = false;
    keys: any;
    gameLogic: GameLogicPlugin | null = null;
    timer: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, speed=50, jumpVelocity=150, tint: number | null = null) {
        super(scene, x, y, tint);

        if (tint !== null)
            this.setTint(tint)
        this.speed = speed;
        this.jumpVelocity = jumpVelocity;
        this.isWalking = false;
        this.isJumping = false;
        this.isIdling = true;

        this.gameLogic = this.scene.plugins.get(Plugins.GameLogic) as GameLogicPlugin;

        this.isDead = false;

        const { LEFT, RIGHT, UP, W, A, D, E } = Phaser.Input.Keyboard.KeyCodes;
        this.keys = scene.input?.keyboard?.addKeys({
            left: LEFT,
            right: RIGHT,
            up: UP,
            e: E,
            space: Phaser.Input.Keyboard.KeyCodes.SPACE
        });
    }

    walkRight() {
        if (!this.isDead) {
            this.checkJump();
            this.setVelocityX(this.speed);
            this.setFlipX(false);
            this.isIdling = false;
            if (!this.isWalking && !this.isJumping) {
                this.play('walk');
                this.isWalking = true;
            };
        }
    }

    walkLeft() {
        if (!this.isDead) {
            this.checkJump();
            this.setVelocityX(-1*this.speed);
            this.setFlipX(true);
            this.isIdling = false;
            if (!this.isWalking && !this.isJumping) {
                this.play('walk');
                this.isWalking = true;
            }
        }
    }

    jump() {
        if (this.canJump && !this.isDead) {
            this.setVelocityY(-1*this.jumpVelocity);
            this.play('jump');
            this.isJumping = true;
            this.isIdling = false;
            this.isWalking = false;
            this.scene.sound.play(Sounds.Jump);
        }
    }

    idle() {
        this.checkJump();
        if (!this.isJumping && !this.isIdling && !this.isDead) {
            this.isIdling = true;
            this.isWalking = false;
            this.play('idle');
        }
    }

    startCooldown() {
        this.onCooldown = true;
        setTimeout(() => {
            this.onCooldown = false;
        }, 1000);
    }

    update(time: number, delta: number) {
        this.setVelocityX(0);
        if (this.keys.right.isDown) {
            this.walkRight();
        } else if (this.keys.left.isDown) {
            this.walkLeft();
        } else {
            this.idle();
        }
        if ((this.keys.up.isDown || this.keys.space.isDown)) {
            this.jump();
        }

        if (this.keys.e.isDown && !this.onCooldown) {
            this.startCooldown();
            this.throw();
        }

        this.timer += delta;
        if (this.timer > 100) {
            this.timer = 0;
            this.gameLogic?.sendPosition(this.x, this.y);
        }
    }

    throw() {
        const bottle = new Bottle(this.scene, this.x, this.y, 'rum').setScale(0.4);
        this.scene.add.existing(bottle);
        bottle.throw(150 * (this.flipX ? -1 : 1));
    }

    private checkJump() {
        if (this.canJump) {
            this.isJumping = false;
        }
    }

    private get canJump() {
        return this.body?.blocked.down;
    }
}
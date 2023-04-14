import Phaser from "phaser";
import { Spritesheets } from "../enums";

export class Player extends Phaser.Physics.Arcade.Sprite {
    private isWalking: boolean;
    private isJumping: boolean;
    private isIdling: boolean;
    private isDead: boolean;
    private speed: number;
    keys: any;

    constructor(scene: Phaser.Scene, x: number, y: number, speed=50) {
        super(scene, x, y, Spritesheets.Main, 4);

        this.speed = speed;
        this.isWalking = false;
        this.isJumping = false;
        this.isIdling = true;

        scene.add.existing(this);
        scene.physics.add.existing(this)

        this.body?.setSize(7, 13, true);
        this.setCollideWorldBounds(true);
        this.isDead = false;


        const { LEFT, RIGHT, UP, W, A, D } = Phaser.Input.Keyboard.KeyCodes;
        this.keys = scene.input?.keyboard?.addKeys({
            left: LEFT,
            right: RIGHT,
            up: UP,
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
                this.isWalking = true;
            }
        }
    }

    jump() {
        if (this.canJump && !this.isDead) {
            this.setVelocityY(-1.5*this.speed);
            this.play('jump');
            this.isJumping = true;
            this.isIdling = false;
            this.isWalking = false;
        }
    }

    idle() {
        this.checkJump();
        if (!this.isJumping && !this.isIdling && !this.isDead) {
            this.isIdling = true;
            this.isWalking = false;
        }
    }

    update() {
        this.setVelocityX(0);
        if (this.keys.right.isDown) {
            this.walkRight();
        } else if (this.keys.left.isDown) {
            this.walkLeft();
        } else {
            this.idle();
        }
        if ((this.keys.up.isDown || this.keys.space.isDown))
        {
            this.jump();
        }
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
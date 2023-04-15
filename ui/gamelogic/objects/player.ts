import Phaser from "phaser";
import { Sounds, Spritesheets } from "../enums";

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

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers(Spritesheets.Main, { frames: [ 12, 13, 14, 15 ] }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers(Spritesheets.Main, { frames: [ 8, 9 ] }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers(Spritesheets.Main, { frames: [ 16, 17 ] }),
            frameRate: 4,
            repeat: -1
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
            this.setVelocityY(-1.5*this.speed);
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
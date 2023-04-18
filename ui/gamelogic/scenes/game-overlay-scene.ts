import Phaser from "phaser";
import { GameEvents, Plugins, Scenes, ServerMessages, Spritesheets } from "../enums";
import { WebClientPlugin } from "../plugins";
import { ServerStateMessage } from "../models";
import { YouDiedOverlay } from "../objects";
import { BOTTLES_MAX_COUNT, PLAYER_MAX_HEALTH } from "../constants";
import { PowerUps } from "../enums/powerups";

export class GameOverlayScene extends Phaser.Scene {

    nextGameText: Phaser.GameObjects.Text | null = null;
    nextGame: string | null = null;

    youDiedOverlay: Phaser.GameObjects.Container | null = null;
    hearts: Phaser.GameObjects.Image[] = [];
    health: number = PLAYER_MAX_HEALTH;

    bottleImage: Phaser.GameObjects.Image | null = null;
    bottleStatus: Phaser.GameObjects.Text | null = null;
    maxBottles: number = BOTTLES_MAX_COUNT;
    bottleCount: number = BOTTLES_MAX_COUNT;

    webClient: WebClientPlugin | null = null;

    constructor() {
        super({
            key: Scenes.GameOverlay
        });
    }

    create() {
        this.nextGameText = new Phaser.GameObjects.Text(this, 32, 672, 'Game ends in: 0', { fontSize: '16px', color: '#ffffff' }).setScale(1.25);
        this.add.existing(this.nextGameText);

        this.youDiedOverlay = new YouDiedOverlay(this, 96, 0, 0).setScale(3);
        this.add.existing(this.youDiedOverlay);

        this.hearts.forEach(h => h.destroy());
        for (let i = 0; i < PLAYER_MAX_HEALTH; i++) {
            this.hearts.push(this.add.image(960 + (48 * i), 32, Spritesheets.Icons, 0).setScale(2.5));
        }

        this.bottleCount = BOTTLES_MAX_COUNT;
        this.maxBottles = BOTTLES_MAX_COUNT;

        this.bottleImage = this.add.image(64, 26, Spritesheets.Bottles, 1).setScale(2.25);
        this.bottleStatus = this.add.text(80, 20, '3/3', { fontSize: '16px', color: '#edebeb' }).setScale(1.5);

        this.webClient = this.plugins.get(Plugins.WebClient) as WebClientPlugin;
        this.addEventHandlers();
    }

    addEventHandlers() {
        this.webClient?.event.addListener(ServerMessages.State, (data: ServerStateMessage) => {
            this.nextGame = data.endAt;
        });
        this.game.events.addListener(GameEvents.PlayerDied, () => {
            this.youDiedOverlay?.activate();
        });
        this.game.events.addListener(GameEvents.BottleThrown, () => {
            this.bottleCount--;
        });
        this.game.events.addListener(GameEvents.BottleLoaded, () => {
            this.bottleCount++;
        });
        this.game.events.addListener(GameEvents.PowerUpPickedUp, (powerup: PowerUps) => {
            switch (powerup) {
                case PowerUps.AdditionalBottles:
                    this.handleAdditionalBottles();
                    break;
                case PowerUps.FasterReload:
                    this.bottleCount = BOTTLES_MAX_COUNT;
                default:
                    break;
            }
        });
        this.game.events.addListener(GameEvents.PowerUpFaded, (powerup: PowerUps) => {
            if (powerup === PowerUps.AdditionalBottles) {
                this.handleBottleReset();
            }
        });
        this.game.events.addListener(GameEvents.PlayerRespawned, () => {
            this.health = PLAYER_MAX_HEALTH;
            this.hearts.forEach(heart => heart.setVisible(true));
        });
        this.game.events.addListener(GameEvents.PlayerHealed, () => {
            this.health = (this.health + 1) % (PLAYER_MAX_HEALTH + 1);
            this.handleHeartsVisibility();
        });
        this.game.events.addListener(GameEvents.PlayerHit, () => {
            this.health = Math.max(this.health - 1, 0);
            this.handleHeartsVisibility();
        });
    }

    handleAdditionalBottles(): void {
        this.maxBottles = 13;
        this.bottleCount = 10;
    }

    handleBottleReset(): void {
        this.maxBottles = BOTTLES_MAX_COUNT;
        this.bottleCount = Math.min(Math.max(1, this.bottleCount), BOTTLES_MAX_COUNT);
    }

    handleHeartsVisibility(): void {
        for (var i = 0; i < (PLAYER_MAX_HEALTH - this.health); i++) {
            this.hearts[i].setVisible(false);
        }
        for (var i = PLAYER_MAX_HEALTH - this.health; i < this.hearts.length; i++) {
            this.hearts[i].setVisible(true);
        }
    }

    update(time: number, delta: number): void {
        if (this.nextGame) {
            const time = new Date(this.nextGame).getTime() - new Date().getTime();
            this.nextGameText?.setText(`Game ends in: ${time / 1000}`);
        }

        this.bottleStatus?.setText(`${this.bottleCount}/${this.maxBottles}`);
    }
}
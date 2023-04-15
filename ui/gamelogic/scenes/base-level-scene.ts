import Phaser from "phaser";
import { Images, Plugins, ServerMessages, Tilesets } from "../enums";
import { ServerAddPlayerMessage, ServerPlayerMoveMessage, ServerStateMessage } from "../models";
import { SceneConfig } from "../models/scene-config";
import { Enemy, Player } from "../objects";
import { GameLogicPlugin } from "../plugins";
import { Bottle, BottleGroup } from "../objects/bottle";


export class BaseLevelScene extends Phaser.Scene {
    player: Player;
    enemies: Enemy[] = [];
    bottles: BottleGroup;

    private sceneConfig: SceneConfig;
    gameLogic: GameLogicPlugin | null = null;
    worldLayers: (Phaser.Tilemaps.TilemapLayer| null)[] = [];

    constructor(sceneKey: string, layers: SceneConfig) {
        super({
            key: sceneKey
        });
        this.sceneConfig = layers;
    }

    create(): void {
        const map = this.make.tilemap({ key: this.sceneConfig.map });
        const tileset = map.addTilesetImage(Tilesets.Main, Images.Tiles);
        this.gameLogic = this.plugins.get(Plugins.GameLogic) as GameLogicPlugin;

        this.bottles = new BottleGroup(this);
        this.addEventListeners();

        this.input.keyboard.on('keydown-E', event => {
            console.log('throwing bottle');
            this.throwBottle();
        });

        if (tileset !== null) {
            const backgroundLayers = this.sceneConfig.backgroundLayers
                ? this.sceneConfig.backgroundLayers.map(layer => map.createLayer(layer, tileset, 0, 0))
                : [];

            this.worldLayers = this.sceneConfig.worldLayers
                ? this.sceneConfig.worldLayers.map(layer => map.createLayer(layer, tileset, 0, 0)) ?? []
                : [];

            const spawns = map.getObjectLayer("Spawns")?.objects ?? [];
            const spawnIndex = Math.floor(Math.random() * (spawns.length));
            const spawn = spawns[spawnIndex];

            this.player = new Player(this, spawn.x ?? 0, spawn.y ?? 0);
            this.gameLogic?.auth(this.player.x, this.player.y);

            this.worldLayers.forEach(layer => {
                if (layer !== null) {
                    layer.setCollisionByProperty({ collides: true });
                    this.physics.add.collider(layer, this.player);
                    this.physics.add.collider(layer, this.bottles, (bottle: Bottle) => {
                        if (bottle.despawning) {
                            return;
                        }
                        bottle.despawning = true;

                        setTimeout(() => {
                            bottle.setActive(false);
                            bottle.setVisible(false);
                        }, 3000);
                    });
                }
            });

            this.physics.add.collider(this.bottles, this.bottles, (bottle1: Bottle, bottle2: Bottle) => {
                bottle1.setActive(false);
                bottle1.setVisible(false);
                bottle2.setActive(false);
                bottle2.setVisible(false);

                console.log('colliding bottles');
            });

            if (backgroundLayers && backgroundLayers[0]) {
                this.physics.world.setBounds(0, 0, backgroundLayers[0].width, backgroundLayers[0].height);
                this.cameras.main.setBounds(0, 0, backgroundLayers[0].width, backgroundLayers[0].height)
            } else {
                console.error("Background has to be set for camera to work properly");
            }
            this.cameras.main.zoom = 4;
            this.cameras.main.startFollow(this.player);

            const foregroundLayers = this.sceneConfig.foregroundLayers
                ? this.sceneConfig.foregroundLayers.map(layer => map.createLayer(layer, tileset, 0, 0))
                : [];
        }

        this.player?.idle();
    }

    addEventListeners() {
        this.gameLogic?.event.addListener(ServerMessages.State, (data: ServerStateMessage) => {
          this.enemies.forEach(enemy => enemy.destroy());
          this.enemies = [];
          data.objects.filter(obj => obj.type === 'player' && this.gameLogic?.id != obj.id).forEach(obj => {
              this.enemies.push(new Enemy(this, obj.x, obj.y, obj.id, 0x00ff00))
          })
        });
        this.gameLogic?.event.addListener(ServerMessages.AddPlayer, (data: ServerAddPlayerMessage) => {
            if (this.gameLogic?.id == data.id) {
                return
            }
            const enemy = new Enemy(this, 150, 150, data.id, 0x00ff00);
            this.enemies.push(enemy);
        });
        this.gameLogic?.event.addListener(ServerMessages.Move, (data: ServerPlayerMoveMessage) => {
            const enemy = this.enemies.find((enemy) => enemy.id == data.id);
            if (enemy) {
                enemy.target = new Phaser.Math.Vector2(data.x, data.y);
                enemy.changeState(data.movement);
            }
        });
        this.gameLogic?.event.addListener(ServerMessages.RemovePlayer, (data: ServerAddPlayerMessage) => {
            const enemy = this.enemies.find((enemy) => enemy.id == data.id);
            this.enemies = this.enemies.filter((enemy) => enemy.id != data.id);
            enemy?.destroy();
        });
    }

    throwBottle() {
        this.bottles.throw(this.player.x + 3*(this.player.flipX ? -1 : 1), this.player.y, 150 * (this.player.flipX ? -1 : 1));
    }
    
    update(time: number, delta: number): void {
        this.player?.update(time, delta);

        super.update(time, delta);

        this.bottles.preUpdate(time, delta);

        this.enemies.forEach((enemy) => {
            enemy.body?.stop();
            if (enemy.target) {
                if (Math.abs(enemy.x - enemy.target.x) > 2 || Math.abs(enemy.y - enemy.target.y) > 2) {
                    this.physics.moveToObject(enemy, enemy.target);
                } else {
                    enemy.setPosition(enemy.target.x, enemy.target.y);
                    enemy.target = null;
                }
            }
        });
    }
}
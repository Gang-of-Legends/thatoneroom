import Phaser from "phaser";
import { Images, Plugins, ServerMessages, Tilesets } from "../enums";
import { ServerAddPlayerMessage, ServerPlayerMoveMessage } from "../models";
import { SceneConfig } from "../models/scene-config";
import { Enemy, Player } from "../objects";
import { GameLogicPlugin } from "../plugins";


export class BaseLevelScene extends Phaser.Scene {
    player: Player;
    enemies: Enemy[] = [];
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

        this.addEventListeners();

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

            this.worldLayers.forEach(layer => {
                if (layer !== null) {
                    layer.setCollisionByProperty({ collides: true });
                    this.physics.add.collider(layer, this.player);
                }
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
        this.gameLogic?.event.addListener(ServerMessages.AddPlayer, (data: ServerAddPlayerMessage) => {
            const enemy = new Enemy(this, 150, 150, data.id, 0x00ff00);
            /*this.worldLayers.forEach((layer) => {
                if (layer != null)
                    this.physics.add.collider(layer, enemy);
            })*/
            this.enemies.push(enemy);
        });
        this.gameLogic?.event.addListener(ServerMessages.Move, (data: ServerPlayerMoveMessage) => {
            const enemy = this.enemies.find((enemy) => enemy.id == data.id);
            if (enemy)
                enemy.target = new Phaser.Math.Vector2(data.x, data.y);
        });
        this.gameLogic?.event.addListener(ServerMessages.RemovePlayer, (data: ServerAddPlayerMessage) => {
            const enemy = this.enemies.find((enemy) => enemy.id == data.id);
            this.enemies = this.enemies.filter((enemy) => enemy.id != data.id);
            enemy?.destroy();
        });
    }
    
    update(time: number, delta: number): void {
        this.player?.update(time, delta);

        super.update(time, delta);
        
        this.enemies.forEach((enemy) => {
            enemy.body?.stop();
            if (enemy.target) {
                if (Math.abs(enemy.x - enemy.target.x) > 2 || Math.abs(enemy.y - enemy.target.y) > 2) {
                    this.physics.moveToObject(enemy, enemy.target);
                }
            }
        });
    }
}
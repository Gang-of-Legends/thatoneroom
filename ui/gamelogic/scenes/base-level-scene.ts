import Phaser from "phaser";
import { Images, Tilesets } from "../enums";
import { SceneConfig } from "../models/scene-config";
import { Player } from "../objects";


export class BaseLevelScene extends Phaser.Scene {
    player: Player;
    private sceneConfig: SceneConfig;

    constructor(sceneKey: string, layers: SceneConfig) {
        super({
            key: sceneKey
        });
        this.sceneConfig = layers;
    }

    create(): void {
        const map = this.make.tilemap({ key: this.sceneConfig.map });
        const tileset = map.addTilesetImage(Tilesets.Main, Images.Tiles);

        if (tileset !== null) {
            const backgroundLayers = this.sceneConfig.backgroundLayers
                ? this.sceneConfig.backgroundLayers.map(layer => map.createLayer(layer, tileset, 0, 0))
                : [];

            const worldLayers = this.sceneConfig.worldLayers
                ? this.sceneConfig.worldLayers.map(layer => map.createLayer(layer, tileset, 0, 0))
                : [];

            const spawns = map.getObjectLayer("Spawns")?.objects ?? [];
            const spawnIndex = Math.floor(Math.random() * (spawns.length));
            const spawn = spawns[spawnIndex];

            this.player = new Player(this, spawn.x ?? 0, spawn.y ?? 0);

            worldLayers.forEach(layer => {
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
    
    update(time: number): void {
        this.player?.update();
    }
}
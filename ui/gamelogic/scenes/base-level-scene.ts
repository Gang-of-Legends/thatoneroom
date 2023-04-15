import Phaser from "phaser";
import { Images, PlayerMessages, Plugins, ServerMessages, Sounds, Spritesheets, Tilesets } from "../enums";
import { ServerAddPlayerMessage, ServerPlayerMoveMessage, ServerStateMessage } from "../models";
import { SceneConfig } from "../models/scene-config";
import { Enemy, Player } from "../objects";
import { GameLogicPlugin } from "../plugins";
import { Bottle, BottleGroup } from "../objects/bottle";
import { Item } from "../objects/item";
import { ServerSpawnObjectMessage } from "../models/server-spawn-object";
import { StateSprite } from "../objects/ui/state_sprite";
import { runInThisContext } from "vm";


export class BaseLevelScene extends Phaser.Scene {
    player: Player;
    enemies: Enemy[] = [];
    bottles: BottleGroup;
    bloodEmmiter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

    bottleInventory = 3;
    bottleInventoryRefillTimeout: any = null;
    bottleOnGCD = false;

    grabBottle(): boolean {
        if (this.bottleInventory <= 0) {
            return false
        }
        if (this.bottleOnGCD) {
            return false;
        }

        this.bottleOnGCD = true;
        setTimeout(() => {
            this.bottleOnGCD = false;
        }, 150);

        const refillAndTimeout = () => {
            this.bottleInventory += 1;
            if (this.bottleInventory < 3) {
                this.bottleInventoryRefillTimeout = setTimeout(refillAndTimeout, 2000);
            } else {
                this.bottleInventoryRefillTimeout = null;
            }
        }

        this.bottleInventory -= 1;
        if (!this.bottleInventoryRefillTimeout) {
            this.bottleInventoryRefillTimeout = setTimeout(refillAndTimeout, 2000);
        }
        
        return true;
    }

    health = 5;
    healthRefillTimeout: any = null;

    removeHealth(): boolean {
        this.health -= 1;
        this.emitBlood(this.player.x, this.player.y);
        this.playHitSound();
        if (this.health <= 0) {
            this.respawnPlayer();
        }

        const refillAndTimeout = () => {
            this.health += 1;
            if (this.health < 5) {
                this.healthRefillTimeout = setTimeout(refillAndTimeout, 7000);
            } else {
                this.healthRefillTimeout = null;
            }
        }

        if (!this.healthRefillTimeout) {
            this.healthRefillTimeout = setTimeout(refillAndTimeout, 7000);
        }

        return true;
    }

    respawnPlayer(): void {
        const spawnIndex = Math.floor(Math.random() * (this.spawns.length));
        const spawn = this.spawns[spawnIndex];

        this.player.setPosition(spawn.x, spawn.y);
        this.health = 5;
    }

    private sceneConfig: SceneConfig;
    gameLogic: GameLogicPlugin | null = null;
    worldLayers: (Phaser.Tilemaps.TilemapLayer| null)[] = [];
    spawns: Phaser.Types.Tilemaps.TiledObject[] = [];


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

        this.input.keyboard?.on('keydown-E', (event: any) => {
            console.log('throwing bottle');
            this.throwBottle();
        });

        this.input.keyboard.on('keydown-Q', event => {
            console.log('using object');
        });

        if (tileset !== null) {
            const backgroundLayers = this.sceneConfig.backgroundLayers
                ? this.sceneConfig.backgroundLayers.map(layer => map.createLayer(layer, tileset, 0, 0))
                : [];

            this.worldLayers = this.sceneConfig.worldLayers
                ? this.sceneConfig.worldLayers.map(layer => map.createLayer(layer, tileset, 0, 0)) ?? []
                : [];

            this.spawns = map.getObjectLayer("Spawns")?.objects ?? [];
            this.player = new Player(this, 0, 0);
            this.respawnPlayer();

            this.bloodEmmiter = this.add.particles(400, 250, Spritesheets.Particles, {
                frame: [ 4 ],
                lifespan: 2000,
                speed: { min: 50, max: 150 },
                scale: { start: 0.5, end: 0 },
                gravityY: 150,
                blendMode: 'NORMAL',
                emitting: false,
                particleBringToTop: true,
                
            });
            this.bloodEmmiter.setPosition(this.player.x, this.player.y);
            this.gameLogic?.wsConnect('Random Name', this.player.x, this.player.y);

            this.worldLayers.forEach(layer => {
                if (layer !== null) {
                    layer.setCollisionByProperty({ collides: true });
                    this.physics.add.collider(layer, this.player);
                    this.physics.add.collider(layer, this.bottles, (bottle: Bottle) => {
                        if (bottle.despawning) {
                            return;
                        }
                        bottle.despawn();
                        bottle.explode();

                        setTimeout(() => {
                            bottle.setActive(false);
                            bottle.setVisible(false);
                        }, 3000);
                    });
                }
            });

            this.physics.add.collider(this.player, this.bottles, (player: Player, bottle: Bottle) => {
                bottle.explode();
                if (!bottle.despawning) {
                    this.removeHealth();
                }

                this.bottleCollision(bottle as Bottle);                
            });

            this.physics.add.collider(this.bottles, this.bottles, (bottle1: Bottle, bottle2: Bottle) => {
                bottle1.explode();
                bottle2.explode();

                bottle1.setActive(false);
                bottle1.setVisible(false);
                bottle2.setActive(false);
                bottle2.setVisible(false);

                this.sound.play(Sounds.GlassBottleSmash);

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

        this.createUI();
    }

    addEventListeners() {
        this.gameLogic?.event.addListener(ServerMessages.State, (data: ServerStateMessage) => {
          this.enemies.forEach(enemy => enemy.destroy());
          this.enemies = [];
          data.objects.filter(obj => obj.type === 'player' && this.gameLogic?.id != obj.id).forEach(obj => {
              const enemy = new Enemy(this, obj.x, obj.y, obj.id, 0x00ff00);
              this.physics.add.collider(enemy, this.bottles, (enemy, bottle) => {
                this.emitBlood((enemy as Enemy).x, (enemy as Enemy).y);
                this.sound.play(Sounds.HitEnemy);
                this.bottleCollision(bottle as Bottle);
              });
              this.enemies.push(enemy);
          })
        });
        this.gameLogic?.event.addListener(ServerMessages.AddPlayer, (data: ServerAddPlayerMessage) => {
            if (this.gameLogic?.id == data.id) {
                return
            }
            const enemy = new Enemy(this, data.x, data.y, data.id, 0x00ff00);
            this.physics.add.collider(enemy, this.bottles, (enemy, bottle) => {
                this.emitBlood((enemy as Enemy).x, (enemy as Enemy).y);
                this.sound.play(Sounds.HitEnemy);
                this.bottleCollision(bottle as Bottle);
            });
            this.enemies.push(enemy);
        });
        this.gameLogic?.event.addListener(ServerMessages.Move, (data: ServerPlayerMoveMessage) => {
            const enemy = this.enemies.find((enemy) => enemy.id == data.id);
            if (enemy) {
                enemy.target = new Phaser.Math.Vector2(data.x, data.y);
                enemy.changeState(data.state);
            }
        });
        this.gameLogic?.event.addListener(ServerMessages.RemovePlayer, (data: ServerAddPlayerMessage) => {
            const enemy = this.enemies.find((enemy) => enemy.id == data.id);
            this.enemies = this.enemies.filter((enemy) => enemy.id != data.id);
            enemy?.destroy();
        });
        this.gameLogic?.event.addListener(ServerMessages.SpawnObject, (data: ServerSpawnObjectMessage) => {
            switch (data.type) {
                case "bottle":
                    this.bottles.throw(data.x, data.y, data.velocityX, data.velocityY, data.playerID);
                    break
            }
        });
    }

    throwBottle() {
        if (!this.grabBottle()) {
            return;
        }

        this.gameLogic?.send({
            type: PlayerMessages.PlayerSpawnObject,
            data: {
                playerID: this.gameLogic.id!,
                type: "bottle",
                x: this.player.x,
                y: this.player.y,
                velocityX: 150 * (this.player.flipX ? -1 : 1),
                velocityY: -45,
            }
        })
    }

    bottleCollision(bottle: Bottle): void {
        bottle.setActive(false);
        bottle.setVisible(false);
    }
    
    update(time: number, delta: number): void {
        this.player?.update(time, delta);

        super.update(time, delta);

        this.bottles.preUpdate(time, delta);

        this.enemies.forEach((enemy) => {
            enemy.update();
        });

        this.updateUI();
        this.updateItems(time, delta);
    }

    bottlesStatus: Phaser.GameObjects.Text = null!;
    healthBar: StateSprite[] = [];

    createUI(): void {
        const inventoryGroup = this.add.group([]);

        const bottles = new StateSprite(this, 0, 1, Spritesheets.Bottles, 1);
        inventoryGroup.add(bottles.setScale(0.5), true)

        this.bottlesStatus = new Phaser.GameObjects.Text(this, 4, -1, '3/3', { fontSize: '16px', color: '#edebeb' });
        inventoryGroup.add(this.bottlesStatus.setScale(0.35), true)

        inventoryGroup.incX(21);
        inventoryGroup.incY(6);

        const healthGroup = this.add.group([]);
        for (let i = 0; i < 5; i++) {
            const heart = new StateSprite(this, -12 * i, 0, Spritesheets.Icons, 0).setScale(0.5);
            this.healthBar.push(heart);
            healthGroup.add(heart, true);
        }

        healthGroup.incX(235);
        healthGroup.incY(7);

        this.updateUI();
    }

    updateUI(): void {
        this.bottlesStatus?.setText(`${this.bottleInventory}/3`);
        this.healthBar.forEach((heart, index) => {
            if (index < this.health) {
                heart.visible = true
            } else {
                heart.visible = false;
            }
        });
    }

    emitBlood(x: number, y: number, count: number = 16) {
        this.bloodEmmiter?.setPosition(x, y);
        this.bloodEmmiter?.explode(count);
    }

    playHitSound() {
        const sound = Math.random() < 0.5 ? Sounds.Hit1 : Sounds.Hit2;
        this.sound.play(sound);
    }

    items: Item[] = [];
    itemRefresh = 0;
    updateItems(time: number, delta: number): void {
        this.items.forEach((item) => {
            item.update(time, delta);

            const itemBounds = item.getBounds();
            const playerBounds = this.player?.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(itemBounds, playerBounds)) {
                console.log("item collected");
                this.sound.play(Sounds.PowerUp);
                item.destroy();
                this.items = this.items.filter((i) => i != item);
            }
            
        });

        this.itemRefresh -= delta;
        if (this.itemRefresh <= 0) {
            console.log("spawn item");
            this.itemRefresh = Math.random() * 5000 + 5000;

            const item = new Item(this, 150, 100, 0)
            this.items.push(item);
            this.add.existing(item);
            // this.physics.add.existing(item);
        }
    }
}
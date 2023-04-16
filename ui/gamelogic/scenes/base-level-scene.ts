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
import { ServerPickupItemMessage } from "../models/pickup-item";
import { PowerUpOverlay } from "../objects/powerup";
import { ServerDeadMessage } from "../models/dead";
import { YouDiedOverlay } from "../objects/you_died_overlay";
import { DefaultDeserializer } from "v8";
import { ServerRespawnMessage } from "../models/server-respawn-message";


export class BaseLevelScene extends Phaser.Scene {
    player: Player;
    enemies: Enemy[] = [];
    bottles: BottleGroup;
    bloodEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    flameEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    showDead: boolean = false;

    nextGameText: Phaser.GameObjects.Text | null = null;
    nextGame: string | null = null;

    bottleInventory = 3;
    maxBottleInventory = 3;
    bottleInventoryRefillTimeout: any = null;
    clearBottleInventoryRefillTimeout() {
        if (this.bottleInventoryRefillTimeout) {
            clearTimeout(this.bottleInventoryRefillTimeout);
            this.bottleInventoryRefillTimeout = null;
        }
    }
    bottleInventoryRefillTime = 2000;
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
            if (this.bottleInventory < this.maxBottleInventory) {
                this.bottleInventoryRefillTimeout = setTimeout(refillAndTimeout, this.bottleInventoryRefillTime);
            } else {
                this.bottleInventoryRefillTimeout = null;
            }
        }

        this.bottleInventory -= 1;
        if (!this.bottleInventoryRefillTimeout && this.bottleInventory < this.maxBottleInventory) {
            this.bottleInventoryRefillTimeout = setTimeout(refillAndTimeout, this.bottleInventoryRefillTime);
        }
        
        return true;
    }

    health = 5;
    healthRefillTimeout: any = null;

    removeHealth(playerId: string): boolean {
        if (!this.player.isDead) {
            this.health -= 1;
            this.emitBlood(this.player.x, this.player.y);
            this.playHitSound();
            if (this.health <= 0) {
                this.die(playerId);
            } else {
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
            }
        }

        return true;
    }

    die(killedBy: string, time: number) {
        this.gameLogic?.send({
            type: PlayerMessages.Dead,
            data: {
                id: this.gameLogic?.id!,
                killedBy: killedBy,
            }
        });
        this.player?.characterDie();
        this.dead = true;
        setTimeout(() => this.respawnPlayer(), 5000);
    }

    respawnPlayer(): void {
        const spawnIndex = Math.floor(Math.random() * (this.spawns.length));
        const spawn = this.spawns[spawnIndex];
        this.gameLogic?.send({
            type: PlayerMessages.PlayerSpawnObject,
            data: {
                x: spawn.x ?? 0,
                y: spawn.y ?? 0,
            }
        });
        this.player.spawn(spawn.x ?? 0, spawn.y ?? 0);
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

        this.input.keyboard?.on('keydown-Q', (event: any) => {
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

            this.bloodEmitter = this.add.particles(400, 250, Spritesheets.Particles, {
                frame: [ 4 ],
                lifespan: 2000,
                speed: { min: 50, max: 150 },
                scale: { start: 0.5, end: 0 },
                gravityY: 150,
                blendMode: 'NORMAL',
                emitting: false,
                particleBringToTop: true,
                
            });
            this.bloodEmitter.setPosition(this.player.x, this.player.y);
            this.gameLogic?.wsConnect(this.player.name, this.player.x, this.player.y);

            this.flameEmitter = this.add.particles(0, 0, Spritesheets.Particles,
            {
                frame: 4,
                color: [ 0xfacc22, 0xf89800, 0xf83600, 0x9f0404 ],
                colorEase: 'quad.out',
                lifespan: 700,
                angle: { min: -100, max: -80 },
                scale: { start: 0.40, end: 0, ease: 'sine.out' },
                speed: 50,
                advance: 200,
                blendMode: 'ADD',
                emitting: false
            });

            this.worldLayers.forEach(layer => {
                if (layer !== null) {
                    layer.setCollisionByProperty({ collides: true });
                    this.physics.add.collider(layer, this.player);
                    this.physics.add.collider(layer, this.bottles, (bottle) => {
                        this.collideBottleWithWorld(bottle as Bottle);
                    });
                }
            });

            this.physics.add.collider(this.player, this.bottles, (player, bottle) => {
                this.collidePlayerWithBottle(player as Player, bottle as Bottle);
            });

            this.physics.add.collider(this.bottles, this.bottles, (bottle1, bottle2) => {
                this.collideBottleWithBottle(bottle1 as Bottle, bottle2 as Bottle);
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
          this.nextGame = data.endAt;

          this.enemies.forEach(enemy => enemy.destroy());
          this.enemies = [];
          data.objects.filter(obj => obj.type === 'player' && this.gameLogic?.id != obj.id).forEach(obj => {
              const enemy = new Enemy(this, obj.x, obj.y, obj.id, obj.color);
              this.physics.add.collider(enemy, this.bottles, (enemy, bottle) => this.collideEnemyWithBottle(enemy as Enemy, bottle as Bottle));
              this.enemies.push(enemy);
          });

          if (this.player && this.gameLogic) {
              this.player.id = this.gameLogic.id;
          }
          const playerObj = data.objects.find(obj => obj.type === 'player' && obj.id == this.player.id)
          if (playerObj) {
            this.player.setTint(playerObj.color);
          }

          data.objects.filter(obj => obj.type === "item").forEach(obj => {
            this.spawnItem(obj.id, obj.x, obj.y, obj.item);
          })
        });
        this.gameLogic?.event.addListener(ServerMessages.AddPlayer, (data: ServerAddPlayerMessage) => {
            if (this.gameLogic?.id == data.id) {
                return
            }
            const enemy = new Enemy(this, data.x, data.y, data.id, data.color);
            enemy.id = data.id;
            this.physics.add.collider(enemy, this.bottles, (enemy, bottle) => this.collideEnemyWithBottle(enemy as Enemy, bottle as Bottle));
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
                    const bottle = this.bottles.throw(data.x, data.y, data.velocityX, data.velocityY, data.playerID);
                    break
                case "item":
                    this.spawnItem(data.id, data.x, data.y, data.item);
                    break
            }
        });

        this.gameLogic?.event.addListener(ServerMessages.Dead, (data: ServerDeadMessage) => {
            const enemy = this.enemies.find((enemy: Enemy) => enemy.id === data.id);
            enemy?.characterDie();
            console.log('received dead message');
        });

        this.gameLogic?.event.addListener(ServerMessages.Respawn, (data: ServerRespawnMessage) => {
            const enemy = this.enemies.find((enemy: Enemy) => enemy.id === data.id);
            enemy?.spawn(data.x, data.y);
        });

        this.gameLogic?.event.addListener(ServerMessages.PickupItem, (data: ServerPickupItemMessage) => {
            const item = this.items.find((item) => item.id == data.id);
            if (item) {
                item.destroy();
                this.items = this.items.filter((item) => item.id != data.id);
            }

            if (data.playerID == this.gameLogic?.id) {
                this.powerupOverlay.activate(data.item, 10000);

                this.handlePowerUp(data.item, 10000);
            }
        });
    }

    spawnItem(id: string, x: number, y: number, option: number) {
        const item = new Item(id, this, x, y, option);
        this.items.push(item);
        this.add.existing(item);
    }

    collideEnemyWithBottle(enemy: Enemy, bottle: Bottle) {
        if (bottle.playerId !== enemy.id && !enemy.isDead) {
            this.emitBlood(enemy.x, enemy.y);
            this.sound.play(Sounds.HitEnemy);
            this.bottleCollision(bottle);
        }
    }

    collidePlayerWithBottle(player: Player, bottle: Bottle) {
        if (player.id !== bottle.playerId) {
            bottle.explode();
            if (!bottle.despawning) {
                this.removeHealth(bottle.playerId ?? "");
            }
            this.bottleCollision(bottle as Bottle);
        }
    }

    collideBottleWithBottle(bottle1: Bottle, bottle2: Bottle) {
        bottle1.explode();
        bottle2.explode();

        bottle1.setActive(false);
        bottle1.setVisible(false);
        bottle2.setActive(false);
        bottle2.setVisible(false);

        this.sound.play(Sounds.GlassBottleSmash);
    }

    collideBottleWithWorld(bottle: Bottle) {
        if (bottle.despawning) {
            return;
        }
        bottle.despawn();
        bottle.explode();
        this.sound.play(Sounds.GlassBottleDrop);

        setTimeout(() => {
            bottle.setActive(false);
            bottle.setVisible(false);
        }, 3000);
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
        if (this.showDead) {
            this.youDiedOverlay?.activate();
            this.showDead = false;
        }
    }

    bottlesStatus: Phaser.GameObjects.Text = null!;
    powerupOverlay: Phaser.GameObjects.Container = null!;
    youDiedOverlay: Phaser.GameObjects.Container = null!;
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

        this.powerupOverlay = new PowerUpOverlay(this, 105, 168, 0);
        this.add.existing(this.powerupOverlay);

        this.youDiedOverlay = new YouDiedOverlay(this, 0, 0, 0);
        this.add.existing(this.youDiedOverlay);

        this.nextGameText = new Phaser.GameObjects.Text(this, 10, 166, 'Game ends in: 0', { fontSize: '16px', color: '#ffffff' }).setScale(0.3);
        // this.nextGameText.depth = 100;
        this.add.existing(this.nextGameText);

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

        if (this.nextGame) {
            const time = new Date(this.nextGame).getTime() - new Date().getTime();
            this.nextGameText?.setText(`Game ends in: ${time / 1000}`);
        }
    }

    emitBlood(x: number, y: number, count: number = 16) {
        this.bloodEmitter?.setPosition(x, y);
        this.bloodEmitter?.explode(count);
    }

    playHitSound() {
        const sound = Math.random() < 0.5 ? Sounds.Hit1 : Sounds.Hit2;
        this.sound.play(sound);
    }

    items: Item[] = [];
    updateItems(time: number, delta: number): void {
        this.items.forEach((item) => {
            item.update(time, delta);

            const itemBounds = item.getBounds();
            const playerBounds = this.player?.getBounds();
            if (Phaser.Geom.Intersects.RectangleToRectangle(itemBounds, playerBounds)) {
                this.sound.play(Sounds.PowerUp);

                this.gameLogic?.send({
                    type: PlayerMessages.PickupItem,
                    data: {
                        id: item.id,
                        item: item.item,
                    },
                })
            }
        });
    }

    activePowerUp: number = -1;
    handlePowerUp(item: number, duration: number) {
        this.activePowerUp = item;
        setTimeout(() => {
            this.activePowerUp = -1;
        }, duration)

        switch (item) {
            case 0:
                this.clearBottleInventoryRefillTimeout();
                this.bottleInventory = 10;
                break;
            case 1:
                setTimeout(() => {
                    this.clearBottleInventoryRefillTimeout();
                    this.bottleInventory = 3;
                    this.bottleInventoryRefillTime = 2000;
                }, duration)

                this.clearBottleInventoryRefillTimeout();
                this.bottleInventory = 3;
                this.bottleInventoryRefillTime = 250;
                break;
        }
    }
}
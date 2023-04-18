import Phaser from "phaser";
import { GameEvents, Images, Objects, PlayerMessages, Plugins, Scenes, ServerMessages, Sounds, Tilesets } from "../enums";
import { ServerAddPlayerMessage, ServerPlayerMoveMessage, ServerStateMessage } from "../models";
import { SceneConfig } from "../models/scene-config";
import { Enemy, Player } from "../objects";
import { Bottle, BottleGroup } from "../objects/bottle";
import { Item } from "../objects/item";
import { ServerSpawnObjectMessage } from "../models/server-spawn-object";
import { StateSprite } from "../objects/ui/state_sprite";
import { ServerPickupItemMessage } from "../models/pickup-item";
import { PowerUpOverlay } from "../objects/powerup";
import { ServerDeadMessage } from "../models/dead";
import { ServerRespawnMessage } from "../models/server-respawn-message";
import { WebClientPlugin } from "../plugins";
import { BOTTLES_MAX_COUNT, PLAYER_MAX_HEALTH, PLAYER_RESPAWN_TIME } from "../constants";
import { ParticleGenerator } from "../objects/particle-generator";
import { PowerUps } from "../enums/powerups";


export class BaseLevelScene extends Phaser.Scene {
    player: Player;
    enemies: Enemy[] = [];
    bottles: BottleGroup;
    bloodEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    flameEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;

    bottleInventory = BOTTLES_MAX_COUNT;
    maxBottleInventory = BOTTLES_MAX_COUNT;
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
            this.game.events.emit(GameEvents.BottleLoaded);
            if (this.bottleInventory < this.maxBottleInventory) {
                this.bottleInventoryRefillTimeout = setTimeout(refillAndTimeout, this.bottleInventoryRefillTime);
            } else {
                this.bottleInventoryRefillTimeout = null;
            }
        }

        this.bottleInventory -= 1;
        this.game.events.emit(GameEvents.BottleThrown);
        if (!this.bottleInventoryRefillTimeout && this.bottleInventory < this.maxBottleInventory) {
            this.bottleInventoryRefillTimeout = setTimeout(refillAndTimeout, this.bottleInventoryRefillTime);
        }
        
        return true;
    }

    health = PLAYER_MAX_HEALTH;
    healthRefillTimeout: any = null;

    removeHealth(playerId: string): boolean {
        if (!this.player.isDead) {
            this.health -= 1;
            this.game.events.emit(GameEvents.PlayerHit);
            this.emitBlood(this.player.x, this.player.y);
            this.playHitSound();
            if (this.health <= 0) {
                this.die(playerId);
            } else {
                const refillAndTimeout = () => {
                    this.health = (this.health + 1) % (PLAYER_MAX_HEALTH + 1);
                    this.game.events.emit(GameEvents.PlayerHealed);
                    if (this.health < PLAYER_MAX_HEALTH) {
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

    die(killedBy: string) {
        this.webClient?.send({
            type: PlayerMessages.Dead,
            data: {
                id: this.webClient?.id!,
                killedBy: killedBy,
            }
        });
        this.player?.characterDie();
        this.game.events.emit(GameEvents.PlayerDied);
        setTimeout(() => this.respawnPlayer(), PLAYER_RESPAWN_TIME);
    }

    respawnPlayer(): void {
        const spawnIndex = Math.floor(Math.random() * (this.spawns.length));
        const spawn = this.spawns[spawnIndex];

        this.health = PLAYER_MAX_HEALTH;
        this.game.events.emit(GameEvents.PlayerRespawned);

        this.webClient?.send({
            type: PlayerMessages.Respawn,
            data: {
                x: spawn.x ?? 0,
                y: spawn.y ?? 0,
            }
        });
        this.player.spawn(spawn.x ?? 0, spawn.y ?? 0);
    }

    private sceneConfig: SceneConfig;
    webClient: WebClientPlugin | null = null;
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
        this.webClient = this.plugins.get(Plugins.WebClient) as WebClientPlugin;

        this.bottles = new BottleGroup(this);
        this.addEventListeners();

        this.input.keyboard?.on('keydown-E', (event: any) => {
            if (!this.player.isDead) {
                this.throwBottle();
            }
        });
        this.scene.launch(Scenes.GameOverlay);

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

            this.bloodEmitter = ParticleGenerator.createBlood(this);
            this.bloodEmitter.setPosition(this.player.x, this.player.y);
            this.webClient?.wsConnect(this.player.name, this.player.x, this.player.y);

            this.flameEmitter = ParticleGenerator.createFlame(this);

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
        this.game.events.emit(GameEvents.PlayerDied);

        this.createUI();
    }

    addEventListeners() {
        this.webClient?.event.addListener(ServerMessages.State, (data: ServerStateMessage) => {
          this.enemies.forEach(enemy => enemy.destroy());
          this.enemies = [];
          data.objects.filter(obj => obj.type === Objects.Player && this.webClient?.id != obj.id).forEach(obj => {
              const enemy = new Enemy(this, obj.x, obj.y, obj.id, obj.color);
              this.physics.add.collider(enemy, this.bottles, (enemy, bottle) => this.collideEnemyWithBottle(enemy as Enemy, bottle as Bottle));
              this.enemies.push(enemy);
          });

          if (this.player && this.webClient) {
              this.player.id = this.webClient.id;
          }
          const playerObj = data.objects.find(obj => obj.type === Objects.Player && obj.id == this.player.id)
          if (playerObj) {
            this.player.setTint(playerObj.color);
          }

          this.clearItems();
          data.objects.filter(obj => obj.type === Objects.Item).forEach(obj => {
            this.spawnItem(obj.id, obj.x, obj.y, obj.item);
          })

          if (data.reset) {
            this.webClient?.event.removeAllListeners();
            this.scene.stop(Scenes.GameOverlay);
            this.scene.start(Scenes.MainMenu, { serverState: data });
          }

        });
        this.webClient?.event.addListener(ServerMessages.AddPlayer, (data: ServerAddPlayerMessage) => {
            if (this.webClient?.id == data.id) {
                return
            }
            const enemy = new Enemy(this, data.x, data.y, data.id, data.color);
            enemy.id = data.id;
            this.physics.add.collider(enemy, this.bottles, (enemy, bottle) => this.collideEnemyWithBottle(enemy as Enemy, bottle as Bottle));
            this.enemies.push(enemy);
        });
        this.webClient?.event.addListener(ServerMessages.Move, (data: ServerPlayerMoveMessage) => {
            const enemy = this.enemies.find((enemy) => enemy.id == data.id);
            if (enemy) {
                enemy.target = new Phaser.Math.Vector2(data.x, data.y);
                enemy.changeState(data.state);
            }
        });
        this.webClient?.event.addListener(ServerMessages.RemovePlayer, (data: ServerAddPlayerMessage) => {
            const enemy = this.enemies.find((enemy) => enemy.id == data.id);
            this.enemies = this.enemies.filter((enemy) => enemy.id != data.id);
            enemy?.destroy();
        });
        this.webClient?.event.addListener(ServerMessages.SpawnObject, (data: ServerSpawnObjectMessage) => {
            switch (data.type) {
                case Objects.Bottle:
                    const bottle = this.bottles.throw(data.x, data.y, data.velocityX, data.velocityY, data.playerID);
                    break
                case Objects.Item:
                    this.spawnItem(data.id, data.x, data.y, data.item);
                    break
            }
        });

        this.webClient?.event.addListener(ServerMessages.Dead, (data: ServerDeadMessage) => {
            const enemy = this.enemies.find((enemy: Enemy) => enemy.id === data.id);
            enemy?.characterDie();
        });

        this.webClient?.event.addListener(ServerMessages.Respawn, (data: ServerRespawnMessage) => {
            const enemy = this.enemies.find((enemy: Enemy) => enemy.id === data.id);
            enemy?.spawn(data.x, data.y);
        });

        this.webClient?.event.addListener(ServerMessages.PickupItem, (data: ServerPickupItemMessage) => {
            const item = this.items.find((item) => item.id == data.id);
            if (item) {
                item.destroy();
                this.items = this.items.filter((item) => item.id != data.id);
            }

            if (data.playerID == this.webClient?.id) {
                this.powerupOverlay.activate(data.item, 10000);
                
                this.handlePowerUp(data.item, 10000);
            }
        });
    }

    clearItems() {
        this.items.forEach((item) => item.destroy());
        this.items = [];
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
            if (bottle.damageOnHit) {
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

        this.webClient?.send({
            type: PlayerMessages.PlayerSpawnObject,
            data: {
                playerID: this.webClient.id!,
                type: Objects.Bottle,
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

        console.log(this.health);
    }

    powerupOverlay: Phaser.GameObjects.Container = null!;

    createUI(): void {
        this.powerupOverlay = new PowerUpOverlay(this, 105, 168, 0);
        this.add.existing(this.powerupOverlay);

        this.updateUI();
    }

    updateUI(): void {
        const offsetX = this.cameras.main.worldView.x;
        this.powerupOverlay?.setX(105 + offsetX);
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
                if (this.activePowerUp != -1) {
                    return;
                }

                this.sound.play(Sounds.PowerUp);

                this.webClient?.send({
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
                setTimeout(() => {
                    this.clearBottleInventoryRefillTimeout();
                    if (this.bottleInventory > BOTTLES_MAX_COUNT) {
                        this.bottleInventory = BOTTLES_MAX_COUNT;
                    } else if (this.bottleInventory == 0) {
                        this.bottleInventory = 1;
                    }
                    this.maxBottleInventory = BOTTLES_MAX_COUNT;
                    this.game.events.emit(GameEvents.PowerUpFaded, PowerUps.AdditionalBottles);
                }, duration)
                this.clearBottleInventoryRefillTimeout();
                this.bottleInventory = 10;
                this.maxBottleInventory = 13;
                this.game.events.emit(GameEvents.PowerUpPickedUp, PowerUps.AdditionalBottles);
                break;
            case 1:
                setTimeout(() => {
                    this.clearBottleInventoryRefillTimeout();
                    this.bottleInventory = BOTTLES_MAX_COUNT;
                    this.bottleInventoryRefillTime = 2000;
                    this.game.events.emit(GameEvents.PowerUpFaded, PowerUps.FasterReload);
                }, duration)

                this.clearBottleInventoryRefillTimeout();
                this.bottleInventory = BOTTLES_MAX_COUNT;
                this.bottleInventoryRefillTime = 500;
                this.game.events.emit(GameEvents.PowerUpPickedUp, PowerUps.FasterReload);
                break;
        }
    }
}
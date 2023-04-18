import Phaser from "phaser";
import { Images, Spritesheets } from "../enums";

export abstract class ParticleGenerator {

    public static createBlood(scene: Phaser.Scene): Phaser.GameObjects.Particles.ParticleEmitter {
        return scene.add.particles(400, 250, Spritesheets.Particles, {
            frame: [ 4 ],
            lifespan: 2000,
            speed: { min: 50, max: 150 },
            scale: { start: 0.5, end: 0 },
            gravityY: 150,
            blendMode: 'NORMAL',
            emitting: false,
            particleBringToTop: true,
            
        });
    }

    public static createFlame(scene: Phaser.Scene): Phaser.GameObjects.Particles.ParticleEmitter {
        return scene.add.particles(0, 0, Spritesheets.Particles,
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
    }
    
    public static createGlassShards(scene: Phaser.Scene): Phaser.GameObjects.Particles.ParticleEmitter {
        return scene.add.particles(0, 0, Images.ParticleGlass, {
            frame: 0,
            scale: { start: 0.4, end: 0 },
            speed: { min: 0, max: 20 },
            blendMode: 'BLEND',
            emitting: false,
          });
    }
}
import { Sounds } from "../enums";

export class SoundManagerPlugin extends Phaser.Plugins.BasePlugin {
    soundOn: boolean = true;
    musicOn: boolean = true;
    bgMusicPlaying: boolean = false;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
    }

    playMusic(): void {
        if (!this.bgMusicPlaying && this.musicOn) {
            this.game.sound.play(Sounds.Theme, { loop: true, volume: 0.7 });
            this.bgMusicPlaying = true;
        }
    }

    stopMusic(): void {
        this.game.sound.get(Sounds.Theme)?.stop();
        this.bgMusicPlaying  = false;
    }
}
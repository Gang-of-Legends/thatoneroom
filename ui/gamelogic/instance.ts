import { useState } from "react";
import Phaser from "phaser";

export class GameLogic {
  game: Phaser.Game;

  constructor(game: Phaser.Game) {
    this.game = game;
  }
}

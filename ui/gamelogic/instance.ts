import { useState } from "react";
import Phaser from "phaser";
import { createConnectTransport, createGrpcWebTransport } from "@bufbuild/connect-web";
import {
  WritableIterable,
  createWritableIterable,
} from "@bufbuild/connect/protocol";
import { PartialMessage } from "@bufbuild/protobuf";

export class GameLogic {
  game: Phaser.Game;

  connected: boolean = false;

  constructor(game: Phaser.Game) {
    this.game = game;
  }

  async connect() {
  }

  addPlayer(playerId: string) {}

  movePlayer(playerId: string, x: number, y: number) {}

  moveSelf(x: number, y: number) {}
}

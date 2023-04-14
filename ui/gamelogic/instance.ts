import { ServerService } from "@/api/thatoneroom/server/v1/service_connect";
import { PromiseClient, createPromiseClient } from "@bufbuild/connect";
import { useState } from "react";
import Phaser from "phaser";
import { createConnectTransport } from "@bufbuild/connect-web";

export class GameLogic {
  client: PromiseClient<typeof ServerService>;
  game: Phaser.Game;

  constructor(game: Phaser.Game) {
    this.game = game;

    const transport = createConnectTransport({
      baseUrl: "http://51.89.7.121:80",
    });

    this.client = createPromiseClient(ServerService, transport);
  }

  Connect() {}

  AddPlayer(playerId: string) {}

  MovePlayer(playerId: string, x: number, y: number) {}

  MoveSelf(x: number, y: number) {}
}

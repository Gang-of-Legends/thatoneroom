import { ServerService } from "@/api/thatoneroom/server/v1/service_connect";
import { Request } from "@/api/thatoneroom/server/v1/service_pb";
import { PromiseClient, createPromiseClient } from "@bufbuild/connect";
import { useState } from "react";
import Phaser from "phaser";
import { createConnectTransport } from "@bufbuild/connect-web";
import { WritableIterable, createWritableIterable } from "@bufbuild/connect/protocol";
import { PartialMessage } from "@bufbuild/protobuf";

export class GameLogic {
  client: PromiseClient<typeof ServerService>;
  game: Phaser.Game;
  messageStream: WritableIterable<PartialMessage<Request>> | undefined;

  connected: boolean = false;

  constructor(game: Phaser.Game) {
    this.game = game;

    const transport = createConnectTransport({
      baseUrl: "http://51.89.7.121:80",
    });

    this.client = createPromiseClient(ServerService, transport);
  }

  async connect() {
    try {
      const res = await this.client.connect({});
      console.log(res.id);

      const iterable = createWritableIterable<PartialMessage<Request>>();
      const stream = this.client.stream(iterable)

      this.connected = true;
    } catch (e) {
      console.log(e);
    }
  }

  async sendRequest(request: Request) {
    if (this.messageStream) {
      this.messageStream.write(request);
    }
  }

  addPlayer(playerId: string) {}

  movePlayer(playerId: string, x: number, y: number) {}

  moveSelf(x: number, y: number) {}
}

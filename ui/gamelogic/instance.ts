import { useState } from "react";
import Phaser from "phaser";

export class GameLogic {
  game: Phaser.Game;

  socket: WebSocket | null = null;
  connected: boolean = false;
  authenticated: boolean = false;

  constructor(game: Phaser.Game) {
    this.game = game;
  }

  async connect() {
    const socket = new WebSocket("wss://petermalina.com");

    socket.onopen = () => {
      this.socket = socket;
      this.connected = true;

      this.send({
        type: "authenticate",
      });
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleMessage(data);
    }
  }

  handleMessage(data: any) {
    switch (data.type) {
      case "server_authenticate":
        this.handleAuthentication(data);
        break;

      case "server_add_player":
        this.handleAddPlayer(data.playerId);
        break;

      case "server_move_player":
        this.handleMovePlayer(data.playerId, data.x, data.y);
        break;
    }
  }

  send(data: any) {
    if (this.socket) {
      this.socket.send(JSON.stringify(data));
    }
  }

  handleAuthentication(data: any) {
    this.authenticated = true;
  }

  handleAddPlayer(playerId: string) {}

  handleMovePlayer(playerId: string, x: number, y: number) {}
}

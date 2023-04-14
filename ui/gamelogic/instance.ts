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
      case "authentication":
        this.handleAuthentication(data);
        break;

      case "addPlayer":
        this.addPlayer(data.playerId);
        break;

      case "movePlayer":
        this.movePlayer(data.playerId, data.x, data.y);
        break;
        
      case "moveSelf":
        this.moveSelf(data.x, data.y);
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

  addPlayer(playerId: string) {}

  movePlayer(playerId: string, x: number, y: number) {}

  moveSelf(x: number, y: number) {}
}

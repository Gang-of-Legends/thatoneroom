import Phaser from "phaser";
import { ServerAddPlayerMessage, ServerAuthenticateMessage, ServerPlayerMoveMessage } from "../models";
import { ServerMessage } from "../models/server-message";

export class GameLogicPlugin extends Phaser.Plugins.BasePlugin {

    socket: WebSocket | null = null;
    connected: boolean = false;
    authenticated: boolean = false;
    id: string | null = null;
    players: string[] = [];

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
    }

    init() {
        console.log('Plugin is alive');
    }

    async connect() {
        const socket = new WebSocket("ws://petermalina.com/ws");
    
        socket.onopen = () => {
          this.socket = socket;
          this.connected = true;
    
          this.send({
            type: "player_authenticate",
            data: null
          });
        }
    
        socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        }
      }
    
      handleMessage(data: ServerMessage) {
        switch (data.type) {
          case "server_authenticate":
            this.handleAuthentication(data.data as ServerAuthenticateMessage);
            break;
    
          case "server_add_player":
            this.handleAddPlayer((data.data as ServerAddPlayerMessage).id);
            this
            break;
    
          case "server_move_player":
            const msg = data.data as ServerPlayerMoveMessage;
            this.handleMovePlayer(msg.id, msg.x, msg.y);
            break;
        }
      }
    
      send(data: ServerMessage) {
        if (this.socket) {
          this.socket.send(JSON.stringify(data));
        }
      }

      sendPosition(x: number, y: number) {
          if (this.socket) {
                this.socket.send(JSON.stringify({
                    type: "player_move",
                    data: {
                        x: x,
                        y: y
                    }
                }));
          }
      }
    
      handleAuthentication(data: ServerAuthenticateMessage) {
        this.authenticated = true;
        this.id = data.id;
        console.log(data.id);
      }
    
      handleAddPlayer(playerId: string) {
          this.players.push(playerId);
      }
    
      handleMovePlayer(playerId: string, x: number, y: number) {}

      update() {
        console.log(this.players);
      }
}
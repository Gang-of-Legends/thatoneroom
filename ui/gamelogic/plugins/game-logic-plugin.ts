import Phaser from "phaser";
import { PlayerMessages, ServerMessages, PlayerStates } from "../enums";
import {
    ServerAddPlayerMessage,
    ServerAuthenticateMessage,
    ServerPlayerMoveMessage,
    ServerStateMessage
} from "../models";
import { ServerMessage } from "../models/server-message";

export class GameLogicPlugin extends Phaser.Plugins.BasePlugin {

    socket: WebSocket | null = null;
    connected: boolean = false;
    authenticated: boolean = false;
    id: string | null = null;
    playerName: string | null = null;
    players: string[] = [];
    event: Phaser.Events.EventEmitter;

    constructor(pluginManager: Phaser.Plugins.PluginManager) {
        super(pluginManager);
        this.event = new Phaser.Events.EventEmitter();
    }

    async connect() {
        const socket = new WebSocket("wss://petermalina.com/ws");
    
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
        this.event.emit(data.type, data.data);
        switch (data.type) {
          case ServerMessages.Authenticate:
            this.handleAuthentication(data.data as ServerAuthenticateMessage);
            break;
    
          case ServerMessages.AddPlayer:
            this.handleAddPlayer((data.data as ServerAddPlayerMessage).id);
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

      sendPosition(x: number, y: number, state: PlayerStates) {
          if (this.socket) {
                this.socket.send(JSON.stringify({
                    type: PlayerMessages.Move,
                    data: {
                        x: x,
                        y: y,
                        state: state
                    }
                }));
          }
      }

      auth() {
          this.send({
              type: PlayerMessages.Authenticate,
              data: null,
          });
      }

    wsConnect(name: string, x: number, y: number) {
        this.send({
            type: PlayerMessages.Connect,
            data: {
                name: name,
                x: x,
                y: y
            }
        });
    }


    handleAuthentication(data: ServerAuthenticateMessage) {
      this.authenticated = true;
      this.id = data.id;
      this.playerName = data.name;
    }
  
      handleAddPlayer(playerId: string) { }
    
      handleMovePlayer(playerId: string, x: number, y: number) {}
}
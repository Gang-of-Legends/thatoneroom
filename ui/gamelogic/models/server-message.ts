import {
    PlayerMoveMessage,
    ServerAddPlayerMessage,
    ServerAuthenticateMessage,
    ServerStateMessage,
    ServerPlayerMoveMessage,
    ServerConnectMessage
} from ".";
import { PlayerSpawnObjectMessage, ServerSpawnObjectMessage } from "./server-spawn-object";

export interface ServerMessage {
    type: string;
    data : ServerAuthenticateMessage | ServerConnectMessage | ServerAddPlayerMessage | PlayerMoveMessage  | ServerStateMessage | ServerPlayerMoveMessage | PlayerSpawnObjectMessage | null;
}

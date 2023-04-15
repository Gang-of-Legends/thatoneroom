import {
    PlayerMoveMessage,
    ServerAddPlayerMessage,
    ServerAuthenticateMessage,
    ServerStateMessage,
    ServerPlayerMoveMessage,
    ServerConnectMessage
} from ".";
import { PlayerPickupItemMessage, ServerPickupItemMessage } from "./pickup-item";
import { PlayerSpawnObjectMessage, ServerSpawnObjectMessage } from "./server-spawn-object";

export interface ServerMessage {
    type: string;
    data : ServerAuthenticateMessage | ServerConnectMessage | ServerAddPlayerMessage | PlayerMoveMessage  | ServerStateMessage | ServerPlayerMoveMessage | ServerSpawnObjectMessage | PlayerSpawnObjectMessage | PlayerPickupItemMessage | ServerPickupItemMessage | null;
}

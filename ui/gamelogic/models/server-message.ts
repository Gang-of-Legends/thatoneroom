import {
    PlayerMoveMessage,
    ServerAddPlayerMessage,
    ServerAuthenticateMessage,
    ServerStateMessage,
    ServerPlayerMoveMessage,
    ServerConnectMessage
} from ".";
import { PlayerDeadMessage, ServerDeadMessage } from "./dead";
import { PlayerPickupItemMessage, ServerPickupItemMessage } from "./pickup-item";
import { PlayerAuthenticateMessage } from "./server-authenticate-message";
import { PlayerSpawnObjectMessage, ServerSpawnObjectMessage } from "./server-spawn-object";

export interface ServerMessage {
    type: string;
    data : ServerAuthenticateMessage | PlayerAuthenticateMessage | ServerConnectMessage | ServerAddPlayerMessage | PlayerMoveMessage
        | ServerStateMessage | ServerPlayerMoveMessage | ServerSpawnObjectMessage | PlayerSpawnObjectMessage
        | PlayerPickupItemMessage | ServerPickupItemMessage
        | ServerDeadMessage | PlayerDeadMessage | null;
}

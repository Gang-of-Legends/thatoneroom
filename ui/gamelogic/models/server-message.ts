import { PlayerMoveMessage, ServerAddPlayerMessage, ServerAuthenticateMessage, ServerStateMessage, ServerPlayerMoveMessage } from ".";
import { PlayerSpawnObjectMessage, ServerSpawnObjectMessage } from "./server-spawn-object";

export interface ServerMessage {
    type: string;
    data : ServerAuthenticateMessage | ServerAddPlayerMessage | PlayerMoveMessage  | ServerStateMessage | ServerPlayerMoveMessage | PlayerSpawnObjectMessage | null;
}

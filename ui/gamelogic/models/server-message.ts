import { PlayerMoveMessage, ServerAddPlayerMessage, ServerAuthenticateMessage, ServerStateMessage, ServerPlayerMoveMessage } from ".";

export interface ServerMessage {
    type: string;
    data : ServerAuthenticateMessage | ServerAddPlayerMessage | PlayerMoveMessage  | ServerStateMessage | ServerPlayerMoveMessage | null;
}

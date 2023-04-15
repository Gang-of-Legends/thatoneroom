export interface ServerMessage {
    type: string;
    data : ServerAuthenticateMessage | PlayerMoveMessage | ServerAuthenticateMessage | null;
}

interface ServerAuthenticateMessage {
    id: string;
    token: string;
    success: boolean;
}

interface PlayerMoveMessage {
    x: number,
    y: number,
}

interface ServerStateMessage {
    objects: Object[] 
}

interface Object {
    id: string,
    type: string,
    x: number,
    y: number
}

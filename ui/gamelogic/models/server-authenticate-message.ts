export interface ServerAuthenticateMessage {
    id: string;
    token: string;
    success: boolean;
    name: string;
}

export interface PlayerAuthenticateMessage {
    token: string;
}
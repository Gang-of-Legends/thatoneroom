export interface ServerAuthenticateMessage {
    id: string;
    token: string;
    success: boolean;
    name: string;
}

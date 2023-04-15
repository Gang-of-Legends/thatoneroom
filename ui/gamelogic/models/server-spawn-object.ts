export interface ServerSpawnObjectMessage {
    playerID: string;
    x: number;
    y: number;
    type: string;
    velocityX: number;
    velocityY: number;
}

export interface PlayerSpawnObjectMessage {
    playerID: string;
    x: number;
    y: number;
    type: string;
    velocityX: number;
    velocityY: number;
}
export interface ServerSpawnObjectMessage {
    id: string;
    playerID: string;
    x: number;
    y: number;
    type: string;
    velocityX: number;
    velocityY: number;
    option: number;
}

export interface PlayerSpawnObjectMessage {
    id: string;
    playerID: string;
    x: number;
    y: number;
    type: string;
    velocityX: number;
    velocityY: number;
    option: number;
}
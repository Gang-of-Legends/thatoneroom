
export interface ServerDeadMessage {
    id: string;
}

export interface PlayerDeadMessage {
    id: string;
    killedBy: string;
}

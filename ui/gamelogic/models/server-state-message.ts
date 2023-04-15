import { ServerObject } from "./server-object";

export interface ServerStateMessage {
    objects: ServerObject[]
    leaderboard: PlayerScore[]
    endAt: string
}

export interface PlayerScore {
    id: string
    name: string
    score: number
}
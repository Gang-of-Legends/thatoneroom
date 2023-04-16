import { ServerObject } from "./server-object";

export interface ServerStateMessage {
    objects: ServerObject[]
    leaderboard: PlayerScore[]
    endAt: string
    reset: boolean
}

export interface PlayerScore {
    id: string
    name: string
    score: number
}
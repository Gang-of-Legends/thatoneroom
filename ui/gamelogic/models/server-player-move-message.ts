import { PlayerStates } from "../enums";

export interface ServerPlayerMoveMessage {
    id: string,
    x: number,
    y: number,
    state: PlayerStates
}

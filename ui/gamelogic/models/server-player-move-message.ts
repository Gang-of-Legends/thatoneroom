import { Movements } from "../enums";

export interface ServerPlayerMoveMessage {
    id: string,
    x: number,
    y: number,
    movement: Movements
}

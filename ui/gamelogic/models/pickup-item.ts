// type ServerPickupItem struct {
// 	PlayerID string `json:"playerID"`
// 	Type     string `json:"type"`
// }

export interface ServerPickupItemMessage {
    playerID: string;
    id: string;
    item: number;
}

export interface PlayerPickupItemMessage {
    id: string;
    item: number;
}
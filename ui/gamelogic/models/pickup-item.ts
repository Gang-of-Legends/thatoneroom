// type ServerPickupItem struct {
// 	PlayerID string `json:"playerID"`
// 	Type     string `json:"type"`
// }

export interface ServerPickupItemMessage {
    playerID: string;
    id: string;    
}

export interface PlayerPickupItemMessage {
    id: string;
}
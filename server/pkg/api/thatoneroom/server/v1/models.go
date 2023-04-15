package serverv1

import (
	"encoding/json"
	"time"
)

type Message struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

const (
	TypePlayerAuthenticate = "player_authenticate"
	TypePlayerConnect      = "player_connect"
	TypePlayerMove         = "player_move"
	TypePlayerSpawnObject  = "player_spawn_object"
	TypePlayerPickupItem   = "player_pickup_item"
	TypePlayerDead         = "player_dead"
)

type ServerSpawnObject struct {
	ID string `json:"id"`
	PlayerSpawnObject
}

type PlayerSpawnObject struct {
	PlayerID  string  `json:"playerID"`
	ID        string  `json:"id"`
	Type      string  `json:"type"`
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	VelocityX float64 `json:"velocityX"`
	VelocityY float64 `json:"velocityY"`
	Item      int     `json:"item"`
}

type PlayerDead struct {
	KilledBy string `json:"killedBy"`
}

type PlayerAuthenticate struct {
	ID    string `json:"id"`
	Token string `json:"token"`
	// TODO remove
	X float64 `json:"x"`
	Y float64 `json:"y"`
}

type PlayerConnect struct {
	Name string  `json:"name"`
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
}

type ServerAuthenticate struct {
	Success bool   `json:"success"`
	Token   string `json:"token"`
	ID      string `json:"id"`
}

type PlayerPickupItem struct {
	Type string `json:"type"`
	ID   string `json:"id"`
}

func NewServerSpawnObject(object ServerSpawnObject) Message {
	data, _ := json.Marshal(object)
	return Message{
		Type: "server_spawn_object",
		Data: data,
	}
}
func NewServerAuthenticate(success bool, token string, id string) Message {
	data, _ := json.Marshal(ServerAuthenticate{
		Success: success,
		Token:   token,
		ID:      id,
	})
	return Message{
		Type: "server_authenticate",
		Data: data,
	}
}

type ServerAddPlayer struct {
	ID string  `json:"id"`
	X  float64 `json:"x"`
	Y  float64 `json:"y"`
}

func NewServerAddPlayer(msg ServerAddPlayer) Message {
	data, _ := json.Marshal(msg)
	return Message{
		Type: "server_add_player",
		Data: data,
	}
}

type PlayerMove struct {
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
	State string  `json:"state"`
}

// ServerMove is only sent for other players, or when server wants to move any player
type ServerMove struct {
	ID    string  `json:"id"`
	X     float64 `json:"x"`
	Y     float64 `json:"y"`
	State string  `json:"state"`
}

func NewServerMove(id string, x float64, y float64, state string) Message {
	data, _ := json.Marshal(ServerMove{
		ID:    id,
		X:     x,
		Y:     y,
		State: state,
	})
	return Message{
		Type: "server_move",
		Data: data,
	}
}

type Object struct {
	ID        string  `json:"id"`
	Type      string  `json:"type"`
	X         float64 `json:"x"`
	Y         float64 `json:"y"`
	Inventory []Item  `json:"inventory"`
}

type Item struct {
	Type  string `json:"type"`
	Count int    `json:"count"`
}
type ServerState struct {
	EndAt       time.Time     `json:"endAt"`
	Leaderboard []PlayerScore `json:"leaderboard"`
	Objects     []Object      `json:"objects"`
}

type PlayerScore struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Score int    `json:"score"`
}

func NewServerState(state ServerState) Message {
	data, _ := json.Marshal(state)
	return Message{
		Type: "server_state",
		Data: data,
	}
}

type ServerRemovePlayer struct {
	ID string `json:"id"`
}

func NewServerRemovePlayer(id string) Message {
	data, _ := json.Marshal(ServerRemovePlayer{
		ID: id,
	})
	return Message{
		Type: "server_remove_player",
		Data: data,
	}
}

type ServerPlayerDead struct {
	ID string `json:"id"`
}

func NewServerPlayerDead(id string) Message {
	data, _ := json.Marshal(ServerPlayerDead{
		ID: id,
	})
	return Message{
		Type: "server_player_dead",
		Data: data,
	}
}

type ServerPickupItem struct {
	PlayerID string `json:"playerID"`
	ID       string `json:"id"`
	Type     string `json:"type"`
	Item     int    `json:"item"`
}

func NewServerPickupItem(playerID string, itemID string, itemType string, item int) Message {
	data, _ := json.Marshal(ServerPickupItem{
		PlayerID: playerID,
		ID:       itemID,
		Type:     itemType,
		Item:     item,
	})
	return Message{
		Type: "server_pickup_item",
		Data: data,
	}
}

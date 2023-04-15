package serverv1

import "encoding/json"

type Message struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

const (
	TypePlayerAuthenticate = "player_authenticate"
	TypePlayerMove         = "player_move"
)

type PlayerAuthenticate struct {
	ID    string `json:"id"`
	Token string `json:"token"`
}

type ServerAuthenticate struct {
	Success bool   `json:"success"`
	Token   string `json:"token"`
	ID      string `json:"id"`
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
	ID string `json:"id"`
}

func NewServerAddPlayer(id string) Message {
	data, _ := json.Marshal(ServerAddPlayer{
		ID: id,
	})
	return Message{
		Type: "server_add_player",
		Data: data,
	}
}

type PlayerMove struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// ServerMove is only sent for other players, or when server wants to move any player
type ServerMove struct {
	ID string `json:"id"`
	X  int    `json:"x"`
	Y  int    `json:"y"`
}

func NewServerMove(id string, x int, y int) Message {
	data, _ := json.Marshal(ServerMove{
		ID: id,
		X:  x,
		Y:  y,
	})
	return Message{
		Type: "server_move",
		Data: data,
	}
}

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
	ID   string  `json:"id"`
	Type string  `json:"type"`
	X    float64 `json:"x"`
	Y    float64 `json:"y"`
}
type ServerState struct {
	Objects []Object `json:"objects"`
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

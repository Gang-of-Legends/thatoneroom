package serverv1

import "encoding/json"

type Message[T any] struct {
	Type string `json:"type"`
	Data T      `json:"data"`
}

type PlayerAuthenticate struct {
	Token string `json:"token"`
}

func NewPlayerAuthenticate(token string) Message[PlayerAuthenticate] {
	return Message[PlayerAuthenticate]{
		Type: "player_authenticate",
		Data: PlayerAuthenticate{
			Token: token,
		},
	}
}

type ServerAuthenticate struct {
	Success bool   `json:"success"`
	Token   string `json:"token"`
	ID      string `json:"id"`
}

func NewServerAuthenticate(success bool, token string, id string) Message[ServerAuthenticate] {
	return Message[ServerAuthenticate]{
		Type: "server_authenticate",
		Data: ServerAuthenticate{
			Success: success,
			Token:   token,
			ID:      id,
		},
	}
}

type ServerAddPlayer struct {
	ID string `json:"id"`
}

func NewServerAddPlayer(id string) Message[ServerAddPlayer] {
	return Message[ServerAddPlayer]{
		Type: "server_add_player",
		Data: ServerAddPlayer{
			ID: id,
		},
	}
}

type PlayerMove struct {
	X int `json:"x"`
	Y int `json:"y"`
}

func NewPlayerMove(x int, y int) Message[PlayerMove] {
	return Message[PlayerMove]{
		Type: "player_move",
		Data: PlayerMove{
			X: x,
			Y: y,
		},
	}
}

// ServerMove is only sent for other players, or when server wants to move any player
type ServerMove struct {
	ID string `json:"id"`
	X  int    `json:"x"`
	Y  int    `json:"y"`
}

func NewServerMove(id string, x int, y int) Message[ServerMove] {
	return Message[ServerMove]{
		Type: "server_move",
		Data: ServerMove{
			ID: id,
			X:  x,
			Y:  y,
		},
	}
}

type MessageHandler interface {
	HandleAuthenticate(data Message[PlayerAuthenticate])
	HandleMove(data Message[PlayerMove])
}

func handleMessage(bb []byte, handler MessageHandler) error {
	var msg Message[any]
	err := json.Unmarshal(bb, &msg)
	if err != nil {
		return err
	}

	switch msg.Type {
	case "player_authenticate":
		var data Message[PlayerAuthenticate]
		_ = json.Unmarshal(bb, &data)
		handler.HandleAuthenticate(data)

	case "player_move":
		var data Message[PlayerMove]
		_ = json.Unmarshal(bb, &data)
		handler.HandleMove(data)
	}

	return nil
}

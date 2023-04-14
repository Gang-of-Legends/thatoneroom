package serverv1

type Message[T any] struct {
	Type string `json:"type"`
	Data T      `json:"data"`
}

type AuthenticationRequest struct {
	Token string `json:"token"`
}

func NewAuthenticationRequest(token string) Message[AuthenticationRequest] {
	return Message[AuthenticationRequest]{
		Type: "authentication_request",
		Data: AuthenticationRequest{
			Token: token,
		},
	}
}

type AuthenticationResponse struct {
	Success bool   `json:"success"`
	Token   string `json:"token"`
	ID      string `json:"id"`
}

func NewAuthenticationResponse(success bool, token string, id string) Message[AuthenticationResponse] {
	return Message[AuthenticationResponse]{
		Type: "authentication_response",
		Data: AuthenticationResponse{
			Success: success,
			Token:   token,
			ID:      id,
		},
	}
}

type PlayerMove struct {
	X int `json:"x"`
	Y int `json:"y"`
}

func NewPlayerMove(x int, y int) Message[PlayerMove] {
	return Message[PlayerMove]{
		Type: "player_move_request",
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
		Type: "server_move_player",
		Data: ServerMove{
			ID: id,
			X:  x,
			Y:  y,
		},
	}
}

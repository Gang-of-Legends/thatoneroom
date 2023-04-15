package server

type Action interface {
	Perform(game *Game)
}

type AddPlayerAction struct {
	ID   string
	X, Y float64
}

func (a *AddPlayerAction) Perform(game *Game) {
	at := Coords{
		X: a.X,
		Y: a.Y,
	}

	object := &Object{
		ID:     a.ID,
		Type:   ObjectPlayer,
		Coords: at,
	}

	game.AddObject(object)

	game.sendChange(NewPlayerChange{
		Object: object,
	})
}

type MoveAction struct {
	ID    string
	To    Coords
	State string
}

func (a *MoveAction) Perform(game *Game) {
	object := game.GetObject(a.ID)
	if object.Coords == a.To && object.State == a.State {
		return
	}
	object.Coords = a.To
	object.State = a.State
	game.sendChange(MoveChange{
		Object: object,
	})
}

type RemovePlayerAction struct {
	ID string
}

func (a *RemovePlayerAction) Perform(game *Game) {
	game.RemoveObject(a.ID)
	game.sendChange(RemovePlayerChange{
		ID: a.ID,
	})
}

type SpawnObjectAction struct {
	ID               string
	Type             string
	X, Y, VelX, VelY float64
}

func (a *SpawnObjectAction) Perform(game *Game) {
	game.sendChange(SpawnObjectChange{
		ID:   a.ID,
		Type: a.Type,
		X:    a.X,
		Y:    a.Y,
		VelX: a.VelX,
		VelY: a.VelY,
	})
}

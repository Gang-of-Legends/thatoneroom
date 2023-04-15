package server

import (
	"go.uber.org/zap"
)

type Action interface {
	Perform(game *Game)
}

type AddPlayerAction struct {
	ID string
}

func (a *AddPlayerAction) Perform(game *Game) {
	var at *Coords
	at = &Coords{
		X: 1,
		Y: 1,
	}
	if at == nil {
		zap.L().Warn("no spawn point")
		return
	}

	object := &Object{
		ID:     a.ID,
		Type:   ObjectPlayer,
		Coords: *at,
	}

	game.AddObject(object)

	game.sendChange(NewPlayerChange{
		Object: object,
	})
}

type MoveAction struct {
	ID string
	To Coords
}

func (a *MoveAction) Perform(game *Game) {
	object := game.GetObject(a.ID)
	if object.Coords == a.To {
		return
	}
	object.Coords = a.To
	game.sendChange(MoveChange{
		Object: object,
	})
}

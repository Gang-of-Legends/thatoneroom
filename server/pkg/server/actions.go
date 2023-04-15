package server

import (
	"github.com/solarlune/resolv"
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
	for _, sp := range game.SpawnPoints {
		cell := game.space.Cell(sp.X, sp.Y)
		if cell == nil || !cell.Occupied() {
			at = &Coords{
				X: sp.X,
				Y: sp.Y,
			}
			break
		}
	}
	if at == nil {
		zap.L().Warn("no spawn point")
	}

	object := &Object{
		ID:     a.ID,
		Type:   ObjectPlayer,
		Coords: *at,
		r:      resolv.NewObject(float64(at.X), float64(at.Y), 1, 1, ObjectPlayer),
	}

	game.space.Add(object.r)
	game.Objects[a.ID] = object

	game.sendChange(NewPlayerChange{
		Object: object,
	})
}

type MoveAction struct {
	ID string
	To Coords
}

func (a *MoveAction) Perform(game *Game) {
	object := game.Objects[a.ID]
	diff := a.To.Sub(object.Coords)
	collision := object.r.Check(float64(diff.X), float64(diff.Y))

	if collision != nil {
		vec := collision.ContactWithObject(collision.Objects[0])
		a.To.X = object.Coords.X + int(vec.X())
		a.To.Y = object.Coords.Y + int(vec.Y())
	}
	if object.Coords != a.To {
		return
	}
	object.Coords = a.To
	object.Update()
	game.sendChange(MoveChange{
		Object: object,
	})
}

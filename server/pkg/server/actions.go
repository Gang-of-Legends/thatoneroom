package server

import (
	"time"
)

type Action interface {
	Perform(game *Game)
}

type AddPlayerAction struct {
	ID   string
	Name string
	X, Y float64
}

func (a *AddPlayerAction) Perform(game *Game) {
	at := Coords{
		X: a.X,
		Y: a.Y,
	}

	object := &Object{
		ID:     a.ID,
		Name:   a.Name,
		Type:   ObjectPlayer,
		Coords: at,
	}

	game.SetObject(object)

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
	PlayerID         string
	Type             string
	X, Y, VelX, VelY float64
}

func (a *SpawnObjectAction) Perform(game *Game) {
	game.sendChange(SpawnObjectChange{
		ID:       a.ID,
		PlayerID: a.PlayerID,
		Type:     a.Type,
		X:        a.X,
		Y:        a.Y,
		VelX:     a.VelX,
		VelY:     a.VelY,
	})
}

type PickupItemAction struct {
	PlayerID string
	Type     string
}

func (a *PickupItemAction) Perform(game *Game) {
	obj := game.GetObject(a.PlayerID)
	found := false
	for _, item := range obj.Inventory {
		if item.Type == a.Type {
			item.Count++
			found = true
			break
		}
	}
	if !found {
		obj.Inventory = append(obj.Inventory, &Item{
			Type:  a.Type,
			Count: 1,
		})
	}

	game.SetObject(obj)

	game.sendChange(PickupItemChange{
		PlayerID: a.PlayerID,
		Type:     a.Type,
	})
}

type PlayerDeadAction struct {
	PlayerID string
	KilledBy string
}

func (a *PlayerDeadAction) Perform(game *Game) {
	obj := game.GetObject(a.PlayerID)
	invs := obj.Inventory
	obj.Inventory = nil
	game.SetObject(obj)

	killer := game.GetObject(a.KilledBy)
	if killer != nil {
		killer.Score++
		game.SetObject(killer)
	}

	game.sendChange(PlayerDeadChange{
		PlayerID: a.PlayerID,
		KilledBy: a.KilledBy,
	})

	for _, item := range invs {
		game.ActionChannel <- &SpawnObjectAction{
			ID:   id(),
			Type: item.Type,
			X:    obj.Coords.X,
			Y:    obj.Coords.Y,
		}
	}

}

type ResetAction struct {
}

func (a *ResetAction) Perform(game *Game) {
	game.mx.Lock()
	game.startAt = time.Now()
	game.objects = nil
	game.mx.Unlock()

	game.ChangeChannel <- ResetChange{
		Deadline: roundDuration,
	}
}

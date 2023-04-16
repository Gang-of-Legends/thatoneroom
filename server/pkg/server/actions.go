package server

import (
	"time"
)

type Action interface {
	Perform(game *Game)
}

type AuthPlayerAction struct {
	ID   string
	Name string
}

func (a *AuthPlayerAction) Perform(game *Game) {

}

type AddPlayerAction struct {
	ID    string
	Name  string
	X, Y  float64
	Color int
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
		Color:  a.Color,
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
	if object == nil {
		return
	}
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
	Item             int
}

func (a *SpawnObjectAction) Perform(game *Game) {
	if a.Type != "bottle" {
		object := &Object{
			ID:      a.ID,
			Type:    a.Type,
			Coords:  Coords{a.X, a.Y},
			Item:    a.Item,
			Creator: a.PlayerID,
		}
		game.SetObject(object)
	}
	game.sendChange(SpawnObjectChange{
		ID:       a.ID,
		PlayerID: a.PlayerID,
		Type:     a.Type,
		X:        a.X,
		Y:        a.Y,
		VelX:     a.VelX,
		VelY:     a.VelY,
		Item:     a.Item,
	})
}

type PickupItemAction struct {
	PlayerID string
	ItemID   string
	Type     string
	Item     int
}

func (a *PickupItemAction) Perform(game *Game) {
	obj := game.GetObject(a.PlayerID)
	if obj == nil {
		return
	}
	objItem := game.GetObject(a.ItemID)
	if objItem == nil {
		return
	}
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
	game.RemoveObject(a.ItemID)
	game.sendChange(PickupItemChange{
		PlayerID: a.PlayerID,
		ItemID:   a.ItemID,
		Type:     a.Type,
		Item:     a.Item,
	})
}

type PlayerDeadAction struct {
	PlayerID string
	KilledBy string
}

func (a *PlayerDeadAction) Perform(game *Game) {
	obj := game.GetObject(a.PlayerID)
	if obj == nil {
		return
	}
	//invs := obj.Inventory
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

	//for _, item := range invs {
	//	game.ActionChannel <- &SpawnObjectAction{
	//		ID:   id(),
	//		Type: item.Type,
	//		X:    obj.Coords.X,
	//		Y:    obj.Coords.Y,
	//	}
	//}

}

type ResetAction struct {
}

func (a *ResetAction) Perform(game *Game) {
	game.mx.Lock()
	game.startAt = time.Now()
	game.objects = make(map[string]*Object)
	game.mx.Unlock()

	game.ChangeChannel <- ResetChange{
		Deadline: roundDuration,
	}
}

package server

type Action interface {
	Perform(game *Game)
}

type AddPlayerAction struct {
	ID string
}

func (a *AddPlayerAction) Perform(game *Game) {
	// @TODO lock
	entity := &Entity{
		ID: a.ID,
	}
	game.Entities[a.ID] = entity

	game.sendChange(NewPlayerChange{
		Entity: entity,
	})
}

type MoveAction struct {
	ID string
	To Coords
}

func (a *MoveAction) Perform(game *Game) {
	// @TODO lock
	entity := game.Entities[a.ID]

	entity.Coords = a.To
	game.sendChange(MoveChange{
		Entity: entity,
	})
}

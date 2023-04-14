package server

// Direction is used to represent Direction constants.
type Direction int

// Contains direction constants - DirectionStop will take no effect.
const (
	DirectionUp Direction = iota
	DirectionDown
	DirectionLeft
	DirectionRight
	DirectionStop
)

type Action interface {
	Perform(game *Game)
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

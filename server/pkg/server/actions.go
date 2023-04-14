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
	ID        string
	Direction Direction
}

func (a *MoveAction) Perform(game *Game) {
	// @TODO lock
	entity := game.Entities[a.ID]

	// Move the entity.
	switch a.Direction {
	case DirectionUp:
		entity.Coords.Y--
	case DirectionDown:
		entity.Coords.Y++
	case DirectionLeft:
		entity.Coords.X--
	case DirectionRight:
		entity.Coords.X++
	}
}

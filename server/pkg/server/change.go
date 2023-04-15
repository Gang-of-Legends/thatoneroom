package server

import "time"

type Change any

type NewPlayerChange struct {
	Object *Object
}

type RemovePlayerChange struct {
	ID string
}

type MoveChange struct {
	Object *Object
}

type SpawnObjectChange struct {
	ID               string
	PlayerID         string
	Type             string
	X, Y, VelX, VelY float64
}

type PickupItemChange struct {
	PlayerID string
	Type     string
}

type PlayerDeadChange struct {
	PlayerID string
}

type ResetChange struct {
	Deadline time.Duration
}

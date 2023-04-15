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
	Item             int
}

type PickupItemChange struct {
	PlayerID string
	ItemID   string
	Type     string
	Item     int
}

type PlayerDeadChange struct {
	PlayerID string
	KilledBy string
}

type ResetChange struct {
	Deadline time.Duration
}

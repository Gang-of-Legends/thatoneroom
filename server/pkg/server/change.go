package server

type Change any

type NewPlayerChange struct {
	Entity *Entity
}

type MoveChange struct {
	Entity *Entity
}

package server

type Change any

type NewPlayerChange struct {
	Object *Object
}

type MoveChange struct {
	Object *Object
}

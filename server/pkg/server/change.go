package server

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

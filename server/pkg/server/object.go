package server

type Object struct {
	ID     string
	Type   string
	Coords Coords
	State  string
}

const (
	ObjectPlayer     = "player"
	ObjectWall       = "wall"
	ObjectSpawnPoint = "spawn_point"
)

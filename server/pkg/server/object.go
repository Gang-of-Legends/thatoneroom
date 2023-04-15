package server

type Object struct {
	ID     string
	Type   string
	Coords Coords
}

const (
	ObjectPlayer     = "player"
	ObjectWall       = "wall"
	ObjectSpawnPoint = "spawn_point"
)

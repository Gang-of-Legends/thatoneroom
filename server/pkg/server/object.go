package server

type Object struct {
	ID        string
	Type      string
	Coords    Coords
	State     string
	Score     int
	Inventory []*Item
}

type Item struct {
	Type  string
	Count int
}

const (
	ObjectPlayer     = "player"
	ObjectWall       = "wall"
	ObjectSpawnPoint = "spawn_point"
)

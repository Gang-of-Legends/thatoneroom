package server

import "github.com/solarlune/resolv"

type Object struct {
	ID     string
	Type   string
	Coords Coords
	r      *resolv.Object
}

func (o *Object) Update() {
	o.r.X = float64(o.Coords.X)
	o.r.Y = float64(o.Coords.Y)
	o.r.Update()
}

const (
	ObjectPlayer     = "player"
	ObjectWall       = "wall"
	ObjectSpawnPoint = "spawn_point"
)

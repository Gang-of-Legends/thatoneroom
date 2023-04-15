package server

import (
	"github.com/gofrs/uuid"
	"github.com/solarlune/resolv"
	"go.uber.org/zap"
	"sync"
)

type Coords struct {
	X, Y int
}

func (c Coords) Sub(o Coords) Coords {
	return Coords{
		X: c.X - o.X,
		Y: c.Y - o.Y,
	}
}

type Game struct {
	Objects       map[string]*Object
	SpawnPoints   []Coords
	ActionChannel chan Action
	ChangeChannel chan Change
	mx            sync.Mutex
	space         *resolv.Space
}

func NewGame(layout MapLayout) *Game {
	g := &Game{
		Objects:       make(map[string]*Object),
		ActionChannel: make(chan Action, 64),
		ChangeChannel: make(chan Change, 64),
		space:         resolv.NewSpace(layout.Width, layout.Height, 1, 1),
	}

	for _, wall := range layout.Walls {
		w := wall
		w.r = resolv.NewObject(float64(wall.Coords.X), float64(wall.Coords.Y), 1, 1, "wall")
		g.Objects[w.ID] = &w
		g.space.Add(w.r)
	}
	for _, sp := range layout.SpawnPoints {
		g.SpawnPoints = append(g.SpawnPoints, sp.Coords)
	}
	return g
}

func (g *Game) Start() {
	go g.watchActions()
}

func (g *Game) watchActions() {
	for {
		action := <-g.ActionChannel
		if action == nil {
			zap.L().Warn("nil action")
			continue
		}
		g.mx.Lock()
		action.Perform(g)
		g.mx.Unlock()
	}
}

func (g *Game) sendChange(change Change) {
	select {
	case g.ChangeChannel <- change:
	default:
	}
}

type MapLayout struct {
	Width, Height int
	Walls         []Object
	SpawnPoints   []Object
}

var (
	map1 = MapLayout{
		Width:  3,
		Height: 3,
		SpawnPoints: []Object{
			{
				ID:     id(),
				Coords: Coords{1, 1},
				Type:   ObjectSpawnPoint,
			},
		},
	}
)

func id() string {
	return uuid.Must(uuid.NewV4()).String()
}

func init() {
	for x := 0; x < map1.Width; x++ {
		map1.Walls = append(map1.Walls, Object{
			ID:   id(),
			Type: ObjectWall,
			Coords: Coords{
				X: x,
				Y: map1.Height - 1,
			},
		})
	}
}

package server

import (
	"crypto/rand"
	"encoding/base64"
	"github.com/gofrs/uuid"
	"go.uber.org/zap"
	"io"
	"sync"
)

type Coords struct {
	X, Y float64
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
}

func NewGame(layout MapLayout) *Game {
	g := &Game{
		Objects:       make(map[string]*Object),
		ActionChannel: make(chan Action, 64),
		ChangeChannel: make(chan Change, 64),
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

func shortID() string {
	b := make([]byte, 3)
	_, _ = io.ReadFull(rand.Reader, b)
	return base64.RawStdEncoding.EncodeToString(b)
}

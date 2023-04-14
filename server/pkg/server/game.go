package server

import (
	"go.uber.org/zap"
	"sync"
)

type Coords struct {
	X, Y int32
}
type Entity struct {
	ID     string
	Coords Coords
}

type Game struct {
	Entities      map[string]*Entity
	ActionChannel chan Action
	ChangeChannel chan Change
	mx            sync.Mutex
}

func NewGame() *Game {
	g := &Game{
		Entities:      make(map[string]*Entity),
		ActionChannel: make(chan Action),
		ChangeChannel: make(chan Change),
	}
	g.Entities["test"] = &Entity{
		ID:     "test",
		Coords: Coords{0, 0},
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

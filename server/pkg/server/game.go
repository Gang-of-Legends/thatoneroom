package server

import (
	crand "crypto/rand"
	"encoding/base64"
	"github.com/gofrs/uuid"
	"go.uber.org/zap"
	"io"
	"math/rand"
	"sync"
	"time"
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
	objects       map[string]*Object
	SpawnPoints   []Coords
	ActionChannel chan Action
	ChangeChannel chan Change
	mx            sync.Mutex
	startAt       time.Time
	players       map[string]*Player
	playerMx      sync.RWMutex
}

type Player struct {
	ID    string
	Name  string
	Color int
	Score int
}

func NewGame() *Game {
	g := &Game{
		objects:       make(map[string]*Object),
		ActionChannel: make(chan Action, 64),
		ChangeChannel: make(chan Change, 64),
		players:       map[string]*Player{},
		startAt:       time.Now(),
	}

	return g
}

func (g *Game) Start() {
	go g.loop()
	go g.watchActions()
}

const (
	roundDuration = 2 * time.Minute
)

var (
	powerUpSpawnPoints = []Coords{
		{
			X: 150,
			Y: 100,
		},
		{
			X: 50,
			Y: 56,
		},
		{
			X: 80,
			Y: 104,
		},
		{
			X: 136,
			Y: 40,
		},
		{
			X: 216,
			Y: 104,
		},
		{
			X: 216,
			Y: 24,
		},
	}
)

func (g *Game) loop() {
	resetTicker := time.NewTicker(roundDuration)
	defer resetTicker.Stop()
	powerupTicker := time.NewTicker(15 * time.Second)
	defer powerupTicker.Stop()
	for {
		select {
		case <-powerupTicker.C:
			g.spawnItem()
		case <-resetTicker.C:
			//g.ActionChannel <- &ResetAction{}
		}
	}
}

func remove[T comparable](l []T, item T) []T {
	for i, other := range l {
		if other == item {
			return append(l[:i], l[i+1:]...)
		}
	}
	return l
}

func (g *Game) spawnItem() {
	objs := g.Objects()
	count := 0
	points := make([]Coords, len(powerUpSpawnPoints))
	copy(points, powerUpSpawnPoints)

	for _, obj := range objs {
		if obj.Type == ObjectItem {
			count++
			points = remove(points, obj.Coords)
		}
	}
	if count >= 3 || len(points) == 0 {
		return
	}
	coords := points[rand.Intn(len(points))]
	g.ActionChannel <- &SpawnObjectAction{
		ID:   shortID(),
		Type: "item",
		X:    coords.X,
		Y:    coords.Y,
		Item: rand.Intn(2),
	}

}

func (g *Game) GetPlayer(id string) *Player {
	g.playerMx.RLock()
	defer g.playerMx.RUnlock()
	return g.players[id]
}
func (g *Game) GetObject(id string) *Object {
	g.mx.Lock()
	defer g.mx.Unlock()
	return g.objects[id]
}
func (g *Game) Objects() []*Object {
	g.mx.Lock()
	defer g.mx.Unlock()
	objs := make([]*Object, 0, len(g.objects))
	for _, v := range g.objects {
		objs = append(objs, v)
	}
	return objs
}

func (g *Game) RemoveObject(id string) {
	g.mx.Lock()
	defer g.mx.Unlock()
	delete(g.objects, id)
}

func (g *Game) SetObject(obj *Object) {
	g.mx.Lock()
	defer g.mx.Unlock()
	g.objects[obj.ID] = obj
}

func (g *Game) watchActions() {
	for {
		action := <-g.ActionChannel
		if action == nil {
			zap.L().Warn("nil action")
			continue
		}
		action.Perform(g)
	}
}

func (g *Game) sendChange(change Change) {
	select {
	case g.ChangeChannel <- change:
	default:
	}
}

func id() string {
	return uuid.Must(uuid.NewV4()).String()
}

func shortID() string {
	b := make([]byte, 3)
	_, _ = io.ReadFull(crand.Reader, b)
	return base64.RawStdEncoding.EncodeToString(b)
}

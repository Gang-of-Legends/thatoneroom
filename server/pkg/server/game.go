package server

type Coords struct {
	X, Y int
}
type Entity struct {
	ID     string
	Coords Coords
}

type Game struct {
	Entities      map[string]*Entity
	ActionChannel chan Action
}

func NewGame() *Game {
	return &Game{
		Entities:      make(map[string]*Entity),
		ActionChannel: make(chan Action, 64),
	}
}

func (g *Game) Start() {
	go g.watchActions()
}

func (g *Game) watchActions() {
	for {
		action := <-g.ActionChannel
		action.Perform(g)
	}
}

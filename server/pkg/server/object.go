package server

type Object struct {
	ID        string
	Name      string
	Type      string
	Coords    Coords
	State     string
	Score     int
	Inventory []*Item
	Item      int
	Color     int
	Creator   string
}

type Item struct {
	Type  string
	Count int
}

const (
	ObjectPlayer = "player"
	ObjectBottle = "bottle"
	ObjectItem   = "item"
)

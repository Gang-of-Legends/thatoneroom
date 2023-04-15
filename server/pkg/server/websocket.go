package server

import (
	"encoding/json"
	"github.com/gofrs/uuid"
	"github.com/olahol/melody"
	serverv1 "github.com/petomalina/thatoneroom/server/pkg/api/thatoneroom/server/v1"
	"go.uber.org/zap"
	"sync"
)

type WebSocketService struct {
	M        *melody.Melody
	game     *Game
	mx       sync.RWMutex
	sessions map[string]*Session
}

type Session struct {
	S     *melody.Session
	ID    string
	Token string
}

func NewWSService() *WebSocketService {
	svc := &WebSocketService{
		M:        melody.New(),
		game:     NewGame(),
		sessions: make(map[string]*Session),
	}
	svc.game.Start()
	svc.watchChanges()
	svc.M.HandleConnect(svc.Connect)
	svc.M.HandleDisconnect(svc.Disconnect)
	svc.M.HandleMessage(svc.Message)
	return svc
}

func (s *WebSocketService) Connect(m *melody.Session) {

}

func (s *WebSocketService) Disconnect(m *melody.Session) {
	s.mx.Lock()
	//s.sessions[id] = session
	s.mx.Unlock()
}

func (s *WebSocketService) Message(m *melody.Session, msg []byte) {
	var sMsg serverv1.Message
	if err := json.Unmarshal(msg, &sMsg); err != nil {
		sendMsg(m, err)
		return
	}
	sessionAny, exists := m.Get("session")
	if !exists {
		sessionAny = &Session{
			S: m,
		}
	}
	session := sessionAny.(*Session)
	switch sMsg.Type {
	case serverv1.TypePlayerAuthenticate:
		var data serverv1.PlayerAuthenticate
		json.Unmarshal(sMsg.Data, &data)
		s.HandleAuthenticate(session, data)
	case serverv1.TypePlayerMove:
		var data serverv1.PlayerMove
		json.Unmarshal(sMsg.Data, &data)
		s.HandlePlayerMove(session, data)
	default:
		sendMsg(m, "unknown")
	}
}

func (s *WebSocketService) watchChanges() {
	go func() {
		for {
			change := <-s.game.ChangeChannel
			var msg serverv1.Message
			switch val := change.(type) {
			case NewPlayerChange:
				msg = serverv1.NewServerAddPlayer(val.Entity.ID)
			case MoveChange:
				msg = serverv1.NewServerMove(val.Entity.ID, val.Entity.Coords.X, val.Entity.Coords.Y)
			}

			b, _ := json.Marshal(msg)

			if err := s.M.Broadcast(b); err != nil {
				zap.L().Error("broadcast", zap.Error(err))

			}
		}
	}()
}

func (s *WebSocketService) HandleAuthenticate(ps *Session, data serverv1.PlayerAuthenticate) {
	if data.Token != "" {
		if ps.Token != data.Token {
			sendMsg(ps.S, serverv1.NewServerAuthenticate(false, "", ""))
			return
		}
		sendMsg(ps.S, serverv1.NewServerAuthenticate(true, ps.Token, ps.ID))
		return
	}
	id := uuid.Must(uuid.NewV4()).String()
	token := uuid.Must(uuid.NewV4()).String()
	session := &Session{
		ID:    id,
		Token: token,
		S:     ps.S,
	}
	ps.S.Set("session", session)
	s.game.ActionChannel <- &AddPlayerAction{
		ID: id,
	}
	sendMsg(ps.S, serverv1.NewServerAuthenticate(true, session.Token, session.ID))

}

func (s *WebSocketService) HandlePlayerMove(ps *Session, data serverv1.PlayerMove) {
	if ps.ID == "" {
		sendMsg(ps.S, "authorize first")
		return
	}
	s.game.ActionChannel <- &MoveAction{
		ID: ps.ID,
		To: Coords{
			X: data.X,
			Y: data.Y,
		},
	}
}
func sendMsg(m *melody.Session, msg any) {
	b, err := json.Marshal(msg)
	if err != nil {
		m.CloseWithMsg([]byte(err.Error()))
		return
	}
	m.Write(b)
}

package server

import (
	"encoding/json"
	"github.com/gofrs/uuid"
	"github.com/olahol/melody"
	serverv1 "github.com/petomalina/thatoneroom/server/pkg/api/thatoneroom/server/v1"
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
	session, exists := m.Get("session")
	if !exists {
		session = &Session{
			S: m,
		}
	}
	serverv1.HandleMessage(msg, session.(*Session))

}

func (s *Session) HandleAuthenticate(data serverv1.Message[serverv1.PlayerAuthenticate]) {
	if data.Data.Token != "" {
		if s.Token != data.Data.Token {
			sendMsg(s.S, serverv1.NewServerAuthenticate(false, "", ""))
			return
		}
		sendMsg(s.S, serverv1.NewServerAuthenticate(true, data.Data.Token, ""))
		return
	}
	id := uuid.Must(uuid.NewV4()).String()
	token := uuid.Must(uuid.NewV4()).String()
	session := &Session{
		ID:    id,
		Token: token,
		S:     s.S,
	}
	s.S.Set("session", session)
	sendMsg(s.S, serverv1.NewServerAuthenticate(true, token, id))
}

func sendMsg(m *melody.Session, msg any) {
	b, err := json.Marshal(msg)
	if err != nil {
		m.CloseWithMsg([]byte(err.Error()))
		return
	}
	m.Write(b)
}

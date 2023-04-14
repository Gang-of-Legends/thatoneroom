package server

import (
	"context"
	"errors"
	"github.com/bufbuild/connect-go"
	"github.com/gofrs/uuid"
	v1 "github.com/petomalina/thatoneroom/server/pkg/api/thatoneroom/server/v1"
	"go.uber.org/zap"
	"sync"
)

type Service struct {
	Connections map[string]string
	mx          sync.RWMutex
	game        *Game
}

func NewService() *Service {
	return &Service{
		Connections: make(map[string]string),
		game:        NewGame(),
	}
}
func (s *Service) Connect(ctx context.Context, req *connect.Request[v1.ConnectRequest]) (*connect.Response[v1.ConnectResponse], error) {
	id, err := uuid.NewV4()
	if err != nil {
		return nil, err
	}
	token, err := uuid.NewV4()
	if err != nil {
		return nil, err
	}
	playerID := id.String()
	s.mx.Lock()
	s.Connections[playerID] = token.String()
	s.mx.Unlock()
	res := connect.NewResponse(&v1.ConnectResponse{
		Id:    playerID,
		Token: token.String(),
	})
	return res, nil
}

func (s *Service) Stream(ctx context.Context, stream *connect.BidiStream[v1.Request, v1.Response]) error {
	id := stream.RequestHeader().Get("X-ID")
	userToken := stream.RequestHeader().Get("X-Token")

	s.mx.RLock()
	token, ok := s.Connections[id]
	s.mx.RUnlock()
	if !ok || userToken != token {
		return errors.New("unauthorized")
	}
	go func() {
		req, err := stream.Receive()
		if err != nil {
			zap.L().Error("stream receive", zap.Error(err))
			return
		}
		switch req.GetAction().(type) {
		case *v1.Request_Move:
			s.handleMove(id, req.GetMove())
		}
	}()
	panic("implement me")
}

func (s *Service) handleMove(id string, m *v1.Move) {
	s.game.ActionChannel <- &MoveAction{
		ID:        id,
		Direction: Direction(m.Direction),
	}
}

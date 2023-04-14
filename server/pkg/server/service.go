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

type Connection struct {
	Token  string
	Stream connect.StreamingHandlerConn
}
type Service struct {
	Connections map[string]*Connection
	mx          sync.RWMutex
	game        *Game
}

func NewService() *Service {
	svc := &Service{
		Connections: make(map[string]*Connection),
		game:        NewGame(),
	}
	svc.Connections["test"] = &Connection{
		Token: "test",
	}
	svc.watchChanges()
	svc.game.Start()
	return svc
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
	s.Connections[playerID] = &Connection{
		Token: token.String(),
	}
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

	s.mx.Lock()
	conn, ok := s.Connections[id]
	s.mx.Unlock()
	if !ok || userToken != conn.Token {
		return connect.NewError(connect.CodePermissionDenied, errors.New("not found"))
	}
	conn.Stream = stream.Conn()
	go func() {
		for {
			req, err := stream.Receive()
			if err != nil {
				zap.L().Error("stream receive", zap.Error(err))
				return
			}
			switch req.GetAction().(type) {
			case *v1.Request_Move:
				s.handleMove(id, req.GetMove())
			}
		}
	}()
	select {
	case <-ctx.Done():
		return ctx.Err()
	}

	return nil
}

func (s *Service) handleMove(id string, m *v1.Move) {
	if m.To == nil {
		return
	}
	s.game.ActionChannel <- &MoveAction{
		ID: id,
		To: Coords{
			X: m.To.X,
			Y: m.To.Y,
		},
	}
}

func (s *Service) broadcast(resp *v1.Response) {
	s.mx.Lock()
	for _, conn := range s.Connections {
		if conn.Stream == nil {
			continue
		}
		if err := conn.Stream.Send(resp); err != nil {
			zap.L().Error("stream send", zap.Error(err))
			continue
		}
	}
	s.mx.Unlock()
}

func (s *Service) watchChanges() {
	go func() {
		for {
			change := <-s.game.ChangeChannel
			switch val := change.(type) {
			case MoveChange:
				s.handleMoveChange(val)
			}
		}
	}()
}

func (s *Service) handleMoveChange(change MoveChange) {
	resp := v1.Response{
		Action: &v1.Response_UpdateEntity{
			UpdateEntity: &v1.UpdateEntity{
				Entity: &v1.Entity{
					Entity: &v1.Entity_Player{
						Player: &v1.Player{
							Id: change.Entity.ID,
							Position: &v1.Coordinate{
								X: change.Entity.Coords.X,
								Y: change.Entity.Coords.Y,
							},
						},
					},
				},
			},
		},
	}
	s.broadcast(&resp)
}

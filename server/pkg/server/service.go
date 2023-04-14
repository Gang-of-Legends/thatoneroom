package server

import (
	"context"
	"github.com/bufbuild/connect-go"
	v1 "github.com/petomalina/thatoneroom/server/pkg/api/thatoneroom/server/v1"
)

type Service struct {
}

func (s *Service) Connect(ctx context.Context, req *connect.Request[v1.ConnectRequest]) (*connect.Response[v1.ConnectResponse], error) {
	res := connect.NewResponse(&v1.ConnectResponse{})
	return res, nil
}

func (s *Service) Stream(ctx context.Context, c *connect.BidiStream[v1.Request, v1.Response]) error {
	//TODO implement me
	panic("implement me")
}

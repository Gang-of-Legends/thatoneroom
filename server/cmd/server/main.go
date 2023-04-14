package main

import (
	"github.com/petomalina/thatoneroom/server/pkg/api/thatoneroom/server/v1/serverv1connect"
	"github.com/petomalina/thatoneroom/server/pkg/server"
	"go.uber.org/zap"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"net/http"
	"os"
)

func defaultEnvOr(key, value string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return value
}
func main() {
	logger, err := zap.NewDevelopment()
	if err != nil {
		panic(err)
	}
	zap.ReplaceGlobals(logger)
	addr := defaultEnvOr("ADDR", "localhost:8080")
	mux := http.NewServeMux()
	svc := &server.Service{}
	path, handler := serverv1connect.NewServerServiceHandler(svc)
	mux.Handle(path, handler)
	zap.L().Info("listening", zap.String("addr", addr))
	if err := http.ListenAndServe(
		addr,
		h2c.NewHandler(mux, &http2.Server{}),
	); err != nil {
		panic(err)
	}
}

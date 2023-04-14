package main

import (
	"github.com/petomalina/thatoneroom/server/pkg/server"
	"go.uber.org/zap"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
	"net/http"
	"os"
	"strings"
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
	svc := server.NewWSService()
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		svc.M.HandleRequest(w, r)
	})
	zap.L().Info("listening", zap.String("addr", addr))

	if strings.HasSuffix(addr, ":443") {
		if err := http.ListenAndServeTLS(
			addr, "/etc/letsencrypt/live/petermalina.com/fullchain.pem", "/etc/letsencrypt/live/petermalina.com/privkey.pem",
			h2c.NewHandler(mux, &http2.Server{}),
		); err != nil {
			panic(err)
		}
	} else {
		if err := http.ListenAndServe(
			addr,
			h2c.NewHandler(mux, &http2.Server{}),
		); err != nil {
			panic(err)
		}
	}

}

// Code generated by protoc-gen-connect-go. DO NOT EDIT.
//
// Source: thatoneroom/server/v1/service.proto

package serverv1connect

import (
	context "context"
	errors "errors"
	connect_go "github.com/bufbuild/connect-go"
	v1 "github.com/petomalina/thatoneroom/server/pkg/api/thatoneroom/server/v1"
	http "net/http"
	strings "strings"
)

// This is a compile-time assertion to ensure that this generated file and the connect package are
// compatible. If you get a compiler error that this constant is not defined, this code was
// generated with a version of connect newer than the one compiled into your binary. You can fix the
// problem by either regenerating this code with an older version of connect or updating the connect
// version compiled into your binary.
const _ = connect_go.IsAtLeastVersion0_1_0

const (
	// ServerServiceName is the fully-qualified name of the ServerService service.
	ServerServiceName = "thatoneroom.server.v1.ServerService"
)

// These constants are the fully-qualified names of the RPCs defined in this package. They're
// exposed at runtime as Spec.Procedure and as the final two segments of the HTTP route.
//
// Note that these are different from the fully-qualified method names used by
// google.golang.org/protobuf/reflect/protoreflect. To convert from these constants to
// reflection-formatted method names, remove the leading slash and convert the remaining slash to a
// period.
const (
	// ServerServiceConnectProcedure is the fully-qualified name of the ServerService's Connect RPC.
	ServerServiceConnectProcedure = "/thatoneroom.server.v1.ServerService/Connect"
	// ServerServiceStreamProcedure is the fully-qualified name of the ServerService's Stream RPC.
	ServerServiceStreamProcedure = "/thatoneroom.server.v1.ServerService/Stream"
)

// ServerServiceClient is a client for the thatoneroom.server.v1.ServerService service.
type ServerServiceClient interface {
	Connect(context.Context, *connect_go.Request[v1.ConnectRequest]) (*connect_go.Response[v1.ConnectResponse], error)
	Stream(context.Context) *connect_go.BidiStreamForClient[v1.Request, v1.Response]
}

// NewServerServiceClient constructs a client for the thatoneroom.server.v1.ServerService service.
// By default, it uses the Connect protocol with the binary Protobuf Codec, asks for gzipped
// responses, and sends uncompressed requests. To use the gRPC or gRPC-Web protocols, supply the
// connect.WithGRPC() or connect.WithGRPCWeb() options.
//
// The URL supplied here should be the base URL for the Connect or gRPC server (for example,
// http://api.acme.com or https://acme.com/grpc).
func NewServerServiceClient(httpClient connect_go.HTTPClient, baseURL string, opts ...connect_go.ClientOption) ServerServiceClient {
	baseURL = strings.TrimRight(baseURL, "/")
	return &serverServiceClient{
		connect: connect_go.NewClient[v1.ConnectRequest, v1.ConnectResponse](
			httpClient,
			baseURL+ServerServiceConnectProcedure,
			opts...,
		),
		stream: connect_go.NewClient[v1.Request, v1.Response](
			httpClient,
			baseURL+ServerServiceStreamProcedure,
			opts...,
		),
	}
}

// serverServiceClient implements ServerServiceClient.
type serverServiceClient struct {
	connect *connect_go.Client[v1.ConnectRequest, v1.ConnectResponse]
	stream  *connect_go.Client[v1.Request, v1.Response]
}

// Connect calls thatoneroom.server.v1.ServerService.Connect.
func (c *serverServiceClient) Connect(ctx context.Context, req *connect_go.Request[v1.ConnectRequest]) (*connect_go.Response[v1.ConnectResponse], error) {
	return c.connect.CallUnary(ctx, req)
}

// Stream calls thatoneroom.server.v1.ServerService.Stream.
func (c *serverServiceClient) Stream(ctx context.Context) *connect_go.BidiStreamForClient[v1.Request, v1.Response] {
	return c.stream.CallBidiStream(ctx)
}

// ServerServiceHandler is an implementation of the thatoneroom.server.v1.ServerService service.
type ServerServiceHandler interface {
	Connect(context.Context, *connect_go.Request[v1.ConnectRequest]) (*connect_go.Response[v1.ConnectResponse], error)
	Stream(context.Context, *connect_go.BidiStream[v1.Request, v1.Response]) error
}

// NewServerServiceHandler builds an HTTP handler from the service implementation. It returns the
// path on which to mount the handler and the handler itself.
//
// By default, handlers support the Connect, gRPC, and gRPC-Web protocols with the binary Protobuf
// and JSON codecs. They also support gzip compression.
func NewServerServiceHandler(svc ServerServiceHandler, opts ...connect_go.HandlerOption) (string, http.Handler) {
	mux := http.NewServeMux()
	mux.Handle(ServerServiceConnectProcedure, connect_go.NewUnaryHandler(
		ServerServiceConnectProcedure,
		svc.Connect,
		opts...,
	))
	mux.Handle(ServerServiceStreamProcedure, connect_go.NewBidiStreamHandler(
		ServerServiceStreamProcedure,
		svc.Stream,
		opts...,
	))
	return "/thatoneroom.server.v1.ServerService/", mux
}

// UnimplementedServerServiceHandler returns CodeUnimplemented from all methods.
type UnimplementedServerServiceHandler struct{}

func (UnimplementedServerServiceHandler) Connect(context.Context, *connect_go.Request[v1.ConnectRequest]) (*connect_go.Response[v1.ConnectResponse], error) {
	return nil, connect_go.NewError(connect_go.CodeUnimplemented, errors.New("thatoneroom.server.v1.ServerService.Connect is not implemented"))
}

func (UnimplementedServerServiceHandler) Stream(context.Context, *connect_go.BidiStream[v1.Request, v1.Response]) error {
	return connect_go.NewError(connect_go.CodeUnimplemented, errors.New("thatoneroom.server.v1.ServerService.Stream is not implemented"))
}

---
layout: documentation
title: Vert.x 2
---

# Vert.x 2
This bridge integrates wes application with the [Vert.x 2](http://vertx.io/) which is an event driven application framework.

## Install
Install via `vertx` console or include the following module in a basic manner.

```
io.github.flowersinthesand~wes-vertx2~${wes.version}
```

## Run

```java
public class Bootstrap extends Verticle {

    @Override
    public void start() {
        HttpServer httpServer = vertx.createHttpServer();
        httpServer.requestHandler(new Handler<HttpServerRequest>() {
            @Override
            public void handle(HttpServerRequest req) {
                if (req.path().startsWith("/portal")) {
                    new VertxServerHttpExchange(req);
                }
            }
        });
        httpServer.websocketHandler(new Handler<org.vertx.java.core.http.ServerWebSocket>() {
            @Override
            public void handle(org.vertx.java.core.http.ServerWebSocket socket) {
                if (socket.path().startsWith("/portal")) {
                    new VertxServerWebSocket(socket);
                }
            }
        });
        httpServer.listen(8080);
    }
}
```

1. Prepare `HttpServer`
    1. Define `Verticle`.
1. Add `requestHandler`.
    1. Create `VertxServerHttpExchange` checking the path.
    1. Dispatch it to wes application.
1. Add `websocketHandler`.
    1. Create `VertxServerWebSocket` checking the path.
    1. Dispatch it to wes application.
1. Starts the server.
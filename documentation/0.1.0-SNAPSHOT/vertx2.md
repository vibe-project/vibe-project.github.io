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

You need to write request handler and websocket handler as event source and attach them to `HttpServer`.

```java
public class Bootstrap extends Verticle {

    @Override
    public void start() {
        // Assume Portal is wes application
        Portal portal;
        
        HttpServer httpServer = vertx.createHttpServer();
        httpServer.requestHandler(new Handler<HttpServerRequest>() {
            @Override
            public void handle(HttpServerRequest req) {
                // Check path
                if (req.path().startsWith("/portal")) {
                     portal.httpAction().on(new VertxServerHttpExchange(req));
                }
            }
        });
        httpServer.websocketHandler(new Handler<org.vertx.java.core.http.ServerWebSocket>() {
            @Override
            public void handle(org.vertx.java.core.http.ServerWebSocket socket) {
                // Check path
                if (socket.path().startsWith("/portal")) {
                     portal.websocketAction().on(new VertxServerWebSocket(socket));
                }
            }
        });
        httpServer.listen(8080);
    }
}
```
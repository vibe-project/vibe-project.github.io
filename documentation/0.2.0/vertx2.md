---
layout: home
title: Vert.x 2
---

# Vert.x 2
This bridge integrates wes application with the [Vert.x 2](http://vertx.io/) which is an event driven application framework.

---

This bridge is also a Vert.x module. Install via `vertx` console or include it on your classpath manually.

```
io.github.flowersinthesand~wes-vertx2~0.2.0
```

---

## Bootstrap

To run wes application in Servlet environment with Atmosphere, you need to prepare `HttpServer` not listening and pass it to `VertxBridge`. Before doing that, you have to attach your request handler or WebSocket handler first.

```java
public class Bootstrap extends Verticle {

    @Override
    public void start() {
        // Assume Server is wes application
        io.github.flowersinthesand.portal.Server server = new DefaultServer();
        
        // Create HttpServer and register your handler first
        HttpServer httpServer = vertx.createHttpServer();
        
        // Bridge wes application and Vert.x
        new VertxBridge(httpServer, "/portal")
        .httpAction(server.httpAction()).websocketAction(server.websocketAction());
        
        // Starts the server
        httpServer.listen(8080);
    }
    
}
```
---
layout: home
title: Vert.x 2
---

# Vert.x 2
This bridge integrates wes application with the [Vert.x 2](http://vertx.io/) which is an event driven application framework.

See [working example](https://github.com/flowersinthesand/portal-java-examples/tree/master/server/platform/vertx2).

---

This bridge is also a Vert.x module. Install via `vertx` console or include it on your classpath manually.

```
io.github.flowersinthesand~wes-vertx2~0.2.1
```

---

## Bootstrap

To run wes application in Vert.x, you need to prepare `HttpServer` not listening and pass it to `VertxBridge`. Before doing that, you have to attach your request handler or WebSocket handler first.

```java
package io.github.flowersinthesand.portal.examples;

import io.github.flowersinthesand.portal.DefaultServer;
import io.github.flowersinthesand.portal.Server;
import io.github.flowersinthesand.portal.Socket;
import io.github.flowersinthesand.wes.Action;
import io.github.flowersinthesand.wes.vertx.VertxBridge;

import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.platform.Verticle;

public class Bootstrap extends Verticle {

	@Override
	public void start() {
		// Server is wes application
		Server server = new DefaultServer();
		// This is about Portal
		server.socketAction(new Action<Socket>() {
			@Override
			public void on(final Socket socket) {
				// Your logic here
			}
		});
		
		HttpServer httpServer = vertx.createHttpServer();
		
		// Attach request handler and WebSocket handler first before installation
		httpServer.requestHandler(new Handler<HttpServerRequest>() {
			@Override
			public void handle(HttpServerRequest req) {
				String filename = req.path().equals("/") ? "/index.html" : req.path();
				req.response().sendFile("webapp" + filename);
			}
		});
		
		// Deliver HttpExchange and WebSocket produced by Vert.x to the server
		new VertxBridge(httpServer, "/test").httpAction(server.httpAction()).websocketAction(server.websocketAction());
		
		// Start a web server after installation
		httpServer.listen(8080);
	}
	
}
```
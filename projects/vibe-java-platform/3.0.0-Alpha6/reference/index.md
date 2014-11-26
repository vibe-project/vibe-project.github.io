---
layout: project
title: Vibe Java Platform Reference
---

<h1>Reference</h1>

---

**Table of Contents**

* [Installation](#installation)
* [Platform](#platform)
    * [Atmosphere 2](#atmosphere-2)
    * [Grizzly 2](#grizzly-2)
    * [Java WebSocket API 1](#java-websocket-api-1)
    * [Netty 4](#netty-4)
    * [Play 2](#play-2)
    * [Servlet 3](#servlet-3)
    * [Vert.x 2](#vert.x-2)
* [Platform on platform](#platform-on-platform)
    * [JAX-RS 2](#jax-rs-2)
* [ServerHttpExchange](#serverhttpexchange)
    * [Request properties](#request-properties)
    * [Reading request](#reading-request)
    * [Response properties](#response-properties)
    * [Writing response](#writing-response)
    * [Error handling](#error-handling)
    * [End of HTTP exchange](#end-of-http-exchange)
* [ServerWebSocket](#serverwebsocket)
    * [Properties](#properties)
    * [Receiving frame](#receiving-frame)
    * [Sending frame](#sending-frame)
    * [Closing connection](#closing-connection)
    * [Error handling](#error-handling-1)
    * [End of WebSocket](#end-of-websocket)
        
---

## Installation
Vibe Java Platform requires Java 7 and is distributed through Maven Central.

* **To run application on platform**

Generally speaking, having application run on the specific platform means to feed one or both of `ServerHttpExchange` and `ServerWebSocket` into the application which are produced by the specific platform or framework using the corresponding bridge module. How to varies for each platform or framework. See [Platform](#platform) and [Platform on platform](#platform-on-platform) section.

* **To write application running on platform**

An application running on platform is a collection of actions that consumes `ServerHttpExchange` and `ServerWebSocket`. Therefore, application should expose those actions to receive them. Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server</artifactId>
        <version>3.0.0-Alpha6</version>
    </dependency>
</dependencies>
```

Then see [ServerHttpExchange](#serverhttpexchange) to handle HTTP exchange and  [ServerWebSocket](#serverwebsocket) to handle WebSocket section.

---

## Platform
Platform stands for lietrally platform where web application runs by facilitating dealing with HTTP exchange and WebSocket like full-stack web application framework and raw web server.

To bridge application and platform, a module called bridge is required which transforms the underlying platform's resources representing HTTP exchange and WebSocket into `ServerHttpExchange` and `ServerWebSocket`. The following bridges are available.

### Atmosphere 2
[Atmosphere 2](https://github.com/Atmosphere/atmosphere/) is a platform to use Servlet 3 and Java WebSocket API together in more comfortable way.

**Note**

* Requires Atmosphere 2.2 and later.
* Servlet can't detect disconnection.

**[Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/atmosphere2)**

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-atmosphere2</artifactId>
        <version>3.0.0-Alpha6</version>
    </dependency>
</dependencies>
```

To bridge application and Atmosphere, you should register a servlet of `VibeAtmosphereServlet`. When registering servlet, you must set `asyncSupported` to `true` and set a init param, `org.atmosphere.cpr.AtmosphereInterceptor.disableDefaults`, to `true`.

```java
@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Your application
        final org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
        ServletContext context = event.getServletContext();
        ServletRegistration.Dynamic reg = context.addServlet(VibeAtmosphereServlet.class.getName(), new VibeAtmosphereServlet() {
            @Override
            protected Action<ServerHttpExchange> httpAction() {
                return server.httpAction();
            }
            
            @Override
            protected Action<ServerWebSocket> wsAction() {
                return server.wsAction();
            }
        });
        reg.setAsyncSupported(true);
        reg.setInitParameter(ApplicationConfig.DISABLE_ATMOSPHEREINTERCEPTOR, Boolean.TRUE.toString());
        reg.addMapping("/vibe");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Grizzly 2
[Grizzly 2](https://grizzly.java.net/) is a framework to help developers to take advantage of the Java™ NIO API.

**Note**

* After response ends, request becomes not available.

**[Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/grizzly2)**

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-grizzly2</artifactId>
        <version>3.0.0-Alpha6</version>
    </dependency>
</dependencies>
```

And then, you should register an instance of `VibeHttpHandler` to deal with HTTP exchange and an instance of `VibeWebSocketApplication` to deal with WebSocket.

```java
public class Bootstrap {
    public static void main(String[] args) throws Exception {
        // Your application
        final org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
        HttpServer httpServer = HttpServer.createSimpleServer();
        ServerConfiguration config = httpServer.getServerConfiguration();
        config.addHttpHandler(new VibeHttpHandler() {
            @Override
            protected Action<ServerHttpExchange> httpAction() {
                return server.httpAction();
            }
        }, "/vibe");
        NetworkListener listener = httpServer.getListener("grizzly");
        listener.registerAddOn(new WebSocketAddOn());
        WebSocketEngine.getEngine().register("", "/vibe", new VibeWebSocketApplication() {
            @Override
            protected Action<ServerWebSocket> wsAction() {
                return server.wsAction();
            }
        });
        httpServer.start();
        System.in.read();
    }
}
```

### Java WebSocket API 1
[Java WebSocket API 1](http://docs.oracle.com/javaee/7/tutorial/doc/websocket.htm#GKJIQ5) (JWA) from Java EE 7.

**[Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/servlet3-jwa1)**

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-jwa1</artifactId>
        <version>3.0.0-Alpha6</version>
    </dependency>
</dependencies>
```

Then, you should register an endpoint of `VibeServerEndpoint`. Note that each WebSocket session is supposed to have each endpoint instance so an instance of `VibeServerEndpoint` can't be shared among `ServerEndpointConfig`s.

```java
@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Your application
        final org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
        ServletContext context = event.getServletContext();
        ServerContainer container = (ServerContainer) context.getAttribute(ServerContainer.class.getName());
        ServerEndpointConfig config = ServerEndpointConfig.Builder.create(VibeServerEndpoint.class, "/vibe")
        .configurator(new Configurator() {
            @Override
            public <T> T getEndpointInstance(Class<T> endpointClass) throws InstantiationException {
                return endpointClass.cast(new VibeServerEndpoint() {
                    @Override
                    protected Action<ServerWebSocket> wsAction() {
                        return server.wsAction();
                    }
                });
            }
        })
        .build();
        try {
            container.addEndpoint(config);
        } catch (DeploymentException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Netty 4
[Netty 4](http://netty.io/) is an asynchronous event-driven network application framework.

**[Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/netty4)**

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-netty4</artifactId>
        <version>3.0.0-Alpha6</version>
    </dependency>
</dependencies>
```

To bridge application and Netty, you should register a handler of `VibeServerCodec`. When configuring handlers, you must add `HttpServerCodec` in front of the handler.

```java
public class Bootstrap {
    public static void main(String[] args) throws Exception {
        // Your application
        final org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
        EventLoopGroup bossGroup = new NioEventLoopGroup();
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            ServerBootstrap bootstrap = new ServerBootstrap();
            bootstrap.group(bossGroup, workerGroup)
            .channel(NioServerSocketChannel.class)
            .childHandler(new ChannelInitializer<SocketChannel>() {
                @Override
                public void initChannel(SocketChannel ch) {
                    ChannelPipeline pipeline = ch.pipeline();
                    pipeline.addLast(new HttpServerCodec())
                    .addLast(new VibeServerCodec() {
                        @Override
                        protected boolean accept(HttpRequest req) {
                            return URI.create(req.getUri()).getPath().equals("/vibe");
                        }
                        
                        @Override
                        protected Action<ServerHttpExchange> httpAction() {
                            return server.httpAction();
                        }
                        
                        @Override
                        public Action<ServerWebSocket> wsAction() {
                            return server.websocketAction();
                        }
                    });
                }
            });
            Channel channel = bootstrap.bind(8080).sync().channel();
            channel.closeFuture().sync();
        } finally {
            workerGroup.shutdownGracefully();
            bossGroup.shutdownGracefully();
        }
    }
}
```

### Play 2
[Play framework 2](http://www.playframework.org/) is a high velocity web framework for Java and Scala.

**Note**

* Play can't send and receive text frame and binary frame together via a WebSocket connection. However, it may be solved with Play's Scala API. [vibe-java-platform#4](https://github.com/vibe-project/vibe-java-platform/issues/4) 

**[Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/play2)**

Add the following dependency to your `build.sbt` or include it on your classpath manually.

```scala
libraryDependencies ++= Seq(
  "org.atmosphere" % "vibe-platform-server-play2" % "3.0.0-Alpha6"
)
```

Then, write entry point for HTTP exchange and WebSocket extending `Controller`. A helper class will be introduced solving the above notes.

```java
import org.atmosphere.vibe.platform.Action;
import org.atmosphere.vibe.platfom.server.play2.*;

import play.libs.F.Promise;
import play.mvc.*;
import play.mvc.Http.Request;

public class Bootstrap extends Controller {
    // Your application
    static org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();

    @BodyParser.Of(BodyParser.TolerantText.class)
    public static Promise<Result> http() {
        PlayServerHttpExchange http = new PlayServerHttpExchange(request(), response());
        server.httpAction().on(http);
        return http.result();
    }
    
    public static WebSocket<String> ws() {
        final Request request = request();
        return new WebSocket<String>() {
            @Override
            public void onReady(WebSocket.In<String> in, WebSocket.Out<String> out) {
                server.wsAction().on(new PlayServerWebSocket(request, in, out));
            }
        };
    }
}

```

Play doesn't allow to share URI between HTTP and WebSocket entry points. Instead of `routes`, write `Global.scala` in the default package and override `onRouteRequest`. It's not easy to do that in Java, if any. Note that this uses internal API that has broken even in patch release. I've confirmed the following code works in `2.2.2` and `2.3.2`.

```scala
import simple.{Bootstrap => T}

import play.api.GlobalSettings
import play.api.mvc._
import play.core.j._

object Global extends GlobalSettings {
  override def onRouteRequest(req: RequestHeader): Option[Handler] = {
    if (req.path == "/vibe") {
      if (req.method == "GET" && req.headers.get("Upgrade").exists(_.equalsIgnoreCase("websocket"))) {
        Some(JavaWebSocket.ofString(T.ws))
      } else {
        Some(new JavaAction {
          val annotations = new JavaActionAnnotations(classOf[T], classOf[T].getMethod("http"))
          val parser = annotations.parser
          def invocation = T.http
        })
      }
    } else {
      super.onRouteRequest(req)
    }
  }
}
```

### Servlet 3
[Servlet 3.0](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 6 and [Servlet 3.1](https://docs.oracle.com/javaee/7/tutorial/doc/servlets.htm) from Java EE 7.

**Note**

* Servlet can't detect disconnection.

**[Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/servlet3-jwa1)**

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-servlet3</artifactId>
        <version>3.0.0-Alpha6</version>
    </dependency>
</dependencies>
```

To bridge application and Servlet, you should register a servlet of `VibeServlet`. When registering servlet, you must set `asyncSupported` to `true`.

```java
@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Your application
        final org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
        ServletContext context = event.getServletContext();
        ServletRegistration.Dynamic reg = context.addServlet(VibeServlet.class.getName(), new VibeServlet() {
            @Override
            protected Action<ServerHttpExchange> httpAction() {
                return server.httpAction();
            }
        });
        reg.setAsyncSupported(true);
        reg.addMapping("/vibe");
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Vert.x 2
[Vert.x 2](http://vertx.io/) is a lightweight, high performance application platform for the JVM 

**[Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/vertx2)**

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-vertx2</artifactId>
        <version>3.0.0-Alpha6</version>
    </dependency>
</dependencies>
```

You should register a handler of `VibeRequestHandler` to handle HTTP exchange and `VibeWebSocketHandler` to handle WebSocket.

```java
public class Bootstrap extends Verticle {
    @Override
    public void start() {
        // Your application
        final org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
        HttpServer httpServer = vertx.createHttpServer();
        RouteMatcher httpMatcher = new RouteMatcher();
        httpMatcher.all("/vibe", new VibeRequestHandler() {
            @Override
            protected Action<ServerHttpExchange> httpAction() {
                return server.httpAction();
            }
        });
        httpServer.requestHandler(httpMatcher);
        final VibeWebSocketHandler websocketHandler = new VibeWebSocketHandler() {
            @Override
            protected Action<ServerWebSocket> wsAction() {
                return server.wsAction();
            }
        };
        httpServer.websocketHandler(new Handler<org.vertx.java.core.http.ServerWebSocket>() {
            @Override
            public void handle(org.vertx.java.core.http.ServerWebSocket socket) {
                if (socket.path().equals("/vibe")) {
                    websocketHandler.handle(socket);
                }
            }
        });
        httpServer.listen(8080);
    }
}
```

---

## Platform on platform
Some platform is based on the other platform and allows to deal with the underlying platform so that it's possible to run application on such platform wihout creating an additional bridge if the corresponding bridge is available.

The general pattern is to share application between the platform and the underlying platform using `static` keyword, sharing application holder or adopting dependency injection.

### JAX-RS 2
[JAX-RS 2](https://docs.oracle.com/javaee/7/tutorial/doc/jaxws.htm) from Java EE 7. JAX-RS allows to deploy JAX-RS resources to several servers, and one of them is Servlet. That means, you can run application on Servlet or Atmosphere with JAX-RS. The same approach may be applied to JAX-RS 1. [Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform-on-platform/jaxrs2-atmosphere2).

---

## ServerHttpExchange
A server-side HTTP request-response exchange. It is given when request headers are available.

### Request properties
These are read only and might not be available in some platforms after `endAction` or `closeAction`.

<div class="row">
    <div class="large-4 columns">
        <h5>URI</h5>
        <p>A request URI used to connect. To work with URI parts, use <code>java.net.URI</code> or something like that.</p>
{% capture panel %}
```java
URI.create(http.uri()).getQuery();
```
{% endcapture %}{{ panel | markdownify }}
    </div>
    <div class="large-4 columns">
        <h5>Method</h5>
        <p>A name of the request method.</p>
{% capture panel %}
```java
switch (http.method()) {
    case "GET":
    case "POST":
        // GET or POST
        break;
}
```
{% endcapture %}{{ panel | markdownify }}
    </div>
    <div class="large-4 columns">
        <h5>Headers</h5>
        <p>Request headers.</p>
{% capture panel %}
```java
for (String name : http.headerNames()) {
    String value = http.header(name);
}
```
{% endcapture %}{{ panel | markdownify }}
    </div>
</div>

### Reading request
`read` initiates reading the request body and read chunk is passed to `chunkAction`. Whether to read as text or binary is determined by the content-type request header in conformance with [RFC 2616](http://www.w3.org/Protocols/rfc2616/rfc2616-sec7.html#sec7.2.1). If the header starts with `text/`, chunk will be read as text following the specified charset in the header (`ISO-8859-1` if not specified) and passed as `String`. If not, chunk will be read as binary and passed as `ByteBuffer`. But you can force the request to how to the body using `readAsText` and `readAsBinary`. Finally, the request is fully read. Then, `endAction` is fired which is the end of the request.

```java
Stringbuilder bodyBuilder = new Stringbuilder();
http.chunkAction(new Action<String>() {
    @Override
    public void on(String chunk) {
        bodyBuilder.append(chunk);
    }
})
.endAction(new VoidAction() {
    @Override
    public void on() {
        String body = bodyBuilder.toString();
        // Your logic here
    }
})
.read();
```

For convenience, `bodyAction` is provided which allows to receive the whole request body. However, note that if body is quite big it will drain memory in an instant.

```java
http.bodyAction(new Action<String>() {
    @Override
    public void on(String body) {
        // Your logic here
    }
})
.read();
```

`read` and its variant methods should be called after adding `chunk` and `body` event handlers. In case where the underlying platform can't read body asynchronously, it emulates non-blocking IO by spwaning a separate thread to read it.

### Response properties
These are write only and not modifiable after the write of first chunk.

<div class="row">
    <div class="large-6 columns">
        <h5>Status</h5>
        <p>A HTTP Status code for response.</p>
{% capture panel %}
```java
http.setStatus(HttpStatus.NOT_IMPLEMENTED);
```
{% endcapture %}{{ panel | markdownify }}
    </div>
    <div class="large-6 columns">
        <h5>Headers</h5>
        <p>Response headers.</p>
{% capture panel %}
```java
http.setHeader("content-type", "text/javascript; charset=utf-8");
```
{% endcapture %}{{ panel | markdownify }}
    </div>
</div>

### Writing response
`write` accepts a text chunk as `String` and a binary chunk as `ByteBuffer` and writes it to the response body. Each response must be completed by `end` after writing all properties and chunks or even if there is nothing to write. It's the end of the response. In case of text chunk, if there is no specified charset parameter in the content-type response header or `write`, then `ISO-8859-1` is used.

```java
http.write("chunk").end();
```

For convenience, `end` accepts chunk like `write`. The below code is the same with the above one.

```java
http.end("chunk");
```

### Error handling
Any error happening in request-response exchange is propagated to actions added via `errorAction` with `Throwable` in question. Now `Throwable` thrown by the underlying platform are provided directly.

```java
http.errorAction(new Action<Throwable>() {
    @Override
    public void on(Throwable error) {
        // Your logic here
    }
});
```

### End of HTTP exchange
When request is fully read by `read` so `endAction` is fired and response is completed by `end` normally or the underlying connection is aborted abnormally for some reason like network or protocol error, actions added via `closeAction` are executed. It's the end of exchange. After this event, exchange should be not used.

```java
http.closeAction(new VoidAction() {
    @Override
    public void on() {
        // Your logic here
    }
});
```

## ServerWebSocket
A server-side WebSocket. It is given when WebSocket is opened.

### Properties
These are read only and might not be available in some platforms after `closeAction`.

#### URI
A request URI used to connect. It comes from handshake request so doesn't start with `ws` or `wss` protocol. To work with URI parts, use `java.net.URI` or something like that.

```java
URI.create(ws.uri()).getQuery();
```

### Receiving frame
Text frame is passed to `textAction` as `String` and binary frame is passed to `binaryAction` as `ByteBuffer`. It's possible to receive both type of message through a single connection.

```java
ws.textAction(new Action<String>() {
    @Override
    public void on(String data) {
        // Your logic here
    }
})
.binaryAction(new Action<ByteBuffer>() {
    @Override
    public void on(ByteBuffer data) {
        // Your logic here
    }
});
```

### Sending frame
`send` accepts a text frame as `String` and a binary frame as `ByteBuffer` and sends it through the connection. It's possible to send both type of message through a single connection.

```java
ws.send("message");
```

### Closing connection
`close` closes the connection. 

```java
ws.close();
```

### Error handling
Any error happening in this connection is propagated to actions added via `errorAction` with `Throwable` in question. Now `Throwable` thrown by the underlying platform are provided directly.

```java
ws.errorAction(new Action<Throwable>() {
    @Override
    public void on(Throwable error) {
        // Your logic here
    }
});
```

### End of WebSocket
When the connection has been closed for any reason, close event handlers added via `closeAction` are executed. It's the end of WebSocket. After this event, WebSocket should be not used.
 
```java
ws.closeAction(new VoidAction() {
    @Override
    public void on() {
        // Your logic here
    }
});
```
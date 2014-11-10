---
layout: project
title: Vibe Java Platform Reference
---

<h1>Reference</h1>

---

**Table of Contents**

* [Bridge](#bridge)
    * [Installation](#installation)
        * [Atmosphere 2](#atmosphere-2)
        * [Java WebSocket API 1](#java-websocket-api-1)
        * [Netty 4](#netty-4)
        * [Play 2](#play-2)
        * [Servlet 3](#servlet-3)
        * [Vert.x 2](#vert.x-2)
    * [Writing Bridges](#writing-bridges)
* [Application](#application)
    * [ServerHttpExchange](#serverhttpexchange)
    * [ServerWebSocket](#serverwebsocket)
        
---

## Bridge
Bridge is a module used to install your application on your desired platform.

### Installation
Vibe Java Platform requires Java 7 and is distributed through Maven Central. Generally speaking, installing an application is to feed one or both of `ServerHttpExchange` and `ServerWebSocket` into the application using the bridge for the specific platform.

#### Atmosphere 2
The [Atmosphere 2](https://github.com/Atmosphere/atmosphere/) makes the application run on most Servlet containers that support the Servlet Specification 2.3.

**Note**

* Requires Atmosphere 2.2 and later.
* Servlet less than version 3.1 can't read request asynchronously.
* Using Servlet 3 and Java WebSocket 1 together is unintuitive and inconvenient unless handling vendor-specific code, using `static` keyword or adopting Contexts and Dependency Injection (CDI). Since Atmosphere 2 handles vendor-specific things that is picky to maintain, we uses it as a platform.

##### Dependency
Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-atmosphere2</artifactId>
        <version>3.0.0-Alpha4</version>
    </dependency>
</dependencies>
```

##### [Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/atmosphere2)
To bridge application and Atmosphere, you should register a servlet of `VibeAtmosphereServlet` overriding `httpAction` and `wsAction`. When registering servlet, you must set `asyncSupported` to `true` and set a init param, `org.atmosphere.cpr.AtmosphereInterceptor.disableDefaults`, to `true`.

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

With CDI, the following usage is also available.

```java
@WebServlet(
    value = "/vibe", 
    asyncSupported = true, 
    initParams = {
        @WebInitParam(name = "org.atmosphere.cpr.AtmosphereInterceptor.disableDefaults", value = "true") 
    }
)
public class MyVibeAtmosphereServlet extends VibeAtmosphereServlet {
    @Inject
    // Your application
    private org.atmosphere.vibe.server.Server server;
    
    @Override
    protected Action<ServerHttpExchange> httpAction() {
        return server.httpAction();
    }
    
    @Override
    protected Action<ServerWebSocket> wsAction() {
        return server.wsAction();
    }
}
```

#### Java WebSocket API 1
[Java WebSocket API 1](http://docs.oracle.com/javaee/7/tutorial/doc/websocket.htm#GKJIQ5) (JWA) from Java EE 7. There is no HTTP part in WebSocket API and it exists as a separate specification. To deal with HTTP resources, use Atmosphere or Servlet. 

##### Dependency
Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-jwa1</artifactId>
        <version>3.0.0-Alpha4</version>
    </dependency>
</dependencies>
```

##### [Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/jwa1)
To bridge application and JWA, you should register a endpoint of `VibeServerEndpoint` overriding `wsAction`.

```java
public class Bootstrap implements ServerApplicationConfig {
    @Override
    public Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> set) {
        // Your application
        final org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
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
        return Collections.singleton(config);
    }

    @Override
    public Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> set) {
        return Collections.emptySet();
    }
}
```

With CDI, the following usage is also available. Especially, this usage matches well with Servlet.

```java
@ServerEndpoint("/vibe")
public class MyVibeServerEndpoint extends VibeServerEndpoint {
    @Inject
    // Your application
    private org.atmosphere.vibe.server.Server server;
    
    @Override
    protected Action<ServerWebSocket> wsAction() {
        return server.wsAction();
    }
}
```

#### Netty 4
[Netty 4](http://netty.io/) is an asynchronous event-driven network application framework.

##### Dependency
Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-netty4</artifactId>
        <version>3.0.0-Alpha4</version>
    </dependency>
</dependencies>
```

##### [Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/netty4)
To bridge application and Netty, you should register a handler of `VibeServerCodec` overriding `httpAction` and `wsAction`. When configuring handlers, you must add `HttpServerCodec` in front of the handler.

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

#### Play 2
[Play framework 2](http://www.playframework.org/) is a high velocity web framework for Java and Scala.

**Note**

* Play can't read request asynchronously.
* Play can't send and receive text frame and binary frame together via a WebSocket connection.
* However, with Scala API, the above issues may be solved. [vibe-java-platform#4](https://github.com/vibe-project/vibe-java-platform/issues/4) 

##### Dependency
Add the following dependency to your `build.sbt` or include it on your classpath manually.

```scala
libraryDependencies ++= Seq(
  "org.atmosphere" % "vibe-platform-server-play2" % "3.0.0-Alpha4"
)
```

##### [Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/play2)
Write entry point for HTTP exchange and WebSocket extending `Controller`.

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

##### Mapping
Play doesn't allow to share URI between HTTP and WebSocket entry points. Instead of `routes`, write `Global.scala` in the default package and override `onRouteRequest`. It's not easy to do that in Java, if any. Note that this uses internal API that has broken in minor release and even in patch release. I've confirmed the following code works in `2.2.2` and `2.3.2`.

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

#### Servlet 3
[Java Servlet 3.0](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 6 and [Java Servlet 3.1](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 7. There is no WebSocket part in Servlet API and it exists as a separate specification. To use WebSocket with Servlet 3, use Atmosphere or Java WebSocket API.

**Note**

* Servlet less than version 3.1 can't read request asynchronously.

##### Dependency
Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-servlet3</artifactId>
        <version>3.0.0-Alpha4</version>
    </dependency>
</dependencies>
```

##### [Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/servlet3)
To bridge application and Servlet, you should register a servlet of `VibeServlet` overriding `httpAction`. When registering servlet, you must set `asyncSupported` to `true`.

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

With CDI, the following usage is also available. Especially, this usage matches well with Java WebSocket API.

```java
@WebServlet(value = "/vibe", asyncSupported = true)
public class MyVibeServlet extends VibeServlet {
    @Inject
    // Your application
    private org.atmosphere.vibe.server.Server server;
    
    @Override
    protected Action<ServerHttpExchange> httpAction() {
        return server.httpAction();
    }
}
```

#### Vert.x 2
The [Vert.x 2](http://vertx.io/) is a lightweight, high performance application platform for the JVM 

##### Dependency
Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-vertx2</artifactId>
        <version>3.0.0-Alpha4</version>
    </dependency>
</dependencies>
```

##### [Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/vertx2)
To bridge application and Vert.x, just wrap Vert.x's `HttpServerRequest` and `ServerWebSocket` in `VertxServerHttpExchange` and `VertxServerWebSocket` respectively and pass them to application. But, it's not expected to wrap already manipulated resources. 

```java
public class Bootstrap extends Verticle {
    @Override
    public void start() {
        // Your application
        final org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
        HttpServer httpServer = vertx.createHttpServer();
        httpServer.requestHandler(new Handler<HttpServerRequest>() {
            @Override
            public void handle(HttpServerRequest req) {
                if (req.path().equals("/vibe")) {
                    server.httpAction().on(new VertxServerHttpExchange(req));
                }
            }
        });
        httpServer.websocketHandler(new Handler<org.vertx.java.core.http.ServerWebSocket>() {
            @Override
            public void handle(org.vertx.java.core.http.ServerWebSocket socket) {
                if (socket.path().equals("/vibe")) {
                    server.wsAction().on(new VertxServerWebSocket(socket));
                }
            }
        });
        httpServer.listen(8080);
    }
}
```

### Writing Bridges
By the way, the current API has not yet had enough to be regarded as stable as it's in Alpha phase so it may be changed not maintaining backward compatibility in any time later. If you don't care that, see the existing implementations.

---

## Application
Application is a collection of actions that consumes `ServerHttpExchange` and `ServerWebSocket` produced by bridge. Therefore an application being able to run via Vibe Java Platform should expose actions to allow bridge to deliver `ServerHttpExchange` and `ServerWebSocket`.

```java
public class App {
    private Action<ServerHttpExchange> httpAction = new Action<ServerHttpExchange>() {
        @Override
        public void on(ServerHttpExchange http) {
            // Your logic here
        }
    };
    private Action<ServerWebSocket> wsAction = new Action<ServerWebSocket>() {
        @Override
        public void on(ServerWebSocket ws) {
            // Your logic here
        }
    };
    
    public Action<ServerHttpExchange> httpAction() {
        return httpAction;
    }
    
    public Action<ServerWebSocket> wsAction() {
        return wsAction;
    }
}
```

### ServerHttpExchange
A server-side HTTP request-response exchange. It is given when request headers are written.

#### Request properties
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

#### Reading request
`read` initiates reading the request body and read chunk is passed to `chunkAction`. Whether to read as text or binary is determined by the content-type header in conformance with [RFC 2616](http://www.w3.org/Protocols/rfc2616/rfc2616-sec7.html#sec7.2.1). If the content-type header starts with `text/`, chunk will be read as text and passed as `String`. If not, chunk will be read as binary and passed as `ByteBuffer`. Finally, the request is fully read. Then, `endAction` is fired which is the end of the request.

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

In cases where the response has already completed or the underlying platform can't read request body asynchronously, `read` should be called after adding `chunk` and `body` event handlers.  

#### Response properties
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

#### Writing response
`write` accepts a text chunk as `String` and a binary chunk as `ByteBuffer` and writes it to the response body. Each response must be completed by `end` after writing all properties and chunks or even if there is nothing to write. It's the end of the response. 

```java
http.write("chunk").end();
```

For convenience, `end` accepts chunk like `write`. The below code is the same with the above one.

```java
http.end("chunk");
```

#### Error handling
Any error happening in request-response exchange is propagated to actions added via `errorAction` with `Throwable` in question. Now `Throwable` thrown by the underlying platform are provided directly.

```java
http.errorAction(new Action<Throwable>() {
    @Override
    public void on(Throwable error) {
        // Your logic here
    }
});
```

#### End of HTTP exchange
When request is fully read by `read` so `endAction` is fired and response is completed by `end` normally or the underlying connection is aborted abnormally for some reason like error, actions added via `closeAction` are executed. It's the end of exchange. After this event, exchange should be not used.

```java
http.closeAction(new VoidAction() {
    @Override
    public void on() {
        // Your logic here
    }
});
```

### ServerWebSocket
A server-side WebSocket. It is given when WebSocket is opened.

#### Properties
These are read only and might not be available in some platforms after `closeAction`.

##### URI
A request URI used to connect. To work with URI parts, use `java.net.URI` or something like that.

```java
URI.create(ws.uri()).getQuery();
```

#### Receiving frame
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

#### Sending frame
`send` accepts a text frame as `String` and a binary frame as `ByteBuffer` and sends it through the connection. It's possible to send both type of message through a single connection.

```java
ws.send("message");
```

#### Closing connection
`close` closes the connection. 

```java
ws.close();
```

#### Error handling
Any error happening in this connection is propagated to actions added via `errorAction` with `Throwable` in question. Now `Throwable` thrown by the underlying platform are provided directly.

```java
ws.errorAction(new Action<Throwable>() {
    @Override
    public void on(Throwable error) {
        // Your logic here
    }
});
```

#### End of WebSocket
When the connection has been closed for any reason, close event handlers added via `closeAction` are executed. It's the end of WebSocket. After this event, WebSocket should be not used.
 
```java
ws.closeAction(new VoidAction() {
    @Override
    public void on() {
        // Your logic here
    }
});
```
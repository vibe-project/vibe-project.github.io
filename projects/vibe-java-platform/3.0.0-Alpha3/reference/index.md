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
        * [Vert.x 2](#vert.x-2)
        * [Servlet 3](#servlet-3)
        * [Java WebSocket API 1](#java-websocket-api-1)
        * [Play 2](#play-2)
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

* Requires Servlet 3.0 container.
* Requires Atmosphere 2.2 and later.
* If the underlying Servlet container is 3.0, it can't read request asynchronously.
* Using Servlet 3 and Java WebSocket 1 together is unintuitive and inconvenient unless handling vendor-specific code. Since Atmosphere 2 handles vendor-specific things which is picky to maintain, we uses it as a platform but in the future it might be replaced with new modules dealing with their vendor-specific code directly, e.g. vibe-platform-server-jetty9.

##### Dependency
Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-atmosphere2</artifactId>
        <version>3.0.0-Alpha3</version>
    </dependency>
</dependencies>
```

##### [Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/atmosphere2)
Installation will be done once the servlet container starts.

```java
import org.atmosphere.vibe.platform.Action;
import org.atmosphere.vibe.platform.server.atmosphere2.AtmosphereBridge;

import javax.servlet.*;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Your application
        org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
        new AtmosphereBridge(event.getServletContext(), "/vibe").httpAction(server.httpAction()).websocketAction(server.websocketAction());
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
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
        <version>3.0.0-Alpha3</version>
    </dependency>
</dependencies>
```

##### [Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/vertx2)
Installation will be done once the verticle starts.

```java
import org.atmosphere.vibe.platform.Action;
import org.atmosphere.vibe.platform.server.vertx2.VertxBridge;

import org.vertx.java.core.Handler;
import org.vertx.java.core.http.*;
import org.vertx.java.platform.Verticle;

public class Bootstrap extends Verticle {
    @Override
    public void start() {
        // Your application
        org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
        HttpServer httpServer = vertx.createHttpServer();
        // Attach request and websocket handler first before installation
        new VertxBridge(httpServer, "/vibe").httpAction(server.httpAction()).websocketAction(server.websocketAction());
        httpServer.listen(8080);
    }
}
```

#### Servlet 3
[Java Servlet 3.0](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 6 and [Java Servlet 3.1](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 7. There is no WebSocket part in Servlet API and it exists as a separate specification. To use WebSocket in a JSR way, use Java WebSocket API in the next section.

**Note**

* If Servlet container is 3.0, it can't read request asynchronously.

##### Dependency

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-servlet3</artifactId>
        <version>3.0.0-Alpha3</version>
    </dependency>
</dependencies>
```

##### [Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/servlet3)

Installation will be done once the servlet container starts.

```java
import org.atmosphere.vibe.platform.Action;
import org.atmosphere.vibe.platfom.server.servlet3.ServletBridge;

import javax.servlet.*;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Your application
        org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
        new ServletBridge(event.getServletContext(), "/vibe").httpAction(server.httpAction());
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

#### Java WebSocket API 1
[Java WebSocket API 1](http://docs.oracle.com/javaee/7/tutorial/doc/websocket.htm#GKJIQ5) (JWA) from Java EE 7. There is no HTTP part in WebSocket API and it exists as a separate specification. To deal with HTTP in a JSR way, use Java Servlet in the previous section. 

##### Dependency

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-jwa1</artifactId>
        <version>3.0.0-Alpha3</version>
    </dependency>
</dependencies>
```

##### [Example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/jwa1)

Installation will be done once the container starts by scanning `ServerApplicationConfig` instance. In case of embedded container, however, it may not scan it and you may have to follow their alternatives.

```java
import org.atmosphere.vibe.platform.Action;
import org.atmosphere.vibe.platfom.server.jwa1.JwaBridge;

import java.util.*;

import javax.websocket.Endpoint;
import javax.websocket.server.*;

public class Bootstrap implements ServerApplicationConfig {
    @Override
    public Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> _) {
        // Your application
        org.atmosphere.vibe.server.Server server = new org.atmosphere.vibe.server.DefaultServer();
        return Collections.singleton(new JwaBridge("/vibe").websocketAction(server.websocketAction()).config());
    }

    @Override
    public Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> scanned) {
        return Collections.emptySet();
    }
}
```

#### Play 2
[Play framework 2](http://www.playframework.org/) is a high velocity web framework for Java and Scala.

**Note**

* Play can't read request asynchronously.

##### Dependency
Add the following dependency to your `build.sbt` or include it on your classpath manually.

```scala
libraryDependencies ++= Seq(
  "org.atmosphere" % "vibe-platform-server-play2" % "3.0.0-Alpha3"
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
                server.websocketAction().on(new PlayServerWebSocket(request, in, out));
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
    private Action<ServerWebSocket> websocketAction = new Action<ServerWebSocket>() {
        @Override
        public void on(ServerWebSocket ws) {
            // Your logic here
        }
    };
    
    public Action<ServerHttpExchange> httpAction() {
        return httpAction;
    }
    public Action<ServerWebSocket> websocketAction() {
        return websocketAction;
    }
}
```

### ServerHttpExchange
It represents a server-side HTTP request-response exchange. It is given when request headers are written.

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

#### End of exchange
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
It represents a server-side WebSocket session. It is given when WebSocket is opened.

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
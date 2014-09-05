---
layout: project
title: Vibe Java Server Platform Reference
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
Vibe Java Server Platform requires Java 7. Generally speaking, installing an application is to feed one or both of `ServerHttpExchange` and `ServerWebSocket` into the application using the bridge for the specific platform.

#### Atmosphere 2
The [Atmosphere 2](https://github.com/Atmosphere/atmosphere/) makes the application run on most servlet containers that support the Servlet Specification 2.3. That being said, Servlet 3.0 containers is required here. With Atmosphere, you can write a traditional Java web application, a war project in Maven.

**Note**

* Using Servlet 3 and Java WebSocket 1 together is unintuitive and inconvenient unless handling vendor-specific code. Since Atmosphere 2 handles vendor-specific things which is picky to maintain, we uses it as a platform but in the future it might be deprecated or replaced with new modules dealing with their vendor-specific code, e.g. vibe-server-platform-jetty9.

##### Dependency
Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-server-platform-atmosphere2</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
</dependencies>
```

##### Bootstrap
Installation will be done once the servlet container starts.

```java
import org.atmosphere.vibe.server.platform.*;
import org.atmosphere.vibe.server.platform.atmosphere2.*;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Your application
        Server server = new DefaultServer();
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
        <artifactId>vibe-server-platform-vertx2</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
</dependencies>
```

##### Bootstrap
Installation will be done once the verticle starts.

```java
import org.atmosphere.vibe.server.platform.*;
import org.atmosphere.vibe.server.platform.vertx2.*;

import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.platform.Verticle;

public class Bootstrap extends Verticle {
    @Override
    public void start() {
        // Your application
        Server server = new DefaultServer();
        HttpServer httpServer = vertx.createHttpServer();
        // Attach request and websocket handler first before installation
        new VertxBridge(httpServer, "/vibe").httpAction(server.httpAction()).websocketAction(server.websocketAction());
        httpServer.listen(8080);
    }
}
```

#### Servlet 3
[Java Servlet 3.0](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 6 and [Java Servlet 3.1](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 7. There is no WebSocket part in Servlet API and it exists as a separate specification. To use WebSocket in a JSR way, use Java WebSocket API in the next section.

##### Dependency

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-server-platform-servlet3</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
</dependencies>
```

##### Bootstrap

Installation will be done once the servlet container starts.

```java
import org.atmosphere.vibe.server.platform.*;
import org.atmosphere.vibe.server.platform.servlet3.*;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Your application
        Server server = new DefaultServer();
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
        <artifactId>vibe-server-platform-jwa1</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
</dependencies>
```

##### Bootstrap

Installation will be done once the container starts by scanning `ServerApplicationConfig` instance. In case of embedded container, however, it may not scan it and you may have to follow their alternatives.

```java
import org.atmosphere.vibe.server.platform.*;
import org.atmosphere.vibe.server.platform.jwa1.*;

import java.util.Collections;
import java.util.Set;

import javax.websocket.Endpoint;
import javax.websocket.server.ServerApplicationConfig;
import javax.websocket.server.ServerEndpointConfig;

public class Bootstrap implements ServerApplicationConfig {
    @Override
    public Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> _) {
        // Your application
        Server server = new DefaultServer();
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

##### Dependency
Add the following dependency to your `build.sbt` or include it on your classpath manually.

```scala
libraryDependencies ++= Seq(
  "org.atmosphere" % "vibe-server-platform-play2" % "3.0.0-Alpha1"
)
```

##### Bootstrap
Write entry point for HTTP exchange and WebSocket extending `Controller`.

```java
import org.atmosphere.vibe.server.platform.*;
import org.atmosphere.vibe.server.platform.play2.*;

import play.libs.F.Promise;
import play.mvc.BodyParser;
import play.mvc.Controller;
import play.mvc.Http.Request;
import play.mvc.Result;
import play.mvc.WebSocket;

public class Bootstrap extends Controller {
    // Your application
    static Server server = new DefaultServer();

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
TODO

---

## Application
Application is a collection of actions that consumes `ServerHttpExchange` and `ServerWebSocket` produced by bridge. Therefore an application being able to run via Vibe Java Server Platform should expose actions to allow bridge to deliver `ServerHttpExchange` and `ServerWebSocket`.

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
It represents a server-side HTTP request-response exchange and is assumed only text data are read and written.

#### Request properties
These are read only.

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
for (String name : http.requestHeaderNames()) {
    String value = http.requestHeader(name);
}
```
{% endcapture %}{{ panel | markdownify }}
    </div>
</div>

#### Reading body
`bodyAction` attaches a body event handler to be called with `Data` wrapping the request body. Note that because only String type is supported as Data now, if body is quite big it will drain memory in an instant.

```java
http.bodyAction(new Action<Data>() {
    @Override
    public void on(Data data) {
        String body = data.as(String.class);
        // Your logic here
    }
});
```

#### Response properties
These are write only. In accordance with HTTP spec, it's not possible to set value after the write of first chunk.

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
http.setResponseHeader("content-type", "text/javascript; charset=utf-8");
```
{% endcapture %}{{ panel | markdownify }}
    </div>
</div>

#### Writing chunk
`write` sends a chunk to the response body.

```java
http.write("chunk");
```

#### Ending response
`close` ends the response. Each exchange must be finished with this method when done.

```java
http.close();
```

On response close, close event handlers added via `closeAction` are executed.

```java
http.closeAction(new VoidAction() {
    @Override
    public void on() {
        // Your logic here
    }
});
```

### ServerWebSocket
It represents a server-side WebSocket session and is assumed only text messages are exchanged now.

#### Properties
These are read only.

##### URI
A request URI used to connect. To work with URI parts, use `java.net.URI` or something like that.

```java
URI.create(ws.uri()).getQuery();
```

#### Receiving message
Message event handlers attached via `messageAction` are called with `Data` wrapping the WebSocket message. Note that because only String type is supported as Data now, if body is quite big it will drain memory in an instant.

```java
ws.messageAction(new Action<Data>() {
    @Override
    public void on(Data data) {
        String message = data.as(String.class);
        // Your logic here
    }
});
```

#### Sending message
`send` sends a text message through the connection.

```java
ws.send("message");
```

#### Closing connection
`close` ends the connection.

```java
ws.close();
```

On connection close, close event handlers added via `closeAction` are executed.

```java
ws.closeAction(new VoidAction() {
    @Override
    public void on() {
        // Your logic here
    }
});
```
---
layout: project
title: Vibe Java Server Reference
---

<h1>Reference</h1>

---

**Table of Contents**

* [Modules](#modules)
* [Bridge](#bridge)
    * [Installation](#installation)
        * [Atmosphere 2](#atmosphere-2)
        * [Vert.x 2](#vert.x-2)
        * [Servlet 3](#servlet-3)
        * [Java WebSocket API 1](#java-websocket-api-1)
        * [Play 2](#play-2)
    * [Writing Bridges](#writing-bridges)
* [Application](#application)
    * [ServerHttpExchange](#serverHttpExchange)
    * [ServerWebSocket](#serverWebSocket)

---

## Modules
TODO

---

## Bridge
Bridge is a module used to install your application on your desired platform.

### Installation
With the following bridges, you can install your application with minimal effort. If the corresponding bridge is not listed, you need to write your own one. [Writing a bridge](#writing-bridges) is easier than you think.

#### Atmosphere 2
The [Atmosphere 2](https://github.com/atmosphere/atmosphere/) makes the application run on most servlet containers that support the Servlet Specification 2.3. That being said, Servlet 3.0 containers is required here. With Atmosphere, you can write a traditional Java web application, a war project in Maven.

**Note**

* Using Servlet 3 and Java WebSocket 1 together is unintuitive and inconvenient unless handling vendor-specific code. Since Atmosphere 2 handles vendor-specific things which is picky to maintain, we uses it as a platform but in the future it might be deprecated or replaced with new modules dealing with their vendor-specific code, e.g. vibe-server-platform-jetty9.

##### Dependency
Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-atmosphere2</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-runtime</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
</dependencies>
```

##### Bootstrap
Installation will be done once the servlet container starts.

```java
// TODO vibe imports

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        Server server = new DefaultServer();
        // server.socketAction(socket -> {/* Your logic here */});

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
        <artifactId>vibe-vertx2</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-runtime</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
</dependencies>
```

##### Bootstrap
Installation will be done once the verticle starts.

```java
// TODO vibe imports

import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServer;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.platform.Verticle;

public class Bootstrap extends Verticle {
    @Override
    public void start() {
        Server server = new DefaultServer();
        // server.socketAction(socket -> {/* Your logic here */});

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
        <artifactId>vibe-servlet3</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-runtime</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
</dependencies>
```

##### Bootstrap

Installation will be done once the servlet container starts.

```java
// TODO vibe imports

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        Server server = new DefaultServer();
        // server.socketAction(socket -> {/* Your logic here */});
        
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
        <artifactId>vibe-jwa1</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-runtime</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
</dependencies>
```

##### Bootstrap

Installation will be done once the container starts by scanning `ServerApplicationConfig` instance. In case of embedded container, however, it may not scan it and you may have to follow their alternatives.

```java
// TODO vibe imports

import java.util.Collections;
import java.util.Set;

import javax.websocket.Endpoint;
import javax.websocket.server.ServerApplicationConfig;
import javax.websocket.server.ServerEndpointConfig;

public class Bootstrap implements ServerApplicationConfig {
    @Override
    public Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> _) {
        Server server = new DefaultServer();
        // server.socketAction(socket -> {/* Your logic here */});

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
  "org.atmosphere" % "vibe-runtime" % "3.0.0-Alpha1",
  "org.atmosphere" % "vibe-play2" % "3.0.0-Alpha1"
)
```

##### Bootstrap
Write entry point for HTTP exchange and WebSocket extending `Controller`.

```java
// TODO vibe imports

import play.libs.F.Promise;
import play.mvc.BodyParser;
import play.mvc.Controller;
import play.mvc.Http.Request;
import play.mvc.Result;
import play.mvc.WebSocket;

public class Bootstrap extends Controller {
    static Server server = new DefaultServer();
    static {
        // server.socketAction(socket -> {/* Your logic here */});
    }

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
Play doesn't allow to share URI between HTTP and WebSocket entry points. Instead of `routes`, write `Global.scala` in the default package and override `onRouteRequest`. It's not easy to do that in Java, if any. Note that this uses internal API that has broken in minor release and even in patch release. I've confirmed the following code works in `2.2.2`.

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
TODO

 
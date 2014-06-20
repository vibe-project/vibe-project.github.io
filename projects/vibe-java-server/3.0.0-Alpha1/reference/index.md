---
layout: project
title: Vibe Java Server Reference
---

<h1>Reference</h1>

---

**Table of Contents**

1. [Introduction](#toc_0)
    1. [Features](#toc_1)
    1. [Versions](#toc_2)
    1. [License](#toc_3)
1. [Quick Start](#toc_4)
1. [Installation](#toc_5)
    1. [Atmosphere 2](#toc_6)
    1. [Vert.x 2](#toc_9)
    1. [Servlet 3](#toc_12)
    1. [Java WebSocket API 1](#toc_15)
    1. [Play 2](#toc_18)
1. [Server](#toc_22)
    1. [Handling Socket](#toc_23)
    1. [Selecting Sockets](#toc_24)
    1. [Writing Sentence](#toc_28)
1. [Socket](#toc_29)
    1. [Life Cycle](#toc_30)
    1. [Properties](#toc_31)
    1. [Tagging](#toc_32)
    1. [Sending and Receiving Events](#toc_33)
    1. [Sending and Receiving Replyable Event](#toc_34)
1. [Integration](#toc_35)
    1. [I/O Platform](#toc_36)
    1. [Dependency Injection Framework](#toc_37)
    1. [Message Oriented Middleware](#toc_38)
1. [Examples](#toc_39)
    
---

## Introduction
The Vibe Java Server is a versatile and flexible Java server. It provides an application model and pattern for modern Java based enterprise web applications by implementing Vibe protocol, which is based on I/O abstraction layer designed to run application on every platforms and frameworks on Java Virtual Machine like Servlet and Netty.

### Features
* Based on I/O abstraction layer to run anywhere.
* Only Server and Socket.
* Select socket and do something
* Shared nothing architecture for easy scaling.

### Versions
The mapping between the specifications and the respective Vibe Java Server versions is:

| Version | Java | Vibe Protocol |
|---|---|---|
| 3 | 7 | 3.0 |

TODO explain platform module and its support once module structure is determine.

### License
Licensed under the Apache License 2.0.

---

## Quick Start
Here is how to create echo server running on Vert.x.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Server**

Add the following dependencies to dependency management system or include them on classpath manually:

```groovy
dependencies {
  compile 'org.atmosphere:vibe-vertx2:3.0.0-Alpha1'
  compile 'org.atmosphere:vibe-runtime:3.0.0-Alpha1'
  compile('io.vertx:vertx-core:2.0.2-final') {
    exclude group: 'com.fasterxml.jackson.core'
  }
  compile 'io.vertx:vertx-platform:2.0.2-final'
}
```

Once you've set up your build, you'll be able to write `Application.java`:

```java
// TODO vibe imports

import java.io.IOException;

import org.vertx.java.core.*;
import org.vertx.java.core.http.*;

public class Application {
  public static void main(String[] args) throws IOException {
    final Server server = new DefaultServer();
    server.socketAction(new Action<Socket>() {
      @Override
      public void on(final Socket socket) {
        socket.on("echo", new Action<Object>() {
          @Override
          public void on(Object data) {
            socket.send("echo", data);
          }
        });
      }
    });

    Vertx vertx = VertxFactory.newVertx();
    vertx.createHttpServer().requestHandler(new Handler<HttpServerRequest>() {
      @Override
      public void handle(HttpServerRequest req) {
        server.httpAction().on(new VertxServerHttpExchange(req));
      }
    })
    .websocketHandler(new Handler<ServerWebSocket>() {
      @Override
      public void handle(ServerWebSocket ws) {
        server.websocketAction().on(new VertxServerWebSocket(ws));
      }
    })
    .listen(8000);

    System.in.read(); // Block the main thread
  }
}
```

With the help of debug, you can deal with the opened socket in pseudo interactive mode.
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Client**

You can use:

* [Reference implementation]({{ site.baseurl }}/projects/vibe-protocol/3.0.0-Alpha1/reference/#toc_5)
* [Vibe JavaScript Client](http://localhost:4000/projects/vibe-javascript-client/3.0.0-Alpha1/reference/#toc_4)
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

---

## Installation
How to install and run varies for what your platform or framework is.

### Atmosphere 2
The [Atmosphere 2](https://github.com/atmosphere/atmosphere/) makes the application run on most servlet containers that support the Servlet Specification 2.3. That being said, Servlet 3.0 containers is required here. With Atmosphere, you can write a traditional Java web application, a war project in Maven.

**Note**

* Using Servlet 3 and Java WebSocket 1 together is unintuitive and inconvenient unless handling vendor-specific code. Since Atmosphere 2 handles vendor-specific things which is picky to maintain, Vibe Java Server uses it as a platform but in the future it might be deprecated or replaced with new modules dealing with their vendor-specific code, e.g. vibe-tomcat8 and vibe-jetty9.

#### Dependency
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

#### Bootstrap
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

### Vert.x 2
The [Vert.x 2](http://vertx.io/) is an event driven application framework.

#### Dependency
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

#### Bootstrap
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

### Servlet 3
[Java Servlet 3.0](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 6 and [Java Servlet 3.1](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 7. There is no WebSocket part in Servlet API and it exists as a separate specification. To use WebSocket in a JSR way, use Java WebSocket API in the next section.

#### Dependency

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

#### Bootstrap

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

### Java WebSocket API 1
[Java WebSocket API 1](http://docs.oracle.com/javaee/7/tutorial/doc/websocket.htm#GKJIQ5) (JWA) from Java EE 7. There is no HTTP part in WebSocket API and it exists as a separate specification. To deal with HTTP in a JSR way, use Java Servlet in the previous section. 

#### Dependency

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

#### Bootstrap

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

### Play 2
[Play framework 2](http://www.playframework.org/) is a high productivity Java and Scala web application framework.

#### Dependency
Add the following dependency to your `build.sbt` or include it on your classpath manually.

```scala
libraryDependencies ++= Seq(
  "org.atmosphere" % "vibe-runtime" % "3.0.0-Alpha1",
  "org.atmosphere" % "vibe-play2" % "3.0.0-Alpha1"
)
```

#### Bootstrap
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

#### Mapping
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
---

## Server
Server is a vibe application in a nutshell producing and managing socket consuming HTTP exchange and WebSocket.

### Handling Socket
When a socket is opened, actions added via `socketAction(Action<Socket> action)` are executed with it. It's allowed to add several actions before and after installation, so you don't need to centralize all your code to one class.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Java 7**

```java
server.socketAction(new Action<Socket>() {
    @Override
    public void on(Socket socket) {
        // Your logic here
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Java 8**

```java
server.socketAction(socket -> {
    // Your logic here
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Selecting Sockets
It's a common use case to select some sockets and do something with them like dealing with persistence entities or HTML elements. When a socket has been closed, it is evicted from the server immediately, so socket being passed to action is always in the open state where I/O operations are available.

#### All
`all(Action<Socket> action)` executes the given action finding all of the socket in this server.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Java 7**

```java
server.all(new Action<Socket>() {
    @Override
    public void on(Socket socket) {
        // Your logic here
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Java 8**

```java
server.all(socket -> {
    // Your logic here
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

#### By Id
Every socket has a unique id. `byId(String id, Action<Socket> action)` finds socket by id and executes the given action only once or not if no socket is found.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Java 7**

```java
server.byId("59f3e826-3684-4e0e-813d-8394ac7fb7c0", new Action<Socket>() {
    @Override
    public void on(Socket socket) {
        // Your logic here
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Java 8**

```java
server.byId("59f3e826-3684-4e0e-813d-8394ac7fb7c0", socket -> {
    // Your logic here
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

#### By Tag
A socket may have several tags and a tag may have several sockets like many-to-many relationship. `byTag(String[] names, Action<Socket> action)` finds socket accepting one or more tag names and executes the given action.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Java 7**

```java
server.byTag("room#201", new Action<Socket>() {
    @Override
    public void on(Socket socket) {
        // Your logic here
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Java 8**

```java
server.byTag("room#201", socket -> {
    // Your logic here
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Writing Sentence
`Sentence` is a fluent interface to deal with a group of sockets. Finder methods return a sentence when being called without action. Use of sentence is preferred to that of action if the goal is same. Because, it enables to write one-liner action and uses an action implementing `Serializable` in execution, which is picky to use in anonymous class and typically needed in clustering.

```java
server.all().send("foo", "bar");
```
```java
server.byTag("room#201", "room#301").send("message", "time to say goodbye").close();
```

---

## Socket
Socket is a connectivity between the two vibe endpoints where event occurs.

### Life Cycle
Socket can be in opened state where I/O operations are possible or closed state where `close` event fires and I/O operations are not possible but it is always expected in the opened state. In other words, do not hold a reference on socket unless the reference shares the same life cycle of socket. It makes things complicated since it is stateful and also may result in a problem in clustered environment.

**Note**

* To access socket always create a socket action and pass it to server.
* Otherwise do something on socket's `close` event.

### Properties
These are read only.

<div class="row">
<div class="large-4 columns">
{% capture panel %}
#### Id
A unique identifier in the form of UUID generated by client by default.

```java
socket.id();
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns">
{% capture panel %}
#### URI
A URI used to connect. To work with URI parts, use `java.net.URI` or something like that.

```java
URI.create(socket.uri()).getQuery();
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns">
{% capture panel %}
#### Tags
A set of tag names. It's modifiable, deal with it as a plain set.

```java
Set<String> tags = socket.tags();
tags.add("account#flowersinthesand");
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Tagging
As `Socket` is a just connectivity, id is not suibtable for handling a specific entity in the real world. For example, when an user signs in using multiple devices, if someone sends a message, it should be delivered to all devices where the user signed in. To do that, using id is annoying and error-prone.

That's why tag is introduced. A tag is used to point to a group of sockets like class attribute in HTML. Tag set is managed only by server and unknown to client. `tag(String... names)`/`untag(String... names)` attcahes/detaches given names of tags to/from a socket.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Tagging**

```java
server.socketAction(new Action<Socket>() {
    @Override
    public void on(final Socket socket) {
        socket.tag(Uris.parse(socket.uri()).param("username"));
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Using tag**

```java
public class EntityListener {
    @Inject
    Server server;
    
    @PostUpdate
    public void notifyAccount(Account account) {
        server.byTag(account.username()).send("account:update", account);
    }
}
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Sending and Receiving Events
`on(String event, Action<T> action)` attaches an event handler. The `close` event is the only reserved event, which fires when a socket has been clsoed. In receiving events, the allowed Java types, `T`, for data are corresponding to JSON types:

| Number | String | Boolean | Array | Object | null |
|---|---|---|---|---|---|
|`Integer` or `Double` | `String` | `Boolean` | `List<T>` | `Map<String, T>` | `null` or `Void` |

`send(String event)` and `send(String event, Object data)` sends an event with or without data, respectively. Unlike when receiving event, when sending event you can use any type of data and it will be internally stringified by Jackson. However, don't rely on detail features of Jackson too much, e.g. use of annotations. There is no restriction on event name but to avoid confusion don't use `connecting`, `waiting`, `open` and `close`, which are reserved event in Vibe JavaScript Client.

The client sends events and the server echoes back to the client.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Server**

```java
server.socketAction(new Action<Socket>() {
    @Override
    public void on(final Socket socket) {
        socket.on("echo", new Action<Object>() {
            @Override
            public void on(Object data) {
                System.out.println(data);
                socket.send("echo", data);
            }
        });
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
var client = require("vibe-protocol/lib/client");
client.open("http://localhost:8000/vibe", {transport: "ws"})
.on("open", function() {
    this.send("echo", Math.PI)
    .send("echo", "pi")
    .send("echo", {"p": "i"})
    .send("echo", ["p", "i"]);
})
.on("echo", function(data) {
    console.log(data);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

The server sends events and the client echoes back to the server.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Server**

```java
server.socketAction(new Action<Socket>() {
    @Override
    public void on(final Socket socket) {
        socket.on("echo", new Action<Object>() {
            @Override
            public void on(Object data) {
                System.out.println(data);
            }
        })
        .send("echo", Math.PI)
        .send("ehco", "pi")
        .send("echo", new HashMap<String, String>() { { put("p", "i"); } })
        .send("echo", Arrays.asList(new String[] {"p", "i"}));
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
var client = require("vibe-protocol/lib/client");
client.open("http://localhost:8000/vibe", {transport: "ws"})
.on("echo", function(data) {
    console.log(data);
    this.send("echo", data);
})
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Sending and Receiving Replyable Event
Through replayable event, you can receive data in sending event by using overloaded signatures of `send(String event, Object data, Action<T> resolved)` and `send(String event, Object data, Action<T> resolved, Action<U> rejected)` where allowed data types are the same with in reciving event and send data in receiving event by using `Reply` as data type in an asynchrnous manner like Remote Procedure Call (RPC) or controller from MVC model.

**Note**

* Do not mingle repliable event and non-repliable event under the same event. Java is a static typed language so it's bad practice.
* Beforehand determine whether to use rejected callback or not to avoid writing unnecessary rejected callbacks.

The client sends replyable events and the server executes callbacks with event data.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Server**

```java
server.socketAction(new Action<Socket>() {
    @Override
    public void on(final Socket socket) {
        socket.on("account:find", new Action<Reply<String>>() {
            @Override
            public void on(Reply<String> reply) {
                String id = reply.data();
                System.out.println(id);
                try {
                    reply.resolve(Account.find.byId(id));
                } catch(EntityNotFoundException e) {
                    reply.reject("¯\(°_o)/¯");
                }
            }
        });
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
var client = require("vibe-protocol/lib/client");
client.open("http://localhost:8000/vibe", {transport: "ws"})
.on("open", function(data) {
    this.send("account:find", "flowersinthesand", function(data) {
        console.log("resolved with " + data);
    }, function(data) {
        console.log("rejected with " + data);
    })
    .send("account:find", "flowersits", function(data) {
        console.log("resolved with " + data);
    }, function(data) {
        console.log("rejected with " + data);
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

The server sends replyable events and the client executes callbacks with event data.

<div class="row">
<div class="large-7 columns">
{% capture panel %}
**Server**

```java
server.socketAction(new Action<Socket>() {
    @Override
    public void on(final Socket socket) {
        socket.send("account:find", "flowersinthesand", new Action<Map<String, Object>>() {
            @Override
            public void on(Map<String, Object> data) {
                System.out.println("resolved with " + data);
            }
        }, new Action<String>() {
            @Override
            public void on(String data) {
                System.out.println("rejected with " + data);
            }
        })
        .send("account:find", "flowersits", new Action<Map<String, Object>>() {
            @Override
            public void on(Map<String, Object> data) {
                System.out.println("resolved with " + data);
            }
        }, new Action<String>() {
            @Override
            public void on(String data) {
                System.out.println("rejected with " + data);
            }
        });
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-5 columns">
{% capture panel %}
**Client**

```javascript
var client = require("vibe-protocol/lib/client");
client.open("http://localhost:8000/vibe", {transport: "ws"})
.on("account:find", function(id, reply) {
    console.log(id);
    if (id === "flowersinthesand") {
        reply.resolve({name: "Donghwan Kim"});
    } else {
        reply.reject("¯\(°_o)/¯");
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

---

## Integration
Here is how to integrate Vibe Java Server with awesome technologies.

### I/O Platform
As covered in installation section, installing Vibe Java Server on the specific platform is simply to create `Server` and have it consume HTTP exchange and WebSocket produced by the specific platform. Here I/O Platform stands for full-stack application framework like Play and Spring, micro framework like Grizzly and Spark and raw server like Servlet and Netty.

If your favorite platform is not supported, all you need to do is to implement `ServerHttpExchange` and `ServerWebSocket` according to the platform and pass them to `Server`.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
Typical controller.

```java
@Component
public class Controller {
    @Inject
    private Server server;
    
    @Init
    public void post() {
        server.socketAction(new Action<Socket>() {
            @Override
            public void on(Socket socket) {
                // Your logic here
            }
        });
    }
    
    @HttpAction("/vibe")
    public void onHttpExchange(HttpRequest req, HttpResponse res) {
        server.httpAction().on(new BahServerHttpExchange(req, res));
    }
    
    @WebSocketAction("/vibe")
    public void onWebSocket(WebSocket ws) {
        server.websocketAction().on(new BahServerWebSocket(ws));
    }
}
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
What you need to write.

```java
public class BahServerHttpExchange implements ServerHttpExchange {
    private final HttpRequest req;
    private final HttpResponse res;
    
    public BahServerHttpExchange(HttpRequest req, HttpResponse res) {
        this.req = req;
        this.res = res;
    }
    
    // Your implementation here
}
```
```java
public class BahServerWebSocket implements ServerWebSocket {
    private final WebSocket ws;
    
    public BahServerWebSocket(WebSocket ws) {
        this.ws = ws;
    }
    
    // Your implementation here
}
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Dependency Injection Framework
With the help of Dependency Injection (DI) framework like Spring and Guice, you can inject Server wherever you need like the following cases:

<div class="row">
<div class="large-3 medium-6 columns">
{% capture panel %}
Making Server as component.

```java
@Configuration
public class Config {
  @Bean
  public Server server() {
    return new DefaultServer();
  }
}
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-3 medium-6 columns">
{% capture panel %}
Integrating with I/O platform.

```java
@Component
public class Feeder {
  @Autowired
  private Server server;

  @OnHttpExchange
  public void http(HttpExchange h) {
    server.httpAction()
    .on(new MyServerHttpExchange(h));
  }

  @OnWebSocket
  public void ws(WebSocket ws) {
    server.websocketAction()
    .on(new MyServerWebSocket(ws));
  }
}
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-3 medium-6 columns">
{% capture panel %}
Handling socket.

```java
@Component
public class Controller {
  @Autowired
  private Server server;
  
  @PostConstruct
  public void handle() {
    server.socketAction(
      new Action<Socket>() {
      @Override
      public void on(Socket socket) {
        socket.tag("tag");
      }
    });
  }
}
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-3 medium-6 columns">
{% capture panel %}
Sending event.

```java
@Component
public class Ticker {
  @Autowired
  private Server server;

  @Scheduled(fixedRate = 1000)
  public void tick() {
    server.byTag("tag")
    .send("t", currentTimeMillis());
  }
}
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>



### Message Oriented Middleware

All of the Message Oriented Middleware (MOM) supporting publish and subscribe model like JMS and Hazelcast can be used to cluster multiple vibe applications by using `ClusteredServer`.

`ClusteredServer` intercepts a call to `all`, `byId` and `byTag`, converts the call into a message and pass the message to actions added via `publishAction(Action<Map<String,Object>> action)` which is supposed to publish message to all nodes including the one issued in cluster with the message. If one of node receives a message, it should pass the message to `messageAction()` in `ClusteredServer`.

**Note**

* Most MOM in Java requires message to be serialized. In other words, `Action` instance used in `all`, `byId` and `byTag` (not `socketAction`) should implement `Serializable`. Whereas `Action` is generally used as anonymous class, but `Serializable` [can't be used in that manner](http://docs.oracle.com/javase/7/docs/platform/serialization/spec/serial-arch.html#4539). Therefore always use `Sentence` instead of `Action` especially in this case.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
Hermaphrodite case. It will work exactly like `DefaultServer`.

```java
final ClusteredServer server = new ClusteredServer();

server.publishAction(new Action<Map<String, Object>>() {
	@Override
	public void on(Map<String, Object> message) {
		server.messageAction().on(message);
	}
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
Hazelcast case. You can regard `topic` as node in the above explanation.

```java
HazelcastInstance hazelcast = 
HazelcastInstanceFactory.newHazelcastInstance(new Config());
final ClusteredServer server = new ClusteredServer();
final ITopic<Map<String, Object>> topic = hazelcast.getTopic("vibe:app");

topic.addMessageListener(new MessageListener<Map<String, Object>>() {
	@Override
	public void onMessage(Message<Map<String, Object>> message) {
		server.messageAction().on(message.getMessageObject());
	}
});
server.publishAction(new Action<Map<String, Object>>() {
	@Override
	public void on(Map<String, Object> message) {
		topic.publish(message);
	}
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

---

## Examples
### Simple
The simple example is a basic echo and chat server to demonstrate that Vibe Java Server can work with some projects. By default, it runs at `8080` port under `/vibe` URI.

It can run on the following platform:

<ul class="inline-list">
    <li><a href="https://github.com/Atmosphere/vibe-examples/tree/master/java-server/platform/atmosphere2">Atmosphere 2</a></li>
    <li><a href="https://github.com/Atmosphere/vibe-examples/tree/master/java-server/platform/jwa1">Java WebSocket API 1</a></li>
    <li><a href="https://github.com/Atmosphere/vibe-examples/tree/master/java-server/platform/servlet3">Servlet 3</a></li>
    <li><a href="https://github.com/Atmosphere/vibe-examples/tree/master/java-server/platform/vertx2">Vert.x 2</a></li>
    <li><a href="https://github.com/Atmosphere/vibe-examples/tree/master/java-server/platform/play2">Play 2</a></li>
</ul>

It can be clustered through the following projects:

<ul class="inline-list">
    <li><a href="https://github.com/Atmosphere/vibe-examples/tree/master/java-server/clustering/hazelcast3">Hazelcast 3</a></li>
</ul>
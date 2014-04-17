---
layout: reference
title: React Java Server Reference
---

<div data-alert class="alert-box warning">
You are watching snapshot documentation.<a href="#" class="close">&times;</a>
</div>

<h1>Reference <small>React Java Server</small></h1>

---

**3.0.0-Alpha1-SNAPSHOT**

---

**Table of Contents**

1. [Introduction](#toc_0)
    1. [Features](#toc_1)
    1. [Versions](#toc_2)
    1. [License](#toc_3)
1. [Quick Start](#toc_4)
1. [Installation](#toc_5)
    1. [Atmosphere 2](#toc_6)
    1. [Vert.x 2](#toc_7)
    1. [Servlet 3](#toc_8)
    1. [Java WebSocket API 1](#toc_9)
1. [Server](#toc_10)
    1. [Handling Socket](#toc_11)
    1. [Selecting Sockets](#toc_12)
    1. [Writing Sentence](#toc_16)
1. [Socket](#toc_17)
    1. [Life Cycle](#toc_18)
    1. [Properties](#toc_19)
    1. [Sending and Receiving Events](#toc_20)
    1. [Sending and Receiving Replyable Event](#toc_21)
1. [Integration](#toc_22)
    1. [I/O Platform](#toc_23)
    1. [Dependency Injection Framework](#toc_24)
    1. [Message Oriented Middleware](#toc_25) 
    
---

## Introduction
The React Java Server is a versatile and flexible Java server. It provides an application model and pattern for modern Java based enterprise web applications by implementing React protocol, which is based on I/O abstraction layer designed to run application on every platforms and frameworks on Java Virtual Machine like Servlet and Netty.

### Features
* Based on I/O abstraction layer to run on any full-stack application framework (Play, Spring), micro framework (Grizzly, Spark) and platform (Netty, Undertow).
* Separation of concerns: Application layer and I/O layer.
* Simple architecture: Server and Socket.
* Scalable by clustering and clouding.

### Versions
The mapping between the specifications and the respective React Java Server versions is:

| Version | Java | React Protocol |
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
  compile 'org.atmosphere:react-vertx2:3.0.0.Alpha1-SNAPSHOT'
  compile 'org.atmosphere:react-runtime:3.0.0.Alpha1-SNAPSHOT'
  compile('io.vertx:vertx-core:2.0.2-final') {
    exclude group: 'com.fasterxml.jackson.core'
  }
  compile 'io.vertx:vertx-platform:2.0.2-final'
}
```

Once you've set up your build, you'll be able to write `Application.java`:

```java
// TODO react imports

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

To use the reference implementation, you need to install [Node.js](http://nodejs.org/). If you are not happy, however, you can use React JavaScript Client running on browser. 

Once you've installed Node.js, then type the following to install the reference implementation:

```bash
npm install react-???
```

Open Node console, copy the following script and paste into the console. 

```javascript
var client = require("react-???/lib/client"),
    socket;

client.open("http://localhost:8000/", {transport: "ws"})
.on("open", function() {
    socket = this;
    console.log("socket");
});
```
Once `socket` have been logged, you can access the opened socket by `socket` in the console.
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

---

## Installation
How to install and run varies for what your platform or framework is.

### Atmosphere 2
The [Atmosphere 2](https://github.com/atmosphere/atmosphere/) makes the application run on most servlet containers that support the Servlet Specification 2.3. That being said, Servlet 3.0 containers is required here. With Atmosphere, you can write a traditional Java web application, a war project in Maven.

**Note**

* Using Servlet 3 and Java WebSocket 1 together is unintuitive and inconvenient unless handling vendor-specific code. Since Atmosphere 2 handles vendor-specific things which is picky to maintain, React Java Server uses it as a platform but in the future it might be deprecated or replaced with new modules dealing with their vendor-specific code, e.g. react-tomcat8 and react-jetty9.

<div class="row">
<div class="large-7 columns">
{% capture panel %}
**Bootstrap**

Installation will be done once the servlet container starts.

```java
// TODO react imports

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
  @Override
  public void contextInitialized(ServletContextEvent event) {
    Server server = new DefaultServer();
    // server.socketAction(socket -> {/* Your logic here */});

    new AtmosphereBridge(event.getServletContext(), "/react")
    .httpAction(server.httpAction()).websocketAction(server.websocketAction());
  }

  @Override
  public void contextDestroyed(ServletContextEvent sce) {}
}
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-5 columns">
{% capture panel %}
**Dependency**

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>react-atmosphere2</artifactId>
        <version>3.0.0.Alpha1-SNAPSHOT</version>
    </dependency>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>react-runtime</artifactId>
        <version>3.0.0.Alpha1-SNAPSHOT</version>
    </dependency>
</dependencies>
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Vert.x 2
The [Vert.x 2](http://vertx.io/) which is an event driven application framework.

<div class="row">
<div class="large-7 columns">
{% capture panel %}
**Bootstrap**

Installation will be done once the verticle starts.

```java
// TODO react imports

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

    new VertxBridge(httpServer, "/react")
    .httpAction(server.httpAction()).websocketAction(server.websocketAction());
    httpServer.listen(8080);
  }
}
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-5 columns">
{% capture panel %}
**Dependency**

Install the module via `vertx` console or include it on your classpath manually.

```bash
org.atmosphere~react-vertx2~3.0.0.Alpha1-SNAPSHOT
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Servlet 3
[Java Servlet 3.0](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 6 and [Java Servlet 3.1](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 7. There is no WebSocket part in Servlet API and it exists as a separate specification. To use WebSocket in a JSR way, use Java WebSocket API in the next section. Servlet is a traditional Java web application, a war project in Maven.

<div class="row">
<div class="large-7 columns">
{% capture panel %}
**Bootstrap**

Installation will be done once the servlet container starts.

```java
// TODO react imports

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
  @Override
  public void contextInitialized(ServletContextEvent event) {
    Server server = new DefaultServer();
    // server.socketAction(socket -> {/* Your logic here */});
    
    new ServletBridge(event.getServletContext(), "/react").httpAction(server.httpAction());
  }
  
  @Override
  public void contextDestroyed(ServletContextEvent sce) {}
}
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-5 columns">
{% capture panel %}
**Dependency**

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>react-servlet3</artifactId>
        <version>3.0.0.Alpha1-SNAPSHOT</version>
    </dependency>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>react-runtime</artifactId>
        <version>3.0.0.Alpha1-SNAPSHOT</version>
    </dependency>
</dependencies>
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Java WebSocket API 1
[Java WebSocket API 1](http://docs.oracle.com/javaee/7/tutorial/doc/websocket.htm#GKJIQ5) (JWA) from Java EE 7. There is no HTTP part in WebSocket API and it exists as a separate specification. To deal with HTTP in a JSR way, use Java Servlet in the previous section. 

<div class="row">
<div class="large-7 columns">
{% capture panel %}
**Bootstrap**

Installation will be done once the container starts by scanning `ServerApplicationConfig` instance. In case of embedded container, however, it may not scan it and you may have to follow their alternatives.

```java
// TODO react imports

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

    return Collections.singleton(new JwaBridge("/react")
    .websocketAction(server.websocketAction()).config());
  }

  @Override
  public Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> scanned) {
    return Collections.emptySet();
  }
}
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-5 columns">
{% capture panel %}
**Dependency**

Add the following dependency to your build or include it on your classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>react-jwa1</artifactId>
        <version>3.0.0.Alpha1-SNAPSHOT</version>
    </dependency>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>react-runtime</artifactId>
        <version>3.0.0.Alpha1-SNAPSHOT</version>
    </dependency>
</dependencies>
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

---

## Server
Server is a react application in a nutshell producing and managing socket consuming HTTP exchange and WebSocket.

### Handling Socket
When a socket is opened, actions added via `socketAction` are executed with it. It's allowed to add several actions before and after installation, so you don't need to centralize all your code to one class.

```java
server.socketAction(new Action<Socket>() {
    @Override
    public void on(Socket socket) {
        // Your logic here
    }
});
```

### Selecting Sockets
It's a common use case to select some sockets and do something with them like dealing with persistence entities or HTML elements. When a socket has been closed, it is evicted from the server immediately, so socket being passed to action is always in the open state where I/O operations are available.

#### All
`all` executes the given action finding all of the socket in this server.

```java
server.all(new Action<Socket>() {
    @Override
    public void on(Socket socket) {
        // Your logic here
    }
});
```

#### By Id
Every socket has a unique id. `byId` finds socket by id and executes the given action only once or not if no socket is found.

```java
server.byId("59f3e826-3684-4e0e-813d-8394ac7fb7c0", new Action<Socket>() {
    @Override
    public void on(Socket socket) {
        // Your logic here
    }
});
```

#### By Tag
A socket may have several tags and a tag may have several sockets like many-to-many relationship. `byTag` finds socket accepting one or more tag names and executes the given action. It is desirable to use tag when dealing with a specific concept in the real world (e.g. person and topic). Tag set is managed only by server and unknown to client.

```java
server.byTag("room#201", new Action<Socket>() {
    @Override
    public void on(Socket socket) {
        // Your logic here
    }
});
```

### Writing Sentence
`Sentence` is a fluent interface to deal with a group of sockets. Finder methods return a sentence when being called without action. Use of sentence is preferred to that of action if the goal is same. Because, it enables to write one-liner action and uses an action implementing `Serializable` in execution, which is picky to use in anonymous class and typically needed in clustering.

```java
server.all().send("foo", "bar");
```
```java
server.byTag("room#201").send("message", "time to say goodbye").close();
```

---

## Socket
Socket is a connectivity between the two react endpoints where event occurs.

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

### Sending and Receiving Events
`on` attaches an event handler. The `close` event is the only reserved event, which fires when a socket has been clsoed. In receiving events, the allowed Java types, `T`, for data are corresponding to JSON types:

| Number | String | Boolean | Array | Object | null |
|---|---|---|---|---|---|
|`Integer` or `Double` | `String` | `Boolean` | `List<T>` | `Map<String, T>` | `null` or `Void` |

`send` sends an event with or without data. Unlike when receiving event, when sending event you can use any type of data and it will be internally stringified by Jackson. However, don't rely on detail features of Jackson too much, e.g. use of annotations. There is no restriction on event name but to avoid confusion don't use `connecting`, `waiting`, `open` and `close`, which are reserved event in React JavaScript Client.

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
var client = require("react-???/lib/client");
client.open("http://localhost:8000/react", {transport: "ws"})
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
var client = require("react-???/lib/client");
client.open("http://localhost:8000/react", {transport: "ws"})
.on("echo", function(data) {
    console.log(data);
    this.send("echo", data);
})
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Sending and Receiving Replyable Event
Through replayable event, you can receive data in sending event by using overloaded signatures of `send` where allowed data types are the same with in reciving event and send data in receiving event by using `Reply` as data type in an asynchrnous manner like Remote Procedure Call (RPC) or controller from MVC model.

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
var client = require("react-???/lib/client");
client.open("http://localhost:8000/react", {transport: "ws"})
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
var client = require("react-???/lib/client");
client.open("http://localhost:8000/react", {transport: "ws"})
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
Here are how to integrate React Java Server with awesome technologies.

### I/O Platform
As covered in installation section, installing React Java Server on the specific platform is simply to create `Server` and have it consume HTTP exchange and WebSocket produced by the specific platform. Here I/O Platform stands for full-stack application framework like Play and Spring, micro framework like Grizzly and Spark and raw server like Servlet and Netty.

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
    
    @HttpAction("/react")
    public void onHttpExchange(HttpRequest req, HttpResponse res) {
        server.httpAction().on(new BahServerHttpExchange(req, res));
    }
    
    @WebSocketAction("/react")
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
  
  @PostContruct
  public void handle() {
    server.socketAction(
      new Action<Socket>() {
      @Override
      public void on(Socket socket) {
        socket.tags().add("tag");
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

All of the Message Oriented Middleware (MOM) supporting publish and subscribe model like JMS and Hazelcast can be used to cluster multiple react applications by using `ClusteredServer`.

`ClusteredServer` intercepts a call to `all`, `byId` and `byTag`, converts the call into a message and pass the message to actions added via `publishAction` which is supposed to publish message to all nodes including the one issued in cluster with the message. If one of node receives a message, it should pass the message to `messageAction` in `ClusteredServer`.

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
final ITopic<Map<String, Object>> topic = hazelcast.getTopic("react:app");

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
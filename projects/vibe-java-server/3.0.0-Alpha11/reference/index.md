---
layout: project
title: Vibe Java Server Reference
---

<h1>Reference</h1>

---

**Table of Contents**

* [Installation](#installation)
* [Server](#server)
    * [Configuring Server](#configuring-server)
    * [Handling Socket](#handling-socket)
    * [Selecting Sockets](#selecting-sockets)
    * [Writing Sentence](#writing-sentence)
* [TransportServer](#transportserver)
* [Socket](#socket)
    * [Life Cycle](#life-cycle)
    * [Properties](#properties)
    * [Tagging](#tagging)
    * [Error Handling](#error-handling)
    * [Sending and Receiving Event](#sending-and-receiving-event)
    * [Getting and Setting Result of Event Processing](#getting-and-setting-result-of-event-processing)
    * [Accessing Underlying Object](#accessing-underlying-object)
* [Transport](#transport)
* [Integration](#integration)
    * [Dependency Injection](#dependency-injection)
    * [Clustering](#clustering)
    * [Authentication and Authorization](#authentication-and-authorization)
    * [Others](#others)
    
---

## Installation
Vibe Java Server requires Java 7 and is distributed through Maven Central. Add the following dependency to your build or include it on your classpath manually.

```xml
<dependency>
    <groupId>org.atmosphere</groupId>
    <artifactId>vibe-server</artifactId>
    <version>3.0.0-Alpha11</version>
</dependency>
```

[Vibe Java Platform](/projects/vibe-java-platform/) is created to run a vibe application on any framework or server transparently without or with a little bit of effort. See [reference guide](/projects/vibe-java-platform/3.0.0-Alpha8/reference/) for what platforms are supported, how to install vibe on them and what you can do when your favorite platform is not supported.

**Examples**

<ul class="inline-list">
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/atmosphere2">Atmosphere 2</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/grizzly2">Grizzly 2</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/netty4">Netty 4</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/play2">Play 2</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/servlet3-jwa1">Servlet 3 and Java WebSocket API 1</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/vertx2">Vert.x 2</a></li>
</ul>

<ul class="inline-list">
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform-on-platform/jaxrs2-atmosphere2">JAX-RS 2 on Atmosphere 2</a></li>
</ul>

_Atmosphere example._

```java
@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        final Server server = new DefaultServer();
        // socketAction
        
        final HttpTransportServer httpTransportServer = new HttpTransportServer().transportAction(server);
        final WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().transportAction(server);
        
        ServletContext context = event.getServletContext();
        ServletRegistration.Dynamic reg = context.addServlet(VibeAtmosphereServlet.class.getName(), new VibeAtmosphereServlet() {
            @Override
            protected Action<ServerHttpExchange> httpAction() {
                return HttpTransportServer;
            }
            
            @Override
            protected Action<ServerWebSocket> wsAction() {
                return WebSocketTransportServer;
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

---

## Server
Server is a vibe application in a nutshell consuming transport and producing and managing socket. 

### Configuring Server
The protocol options should be centralized in server side and configured through `DefaultServer`. Every option has a proper default value so you don't need to touch it unless there's anything else. 

#### Heartbeat
An heartbeat interval value in milliseconds. An opened socket in client continuously sends an heartbeat event to the server each time the value has elapsed. Actually, the socket sends the event 5 seconds before the heartbeat timer expires to wait the server's echo. If the event echoes back within 5 seconds, the socket reset the timer. Otherwise, both client and server fires the `close` event. For that reason, the value must be larger than `5000`. The default value is `20000`. 

```java
server.setHeartbeat(30 * 1000);
```

### Handling Socket
When a socket is opened, actions added via `socketAction(Action<ServerSocket> action)` are executed with it. It's allowed to add several actions at any time, so you don't need to centralize all your code to one class.

```java
server.socketAction(new Action<ServerSocket>() {
    @Override
    public void on(ServerSocket socket) {
        // Your logic here
    }
});
```

### Selecting Sockets
It's a common use case to select some sockets and do something with them like dealing with persistence entities or HTML elements. When a socket has been closed, it is evicted from the server immediately, so socket being passed to action is always in the open state where I/O operations are available.

#### All
`all(Action<ServerSocket> action)` executes the given action finding all of the socket in this server.

```java
server.all(new Action<ServerSocket>() {
    @Override
    public void on(ServerSocket socket) {
        // Your logic here
    }
});
```

#### By Tag
A socket may have several tags and a tag may have several sockets like many-to-many relationship. `byTag(String[] names, Action<ServerSocket> action)` finds socket accepting one or more tag names and executes the given action.

```java
server.byTag("room#201", new Action<ServerSocket>() {
    @Override
    public void on(ServerSocket socket) {
        // Your logic here
    }
});
```

### Writing Sentence
`Sentence` is a fluent interface to deal with a group of sockets. Finder methods return a sentence when being called without action. Use of sentence is preferred to that of action if the goal is same. Because, it enables to write one-liner action and internally uses an action implementing `Serializable` in execution, which is typically required in clustering and picky to use as anonymous class form.

```java
server.all().send("foo", "bar");
```
```java
server.byTag("room#201", "room#301").send("message", "time to say goodbye").close();
```

---

## TransportServer

TODO

---

## Socket
Socket is a connectivity between the two vibe endpoints where event occurs.

### Life Cycle
Socket can be in either opened state where I/O operations are possible or closed state where `close` event fires and I/O operations are not possible. However, it is supposed to call Server's finder methods to access sockets so socket is always expected in the opened state. Therefore, do not hold a reference on socket unless the reference shares the same life cycle of socket. It makes things complicated.

**Note**

* To deal with socket, always create a socket action and pass it to server's finder methods.
* Otherwise make sure a socket you are dealing with is not closed.

_Tracking socket state._

```java
server.socketAction(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
        System.out.println("opened");
        socket.closeAction(new VoidAction() {
            @Override
            public void on() {
                System.out.println("closed");
            }
        });
    }
});
```

### Properties
These are read only.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
#### URI
A URI used to connect. To work with URI parts, use `java.net.URI` or something like that.

```java
URI.create(socket.uri()).getQuery();
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
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
As a socket is a just connectivity, it is not suibtable for handling a specific entity in the real world. For example, when an user signs in using multiple devices like desktop, laptop, tablet and smartphone, if someone sends a message, it should be delivered to all devices where the user signed in. To do that, you need a way to handle multiple sockets, devices, as a single entity, user.

That's why tag is introduced. A tag is used to point to a group of sockets like class attribute in HTML. Tag set is managed only by server and unknown to client. `tag(String... names)`/`untag(String... names)` attcahes/detaches given names of tags to/from a socket.

**Note**

* To manage a lot of tags easily, use [URI](http://tools.ietf.org/html/rfc3986) as tag name format like `/user/flowersinthesand`.

_Notifying user of the login/logout through other device._

```java
server.socketAction(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
        Uri uri = Uris.parse(socket.uri());
        final String username = uri.param("username");
        final String devicename = uri.param("devicename");
        socket.tag(username).closeAction(new VoidAction() {
            @Override
            public void on() {
                server.byTag(username).send("/logout", "Using device " + devicename);
            }
        });
        server.byTag(username).send("/login", "Using device " + devicename);
    }
});
```

### Error Handling
To capture any error happening in the socket, use `error` event. As an argument, `Throwable` in question is passed. Exceptions from the underlying transport are also propagated.

**Note**

* Errors thrown by user created event handler are not propagated to `error` event.

```java
server.socketAction(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
        socket.errorAction(new Action<Throwable>() {
            @Override
            public void on(Throwable error) {
                error.printStackTrace();
            }
        });
    }
});
```

### Sending and Receiving Event
`on(String event, Action<T> action)` attaches an event handler.  In receiving events, the allowed Java types, `T`, for data are corresponding to JSON types:

| Number | String | Boolean | Array | Object | null |
|---|---|---|---|---|---|
|`Integer` or `Double` | `String` | `Boolean` | `List<T>` | `Map<String, T>` | `null` or `Void` |

`send(String event)` and `send(String event, Object data)` sends an event with or without data, respectively. Unlike when receiving event, when sending event you can use any type of data. But, it will be converted to JSON according to the above table.

In both cases, you can use any event name except reserved ones: `close` and `error`.

**Note**

* To manage a lot of events easily, use [URI](http://tools.ietf.org/html/rfc3986) as event name format like `/account/update`.

_The client sends events and the server echoes back to the client._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Server**

```java
server.socketAction(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
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
vibe.open("http://localhost:8080/vibe")
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

_The server sends events and the client echoes back to the server._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Server**

```java
server.socketAction(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
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
vibe.open("http://localhost:8080/vibe")
.on("echo", function(data) {
    console.log(data);
    this.send("echo", data);
})
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Getting and Setting Result of Event Processing
You can get the result of event processing from the client in sending event using `send(String event, Object data, Action<T> resolved)` and `send(String event, Object data, Action<T> resolved, Action<U> rejected)` where the allowed Java types, `T`, are the same with in receiving event, and set the result of event processing to the client in receiving event by using `Reply` as data type in an asynchronous manner. Either resolved or rejected callback is executed once when the client executes it. You can apply this functionality to sending events in order, Acknowledgements, Remote Procedure Call and so on.

**Note**

* Beforehand determine whether to use rejected callback or not to avoid writing unnecessary rejected callbacks. For example, if required resource is not available, you can execute either resolved callback with null or rejected callback with exception.

_The client sends events attaching callbacks and the server executes one of them with the result of event processing._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Server**

```java
server.socketAction(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
        socket.on("/account/find", new Action<Reply<String>>() {
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
vibe.open("http://localhost:8080/vibe")
.on("open", function(data) {
    this.send("/account/find", "flowersinthesand", function(data) {
        console.log("resolved with " + data);
    }, function(data) {
        console.log("rejected with " + data);
    })
    .send("/account/find", "flowersits", function(data) {
        console.log("resolved with " + data);
    }, function(data) {
        console.log("rejected with " + data);
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

_The server sends events attaching callbacks and the client executes one of them with the result of event processing._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Server**

```java
server.socketAction(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
        socket.send("/account/find", "flowersinthesand", new Action<Map<String, Object>>() {
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
        .send("/account/find", "flowersits", new Action<Map<String, Object>>() {
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
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
vibe.open("http://localhost:8080/vibe")
.on("/account/find", function(id, reply) {
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

### Accessing Underlying Object
In any case, transport underlies socket and resource like HTTP request-response exchange and WebSocket underlies transport. To access such underlying objects, use `unwrap(Class<?> clazz)`.

**Note**

* Don't manipulate returned object unless you know what you are doing.

_Accessing platform-specific object through underlying resource._

```java
ServerTransport transport = socket.unwrap(ServerTransport.class);
ServerHttpExchange http = transport.unwrap(ServerHttpExchange.class);
AtmosphereResource resource = http.unwrap(AtmosphereResource.class);
HttpSession session = resource.getRequest().getSession();
```

---

## Transport

TODO

---

## Integration
Here is how to integrate Vibe Java Server with awesome technologies.

### Dependency Injection
With Dependency Injection, you can inject server wherever you need. Registers a `Server` as a singleton component and inject it wherever you want to handle socket.

**Examples**

<ul class="inline-list">
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/dependency-injection/cdi1">CDI 1</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/dependency-injection/dagger1">Dagger 1</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/dependency-injection/guice3">Guice 3</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/dependency-injection/hk2">HK 2</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/dependency-injection/picocontainer2">PicoContainer 2</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/dependency-injection/spring4">Spring 4</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/dependency-injection/tapestry5">Tapestry 5</a></li>
</ul>

_Spring example_

```java
@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    @SuppressWarnings("resource")
    public void contextInitialized(ServletContextEvent event) {
        AnnotationConfigApplicationContext applicationContext = new AnnotationConfigApplicationContext(SpringConfig.class);
        Server server = applicationContext.getBean(Server.class);
        // socketAction
        
        final HttpTransportServer httpTransportServer = new HttpTransportServer().transportAction(server);
        final WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().transportAction(server);

        // Installs the server on Atmosphere platform
        ServletContext context = event.getServletContext();
        ServletRegistration.Dynamic reg = context.addServlet(VibeAtmosphereServlet.class.getName(), new VibeAtmosphereServlet() {
            @Override
            protected Action<ServerHttpExchange> httpAction() {
                return httpTransportServer;
            }

            @Override
            protected Action<ServerWebSocket> wsAction() {
                return wsTransportServer;
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

```java
@Configuration
@EnableScheduling
@ComponentScan(basePackages = { "simple" })
public class SpringConfig {
    // Registers the server as a component
    @Bean
    public Server server() {
        return new DefaultServer();
    }
}
```

```java
@Component
public class Clock {
    // Injects the server
    @Autowired
    private Server server;

    @Scheduled(fixedRate = 3000)
    public void tick() {
        server.all().send("chat", "tick: " + System.currentTimeMillis());
    }
}
```

### Clustering
All of the Message Oriented Middleware (MOM) supporting publish and subscribe model can be used to cluster multiple vibe applications with `ClusteredServer`. `ClusteredServer` intercepts a method invocation to `all` and `byTag`, converts the call into a message and execute actions added via `publishAction(Action<Map<String,Object>> action)` with that message.

All you need is to add an action to `publishAction(Action<Map<String,Object>> action)` to publish message to all servers in the cluster including the one issued and to pass them to `messageAction().on(Map<String,Object> message)` when receiving such messages from other server.

**Note**

* Most MOM in Java requires message to be serialized. In other words, `Action` instance used in `all` and `byTag` (not `socketAction`) should implement `Serializable`. Whereas `Action` is generally used as anonymous class, but `Serializable` [can't be used in that manner](http://docs.oracle.com/javase/7/docs/platform/serialization/spec/serial-arch.html#4539). Therefore always use `Sentence` instead of `Action` especially in this case. However, Java 8's [lambda has no such issues](http://docs.oracle.com/javase/specs/jls/se8/html/jls-15.html#jls-15.16) with additional bound. For example, you can use a lambda like `server.all((Action<ServerSocket> & Serializable) socket -> socket.send("chat", "Hi"))`.

**Examples**

<ul class="inline-list">
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/clustering/amqp1">AMQP 1</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/clustering/hazelcast3">Hazelcast 3</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/clustering/jgroups3">jGroups 3</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/clustering/jms2">JMS 2</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/clustering/redis2">Redis 2</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/clustering/vertx2">Vert.x 2</a></li>
</ul>

_Hazelcast example._

```java
@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        HazelcastInstance hazelcast = HazelcastInstanceFactory.newHazelcastInstance(new Config());
        final ClusteredServer server = new ClusteredServer();
        final ITopic<Map<String, Object>> topic = hazelcast.getTopic("vibe");

        // Some one server in the cluster published a message
        // Pass it to this local server
        topic.addMessageListener(new MessageListener<Map<String, Object>>() {
            @Override
            public void onMessage(Message<Map<String, Object>> message) {
                System.out.println("receiving a message: " + message.getMessageObject());
                server.messageAction().on(message.getMessageObject());
            }
        });
        // This local server got a method call from all or byTag and created a message
        // Publish it to every server in the cluster
        server.publishAction(new Action<Map<String, Object>>() {
            @Override
            public void on(Map<String, Object> message) {
                System.out.println("publishing a message: " + message);
                topic.publish(message);
            }
        });

        // socketAction

        final HttpTransportServer httpTransportServer = new HttpTransportServer().transportAction(server);
        final WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().transportAction(server);
        
        // Installs the server on Atmosphere platform
        ServletContext context = event.getServletContext();
        ServletRegistration.Dynamic reg = context.addServlet(VibeAtmosphereServlet.class.getName(), new VibeAtmosphereServlet() {
            @Override
            protected Action<ServerHttpExchange> httpAction() {
                return HttpTransportServer;
            }

            @Override
            protected Action<ServerWebSocket> wsAction() {
                return WebSocketTransportServer;
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

### Authentication and Authorization
There is nothing new for you.

TODO more explanation and examples will be added.

**Note**

* Token based authentication using URI is preferred to cookie based authentication using HTTP cookie header because token based one works with any transport but cookie based one works with only HTTP transport. In fact, all provided transports are based on HTTP so it doesn't matter. However, you should be aware that cookie header is not sent to the server in the following cases, which is the case of Internet Explorer 6-9.
    * When HTTP Streaming or HTTP Long Polling is backed up by XDomainRequest.
    * When HTTP Long Polling is backed up by script tag and a given URI is cross origin.

**Examples**

<ul class="inline-list">
<li>Apache Shiro</li>
<li>JAAS</li>
<li>Play</li>
<li>Spring Security</li>
</ul>

### Others
The following external projects usually maintained by contribution of the community also make it easy to integrate Vibe Java Server with other technologies.

#### Grails
* [Vibe Plugin](http://www.grails.org/plugin/vibe) by Ken Siprell
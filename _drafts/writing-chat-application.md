---
layout: post
title: "Writing Chat Application"
author: flowersinthesand
---

<script src="/projects/vibe-javascript-client/3.0.0-Alpha1/vibe.js"></script>

This guide walks you through the process of building a very simple chat application meeting the followings:

* URI is `http://localhost:8080/vibe`.
* If a client sends `echo` event, a server sends it back to the client that sent it.
* If a client sends `chat` event, a server broadcasts it to every client that connected to the server.

Here we are going to use [Vibe Java Server](/projects/vibe-java-server) and [Vibe JavaScript Client](/projects/vibe-javascript-client) and also to look at how flexible it is to integrate with other technologies like dependency injection and clustering.

## Setting up environment
### Server
You need to have [Java 7](http://www.oracle.com/technetwork/java/javase/downloads/index.html) or later installed and also decide application platform to embed Vibe. In Java, there are lots of many kinds of frameworks and platforms where you can build an application and you have probably already chosen the platform and tried to find out if Vibe is available on that platform.

To write true Java Server which is able to run on any platform seamlessly in Java, a simple abstraction layer for such platforms, [Vibe Java Platform](/projects/vibe-java-platform), is created. Therefore, you can run Vibe application on a platform you like without effort if Vibe Java Platform supports it and with some effort if not. Now Atmosphere, Vert.x, Servlet, Java WebSocket API and Play framework are supported. Here we are going to use Atmosphere with Jetty but complete examples are provided per each platform.

Let's set up a basic build script, `pom.xml`, using Maven.

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>org.atmosphere</groupId>
    <artifactId>simple-chat</artifactId>
    <version>0.1.0</version>
    <dependencies>
        <!-- Vibe Java Server -->
        <dependency>
            <groupId>org.atmosphere</groupId>
            <artifactId>vibe-server</artifactId>
            <version>3.0.0-Alpha1</version>
        </dependency>
        <!-- Vibe Java Platform for Atmosphere -->
        <dependency>
            <groupId>org.atmosphere</groupId>
            <artifactId>vibe-platform-server-atmosphere2</artifactId>
            <version>3.0.0-Alpha1</version>
        </dependency>
        <!-- Atmosphere -->
        <dependency>
            <groupId>org.atmosphere</groupId>
            <artifactId>atmosphere-runtime</artifactId>
            <version>2.2.2</version>
        </dependency>
        <!-- Servlet API -->
        <dependency>
            <groupId>javax.servlet</groupId>
            <artifactId>javax.servlet-api</artifactId>
            <version>3.1.0</version>
            <scope>provided</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <!-- Jetty plugin -->
            <plugin>
                <groupId>org.eclipse.jetty</groupId>
                <artifactId>jetty-maven-plugin</artifactId>
                <version>9.2.3.v20140905</version>
            </plugin>
        </plugins>
    </build>
</project>
```

And then you can run this application on Jetty using `mvn jetty:run`. It will bind the application to localhost and at port 8080.

### Client
You need a web browser. Because JavaScript Client follows jQuery 1.x's [browser support policy](/projects/vibe-javascript-client/3.0.0-Alpha1/reference/#browser), almost all browsers are available including Internet Explorer 6. Also we are going to use the browser's JavaScript console to communicate with the server interactively instead of writing static HTML. Though, if you need an editor, you can start editing from a prepared [JS Bin](http://jsbin.com/suwiy/1/edit?html,js,console).

This guide already loaded JavaScript Client, vibe.js, open a JavaScript console and type the following to confirm it's loaded. Technically, this way is a kind of cross-origin connection. Because cross-origin connection is more limited than same-origin connection, you won't have no problem to use same-origin connection. Though, if you want to test it, connect to `http://localhost:8080/`, open JavaScript console and load the script by copy and paste of contents of vibe.js.

```
vibe
```

Instead of browser's JavaScript console, if you have Node.js installed, you can run client on Node.js console as well. Type the following on system console to install JavaScript Client.

```
npm install vibe-client
```

And then load it to Node.js console.

```javascript
var vibe = require("vibe-client");
```

## URI design
Generally you would try to embed Vibe in your application. If you have done something using URI like filtering and authentication, the final form of URI may be an issue because it may be not negotiable and restrict your idea.

Here is the first line of HTTP request to receive an event from the server and the first line of HTTP request to send an event to the server when using `sse` transport and `http://localhost:8080/vibe` URI: 

```
GET /vibe?id=d009d9f3-088f-4977-8ec0-99576f84cb4c&_=32fb5d&when=open&transport=sse&heartbeat=20000 HTTP/1.1
```

```
POST /vibe?id=d009d9f3-088f-4977-8ec0-99576f84cb4c&_=6a5e3d HTTP/1.1
```

As you can see, only query string component of URI is used to pass necessary information so you can safely manipulate path component of URI and utilize it for your application. In other words, you should be aware of reserved request parameters if you are going to manipulate query string.

## Opening socket
Let's write a simple server and client focusing what happens when a socket is opened and closed. Now we generate network traffic so that you can observe what happens in network by using packet analyzer like [Fiddler](http://www.telerik.com/fiddler/) or [Wireshark](https://www.wireshark.org/). 

### Server
Create a `src/main/java/simple/Bootstrap.java` that is a server application and use `mvn jetty:run` to run the application.

```java
package simple;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import org.atmosphere.vibe.platform.Action;
import org.atmosphere.vibe.platform.server.atmosphere2.AtmosphereBridge;
import org.atmosphere.vibe.server.DefaultServer;
import org.atmosphere.vibe.server.Server;
import org.atmosphere.vibe.server.ServerSocket;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        final Server server = new DefaultServer();
        server.socketAction(new Action<ServerSocket>() {
            @Override
            public void on(final ServerSocket socket) {
                System.out.println("client connected");
                socket.on("close", new VoidAction() {
                    @Override
                    public void on() {
                        System.out.println("client disconnected");
                    }
                });
            }
        });
        new AtmosphereBridge(event.getServletContext(), "/vibe").httpAction(server.httpAction()).websocketAction(server.websocketAction());
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}

```

How to install Vibe is simply to feed HTTP exchange and WebSocket into `Server` using the bridge for the specific platform. Even you can pass HTTP exchange and WebSocket created by different servers to one `Server` such as from Jetty listening on port 8080 and Tomcat listening on port 8090.

Here once Jetty starts up, `public void contextInitialized(ServletContextEvent event)` is executed. Then `AtmosphereBridge` installs Atmosphere under the path of `/vibe` and delegates HTTP exchange and WebSocket to `Server`. If you are going to use other platform, only this portion is needed to be changed according to the platform usage. 

`Server` consumes HTTP exchange and WebSocket and produces and manages `ServerSocket`. When a client connects successfully and a corresponding socket is opened, actions added via `socketAction(Action<ServerSocket> action)` are executed with it.

`ServerSocket` has a special event, `close`, which is fired when the socket has been closed. We will cover it in next topic in detail.

### Client
Open your JavaScript console and type the following:

```javascript
var socket = vibe.open("http://localhost:8080/vibe");
socket.on("open", function() {
    console.log("opened");
});
socket.on("close", function() {
    console.log("closed");
});
```

And then check server console and client console. You'll see both consoles display the client has connected to the server. To see when close event is fired, you need to shut down the server by <kbd>Ctrl</kbd> + <kbd>C</kbd> or close the socket by `socket.close()`. If you shut down and restart the server, you may realize the socket tries to connect to the server again automatically. Unlike server, when you handle client, you need to be aware of the following socket life cycle.

* `preparing` - As an initial state of life cycle, it's internally used during reinitializing socket state and selecting transport.
* `connecting` - The selected transport starts connecting to the server and the `connecting` event is fired.
* `opened` - The connection is established successfully and communication is possible. The `open` event is fired. 
* `closed` - The connection has been closed, has been regarded as closed or could not be opened. The `close` event is fired.
* `waiting` - The socket waits out the reconnection delay. The `waiting` event is fired. 

Note that you can determine these state by `socket.state()`. Reconnection is clearly necessary in production but annoying in development. To suppress reconnection, set `reconnect` option to `false` i.e. `vibe.open("/vibe", {reconnect: false})`.

## Exchanging event
Now we have a connection and can implement `echo` event. Let's send and receive data via the connection. In Vibe, the unit of data to be sent and received between client and server is an event object. Any event name can be used except reserved ones, hence you can create a socket handler by using URI as event name just like creating HTTP request handler by using request URI.

### Server
`ServerSocket` provides `on(String event, Action<T> action)` to receive an event and `send(String event, Object data)` to send an event.

```java
socket.on("echo", new Action<String>() {
    @Override
    public void on(String data) {
        System.out.println("on echo event: " + data);
        socket.send("echo", data);
    }
});
```

Here, in receiving event, the allowed Java types for the type, `T`, depends on the event format. By default it's JSON. Therefore, in this case:

| Number | String | Boolean | Array | Object | null |
|---|---|---|---|---|---|
|`Integer` or `Double` | `String` | `Boolean` | `List<T>` | `Map<String, T>` | `null` or `Void` |

When sending event, you can send any type of data but it will be serialized by the underlying event format in their own way.

### Client
A socket returned by `vibe.open` provides `on(event: string, onEvent: (data?: any) => void)` to receive an event and `send(event: string, data?: any)` to send an event.

```javascript
var socket = vibe.open("http://localhost:8080/vibe", {transports: ["sse"], reconnect: false});
socket.on("open", function() {
    this.send("echo", "Hello there?");
});
socket.on("echo", function(data) {
    console.log("on echo event: " + data);
});
```

In this time, we set `transports` to `["sse"]` to see how echo does work at the HTTP protocol level and `reconnection` to `false` to suppress auto-reconnection. Transport is a full-duplex message channel underlying the socket but is not public interface so you don't need to be aware of that. To send event to the server, a connection have to be established before so `open` event is safe place to send event.

When you types the code to the console, you will see an `echo` event with `Hello there?` data is sent back.

### Tracking event
You may wonder how event object not plain text is sent and received via the connection based on HTTP connection not WebSocket. For the full answer of that question, see [Anatomy of Vibe Protocol](/blog/anatomy-of-vibe-protocol/). In short,

* client user sends an event where type is `echo` and data is `Hello there?`.
* client creates an event object, `{id:"0",type:"echo",data:"Hello there?",reply:false}`.
* client's event format serializes it to text, `{"id":"0","type":"echo","data":"Hello there?","reply":false}`.
* client's sse transport formats it to `data={"id":"0","type":"echo","data":"Hello there?","reply":false}`.
* server's sse transport parses it to `{"id":"0","type":"echo","data":"Hello there?","reply":false}`.
* server's event format deserializes it to a Map, `{id=0, type=echo, data=Hello there?, reply=false}`.
* server creates an event object, `{id=0, type=echo, data=Hello there?, reply=false}`.
* server user receives an event where type is `echo` and data is `Hello there?`.
* server user sends an event where type is `echo` and data is `Hello there?`.
* server creates an event object, `{id=1, type=echo, data=Hello there?, reply=false}`.
* server's event format serializes it text, `{"id":"1","type":"echo","data":"Hello there?","reply":false}`.
* server's sse transport formats it to `data: {"id":"1","type":"echo","data":"Hello there?","reply":false}\n\n`.
* client's sse transport parses it to `{"id":"1","type":"echo","data":"Hello there?","reply":false}`.
* client's event format deserializes it to an object literal, `{id:"1",type:"echo",data:"Hello there?",reply:false}`.
* client creates an event object, `{id:"1",type:"echo",data:"Hello there?",reply:false}`.
* client user receives an event where type is `echo` and data is `Hello there?`.

The above event format is JSON which is the default one. By replacing it with one supporting binary, you can use binary data but not now. The event format will be exposed in the future release.

## Broadcasting event
Let's implement `chat` event which should be broadcasted to every client that connected to the server.

### Server
One of the patterns you need to be aware of to use Java Server is "select sockets and do something". Focus on which socket you will need and how you will handle a given socket. In this situation to broadcast `chat` event to every client, sockets we need is all opened socket and what we need to do for a socket is to send `chat` event. It can be done like the following:

```java
socket.on("chat", new Action<String>() {
    @Override
    public void on(String data) {
        System.out.println("on chat event: " + chat);
        server.all(new Action<ServerSocket>() {
            @Override
            public void on(ServerSocket s) {
                s.send("chat", data);
            }
        });
    }
});
```

There are 3 methods to select sockets: `all(Action<ServerSocket> action)` for all of the socket in the server, `byId(String id, Action<ServerSocket> action)` for a socket associated with the given id and `byTag(String[] names, Action<ServerSocket> action)` for a group of socket tagged with the given tag. In any cases, the given socket is in opened where I/O operations are possible so you don't need to mind that unlike in client.

As we can separate use case into the target of operation and operation dealing with a single target, we can reuse operation. For example, spending 6 lines to send a simple event decreases readability unless Java 8's Lambda Expressions is available. In this case, you can use `Sentence`, which is a fluent interface to deal with a group of sockets. Let's refactor the above `chat` action to use `Sentence`:

```java
socket.on("chat", new Action<String>() {
    @Override
    public void on(String data) {
        System.out.println("on chat event: " + chat);
        server.all().send("chat", data);
    }
});
```

`all()`, `byId(String id)` and `byTag(String... names)` return a `Sentence`. Another advantage to use `Sentence` is that it internally uses actions implementing `Serializable`, which don't need to modify the code in clustering. Details are explained in the clustering topic.

### Client
Open a console and type the followings:

```javascript
var socket1 = vibe.open("http://localhost:8080/vibe", {reconnect: false});
socket1.on("open", function() {
    this.send("chat", "Hi?");
});
socket1.on("chat", function(data) {
    console.log("on echo event on socket1: " + data);
});
var socket2 = vibe.open("http://localhost:8080/vibe", {reconnect: false});
socket2.on("open", function() {
    this.send("chat", "Hello?");
});
socket2.on("echo", function(data) {
    console.log("on echo event on socket2: " + data);
});
```

You'll see socket1 and socket2 receive the same chat event.

## Integration
We just finished writing a simple chat application but to introduce Vibe to a real project still need to confirm that Vibe is easy to integrate other technologies.

### Dependency Injection
If you are familiar with Dependency Injection framework like Spring and Guice, you may realize how definite it is to use Vibe with Dependency Injection. Registers a `Server` as a singleton component and inject it wherever you need to handle socket.

The following codes are for Spring but the same pattern can be applied to other Dependency Injection frameworks.

`src/main/java/simple/Bootstrap.java`

```java
package simple;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.annotation.WebListener;

import org.springframework.web.context.ContextLoaderListener;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;

@WebListener
public class Bootstrap extends ContextLoaderListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        ServletContext servletContext = event.getServletContext();
        servletContext.setInitParameter(CONTEXT_CLASS_PARAM, AnnotationConfigWebApplicationContext.class.getName());
        servletContext.setInitParameter(CONFIG_LOCATION_PARAM, this.getClass().getPackage().getName());
        super.contextInitialized(event);
    }
}
```

Now Server doesn't need to be installed here. Let's configure Spring here instead and install Server in configuration class.

`src/main/java/simple/SpringConfig.java`

```java
package simple;

import javax.servlet.ServletContext;

import org.atmosphere.vibe.platform.server.atmosphere2.AtmosphereBridge;
import org.atmosphere.vibe.server.DefaultServer;
import org.atmosphere.vibe.server.Server;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
@ComponentScan(basePackages = { "simple" })
public class SpringConfig {
    @Autowired
    private ServletContext servletContext;

    @Bean
    public Server server() {
        Server server = new DefaultServer();
        new AtmosphereBridge(servletContext, "/vibe").httpAction(server.httpAction()).websocketAction(server.websocketAction());
        return server;
    }
}
```

As Spring injects ServletContext needed to install Vibe on Atmosphere, installation is done in configuration class. Of course, you can do that elsewhere by injecting `Server`.

`src/main/java/simple/Clock.java`

```java
package simple;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class Clock {
    @Autowired
    private Server server;

    @Scheduled(fixedRate = 5000)
    public void tick() {
        server.all().send("chat", "tick: " + System.currentTimeMillis());
    }
}
```

This bean sends an `chat` event with the current server time in milliseconds to all the clients connected to the server every 5 seconds. Like this, any bean in the server can send event to client in real-time.

### Clustering
What you need to cluster application is Message Oriented Middleware supporting publish and subscribe model. "select sockets and do something" is still valid here so that you don't need to know if this application is going to be clustered or not.

What you need to do that is to use `ClusteredServer` and to add an action to `publishAction(Action<Map<String,Object>> action)` that publishes a given message to all nodes including the one issued in cluster and to pass a given message to `messageAction()` if one of nodes publishes a message while subscribing. Here the "message" to be published to all `Server` in the cluster contains the method call information of `all`, `byId` and `byTag` in some `Server`. Therefore, you should use an action implementing Serializable or `Sentence`.

The full code with Hazelcast is like the following:

`src/main/java/simple/Bootstrap.java`

```java
package simple;

import java.util.Map;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

import org.atmosphere.vibe.platform.Action;
import org.atmosphere.vibe.platform.server.atmosphere2.AtmosphereBridge;
import org.atmosphere.vibe.server.ClusteredServer;
import org.atmosphere.vibe.server.ServerSocket;

import com.hazelcast.config.Config;
import com.hazelcast.core.HazelcastInstance;
import com.hazelcast.core.ITopic;
import com.hazelcast.core.Message;
import com.hazelcast.core.MessageListener;
import com.hazelcast.instance.HazelcastInstanceFactory;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        HazelcastInstance hazelcast = HazelcastInstanceFactory.newHazelcastInstance(new Config());
        final ClusteredServer server = new ClusteredServer();
        final ITopic<Map<String, Object>> topic = hazelcast.getTopic("vibe");
        
        topic.addMessageListener(new MessageListener<Map<String, Object>>() {
            @Override
            public void onMessage(Message<Map<String, Object>> message) {
                System.out.println("receiving a message: " + message.getMessageObject());
                server.messageAction().on(message.getMessageObject());
            }
        });
        server.publishAction(new Action<Map<String, Object>>() {
            @Override
            public void on(Map<String, Object> message) {
                System.out.println("publishing a message: " + message);
                topic.publish(message);
            }
        });
        
        server.socketAction(new Action<ServerSocket>() {
            @Override
            public void on(final ServerSocket socket) {
                System.out.println("on socket: " + socket.uri());
                socket.on("echo", new Action<Object>() {
                    @Override
                    public void on(Object data) {
                        System.out.println("on echo event: " + data);
                        socket.send("echo", data);
                    }
                });
                socket.on("chat", new Action<Object>() {
                    @Override
                    public void on(Object data) {
                        System.out.println("on chat event: " + data);
                        server.all().send("chat", data);
                    }
                });
            }
        });
        
        new AtmosphereBridge(event.getServletContext(), "/vibe").httpAction(server.httpAction()).websocketAction(server.websocketAction());
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

## Getting this example
You can find this example as well as example per each platform on GitHub [here](https://github.com/vibe-project/vibe-examples#archetype).
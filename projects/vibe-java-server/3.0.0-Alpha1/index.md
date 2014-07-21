---
layout: project
title: Vibe Java Server
---

Vibe Java Server is a simple <sup><strong>A</strong></sup>, scalable <sup><strong>B</strong></sup> Java server designed to run any framework or platform on Java Virtual Machine <sup><strong>C</strong></sup>.

<dl>
    <dt>A</dt>
    <dd>All interface you need to know is Server and Socket. Indeed.</dd>
    <dt>B</dt>
    <dd>Shared nothing architecture is adopted to help scale application horizontally with ease.</dd>
    <dt>C</dt>
    <dd>Because it is built on Vibe Java Server Platform which is I/O abstraction layer, you can run your application on any platform that it supports seamlessly e.g. Play, Vert.x, Atmosphere and Servlet.</dd>
</dl>

---

## Getting Started
Vibe Java Server is distributed through Maven Central. A single artifact, <code>org.atmosphere:vibe-server:3.0.0-Alpha1</code>, is enough for general purpose and thanks to Vibe Java Server Platform, your application can run on any framework or platform it supports.

### Basic
Let's take a brief look at basic API through writing a simple server running on the top of Servlet container. Add the following dependencies to your build or include them on classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-server</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-server-platform-atmosphere2</artifactId>
        <version>3.0.0-Alpha1</version>
    </dependency>
</dependencies>
```

Once you've set up your build, you'll be able to write `Bootstrap.java`.

```java
import org.atmosphere.vibe.server.*;
import org.atmosphere.vibe.server.platform.atmosphere.*;

import javax.servlet.*;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        Server server = new DefaultServer(); // A
        server.socketAction(new Action<Socket>() { // B
            @Override
            public void on(final Socket socket) {
                socket.on("close", new VoidAction() { // C
                    @Override
                    public void on() {
                        System.out.println(socket.id() + " has been closed");
                    }
                });
                socket.on("echo", new Action<Object>() { // D
                    @Override
                    public void on(Object data) {
                        socket.send("echo", data);
                    }
                });
                socket.on("chat", new Action<Object>() { // E
                    @Override
                    public void on(Object data) {
                        server.all().send("chat", data);
                    }
                });
            }
        });

        ServletContext servletContext = event.getServletContext();
        new AtmosphereBridge(servletContext, "/vibe").httpAction(server.httpAction()).websocketAction(server.websocketAction()); // F
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

<dl>
    <dt>A <code>Server server = new DefaultServer()</code></dt>
    <dd>It creates a server instance by new keyword so you can delegate its creation to other framework like Spring.</dd>
    <dt>B <code>server.socketAction(socket -> {})</code></dt>
    <dd>It adds an action to be executed when a socket representing client has been opened.</dd>
    <dt>C <code>socket.on("close", () -> {})</code></dt>
    <dd>In server side, socket always is in opened or closed state and on closed state <code>close</code> event fires. However never mind socket's state. Every operation server providing applies to opened sockets.</dd>
    <dt>D <code>socket.on("echo", data -> socket.send("echo", data))</code></dt>
    <dd>When the socket receives <code>echo</code> event, sends it back.</dd>
    <dt>E <code>socket.on("chat", data -> server.all().send("chat", data))</code></dt>
    <dd>When the socket receives <code>chat</code> event, sends it to all sockets that have connected to this server.</dd>
    <dt>F <code>new AtmosphereBridge(servletContext, "/vibe").httpAction(server.httpAction()).websocketAction(server.websocketAction())</code></dt>
    <dd>As a platform of Vibe Java Server Platform, Atmosphere will deliver HTTP and WebSocket connections whose a request path belongs to <code>/vibe</code> from the Servlet container to the server.</dd>
</dl>

### Advanced
Following the basic example, in this time, let's scale application with the help of [Hazelcast](http://hazelcast.com/) and see advanced API usage including the extension part from the specification. Add the following dependencies to your build or include them on classpath manually.

```xml
<dependencies>
    <dependency>
        <groupId>com.hazelcast</groupId>
        <artifactId>hazelcast</artifactId>
        <version>3.2</version>
    </dependency>
    <dependency>
        <groupId>com.hazelcast</groupId>
        <artifactId>hazelcast-client</artifactId>
        <version>3.2</version>
    </dependency>
</dependencies>
```

Once you've set up your build, you'll be able to write `Bootstrap.java`.

```java
import org.atmosphere.vibe.server.*;
import org.atmosphere.vibe.server.platform.atmosphere.*;

import java.util.Map;

import javax.servlet.*;
import javax.servlet.annotation.WebListener;

import com.hazelcast.config.Config;
import com.hazelcast.core.*;
import com.hazelcast.instance.HazelcastInstanceFactory;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        HazelcastInstance hazelcast = HazelcastInstanceFactory.newHazelcastInstance(new Config());
        final ClusteredServer server = new ClusteredServer(); // A
        final ITopic<Map<String, Object>> topic = hazelcast.getTopic("vibe");
        
        topic.addMessageListener(new MessageListener<Map<String, Object>>() { // B
            @Override
            public void onMessage(Message<Map<String, Object>> message) {
                server.messageAction().on(message.getMessageObject());
            }
        });
        server.publishAction(new Action<Map<String, Object>>() { // C
            @Override
            public void on(Map<String, Object> message) {
                topic.publish(message);
            }
        });
        
        server.socketAction(new Action<Socket>() {
            @Override
            public void on(final Socket socket) {
                socket.on("close", new VoidAction() {
                    @Override
                    public void on() {
                        System.out.println(socket.id() + " has been closed");
                    }
                });
                socket.on("echo", new Action<Object>() {
                    @Override
                    public void on(Object data) {
                        socket.send("echo", data);
                    }
                });
                socket.on("chat", new Action<Object>() { // D
                    @Override
                    public void on(Object data) {
                        server.all().send("chat", data);
                    }
                });
                socket.send("get-mouse-position", null, new Action<Map<String, Integer>>() { // E
                    @Override
                    public void on(Map<String, Integer> position) {
                        System.out.println("(" + position.get("x") + ", " + position.get("y") + ")");
                    }
                }, new Action<String>() {
                    @Override
                    public void on(String reason) {
                        System.out.println("couldn't get it due to " + reason);
                    }
                });
                socket.on("/account/find", new Action<Reply<String>>() { // F
                    @Override
                    public void on(Reply reply) {
                        String id = reply.data();
                        // Imaginary class
                        Account.find(id).then(new Action<Account>() {
                            @Override
                            public void on(Account account) {
                                reply.resolve(account);
                            }
                        }, new Action<Throwable>() {
                            @Override
                            public void on(Throwable t) {
                                reply.reject(t.getMessage());
                            }
                        });
                    }
                });
                // Imaginary class
                Uri uri = Uris.parse(socket.uri());
                String username = uri.query("username");
                server.byTag(username).send("notify", "you've just signed in using other device"); // G
                socket.tag(username); // H
            }
        });
        
        ServletContext servletContext = event.getServletContext();
        new AtmosphereBridge(servletContext, "/vibe").httpAction(server.httpAction()).websocketAction(server.websocketAction());
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

<dl>
    <dt>A <code>ClusteredServer server = new ClusteredServer()</code></dt>
    <dd><code>ClusteredServer</code> uses a publish and subscribe model to scale application, which is a very basic functionality of Message Oriented Middleware or Data Grid.</dd>
    <dt>B <code>topic.addMessageListener(message -> server.messageAction().on(message.getMessageObject()))</code></dt>
    <dd>It subscribes the topic to receive messages from every server in the cluster. If a message has arrived, the server will do something following the message as if it did happen originally in this server.</dd>
    <dt>C <code>server.publishAction(message -> topic.publish(message))</code></dt>
    <dd>It publishes a message to the topic to send messages to every server in the cluster. Among many operations on server, ones required for all servers in the cluster to do something together are published as message.</dd>
    <dt>D <code>socket.on("chat", data -> server.all().send("chat", data))</code></dt>
    <dd>When the socket receives <code>chat</code> event, sends it to all sockets that have connected to each server forming the cluster. The same way applies to <code>server.byId</code> and <code>server.byTag</code>.</dd>
    <dt>E <code>Sending replyable event</code> extension</dt>
    <dd>Attach resolved callback and rejected callback in sending an event.</dd>
    <dt>F <code>Receiving replyable event</code> extension</dt>
    <dd>As a controller to resolve and reject and a wrapper for event data, <code>reply</code> is supplied. Of course you can deal with it asynchronously.</dd>
    <dt>G <code>server.byTag(username)</code></dt>
    <dd>To select a single or a group of specific sockets, use <code>server.byId</code> or <code>server.byTag</code>. Also you can handle specific sockets directly by passing an action.</dd>
    <dt>H <code>socket.tag(username)</code></dt>
    <dd>Tagging gives socket a special meaning. It is a useful way to handle sockets as entity in the real world.</dd>
</dl>
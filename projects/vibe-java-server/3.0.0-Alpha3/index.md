---
layout: project
title: Vibe Java Server
---

Vibe Java Server <sup><strong>A</strong></sup> is a simple <sup><strong>B</strong></sup>, scalable <sup><strong>C</strong></sup> Java server designed to run any framework or platform on Java Virtual Machine <sup><strong>D</strong></sup>.

<dl>
    <dt>A</dt>
    <dd><a href="/projects/vibe-protocol/3.0.0-Alpha3">Vibe 3.0.0-Alpha3</a> server.</dd>
    <dt>B</dt>
    <dd>All interface you need to know is Server and ServerSocket. Indeed.</dd>
    <dt>C</dt>
    <dd>Shared nothing architecture is adopted to help scale application horizontally with ease.</dd>
    <dt>D</dt>
    <dd>Because it is built on Vibe Java Platform which is I/O abstraction layer, you can run your application on any platform that it supports seamlessly e.g. Play, Vert.x, Atmosphere and Servlet.</dd>
</dl> 

---

## Quick Start
Vibe Java Server is distributed through Maven Central. A single artifact, <code>org.atmosphere:vibe-server:3.0.0-Alpha3</code>, is enough for general purpose and thanks to [Vibe Java Platform](/projects/vibe-java-platform/), your application can run on any framework or platform it supports.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-server</artifactId>
        <version>3.0.0-Alpha3</version>
    </dependency>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-atmosphere2</artifactId>
        <version>3.0.0-Alpha2</version>
    </dependency>
</dependencies>
```

Once you've set up the build, you will be able to write the following [echo and chat](/projects/vibe-protocol/3.0.0-Alpha3/api/#module--vibe-protocol-) server that can run on Servlet containers Atmosphere 2 supports i.e. Tomcat, Jetty and so on.

```java
import org.atmosphere.vibe.platform.Action;
import org.atmosphere.vibe.platform.server.atmosphere2.AtmosphereBridge;
import org.atmosphere.vibe.server.*;

import javax.servlet.*;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        Server server = new DefaultServer();
        server.socketAction(new Action<ServerSocket>() {
            @Override
            public void on(final ServerSocket socket) {
                socket.closeAction(new VoidAction() {
                    @Override
                    public void on() {
                        System.out.println("on close event");
                    }
                });
                socket.errorAction(new Action<Throwable>() {
                    @Override
                    public void on(Throwable error) {
                        System.out.println("on error event");
                        error.printStackTrace();
                    }
                });
                socket.on("echo", new Action<Object>() {
                    @Override
                    public void on(Object data) {
                        socket.send("echo", data);
                    }
                });
                socket.on("chat", new Action<Object>() {
                    @Override
                    public void on(Object data) {
                        server.all().send("chat", data);
                    }
                });
            }
        });

        ServletContext servletContext = event.getServletContext();
        new AtmosphereBridge(servletContext, "/vibe").httpAction(server.httpAction()).websocketAction(server.websocketAction());
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Further Reading

* To get started with JavaScript Client, read the tutorial, [writing chat application](/blog/writing-chat-application/).
* To play something right now, start with [archetype example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server) on your favorite platform.
* To take a brief look at API, check out the [testee](https://github.com/vibe-project/vibe-java-server/blob/v3.0.0-Alpha3/server/src/test/java/org/atmosphere/vibe/server/ProtocolTest.java#L32-L87).
* To get details of API, see [API document](/projects/vibe-java-server/3.0.0-Alpha3/apidocs/).
* To have a thorough knowledge of the implementation, read out the [reference](/projects/vibe-java-server/3.0.0-Alpha3/reference/).
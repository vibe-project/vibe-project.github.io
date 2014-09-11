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
    <dd>Because it is built on Vibe Java Platform which is I/O abstraction layer, you can run your application on any platform that it supports seamlessly e.g. Play, Vert.x, Atmosphere and Servlet.</dd>
</dl>

---

## Quick Start
Vibe Java Server is distributed through Maven Central. A single artifact, <code>org.atmosphere:vibe-server:3.0.0-Alpha1</code>, is enough for general purpose and thanks to [Vibe Java Platform]({{ site.baseurl }}/projects/vibe-java-platform/), your application can run on any framework or platform it supports.

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

Once you've set up the build, you will be able to write the following [echo and chat]({{ site.baseurl }}/projects/vibe-protocol/3.0.0-Alpha1/reference/#echo-and-chat) server that can run on Servlet containers Atmosphere 2 supports i.e. Tomcat, Jetty and so on.

```java
import org.atmosphere.vibe.server.*;
import org.atmosphere.vibe.server.platform.atmosphere.*;

import javax.servlet.*;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        Server server = new DefaultServer();
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
                socket.on("chat", new Action<Object>() {
                    @Override
                    public void on(Object data) {
                        server.all().send("chat", data);
                    }
                });
            }
        });

        ServletContext servletContext = event.getServletContext();
        new AtmosphereBridge(servletContext, "/").httpAction(server.httpAction()).websocketAction(server.websocketAction());
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Further Reading

* Do you want to play something right now? Start with [archetype example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server) on your favorite platform.
* To take a brief look at API, check out the [testee](https://github.com/vibe-project/vibe-java-server/blob/82d93bb8dfed185de26528538ead45a991ef418c/server/src/test/java/org/atmosphere/vibe/server/ProtocolTest.java).
* To get details of API, see [API document]({{ site.baseurl }}/projects/vibe-java-server/3.0.0-Alpha1/apidocs/).
* To have a thorough knowledge of the implementation, read out the [reference]({{ site.baseurl }}/projects/vibe-java-server/3.0.0-Alpha1/reference/).
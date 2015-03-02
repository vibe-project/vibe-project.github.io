---
layout: project
title: Vibe Java Server
---

Vibe Java Server <sup><strong>A</strong></sup> is a simple <sup><strong>B</strong></sup>, scalable <sup><strong>C</strong></sup> Java server designed to run any framework or platform on Java Virtual Machine <sup><strong>D</strong></sup>.

<dl>
    <dt>A</dt>
    <dd><a href="/projects/vibe-protocol/3.0.0-Alpha12">Vibe 3.0.0-Alpha12</a> server.</dd>
    <dt>B</dt>
    <dd>All the interfaces you need to know are <code>Server</code> and <code>ServerSocket</code>. Indeed.</dd>
    <dt>C</dt>
    <dd>Shared nothing architecture is adopted to help scale application horizontally with ease.</dd>
    <dt>D</dt>
    <dd>Because it is built on Vibe Java Platform, you can run your application on any platform where it supports seamlessly i.e. Atmosphere, Grizzly, Java WebSocket API, Netty, Play, Servlet and Vert.x.</dd>
</dl> 

---

## Quick Start
Vibe Java Server is distributed through Maven Central. A single artifact, <code>org.atmosphere:vibe-server:3.0.0-Alpha15</code>, is enough for general purpose and thanks to [Vibe Java Platform](/projects/vibe-java-platform/), your application can run on any framework or platform it supports.

```xml
<dependency>
    <groupId>org.atmosphere</groupId>
    <artifactId>vibe-server</artifactId>
    <version>3.0.0-Alpha15</version>
</dependency>
<dependency>
    <groupId>org.atmosphere</groupId>
    <artifactId>vibe-platform-bridge-atmosphere2</artifactId>
    <version>3.0.0-Alpha9</version>
</dependency>
```

Once you've set up the build, you will be able to write the following [echo and chat](/projects/vibe-protocol/3.0.0-Alpha12/reference/#example) server that can run on Servlet containers Atmosphere 2 supports i.e. Tomcat, Jetty and so on.

```java
import javax.servlet.*;
import javax.servlet.annotation.WebListener;

import org.atmosphere.cpr.ApplicationConfig;
import org.atmosphere.vibe.DefaultServer;
import org.atmosphere.vibe.Server;
import org.atmosphere.vibe.ServerSocket;
import org.atmosphere.vibe.platform.action.Action;
import org.atmosphere.vibe.platform.bridge.atmosphere2.VibeAtmosphereServlet;
import org.atmosphere.vibe.transport.http.HttpTransportServer;
import org.atmosphere.vibe.transport.ws.WebSocketTransportServer;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Server consumes transport and produces socket
        final Server server = new DefaultServer();
        // This part can be reused in other platform transparently
        server.socketAction(new Action<ServerSocket>() {
            @Override
            public void on(final ServerSocket socket) {
                System.out.println("The connection is established successfully and communication is possible");
                // Built-in events
                socket.errorAction(new Action<Throwable>() {
                    @Override
                    public void on(Throwable error) {
                        System.out.println("An error happens on the socket");
                        error.printStackTrace();
                    }
                });
                socket.closeAction(new VoidAction() {
                    @Override
                    public void on() {
                        System.out.println("The connection has been closed");
                    }
                });
                // Use-defined events
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
        
        // TransportServer consumes platform resources and produces transport
        HttpTransportServer httpTransportServer = new HttpTransportServer().transportAction(server);
        WebSocketTransportServer wsTransportServer = new WebSocketTransportServer().transportAction(server);
        
        // This part is about how to integrate the above transport servers with the platform, Atmosphere
        ServletContext context = event.getServletContext();
        Servlet servlet = new VibeAtmosphereServlet().httpAction(httpTransportServer).wsAction(wsTransportServer);
        ServletRegistration.Dynamic reg = context.addServlet(VibeAtmosphereServlet.class.getName(), servlet);
        reg.setAsyncSupported(true);
        reg.setInitParameter(ApplicationConfig.DISABLE_ATMOSPHEREINTERCEPTOR, Boolean.TRUE.toString());
        reg.addMapping("/vibe");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Further Reading

* To play something right now, start with [archetype example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server) on your favorite platform.
* To take a brief look at API, check out the [testee](https://github.com/vibe-project/vibe-java-server/blob/v3.0.0-Alpha15/server/src/test/java/org/atmosphere/vibe/ProtocolTest.java#L48-L102).
* To get details of API, see [API document](/projects/vibe-java-server/3.0.0-Alpha15/apidocs/).
* To have a thorough knowledge of the implementation, read out the [reference](/projects/vibe-java-server/3.0.0-Alpha15/reference/).
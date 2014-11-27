---
layout: post
title: "Untitled"
author: flowersinthesand
---

Servlet specification had been designed to bring the _Write Once, Run Anywhere_ paradigm to web applications, but it could not have lasted long. Because of the lack of support of asynchronous I/O, uncomfortable API, poor productivity and so on, many platform and application framework arose to replace or drop Servlet. That's why some author have had to specify application's target platform and do more work to support others.

By the same token, while I have developed embeddable web application, I have written abstract class for application and concrete class for platform. Later when I start to develop something similar I realized they are not reusuable so decided to create an abstraction layer for various web application platforms from high-level full-stack application frameworks like Play framework to low-level raw web servers like Netty to allow an application to run on as many platform as possible. It is the [Vibe Java Platform](/projects/vibe-java-platform).

Vibe Java Platform requires Java 7 and is distributed through Maven Central. To write application running on any platform Vibe Java Platform supports, you need only one artifact: `org.atmosphere:vibe-platform-server:3.0.0-Alpha6`.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server</artifactId>
        <version>3.0.0-Alpha6</version>
    </dependency>
</dependencies>
```

Once you've set up the build, all you need to do is to write actions consuming [`ServerHttpExchange`](/projects/vibe-java-platform/3.0.0-Alpha6/apidocs/org/atmosphere/vibe/platform/server/ServerHttpExchange.html) and [`ServerWebSocket`](/projects/vibe-java-platform/3.0.0-Alpha6/apidocs/org/atmosphere/vibe/platform/server/ServerWebSocket.html) and expose them. In other words, there is no things you have to do except that. As a simple example, let's write echo actions sending any incoming messages such as HTTP chunk and WebSocket data frame back.

```java
import org.atmosphere.vibe.platform.Action;
import org.atmosphere.vibe.platform.server.*;

public class EchoHandler {
    // You can use plain getter instead of public final field
    public final Action<ServerHttpExchange> httpAction = new Action<ServerHttpExchange>() {
        @Override
        public void on(final ServerHttpExchange http) {
            // Get the request header, content-type, and set it to the response header, content-type 
            http.setHeader("content-type", http.header("content-type"))
            // When a chunk is read from the request body
            .chunkAction(new Action<ByteBuffer>() {
                @Override
                public void on(ByteBuffer bytes) {
                    // Writes a read chunk to the response body
                    http.write(bytes);
                }
            })
            // When the request is fully read so the request is ended
            .endAction(new VoidAction() {
                @Override
                public void on() {
                    // Ends the response
                    http.end();
                }
            })
            // Reads the request body as binary to circumvent encoding issue
            .readAsBinary()
            // When some error happens in request-response exchange
            .errorAction(new Action<Throwable>() {
                @Override
                public void on(Throwable t) {
                    t.printStackTrace();
                }
            })
            // When the request is fully read and the response is fully written or the underlying connection is aborted
            .closeAction(new VoidAction() {
                @Override
                public void on() {
                    System.out.println("on close event");
                }
            });
        }
    };
    public final Action<ServerWebSocket> wsAction = new Action<ServerWebSocket>() {
        @Override
        public void on(final ServerWebSocket ws) {
            // When a text frame is arrived
            ws.textAction(new Action<String>() {
                @Override
                public void on(String data) {
                    // Sends it back
                    ws.send(data);
                }
            })
            // When a binary frame is arrived
            .binaryAction(new Action<ByteBuffer>() {
                @Override
                public void on(ByteBuffer bytes) {
                    // Sends it back
                    ws.send(bytes);
                }
            })
            // When some error happens in the connection
            .errorAction(new Action<Throwable>() {
                @Override
                public void on(Throwable t) {
                    t.printStackTrace();
                }
            })
            // When the connection is closed for any reason
            .closeAction(new VoidAction() {
                @Override
                public void on() {
                    System.out.println("on close event");
                }
            });
        }
    };
}
```

Generally while full-stack frameworks have very simplified API, raw servers have very delicate API so that features which can be abstracted are limited to their intersection. For example, Play framework which is one of such full-stack frameworks doesn't support protocol upgrade and it's not possible to implement WebSocket protocol using only `ServerHttpExchange`.

However, if you don't need such features, it doesn't matter. For example, [Vibe Java Server](/projects/vibe-java-server) implements Vibe Protocol using Vibe Java Platform. Likewise, it's possible to implement other similar protocol like Socket.IO, STOMP and WAMP based on Vibe Java Platform.

Now that we have actions consuming [`ServerHttpExchange`](/projects/vibe-java-platform/3.0.0-Alpha6/apidocs/org/atmosphere/vibe/platform/server/ServerHttpExchange.html) and [`ServerWebSocket`](/projects/vibe-java-platform/3.0.0-Alpha6/apidocs/org/atmosphere/vibe/platform/server/ServerWebSocket.html), to run these actions on the specific platform, we need to transform HTTP and WebSocket resources which that specific platform produces into `ServerHttpExchange` and `ServerWebSocket` and feed them into those actions. The module playing such a role is called bridge and Vibe Java Platform provides various bridges which matches with each platform's usage.

Let's run `EchoHandler` on Servlet 3 and Java WebSocket API 1 together using Atmosphere 2 platform. (Of course, you can use Servlet 3 platform and Java WebSocket API 1 platform together but it's uncomfortable and tedious comparing to Atmosphere 2.) Let's add the following bridge dependency.

```xml
<dependencies>
    <dependency>
        <groupId>org.atmosphere</groupId>
        <artifactId>vibe-platform-server-atmosphere2</artifactId>
        <version>3.0.0-Alpha6</version>
    </dependency>
</dependencies>
```

Then, through `VibeAtmosphereServlet`, you can configure resources to pass to `EchoHandler` and bridge the handler with an implementation of Servlet 3 and Java WebSocket API 1 such as Jetty 9 and Tomcat 8.

```java
import javax.servlet.*;
import javax.servlet.annotation.WebListener;

import org.atmosphere.cpr.ApplicationConfig;
import org.atmosphere.vibe.platform.Action;
import org.atmosphere.vibe.platform.server.*;
import org.atmosphere.vibe.platform.server.atmosphere2.VibeAtmosphereServlet;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // All you need to do for bridging is to expose actions
        EchoHandler handler = new EchoHandler();
        ServletContext context = event.getServletContext();
        // Atmosphere 2 platform provides a Servlet called VibeAtmosphereServlet 
        // to transform AtmosphereResource to ServerHttpExchange and ServerWebSocket
        ServletRegistration.Dynamic reg = context.addServlet(VibeAtmosphereServlet.class.getName(), new VibeAtmosphereServlet() {
            // When the web container produces Http request-response exchange
            @Override
            protected Action<ServerHttpExchange> httpAction() {
                // Consumes it
                return handler.httpAction;
            }
            
            // When the web container produces WebSocket connection
            @Override
            protected Action<ServerWebSocket> wsAction() {
                // Consumes it
                return handler.wsAction;
            }
        });
        // Except configuration required by Atmosphere 2 platform, 
        // you can configure everything just like dealing with a plain Servlet (actually we are already doing that) 
        reg.setAsyncSupported(true);
        reg.setInitParameter(ApplicationConfig.DISABLE_ATMOSPHEREINTERCEPTOR, Boolean.TRUE.toString());
        reg.addMapping("/echo");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

The same pattern applies when bridging application to other platform. Here is working examples. They demonstrate how to run Vibe Java Server written using Vibe Java Platform on each platform.

<ul class="inline-list">
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/atmosphere2">Atmosphere 2</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/grizzly2">Grizzly 2</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/netty4">Netty 4</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/play2">Play 2</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/servlet3-jwa1">Servlet 3 and Java WebSocket API 1</a></li>
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/vertx2">Vert.x 2</a></li>
</ul>

It's not the end. Some platform like JAX-RS 2 is based on the other platform and allows to deal with the underlying platform so that it's possible to run application on such platform without creating an additional bridge if the corresponding bridge is available. The general pattern is to share application between the platform and the underlying platform. Here is working examples for such cases.

<ul class="inline-list">
<li><a href="https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform-on-platform/jaxrs2-atmosphere2">JAX-RS 2 on Atmosphere 2</a></li>
</ul>

Your favorite platform is not supported? One of advantages of Vibe Java Platform is easy to extend. Just take a look how [Grizzly 2 bridge](https://github.com/vibe-project/vibe-java-platform/tree/master/grizzly2/src/main/java/org/atmosphere/vibe/platform/server/grizzly2) is written. Mostly, with more or less 300 lines, it's enough to write a bridge.
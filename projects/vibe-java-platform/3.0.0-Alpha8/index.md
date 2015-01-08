---
layout: project
title: Vibe Java Platform
---

Vibe Java Platform is a simple <sup><strong>A</strong></sup> abstraction layer <sup><strong>B</strong></sup> for full-stack web application frameworks <sup><strong>C</strong></sup> and raw web servers <sup><strong>D</strong></sup> running on Java Virtual Machine.

<dl>
    <dt>A</dt>
    <dd>All interface you need to know is <code>ServerHttpExchange</code> and <code>ServerWebSocket</code>. Indeed.</dd>
    <dt>B</dt>
    <dd>An application based on Vibe Java Platform can run on any supported platforms seamlessly.</dd>
    <dt>C</dt>
    <dd>For example, Play, Spring MVC and JAX-RS.</dd>
    <dt>D</dt>
    <dd>For example, Servlet, Grizzly and Netty.</dd>
</dl>

---

## Quick Start
Vibe Java Platform is distributed through Maven Central. To write web application running on any platform Vibe Java Platform supports, you need two artifacts: `org.atmosphere:vibe-platform-http:3.0.0-Alpha8` and `org.atmosphere:vibe-platform-ws:3.0.0-Alpha8`.

```xml
<dependency>
    <groupId>org.atmosphere</groupId>
    <artifactId>vibe-platform-http</artifactId>
    <version>3.0.0-Alpha8</version>
</dependency>
<dependency>
    <groupId>org.atmosphere</groupId>
    <artifactId>vibe-platform-ws</artifactId>
    <version>3.0.0-Alpha8</version>
</dependency>
```

Once you've set up the build, all you need to do is to write actions receiving `ServerHttpExchange` and `ServerWebSocket`. As a simple example, let's write echo actions sending any incoming messages such as HTTP chunk and WebSocket data frame back.

```java
import org.atmosphere.vibe.platform.action.Action;
import org.atmosphere.vibe.platform.http.ServerHttpExchange;
import org.atmosphere.vibe.platform.ws.ServerWebSocket;

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
            // When the request is fully read
            .endAction(new VoidAction() {
                @Override
                public void on() {
                    System.out.println("The end of request");
                    // Ends the response
                    http.end();
                }
            })
            // Reads the request body as binary to circumvent encoding issue
            .readAsBinary()
            // When the response is fully written
            .finishAction(new VoidAction() {
                @Override
                public void on() {
                    System.out.println("The end of response");
                }
            })
            // When some error happens in request-response exchange
            .errorAction(new Action<Throwable>() {
                @Override
                public void on(Throwable t) {
                    t.printStackTrace();
                }
            })
            // When the underlying connection is terminated
            .closeAction(new VoidAction() {
                @Override
                public void on() {
                    System.out.println("The end of request-response exchange");
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
                    System.out.println("The end of connection");
                }
            });
        }
    };
}
```

Of course, you can use plain getter instead of public final field. Now to run this handler on the specific platform, we need to transform HTTP and WebSocket resources the platform produced into `ServerHttpExchange` and `ServerWebSocket` and feed them into an instance of `EchoHandler`. The module playing such roles is called bridge and Vibe Java Platform provides various bridges which matches well with each platform's usage.

For example, to run `EchoHandler` on Servlet 3 and Java WebSocket API 1 together, you can use Atmosphere 2 platform. Let's add the following bridge dependency.

```xml
<dependency>
    <groupId>org.atmosphere</groupId>
    <artifactId>vibe-platform-bridge-atmosphere2</artifactId>
    <version>3.0.0-Alpha8</version>
</dependency>
```

Then, through `VibeAtmosphereServlet`, you can configure `EchoHandler` and run it on an implementation of Servlet 3 and Java WebSocket API 1 such as Jetty 9 and Tomcat 8.

```java
import javax.servlet.*;
import javax.servlet.annotation.WebListener;

import org.atmosphere.cpr.ApplicationConfig;
import org.atmosphere.vibe.platform.action.Action;
import org.atmosphere.vibe.platform.bridge.atmosphere2.VibeAtmosphereServlet;
import org.atmosphere.vibe.platform.http.ServerHttpExchange;
import org.atmosphere.vibe.platform.ws.ServerWebSocket;

@WebListener
public class Bootstrap implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        EchoHandler handler = new EchoHandler();
        ServletContext context = event.getServletContext();
        ServletRegistration.Dynamic reg = context.addServlet(VibeAtmosphereServlet.class.getName(), new VibeAtmosphereServlet() {
            @Override
            protected Action<ServerHttpExchange> httpAction() {
                return handler.httpAction;
            }
            
            @Override
            protected Action<ServerWebSocket> wsAction() {
                return handler.wsAction;
            }
        });
        reg.setAsyncSupported(true);
        reg.setInitParameter(ApplicationConfig.DISABLE_ATMOSPHEREINTERCEPTOR, Boolean.TRUE.toString());
        reg.addMapping("/echo");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

### Further Reading

* To get details of API, see [API document](/projects/vibe-java-platform/3.0.0-Alpha8/apidocs/).
* To have a thorough knowledge, read out the [reference](/projects/vibe-java-platform/3.0.0-Alpha8/reference/).
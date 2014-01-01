---
layout: home 
title: wes 
---
<div class="main-header-wrapper">
	<div class="row">
		<div class="large-12 columns">
			<div class="main-header">
				<h1>wes</h1>
				<p>Web Event Source.</p>
			</div>
		</div>
	</div>
</div>
<div class="row">
	<div class="large-12 columns">
		<div class="main">
			<p>The <strong>wes</strong> (Web Event Source) is an abstraction layer in the form of event source for various event-driven asynchronous web client and server that runs on the JVM allowing the end user to choose the desired library.</p>
			<p>An application written with <strong>wes</strong> can run on any supported server and client.</p>
		</div>
	</div>
</div>
<div class="features-header row">
	<div class="large-12 columns">
		<hr />
	</div>
</div>
<div class="row">
	<div class="large-12 columns">
		<dl class="tabs vertical" data-tab>
			<dd class="active"><a href="#panel-atmosphere2">Atmosphere 2</a></dd>
			<dd><a href="#panel-vertx2">Vert.x 2</a></dd>
			<dd><a href="#panel-play2">Play 2</a></dd>
		</dl>
		<div class="tabs-content vertical">
			<div class="content active" id="panel-atmosphere2">
{% capture panel %}
# Atmosphere 2
`wes-atmosphere2` module integrates wes application with the [Atmosphere 2](https://github.com/atmosphere/atmosphere/) which makes the application run on most servlet containers that support the Servlet Specification 2.3. That being said, this module requires Servlet 3.1 containers.

## Install
With Atmosphere, you can write a web application, a war project in Maven. Add the following dependency to your pom.xml or include it on your classpath.

```xml
<dependency>
    <groupId>io.github.flowersinthesand</groupId>
    <artifactId>wes-atmosphere2</artifactId>
    <version>${wes.version}</version>
</dependency>
```

To install a wes in Servlet environment, prepare `ServletContext`.

```java
@WebListener
public class Initializer implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // ServletContext
        ServletContext context = event.getServletContext());
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

Create a servlet of `AtmosphereServlet` and register it to `ServletContext` with some options.

```java
AtmosphereServlet servlet = context.createServlet(AtmosphereServlet.class);
ServletRegistration.Dynamic reg = context.addServlet("wes", servlet);
reg.setLoadOnStartup(0);
reg.setAsyncSupported(true);
// Path
reg.addMapping("/portal");
```

Define a `AtmosphereHandler` and add it to `AtmosphereFramework` mapping to the root path, `/`. In the handler, wrap a given resource with `AtmosphereServerWebSocket` if transport is WebSocket and request method is GET or with `AtmosphereServerHttpExchange` if transport is not WebSocket.

```java
AtmosphereFramework framework = servlet.framework();
framework.addAtmosphereHandler("/", new AtmosphereHandlerAdapter() {
    @Override
    public void onRequest(AtmosphereResource resource) throws IOException {
        if (resource.transport() == TRANSPORT.WEBSOCKET) {
            if (resource.getRequest().getMethod().equals("GET")) {
                // ServerWebSocket
                new AtmosphereServerWebSocket(resource);
            }
        } else {
            // ServerHttpExchange
            new AtmosphereServerHttpExchange(resource);
        }
    }
});
```

There are so many ways to bootstrap Atmosphere, however, if you don't know Atmosphere well, just follow the above way.
{% endcapture %}{{ panel | markdownify }}
			</div>
			<div class="content" id="panel-vertx2">
{% capture panel %}
# Vert.x 2
`wes-vertx2` module integrates wes application with the [Vert.x 2](http://vertx.io/) which is an event driven application framework.

## Install
Install via `vertx` or include the following module in a basic manner:

```
com.github.flowersinthesand~wes-vertx2~${wes.version}
```

To install a wes in Vert.x, prepare `Vertx`.

```java
public class Initializer extends Verticle {
    @Override
    public void start() {
        // Available as a protected field.
        vertx; 
    }
}
```

Using `Vertx`, create `HttpServer`, register a request handler and a websocket handler and start it.

```java
HttpServer httpServer = vertx.createHttpServer();
httpServer.requestHandler(requestHandler);
httpServer.websocketHandler(websocketHandler);
httpServer.listen(8080);
```

In the handlers, check path, wrap a given event with `VertxServerHttpExchange` or `VertxServerWebSocket` and dispatch them to somewhere.

```java
Handler<HttpServerRequest> requestHandler = new Handler<HttpServerRequest>() {
    @Override
    public void handle(HttpServerRequest req) {
        // Path
        if (req.path().startsWith("/portal")) {
            // ServerHttpExchange
            new VertxServerHttpExchange(req);
        }
    }
};
Handler<org.vertx.java.core.http.ServerWebSocket> websocketHandler = new Handler<org.vertx.java.core.http.ServerWebSocket>() {
    @Override
    public void handle(org.vertx.java.core.http.ServerWebSocket socket) {
        // Path
        if (socket.path().startsWith("/portal")) {
            // ServerWebSocket
            new VertxServerWebSocket(socket);
        }
    }
};
```
{% endcapture %}{{ panel | markdownify }}
			</div>
			<div class="content" id="panel-play2">
{% capture panel %}
# Play 2
`wes-play2` module integrates wes application with the [Play framework](http://www.playframework.org/) 2 which is a high productivity Java and Scala web application framework. 

## Install
Add the following dependency to your `build.sbt`:

```scala
"io.github.flowersinthesand" % "wes-play2" % "${wes.version}"
```

To install a wes in Play, write a controller in Java.

```java
public class Application extends Controller {
    @BodyParser.Of(BodyParser.TolerantText.class)
    public static Result http() {
        final Request request = request();
        final Response response = response();
        return ok(new Chunks<String>(JavaResults.writeString(Codec.utf_8())) {
            @Override
            public void onReady(Chunks.Out<String> out) {
                // ServerHttpExchange
                new PlayServerHttpExchange(request, response, out);
            }
        });
    }

    public static WebSocket<String> ws() {
        final Request request = request();
        return new WebSocket<String>() {
            @Override
            public void onReady(WebSocket.In<String> in, WebSocket.Out<String> out) {
                // ServerWebSocket
                new PlayServerWebSocket(request, in, out);
            }
        };
    }
}
```

Add new routes for the controller to `routes`. In this case, uri can't be shared. 
```
GET     /portal                  controllers.Application.http()
GET     /portal/ws               controllers.Application.ws()
```

### Sharing uri
If you want to share uri for http and ws entry, write `Global.scala` and override `onRouteRequest`. It's not easy to do that in Java, if any.

Note that this is an internal API and not documented. Actually, these API have broken in minor release and even in patch release. The following code works in `2.2.0`.

```scala
import controllers.{Application => T}
 
object Global extends GlobalSettings {
  override def onRouteRequest(req: RequestHeader): Option[Handler] = {
    if (req.path == "/portal") {
      if (req.method == "GET" && req.headers.get("Upgrade").exists(_.equalsIgnoreCase("websocket"))) {
        Some(JavaWebSocket.ofString(T.ws))
      } else {
        Some(new JavaAction {
          val annotations = new JavaActionAnnotations(classOf[T], classOf[T].getMethod("http"))
          val parser = annotations.parser
          def invocation = Promise.pure(T.http)
        })
      }
    } else {
      super.onRouteRequest(req)
    }
  }
}
```

However, I'm not familiar with Scala. If you have a good idea to improve this, please let me know that.
{% endcapture %}{{ panel | markdownify }}
			</div>
		</div>
	</div>
</div>

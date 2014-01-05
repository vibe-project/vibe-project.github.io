---
layout: documentation
title: Play 2
---

# Play 2
This bridge integrates wes application with the [Play framework](http://www.playframework.org/) 2 which is a high productivity Java and Scala web application framework.

Because I'm not familiar with Scala, I used Play's Java API. Be aware of package name when importing class and note there are some quirks in [PlayServerHttpExchange]({{ site.baseurl }}/documentation/0.1.0-SNAPSHOT/apidocs/io/github/flowersinthesand/wes/play/PlayServerHttpExchange.html).

**If you have an idea to solve the quirks or improve usability even in introducing scala, please open a pull request.**

## Install
Add the following dependency to your `build.sbt`:

```scala
"io.github.flowersinthesand" % "wes-play2" % "${wes.version}"
```

## Run

### Simplest

There are things you have to specify in advance and quirks in controller. That's why helper is not provided.

### Without helper

You need to write entry point for HTTP request and WebSocket in `Controller`.

```java
// Don't confuse Play's Java API and Scala API
import play.api.mvc.Codec;
import play.core.j.JavaResults;
import play.mvc.BodyParser;
import play.mvc.Controller;
import play.mvc.Http.Request;
import play.mvc.Http.Response;
import play.mvc.Result;
import play.mvc.WebSocket;

public class Bootstrap extends Controller {

    // Assume Portal is wes application
    static Portal portal;

    // Specify body type to text
    @BodyParser.Of(BodyParser.TolerantText.class)
    public static Result http() {
        // Grab request and response
        final Request request = request();
        final Response response = response();
        // Specify status and content type
        return ok(new Chunks<String>(JavaResults.writeString(Codec.utf_8())) {
            @Override
            public void onReady(Chunks.Out<String> out) {
                portal.httpAction().on(new PlayServerHttpExchange(request, response, out));
            }
        });
    }
    
    // Specify message type to text
    public static WebSocket<String> ws() {
        // Grab request
        final Request request = request();
        return new WebSocket<String>() {
            @Override
            public void onReady(WebSocket.In<String> in, WebSocket.Out<String> out) {
                portal.websocketAction().on(new PlayServerWebSocket(request, in, out));
            }
        };
    }

}
```

Add new routes for the controller to `routes`. 

```
GET     /portal                  controllers.Bootstrap.http()
GET     /portal/ws               controllers.Bootstrap.ws()
```

#### Sharing URI
If you want to share URI for HTTP and WebSocket entries, remove routes from `routes`, write `Global.scala` and override `onRouteRequest`. It's not easy to do that in Java, if any.

Note that this is an internal API and not documented. Actually, these API have broken in minor release and even in patch release. I've confirmed the following code works in `2.2.0`.

```scala
// Controller class is required
import controllers.{Bootstrap => T}
 
object Global extends GlobalSettings {
  override def onRouteRequest(req: RequestHeader): Option[Handler] = {
    // Check path
    if (req.path == "/portal") {
      // If WebSocket
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
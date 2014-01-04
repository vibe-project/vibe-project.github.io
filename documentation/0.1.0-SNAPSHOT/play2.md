---
layout: documentation
title: Play 2
---

# Play 2
This bridge integrates wes application with the [Play framework](http://www.playframework.org/) 2 which is a high productivity Java and Scala web application framework.

Because I'm not familiar with Scala, I used Play's Java API. Be aware of package name when importing class and note there are some quirks in [PlayServerHttpExchange]({{ site.baseurl }}/documentation/0.1.0-SNAPSHOT/apidocs/io/github/flowersinthesand/wes/play/PlayServerHttpExchange.html). If you have an idea to solve the quirks even in introducing scala, please open a pull request.

## Install
Add the following dependency to your `build.sbt`:

```scala
"io.github.flowersinthesand" % "wes-play2" % "${wes.version}"
```

## Run

```java
import play.api.mvc.Codec;
import play.core.j.JavaResults;
import play.mvc.BodyParser;
import play.mvc.Controller;
import play.mvc.Http.Request;
import play.mvc.Http.Response;
import play.mvc.Result;
import play.mvc.WebSocket;

public class Application extends Controller {

    @BodyParser.Of(BodyParser.TolerantText.class)
    public static Result http() {
        final Request request = request();
        final Response response = response();
        return ok(new Chunks<String>(JavaResults.writeString(Codec.utf_8())) {
            @Override
            public void onReady(Chunks.Out<String> out) {
                new PlayServerHttpExchange(request, response, out);
            }
        });
    }
    
    public static WebSocket<String> ws() {
        final Request request = request();
        return new WebSocket<String>() {
            @Override
            public void onReady(WebSocket.In<String> in, WebSocket.Out<String> out) {
                new PlayServerWebSocket(request, in, out);
            }
        };
    }

}
```

```
GET     /portal                  controllers.Application.http()
GET     /portal/ws               controllers.Application.ws()
```

1. Write `Controller`.
1. Write an entry point for HTTP.
    1. Annotate with `@BodyParser.Of(BodyParser.TolerantText.class)`.
    1. Grab request and response.
    1. Return `Chunks` with `Status`.
    1. In `onReady`, create `PlayServerHttpExchange`
    1. Dispatch it to wes application.
1. Write an entry point for WebSocket
    1. Set return type to `WebSocket<String>`.
    1. Grab request.
    1. Return `WebSocket`.
    1. In `onReady`, create `PlayServerWebSocket`.
    1. Dispatch it to wes application.
1. Add new routes for the controller to `routes`. 

### Sharing URI
If you want to share URI for HTTP and WebSocket entries, remove routes from `routes`, write `Global.scala` and override `onRouteRequest`. It's not easy to do that in Java, if any.

Note that this is an internal API and not documented. Actually, these API have broken in minor release and even in patch release. I've confirmed the following code works in `2.2.0`.

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
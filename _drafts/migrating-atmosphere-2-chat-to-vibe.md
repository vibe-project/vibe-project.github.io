---
layout: post
title: "Migrating Atmosphere 2 Chat to Vibe"
author: flowersinthesand
---

The complete support of Atmosphere 2 is still ongoing but the current Vibe may meet your requirements. Let's take a look how Atmosphere's popular [chat example application](https://github.com/Atmosphere/atmosphere-samples/tree/master/samples/chat) can be migrated into Vibe. That application should meet the followings:

* URI is `http://localhost:8080/chat`
* If a client sends `message` event, a server sends broadcasts it to every client that connected to the server.

## Server
`src/main/java/org/atmosphere/samples/chat/Bootstrap.java` substitutes `src/main/webapp/WEB-INF/web.xml` and `src/main/java/org/atmospheres/samples/chat/Chat.java`. For the sake of convenience, Java 8's lambda expressions is used here but the example is written in Java 7. `$` is just unused variable.

```java
@WebListener
public class Bootstrap implements ServletContextListener {
    private final Logger logger = LoggerFactory.getLogger(Bootstrap.class);
    private final ObjectMapper mapper = new ObjectMapper();
    
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // A
        final Server server = new DefaultServer(); 
        // B
        server.socketAction((ServerSocket socket) -> {
            logger.info("{} is opened", socket.id());
            // C
            socket.closeAction($ -> logger.info("{} is closed", socket.id()));
            // D
            socket.errorAction((Throwable t) -> logger.info("{} got an error {}", socket.id(), t));
            // E
            socket.on("heartbeat", $ -> logger.info("heartbeat sent by {}", socket.id()));
            // F
            socket.on("message", (Map<String, Object> data) -> {
                Message message = mapper.convertValue(data, Message.class);
                logger.info("{} just sent {}", message.getAuthor(), message.getMessage());
                // G
                server.all().send("message", message);
            });
        });
        // H
        new AtmosphereBridge(event.getServletContext(), "/chat").httpAction(server.httpAction()).websocketAction(server.websocketAction());
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
}
```

* **A** `final Server server = new DefaultServer();`

`Server` is a facade to the Vibe API. You can instantiate `Server` by yourself unlike the typical usage of Atmosphere, which means you have the full right to decide how you will use it. For example, to inject `Server` to anywhere you want, you can delegate it to Dependency Injection framework by yourself. [See the working examples](https://github.com/vibe-project/vibe-examples#by-dependency-injection).

* **B** `server.socketAction((ServerSocket socket) -> {});`

As a controller to handle socket, `Server` accepts a function similar to `AtmosphereHandler`. Because `server.socketAction` allows to add several actions before and after installation, you can write a POJO controller by injecting `Server` like `@ManagedService`. For example, with the help of [Spring](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/dependency-injection/spring4):

```java
@Component
public class Chat {
    @Autowired
    private Server server;

    @PostConstruct
    public init() {
        server.socketAction((ServerSocket socket) -> {});
    }
}
```

An action added via `socketAction` receives a opened `ServerSocket` like a method annotated with `@Ready`.

* **C** `socket.closeAction($ -> {});`

`ServerSocket` allows to add event handlers in the form of functional interface through `on` method, which is convenient to use Java 8's lambda expressions. `closeAction($ -> {})` which is equals to `on("close", $ -> {})` is called when a socket is closed for some reason like a method annotated with `@Disconnect`.

* **D** `socket.errorAction((Throwable throwable) -> {});`

Because `close` event is called without argument, you may wonder how socket was closed. If it was due to some error, `errorAction(throwable -> {})` which is equals to `on("error", throwable -> {})` is executed with `Throwable` in question before `close` event.

* **E** `socket.on("heartbeat", $ -> {});`

The heartbeat plays an important role in maintaining a connection in Vibe as well as Atmosphere. In Vibe, it's implemented using custom event. You can hear heartbeat by adding `heartbeat` event handler like a method annotated with `@Heartbeat`.

* **F** `socket.on("message", (Map<String, Object> data) -> {});`

The unit of to be received and sent of Atmosphere is a plain string but that of Vibe is an event object. Therefore, the `message` event has no special meaning and is just yet another custom event like `heartbeat`. That event handler is called when a client sends a `message` event like a method annotated with `@Message`. Event data's type depends on the event format and here because the event format is JSON and the client is supposed to send an object to `message` event, `Map<String, Object>` is the corresponding type of `message` event and vice versa. You can use any event name except reserved ones like `close` and `error`.

Also since object is exchanged, there is no concept of `Encoder` and `Decoder`. But, using a plain map is inconvenient sometimes. Then, you can convert its type using library like Jackson or Apache Commons BeanUtils.

* **G** `server.all().send("message", message);`

To broadcast an event to every client, you can use `server.all().send(event, data)` like using `Broadcaster.broadcast` or using an return value of a method annotated with `@Message`. Otherwise instead you can handle each socket:

```java
socket.on("message", data -> server.all(socket -> socket.send("message", data)));
```

Though, notifying something of every client is not common. Practically, you will utilize tag a lot to handle a group of socket:

```java
socket.tag("room").on("message", data -> server.byTag("room").send("message", data));
```

Also it's possible to attach callbacks receiving the result of event processing when sending event and to handle that callback when receiving event:

```java
socket.send("/account/find", "donghwan", account -> System.out.println(account), reason -> System.err.println(reason));
socket.on("/account/find", reply -> {
    try {
        reply.resolve(entityManager.find(Account.class, reply.data()));
    } catch(Exception e) {
        reply.reject(e.getMessage());
    }
});
```

For details, [see the reference documentation](http://localhost:4000/projects/vibe-java-server/3.0.0-Alpha3/reference/).

* **H** `new AtmosphereBridge(servletContext, "/chat").httpAction(server.httpAction()).websocketAction(server.websocketAction());`

This part provides a bridge between `Server` and the underlying platform, Atmosphere. It installs and configures Atmosphere automatically so you don't need to manipulate `web.xml` (With Servlet 3, Atmosphere can be installed like this). Thankfully, Atmosphere provides a solid abstraction layer for Servlet containers and Vibe use it as a platform for Servlet containers.

You can replace the platform with others like Vert.x without modifying the code. [See the working examples](https://github.com/vibe-project/vibe-examples#by-platform).

## Client
Most code in `src/main/webapp/javascript/application.js` are not modified except socket handling.

```javascript
$(function () {
    "use strict";

    var content = $('#content');
    var input = $('#input');
    var status = $('#status');
    var myName = false;
    var author = null;
    var logged = false;

    // A
    var socket = vibe.open("/chat");
    // B
    socket.on("connecting", function() {
        content.html($('<p>', {text: 'Connecting to the server'}));
    });
    // C
    socket.on("open", function() {
        content.html($('<p>', {text: 'Connection opened'}));
        input.removeAttr('disabled').focus();
        status.text('Choose name:');
    });
    // D
    socket.on("error", function(error) {
        content.html($('<p>', {text: 'There was an error in connection ' + error.message}));
        logged = false;
    });
    // E
    socket.on("close", function() {
        content.html($('<p>', {text: 'Connection closed'}));
        input.attr('disabled', 'disabled');
    });
    // F
    socket.on("waiting", function(delay, attempts) {
        content.html($('<p>', {text: 'Trying to reconnect ' + delay + '. Reconnection attempts ' + attempts}));
    });
    // G
    socket.on("message", function(data) {
        if (!logged && myName) {
            logged = true;
            status.text(myName + ': ').css('color', 'blue');
        } else {
            var me = data.author == author;
            var date = typeof(data.time) == 'string' ? parseInt(data.time) : data.time;
            addMessage(data.author, data.message, me ? 'blue' : 'black', new Date(date));
        }
    });

    input.keydown(function(e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (author == null) {
                author = msg;
            }
            // H
            socket.send("message", {author: author, message: msg});
            $(this).val('');
            if (myName === false) {
                myName = msg;
            }
        }
    });

    function addMessage(author, message, color, datetime) {
        content.append('<p><span style="color:' + color + '">' + author + '</span> @ ' +
            + (datetime.getHours() < 10 ? '0' + datetime.getHours() : datetime.getHours()) + ':'
            + (datetime.getMinutes() < 10 ? '0' + datetime.getMinutes() : datetime.getMinutes())
            + ': ' + message + '</p>');
    }
});
```

* **A** `vibe.open("/chat");`

`vibe.open` opens a socket to a given URI like `atmosphere.subscribe(request)`. It takes an option object as a second argument, but since options like transport and heartbeat are set by the server in handshaking, you don't need to set them explicitly. Actually, you don't even need to be aware of what 'transport' is when using Vibe.

* **B** `socket.on("connecting", () => {})`

`connecting` event is fired when the transport is selected and starts connecting to the server. This is a first event of socket's life cycle where you can handle socket.

* **C** `socket.on("open", () => {})`

`open` event is fired when the connection is established successfully and communication is possible like `request.onOpen`.

* **D** `socket.on("error", error => {})`

`error` event is fired when there is an error in connection with `error` object in question like `request.onError`, `request.onClientTimeout` and `request.onTransportFailure`. Unlike Atmosphere, there's nothing you should do for connection in this event.

* **E** `socket.on("close", () => {})`

`close` event is fired when the connection has been closed, has been regarded as closed or could not be opened like `request.onClose`. Regardless of whether the connection is closed normally or abnormally, this event is always fired on disconnection. If you've disabled reconnection, this event is a destination of socket's life cycle. Here, since reconnection is enabled by default, next `waiting` event will be fired.

* **F** `socket.on("waiting", (delay, attempts) => {})`

`waiting` event is fired when the reconnection is scheduled with the reconnection delay in milliseconds and the total number of reconnection attempts like `request.onReconnect`. The socket will connect to the server after the reconnection delay and then new life cycle starts and `connecting` event will be fired.

* **G** `socket.on("message", data => {})`

As mentioned in above, `message` event is just yet another custom event you can use and `data` is JSON object not string as the server sent an object so that you don't need to parse it to JSON.

Also you may notice that message event handler actually does two things: setting username and broadcasting a message. That was necessary in Atmosphere since `request.onMessage` is the only handler receiving message from server. But in Vibe, you can split message event into two other events for separation of concerns using custom event.

* **H** `socket.send("message", {author: author, message: msg})`

As mentioned in above, you can send an event with object data so that you don't need to format object to JSON. If you formatted it to string, the server will receive that string not object.

## Getting this example
You can find this example on [GitHub](https://github.com/vibe-project/vibe-examples/tree/master/migration/atmosphere2/).
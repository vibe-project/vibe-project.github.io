---
layout: project
title: Vibe Protocol API
---

<h1>API</h1>

---

**Table of Contents**

* [module "vibe-protocol"](#module--vibe-protocol-)
    * [export function client(): Client](#export-function-client--:-client)
    * [export function server(): Server](#export-function-server--:-server)
    * [interface Client](#interface-client)
        * [open (uri: string, options?: SocketOptions): Socket](#open--uri:-string--options-:-socketoptions-:-socket)
    * [interface SocketOptions](#interface-socketoptions)
        * [transport: string](#transport:-string)
    * [interface Server](#interface-server)
        * [handleRequest (req: http.IncomingMessage, res: http.ServerResponse): void](#handlerequest--req:-http.incomingmessage--res:-http.serverresponse-:-void)
        * [handleUpgrade (req: http.IncomingMessage, socket:net.Socket, head: buffer.Buffer): void](#handleupgrade--req:-http.incomingmessage--socket:net.socket--head:-buffer.buffer-:-void)
        * [on(event: string, handler: Function): Server](#on-event:-string--handler:-function-:-server)
            * [socket (socket: Socket): void](#socket--socket:-socket-:-void)
        * [setTransports (transports: string[]): void](#settransports--transports:-string---:-void)
        * [setHeartbeat (heartbeat: number): void](#setheartbeat--heartbeat:-number-:-void)
        * [set_heartbeat (_heartbeat: number): void](#set_heartbeat--_heartbeat:-number-:-void)
    * [interface Socket](#interface-socket)
        * [close(): Socket](#close--:-socket)
        * [on(event: string, handler: Function): Socket](#on-event:-string--handler:-function-:-socket)
            * [open (): void](#open---:-void)
            * [close (): void](#close---:-void)
            * [[event: string]: (data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void](#-event:-string-:--data-:-any--reply-:--resolve:--data-:-any-----void--reject:--data-:-any-----void------void)
        * [send(event: string, data?: any, resolved?: (data?: any) => void, rejected?: (data?: any) => void): Socket](#send-event:-string--data-:-any--resolved-:--data-:-any-----void--rejected-:--data-:-any-----void-:-socket)

---

## `module "vibe-protocol"`
This module contains the reference implementation of the Vibe server and client. If you are unfamiliar to Node.js or JavaScript, don't worry and just focus on the following example. To run example, write `server.js` and `client.js` by copy and paste to the folder where you have installed `vibe-protocol` module. Then, open two consoles, type `node server` and `node client` respectively.

_Echo and Chat_

This example is very simple but demonstrates essential functionalities of the protocol so that if you are going to implement the protocol, I recommend you to port this example to your implementation and use it as quick start guide.

* URI is `http://localhost:8080/vibe`. 
* `echo` event is sent back to the client that sent the event.
* `chat` event is broadcasted to every client that connected to the server.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
`server.js`

```javascript
var http = require("http");
var url = require("url");
var vibe = require("vibe-protocol");
var server = vibe.server();
var sockets = [];

server.on("socket", function(socket) {
    // To provide a repository of opened socket 
    sockets.push(socket);
    socket.on("close", function() {
        // Equal to sockets.remove(socket);
        sockets.splice(sockets.indexOf(socket), 1);
        console.log("on close event");
    });
    // Actions for echo and chat events
    socket.on("echo", function(data) {
        console.log("on echo event:", data);
        socket.send("echo", data);
    })
    .on("chat", function(data) {
        console.log("on chat event:", data);
        sockets.forEach(function(socket) {
            socket.send("chat", data);
        });
    });
});

http.createServer().on("request", function(req, res) {
    if (url.parse(req.url).pathname === "/vibe") {
        server.handleRequest(req, res);
    }
})
.on("upgrade", function(req, sock, head) {
    if (url.parse(req.url).pathname === "/vibe") {
        server.handleUpgrade(req, sock, head);
    }
})
.listen(8080);
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
`client.js`

```javascript
var vibe = require("vibe-protocol");
var client = vibe.client();
var socket = client.open("http://localhost:8080/vibe", {
    transport: "ws"
});

socket.on("open", function() {
    socket.send("echo", "An echo message");
    socket.send("chat", "A chat message");
})
.on("close", function() {
    console.log("on close event");
})
.on("chat", function(data) {
    console.log("on chat event:", data);
})
.on("echo", function(data) {
    console.log("on echo event:", data);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### `export function client(): Client`
Creates a vibe client that is a factory to create a socket working as standalone.

### `export function server(): Server`
Creates a vibe server that is installed by passing request and upgrade events dispatched by Node's HTTP/HTTPS server to the server.

### `interface Client`
Client is a factory to create a socket and expected as injectable component.

#### `open (uri: string, options?: SocketOptions): Socket`
It creates a socket, connects to the given URI with given options and returns it. It is an asynchronous operation so the returned socket must be connecting. Once the open event has been fired on the socket, I/O operations will be available.

### `interface SocketOptions`
An optional interface for client to establish a socket.

#### `transport: string`
A transport id. It's set by handshaking according to server's configuration so you don't need to set it explicitly unless you want to test something. These are available: `ws`, `sse`, `streamxhr`, `streamxdr`, `streamiframe`, `longpollajax`, `longpollxdr` and `longpolljsonp`. However none of them runs on browser so `streamxdr`, `streamiframe`, `longpollxdr` and `longpolljsonp` are not meaningful and just simulate their expected behaviors.

### `interface Server`
Server consumes HTTP and WebSocket resources and produces Socket and is expected as injectable component. It inherits [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

#### `handleRequest (req: http.IncomingMessage, res: http.ServerResponse): void`
Untainted req and res are expected to be passed from Node's HTTP/HTTPS server's request event.

#### `handleUpgrade (req: http.IncomingMessage, socket:net.Socket, head: buffer.Buffer): void`
Untainted req, socket and head are expected to be passed from Node's HTTP/HTTPS server's upgrade event.

#### `on(event: string, handler: Function): Server`
Adds a given event handler for a given event.

##### `socket (socket: Socket): void`
Fired when a socket representing client is opened. Its state is opened so I/O operations are possible.

#### `setTransports (transports: string[]): void`
A set of transport to allow connections. By default, it is set to `ws`, `sse`, `streamxhr`, `streamxdr`, `streamiframe`, `longpollajax`, `longpollxdr` and `longpolljsonp`.

#### `setHeartbeat (heartbeat: number): void`
A heartbeat interval value in milliseconds. A opened socket continuously sends a heartbeat event to the server each time the value has elapsed. Actually, the socket sends the event 5 seconds before the heartbeat timer expires to wait the server's echo. If the event echoes back within 5 seconds, the socket reset the timer. Otherwise, the close event is fired. For that reason, the value must be larger than `5000` and the default value is `20000`.

#### `set_heartbeat (_heartbeat: number): void`
It is the 5 seconds from the explanation for `heartbeat` and is in milliseconds unit. This is only for speeding up heartbeat tests.

### `interface Socket`
An interface representing the server if it's created by `vibe.client` or client if it's created by `vibe.server`. It inherits [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

#### `close(): Socket`
Closes the socket.

#### `on(event: string, handler: Function): Socket`
Adds a given event handler for a given event.

##### `open (): void`
Fired when a socket is opened. Only valid for socket obtained from the client, `vibe.client`.
 
##### `close (): void`
Fired when a socket is closed for any reason.

##### `[event: string]: (data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void`
Fired when the counterpart sends an event. If the counterpart attaches resolved or rejected callbacks, reply object will be provided.

#### `send(event: string, data?: any, resolved?: (data?: any) => void, rejected?: (data?: any) => void): Socket`
Sends an event with given event name and data attaching resolved and rejected callbacks.
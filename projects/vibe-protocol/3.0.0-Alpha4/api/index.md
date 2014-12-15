---
layout: project
title: Vibe Protocol API
---

<h1>API</h1>

---

**Table of Contents**

* [module "vibe-protocol"](#module--vibe-protocol-)
    * [export function open (uri: string, options?: SocketOptions): Socket](#export-function-open--uri:-string--options-:-socketoptions-:-socket)
    * [export function server(): Server](#export-function-server--:-server)
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
            * [error (error: Error): void](#error--error:-error-:-void)
            * [close (): void](#close---:-void)
            * [[event: string]: (data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void](#-event:-string-:--data-:-any--reply-:--resolve:--data-:-any-----void--reject:--data-:-any-----void------void)
        * [send(event: string, data?: any, resolved?: (data?: any) => void, rejected?: (data?: any) => void): Socket](#send-event:-string--data-:-any--resolved-:--data-:-any-----void--rejected-:--data-:-any-----void-:-socket)

---

## `module "vibe-protocol"`
This module contains the reference implementation of the Vibe server and client.

_Echo and Chat_

This example is very simple but demonstrates essential functionalities of the protocol so that if you are going to implement the protocol, I recommend you to port this example to your implementation and use it as quick start guide.

To run example, write `server.js` and `client.js` by copy and paste to the folder where you have installed `vibe-protocol` module. Then, open two consoles, type `node server` and `node client` respectively.

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
    socket.on("error", function(error) {
        console.log("on error event", error);
    })
    .on("echo", function(data) {
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
var socket = vibe.open("http://localhost:8080/vibe");

socket.on("open", function() {
    socket.send("echo", "An echo message");
    socket.send("chat", "A chat message");
})
.on("error", function(error) {
    console.log("on error event", error);
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

### `export function open (uri: string, options?: SocketOptions): Socket`
Creates a socket and returns it. The socket starts connecting to the given URI. Because it is an asynchronous operation, the returned socket must be in connecting state. Once the `open` event has been fired on the socket, I/O operations will be available.

### `export function server(): Server`
Creates a vibe server that is installed by passing request and upgrade events dispatched by Node's HTTP/HTTPS server to the server.

### `interface SocketOptions`
An optional interface for client to establish a socket.

#### `transport: string`
A transport id. These are available: `ws`, `stream` and `longpoll`.

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

#### `setHeartbeat (heartbeat: number): void`
A heartbeat interval value in milliseconds. A opened socket continuously sends a heartbeat event to the server each time the value has elapsed. Actually, the socket sends the event 5 seconds before the heartbeat timer expires to wait the server's echo. If the event echoes back within 5 seconds, the socket reset the timer. Otherwise, the close event is fired. For that reason, the value must be larger than `5000` and the default value is `20000`.

#### `set_heartbeat (_heartbeat: number): void`
It is the 5 seconds from the explanation for `heartbeat` and is in milliseconds unit. This is only for speeding up heartbeat tests.

### `interface Socket`
An interface representing the server if it's created by `vibe.open` or client if it's created by `vibe.server`. It inherits [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

#### `close(): Socket`
Closes the socket.

#### `on(event: string, handler: Function): Socket`
Adds a given event handler for a given event.

##### `open (): void`
Fired when a socket is opened. Only valid for client socket created by `vibe.open`. In server, socket given through `socket` event is already opened.
 
##### `error (error: Error): void`
Fired when an error occurs.

##### `close (): void`
Fired when a socket is closed for any reason. If it was due to some error, error event will be fired before close event.

##### `[event: string]: (data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void`
Fired when the counterpart sends an event. If the counterpart attaches resolved or rejected callbacks, reply object will be provided.

#### `send(event: string, data?: any, resolved?: (data?: any) => void, rejected?: (data?: any) => void): Socket`
Sends an event with given event name and data attaching resolved and rejected callbacks.
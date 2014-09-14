---
layout: project
title: Vibe Protocol Reference
---

<h1>Reference</h1>

---

**Table of Contents**

* [Specification](#specification)
* [Reference Implementation](#reference-implementation)
    * [Installation](#installation)
    * [API](#api)
        * [export function client(): Client](#export-function-client--:-client)
        * [export function server(): Server](#export-function-server--:-server)
        * [interface Client](#interface-client)
        * [interface SocketOptions](#interface-socketoptions)
        * [interface Server](#interface-server)
        * [interface Socket](#interface-socket)
    * [Examples](#examples)
        * [Echo and Chat](#echo-and-chat)
    * [Interactive Mode](#interactive-mode)
* [Test Suite](#test-suite)
    * [Server Testee](#server-testee)
    * [Client Testee](#client-testee)
    * [Running Test](#running-test)
        * [Choosing Tests](#choosing-tests)

---

## Specification
The protocol consists of very protocol to provide reliable full duplex connection over HTTP and a set of optional extensions to provide elegant patterns.

Both parts are still under active development and it's not easy to maintain both reference implementation and specification document. Accordingly for now the reference implementation takes the place of the specification document.

---

## Reference Implementation
To help understand and implement the protocol, reference implementation is provided. It is written in easy-to-read JavaScript with a lot of detailed notes you should be aware of. Also you can use it to verify your implementation casually and as the counterpart in your examples. See annotated source codes:

<ul class="inline-list">
    <li><a href="../docs/server.html">Server</a></li>
    <li><a href="../docs/client.html">Client</a></li>
</ul>

**Note**

* They are not for production use.

### Installation
First you need to install [Node.js](http://nodejs.org). Then type the following to install the reference implementation:

```bash
npm install vibe-protocol
```

### API
To load the module, type the following to Node console or JavaScript file.

```javascript
var vibe = require("vibe-protocol");
```

#### `export function client(): Client`
Creates a vibe client that is a factory to create a socket.

```javascript
var vibe = require("vibe-protocol");
var client = vibe.client();
var socket = client.open("http://localhost:8080/", {transport: "ws"});

socket.on("open", function() {
    socket.send("echo", "Hello World");
});
```

#### `export function server(): Server`
Creates a vibe server that is installed by passing request and upgrade events dispatched by Node's HTTP/HTTPS server to the server.

```javascript
var vibe = require("vibe-protocol");
var server = vibe.server();

server.on("socket", function(socket) {
    socket.on("echo", function(data) {
        socket.send("echo", data);
    });
});

require("http").createServer().on("request", server.handleRequest).on("upgrade", server.handleUpgrade).listen(8080);
```

#### `interface Client`
An interface to represent a client.

##### `open (uri: string, options?: SocketOptions): Socket`
It creates a socket, connects to the given URI with given options and returns it. It is an asynchronous operation so the returned socket must be connecting. Once the open event has been fired on the socket, I/O operations will be available.

#### `interface SocketOptions`
An interface to establish a socket.

##### `heartbeat`
A heartbeat interval value in milliseconds. A opened socket continuously sends a heartbeat event to the server each time the value has elapsed. Actually, the socket sends the event 5 seconds before the heartbeat timer expires to wait the server's echo. If the event echoes back within 5 seconds, the socket reset the timer. Otherwise, the close event is fired. For that reason, the value must be larger than `5000` and the default value is `20000`. Set `false` to disable.
 
##### `_heartbeat`
It is the 5 seconds from the explanation for `heartbeat` and is in milliseconds unit. This is only for speeding up heartbeat tests.

##### `transport`
A transport id. It's required. Transport is a private interface used to establish a connection, send data, receive data and close the connection. These are available: `ws`, `sse`, `streamxhr`, `streamxdr`, `streamiframe`, `longpollajax`, `longpollxdr` and `longpolljsonp`. However none of them runs on browser so `streamxdr`, `streamiframe`, `longpollxdr` and `longpolljsonp` are not meaningful and just simulate their expected behaviors.  

#### `interface Server`
An interface to represent a server. It inherits [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

##### `handleRequest (req: http.IncomingMessage, res: http.ServerResponse): void`
It consumes HTTP exchange to establish HTTP based transports. Untainted req and res are expected to be passed from Node's HTTP/HTTPS server's request event.

##### `handleUpgrade (req: http.IncomingMessage, socket:net.Socket, head: buffer.Buffer): void`
It consumes HTTP exchange to establish WebSocket transport. Untainted req, socket and head are expected to be passed from Node's HTTP/HTTPS server's upgrade event.

##### `on(event: string, handler: Function): Server`
Adds a given event handler for a given event.

* `socket (socket: Socket): void`: fired when a socket representing client is opened. It's opened so I/O operations are possible.

#### `interface Socket`
An interface representing the server if it's created by `vibe.client` or client if it's created by `vibe.server`. It inherits [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

##### `close(): Socket`
Closes the socket.

##### `on(event: string, handler: Function): Socket`
Adds a given event handler for a given event.

* `open (): void`: fired when a socket is opened. Only valid for socket obtained from the client, `vibe.client`. 
* `close (): void`: fired when a socket is closed for any reason.
* `[event: string]: (data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void`: fired when the counterpart sends an event. If the counterpart attaches resolved or rejected callbacks, reply object will be provided.

##### `send(event: string, data?: any, resolved?: (data?: any) => void, rejected?: (data?: any) => void): Socket`
Sends an event with given event name and data attaching resolved and rejected callbacks.

### Examples
To run example, write `server.js` and `client.js` by copy and paste to the folder where you have installed `vibe-protocol` module. Then, open two consoles, type `node server` and `node client` respectively.

#### Echo and Chat
<div class="row">
<div class="large-6 columns">
{% capture panel %}
`server.js`

```javascript
var vibe = require("vibe-protocol");
var server = vibe.server();
var sockets = [];

server.on("socket", function(socket) {
    // To provide a repository of opened socket 
    sockets.push(socket);
    socket.on("close", function() {
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

require("http").createServer()
.on("request", server.handleRequest)
.on("upgrade", server.handleUpgrade).listen(8000);
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
`client.js`

```javascript
var vibe = require("vibe-protocol");
var client = vibe.client();
var socket = client.open("http://localhost:8000/", {transport:"ws"});

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

### Interactive Mode
JavaScript is a dynamic language so you can deal with both client and server in an interactive mode. Open two Node console, copy the following scripts and paste into the each console.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
var vibe = require("vibe-protocol");
var client = vibe.client();
var socket = client.open("http://localhost:8000/", {transport:"ws"});

socket.on("open", function() {
    console.log("socket");
});
```

Once `socket` have been logged, you can access the opened socket by `socket` in the console.

```javascript
socket.on("greeting", function(data) {
    console.log("greetings from the server:", data);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Server**

```javascript
var vibe = require("vibe-protocol");
var server = vibe.server();
var httpServer = require("http").createServer();
var sockets = [];

httpServer.on("request", server.handleRequest);
httpServer.on("upgrade", server.handleUpgrade);
httpServer.listen(8000);

server.on("socket", function(socket) {
    console.log("sockets[", (sockets.push(socket) - 1), "]");
});
```

Once `sockets[ 0 ]` have been logged, you can access the opened socket by `sockets[0]` in the console.

```javascript
sockets[0].send("greeting", "Hello World");
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

---

## Test Suite
Test suite is provided to help write and verify implementation. Tests are written in JavaScript with the help of reference implementation and runs by [Mocha](http://visionmedia.github.io/mocha/), JavaScript test framework, in Node.js.

Tests consist of two parts: protocol (required) and extension (optional) and a series of tests are executed per transport. By default both client and server test suites will run all unit tests including from protocol part and extension part for all the available transports: `ws`, `sse`, `streamxhr`, `streamxdr`, `streamiframe`, `longpollajax`, `longpollxdr` and `longpolljsonp`. Of course, you don't need to implement all transports and all extensions. Tests can run selectively.

To run the test suite, you need to write a testee which is a web server which brokers between test and your implementation to be tested. Because through writing testee, you will use most API of your implementation, showing your testee is good for explaining how to use your implementation.

### Server Testee
A testee to test server implementation should listen on port `8000`. Here is an [example](https://github.com/vibe-project/vibe-protocol/blob/master/test/testee/server.js) for testing server reference implementation.

#### Handling HTTP Request
According to the request path:

* `/alive`
    * Write `true` or `false` to the response according to whether a socket specified by the request param `id` is opened and end the response.
* `/open`
    * Make the implementation connect to the server setting URI to the request param `uri`, transport to the request param `transport`, heartbeat to the request param `heartbeat` or `false` if not exists and _heartbeat to the request param `_heartbeat` or `false` if not exists.

#### Handling Socket
According to the socket event:

* `echo`
    * Send `echo` event attaching the given data.

#### Testing Extension
According to the extension:

##### Reply
This extension uses two socket events:

* `/reply/inbound`
    * According to the event data's `type` property, execute a resolved callback if that type is `resolved` and a rejected callback if that type is `rejected` with `data` property of the given data as returning value.
* `/reply/outbound`
    * According to the event data's `type` property, send a `test` event with `data` property of the given data as data attaching a resolved callback if that type is `resolved` and a rejected callback if that type is `rejected`. In both callbacks, when the value is returned, it should send a `done` event with that value as data.

### Client Testee
A testee to test client implementation should listen on port `9000`. Here is an [example](https://github.com/vibe-project/vibe-protocol/blob/master/test/testee/client.js) for testing client reference implementation.

##### Handling HTTP Request
According to the request path:

* `/alive`
    * Write `true` or `false` to the response according to whether a socket specified by the request param `id` is opened and end the response.
* `/open`
    * Make the implementation connect to the server setting URI to the request param `uri`, transport to the request param `transport`, heartbeat to the request param `heartbeat` or `false` if not exists and _heartbeat to the request param `_heartbeat` or `false` if not exists.

##### Handling Socket
According to the socket event:

* `abort`
    * Close the socket.
* `echo`
    * Send `echo` event attaching the given data.

#### Testing Extension
According to the extension:

##### Reply
This extension uses two socket events:

* `/reply/inbound`
    * According to the event data's `type` property, execute a resolved callback if that type is `resolved` and a rejected callback if that type is `rejected` with `data` property of the given data as returning value.
* `/reply/outbound`
    * According to the event data's `type` property, send a `test` event with `data` property of the given data as data attaching a resolved callback if that type is `resolved` and a rejected callback if that type is `rejected`. In both callbacks, when the value is returned, it should send a `done` event with that value as data.
  
### Running Test
First you need to install [Node.js](http://nodejs.org). Then type the following to install this module locally and Mocha globally: 

```bash
npm install vibe-protocol
npm install mocha -g
```

Run your client/server testee. Once it's ready, open a console and run mocha.

* To test client implementation

    ```bash
    mocha ./node_modules/vibe-protocol/test/client.js
    ```
    
* To test server implementation

    ```bash
    mocha ./node_modules/vibe-protocol/test/server.js
    ```
    
And see the result on the console.

**Note**

* Because Node.js is small and can be installed locally, you can automate the protocol test programmatically by downloading Node.js, installing modules, running tests through spawning a process and checking that process' exit code.

#### Choosing Tests
To run tests selectively to include or exclude transports or extensions, you can use `grep` option from mocha. It is a JavaScript regular expression evaluating full test name.

The full test name of `should open a new socket` unit test in protocol part for `ws` transport in client test suite is 

```
client transport ws protocol open should open a new socket
```

and that of `should be able to resolve` unit test in `receiving replyable event` extension for `sse` transport in server test suite is 

```
server transport sse  extension receiving replyable event should be able to resolve
```

If you want to run unit tests only for `ws`, `sse` and `longpollajax` transport:

```bash
mocha ./node_modules/vibe-protocol/test/client.js --grep "ws|sse|longpollajax"
```

Note you should use `"` to escape `|` in Windows CMD and you can run mocha multiple times with different grep option if handling regular expression is annoying.
---
layout: project
title: Vibe Protocol Reference
---

<h1>Reference</h1>

---

**Table of Contents**

* [Reference Implementation](#reference-implementation)
    * [Installation](#installation)
    * [API](#api)
        * [export function open(uri: string, options?: SocketOptions): Socket](#export-function-open-uri:-string--options-:-socketoptions-:-socket)
        * [export function server(): Server](#export-function-server--:-server)
    * [Interactive Mode](#interactive-mode)
* [Test Suite](#test-suite)
    * [Testee](#testee)
    * [Running Test](#running-test)
        * [Choosing Tests](#choosing-tests)

---

## Reference Implementation
To help understand and implement the protocol, reference implementation is provided. It is written in easy-to-read JavaScript with a lot of detailed notes you should be aware of. Also you can use it to verify your implementation casually and as the counterpart in your examples. See annotated source codes:

<ul class="inline-list">
    <li><a href="../docs/server.html">Server</a></li>
    <li><a href="../docs/client.html">Client</a></li>
</ul>

**Note**

* They are not for production use.
* Focus on what should be done not minding interface.

### Installation
First you need to install [Node.js](http://nodejs.org). Then type the following to install the reference implementation:

```bash
npm install vibe-protocol
```

### API
To load the module, type the following to Node console or JavaScript file.

```javascript
var vibe = require("vibe-client");
```

#### `export function open(uri: string, options?: SocketOptions): Socket`
Creates a vibe client as a form of socket, connects to the given URI and returns it. It is an asynchronous operation so the returned socket must be connecting. Once the open event has been fired, I/O operations will be available.

```javascript
var vibe = require("vibe-client");
var socket = vibe.open("http://localhost:8080/", {transport: "ws"});
```

##### `interface SocketOptions`
An interface for creating a socket.

###### `heartbeat`
A heartbeat interval value in milliseconds. A opened socket continuously sends a heartbeat event to the server each time the value has elapsed. Actually, the socket sends the event 5 seconds before the heartbeat timer expires to wait the server's echo. If the event echoes back within 5 seconds, the socket reset the timer. Otherwise, the close event is fired. For that reason, the value must be larger than `5000` and the recommended value is `20000`.
 
###### `_heartbeat`
It is the 5 seconds from the explanation for `heartbeat` and is in milliseconds unit. This is only for speeding up heartbeat tests.

###### `transport`
A transport id. It's required. Transport is a private interface used to establish a connection, send data, receive data and close the connection. These are available: `ws`, `sse`, `streamxhr`, `streamxdr`, `streamiframe`, `longpollajax`, `longpollxdr` and `longpolljsonp`. However none of them runs on browser so `streamxdr`, `streamiframe`, `longpollxdr` and `longpolljsonp` are not meaningful and just simulate their expected behaviors.  

#### `export function server(): Server`
Creates a vibe server that is installed by passing request and upgrade events dispatched by Node's HTTP/HTTPS server to the server. It inherits [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

```javascript
var vibe = require("vibe-protocol");
var server = vibe.server();

server.on("socket", function(socket) {
    // socket
});

require("http").createServer().on("request", server.handleRequest).on("upgrade", server.handleUpgrade).listen(8080);
```

##### `interface Server`
An interface to represent a server.

###### `handleRequest (req: http.IncomingMessage, res: http.ServerResponse)`
It consumes HTTP exchange to establish HTTP based transports. Untainted req and res are expected to be passed from Node's HTTP/HTTPS server's request event.

###### `handleUpgrade (req: http.IncomingMessage, socket:net.Socket, head: buffer.Buffer)`
It consumes HTTP exchange to establish WebSocket transport. Untainted req, socket and head are expected to be passed from Node's HTTP/HTTPS server's upgrade event.

###### `on(event: string, handler: Function): Socket`
Adds a given event handler for a given event.

* `socket (socket: Socket): void`: fired when a socket representing client is opened. It's opened so I/O operations are possible.

#### `interface Socket`
An interface representing the remote endpoint that is server if it's created by `vibe.open` or client if it's created by `vibe.server`. It inherits [EventEmitter](http://nodejs.org/api/events.html#events_class_events_eventemitter).

```javascript
socket.on("echo", function(data) {
    socket.send("echo", data);
});
```

##### `close(): Socket`
Closes the socket.

##### `on(event: string, handler: Function): Socket`
Adds a given event handler for a given event.

* `open (): void`: fired when a socket is opened. Only for client.
* `close (): void`: fired when a socket is closed.
* `[event: string]: (data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void`: fired when the counterpart sends an event. If the counterpart attaches resolved or rejected callbacks, reply object will be provided.

##### `send(event: string, data?: any, resolved?: (data?: any) => void, rejected?: (data?: any) => void): Socket`
Sends an event with given event name and data attaching resolved and rejected callbacks.

### Interactive Mode
JavaScript is a dynamic language so you can deal with both client and server in an interactive mode. Open two Node console, copy the following scripts and paste into the each console.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
var vibe = require("vibe-protocol");
var socket;

vibe.open("http://localhost:8000/", {transport: "ws"})
.on("open", function() {
    socket = this;
    console.log("socket");
});
```

Once `socket` have been logged, you can access the opened socket by `socket` in the console.

```javascript
socket.on("greeting", function(data) {
    console.log("greetings from the server: " + data);
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
    console.log("sockets[" + (sockets.push(socket) - 1) + "]");
});
```

Once `sockets[0]` have been logged, you can access the opened socket by `sockets[0]` in the console.

```javascript
sockets[0].send("greeting", "Hello World");
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

---

## Test Suite
Test suite is provided to help write and verify implementation. Tests are written in JavaScript with the helpf of reference implementation and runs by [Mocha](http://visionmedia.github.io/mocha/), JavaScript test framework, in Node.js.

Tests consist of two parts: protocol (required) and extension (optional) and a series of tests are executed per transport. By default both client and server test suites will run all unit tests including from protocol part and extension part for all the available transports: `ws`, `sse`, `streamxhr`, `streamxdr`, `streamiframe`, `longpollajax`, `longpollxdr` and `longpolljsonp`. Of course, you don't need to implement all transports and all extensions. Tests can run selectively.

### Testee
Testee is a web server which brokers between test and implementation to be tested over HTTP, which is you need to write. Through writing testee, you will use most API of your implementation. Showing your testee is good for explaining how to use your implementation though it may not be pretty.

* **Server testee** should:
    * listen on 8000
    * delegate a request to the implementation if the request's path is `/vibe`
    * if **socket** has been opened, it should:
        * to test protocol (required)
            * on `echo` event, send `echo` event with data
        * to test extension (optional)
            * `Receiving Replyable Event`
                * on `rre.resolve` event, execute a resolved callback passing data of the event
                * on `rre.reject` event, execute a rejected callback passing data of the event
            * `Sending Replyable Event`
                * on `sre.resolve` event, send an `sre.resolve` event with data of the event as data and a function as resolved callback that sends `sre.done` event with value returned from reply as data. 
                * on `sre.reject` event, send an `sre.reject` event with data of the event as data and a function as rejected callback that sends `sre.done` event with value returned from reply as data.<p>
    
    Here is an [example](https://github.com/Atmosphere/vibe-protocol/blob/master/test/testee/server.js) for testing server reference implementation.  
  
* **Client testee** should: 
    * listen on 9000
    * make the implementation connect to the server if the request's path is `/open`, setting:
        * URI to uri param in query string
        * transport to transport param in query string
        * heartbeat to heartbeat param in query string or `false` if not exists
        * _heartbeat to _heartbeat param in query string or `false` if not exists
    * if **socket** has been opened, it should:
        * to test protocol (required)
            * on `abort` event, close itself
            * on `echo` event, send `echo` event with data
        * to test extension (optional)
            * `Receiving Replyable Event`
                * on `rre.resolve` event, execute a resolved callback passing data of the event
                * on `rre.reject` event, execute a rejected callback passing data of the event
            * `Sending Replyable Event`
                * on `sre.resolve` event, send an `sre.resolve` event with data of the event as data and a function as resolved callback that sends `sre.done` event with value returned from reply as data. 
                * on `sre.reject` event, send an `sre.reject` event with data of the event as data and a function as rejected callback that sends `sre.done` event with value returned from reply as data.<p>
    
    Here is an [example](https://github.com/Atmosphere/vibe-protocol/blob/master/test/testee/client.js) for testing client reference implementation.
  
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
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
    * [Interactive Mode](#interactive-mode)
* [Test Suite](#test-suite)
    * [Testee](#testee)
        * [Server Testee](#server-testee)
        * [Client Testee](#client-testee)
    * [Running Test](#running-test)

---

## Specification
The protocol is still under active development and it's not easy to maintain both reference implementation and specification document. Accordingly for now the reference implementation takes the place of the specification document.

The current blocks build the protocol.

* **Handshaking** - A process to negotiate the protocol.
* **Transport** - A full-duplex message channel.
    * `ws` - Based on [WebSocket](https://tools.ietf.org/html/rfc6455).
    * `sse` - Based on [Server-Sent Events](http://www.w3.org/TR/eventsource/).
    * `streamxhr` - Based on [Streaming](http://en.wikipedia.org/wiki/Comet_(programming)#Streaming) using [XMLHttpRequest](http://www.w3.org/TR/XMLHttpRequest/).
    * `streamxdr` - Based on [Streaming](http://en.wikipedia.org/wiki/Comet_(programming)#Streaming) using [XDomainRequest](http://msdn.microsoft.com/en-us/library/ie/cc288060(v=vs.85).aspx).
    * `streamiframe` - Based on [Streaming](http://en.wikipedia.org/wiki/Comet_(programming)#Streaming) using iframe and DOM manipulation.
    * `longpollajax` - Based on [Long polling](http://en.wikipedia.org/wiki/Comet_(programming)#Ajax_with_long_polling) using Ajax.
    * `longpollxdr` - Based on [Long polling](http://en.wikipedia.org/wiki/Comet_(programming)#Ajax_with_long_polling) using [XDomainRequest](http://msdn.microsoft.com/en-us/library/ie/cc288060(v=vs.85).aspx).
    * `longpolljsonp` -  Based on [Long polling](http://en.wikipedia.org/wiki/Comet_(programming)#Ajax_with_long_polling) using [JSONP](http://en.wikipedia.org/wiki/JSONP).
* **Extension** - An additional feature built on protocol.
    * `reply` -  Allows for the sender to attach callbacks in sending event and for the receiver to call them with the result of the event processing in receiving event.

Nevertheless, if you need big picture of the protocol, see [Anatomy of Protocol](http://vibe-project.github.io/blog/anatomy-of-vibe-protocol/). However note that it covers future features on the roadmap and may be different with this version.

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

### Interactive Mode
JavaScript is a dynamic language so you can deal with both client and server in an interactive mode. Open two Node console, copy the following scripts and paste into the each console.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
var vibe = require("vibe-protocol");
var client = vibe.client();
var socket = client.open("http://localhost:8080");

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
httpServer.listen(8080);

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

### Testee
To run the test suite, you need to write a testee, a web server which brokers between test and your implementation to be tested. Because through writing testee, you will use most API of your implementation, showing your testee is good for explaining how to use your implementation.

#### Server Testee
A testee to test server implementation should listen on port `8000`. Here is an [example](https://github.com/vibe-project/vibe-protocol/blob/master/test/testee/server.js) for testing server reference implementation.

##### Handling HTTP Request
According to the request path:

* `/alive`
    * Write `true` or `false` to the response according to whether a socket specified by the request param `id` is opened and end the response.
* `/setup`
    * According to the request param: `transports`, `heartbeat` and `_heartbeat`, set up the implementation and end the response.
* `/vibe`
    * Delegate an exchange of request and response to the implementation without touching it.

##### Handling Socket
According to the socket event:

* `echo`
    * Send `echo` event attaching the given data.

##### Testing Extension
According to the extension:

###### Reply
This extension uses two socket events:

* `/reply/inbound`
    * According to the event data's `type` property, execute a resolved callback if that type is `resolved` and a rejected callback if that type is `rejected` with `data` property of the given data as returning value.
* `/reply/outbound`
    * According to the event data's `type` property, send a `test` event with `data` property of the given data as data attaching a resolved callback if that type is `resolved` and a rejected callback if that type is `rejected`. In both callbacks, when the value is returned, it should send a `done` event with that value as data.

#### Client Testee
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

##### Testing Extension
According to the extension:

###### Reply
This extension uses two socket events:

* `/reply/inbound`
    * According to the event data's `type` property, execute a resolved callback if that type is `resolved` and a rejected callback if that type is `rejected` with `data` property of the given data as returning value.
* `/reply/outbound`
    * According to the event data's `type` property, send a `test` event with `data` property of the given data as data attaching a resolved callback if that type is `resolved` and a rejected callback if that type is `rejected`. In both callbacks, when the value is returned, it should send a `done` event with that value as data.
  
### Running Test
First you need to install [Node.js](http://nodejs.org). Then create a `package.json` in an empty directory: 

```json
{
  "devDependencies": {
    "vibe-protocol": "3.0.0-Alpha3",
    "mocha": "2.0.1",
    "chai": "1.9.2",
    "minimist": "1.1.0"
  }
}
```

And type `npm install` to install modules locally and `npm install mocha -g` to install Mocha globally for convenience. Then, run your testee and execute `mocha` passing the following arguments:

* `--vibe.transports`
    * A set of transport to be tested in a comma-separated value.
* `--vibe.extension`
    * A set of extension to be tested in a comma-separated value.

_Testing a client which implements `ws`, `sse` and `longpollajax` transports._

```bash
mocha ./node_modules/vibe-protocol/test/client.js --vibe.transports ws,sse,longpollajax
```

_Testing a server which implements `ws` transport and `reply` extension._

```bash
mocha ./node_modules/vibe-protocol/test/server.js --vibe.transports ws --vibe.extension reply
```

**Note**

* Because Node.js is small and can be installed locally, you can automate the protocol test programmatically by downloading and installing Node.js, installing modules through npm, running tests through spawning a process and checking that process' exit code that is the number of failed tests.
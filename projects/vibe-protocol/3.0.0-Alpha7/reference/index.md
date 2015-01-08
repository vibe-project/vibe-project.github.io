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
    * [Example](#example)
* [Test Suite](#test-suite)
    * [Testee](#testee)
    * [Running Test](#running-test)

---

## Specification
The protocol is still under active development and it's not easy to maintain both reference implementation and specification document. Accordingly for now the reference implementation takes the place of the specification document.

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
JavaScript is a dynamic language so you can deal with both client and server in an interactive mode. Open two Node consoles, copy the following scripts and paste into the each console.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
var vibe = require("vibe-protocol");
var socket = vibe.open("http://localhost:8080");

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

### Example
This _echo and chat_ example is very simple but demonstrates essential functionalities of the protocol.

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

---

## Test Suite
Test suite is provided to help write and verify implementation. Tests are written in JavaScript with the help of reference implementation and runs by [Mocha](http://visionmedia.github.io/mocha/), JavaScript test framework, in Node.js.

### Testee
To run the test suite, you need to write a testee, a web server which brokers between test and your implementation to be tested. Because through writing testee, you will use most API of your implementation, showing your testee is good for explaining how to use your implementation.

The reference implementation is still under active development and it's not easy to maintain documentation. If you want to try out though, please see [server testee](https://github.com/vibe-project/vibe-protocol/blob/master/test/testee/server.js) and [client testee](https://github.com/vibe-project/vibe-protocol/blob/master/test/testee/client.js). 

### Running Test
First you need to install [Node.js](http://nodejs.org). Then create a `package.json` in an empty directory: 

```json
{
  "devDependencies": {
    "vibe-protocol": "3.0.0-Alpha7",
    "mocha": "2.1.0",
    "chai": "1.10.0",
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
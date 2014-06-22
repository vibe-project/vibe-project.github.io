---
layout: project
title: Vibe Protocol Reference
---

<h1>Reference</h1>

---

**Table of Contents**

* [Reference Implementation](#reference-implementation)
    * [Installation](#installation)
    * [Interactive Mode](#interactive-mode)
* [Test Suite](#test-suite)
    * [Testee](#testee)
    * [Running Test](#running-test)
        * [Choosing Transport](#choosing-transport)

---

## Reference Implementation
To help understand the protocol, reference implementation is provided. It is written in easy-to-read JavaScript with a lot of detailed notes you should be aware of. Also you can use it to verify your implementation casually and as the counterpart in your examples.

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

### Interactive Mode
JavaScript is a dynamic language so you can deal with both client and server in an interactive mode. Open two Node console, copy the following scripts and paste into the each console.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
var vibe = require("vibe-protocol"),
    socket;

vibe.open("http://localhost:8000/vibe", {transport: "ws"})
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
var vibe = require("vibe-protocol"),
    server = vibe.server(),
    httpServer = require("http").createServer(),
    sockets = [];

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
Test suite is provided to help write and verify implementation. Tests are written in JavaScript and runs by [Mocha](http://visionmedia.github.io/mocha/), JavaScript test framework, in Node.js using reference implementation.

### Testee
Testee is a web server which brokers between test and implementation to be tested over HTTP, which is you need to write. Also these testee can play the part of test runner proxy by running test on a certain URI and that way may be more convenient to integrate 3rd party tool.

* **Server testee** should:
    * listen on 8000
    * delegate a request to the implementation if the request's path is `/vibe`, and a newly created socket should:
        * send `echo` event with data on `echo` event
        * execute resolved callback on `replyable` event if data is `true`
        * execute rejected callback on `replyable` event if data is `false`<p>
    
    Here is an [example](https://github.com/Atmosphere/vibe-protocol/blob/master/test/testee/server.js) for testing server reference implementation.  
  
* **Client testee** should: 
    * listen on 9000
    * make the implementation connect to the server if the request's path is `/open`, setting:
        * URI to uri param in query string
        * transport to transport param in query string
        * heartbeat to heartbeat param in query string or `false` if not exists
        * _heartbeat to _heartbeat param in query string or `false` if not exists
        * if socket has been opened, it should:
            * close itself on `abort` event
            * send `echo` event with data on `echo` event
            * execute resolved callback on `replyable` event if data is `true`
            * execute rejected callback on `replyable` event if data is `false`<p>
    
    Here is an [example](https://github.com/Atmosphere/vibe-protocol/blob/master/test/testee/client.js) for testing client reference implementation.
  
### Running Test
First you need to install [Node.js](http://nodejs.org). Then type the following to install this module locally and Mocha globally: 

```bash
npm install vibe-protocol
npm install mocha -g
```

Run your client/server testee. Once it's ready, open Node console and run mocha to test.

* client implementation

    ```bash
    mocha ./node_modules/vibe-protocol/test/client.js
    ```
    
* server implementation

    ```bash
    mocha ./node_modules/vibe-protocol/test/server.js
    ```
    
And see the result on the console.

#### Choosing Transport
By default both test suites verify all the available transport: `ws`, `sse`, `streamxhr`, `streamxdr`, `streamiframe`, `longpollajax`, `longpollxdr` and `longpolljsonp`. However, in development environment, `ws`, `sse` and `longpollajax` are actually enough to use. To chose transports to be tested, you can use `grep` option from mocha.

```bash
mocha ./node_modules/vibe-protocol/test/server.js --grep "ws|sse|longpollajax"
```

Note that `grep` is evaluated as a regular expression in JavaScript and you should use `"` to escape `|` in Windows CMD.
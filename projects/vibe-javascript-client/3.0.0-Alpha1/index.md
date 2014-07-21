---
layout: project
title: Vibe JavaScript Client
---

Vibe JavaScript Client is a lightweight <sup><strong>A</strong></sup> JavaScript client for browser-based <sup><strong>B</strong></sup> and Node-based <sup><strong>C</strong></sup> application.

<dl>
    <dt>A</dt>
    <dd>16.52KB minified, 5.89KB minified and gzipped.</dd>
    <dt>B</dt>
    <dd>The policy for browser support is the same with the one of jQuery 1.x that embraces Internet Explorer 6. Also it has no dependency in browser.</dd>
    <dt>C</dt>
    <dd>Though browser is the first runtime, it runs seamlessly on Node.js.</dd>
</dl>

---

## Getting Started
According to runtime engine, Vibe JavaScript Client is distributed at two places: browser version through this web site in <a href="{{ site.baseurl }}/projects/vibe-javascript-client/3.0.0-Alpha1/vibe.min.js">compressed</a> and <a href="{{ site.baseurl }}/projects/vibe-javascript-client/3.0.0-Alpha1/vibe.js">uncompressed</a> forms and node version through npm. This page already loaded the uncompressed version. Open a console and type <code>vibe</code>.

### Basic
Let's see how the protocol part of the protocol specification is implemented using a simple one-off echo example.

```javascript
var socket = vibe.open("http://localhost:8000/vibe", { // A
    heartbeat: 20000,
    reconnect: false,
    transports: ["ws", "stream", "longpoll"] // B
});

socket.on("open", function() { // C
    socket.send("echo", "Hello there");
})
.on("echo", function(data) { // D
    console.log("on echo - " + data);
    socket.close();
})
.on("close", function(reason) { // E
    console.log("closed due to " + reason);
});
```

<dl>
    <dt>A <code>vibe.open("http://localhost:8000/vibe")</code></dt>
    <dd><code>vibe.open</code> connects to the specified URI with the given options and returns a socket object. Of course this is an asynchronous operation and in most cases the returned socket is in connecting state.</dd>
    <dt>B <code>transports: ["ws", "stream", "longpoll"]</code></dt>
    <dd>Because it runs on browser, all transports specified in the specification are implemented based on browser's host objects.</dd>
    <dt>C <code>socket.on("open", () => socket.send("echo", "Hello there"))</code></dt>
    <dd>On <code>open</code> event, communication becomes possible so you can use <code>send</code> method to send an echo event. Also most methods of socket returns itself for chaining.</dd>
    <dt>D <code>socket.on("echo", data => socket.close())</code></dt>
    <dd>When the echo event receives, logs its data to console and close the socket to see what happens.</dd>
    <dt>E <code>socket.on("close", reason => {})</code></dt>
    <dd>For various reasons, connection is disconnected and the reason explaining what happens is provided as first argument.</dd>
</dl>

### Advanced
In this time, let's take a look how the extensions part of the protocol specification and other features are implemented extending the previous example.

```javascript
var socket = vibe.open("http://localhost:8000/vibe", {
    heartbeat: 20000,
    reconnect: function(lastDelay) { // A
        return 2 * lastDelay || 500;
    }, 
    // sharing: true // B
    timeout: 3000, // C
    transports: ["ws", "stream", "longpoll"]
});

socket.on("connecting", function() { // D
    console.log("connecting");
})
.on("open", function() {
    socket.send("echo", "Hello there")
    .send("/account/find", "flowersinthesand", function(account) { // E
        console.log("account is " + account);
    }, function(reason) {
        console.log("rejected due to " + reason);
    });
})
.on("echo", function(data) {
    console.log("on echo - " + data);
})
.on("/get", function(key, reply) { // F
    if (key in allowed) {
        if (key in localStorage) {
            reply.resolve(localStorage[key]);
        } else {
            reply.reject("not found");
        }
    } else {
        reply.reject("not allowed");
    }
})
.on("close", function(reason) {
    console.log("closed due to " + reason);
})
.on("waiting", function(delay, attempts) { // G
    console.log("reconnection delay: " + delay + " and attempts: " + attempts);
});
```

<dl>
    <dt>A <code>reconnect: lastDelay => 2 * lastDelay || 500</code></dt>
    <dd>A strategy to determine delay for the socket to wait before reconnection. The above is the default strategy.</dd>
    <dt>B <code>sharing: true</code></dt>
    <dd>It allows to share connection between windows and tabs following cookie's scope and is for browser only. This feature works well but note that it will be proposed as an extension with very different mechanism.</dd>
    <dt>C <code>timeout: 3000</code></dt>
    <dd>If the timer starting on <code>connecting</code> event expires before the connection is established, <code>close</code> event is fired.</dd>
    <dt>D <code>socket.on("connecting", () => {}))</code></dt>
    <dd>Unlike server, client-side socket can be in <code>connecting</code> state and <code>connecting</code> event fires on that state regardless of whether to reconnect or not. In other words, you can't know if it's the nth connection attempt.</dd>
    <dt>E <code>Sending replyable event</code> extension</dt>
    <dd>Attach resolved callback and rejected callback in sending an event.</dd>
    <dt>F <code>Receiving replyable event</code> extension</dt>
    <dd>As a controller to resolve and reject, <code>reply</code> is supplied as second argument so you can deal with it asynchronously.</dd>
    <dt>G <code>socket.on("waiting", (delay, attempts) => {}))</code></dt>
    <dd>On <code>waiting</code> state not specified in the specification, <code>waiting</code> event fires with reconnection delay and attempts where you can notify user of reconnection schedule.</dd>
</dl>
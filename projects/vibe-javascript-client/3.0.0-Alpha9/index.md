---
layout: project
title: Vibe JavaScript Client
---

Vibe JavaScript Client <sup><strong>A</strong></sup> is a lightweight <sup><strong>B</strong></sup> JavaScript client for browser-based <sup><strong>C</strong></sup> and Node-based <sup><strong>D</strong></sup> application.

<dl>
    <dt>A</dt>
    <dd><a href="/projects/vibe-protocol/3.0.0-Alpha9">Vibe 3.0.0-Alpha9</a> client.</dd>
    <dt>B</dt>
    <dd>9.83KB minified, 4.83KB minified and gzipped.</dd>
    <dt>C</dt>
    <dd>It has no dependency and follows jQuery 1.x's browser support that embraces Internet Explorer 6.</dd>
    <dt>D</dt>
    <dd>Though browser is the first runtime, it runs seamlessly on Node.js.</dd>
</dl>

---

## Quick Start
Vibe JavaScript Client is distributed at two places according to runtime engine: browser version through this web site in [compressed](/projects/vibe-javascript-client/3.0.0-Alpha9/vibe.min.js) and [uncompressed](/projects/vibe-javascript-client/3.0.0-Alpha9/vibe.js) forms and node version through npm.

Once you've loaded the module, you will be able to write the following [echo and chat](/projects/vibe-protocol/3.0.0-Alpha9/reference/#example) client. This page already loaded the uncompressed version, hence you can run and debug it directly here by using a JavaScript console and doing copy and paste.

```javascript
var socket = vibe.open("http://localhost:8080/vibe");
// Built-in events
socket.on("connecting", function() {
    console.log("The selected transport starts connecting to the server");
})
.on("open", function() {
    console.log("The connection is established successfully and communication is possible");
    socket.send("echo", "An echo message").send("chat", "A chat message");
})
.on("error", function(error) {
    console.error("An error happens on the socket", error);
})
.on("close", function() {
    console.log("The connection has been closed, has been regarded as closed or could not be opened");
})
.on("waiting", function(delay, attempts) {
    console.log("The socket waits out the", attempts, (["st", "nd", "rd"][attempts - 1] || "th"), "reconnection delay", delay);
})
// User-defined events
.on("echo", function(data) {
    console.log("on echo event", data);
})
.on("chat", function(data) {
    console.log("on chat event", data);
});
```

### Further Reading

* To play something right now, start with [archetype example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-javascript-client).
* To take a brief look at API, check out the [testee](https://github.com/vibe-project/vibe-javascript-client/blob/v3.0.0-Alpha9/Gruntfile.js#L61-L91).
* To get details of API, see [API document](/projects/vibe-javascript-client/3.0.0-Alpha9/api/).
* To have a thorough knowledge of the implementation, read out the [reference](/projects/vibe-javascript-client/3.0.0-Alpha9/reference/).
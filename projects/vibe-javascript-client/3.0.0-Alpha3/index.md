---
layout: project
title: Vibe JavaScript Client
---

Vibe JavaScript Client <sup><strong>A</strong></sup> is a lightweight <sup><strong>B</strong></sup> JavaScript client for browser-based <sup><strong>C</strong></sup> and Node-based <sup><strong>D</strong></sup> application.

<dl>
    <dt>A</dt>
    <dd><a href="/projects/vibe-protocol/3.0.0-Alpha3">Vibe 3.0.0-Alpha3</a> client.</dd>
    <dt>B</dt>
    <dd>17.23KB minified, 6.04KB minified and gzipped.</dd>
    <dt>C</dt>
    <dd>The policy for browser support is the same with the one of jQuery 1.x that embraces Internet Explorer 6. Also it has no dependency in browser.</dd>
    <dt>D</dt>
    <dd>Though browser is the first runtime, it runs seamlessly on Node.js.</dd>
</dl>

---

## Quick Start
Vibe JavaScript Client is distributed at two places according to runtime engine: browser version through this web site in [compressed](/projects/vibe-javascript-client/3.0.0-Alpha3/vibe.min.js) and [uncompressed](/projects/vibe-javascript-client/3.0.0-Alpha3/vibe.js) forms and node version through npm.

Once you've loaded the module, you will be able to write the following [echo and chat](/projects/vibe-protocol/3.0.0-Alpha3/api/#module--vibe-protocol-) client. This page already loaded the uncompressed version, hence you can run and debug it directly here by using a JavaScript console and doing copy and paste.

```javascript
var socket = vibe.open("http://localhost:8080/vibe");

socket.on("connecting", function() {
    console.log("on connecting event");
})
.on("open", function() {
    console.log("on open event");
    socket.send("echo", "An echo message").send("chat", "A chat message");
})
.on("error", function(error) {
    console.log("on error event", reason);
})
.on("close", function() {
    console.log("on close event");
})
.on("waiting", function(delay, attempts) {
    console.log("on waiting event with delay", delay, "and attempts", attempts);
})
.on("echo", function(data) {
    console.log("on echo event", data);
})
.on("chat", function(data) {
    console.log("on chat event", data);
});
```

### Further Reading

* To get started with Java Server, read the tutorial, [writing chat application](/blog/writing-chat-application/).
* To play something right now, start with [archetype example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-javascript-client).
* To take a brief look at API, check out the [testee](https://github.com/vibe-project/vibe-javascript-client/blob/v3.0.0-Alpha3/Gruntfile.js#L84-L120).
* To get details of API, see [API document](/projects/vibe-javascript-client/3.0.0-Alpha3/api/).
* To have a thorough knowledge of the implementation, read out the [reference](/projects/vibe-javascript-client/3.0.0-Alpha3/reference/).
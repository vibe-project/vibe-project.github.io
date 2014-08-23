---
layout: project
title: Vibe JavaScript Client
---

Vibe JavaScript Client is a lightweight <sup><strong>A</strong></sup> JavaScript client for browser-based <sup><strong>B</strong></sup> and Node-based <sup><strong>C</strong></sup> application.

<dl>
    <dt>A</dt>
    <dd>16.53KB minified, 5.92KB minified and gzipped.</dd>
    <dt>B</dt>
    <dd>The policy for browser support is the same with the one of jQuery 1.x that embraces Internet Explorer 6. Also it has no dependency in browser.</dd>
    <dt>C</dt>
    <dd>Though browser is the first runtime, it runs seamlessly on Node.js.</dd>
</dl>

---

## Quick Start
Vibe JavaScript Client is distributed at two places according to runtime engine: browser version through this web site in [compressed]({{ site.baseurl }}/projects/vibe-javascript-client/3.0.0-Alpha1/vibe.min.js) and [uncompressed]({{ site.baseurl }}/projects/vibe-javascript-client/3.0.0-Alpha1/vibe.js) forms and node version through npm.

Once you've loaded the module, you will be able to write the following [echo and chat]({{ site.baseurl }}/projects/vibe-protocol/3.0.0-Alpha1/reference/#echo-and-chat) client. This page already loaded the uncompressed version, hence you can run and debug it directly here by using a JavaScript console and doing copy and paste.

```javascript
var socket = vibe.open("http://localhost:8000/");

socket.on("connecting", function() {
    console.log("on connecting event");
})
.on("open", function() {
    console.log("on open event");
    socket.send("echo", "An echo message");
    socket.send("chat", "A chat message");
})
.on("echo", function(data) {
    console.log("on echo event:", data);
})
.on("chat", function(data) {
    console.log("on chat event:", data);
})
.on("close", function(reason) {
    console.log("on close event with reason:", reason);
})
.on("waiting", function(delay, attempts) {
    console.log("on waiting event with delay:", delay, "and attempts:", attempts);
});
```

### Further Reading

* Do you want to play something right now? Start with [archetype example](https://github.com/Atmosphere/vibe-examples/tree/master/archetype/vibe-javascript-client).
* To take a brief look at API, check out the [testee](https://github.com/Atmosphere/vibe-javascript-client/blob/2842ab4561592217ec6c722a3b42ae803d1da156/Gruntfile.js#L92-L120).
* To get details of API, see [API document]({{ site.baseurl }}/projects/vibe-javascript-client/3.0.0-Alpha1/api/).
* To have a thorough knowledge of the implementation, read out the [reference]({{ site.baseurl }}/projects/vibe-javascript-client/3.0.0-Alpha1/reference/).
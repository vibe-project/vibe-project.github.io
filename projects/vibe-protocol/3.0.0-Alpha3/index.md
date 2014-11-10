---
layout: project
title: Vibe Protocol
---

Vibe Protocol is a protocol based on web standards <sup><strong>A</strong></sup> to provide reliable full duplex connection over HTTP <sup><strong>B</strong></sup> and elegant patterns to write real-time web applications <sup><strong>C</strong></sup>. Also it provides the test suite to verify your client or server implementation. <sup><strong>D</strong></sup>

<dl>
    <dt>A</dt>
    <dd>As component of the specification, RFC and W3C standards like HTTP, WebSocket, Server-Sent Events and JSON are adopted. You don't need to do much to implement the protocol. Just use existing implementation.</dd>
    <dt>B</dt>
    <dd>This part defines transports for interacting with HTTP connections and socket for exchanging events between two endpoints on the top of transport.</dd>
    <dt>C</dt>
    <dd>This part defines extensions which represent patterns making modern web application development fast and enjoyable.</dd>
    <dt>D</dt>
    <dd>You don't need to take trouble to demonstrate your implementation works correctly. Just show test arguments and result.</dd>
</dl>

---

## Getting Started
Get started with Vibe on your team's preferable platform. Also see with your own eyes how API looks like through testee and which transports and extensions are supported through test result.

### Client
Here are the Vibe compliant clients.

* [Vibe JavaScript Client](http://vibe-project.github.io/projects/vibe-javascript-client/3.0.0-Alpha3/) for browser ([testee](https://github.com/vibe-project/vibe-javascript-client/blob/v3.0.0-Alpha3/test/resources/testee.html#L62-L118) and [test result](https://saucelabs.com/u/vibe) (filter with build `60`)) and Node ([testee](https://github.com/vibe-project/vibe-javascript-client/blob/v3.0.0-Alpha3/Gruntfile.js#L84-L120) and [test result](https://travis-ci.org/vibe-project/vibe-javascript-client/builds/39187708)).

### Server
Here are the Vibe compliant servers.

* [Vibe Java Server](http://vibe-project.github.io/projects/vibe-java-server/3.0.0-Alpha5/) for Java ([testee](https://github.com/vibe-project/vibe-java-server/blob/v3.0.0-Alpha5/server/src/test/java/org/atmosphere/vibe/server/ProtocolTest.java#L47-L102) and [test result](https://travis-ci.org/vibe-project/vibe-java-server/builds/40501982)).
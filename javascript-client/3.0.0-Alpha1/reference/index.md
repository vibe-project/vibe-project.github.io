---
layout: reference
title: Vibe JavaScript Client Reference
version: 3.0.0-Alpha1
---

<div data-alert class="alert-box alert">
You are watching snapshot documentation.<a href="#" class="close">&times;</a>
</div>

<h1>Reference <small>Vibe JavaScript Client</small></h1>
<script src="{{ site.baseurl }}/javascript-client/{{ page.version }}/vibe.js"></script>

---

**{{ page.version }}**

---

**Table of Contents**

1. [Introduction](#toc_0)
  1. [Features](#toc_1)
  1. [Versions](#toc_2)
  1. [License](#toc_3)
1. [Quick Start](#toc_4)
1. [Installation](#toc_5)
  1. [As browser client](#toc_6)
  1. [As Node.js client](#toc_7)
1. [Socket](#toc_8)
  1. [Event](#toc_9)
  1. [Life Cycle](#toc_10)
  1. [Sending and Receiving Event](#toc_11)
  1. [Sending and Receiving Replyable Event](#toc_12) 
  1. [Heartbeat](#toc_13)
  1. [Connection Sharing](#toc_14) 
  1. [Reconnection](#toc_15)
  1. [Transport](#toc_16)
1. [Transport](#toc_17) 
  1. [Implementation](#toc_18) 
  1. [Compatibility](#toc_19)
1. [Quirks](#toc_24)
1. [Examples](#toc_29)

---

## Introduction

The Vibe JavaScript Client is a concise and lightweight client-side JavaScript library. It not only provides Vibe connectivity on every browser-based and Node-based applications but also focuses on making the best use of realtime connectivity in place of Ajax to help write low-latency and event-driven web applications, not just for chat application.

### Features

* Provides Vibe connectivity to replace AJAX
* Connection sharing between tabs and windows *
* Runs in Node.js and all browsers including Internet Explorer 6
* Event-based API akin to W3C WebSocket API
* No dependencies
* Lightweight (16.52KB minified, 5.89KB minified and gzipped)

\* experimental yet.

### Versions

The mapping between the specifications and the respective Vibe JavaScript Client versions is:

| Version | ECMAScript | Vibe Protocol |
|---|---|---|
| 3 | 3 | 3.0 |

That being said, compatiblity of vibe.js depends on [compatibility of transport](#toc_19) which varies depending on runtime environment such as Node.js and Browser.

### License

Licensed under the Apache License 2.0.

---

## Quick Start
You already have all you need to run vibe.js. Just open a console and type `vibe`.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
var socket;

vibe.open("http://localhost:8000/", {reconnect: false})
.on("open", function() {
    socket = this;
    console.log("socket");
});
```

Once `socket` have been logged, you can access the opened socket by `socket` in the console.
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Server**

You can use:

* [Reference implementation]({{ site.baseurl }}/protocol/{{ page.version }}/reference/#toc_5)
* [Vibe Java Server](http://localhost:4000/java-server/{{ page.version }}/reference/#toc_4)
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

---

## Installation
### As browser client
Download vibe.js the way you want.

<ul class="inline-list">
<li><a href="{{ site.baseurl }}/javascript-client/{{ page.version }}/vibe.min.js">The compressed for production</a></li>
<li><a href="{{ site.baseurl }}/javascript-client/{{ page.version }}/vibe.js">The uncompressed for development</a></li>
<li><code>bower install vibe-client</code></li>
</ul>

Then load or link it by using either script tag or [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) loader.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Script tag**

```html
<script src="/vibe/vibe.min.js"></script>
<script>
vibe.open("/vibe");
</script>
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**AMD loader**

```javascript
require(["vibe"], function(vibe) {
    vibe.open("/vibe");
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### As Node.js client
vibe.js is available on [npm](https://npmjs.org/package/vibe-client) under the name of `vibe-client`. Install the module.
  
```bash
npm install vibe-client --save
```

It will install the latest version adding it to dependencies entry in `package.json` in the current project folder. If you are on Windows, you may have trouble in installing Contextify. See a [installation guide](https://github.com/tmpvar/jsdom#contextify) from jsdom.

Then load it as a Node.js module.

```javascript
var vibe = require("vibe-client");
vibe.open("http://localhost:8000/vibe");
```

---

## Socket
The feature-rich and flexible interface for two-way communication.

### Event

From the semantic point of view, the unit of data to be sent and be received is the event, like the interaction between user and browser. The socket object's events can be classified like the following:

* **Pseudo event**: `connecting` and `waiting`

    They only exist in the client and have nothing to do with the server. Event handlers belong to those events 
    
* **Network event**: `open` and `close`

    They are fired in process of connecting and disconnecting by the transport object.

* **Message event**: `message` and everything else

    They are sent and received via the connection effectively. Only this type of event can be extended. All the custom event used by the socket or the user belong to custom message event. 

### Life Cycle
Socket always is in a specific state that can be accessed by `state` method. According to the status of connection to the server, transition between states occurs and this circulating transition makes a life cycle. The following list is a list of state which a socket can be in. A word in parentheses in closed state means close reason.

* **preparing**

    As an initial state of life cycle, it's internally used during reinitializing socket state and selecting transport.
    
    State transition occurs to
    * connecting: if transport is selected.
    * closed(notransport): if there is no available transport in `transports` option in runtime environment.<p>
    
* **connecting**

    The selected transport starts connecting to the server and the `connecting` event is fired. Timer for time-out is activated if `timeout` option is a positive number, environment for connection sharing is constructed and the socket starts to share its connection if `sharing` option is `true`. The `connecting` event is an initial event which the socket fires so you can handle it.
    
    State transition occurs to
    * opened: if transport succeeds in establishing a connection.
    * closed(error): if transport fails to connect.
    * closed(done): if `sse` transport fails to connect.
    * closed(timeout): if it's timed out.
    * closed(aborted): if `close` method is called.<p>
    
* **opened**

    The connection is established successfully and communication is possible. The `open` event is fired. Heartbeat communication starts if `heartbeat` option is number greater than `5000`. Only in this state, the socket can send and receive events via connection to the server. 
     
    State transition occurs to
    
    * closed(error): if heartbeat fails.
    * closed(error): if connection is disconnected due to some error.
    * closed(done): if connection is closed cleanly.
    * closed(done): if connection established by `sse` transport is disconnected due to some error.
    * closed(aborted): if `close` method is called.<p>
    
* **closed**

    The connection has been closed, has been regarded as closed or could not be opened. The `close` event is fired with the close reason. If the `reconnect` handler is set to or returns `false`, the socket's life cycle ends here.
    
    State transition occurs to
    * waiting: if the `reconnect` handler returns a positive number.<p>
    
* **waiting**

    The socket waits out the reconnection delay. The `waiting` event is fired with the reconnection delay in milliseconds and the total number of reconnection attempts.
    
    State transition occurs to
    * preparing: after the reconnection delay.
    * closed(aborted): if `close` method is called.

### Sending and Receiving Event
You can send event using `send(event: string, data?: any)` and receive event using `on(event: string, onEvent: (data?: any) => void)`. Any event name can be used, except `connecting`, `open`, `close` and `waiting` and any data can be sent and received but it should be able to be marshalled/unmarshalled to JSON.

**Note**

* Socket must be in `opened` state.

The client sends events and the server echoes back to the client.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
vibe.open("http://localhost:8000/vibe", {reconnect: false})
.on("open", function() {
    this.send("echo", Math.PI)
    .send("echo", "pi")
    .send("echo", {"p": "i"})
    .send("echo", ["p", "i"]);
})
.on("echo", function(data) {
    console.log(data);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Server**

```javascript
server.on("socket", function(socket) {
    socket.on("echo", function(data) {
        console.log(data);
        this.send("echo", data);
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

The server sends events and the client echoes back to the server.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript

vibe.open("http://localhost:8000/vibe", {reconnect: false})
.on("echo", function(data) {
    console.log(data);
    this.send("echo", data);
})
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Server**

```javascript
server.on("socket", function(socket) {
    socket.on("echo", function(data) {
      console.log(data);
    })
    .send("echo", Math.PI)
    .send("echo", "pi")
    .send("echo", {"p": "i"})
    .send("echo", ["p", "i"]);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Sending and Receiving Replyable Event
You can receive data in sending event using `send(event: string, data?: any, onResolved?: (data?: any) => void, onRejected?: (data?: any) => void)` and send data in receiving event using `on(event: string, handler:(data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void)`.

It looks nothing new to traditional Ajax or Remote Procedure Call (RPC), but comparing to them, WebSocket can reduce unnecessary traffic like HTTP headers and the result can be shared by multiple tabs and windows. To write a economical webapp, you can utilize replyable events in place of Ajax.

**Note**

* Socket must be in `opened` state.
* Do not mingle repliable event and non-repliable event under the same event. It's error-prone.
* Beforehand determine whether to use rejected callback or not to avoid writing unnecessary rejected callbacks.

The client sends replyable events and the server executes callbacks with event data.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
vibe.open("http://localhost:8000/vibe", {reconnect: false})
.on("open", function(data) {
    this.send("account:find", "flowersinthesand", function(data) {
        console.log("resolved with " + data);
    }, function(data) {
        console.log("rejected with " + data);
    })
    .send("account:find", "flowersits", function(data) {
        console.log("resolved with " + data);
    }, function(data) {
        console.log("rejected with " + data);
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Server**

```javascript
server.on("socket", function(socket) {
    socket.on("account:find", function(id, reply) {
      console.log(id);
      if (id === "flowersinthesand") {
          reply.resolve({name: "Donghwan Kim"});
      } else {
          reply.reject("¯\(°_o)/¯");
      }
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

The server sends replyable events and the client executes callbacks with event data.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
vibe.open("http://localhost:8000/vibe", {reconnect: false})
.on("account:find", function(id, reply) {
    console.log(id);
    if (id === "flowersinthesand") {
        reply.resolve({name: "Donghwan Kim"});
    } else {
        reply.reject("¯\(°_o)/¯");
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Server**

```javascript
server.on("socket", function(socket) {
    socket.send("account:find", "flowersinthesand", function(data) {
        console.log("resolved with " + data);
    }, function(data) {
        console.log("rejected with " + data);
    })
    .send("account:find", "flowersits", function(data) {
        console.log("resolved with " + data);
    }, function(data) {
        console.log("rejected with " + data);
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Heartbeat
Considering a multitude of browsers, transports, servers, networks and their combination, heartbeat is essential to maintain stable connection. To enable, set `heartbeat:number` option to number in ms greater than 5000. 20000 ms is recommended.

Eavesdropping heartbeat of client and server.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
vibe.open("http://localhost:8000", {reconnect: false, heartbeat: 20000})
.on("heartbeat", function() {
    console.log("heartbeat at " + Date.now());
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Server**

```javascript
server.on("socket", function(socket) {
    socket.on("heartbeat", function() {
        console.log("heartbeat at " + Date.now());
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Connection Sharing
It's common case that user opens multiple tabs of same website and each tab have its persistent connection like vibe. In the case of a web portal consisting of many portlets, if portlet has a persistent connection, it may not be able to send any request, receive and display anything in violation of the simultaneous connection limit. By sharing a connection, it can be avoided.

To enalbe, set `sharing:boolean` option to `true`. As long as the cookie is enabled, socket will automatically find and use a shared connection if it exists within the cookie's scope and share its connection if there is no corresponding one. Note that if the web page or computer becomes horribly busy, a newly created socket might establish a physical connection.

**Note**

* Applies to only browser.
* In the current implementation, the server can't see socket using shared connection apart from one which possesses a real physical connection. Sockets using shared connection are a kind of mirror of socket having shared the connection but there is no restriction in functionalities. In next major version in protocol, it will be proposed as enhancement or replacement to allow for the server to recognize a socket using shared connection as a indipendent socket.
* With the current implementation, use of repliable events is not recommended.

Sending and reciving event via shared connection.

<div class="row">
<div class="large-4 columns">
{% capture panel %}
**Client A**

```javascript
vibe.open("http://localhost:8000", {
    reconnect: false, 
    sharing: true
})
.on("open", function() {
    this.send("echo", "purple night");
})
.on("echo", function(data) {
    console.log(data);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns">
{% capture panel %}
**Client B**

```javascript
vibe.open("http://localhost:8000", {
    reconnect: false, 
    sharing: true
})
.on("open", function() {
    this.send("echo", "purple night");
})
.on("echo", function(data) {
    console.log(data);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns">
{% capture panel %}
**Server**

```javascript
server.on("socket", function(socket) {
    socket.on("echo", function(data) {
        this.send("echo", data);
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Reconnection
Reconnection has been disabled in the above code snippets for convenience of test, but it's essential for production so that it's enabled by default. The default strategy generates a geometric progression with initial delay `500` and ratio `2` (500, 1000, 2000, 4000 ...). To change it, set `reconnect (delay: number, attempts: number): number` function which receives the last delay in ms or null at first and the total number of reconnection attempts and should return a delay in ms or `false` not to reconnect.

**Note**

* Don't add event handler during dispatch including `open` event. Because reconnection doesn't remove event handlers, it will be duplicated in next life cycle.

### Transport
WebSocket is clearly a best transport but in the real world, many coporate proxies, firewalls, antivirus softwares and cloud application platforms block it for some reason. Of course, many users still use browsers not supporting WebSocket, which we can't compel to upgrade it.

Such transport is configurable through `transports:string[]` option. The default value is `["ws", "stream", "longpoll"]`, which means try WebSocket, if not possible try HTTP Streaming if not possible try use HTTP Long polling. Specific details about transport are introduced in Transport section.

**Note**

* Transport availability is calculated by feature detection in runtime environment. It doesn't mean that selected transport will work with the given network and server.
* Whatever transport is selected, it doesn't affect socket's functionalities.

---

## Transport
The private interface that used to establish a connection, send data, receive data and close the connection.

### Implementation
According to the technology, available transport implementations can be sorted into three groups like the following:

* WebSocket

    WebSocket is a protocol designed for a full-duplex communications over a TCP connection. However, many coporate proxies, firewalls and antivirus softwares blocks it for some reason.

    * `ws`: works if browser supports `WebSocket`.<p>

* HTTP Streaming

    The client performs a HTTP persistent connection and watches changes in response text and the server prints chunk as data over the connection. Generally, streaming transports are faster than WebSocket.
     
    * `sse`: works if browser supports `EventSource`. By reason of the spec's ambiguity, there is no way to determine whether a connection closed normally or not so that the close event's reason will be always `done` even though the connection closed due to an error.
    * `streamxhr`: in case of same origin connection, works without qualification. In case of cross origin, works if `XMLHttpRequest` supports CORS. However for both cases, if the browser is Internet Explorer, the version should be equal to or higher than 10.
    * `streamxdr`: works if browser supports `XDomainRequest` and `xdrURL` option is set.
    * `streamiframe`: works if it's same origin connection and browser supports `ActiveXObject`. This transport differs from the traditional [Hidden Iframe](http://en.wikipedia.org/wiki/Comet_%28programming%29#Hidden_iframe) in terms of fetching a response text. The traditional transport expects script tags, whereas this transport periodically polls the response text.<p>
    
    For convenience, a special transport, `stream`, is provided, which represents the above implementation with order.

* HTTP Long polling: `longpollajax`, `longpollxdr`, `longpolljsonp`.

    The client performs a HTTP persistent connection and the server ends the connection with data. Then, the client receives it and performs a request again. 
     
    * `longpollajax`: in case of same origin connection, works without qualification. In case of cross origin, works if `XMLHttpRequest` supports CORS.
    * `longpollxdr`: works if browser supports `XDomainRequest` and `xdrURL` option is set.
    * `longpolljsonp`: works alwayas.<p>

    For convenience, a special transport, `longpoll`, is provided, which represents the above implementation with order.

As specified in the protocol, in case of HTTP Streaming and HTTP Long polling, they establishes read-only connection using GET method. To simulate a full-duplex connection over HTTP, `POST` is used to write data and the following ways are used in HTTP transports to perform `POST` request.

* XMLHttpRequest: in case of same origin, works without qualification. In case of cross origin, works if browser supports CORS.
* XDomainRequest: works if browser supports `XDomainRequest` and `xdrURL` option is set.
* Form tag: works alwayas but makes a clicking sound.

### Compatibility
The compatiblity of vibe.js depends on transport compatibility.

#### Browser
The policy for browser support is the same with the one of [jQuery 1.x](http://jquery.com/browser-support/).

| Internet Explorer | Chrome | Firefox | Safari | Opera | iOS | Android |
|---|---|---|---|---|---|---|
| 6+ | (Current - 1) or Current | (Current - 1) or Current | 5.1+ | 12.1x, (Current - 1) or Current| 6.0+ | 4.0+ |

Transport list in each cell is ordered by recommendation. As to `ws`, a word in parentheses means WebSocket protocol. So in order to use `ws`, the server has to be able to support that protocol.

| Browser | Version | WebSocket | HTTP Streaming | HTTP Long polling |
|---|---|---|---|---|
|Firefox|11|`ws` ([rfc6455](http://tools.ietf.org/html/rfc6455))|`sse`, `streamxhr`|`longpollajax`, `longpolljsonp`|
|Chrome|25|`ws` ([rfc6455](http://tools.ietf.org/html/rfc6455))|`sse`, `streamxhr`|`longpollajax`, `longpolljsonp`|
|Internet Explorer|11|`ws` ([rfc6455](http://tools.ietf.org/html/rfc6455))|`streamxhr`|`longpollajax`, `longpolljsonp`|
|                 |10|`ws` ([rfc6455](http://tools.ietf.org/html/rfc6455))|`streamxhr`, `streamxdr`, `streamiframe` <sup>1</sup>, <sup>2</sup>|`longpollajax`, `longpollxdr`, `longpolljsonp`|
|                 |8||`streamxdr`, `streamiframe` <sup>1</sup>|`longpollajax` <sup>1</sup>, `longpollxdr`, `longpolljsonp`|
|                 |6||`streamiframe` <sup>1</sup>|`longpollajax` <sup>1</sup>, `longpolljsonp`|
|Safari|7.0|`ws` ([rfc6455](http://tools.ietf.org/html/rfc6455))|`sse`, `streamxhr`|`longpollajax`, `longpolljsonp`|
|      |6.0|`ws` ([rfc6455](http://tools.ietf.org/html/rfc6455))|`sse` <sup>1</sup>, `streamxhr`|`longpollajax`, `longpolljsonp`|
|      |5.1|`ws` ([hixie-76](http://tools.ietf.org/html/draft-hixie-thewebsocketprotocol-76))|`sse` <sup>1</sup>, `streamxhr`|`longpollajax`, `longpolljsonp`|
|Opera|15|`ws` ([rfc6455](http://tools.ietf.org/html/rfc6455))|`sse`, `streamxhr`|`longpollajax`, `longpolljsonp`|
|     |12.10|`ws` ([rfc6455](http://tools.ietf.org/html/rfc6455))|`sse`|`longpollajax`, `longpolljsonp`|
|iOS|7.0|`ws` ([rfc6455](http://tools.ietf.org/html/rfc6455))|`sse` <sup>1</sup>, `streamxhr`|`longpollajax`, `longpolljsonp`|
|   |6.0||`sse` <sup>1</sup>, `streamxhr`|`longpollajax`, `longpolljsonp`|
|Android|4.4|`ws` ([rfc6455](http://tools.ietf.org/html/rfc6455))|`sse`, `streamxhr`|`longpollajax`, `longpolljsonp`|
|       |4.0||`streamxhr`|`longpollajax`, `longpolljsonp`|

**Note**

* 1: only availabe in same origin connection
* 2: not available in Metro.

#### Node.js
Node.js lower than 0.10 may work.

| Version | WebSocket | HTTP Streaming | HTTP Long polling |
|---|---|---|---|
|0.10|`ws` ([rfc6455](http://tools.ietf.org/html/rfc6455))|`sse`|`longpollajax`|

---

## Quirks
The vibe.js always has tried to deal with any quirks in non-invasive way. However, it is not possible sometimes.

#### The browser limits the number of simultaneous connections

Applies to: HTTP transport

According to the [HTTP/1.1 spec](http://tools.ietf.org/html/rfc2616#section-8.1.4), a single-user client should not maintain more than 2 connections. This restriction actually [varies with the browser](http://stackoverflow.com/questions/985431/max-parallel-http-connections-in-a-browser). If you consider multiple topics to subscribe and publish, utilize the custom event in a single connection.

#### Pressing ESC key aborts the connection

Applies to: Firefox less than 20

One of default behaviors of pressing ESC key in Firefox is to cancel all open networking requests fired by `XMLHttpRequest`, `EventSource`, `WebSocket` and so on. The workaround is to prevent that behavior, and its drawback is that the user can't expect the default behavior of pressing ESC key. [Fixed](https://bugzilla.mozilla.org/show_bug.cgi?id=614304) in Firefox 20.

```js
// With jQuery
$(window).keydown(function(event) {
    if (event.which === 27) {
        event.preventDefault();
    }
});
```

#### Sending an event emits a clicking sound

Applies to: cross-origin HTTP connection on browsers not supporting CORS

If a given url is cross-origin and the browser doesn't support CORS such as Internet Explorer 6, an invisible form tag is used to send data to the server. Here, a clicking sound occurs every time the form is submitted. There is no workaround. Sorry...

#### A blank page pops up when using connection sharing

Applies to: Internet Explorer whose version is higher than `8.0.7601.17514` and lower than `9.0`

When `sharing` option is `true`, if there is trace of a shared connection, new sockets try to utilize it. In doing this, some Internet Explorer versions don't allow to access other windows so that a blank page pops up instead of getting a reference to targeted window. No workaround. Sorry...

---

## Examples
### Simple
The simple example is a basic echo and chat client. By default, it connects to `http://localhost:8080/vibe`. [Here](https://github.com/Atmosphere/vibe-examples/tree/master/javascript-client/simple).
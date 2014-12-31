---
layout: project
title: Vibe JavaScript Client Reference
---

<h1>Reference</h1>

---

**Table of Contents**

* [Installation](#installation)
    * [As browser client](#as-browser-client)
    * [As Node.js client](#as-node.js-client)
* [Socket](#socket)
    * [Life Cycle](#life-cycle)
    * [Error Handling](#error-handling)
    * [Sending and Receiving Event](#sending-and-receiving-event)
    * [Getting and Setting Result of Event Processing](#getting-and-setting-result-of-event-processing)
    * [Heartbeat](#heartbeat)
    * [Reconnection](#reconnection)
    * [Transport](#transport)
* [Transport](#transport-1) 
    * [Implementation](#implementation) 
    * [Compatibility](#compatibility)
        * [Browser](#browser)
        * [Node.js](#node.js)
* [Quirks](#quirks)
    * [The browser limits the number of simultaneous connections](#the-browser-limits-the-number-of-simultaneous-connections)
    * [Pressing ESC key aborts the connection](#pressing-esc-key-aborts-the-connection)
    * [Sending an event emits a clicking sound](#sending-an-event-emits-a-clicking-sound)

---

## Installation
### As browser client
Download vibe.js the way you want.

<ul class="inline-list">
<li><a href="/projects/vibe-javascript-client/3.0.0-Alpha6/vibe.min.js">The compressed for production</a></li>
<li><a href="/projects/vibe-javascript-client/3.0.0-Alpha6/vibe.js">The uncompressed for development</a></li>
<li><code>bower install vibe</code></li>
</ul>

Then load or link it by using either script tag or [Asynchronous Module Definition](https://github.com/amdjs/amdjs-api/blob/master/AMD.md) loader.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Script tag**

```html
<script src="/vibe/vibe.min.js"></script>
<script>
var socket = vibe.open("/vibe");
</script>
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**AMD loader**

```javascript
require(["vibe"], function(vibe) {
    var socket = vibe.open("/vibe");
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
var socket = vibe.open("http://localhost:8080/vibe");
```

---

## Socket
The feature-rich and flexible interface for two-way communication.

### Life Cycle
Socket always is in a specific state that can be accessed by `state()` method. According to the status of connection, transition between states occurs and this circulating transition makes a life cycle. The following list is a list of state which a socket can be in. In any case, if connection is closed due to error, `error` event will be fired before transition to `closed`.

* **preparing**

    As an initial state of life cycle, it's internally used during reinitializing socket. State transition occurs to `connecting` without exception.
    
* **connecting**

    The selected transports start connecting to the server and the `connecting` event is fired. Each transport should establish a connection in time which is set to `timeout` option. The `connecting` event is an initial event where you can handle the socket during the life cycle.
    
    State transition occurs to
    * `opened`: if one of available transports succeeds in establishing a connection.
    * `closed`: if `close()` method is called.
    * `closed`: if every transport fails to connect in time.<p>
    
* **opened**

    The connection is established successfully and communication is possible. The `open` event is fired. Only in this state, the socket can send and receive events via connection. 
     
    State transition occurs to
    
    * `closed`: if `close()` method is called.
    * `closed`: if connection is closed cleanly.
    * `closed`: if heartbeat fails.
    * `closed`: if connection is disconnected due to some error.<p>
    
* **closed**

    The connection has been closed, has been regarded as closed or could not be opened. If the `reconnect` handler is `false` or returns `false`, the socket's life cycle ends here.
    
    State transition occurs to
    * `waiting`: if the `reconnect` handler returns a positive number.<p>
    
* **waiting**

    The socket waits out the reconnection delay. The `waiting` event is fired with the reconnection delay in milliseconds and the total number of reconnection attempts.
    
    State transition occurs to
    * `preparing`: after the reconnection delay.
    * `closed`: if `close()` method is called.

### Error Handling
To capture any error happening in the socket, use error event. If any error is thrown by the socket, `error` event will be fired with `Error` object in question. In most cases, there is nothing you should do in `error` event.

**Note**

* Errors thrown by user created event handler are not propagated to `error` event.

```javascript
vibe.open("http://localhost:8080/vibe", {reconnect: false})
.on("error", function(error) {
    console.error(error);
});
```

### Sending and Receiving Event
You can send event using `send(event: string, data?: any)` and receive event using `on(event: string, onEvent: (data?: any) => void)`. Any event name can be used, except `connecting`, `open`, `error`, `close` and `waiting` and any data can be sent and received but it should be able to be marshalled/unmarshalled to JSON.

**Note**

* Socket must be in `opened` state.
* To manage a lot of events easily, use [URI](http://tools.ietf.org/html/rfc3986) as event name format like `/account/update`.

_The client sends events and the server echoes back to the client._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
vibe.open("http://localhost:8080/vibe", {reconnect: false})
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

_The server sends events and the client echoes back to the server._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript

vibe.open("http://localhost:8080/vibe", {reconnect: false})
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

### Getting and Setting Result of Event Processing
You can get the result of event processing from the server in sending event using `send(event: string, data?: any, onResolved?: (data?: any) => void, onRejected?: (data?: any) => void)` and set the result of event processing to the server in receiving event using `on(event: string, handler:(data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void)`. Either resolved or rejected callback is executed once when the server executes it.

You can apply this functionality to sending events in order, Acknowledgements, Remote Procedure Call and so on.

**Note**

* Socket must be in `opened` state.
* Beforehand determine whether to use rejected callback or not to avoid writing unnecessary rejected callbacks.

_The client sends events attaching callbacks and the server executes one of them with the result of event processing._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
vibe.open("http://localhost:8080/vibe", {reconnect: false})
.on("open", function(data) {
    this.send("/account/find", "donghwan", function(data) {
        console.log("resolved with ", data);
    }, function(data) {
        console.log("rejected with ", data);
    })
    .send("/account/find", "flowersits", function(data) {
        console.log("resolved with ", data);
    }, function(data) {
        console.log("rejected with ", data);
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
    socket.on("/account/find", function(id, reply) {
      console.log(id);
      if (id === "donghwan") {
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

_The server sends events attaching callbacks and the client executes one of them with the result of event processing._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
vibe.open("http://localhost:8080/vibe", {reconnect: false})
.on("/account/find", function(id, reply) {
    console.log(id);
    if (id === "donghwan") {
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
    socket.send("/account/find", "donghwan", function(data) {
        console.log("resolved with ", data);
    }, function(data) {
        console.log("rejected with ", data);
    })
    .send("/account/find", "flowersits", function(data) {
        console.log("resolved with ", data);
    }, function(data) {
        console.log("rejected with ", data);
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Heartbeat
Considering a multitude of browsers, transports, servers, networks and their combination, heartbeat is essential to maintain stable connection. For that reason, a socket starts heartbeat communication every 20 seconds on the open event by default. It can be configured only through the server.

_Eavesdropping heartbeat of client and server._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Client**

```javascript
vibe.open("http://localhost:8080/vibe", {reconnect: false})
.on("heartbeat", function() {
    console.log("heartbeat at ", Date.now());
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
        console.log("heartbeat at ", Date.now());
    });
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### Reconnection
Reconnection has been disabled in the above code snippets for convenience of test, but it's essential for production so that it's enabled by default. The default strategy generates a geometric progression with initial delay `500` and ratio `2` (500, 1000, 2000, 4000 ...). To change it, set `reconnect (delay: number, attempts: number): number` function which receives the last delay in ms or null at first and the total number of reconnection attempts and should return a delay in ms or `false` not to reconnect.

**Note**

* Don't add event handler by `on` method during dispatch including `open` event. Because reconnection doesn't remove existing event handlers, it will be duplicated in next life cycle.

### Transport
WebSocket is clearly a best transport but in the real world, many coporate proxies, firewalls, antivirus softwares and cloud application platforms block it for some reason. Of course, many users still use browsers not supporting WebSocket, which we can't compel to upgrade it. Moreover, other transports have their own similar restrictions as well.

Such transports are configurable by URI which is set from `vibe.open(uri: string)`. If a URI whose scheme is http or https have no transport param, it is translated into three URIs which have `ws`, `stream` and `longpoll` transport param in order. To change that order, you can use `vibe.open(uris: string[])` with URI having transport param. A translated URI corresponds to a transport, and transport's availability is calculated by feature detection determining if it is available on the browser and by try and error determining if it really establishes a connection to the server.

For example, if a given URI is `http://host/vibe`, first, it is translated into `http://host/vibe?transport=ws`, `http://host/vibe?transport=stream` and `http://host/vibe?transport=longpoll` corresponding to `ws`, `stream`, `longpoll` transport respectively. Second, `ws`'s availability is calculated by checking if the browser supports WebSocket and trying connection. If WebSocket is not supported in that browser or the connection isn't established in time which is set to `timeout: number` option, the same way applies to `stream` and `longpoll`. In other words, it will work if it can work so that you don't need to even know what transport is.

---

## Transport
An interface that used to establish a connection, send data, receive data and close the connection. Therefore, transport doesn't have an influence on socket's functionalities.

### Implementation
According to the protocol and the technology, the following implementations are available:

#### WebSocket

It is a protocol designed for a full-duplex communications over a TCP connection. However, many coporate proxies, firewalls and antivirus softwares blocks it for some reason. A given URI should have `ws` or `wss` scheme or `http` or `https` scheme and `ws` transport param. And then it works if browser implements `WebSocket` regardless of its protocol version.

#### HTTP Streaming

The client performs a HTTP persistent connection and watches changes in response text and the server prints chunk as message over the connection. A given URI should have `http` or `https` scheme and `stream` transport param. To establish read-only channel through `GET` method, the following host object is used: 
     
* `EventSource`: It works if browser supports `EventSource` from Server-Sent Events. If the browser is Safari 5 or 6, it works only when same origin connection is given. By reason of the spec's ambiguity, there is no way to determine whether a connection closed normally or not so that `error` event is not thrown even though the connection closed due to an error.
* `XMLHttpRequest`: In case of same origin connection, it works without qualification. In case of cross origin, works if `XMLHttpRequest` supports CORS. However for both cases, if the browser is Internet Explorer, the version should be equal to or higher than 10 and if the browser is Opera, the version should be equal to or higher than 13.
* `XDomainRequest`: It works if browser supports `XDomainRequest`, that is Internet Explorer 8-10, and `xdrURL` option is set.
* `iframe` tag: It works if it's same origin connection and browser supports `ActiveXObject`, namely Internet Explorer 6-10. This transport differs from the traditional [Hidden Iframe](http://en.wikipedia.org/wiki/Comet_%28programming%29#Hidden_iframe) in terms of fetching a response text. The traditional transport expects script tags, whereas this transport periodically polls the response text.

To establish write-only channel through `POST` method, the following host object is used:

* `XMLHttpRequest`: In case of same origin, it works without qualification. In case of cross origin, it works if browser supports CORS.
* `XDomainRequest`: It works if browser supports `XDomainRequest`, that is Internet Explorer 8-10, and `xdrURL` option is set.
* `form` tag: It works alwayas but makes a clicking sound.

#### HTTP Long Polling

The client performs a HTTP persistent connection and the server ends the connection with data. Then, the client receives it and performs a request again. A given URI should have `http` or `https` scheme and `longpoll` transport param. It is implemented by the following host object: 
     
* `XMLHttpRequest`: In case of same origin connection, it works without qualification. In case of cross origin, works if `XMLHttpRequest` supports CORS.
* `XDomainRequest`: It works if browser supports `XDomainRequest`, that is Internet Explorer 8-10, and `xdrURL` option is set.
* `script` tag: It works always.<p>

To establish write-only channel through `POST` method, the following host object is used:

* `XMLHttpRequest`: In case of same origin, it works without qualification. In case of cross origin, it works if browser supports CORS.
* `XDomainRequest`: It works if browser supports `XDomainRequest`, that is Internet Explorer 8-10, and `xdrURL` option is set.
* `form` tag: It works alwayas but makes a clicking sound.

### Compatibility
The compatiblity of vibe.js depends on transport compatibility.

#### Browser
The browser support policy is the same with the one of [jQuery 1.x](http://jquery.com/browser-support/).

| Internet Explorer | Chrome | Firefox | Safari | Opera | iOS | Android |
|---|---|---|---|---|---|---|
| 6+ | (Current - 1) or Current | (Current - 1) or Current | 5.1+ | 12.1x, (Current - 1) or Current| 6.0+ | 4.0+ |

Transport list in each cell is ordered by recommendation. As to `ws`, a word in cell means WebSocket protocol. So in order to use `ws`, the server has to be able to support that protocol. As to `stream` and `longpoll`, a word in cell means the host object used to establish a read-only channel.

| Browser | Version | WebSocket | HTTP Streaming | HTTP Long Polling |
|---|---|---|---|---|
|Internet Explorer|11|rfc6455|`XMLHttpRequest`|`XMLHttpRequest`|
|                 |10|rfc6455|`XMLHttpRequest`|`XMLHttpRequest`|
|                 |8||`XDomainRequest`<sup>2</sup>, `iframe`<sup>1</sup>|`XMLHttpRequest`<sup>1</sup>, `XDomainRequest`<sup>2</sup>, `script`|
|                 |6||`iframe`<sup>1</sup>|`XMLHttpRequest`<sup>1</sup>, `script`|
|Chrome|25|rfc6455|`EventSource`|`XMLHttpRequest`|
|Firefox|11|rfc6455|`EventSource`|`XMLHttpRequest`|
|Safari|7.0|rfc6455|`EventSource`|`XMLHttpRequest`|
|      |6.0|rfc6455|`EventSource`<sup>1</sup>, `XMLHttpRequest`|`XMLHttpRequest`|
|      |5.1|hixie-76|`EventSource`<sup>1</sup>, `XMLHttpRequest`|`XMLHttpRequest`|
|Opera|15|rfc6455|`EventSource`|`XMLHttpRequest`|
|     |12.10|rfc6455|`EventSource`|`XMLHttpRequest`|
|iOS|7.0|rfc6455|`EventSource`|`XMLHttpRequest`|
|   |6.0||`EventSource`<sup>1</sup>, `XMLHttpRequest`|`XMLHttpRequest`|
|Android|4.4|rfc6455|`EventSource`|`XMLHttpRequest`|
|       |4.0||`XMLHttpRequest`|`XMLHttpRequest`|

**Note**

* 1: only availabe in same origin connection
* 2: `xdrURL` option required.

#### Node.js
Node.js lower than 0.10 may work.

| Version | `ws` | `stream` | `longpoll` |
|---|---|---|---|
|0.10| rfc6455|`EventSource`|`XMLHttpRequest`|

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

If a given url is cross-origin and the browser doesn't support CORS such as Internet Explorer 6, an invisible form tag is used to send data to the server. Here, a clicking sound occurs every time the form is submitted. There is no workaround.
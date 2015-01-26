---
layout: project
title: Vibe JavaScript Client API
---

<h1>API</h1>

---

**Table of Contents**

* [module vibe](#module-vibe)
    * [export function open(uri: string, options?: SocketOptions): Socket](#export-function-open-uri:-string--options-:-socketoptions-:-socket)
    * [export function open(uris: string[], options?: SocketOptions): Socket](#export-function-open-uris:-string----options-:-socketoptions-:-socket)
    * [interface SocketOptions](#interface-socketoptions)
        * [reconnect? (lastDelay: number, attempts: number): any](#reconnect---lastdelay:-number--attempts:-number-:-any)
        * [transports?: ((uri: string, options: TransportOptions) => Transport)[]](#transports-:---uri:-string--options:-transportoptions-----transport---)
    * [interface Socket](#interface-socket)
        * [close(): Socket](#close--:-socket)
        * [off(event: string, handler: Function): Socket](#off-event:-string--handler:-function-:-socket)
        * [on(event: string, handler: Function): Socket](#on-event:-string--handler:-function-:-socket)
            * [connecting (): void](#connecting---:-void)
            * [open (): void](#open---:-void)
            * [error (error: Error): void](#error--error:-error-:-void)
            * [close (): void](#close---:-void)
            * [waiting (delay: number, attempts: number): void](#waiting--delay:-number--attempts:-number-:-void)
            * [[event: string]: (data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void](#-event:-string-:--data-:-any--reply-:--resolve:--data-:-any-----void--reject:--data-:-any-----void------void)
        * [once(event: string, handler: Function): Socket](#once-event:-string--handler:-function-:-socket)
        * [send(event: string, data?: any, resolved?: (data?: any) => void, rejected?: (data?: any) => void): Socket](#send-event:-string--data-:-any--resolved-:--data-:-any-----void--rejected-:--data-:-any-----void-:-socket)
        * [state(): string](#state--:-string )
* [module vibe.transport](#module-vibe.transport)
    * [export function createWebSocketTransport(uri: string, options?: TransportOptions): Transport](#export-function-createwebsockettransport-uri:-string--options-:-transportoptions-:-transport)
    * [export function createHttpStreamTransport(uri: string, options?: TransportOptions): Transport](#export-function-createhttpstreamtransport-uri:-string--options-:-transportoptions-:-transport)
    * [export function createHttpLongpollTransport(uri: string, options?: TransportOptions): Transport](#export-function-createhttplongpolltransport-uri:-string--options-:-transportoptions-:-transport)
    * [interface TransportOptions](#interface-transportoptions)
        * [timeout?: number](#timeout-:-number)
        * [xdrURL? (uri: string): string](#xdrurl---uri:-string-:-string)
    * [interface Transport](#interface-transport)
        * [close(): Transport](#close--:-transport)
        * [off(event: string, handler: Function): Transport](#off-event:-string--handler:-function-:-transport)
        * [on(event: string, handler: Function): Transport](#on-event:-string--handler:-function-:-transport)
        * [open(): Transport](#open--:-transport)
        * [send(message: string): Transport](#send-message:-string-:-transport)

---

## `module vibe`
A vibe client module acting as a factory to create and manage socket. Every time the module is loaded through either Node's require, AMD's require or script tag, it's newly created. But you don't need to be aware of that.

This page already loaded the module. Open a console and type `vibe`.

_Loading module._

<div class="row">
<div class="large-4 columns">
{% capture panel %}
**Script tag**

```html
<script src="/vibe/vibe.min.js"></script>
<script>vibe;</script>
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns">
{% capture panel %}
**AMD loader**

```javascript
require(["vibe"], function(vibe) {});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns">
{% capture panel %}
**Node.js**

```javascript
var vibe = require("vibe-client");
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### `export function open(uri: string, options?: SocketOptions): Socket`
It's the same with `vibe.open([uri], options)`.

### `export function open(uris: string[], options?: SocketOptions): Socket`
Creates a socket and returns it. Because it's asynchronous operation, the returned socket is in `connecting` state. It translates `uris` into ones corresponding to transport one-to-one. As for each URI, it creates a corresponding transport through transport factories specified by `transports?: ((uri: string, options: TransportOptions) => Transport)[]` option and tries a connection to determine if it can really establish a connection in time which is set to `timeout:number` option. If it turns out that the current URI is not available, next URI is tried along the same lines. Once one of transports established a connection, `open` event is fired, and if all the transports failed, `close` event is fired with `error` event.

Because URI is the only key to determine the transport, it should follow a way specified by each transport. However, some exceptions are allowed for the sake of convenience.

* Relative URI: It's converted into the absolute one but only available in browser.
* URI whose scheme is `http` or `https` and which has no transport param: It's translated into three URIs which correspond to WebSocket, HTTP Streaming and HTTP Long polling in order. 

_Simplest one._

```javascript
vibe.open("/vibe"); // from one page from http://google.com
```

_Translated one of the above example._

```javascript
// You can change the default transport order with this way
vibe.open(["ws://google.com/vibe", "http://google.com/vibe?transport=stream", "http://google.com/vibe?transport=longpoll"]);
```

_Using only WebSocket_

```javascript
vibe.open("ws://google.com/vibe");
```

### `interface SocketOptions`
An interface of properties to get/set socket options. Because it extends `TransportOptions`, it can handle transport options as well. None of properties are required so it can be an empty object.

_All possible options along with their default values._

```javascript
vibe.open(uri, {
    // Socket options
    reconnect: function(lastDelay) {
        return 2 * lastDelay || 500;
    },
    transports: [
        vibe.transport.createWebSocketTransport, 
        vibe.transport.createHttpStreamTransport, 
        vibe.transport.createHttpLongpollTransport
    ],
    // Transport options
    timeout: 3000,
    xdrURL: null // browser-only
});
```

#### `reconnect? (lastDelay: number, attempts: number): any`
**Default**: Generates a geometric series with initial delay `500` and ratio `2`

##### `reconnect? (lastDelay: number, attempts: number): number`
A function to be used to schedule reconnection. The function is called every time after the `close` event and should return a delay in milliseconds. The function receives two arguments: The last delay in milliseconds used or `null` at first and the total number of reconnection attempts.

##### `reconnect? (lastDelay: number, attempts: number): boolean`
A function returning `false` stops further reconnection.

##### `reconnect?: boolean`
It's the same with the above one.

_A Fibonacci series with first delay `500` and second delay `1000`._

```javascript
vibe.open(uri, {
    reconnect: function(lastDelay) {
        var beforeLastDelay = this.beforeLastDelay || 0;
        lastDelay = lastDelay || 500;
        this.beforeLastDelay = lastDelay;
        return beforeLastDelay + lastDelay; // 500, 1000, 1500, 2500 ...
    }
});
```

#### `transports?: ((uri: string, options: TransportOptions) => Transport)[]`
**Default**: `[vibe.transport.createWebSocketTransport, vibe.transport.createHttpStreamTransport, vibe.transport.createHttpLongpollTransport]`

A set of transport factory. It is used to determine a transport given a URI. Because URI should follow a way specified by each transport, order of factories is not meaningful. The transport factory should create and return a transport object if it can handle given URI and nothing if not. By default, WebSocket transport factory, HTTP Streaming transport factory and HTTP Long polling transport factory are provided.

_Using your own transport._

```javascript
// A factory to create TCP transport
function createNetTransport(uri, options) {
    // Only if URI's protocol is tcp and NetSocket which is an imaginary object for TCP communication is available 
    if (/^tcp:/.test(uri) && !!NetSocket) {
        // Returns transport object
        return {/* skipped */};
    } else {
        // Returns nothing
    }
}

vibe.open("tcp://localhost:8080", {transports: [createNetTransport]});
```

### `interface Socket`
An interface representing a socket created by calling `vibe.open`.

_Echo_

```javascript
vibe.open(uri).on("open", function() {
    this.send("echo", "Hello World");
})
.on("echo", function(data) {
    console.log("echoed back", data);
});
```

#### `close(): Socket`
Closes the socket. A socket closed by this method shouldn't be and can't be used again.

#### `off(event: string, handler: Function): Socket`
Removes a given event handler for a given event. 

#### `on(event: string, handler: Function): Socket`
Adds a given event handler for a given event. If a handler is set, it will be reset upon reconnection so don't call `on` in dispatching event including `open`. Generally, added handler is called every time server sends the corresponding event, but if a given event is reserved, a given event handler behave differently like the following. 

##### `connecting (): void`
A pseudo event which is fired only once in life cycle when a connection is tried.

_Notifying a user of connection_

```javascript
// If this socket is in connecting, it will be executed immediately.
// If this socket is in opened, closed or waiting, it will be ignored.
vibe.open(uri).on("connecting", function() {
    console.log("Trying connection");
});
```

##### `open (): void`
A network event which is fired only once in life cycle when a connection is established and communication is possible.

_Providing the application with an event channel with the server._

```javascript
// If this socket is in opened, it will be executed immediately.
// If this socket is in connecting, closed or waiting, it will be ignored.
vibe.open(uri).on("open", function() {
    app.bridge(this);
});
```

##### `error (error: Error): void`
A message event which is fired every time an error has occurred. The `error`'s message property can be one of the following values:

* `heartbeat`: Heartbeat operations failed.
* `notopened`: A connection is not established yet.
* Otherwise, all transports fails to establish a connection.
 
 Also transprot's `error` event is propagated to here.
 
_Logging given error._

```javascript
// If this socket is in connecting and opened, it will be executed every time an error has occurred.
// If this socket is in closed or waiting, it will be ignored.
vibe.open(uri).on("error", function(error) {
    console.error(error);
});
```

##### `close (): void`
A network event which is fired only once in life cycle when a connection has been closed for any reason or couldn't be establiahsed.

_Releasing resources that it has been holding._
 
```javascript
// If this socket is in connecting and opened, it will be executed on close event.
// If this socket is in closed or waiting, it will be executed immediately.
vibe.open(uri).on("close", function() {
    writer.close();
});
```

##### `waiting (delay: number, attempts: number): void`
A pseudo event which is fired only once in life cycle when a reconnection has scheduled. `delay` is the reconnection delay in milliseconds and `attempts` is the total number of reconnection attempts.

_Notifiying a user of delay, the time have to wait for_

```javascript
// If this socket is in connecting and opened, it will be executed on waiting event.
// If this socket is in closed or waiting, it will be executed immediately.
vibe.open(uri).on("waiting", function(delay, attempts) {
    console.log("This is", attempts, (["st", "nd", "rd"][attempts - 1] || "th"), "attempt. It will connect in", (delay / 1000), "sec");
});
```

##### `[event: string]: (data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void`
All the other event are message event and fired every time the server sends an event. `data` is data of the server sent event and `reply` is a controller to reply the server and not null only if server attaches resolved or rejected callback. Because this type of event will be used heavily, to manage such many events systematically, using some format like [URI](http://tools.ietf.org/html/rfc3986) to event naming is helpful.

_Receiving data_

```javascript
// If this socket is in connecting and opened, it will be executed every time an event has been received.
// If this socket is in closed or waiting, it will be ignored.
vibe.open(uri).on("/chat/message", function(message) {
    console.dir(message);
});
```

_Replying to event_

```javascript
vibe.open(uri).on("/talk/request", function(account, reply) {
    $.templates("#template").link("#dialog section", account);
    $("#dialog").show().one("close", function() {
        if (this.returnValue) {
            reply.resolve();
        } else {
            reply.reject();
        }
    });
});
```

#### `once(event: string, handler: Function): Socket`
Adds a given one time event handler for a given event. A handler shares the same signatures with `on`. It can be removed by `off` and called only once in the life cycle or never.

_Sending an event defensively._

```javascript
// If this socket is in connecting, it will be executed on open event and removed.
// If this socket is in opened, it will be executed and removed immediately.
// If this socket is in closed or waiting, it will be ignored.
// Whether or not it is called, it will never called in further life cycle. 
socket.once("open", function() {
    this.send("event", "data");
});
```

#### `send(event: string, data?: any, resolved?: (data?: any) => void, rejected?: (data?: any) => void): Socket`
Sends the event with data attaching resolved and rejected callbacks. If a socket is not opened, it will fire an error event.

_Sending simple event._

```javascript
vibe.open(uri).on("open", function() {
    this.send("/start");
});
```

_Getting data from the server._

```javascript
vibe.open(uri).on("open", function() {
    this.send("/account/find", "flowersinthesand", function(account) {
        console.dir(account);
    }, function(reason) {
        console.log("Got an error", reason);
    });
});
```

_Sending events in order._

```javascript
vibe.open(uri).on("open", function() {
    this.send("event", 1, function() {
        this.send("event", 2, function() {
            this.send("event", 3, function() {
                this.send("event", 4);
            });
        });
    });
});
```

#### `state(): string`
Determines the current state of the socket. Possible state values are `connecting`, `opened`, `closed` and `waiting`.

_Tracking socket state_

```javascript
function logState() {
    console.log(this.state(), arguments);
}

vibe.open(uri).on("connecting", logState).on("open", logState).on("close", logState).on("waiting", logState);
```

## `module vibe.transport`
As a sub module of vibe, it is used to create and manage transport and transport is used to build socket on top of itself by `vibe.open`. This module is useful to those who want write their own transport. If you are happy with default transports, you don't need to look at it. The module is accessible through `vibe.transport`.

### `export function createWebSocketTransport(uri: string, options?: TransportOptions): Transport`
A factory to create a WebSocket transport. WebSocket is a protocol designed for a full-duplex communications over a TCP connection. However, many coporate proxies, firewalls and antivirus softwares blocks it for some reason.

A given URI should have either `ws` or `wss` scheme. Only if browser implements `WebSocket` regardless of WebSocket protocol version, this factory can create and return a transport.

### `export function createHttpStreamTransport(uri: string, options?: TransportOptions): Transport`
A factory to create a HTTP Streaming transport. In streaming, the client performs a HTTP persistent connection and watches changes in response text and the server prints chunk as message over the connection.

A given URI should have either `http` or `https` scheme and `stream` transport param. This factory always creates and returns a transport and returned transport is backed up by the following host objects which are chosen according to context automatically.

To establish read-only channel through `GET` method:
     
* `EventSource`: It works if browser supports `EventSource` from Server-Sent Events. If the browser is Safari 5 or 6, it works only when same origin connection is given. By reason of the spec's ambiguity, there is no way to determine whether a connection closed normally or not so that `error` event is not thrown even though the connection closed due to an error.
* `XMLHttpRequest`: In case of same origin connection, it works without qualification. In case of cross origin, works if `XMLHttpRequest` supports CORS. However for both cases, if the browser is Internet Explorer, the version should be equal to or higher than 10 and if the browser is Opera, the version should be equal to or higher than 13.
* `XDomainRequest`: It works if browser supports `XDomainRequest`, that is Internet Explorer 8-10, and `xdrURL` option is set.
* `iframe` tag: It works if it's same origin connection and browser supports `ActiveXObject`, namely Internet Explorer 6-10. This transport differs from the traditional [Hidden Iframe](http://en.wikipedia.org/wiki/Comet_%28programming%29#Hidden_iframe) in terms of fetching a response text. The traditional transport expects script tags, whereas this transport periodically polls the response text.

To establish write-only channel through `POST` method:

* `XMLHttpRequest`: In case of same origin, it works without qualification. In case of cross origin, it works if browser supports CORS.
* `XDomainRequest`: It works if browser supports `XDomainRequest`, that is Internet Explorer 8-10, and `xdrURL` option is set.
* `form` tag: It works alwayas but makes a clicking sound.

### `export function createHttpLongpollTransport(uri: string, options?: TransportOptions): Transport`
A factory to create a HTTP Long polling transport. In long polling, the client performs a HTTP persistent connection and the server ends the connection with data. Then, the client receives it and performs a request again.

A given URI should have either `http` or `https` scheme and `longpoll` transport param. This factory always creates and returns a transport and returned transport is backed up by the following host objects which are chosen according to context automatically.

To establish read-only channel through `GET` method:
     
* `XMLHttpRequest`: In case of same origin connection, it works without qualification. In case of cross origin, works if `XMLHttpRequest` supports CORS.
* `XDomainRequest`: It works if browser supports `XDomainRequest`, that is Internet Explorer 8-10, and `xdrURL` option is set.
* `script` tag: It works always.<p>

To establish write-only channel through `POST` method:

* `XMLHttpRequest`: In case of same origin, it works without qualification. In case of cross origin, it works if browser supports CORS.
* `XDomainRequest`: It works if browser supports `XDomainRequest`, that is Internet Explorer 8-10, and `xdrURL` option is set.
* `form` tag: It works alwayas but makes a clicking sound.

### `interface TransportOptions`
An interface of properties to get/set transport options. None of properties are required so it can be an empty object.

#### `timeout?: number`
**Default**: `3000`

A timeout value in milliseconds. It applies when a transport tries connection. If every transport fails, then the `close` event is fired with `error` event.

#### `xdrURL? (uri: string): string`
**Default**: `null`

A function used to modify a url to add session information to enable transports depending on `XDomainRequest`. For security reasons, the `XDomainRequest` excludes cookie when sending a request, so that session cannot be tracked by cookie. However, if the server supports [session tracking by url](http://stackoverflow.com/questions/6453779/maintaining-session-by-rewriting-url), it is possible to track session by setting `xdrURL`.

_Session tracking by modifying url_

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Java Servlet**

```javascript
vibe.open(uri, {
    // input: url?k=v
    // output: url;jsessionid=${cookie.JSESSIONID}?k=v
    xdrURL: function(uri) {
        var sid = /(?:^|; )JSESSIONID=([^;]*)/.exec(document.cookie)[1];
        return url.replace(/;jsessionid=[^\?]*|(\?)|$/, 
            ";jsessionid=" + sid + "$1");
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**PHP**

```javascript
vibe.open(uri, {
    // input: url?k=v
    // output: url?PHPSESSID=${cookie.PHPSESSID}&k=v
    xdrURL: function(uri) {
        var sid = /(?:^|; )PHPSESSID=([^;]*)/.exec(document.cookie)[1];
        return url.replace(/\?PHPSESSID=[^&]*&?|\?|$/, 
            "?PHPSESSID=" + sid + "&").replace(/&$/, "");
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

### `interface Transport`
An interface representing a transaport created by transport factory. Unlike socket, there is no reconnection and once connection is closed it can't be used again. Implementation should provide full-duplex channel, ensure no message loss and be able to detect disconnection. 

#### `close(): Transport`
Closes the transport.

#### `off(event: string, handler: Function): Transport`
Removes a given event handler for a given event.

#### `on(event: string, handler: Function): Transport`
Adds a given event handler for a given event. Only the following reserved events is allowed.

##### `open (): void`
A network event which is fired only once when a connection is established and communication is possible.

##### `text (message: string): void`
A message event which is fired every time a text message has received.

##### `error (error: Error): void`
A message event which is fired every time an error has occurred.

##### `close (): void`
A network event which is fired only once when a connection has been closed for any reason or couldn't be establiahsed. After this event, the transport can't be used again.

#### `open(): Transport`
Establishes a connection.

#### `send(message: string): Transport`
Sends a text message to the server.
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
    * [interface TransportOptions](#interface-transportoptions)
        * [timeout?: number](#timeout-:-number)
        * [xdrURL? (uri: string): string](#xdrurl---uri:-string-:-string)
    * [interface Transport](#interface-transport)
        * [close(): Transport](#close--:-transport)
        * [off(event: string, handler: Function): Transport](#off-event:-string--handler:-function-:-transport)
        * [on(event: string, handler: Function): Transport](#on-event:-string--handler:-function-:-transport)
            * [open (): void](#open---:-void-1)
            * [error (error: Error): void](#error--error:-error-:-void-1)
            * [close (): void](#close---:-void-1)
            * [text (message: string): void](#text--message:-string-:-void)
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
Creates a socket and returns it. Because it's asynchronous operation, the returned socket is in `connecting` state. It translates `uris` into ones corresponding to transport one-to-one and creates transport one by one by feature detection determining if it is available on the browser and tries connection to determine if it can really establish a connection in time which is set to `timeout:number` option. Once one of transports established a connection, `open` event is fired and if all the transports failed, `close` event is fired with `error` event.

A URI is an only key to determine the transport and should correspond to a transport following a way specified by each transport.

* WebSocket: URI should have `ws` or `wss` scheme or `http` or `https` scheme with `ws` transport param.
* HTTP Streaming: URI should have `http` or `https` scheme with `stream` transport param.
* HTTP Long Polling: URI should have `http` or `https` scheme with `longpoll` transport param.

However, some exceptions are allowed for the sake of convenience.

* Relative URI: It's converted into the absolute one but only available in browser.
* URI whose scheme is `http` or `https` but which has no transport param: It's translated into three URIs which have `ws`, `stream` and `longpoll` transport param in order. 

_Simplest one._

```javascript
vibe.open("/vibe"); // from one page from http://google.com
```

_Translated one of the above example._

```javascript
// You can change the default transport order with this way
vibe.open(["http://google.com/vibe?transport=ws", "http://google.com/vibe?transport=stream", "http://google.com/vibe?transport=longpoll"]);
```

_Using only WebSocket_

```javascript
vibe.open("ws://google.com/vibe"); // or vibe.open("/vibe?transport=ws"); or vibe.open("http://google.com/vibe?transport=ws");
```

### `interface SocketOptions`
An interface of properties to get/set socket options including transport options. None of properties are required so it can be an empty object.

_All possible options along with their default values._

```javascript
vibe.open(uri, {
    // Socket
    reconnect: function(lastDelay) {
        return 2 * lastDelay || 500;
    },
    // Transport
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

### `interface TransportOptions`
An interface of properties to get/set transport options. Since `SocketOptions` extends `TransportOptions`, it's possible to configure transport options through [`SocketOptions`](#interface-socketoptions).

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
An interface representing a full duplex message channel. For now it's internally used only. To make a plain vibe application, see [`Socket`](#interface-socket).

#### `close(): Transport`
Closes the transport.

#### `off(event: string, handler: Function): Transport`
Removes a given event handler for a given event. 

#### `on(event: string, handler: Function): Transport`
Adds a given event handler for a given event.

##### `open (): void`
Fired only once when a connection is established and communication is possible.

##### `error (error: Error): void`
Fired every time an error has occurred. The `error`'s message property can be one of the following values:

* `timeout`: Failed to establish a connection in time.
* Otherwise, a connection is closed due to some error.
 
##### `close (): void`
Fired only once when a connection has been closed for any reason or couldn't be establiahsed.

##### `text (message: string): void`
Fired every time server sends a text message.

#### `send(message: string): Transport`
Sends a text message.
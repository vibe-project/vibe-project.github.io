---
layout: project
title: Vibe JavaScript Client API
---

<h1>API</h1>

---

**Table of Contents**

* [module vibe](#module-vibe)
    * [export function open(uri: string, options?: SocketOptions): Socket](#export-function-open-uri:-string--options-:-socketoptions-:-socket)
    * [interface SocketOptions](#interface-socketoptions)
        * [heartbeat?: any](#heartbeat-:-any)
        * [reconnect? (lastDelay: number, attempts: number): any](#reconnect---lastdelay:-number--attempts:-number-:-any)
        * [sharing?: boolean](#sharing-:-boolean)
        * [timeout?: any](#timeout-:-any)
        * [transports?: string[]](#transports-:-string--)
        * [xdrURL? (uri: string): string](#xdrurl---uri:-string-:-string)
    * [interface Socket](#interface-socket)
        * [close(): Socket](#close--:-socket)
        * [off(event: string, handler: Function): Socket](#off-event:-string--handler:-function-:-socket)
        * [on(event: string, handler: Function): Socket](#on-event:-string--handler:-function-:-socket)
            * [connecting (): void](#connecting---:-void)
            * [open (): void](#open---:-void)
            * [close (reason: string): void](#close--reason:-string-:-void)
            * [waiting (delay: number, attempts: number): void](#waiting--delay:-number--attempts:-number-:-void)
            * [[event: string]: (data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void](#-event:-string-:--data-:-any--reply-:--resolve:--data-:-any-----void--reject:--data-:-any-----void------void)
        * [once(event: string, handler: Function): Socket](#once-event:-string--handler:-function-:-socket)
        * [send(event: string, data?: any, resolved?: (data?: any) => void, rejected?: (data?: any) => void): Socket](#send-event:-string--data-:-any--resolved-:--data-:-any-----void--rejected-:--data-:-any-----void-:-socket)
        * [state(): string](#state--:-string ) 

---

## `module vibe`
A module acting as a factory for vibe client. This page already loaded the module. Open a console and type `vibe`.

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
Opens a socket and returns it. `uri` can be relative in browser.

_Hello world._

```javascript
vibe.open(uri);
```

### `interface SocketOptions`
An interface of properties to get/set socket options. None of properties are required so it can be an empty object.

_All possible options along with their default values._

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Browser**

```javascript
vibe.open(uri, {
    heartbeat: false,
    reconnect: function(lastDelay) {
        return 2 * lastDelay || 500;
    },
    sharing: false,
    timeout: false,
    transports: ["ws", "stream", "longpoll"],
    xdrURL: null
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**Node.js**

```javascript
vibe.open(uri, {
    heartbeat: false,
    reconnect: function(lastDelay) {
        return 2 * lastDelay || 500;
    },
    timeout: false,
    transports: ["ws", "stream", "longpoll"]
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

_My configuration for testing._

```javascript
vibe.open(uri, {reconnect: false, timeout: 1000, xdrURL: function(url) {return url;}});
```

#### `heartbeat?: any`
**Default**: `false`

##### `heartbeat?: number`
A heartbeat interval value in milliseconds. A opened socket continuously sends a heartbeat event to the server each time the value has elapsed. Actually, the socket sends the event 5 seconds before the heartbeat timer expires to wait the server's echo. If the event echoes back within 5 seconds, the socket reset the timer. Otherwise, the `close` event is fired. For that reason, the value must be larger than `5000` and the recommended value is `20000`.

##### `heartbeat?: boolean`
The value `false` means no heartbeat.

#### `reconnect? (lastDelay: number, attempts: number): any`
**Default**: Generates a geometric series with initial delay `500` and ratio `2`

##### `reconnect? (lastDelay: number, attempts: number): number`
A function to be used to schedule reconnection. The function is called every time after the `close` event and should return a delay in milliseconds. The function receives two arguments: The last delay in milliseconds used or `null` at first and the total number of reconnection attempts.

##### `reconnect? (lastDelay: number, attempts: number): boolean`
A function can return `false` to stop further reconnection.

##### `reconnect?: boolean`
The value `false` indicates no reconnection. It is useful in testing.

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

#### `sharing?: boolean`
**Default**: `false`

A flag indicating that connection sharing across tabs and windows is enabled or not. If this is turned on, as long as the cookie is enabled, the socket will try to automatically share a real connection if there is no corresponding one, and find and use a shared connection if it exists within the cookie's scope. 

Note that this option is only for browser and if the web page or computer becomes horribly busy, a newly created socket might establish a physical connection. Also the connection sharing will be rewritten soon so I don't recommend to use it for now.

#### `timeout?: any`
**Default**: `false`

##### `timeout?: number`
A timeout value in milliseconds. The timeout timer starts at the time the `connecting` event is fired. If the timer expires before the connection is established, the `close` event is fired.

##### `timeout?: boolean`
The value `false` means no timeout.

#### `transports?: string[]`
**Default**: `["ws", "stream", "longpoll"]`

An array of the transport ids, in order of index. The default set means given runtime environment, try WebSocket, if not possible try HTTP Streaming, if not possible use HTTP Long polling. Transport availability is calculated by feature detection in runtime environment. It doesn't guarantee that selected transport will work with the given network and server.

The default set will be replaced with actual transport id in runtime: `["ws", "sse", "streamxhr", "streamxdr", "streamiframe", "longpollajax", "longpollxdr", "longpolljsonp"]` in browser and `["ws", "sse", "longpollajax"]` in Node.js.

#### `xdrURL? (uri: string): string`
**Default**: `null`

A function used to modify a url to add session information to enable `streamxdr` and `longpollxdr` transports. For security reasons, the `XDomainRequest` excludes cookie when sending a request, so the session cannot be tracked by cookie. That's why `streamxdr` and `longpollxdr` are disabled by default. However, if the server supports [session tracking by url](http://stackoverflow.com/questions/6453779/maintaining-session-by-rewriting-url), it is possible to track session by setting `xdrURL`.

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

### `interface Socket`
An interface representing a socket created by calling `vibe.open`.

_Echo_

```javascript
vibe.open(uri).on("open", function() {
    this.send("echo", "Hello World");
})
.on("echo", function(data) {
    console.log("echoed back: " + data);
});
```

#### `close(): Socket`
Closes the socket.

#### `off(event: string, handler: Function): Socket`
Removes a given event handler for a given event. 

#### `on(event: string, handler: Function): Socket`
Adds a given event handler for a given event. If a handler is set, it will be reset upon reconnection so don't call `on` in dispatching event including `open`.

##### `connecting (): void`
A pseudo event which is fired only once when a connection is tried.

_Notifying a user of connection_

```javascript
// If this socket is in connecting, it will be executed immediately.
// If this socket is in opened, closed or waiting, it will be ignored.
vibe.open(uri).on("connecting", function() {
    console.log("Trying connection");
});
```

##### `open (): void`
A network event which is fired only once when a connection is established and communication is possible.

_Providing the application with an event channel with the server._

```javascript
// If this socket is in connecting, it will be executed immediately.
// If this socket is in opened, closed or waiting, it will be ignored.
vibe.open(uri).on("open", function() {
    app.bridge(this);
});
```

##### `close (reason: string): void`
A network event which is fired once when a connection has been closed. The close `reason` can be one of the following values:

* `notransport`: there is no available transport.
* `error`: transport fails to connect*, connection is disconnected due to some error* or heartbeat fails.
* `done`: connection is closed cleanly.
* `timeout`: it's timed out.
* `aborted`: closed by `close` method.

\*: if transport is sse, reason will be `done`.

_Releasing resources that it has been holding._
 
```javascript
// If this socket is in connecting and opened, it will be executed on close event.
// If this socket is in closed or waiting, it will be executed immediately.
vibe.open(uri).on("close", function(reason) {
    writer.close();
});
```

##### `waiting (delay: number, attempts: number): void`
A pseudo event which is fired only once when a reconnection has scheduled. `delay` is the reconnection delay in milliseconds and `attempts` is the total number of reconnection attempts.

_Notifiying a user of delay, the time have to wait for_

```javascript
// If this socket is in connecting and opened, it will be executed on waiting event.
// If this socket is in closed or waiting, it will be executed immediately.
vibe.open(uri).on("waiting", function(delay, attempts) {
    console.log("This is " + attempts + (["st", "nd", "rd"][attempts - 1] || "th") + " attempt. It will connect in " + (delay / 1000) + " sec");
});
```

##### `[event: string]: (data?: any, reply?: {resolve: (data?: any) => void; reject: (data?: any) => void}) => void`
All the other event are message event and fired every time the server sends an event. `data` is data of the server sent event and `reply` is a controller to reply the server and not null only if server attaches resolved or rejected callback.

_Receiving data_

```javascript
// If this socket is in connecting and opened, it will be executed every time an event has been received.
// If this socket is in closed or waiting, it will be ignored.
vibe.open(uri).on("chat", function(message) {
    console.dir(message);
});
```

_Replying to event_

```javascript
vibe.open(uri).on("blinddate.request", function(account, reply) {
    if (account.sex === "female") {
        background.check.look(account.name, function(look) {
            if (look.straightHair && (look.noGlasses || look.contactLenses) && look.cleanSkin) {
                background.check.personality(account.name, function(personality) {
                    if (personality.kind || personality.sunny) {
                        reply.resolve("(*^3^)/");
                    } else {
                        reply.resolve();
                    }
                });
            } else {
                reply.reject();
            }
        });
    } else {
        reply.reject("(╯°□°）╯");
    }
});
```

#### `once(event: string, handler: Function): Socket`
Adds a given one time event handler for a given event. A handler shares the same signatures with `on`. It can be removed by `off` and called only once or never. It will not be reset upon reconnection.

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
Sends the event with data attaching resolved and rejected callbacks. If a socket is not opened, it will throw an error. If you have enabled connection sharing, don't attach `resolved` and `rejected` callbacks. In current implementation, it's not recommended.

_Sending simple event._

```javascript
vibe.open(uri).on("open", function() {
    this.send("start");
});
```

_Getting data from the server._

```javascript
vibe.open(uri).on("open", function() {
    this.send("account.find", "flowersinthesand", function(account) {
        console.dir(account);
    }, function(reason) {
        console.log("Got an error:" + reason);
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
Determines the current state of the socket. Possible state values are `connecting`, `opened`, `closed` and `waiting` and each state transition occurs on `connecting`, `open`, `close` and `waiting` event respectively.

_Tracking socket state_

```javascript
function logState() {
    console.log(this.state());
}

vibe.open(uri).on("connecting", logState).on("open", logState).on("close", logState).on("waiting", logState);
```
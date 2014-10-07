---
layout: post
title: "Anatomy of Vibe Protocol"
author: flowersinthesand
---

Because there is no documented specification for the protocol now, you may wonder how Vibe protocol is and will be organized. Here's an overview of Vibe protocol including features on the roadmap. The following blocks build the protocol:

* **Handshaking** - A process to negotiate the protocol.
    * The client sends an HTTP request with a special URI for handshaking and then the server responds with a newly issued socket id and socket options like transports. Then, the client determines whether to connect or not and which transport, event format, and so on to use. If all is well, the chosen client-side starts a connection and the corresponding server-side transport accepts it.
* **Event format** - A separated event serializer/deserializer per each socket.
    * The unit of data to be sent/received is an event object. The serializer is used to format a event object given by user to text or binary for transport and the decesrializer is used to parse a text or binary given by transport to event object for user. The default one is JSON so binary data is not supported but you can use it by replacing JSON with one supporting binary like [BSON](http://bsonspec.org/).
* **Transport** - A full-duplex message channel.
    * It's based on specific network technology and consists a pair of a set of rules to provide a consistent view of full duplex connection, one for the client and the other one for the server. The rules defines what open, close, message and is and workarounds to fix quirks. By choosing a network technology and defining rules, you can make and use your own transport as well.
* **Extension** - An additional feature built on protocol.
    * It's to make it easy to use useful implementation-specific features in other implementations by making it specification at the protocol level. Like transport, an extension includes a pair of a set of rules, one for the client and the other one for server. Generally, it is built on a view provided by transport so doesn't affect what the underlying transport is.

Let's see how the above blocks affect HTTP request and response in an example of exchanging an event. An explanation for extension is excluded because it is usually built on transport.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Java Server** <sup>1</sup>

```java
Server server = new DefaultServer();
server.socketAction(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
        socket.on("echo", new Action<String>() {
            @Override
            public void on(String data) {
                socket.send("echo", data);
            }
        });
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**JavaScript Client**

```javascript
vibe.open("http://localhost:8080/vibe", {transports: ["sse"]})
.on("open", function() {
    this.send("echo", "An echo message");
})
.on("echo", function(data) {
    console.log("on echo event:", data);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

* 1: In case of Java Server, mapping `Server` to a specific URI, `http://localhost:8080/vibe`, is done in integrating with a platform. For details, see [quick start guide](http://vibe-project.github.io/projects/vibe-java-server/3.0.0-Alpha1/#quick-start) and [working examples](https://github.com/vibe-project/vibe-examples).

First, in 3.0.0-Alpha1, handshaking is not yet implemented so the protocol negotiation is assumed already done by setting options by user. In other means, the client and the server have agreed to use `sse` transport and `JSON` event format in advance.

**HTTP request/response for the client to receive data from the server**

```
GET /vibe?id=d009d9f3-088f-4977-8ec0-99576f84cb4c&_=32fb5d&when=open&transport=sse&heartbeat=20000 HTTP/1.1
Cache-Control: no-cache
Accept: text/event-stream
Host: localhost:8080
Connection: keep-alive

HTTP/1.1 200 OK
Date: Tue, 07 Oct 2014 11:24:06 GMT
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
access-control-allow-origin: *
access-control-allow-credentials: true
Content-Type: text/event-stream; charset=utf-8
Transfer-Encoding: chunked
Server: Jetty(9.2.2.v20140723)

801
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                

47
data: {"id":"1","type":"echo","data":"An echo message","reply":false}

```

It's initiated by `vibe.open("http://localhost:8080/vibe", {transports: ["sse"]})`.

* `Accept: text/event-stream` from the request and `Content-Type: text/event-stream; charset=utf-8` from the response are required by Server-Sent Events, which is a underlying technology standard of `sse` transport. As Server-Sent Events is based on HTTP, HTTP is also underlying technology. 
* `801` and two whitespace lines are a special padding for old browser's Server-Sent Events implementation to be aware that the connection is opened, which is a kind of rule of server-side `sse` transport.
* After `socket.send("echo", data);` is executed, an event where type is `echo` and data is `data` is created and passed to the serializer of `JSON` event format. It creates a text, `{"id":"1","type":"echo","data":"An echo message","reply":false}`. Then `sse` transport formats that text by wrapping `data: ` and `\n\n` to conform the event-stream format from its specification and writes it to HTTP response. Likewise, the client's `sse` transport extracts message following its specification and gives it the deserializer of `JSON` event format. Then it parses the text to event object and fires `echo` event with `data` so finally `console.log("on echo event:", data);` is executed.

**HTTP request/response for the client to send data to the server**

```
POST /vibe?id=d009d9f3-088f-4977-8ec0-99576f84cb4c&_=6a5e3d HTTP/1.1
content-type: text/plain; charset=utf-8
Host: localhost:8080
Connection: keep-alive
Transfer-Encoding: chunked

44
data={"id":"0","type":"echo","data":"An echo message","reply":false}
0

HTTP/1.1 200 OK
Date: Tue, 07 Oct 2014 11:24:06 GMT
Cache-Control: no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
access-control-allow-origin: *
access-control-allow-credentials: true
Content-Length: 0
Server: Jetty(9.2.2.v20140723)


```

It's initiated by `this.send("echo", "An echo message");`.

How it is processed is the same with the above one. Because `sse` transport is only able to establish read-only connection, to simulate a full-duplex connection, a separate HTTP request with POST is used every time it sends an event to the server. This is also a kind of rule of client-side `sse` transport.
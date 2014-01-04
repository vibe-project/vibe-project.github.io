---
layout: documentation
title: Introduction
---

# Introduction

<p>The <strong>wes</strong> (Web Event Source) is an abstraction layer in the form of event source for various event-driven asynchronous web client and server that runs on the Java Virtual Machine allowing the end user to choose the desired framework. The <strong>wes</strong> fits well when you need to write web application running on as many framework as possible like protocol implementation or middleware.</p>

### To run wes application

Running wes application is to create `HttpExchange` and `WebSocket` from bridge integrating wes application with framework and dispatch them to wes application. Of course, how to install bridge and run final application vary for what your framework is.

See each bridge's document.

<ul class="inline-list">
<li><a href="{{ site.baseurl }}/documentation/0.1.0-SNAPSHOT/atmosphere2/">Atmosphere 2</a></li>
<li><a href="{{ site.baseurl }}/documentation/0.1.0-SNAPSHOT/vertx2/">Vert.x 2</a></li>
<li><a href="{{ site.baseurl }}/documentation/0.1.0-SNAPSHOT/play2/">Play 2</a></li>
</ul>

<hr />

### To write wes application

Writing wes application is to handle `HttpExchange` and `WebSocket` given by bridge, to call method and to register action. The followings are brief review of them. For the details, see [JavaDoc]({{ site.baseurl }}/documentation/0.1.0-SNAPSHOT/apidocs/).

##### `ServerHttpExchange`

This interface represents a server-side HTTP request-response exchange. In the following code snippet, XMLHttpRequest in browser sends a simple POST message and ServerHttpExchange in wes reads body and sends it back with content type of text/html.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Browser**

```javascript
var http = new XMLHttpRequest();
http.open("POST", "/http");
http.send("Hi there");
http.onload = function() {
    http.status; // 200
    http.statusText; // OK
    http.getResponseHeader('content-type'); // text/html
    http.response; // Hi there
};
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**wes**

```java
ServerHttpExchange http; // given by wes
http.bodyAction(new Action<Data>() {
    public void on(Data data) {
        http.setStatus(StatusCode.OK)
        .setResponseHeader("content-type", "text/html")
        .write(data.as(String.class))
        .close();
    }
})
.closeAction(new Action<Void>() {
    public void on(Void _) {
        // bye
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

##### `ServerWebSocket`

This interface represents a server-side WebSocket session. In the following code snippet, WebSocket in browser connects to server and sends a message to be echoed on open and closes a connection when it gets back. ServerWebSocket in wes receives message and sends it back.

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Browser**

```javascript
var ws = new WebSocket("ws://localhost:8080/ws");
ws.onopen = function() {
    ws.send("Hi, there");
};
ws.onmessage = function(event) {
    event.data; // Hi, there
    ws.close();
};
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**wes**

```java
ServerWebSocket ws; // given by wes
ws.messageAction(new Action<Data>() {
    public void on(Data data) {
        ws.send(data.as(String.class));
    }
})
.closeAction(new Action<Void>() {
    public void on(Void _) {
        // bye
    }
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

##### `Data`

This type is a wrapper used for wes to provide data. It's designed to handle raw data to transform any type you want such as text, binary and streaming. However, only text data, i.e. `data.as(String.class)` is supported now.
---
layout: documentation
title: Introduction
---

<p>The <strong>wes</strong> (Web Event Source) is an event-driven abstraction layer for various web application platforms that runs on the Java Virtual Machine.</p>

---

## Getting Started
### Installing

To install wes application is to bridge wes application and platform, that is to say, to produce `HttpExchange` and `WebSocket` from platform and pass them to wes application. wes is distributed via [Maven Central](http://search.maven.org/#search%7Cga%7C1%7Cwes) as jar and you need to bring required jars to your classpath by Maven, Grails or a framework-specific way. But of course how to run wes application varies for what your framework or platform is. 

See each platform's document.

<ul class="inline-list">
<li><a href="{{ site.baseurl }}/documentation/0.2.0/atmosphere2/">Atmosphere 2</a></li>
<li><a href="{{ site.baseurl }}/documentation/0.2.0/vertx2/">Vert.x 2</a></li>
<li><a href="{{ site.baseurl }}/documentation/0.2.0/play2/">Play 2</a></li>
<li><a href="{{ site.baseurl }}/documentation/0.2.0/servlet3/">Servlet 3</a></li>
<li><a href="{{ site.baseurl }}/documentation/0.2.0/jwa1/">Java WebSocket API 1</a></li>
</ul>

---

## API
A wes application is a collection of actions consuming `HttpExchange` and `WebSocket` given by bridge.

```java
Action<ServerHttpExchange> httpAction = new Action<ServerHttpExchange>() {
	@Override
	public void on(ServerHttpExchange http) {
    	// Your logic here
	}
};
Action<ServerWebSocket> websocketAction = new Action<ServerWebSocket>() {
    @Override
    public void on(ServerWebSocket ws) {
    	// Your logic here
    }
};
```

### [ServerHttpExchange]({{ site.baseurl }}/documentation/0.2.0/apidocs/io/github/flowersinthesand/wes/ServerHttpExchange.html)
ServerHttpExchange represents a server-side HTTP request-response exchange and is assumed only text data are read and written.

#### Request properties
These are read only.

<div class="row">
    <div class="large-4 columns">
        <h5>URI</h5>
        <p>A request URI used to connect. To work with URI parts, use <code>java.net.URI</code> or something like that.</p>
{% capture panel %}
```java
URI.create(http.uri()).getQuery();
```
{% endcapture %}{{ panel | markdownify }}
	</div>
	<div class="large-4 columns">
	    <h5>Method</h5>
	    <p>A name of the request method.</p>
{% capture panel %}
```java
switch (http.method()) {
    case "GET":
    case "POST":
        // GET or POST
        break;
}
```
{% endcapture %}{{ panel | markdownify }}
    </div>
	<div class="large-4 columns">
	    <h5>Headers</h5>
	    <p>Request headers.</p>
{% capture panel %}
```java
for (String name : http.requestHeaderNames()) {
    String value = http.requestHeader(name);
}
```
{% endcapture %}{{ panel | markdownify }}
    </div>
</div>

#### Reading body
`bodyAction` attaches a body event handler to be called with [Data](http://localhost:4000/documentation/0.2.0/apidocs/io/github/flowersinthesand/wes/Data.html) wrapping the request body. Note that because only String type is supported as Data now, if body is quite big it will drain memory in an instant.

```java
http.bodyAction(new Action<Data>() {
    @Override
    public void on(Data data) {
        String body = data.as(String.class);
        // Your logic here
    }
});
```

#### Response properties
These are write only.

<div class="row">
    <div class="large-6 columns">
        <h5>Status</h5>
        <p>A HTTP Status code for response.</p>
{% capture panel %}
```java
http.setStatus(HttpStatus.NOT_IMPLEMENTED);
```
{% endcapture %}{{ panel | markdownify }}
	</div>
	<div class="large-6 columns">
	    <h5>Headers</h5>
	    <p>Response headers.</p>
{% capture panel %}
```java
http.setResponseHeader("content-type", "text/javascript; charset=utf-8");
```
{% endcapture %}{{ panel | markdownify }}
    </div>
</div>

#### Writing chunk
`write` sends a chunk to the response body.

```java
http.write("chunk");
```

#### Ending response
`close` ends the response. Each exchange must be finished with this method when done.

```java
http.close();
```

On response close, close event handlers added via `closeAction` are executed.

```java
http.closeAction(new VoidAction() {
	@Override
	public void on() {
        // Your logic here
	}
});
```

### [ServerWebSocket]({{ site.baseurl }}/documentation/0.2.0/apidocs/io/github/flowersinthesand/wes/ServerWebSocket.html)
ServerWebSocket represents a server-side WebSocket session and is assumed only text messages are exchanged now.

#### Properties
These are read only.

##### URI
A request URI used to connect. To work with URI parts, use `java.net.URI` or something like that.

```java
URI.create(ws.uri()).getQuery();
```

#### Receiving message
Message event handlers attached via `messageAction` are called with [Data](http://localhost:4000/documentation/0.2.0/apidocs/io/github/flowersinthesand/wes/Data.html) wrapping the WebSocket message. Note that because only String type is supported as Data now, if body is quite big it will drain memory in an instant.

```java
ws.messageAction(new Action<Data>() {
	@Override
	public void on(Data data) {
		String message = data.as(String.class);
        // Your logic here
	}
});
```

#### Sending message
`send` sends a text message through the connection.

```java
ws.send("message");
```

#### Closing connection
`close` ends the connection.

```java
ws.close();
```

On connection close, close event handlers added via `closeAction` are executed.

```java
ws.closeAction(new VoidAction() {
	@Override
	public void on() {
        // Your logic here
	}
});
```

---

## Example
One example is worth a thousand words.

### Portal for Java
A server implementation of <a href="http://flowersinthesand.github.io/portal">Portal</a> written in Java, JavaScript library for real-time web application development, is a server-side wes application. See how it deals with HttpExchange and WebSocket to implement Portal server, [DefaultServer.java](https://github.com/flowersinthesand/portal-java/blob/master/portal/src/main/java/io/github/flowersinthesand/portal/DefaultServer.java). 

---
layout: post
title: "Vibe 3.0.0-Beta1 released"
author: flowersinthesand
---

I'm pleased to announce that the first beta of Vibe as known as Atmosphere 3 is now available after an intense alpha phase focusing on  refactoring. During the beta phase, we will make sure all functionalities of Atmosphere 2 are supported.

Vibe has started since I shared experience on creating Yet Another Atmosphere as an effort to make Atmosphere a better project. After long discussion with Atmosphere's community and lead, we decided to start from scratch having better API and extension points in mind and to extract the protocol as a separate project to make it easy to use Vibe with any language.

Vibe is flexible, concise and simple. For working example, please refer to the quick start guide of [Java Server](/projects/vibe-java-server/3.0.0-Beta1/#quick-start) and [JavaScript Client](/projects/vibe-javascript-client/3.0.0-Beta1/#quick-start).

<div class="row">
<div class="large-6 columns">
{% capture panel %}
**Java Server**

```java
final Server server = new DefaultServer();
server.socketAction(new Action<ServerSocket>() {
    @Override
    public void on(final ServerSocket socket) {
        socket.on("echo", new Action<String>() {
            @Override
            public void on(String data) {
                socket.send("echo", data);
            }
        });
        socket.on("chat", new Action<String>() {
            @Override
            public void on(String data) {
                server.all().send("chat", data);
            }
        });
    }
});
// And server needs to be bridged to a platform
```
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-6 columns">
{% capture panel %}
**JavaScript Client**

```javascript
var socket = vibe.open("http://localhost:8080/vibe");
socket.on("open", function() {
    socket.send("echo", "An echo message");
    socket.send("chat", "A chat message");
});
socket.on("echo", function(data) {
    console.log("on echo event:", data);
});
socket.on("chat", function(data) {
    console.log("on chat event:", data);
});
```
{% endcapture %}{{ panel | markdownify }}
</div>
</div>

Here is a summary of key features in Vibe overall:

* **Based on protocol** - Real-time web will be everywhere soon. You will need more features to write a just simple real-time webapp. The separated protocol is the baseline to build such features.
* **Polyglot** - It's not just for Java and JavaScript but for any language. With the reference implementation and test suite, you can easily not only implement the protocol in any language but also verify implementation.
* **Standards** - As component of the protocol, RFC and W3C standards are mainly adopted. Just use existing implementation as desired. You don't need to reinvent the wheel.
* **Transport layer** - Any transport technology besides WebSocket and HTTP can be used to bridge client and server as long as it meets requirements of Vibe transport. Along that way, you can control sockets backed by hetero transports through one server.
* **Event not message** - The unit of data to be sent and received from the semantic point of view is an event object associated with a customizable type, which is easy to compose a controller from MVC.
* **Remote Procedure Call** - It also allows to attach callbacks in sending event and to call those callbacks with the result of the event processing in receiving event. It's useful where request-response model is more suited than notification model.
* **Server and Socket** - All the interfaces you need to know to handle server are Server producing and managing socket and Socket representing the remote client. Select some sockets from server and do something with them like manipulating DOM using jQuery.
* **Dependency injection friendly** - A use case with DI framework is definite. Define a server as a singleton and inject it wherever you want to handle socket just like when using EntityManager from JPA.
* **Tag** - Tag gives you a way to handle a specific entity in the real world as an identifier of a group of sockets. For example, you can use it to process authentication or to model a user logged in using multiple devices or subscribers to a topic.
* **Scalability** - A publish-subscribe messaging system is enough to scale your application. Because servers don't share any data, you can scale application horizontally with ease as well as don't need to prepare for data grid system or NoSQL solution.
* **Run on any platform** - Because server is built on a simple abstraction layer for various application platforms running on JVM, you can run your application on any supported platform seamlessly. Now Atmosphere, Grizzly, Java WebSocket API, Netty, Play, Servlet and Vert.x are supported.
* **Lightweight** - JavaScript client takes 5.09KB minified and gzipped. Compare it to others: Socket.IO 1.3.4 - 19.96KB, Sockjs 0.3.4 - 10.09KB and Autobahn latest - 37.17KB.
* **Wide browser support** - Wherever jQuery 1 is available, you can write a real-time webapp. A multitude of browsers are supported according to jQuery 1's browser support policy embracing IE 6.
* **Proved flexibility** - It is flexible enough to integrate with any technologies or patterns for enterprise application with ease, which has been proved by a lot of examples.
* **Open source** - All projects are distributed under the Apache Software License 2.0 which is one of the most flexible open source licenses.

And here is the roadmap of Vibe:

* **Offline application** - It is necessary to handle sockets whose connection is disconnected for a little while. This feature will provide events you can utilize to deal with such case properly by making socket to be backed by multiple transports not just one. [vibe-protocol#61](https://github.com/vibe-project/vibe-protocol/issues/61)
* **Binary support** - Vibe transport can carry binary data but how to make use of it for event object is not yet determined. With this feature, you will be able to use an object containing binary data as event's data and exchange it without binary-to-text conversion.
* **Complete Play support** - The current implementation written in Play Java API misses some functionalities. To fix that issue, new implementation will be written in Play Scala API and come with helpers making it easy to bridge application and Play as well. [vibe-java-platform#4](https://github.com/vibe-project/vibe-java-platform/issues/4)
* **Migration help for Atmosphere 2 users** - A comprehensive guide to migrate application written in Atmosphere 2 or frameworks integrating Atmosphere 2 to Vibe will be provided. Also contribution will be made to those frameworks for easy migration if necessary.
* **More example** - A reference application to illustrate how Vibe can be used to build modern web application and more archetype applications to demonstrate how Vibe can be integrated with other technologies and frameworks will be provided.

For full documentation and information on Vibe, please visit the [website](http://vibe-project.github.io).

Thanks for all the feedback from early adopters. The feedback has been and will be very important to us, so please feel free to get in touch with us, [Atmosphere Groups](http://groups.google.com/group/atmosphere-framework), if you have any question or feedback.

Last but not least, the creator of Vibe offers professional support for projects Vibe team maintained through [Async-IO](http://async-io.org/), the official sponsor of Vibe. You can mitigate risk from introducing Vibe into your project and bring out custom features you've wanted by priority as well.
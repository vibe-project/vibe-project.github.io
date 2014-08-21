---
layout: post
title: "Migration from Portal"
author: flowersinthesand
---

The first alpha version of Vibe is at the API level not much different from a set of [Portal](http://flowersinthesand.github.io/portal/) 1.1+, [Portal for Java](http://flowersinthesand.github.io/portal-java/) 0.8+ and [wes](http://flowersinthesand.github.io/wes/). If you've used them, migration is not a big deal. But if you've created and used your own portal server and client, you need to modify your implementation a little bit. Take a look at reference implementation from [Vibe Protocol](http://atmosphere.github.io/vibe/projects/vibe-protocol/).

However if you are hesitating migration, see the following advantages of Vibe over Portal that will help you make decision.

* For writing real-time web application itself.
    * While Portal has focused on ease to implement server first as it has started as a jQuery plugin for HTTP streaming and rejected any idea which could make protocol complex no matter how useful it would be, Vibe focuses on ease to write real-time web application itself more than anything else so is willing to accept any ideas if it's worth.
* Based on own protocol.
    * Portal has under the implicit protocol provided only two implementations: JavaScript client and Java server, but Vibe will provide various implementations including the previous ones based on its own explicit protocol built over HTTP and WebSocket so that it would be certainly easy to use Vibe in other language.
* Easy to write and verify implementation.
    * Portal's protocol is clearly separated to the very protocol part that have to be implemented and the extension part that can be implemented and on top of that Vibe provides reference implementation and test suite to help write and verify your implementation.
* Merged with Atmosphere.
    *  Vibe is also a result from a collaboration of Atmosphere and Portal. Useful features and detailed experiences of Atmosphere like performance tuning, binary handling, workaround for I/O platform's quirks and so on will be available in Vibe.
* Leaded by Donghwan Kim and Jeanfrancois Arcand.
    * Jeanfrancois Arcand, an author of Grizzly, Asynchronous HTTP Client and Atmosphere, also leads Vibe as a owner. His rich experience in Java enterprise application and open source project will doubtless help drive Vibe to the way we all desire.
* On the superior community.
    * As Atmosphere 3, Vibe will inherit the good parts from Atmosphere. One of them is the superior community. Atmosphere has been developed and maintained by warm participation of the community. Now Vibe will be.
* Commercial support.
    * Now you can safely mitigate the risk to use a work from my one man show. Asnyc-IO, the company behind the Atmosphere, provides commercial support for Vibe like subscription and custom development as well.

---

## Portal
[Portal](http://flowersinthesand.github.io/portal/) is heavily refactored and separated into [Vibe JavaScript Client](http://atmosphere.github.io/vibe/projects/vibe-javascript-client/) providing vibe.js that is successor of portal.js and [Vibe Protocol](http://atmosphere.github.io/vibe/projects/vibe-protocol/) providing reference implementation and test suite helping implement the protocol.

### Installation
All about renaming.

* JavasScript files are renamed to `vibe.js` and `vibe.min.js`.
* Node.js module on npm is renamed to `vibe-client`.
* Bower package is renamed to `vibe-client`.

### API
All deprecated or unuseful options and methods are removed or modified.

* `portal` module is renamed to `vibe`.
* `portal.find` is removed.
    * It has brought confusion when loaded by module loaders.

#### Socket options
* `lastEventId` is removed.
    * It is only valid when the server assures the message-sending order which is far from ideal in a performance.
* `prepare` is removed.
    * It has brought inconsistency when connection sharing is enabled.
* `idGenerator` is removed.
    * A form of socket id is fixed to UUID.
* `urlBuilder` and `params` are removed.
    * Attach them as query string in advance.
* `inbound` and `outbound` are removed.
    * Modifying final event object is not allowed.
* `notifyAbort` is removed.
    * It's always enabled to maintain reliable HTTP connection.
* `credentials` is removed.
    * It's always enabled for convenience of use of cross-origin connection.
* `xdrURL` has no default implementation.
    * No more support for `JSESSIONID` or `PHPSESSID`. Do it yourself.
* `streamParser` is removed.
    * The stream format is fixed to the event stream format from Server-Sent Events.

#### Socket
* `option(key:string)` is removed.
    * No reason to retrieve option.
* `data(key: string, value?: any)` is removed.
    * Create a map on open event and destory it on close event.
* `on(handlers: {[event: string]: Function;})` is removed.
    * Use `on(event: string, handler: Function)` signature.
* `one(event: string, handler: Function)` is renamed to `once`.
    * For better readability.
* `send(event, data, done: string, fail: string)` is removed.
    * It was created to make callbacks work with connection sharing. Now connection sharing will be rewritten so that the other signature allowing to pass function will be available.
* Shortcuts to add event handler whose type is `(handler: Function)`, i.e `connecting`, `open`, `message`, `close` and `waiting`, are removed.
    * For potential usage.
* It is not allowed to send event when socket is not opened.
    * Do that on open event.
* In dispatching message event, the second argument, `reply`, is changed from a function into an object to control reply.
    * Its type is `{resolve: (data?: any) => void; reject: (data?: any) => void}`, hence the previous `reply(val)` equals to `reply.resolve(val)`.
* Sending and receiving binary event is not supported.
    * Use a plain WebSocket.

---

## Portal for Java
[Portal for Java](http://flowersinthesand.github.io/portal-java/) and [wes](http://flowersinthesand.github.io/wes/) are renamed to [Vibe Java Server](http://atmosphere.github.io/vibe/projects/vibe-java-server/) and [Vibe Java Server Platform](http://atmosphere.github.io/vibe/projects/vibe-java-server-platform/) respectively with many bug fixes and enhancements.

### Installation
All about renaming.

* Group id is changed to `org.atmosphere`.
* `portal` artifact is renamed to `vibe-server`.
* `portal-testsuite` artifact is replaced and removed by the protocol test suite in [Vibe Protocol](http://atmosphere.github.io/vibe/projects/vibe-protocol/).
* Each wes bridge artifact, `wes-${platform}`, is renamed to `vibe-server-platform-${platform}`.

### API
All about renaming.

* `io.github.flowersinthesand.portal` package is renamed to `org.atmosphere.vibe.server`.
* `io.github.flowersinthesand.wes` package is renamed to `org.atmosphere.vibe.server.platform`.
* Each wes bridge's package is changed to contain platform's version at the end i.e. from `io.github.flowersinthesand.wes.servlet` to `org.atmosphere.vibe.server.platform.servlet3`.
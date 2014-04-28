---
layout: post
title: "Migration from Portal"
author: flowersinthesand
categories: [article]
---

This guide is for migrating a Portal application to React.

The first alpha of React is heavily based on [Portal](flowersinthesand.github.io/portal/), [Portal for Java](flowersinthesand.github.io/portal-java/) and [wes](flowersinthesand.github.io/wes/). However, there is a very important difference in philosophy between React and Portal. That is while Portal focuses on easy to implement server-side so doesn't accept contract which could make protocol complex no matter how useful it might be, React focuses on easy to write application itself so accept those contracts abandoned in Portal. 

Therefore if you've used Portal and Portal for Java, you can easily migrate your application and enjoy enhancements but if you've used your own implementation, you need to work to meet the protocol. See the protocol section.

## Portal
`portal.js` is renamed to `react.js` and moved in React JavaScript Client project. Any deprecated or unuseful things are removed. As a result, its size has been decreased from 6.88KB to 5.89KB minified and gzipped.

### `portal`
* `portal` is renamed to `react`.

### `portal` method
* `find` is removed.
    * Make a socket variable.
    * It has brought confusion in Node.js and in browser.

### `socket` option
* `lastEventId` is removed.
    * It was only valid when the server assures the message-sending order which is far from ideal in a performance view.
* `prepare` is removed.
    * It has brought inconsistency when connection sharing is enabled.
* `idGenerator` is removed.
    * A form of socket id is fixed to UUID.
* `urlBuilder` and `params` are removed.
    * No reason to support.
* `inbound` and `outbound` option are removed.
    * Modifying final event object is not allowed. Use developer tools provided by browser for debugging.
* `notifyAbort` is removed.
    * It's always enabled to maintain reliable HTTP connection.
* `credentials` is removed.
    * It's always enabled for convenience of use of cross-origin connection.
* `xdrURL` is modified.
    * It does nothing by default now that is to say no more support for `JSESSIONID` or `PHPSESSID`. Do it yourself.
* `streamParser` is removed.
    * The stream format is fixed to the event stream format from Server-Sent Events.

### `socket` method
* `option` is removed.
    * No reason to retrieve option.
* `data` is removed.
    * It is not used internally now.
* `on(handlers)` is removed.
    * Use `on(event, handler)` signature.
* `one` is renamed to `once`.
    * For better readability
* `send` is not allowed when socket is not opened.
    * Considering life cycle, it's unnecessary.
* `send(event, data, done:string, fail:string)` is deprecated.
    * A string done and fail were needed to work seamlessly with connection sharing. But it will be rewritten and that signature will be removed accordingly.
* Shortcut methods to add event handler, i.e `connecting`, `open`, `message`, `close` and `waiting` are removed.
    * Trivial.

### `socket` event
* In dispatching message event, the second argument, `reply`, is not a function but an object.
    * A reply has two methods as like in server now: `resolve` and `reject`. For the same behavior, call `reply.resolve`
* Binary type data is not supported
    * Use a plain WebSocket. Actually it hasn't been tested at all. 

## Portal for Java
TODO

## wes
TODO

## Protocol
You might implement the portal protocol partially as needed and want to do that again this time. Fortunately it may work in this time because in the first alpha there is only one necessary change. Nevertheless, various features will be added following community's feedback so watch reference implementation from React Protocol project.

* In `POST` request, a socket id should be passed as query string under the name of `id` and `socket` property in an event object in `POST` request body should be removed. *
* If a user aborts the socket based on long polling transport during idle time that is between poll, the next HTTP exchange should be aborted. Use a flag meaning being aborted, mark it on close and when the new exchange is supplied, if the flag is set, end the exchange.
* A server should use an auto-increment id when setting event id instead of UUID to avoid `414 Request-URI Too Long` in long polling transport.
* A server don't need to handle `Access-Control-Request-Headers` header.
* A client should be able to handle resolved and rejected callback in receiving event.
* A server should be able to accept resolved and rejected callback in sending event.

\* Necessary.
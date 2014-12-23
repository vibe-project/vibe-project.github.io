---
layout: post
title: "Vibe Java Platform 3.0.0-Alpha7 released"
author: flowersinthesand
---

Focusing on reorganization of module and package structure for further better extension, [Vibe Java Platform 3.0.0-Alpha7](/projects/vibe-java-platform/3.0.0-Alpha7/) is released and accordingly [Vibe Java Server 3.0.0-Alpha8](/projects/vibe-java-server/3.0.0-Alpha8/) is released as well.

* Module name and package name are reorganized. [vibe-java-platform#35](https://github.com/vibe-project/vibe-java-platform/issues/35)
    * `vibe-platform-server` module decomposed into `vibe-platform-action`, `vibe-platform-http` and `vibe-platform-ws`.
    * `o.a.v.p.server` package decomposed into `o.a.v.p.action`, `o.a.v.p.http` and `o.a.v.p.ws`.
    * `vibe-platform-server-atmosphere2` module renamed into `vibe-platform-bridge-atmosphere2`. The same for all the other bridges.
    * `o.a.v.p.server.atmosphere2` package renamed into `o.a.v.p.bridge.atmosphere2`. The same for all the other bridges.
* Now `ServerWebSocket` returns `void` on `close` method. [vibe-java-platform#38](https://github.com/vibe-project/vibe-java-platform/issues/38)

This release will probably be a last alpha of Vibe Java Platform. If you have any feedback, please [let us know](http://groups.google.com/group/atmosphere-framework) and we really appreciate them.
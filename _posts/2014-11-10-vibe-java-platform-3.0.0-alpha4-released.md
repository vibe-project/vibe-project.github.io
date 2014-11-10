---
layout: post
title: "Vibe Java Platform 3.0.0-Alpha4 released"
author: flowersinthesand
---

It is my pleasure to announce Vibe Java Platform 3.0.0-Alpha4 and Vibe Java Server 3.0.0-Alpha5. The main focus of this release is supporting Netty 4 platform and rewriting bridge helpers.

* Netty 4 is now supported. Try out the [the working example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/netty4). [vibe-java-platform#3](https://github.com/vibe-project/vibe-java-platform/issues/3)
* `Server`'s `websocketAction` is renamed to `wsAction` for consistency. [vibe-java-server#59](https://github.com/vibe-project/vibe-java-server/issues/59)
* Every bridge helper like `AtmosphereBridge` is rewritten to match with general platform usage well. [vibe-java-platform#18](https://github.com/vibe-project/vibe-java-platform/issues/18) 

In next phase, we will provide a bridge for [JAX-RS 2](https://github.com/vibe-project/vibe-java-platform/issues/20) (Jersey) which is one I forgot last time. Then, really, all platforms officially maintained by Atmosphere team will be available in Vibe as well. If you have any feedback or suggestions, please [let us know](http://groups.google.com/group/atmosphere-framework) and we really appreciate them.
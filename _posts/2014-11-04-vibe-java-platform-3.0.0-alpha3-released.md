---
layout: post
title: "Vibe Java Platform 3.0.0-Alpha3 released"
author: flowersinthesand
---

I'm happy to to release Vibe Java Platform 3.0.0-Alpha3 and accordingly Vibe Java Server 3.0.0-Alpha4. The main focus of this release is completing the life cycle of `ServerHttpExchange` through [explicit read method](https://github.com/vibe-project/vibe-java-platform/issues/12), [reading request by chunk](https://github.com/vibe-project/vibe-java-platform/issues/14) and [handling binary](https://github.com/vibe-project/vibe-java-platform/issues/1). 

* Use `String` and `ByteBuffer` instead of `Data`. [vibe-java-platform#1](https://github.com/vibe-project/vibe-java-platform/issues/1)
* Explicit `read` method to read request. [vibe-java-platform#12](https://github.com/vibe-project/vibe-java-platform/issues/12)
* `chunkAction` and `endAction` as an alternative of `bodyAction`. [vibe-java-platform#14](https://github.com/vibe-project/vibe-java-platform/issues/14)
* Jetty 9.1/9.2 and Glassfish 4.0 are now detected as Servlet 3.1 implementation. [vibe-java-platform#16](https://github.com/vibe-project/vibe-java-platform/issues/16)
* Vert.x reads request according to the correct charset. [vibe-java-platform#17](https://github.com/vibe-project/vibe-java-platform/issues/17)

In next phase, we will provide a bridge for Netty 4 based on this work. Then, all platforms officially maintained by Atmosphere team will be available in Vibe as well. If you have any feedback or suggestions, please [let us know](http://groups.google.com/group/atmosphere-framework) and we really appreciate them.
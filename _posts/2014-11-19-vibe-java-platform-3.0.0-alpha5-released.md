---
layout: post
title: "Vibe Java Platform 3.0.0-Alpha5 released"
author: flowersinthesand
---

I'm happy to announce Vibe Java Platform 3.0.0-Alpha5. The main focus of this release is supporting JAX-RS 2 platform and providing extended ways and improvements to handle HTTP message body.

* JAX-RS 2 platform is now supported as a platform on platform. Try out [the working example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform-on-platform/jaxrs2-atmosphere2).
* Blocking reading operation of Servlet 3.0 and Play 2 now emulates non-blocking mode by spawning a thread. [vibe-java-platform#25](https://github.com/vibe-project/vibe-java-platform/issues/25)
* It's allowed to force reading HTTP request body as text or binary. [vibe-java-platform#24](https://github.com/vibe-project/vibe-java-platform/issues/24)
* When charset is not given to HTTP exchange, ISO-8859-1 is used by default. [vibe-java-platform#22](https://github.com/vibe-project/vibe-java-platform/issues/22)

In next phase, we will provide a bridge for [Grizzly 2](https://github.com/vibe-project/vibe-java-platform/issues/29). Then, you will be able to run Vibe on most Java platform of the upper rank of [Web Framework Benchmarks by TechEmpower](http://www.techempower.com/benchmarks/#section=data-r9&hw=peak&test=json&l=3k). If you have any feedback or suggestions, please [let us know](http://groups.google.com/group/atmosphere-framework) and we really appreciate them as always.
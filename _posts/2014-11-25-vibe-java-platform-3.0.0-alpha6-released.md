---
layout: post
title: "Vibe Java Platform 3.0.0-Alpha6 released"
author: flowersinthesand
---

I'm happy to announce Vibe Java Platform 3.0.0-Alpha6. The main focus of this release is supporting Grizzly 2 platform.

* Grizzly 2 platform is now supported. Try out [the working example](https://github.com/vibe-project/vibe-examples/tree/master/archetype/vibe-java-server/platform/grizzly2). [vibe-java-platform#29](https://github.com/vibe-project/vibe-java-platform/issues/29)
* `VibeRequestHandler` and `VibeWebSocketHandler` are added as transformer. [vibe-java-platform#31](https://github.com/vibe-project/vibe-java-platform/issues/31)
* Transformers like `VibeServlet` and `VibeServerEndPoint` are changed into abstract classes. [vibe-java-platform#32](https://github.com/vibe-project/vibe-java-platform/issues/32)
* `netty-all` dependency is changed to `netty-codec-http`. [vibe-java-platform#30](https://github.com/vibe-project/vibe-java-platform/issues/30)

In next phase, we will focus on [Reorganize transport](https://github.com/vibe-project/vibe-protocol/issues/38) to process further transport related features. If you have any feedback or suggestions, please [let us know](http://groups.google.com/group/atmosphere-framework) and we appreciate them as always.
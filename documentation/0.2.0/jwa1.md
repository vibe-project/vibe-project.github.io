---
layout: home
title: Java WebSocket API 1
---

# Java WebSocket API 1
This bridge integrates wes application with the [Java WebSocket API 1](http://docs.oracle.com/javaee/7/tutorial/doc/websocket.htm#GKJIQ5) (JWA) from Java EE 7. Because JWA is a just specification, server implementing JWA 1 should work with this module but in the real world some servers are not. To help this situation, a subproject, [wes-jwa1-test](https://github.com/flowersinthesand/wes-jwa1-test), is created which tests if a given server is suitable for this module.

See [working example](https://github.com/flowersinthesand/portal-java-examples/tree/master/server/platform/jee7).

---

Server-side JWA is a traditional Java web application, a war project in Maven. Add the following dependency to your pom.xml or include it on your classpath manually.

```xml
<dependency>
    <groupId>io.github.flowersinthesand</groupId>
    <artifactId>wes-jwa1</artifactId>
    <version>0.2.0</version>
</dependency>
```

---

## Bootstrap

To run wes application using JWA, you need to write `ServerApplicationConfig` to be scanned by server container, create `JwaBridge` and return its `ServerEndpointConfig` in `getEndpointConfigs` method.

In case of embedded server, it may not scan instances of `ServerApplicationConfig` and you may have to follow their server-specific alternatives. 

```java
package io.github.flowersinthesand.portal.testsuite;

import io.github.flowersinthesand.portal.DefaultServer;
import io.github.flowersinthesand.portal.Server;
import io.github.flowersinthesand.portal.Socket;
import io.github.flowersinthesand.wes.Action;
import io.github.flowersinthesand.wes.VoidAction;
import io.github.flowersinthesand.wes.jwa.JwaBridge;

import java.util.Collections;
import java.util.Set;

import javax.websocket.Endpoint;
import javax.websocket.server.ServerApplicationConfig;
import javax.websocket.server.ServerEndpointConfig;

public class Bootstrap implements ServerApplicationConfig {

	@Override
	public Set<ServerEndpointConfig> getEndpointConfigs( Set<Class<? extends Endpoint>> classes) {
		// Server is wes application
		Server server = new DefaultServer();
		// This is about Portal
		server.socketAction(new Action<Socket>() {
			@Override
			public void on(final Socket socket) {
				// Your logic here
			}
		});
		
		// Deliver WebSocket produced by JWA to the portal server
		return Collections.singleton(new JwaBridge("/test").websocketAction(server.websocketAction()).config());
	}

	@Override
	public Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> scanned) {
		return Collections.emptySet();
	}

}
```

### In conjunction with Servlet 3.

Without the help of dependency injection, you have to declare wes application as static. See [Bootstrap.java](https://github.com/flowersinthesand/portal-java-examples/blob/master/server/platform/jee7/src/main/java/io/github/flowersinthesand/portal/testsuite/Bootstrap.java) from working example.

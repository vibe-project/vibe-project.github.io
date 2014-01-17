---
layout: home
title: Atmosphere 2
---

# Atmosphere 2
This bridge integrates wes application with the [Atmosphere 2](https://github.com/atmosphere/atmosphere/) which makes the application run on most servlet containers that support the Servlet Specification 2.3. 

That being said, this module requires Servlet 3.1 containers. If you want to use Atmosphere 2 with containers implementing Servlet 2.3, check Atmosphere supports that container and open a feature request.

See [working example](https://github.com/flowersinthesand/portal-java-examples/tree/master/server/platform/atmosphere2).

---

With Atmosphere, you can write a traditional Java web application, a war project in Maven. Add the following dependency to your pom.xml or include it on your classpath manually.

```xml
<dependency>
    <groupId>io.github.flowersinthesand</groupId>
    <artifactId>wes-atmosphere2</artifactId>
    <version>0.2.0</version>
</dependency>
```

---

## Bootstrap

To run wes application in Servlet environment with Atmosphere, you need to prepare initialized `ServletContext` and pass it to `AtmosphereBridge`.

```java
package io.github.flowersinthesand.portal.testsuite;

import io.github.flowersinthesand.portal.DefaultServer;
import io.github.flowersinthesand.portal.Server;
import io.github.flowersinthesand.portal.Socket;
import io.github.flowersinthesand.wes.Action;
import io.github.flowersinthesand.wes.atmosphere.AtmosphereBridge;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;
import javax.servlet.annotation.WebListener;

@WebListener
public class Bootstrap implements ServletContextListener {
	
	@Override
	public void contextInitialized(ServletContextEvent event) {
		// Server is wes application
		Server server = new DefaultServer();
		// This is about Portal
		server.socketAction(new Action<Socket>() {
			@Override
			public void on(final Socket socket) {
				// Your logic here
			}
		});
		
		// Deliver HttpExchange and WebSocket produced by Atmosphere to the server
		new AtmosphereBridge(event.getServletContext(), "/test").httpAction(server.httpAction()).websocketAction(server.websocketAction());
	}
	
	@Override
	public void contextDestroyed(ServletContextEvent sce) {}

}
```
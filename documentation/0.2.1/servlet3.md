---
layout: home
title: Servlet 3
---

# Servlet 3
This bridge integrates wes application with the [Java Servlet 3.0](http://docs.oracle.com/javaee/6/tutorial/doc/bnafd.html) from Java EE 6 and [Java Servlet 3.1](http://docs.oracle.com/javaee/7/tutorial/doc/servlets.htm) from Java EE 7. There is no WebSocket part in Servlet API and it exists as a separate specification. To use WebSocket, see [Java WebSocket API bridge]({{ site.baseurl }}/documentation/0.2.1/jwa1/). Because Servlet is a just specification, server implementing Servlet 3 should work with this module but in the real world some servers are not. To help this situation, a subproject, [wes-servlet3-test](https://github.com/flowersinthesand/wes-servlet3-test), is created which tests if a given server is suitable for this module.

As a result of testing the following servers are confirmed to work. But non-listed servers are likely to work as well.

<ul class="inline-list">
	<li>Jetty 9</li>
	<li>Tomcat 8</li>
</ul>

See [working example](https://github.com/flowersinthesand/portal-java-examples/tree/master/server/platform/jee7).

---

Servlet is a traditional Java web application, a war project in Maven. Add the following dependency to your pom.xml or include it on your classpath manually.

```xml
<dependency>
    <groupId>io.github.flowersinthesand</groupId>
    <artifactId>wes-servlet3</artifactId>
    <version>0.2.1</version>
</dependency>
```

---

## Bootstrap

To run wes application in Servlet environment, you need to prepare initialized `ServletContext` and pass it to `ServletBridge`.

```java
package io.github.flowersinthesand.portal.testsuite;

import io.github.flowersinthesand.portal.DefaultServer;
import io.github.flowersinthesand.portal.Server;
import io.github.flowersinthesand.portal.Socket;
import io.github.flowersinthesand.wes.Action;
import io.github.flowersinthesand.wes.servlet.ServletBridge;

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
		
		// Deliver HttpExchange produced by Servlet to the server
		new ServletBridge(event.getServletContext(), "/test").httpAction(server.httpAction());
	}

	@Override
	public void contextDestroyed(ServletContextEvent sce) {}
	
}
```

### In conjunction with Java WebSocket API 1.

Without the help of dependency injection, you have to declare wes application as static. See [Bootstrap.java](https://github.com/flowersinthesand/portal-java-examples/blob/master/server/platform/jee7/src/main/java/io/github/flowersinthesand/portal/testsuite/Bootstrap.java) from working example.

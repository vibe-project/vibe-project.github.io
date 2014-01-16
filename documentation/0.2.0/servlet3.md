---
layout: home
title: Servlet 3
---

# Servlet 3
This bridge integrates wes application with the [Java Servlet 3.1](http://docs.oracle.com/javaee/7/tutorial/doc/servlets.htm#BNAFD) from Java EE 7. Please open an issue if you want Servlet 3.0 support.

There is no WebSocket part in Servlet API and WebSocket API exists as a separate specification. To use both Servlet and WebSocket, see [Java WebSocket API bridge]({{ site.baseurl }}/documentation/0.2.0/jwa1/).

---

Servlet is a traditional Java web application, a war project in Maven. Add the following dependency to your pom.xml or include it on your classpath manually.

```xml
<dependency>
    <groupId>io.github.flowersinthesand</groupId>
    <artifactId>wes-servlet3</artifactId>
    <version>0.2.0</version>
</dependency>
```

---

## Bootstrap

To run wes application in Servlet environment, you need to prepare initialized `ServletContext` and pass it to `ServletBridge`.

```java
@WebListener
public class Bootstrap implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Assume Server is wes application
        io.github.flowersinthesand.portal.Server server = new DefaultServer();
        
        // Prepare ServletContext
        ServletContext servletContext = event.getServletContext();
        
        // Bridge wes application and Servlet
        new ServletBridge(servletContext, "/portal").httpAction(server.httpAction());
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {}

}
```
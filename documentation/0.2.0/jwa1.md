---
layout: home
title: Java WebSocket API 1
---

# Java WebSocket API 1
This bridge integrates wes application with the [Java WebSocket API 1](http://docs.oracle.com/javaee/7/tutorial/doc/websocket.htm#GKJIQ5) from Java EE 7.

---

Java WebSocket API (JWA) is a traditional Java web application, a war project in Maven. Add the following dependency to your pom.xml or include it on your classpath manually.

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
public class Bootstrap implements ServerApplicationConfig {

    // Assume Server is wes application
    io.github.flowersinthesand.portal.Server server = new DefaultServer();

    @Override
    public Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> classes) {
        // Bridge wes application and JWA
        return Collections.singleton(new JwaBridge("/portal").websocketAction(server.websocketAction()).config());
    }

    @Override
    public Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> scanned) {
        return Collections.emptySet();
    }

}
```

### In conjunction with Servlet 3.

Without the help of dependency injection, you have to declare wes application as static.

```java
// Note that this class will be instantiated twice by container 
// as a ServletContextListener and a ServerApplicationConfig
@WebListener
public class Bootstrap implements ServletContextListener, ServerApplicationConfig {

    // Assume Server is wes application
    static io.github.flowersinthesand.portal.Server server = new DefaultServer();
    
    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Prepare ServletContext
        ServletContext servletContext = event.getServletContext();
        
        // Bridge wes application and Servlet 3
        new ServletBridge(servletContext, "/portal").httpAction(server.httpAction());
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
    
    @Override
    public Set<ServerEndpointConfig> getEndpointConfigs(Set<Class<? extends Endpoint>> classes) {
        // Bridge wes application and JWA 1
        return Collections.singleton(new JwaBridge("/portal").websocketAction(server.websocketAction()).config());
    }

    @Override
    public Set<Class<?>> getAnnotatedEndpointClasses(Set<Class<?>> scanned) {
        return Collections.emptySet();
    }
    
}
```
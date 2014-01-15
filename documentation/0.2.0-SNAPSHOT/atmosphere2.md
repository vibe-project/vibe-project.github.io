---
layout: documentation
title: Atmosphere 2
---

# Atmosphere 2
This bridge integrates wes application with the [Atmosphere 2](https://github.com/atmosphere/atmosphere/) which makes the application run on most servlet containers that support the Servlet Specification 2.3. 

That being said, this module requires Servlet 3.1 containers. If you want to use Atmosphere 2 with containers implementing Servlet 2.3, check Atmosphere supports that container and open a feature request.

## Install
With Atmosphere, you can write a traditional Java web application, a war project in Maven. Add the following dependency to your pom.xml or include it on your classpath.

```xml
<dependency>
    <groupId>io.github.flowersinthesand</groupId>
    <artifactId>wes-atmosphere2</artifactId>
    <version>0.2.0-SNAPSHOT</version>
</dependency>
```

## Run

### Simplest

This is the simplest solution, `AtmosphereBridge`.

```java
@WebListener
public class Bootstrap implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Assume Portal is wes application
        Portal portal;
        
        // Bridge wes application and Atmosphere
        new AtmosphereBridge(event.getServletContext(), "/portal")
        .httpAction(portal.httpAction()).websocketAction(portal.websocketAction());
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {}

}
```

### Without helper

You need to write `AtmosphereHandler` as event source and register it to `AtmosphereFramework`. Here, to obtain `AtmosphereFramework`, it creates `AtmosphereServlet` using Servlet 3.0 features.

```java
@WebListener
public class Bootstrap implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Assume Portal is wes application
        Portal portal;
        
        try {
            ServletContext context = event.getServletContext();
            AtmosphereServlet servlet = context.createServlet(AtmosphereServlet.class);
            ServletRegistration.Dynamic reg = context.addServlet("wes", servlet);
            reg.setAsyncSupported(true);
            // Path
            reg.addMapping("/portal");
            
            AtmosphereFramework framework = servlet.framework();
            // When adding handler, path arg should be root
            framework.addAtmosphereHandler("/", new AtmosphereHandlerAdapter() {
                @Override
                public void onRequest(AtmosphereResource resource) throws IOException {
                    if (resource.transport() == TRANSPORT.WEBSOCKET) {
                        if (resource.getRequest().getMethod().equals("GET")) {
                            // WebSocket
                            portal.websocketAction().on(new AtmosphereServerWebSocket(resource));
                        }
                    } else {
                        // HttpExchange
                        portal.httpAction().on(new AtmosphereServerHttpExchange(resource));
                    }
                }
            });
        } catch (ServletException e) {}
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
    
}
```
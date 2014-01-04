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
    <version>${wes.version}</version>
</dependency>
```

## Run

```java
@WebListener
public class Bootstrap implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent event) {
        try {
            ServletContext context = event.getServletContext();
            AtmosphereServlet servlet = context.createServlet(AtmosphereServlet.class);
            AtmosphereFramework framework = servlet.framework();
            
            ServletRegistration.Dynamic reg = context.addServlet("wes", servlet);
            reg.setAsyncSupported(true);
            reg.addMapping("/portal");
            
            framework.addAtmosphereHandler("/", new AtmosphereHandlerAdapter() {
                @Override
                public void onRequest(AtmosphereResource resource) throws IOException {
                    if (resource.transport() == TRANSPORT.WEBSOCKET) {
                        if (resource.getRequest().getMethod().equals("GET")) {
                            new AtmosphereServerWebSocket(resource);
                        }
                    } else {
                        new AtmosphereServerHttpExchange(resource);
                    }
                }
            });
        } catch (ServletException e) {}
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {}
    
}
```

1. Prepare `AtmosphereFramework`
    1. Define `ServletContextListener` annotating with `@WebListener`.
    1. Create `AtmosphereServlet`.
        1. Set `asyncSupported` option to `true`.
        1. Configure the path by adding `mapping`.
1. Add `AtmosphereHandler` with root path, `/`.
    1. When the resource's transport and method is WebSocket and GET, create `AtmosphereServerWebSocket`.
    1. When the resource's transport is not WebSocket, create `AtmosphereServerHttpExchange`.
    1. Dispatch them to wes application.

However, there are many ways to bootstrap Atmosphere, for example you can use web.xml instead of Servlet 3.0 features, if you don't know Atmosphere well, just follow the above way.
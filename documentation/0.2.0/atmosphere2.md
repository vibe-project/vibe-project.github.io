---
layout: home
title: Atmosphere 2
---

# Atmosphere 2
This bridge integrates wes application with the [Atmosphere 2](https://github.com/atmosphere/atmosphere/) which makes the application run on most servlet containers that support the Servlet Specification 2.3. 

That being said, this module requires Servlet 3.1 containers. If you want to use Atmosphere 2 with containers implementing Servlet 2.3, check Atmosphere supports that container and open a feature request.

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
@WebListener
public class Bootstrap implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent event) {
        // Assume Server is wes application
        io.github.flowersinthesand.portal.Server server = new DefaultServer();
        
        // Prepare ServletContext
        ServletContext servletContext = event.getServletContext();
        
        // Bridge wes application and Atmosphere
        new AtmosphereBridge(servletContext, "/portal")
        .httpAction(server.httpAction()).websocketAction(server.websocketAction());
    }
    
    @Override
    public void contextDestroyed(ServletContextEvent sce) {}

}
```
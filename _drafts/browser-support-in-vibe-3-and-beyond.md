---
layout: post
title: "Browser support in Vibe 3 and beyond"
author: flowersinthesand
---

jQuery team has [mentioned](http://blog.jquery.com/2014/04/02/browser-support-in-jquery-1-12-and-beyond/) about future changes in browser support with Microsoft ending Windows XP support a month ago. Accordingly Vibe JavaScript Client will reduce browser coverage. As they already said, **don't panic!** It will happen some time in 2015 and only fallbackable support will be removed so you will still be able to support officially unsupported browsers.

Browsers to be not supported are Internet Explorer 6 and 7, Opera 12.1x and Safari 5.1.

So the new browser support table will be:

| Internet Explorer | Chrome | Firefox | Safari | Opera | iOS | Android |
|---|---|---|---|---|---|---|
| 8+ | (Current - 1) or Current | (Current - 1) or Current | (Current - 1) or Current | (Current - 1) or Current | 6.0+ | 4.0+ |
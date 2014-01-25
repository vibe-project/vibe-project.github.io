---
layout: news
title: "subproject, servlet3-test and jwa1-test"
categories: [news]
---

# Subproject, servlet3-test and jwa1-test

Servlet and Java WebSocket API are specification and somewhat new so that it has not been easy to confirm if a given server works with respectively `wes-servlet3` and `wes-jwa1` as expected or not. Of course it's right that it should work if vendor implements the spec correctly but sometimes sometimes it doesn't due to bug or optimisation. Actually using these projects I reported some bugs in Undertow lately.  

Anyway to help you make clear decision, I created subprojects consisting of test projects per implementation: [servlet3-test](https://github.com/flowersinthesand/wes-servlet3-test) and [jwa1-test](https://github.com/flowersinthesand/wes-jwa1-test). Check out them.
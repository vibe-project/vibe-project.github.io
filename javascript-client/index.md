---
layout: home
title: React JavaScript Client
---
<div class="row">
<div class="large-8 columns text">
{% capture panel %}
## Introduction

The **React** JavaScript Client not only provides **React** connectivity on every browser-based and Node-based applications but also focuses on making the best use of realtime connectivity in place of AJAX. In other words, it is not just for writing chat application, but for writing enterprise web application in economical way so that teams can create high performance web application easily.

---

## Features

* Provides React connectivity to replace AJAX
* Connection sharing between tabs and windows *
* Runs in Node.js and all browsers including Internet Explorer 6
* Event-based API akin to W3C WebSocket API
* No dependencies
* Lightweight (16.52KB minified, 5.89KB minified and gzipped)

\* experimental yet.

---

## Quick Start

Copy a [`react.js`](https://raw.githubusercontent.com/Atmosphere/react-javascript-client/master/react.js) and paste into your browser console. First let's see if the close event works.

```javascript
react.open("http://localhost:8000/react", {reconnect: false})
.on("close", function(reason) {
	console.log(reason);
});
```

Once you've received the close event, it's time to set up and run a react server on port 8000. If the server has started, you will be able to open connection normally.

```javascript
react.open("http://localhost:8000/react", {reconnect: false})
.on("open", function() {
	window.socket = this;
	console.log("A connection is opened");
});
```

Once the open event is fired, you can access the above socket by `socket`. Have fun!
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns text">
	<ul class="pricing-table project-widget">
	    <li class="title text-left">React JavaScript Client</li>
	    <li class="bullet-item">
		    <ul class="inline-list icons">
		    	<li><a href="https://github.com/Atmosphere/react-javascript-client" title="GitHub repository"><i class="fi-social-github size-36"></i></a></li>
		    	<li><a href="https://github.com/Atmosphere/react-javascript-client/issues" title="Issue tracker"><i class="fi-compass size-36"></i></a></li>
		    	<li><a href="http://groups.google.com/group/atmosphere-framework" title="Forum"><i class="fi-comments size-36"></i></a></li>
		    </ul>
	    </li>
	    <li class="description">Licensed under the Apache License 2.0</li>
	    <li class="bullet-item">
		    <ul class="inline-list documentation">
		    	<li class="version"><code>3.0.0-alpha1</code> <span class="secondary label">snapshot</span></li>
		    	<li><a href="{{ site.baseurl }}/javascript-client/3.0.0-Alpha1/reference/">Reference</a></li>
		    </ul>
	    </li>
	    <li class="description release-link"><a href="https://github.com/Atmosphere/react-javascript-client/releases">See all the releases notes</a></li>
	</ul>
	<div class="panel project-links">
		<h5>Examples</h5>
		<ul class="no-bullet">
			<li><a href="#">A basic example</a></li>
			<li><a href="#">A advanced example</a></li>
		</ul>
	</div>
</div>
</div>
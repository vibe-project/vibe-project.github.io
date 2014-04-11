---
layout: project
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
* Lightweight (16.52KB minified, 5.91KB minified and gzipped)

\* experimental yet.

---

## Quick Start

Copy a [`react.js`](https://raw.githubusercontent.com/Atmosphere/react-javascript-client/master/react.js) and paste into your browser console. First let's see if the close event works.
 
```javascript
react.open("http://localhost:8000/react").on("close", function(reason) {
	console.log(reason);
});
```

Once you've received the close event, it's time to set up and run a react server on port 8000. If the server has started, you will be able to open connection normally.

```javascript
react.open("http://localhost:8000/react").on("open", function() {
	window.socket = this;
});
```

Once the open event is fired, you can access the above socket by `socket`. Have fun!
{% endcapture %}{{ panel | markdownify }}
</div>
<div class="large-4 columns text">
{% capture panel %}

{% endcapture %}{{ panel | markdownify }}
</div>
</div>
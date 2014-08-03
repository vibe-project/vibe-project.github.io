The website is built with [Jekyll](http://jekyllrb.com/) and hosted on [GitHub Pages](http://pages.github.com/). To run it locally, see [Using Jekyll with Pages](https://help.github.com/articles/using-jekyll-with-pages) from GitHub Help. Windows users should see [special guide](http://jekyllrb.com/docs/windows/) from Jekyll before anything.

Once you've installed Jekyll, check out gh-pages branch, run the following command in the console.

     bundle exec jekyll serve --baseurl ''

Then, open [http://localhost:4000](http://localhost:4000) in your browser.

Some project documents are generated from project source using external tools and should be updated after commit or release.

* /projects/vibe-protocol/${version}/docs from `docco lib/*.js`
* /projects/vibe-java-server/${version}/apidocs from `mvn javadoc:aggregate`
* /projects/vibe-java-server-platform/${version}/apidocs from `mvn javadoc:aggregate`
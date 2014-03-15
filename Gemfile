source "https://rubygems.org"
gem "github-pages"

# Windows
if RbConfig::CONFIG["target_os"] =~ /mswin|mingw/i
  # https://github.com/jekyll/jekyll/issues/1948
  gem "jekyll", "1.4.2" 
  # https://github.com/juthilo/run-jekyll-on-windows/#let-jekyll-watch
  require "rbconfig"
  gem "wdm", ">= 0.1.0"
end
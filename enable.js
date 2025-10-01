(function () {
  "use strict";
  
  var manifest = {
    version: "1.0.2",
    name: "artemv_plugins",
    description: "ArtemV Plugins",
  };
  Lampa.Manifest.plugins = manifest;
  
  Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/bookmarks.js'], function () {});
  Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/interfaceColor.js'], function () {});
  Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/interfaceSize.js'], function () {});
  Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/interfaceStyle.js'], function () {});
  Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/quality.js'], function () {});
  
})();
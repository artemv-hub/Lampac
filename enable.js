(function () {
  "use strict";
  
  var manifest = {
    version: "1.1.1",
    name: "artemv_plugins",
    description: "ArtemV Plugins",
  };
  Lampa.Manifest.plugins = manifest;
  
  if (Lampa.Storage.get('lampac_unic_id', '') === 'ArtemV') {
    Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/bookmarks.js'], function () {});
    Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/interfaceColor.js'], function () {});
    //Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/interfaceMobile.js'], function () {});
    Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/interfaceSize.js'], function () {});
    Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/interfaceStyle.js'], function () {});
    Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/quality.js'], function () {});
  }
  
  else {
    Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/interfaceColor.js'], function () {});
    Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/interfaceSize.js'], function () {});
    Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/interfaceStyle.js'], function () {});
    Lampa.Utils.putScriptAsync(['https://artemv-hub.github.io/Lampac/plugins/quality.js'], function () {});
  }
  
})();
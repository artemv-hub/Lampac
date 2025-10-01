(function () {
  "use strict";

  function fixSize() {
    Lampa.SettingsApi.addParam({
      component: 'interface',
      param: {
        name: 'interface_fixsize',
        type: 'select',
        values: {
          '10': '10',
          '12': '12',
          '14': '14',
          '16': '16'
        },
        "default": '12'
      },
      field: { name: 'Фиксированный размер' },
      onChange: function onChange() {
        var name = Lampa.Controller.enabled().name;
        Lampa.Layer.update();
        Lampa.Controller.toggle(name);
      }
    });

    Lampa.Settings.listener.follow('open', function (e) {
      if (e.name == 'interface') {
        var item = e.body.find('[data-name="interface_fixsize"]');
        item.detach();
        item.insertAfter(e.body.find('[data-name="interface_size"]'));
      }
    });

    var layer_update = Lampa.Layer.update;

    Lampa.Layer.update = function (where) {
      var font_size = parseInt(Lampa.Storage.field('interface_fixsize')) || 12;
      if (Lampa.Platform.is('browser')) { font_size = 12; }
      if (Lampa.Platform.screen('mobile')) { font_size = 10; }
      $('body').css({ fontSize: font_size + 'px' });
      layer_update(where);
    };

    var timer;
    $(window).on('resize', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        Lampa.Layer.update();
      }, 150);
    });

    Lampa.Layer.update();
  }

  function startPlugin() {
    fixSize();
  }

  if (window.appready) { startPlugin(); }
  else {
    Lampa.Listener.follow("app", function (e) {
      if (e.type === "ready") { startPlugin(); }
    });
  }
})();

(function () {
  "use strict";
  
  function startPlugin() {
    if (Lampa.Platform.screen('mobile')) {
      var bar = Lampa.Template.get('navigation_bar', {});
      var mainButton = bar.find('.navigation-bar__item[data-action="main"]');
      if (mainButton.length) {
        mainButton.find('.navigation-bar__label').text(Lampa.Lang.translate('settings_input_links'));
        mainButton.data('action', 'favorite').attr('data-action', 'favorite');
      }
      
      bar.find('.navigation-bar__item').on('click', function () {
        var action = $(this).data('action');
        if (action == 'back') {
          Lampa.Controller.back();
        } else if (action == 'favorite') {
          Lampa.Activity.push({
            url: '',
            title: Lampa.Lang.translate('settings_input_links'),
            component: 'bookmarks',
            page: 1
          });
        } else if (action == 'search') {
          Lampa.Search.open();
        } else if (action == 'settings') {
          Lampa.Controller.toggle('settings');
        }
      });
      $('body').append(bar);
    }
  }
  
  if (window.appready) { startPlugin(); }
  else {
    Lampa.Listener.follow("app", function (e) {
      if (e.type === "ready") { startPlugin(); }
    });
  }
})();
(function () {  
  "use strict";  
    
  var LAMPAC_HOST = 'http://217.21.60.201:15366';  
    
  function CustomCategoryPlugin() {  
    // Получить все закладки с сервера  
    this.getBookmarks = function(callback) {  
      fetch(LAMPAC_HOST + '/bookmark/list')  
        .then(r => r.json())  
        .then(callback)  
        .catch(err => console.error('Failed to load bookmarks:', err));  
    };  
      
    // Создать или обновить категорию  
    this.setCategory = function(categoryName, cardIds, callback) {  
      fetch(LAMPAC_HOST + '/bookmark/set', {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({  
          where: categoryName,  
          data: cardIds  
        })  
      })  
      .then(r => r.json())  
      .then(callback)  
      .catch(err => console.error('Failed to set category:', err));  
    };  
      
    // Добавить карточку в категорию  
    this.addToCategory = function(categoryName, cardId) {  
      var self = this;  
      this.getBookmarks(function(bookmarks) {  
        var currentIds = bookmarks[categoryName] || [];  
          
        if (currentIds.indexOf(cardId) === -1) {  
          currentIds.unshift(cardId);  
          self.setCategory(categoryName, currentIds, function() {  
            Lampa.Noty.show('Добавлено в ' + categoryName);  
          });  
        }  
      });  
    };  
      
    // Удалить карточку из категории  
    this.removeFromCategory = function(categoryName, cardId) {  
      var self = this;  
      this.getBookmarks(function(bookmarks) {  
        var currentIds = bookmarks[categoryName] || [];  
        var index = currentIds.indexOf(cardId);  
          
        if (index !== -1) {  
          currentIds.splice(index, 1);  
          self.setCategory(categoryName, currentIds, function() {  
            Lampa.Noty.show('Удалено из ' + categoryName);  
          });  
        }  
      });  
    };  
      
    // Получить список пользовательских категорий  
    this.getCustomCategories = function(callback) {  
      this.getBookmarks(function(bookmarks) {  
        var categories = [];  
        var standardCategories = ['history', 'like', 'watch', 'wath', 'book', 'look', 'viewed', 'scheduled', 'continued', 'thrown', 'card'];  
          
        for (var key in bookmarks) {  
          if (bookmarks.hasOwnProperty(key) && standardCategories.indexOf(key) === -1) {  
            categories.push({  
              name: key,  
              count: Array.isArray(bookmarks[key]) ? bookmarks[key].length : 0  
            });  
          }  
        }  
          
        callback(categories);  
      });  
    };  
  }  
    
  var plugin = new CustomCategoryPlugin();  
    
  // Добавить UI для создания категории  
  function addCreateCategoryButton() {  
    Lampa.SettingsApi.addComponent({  
      component: 'custom_categories',  
      name: 'Пользовательские категории',  
      icon: '<svg>...</svg>'  
    });  
      
    Lampa.SettingsApi.addParam({  
      component: 'custom_categories',  
      param: {  
        name: 'create_category',  
        type: 'button',  
        default: true  
      },  
      onRender: function(item) {  
        item.on('hover:enter', function() {  
          Lampa.Input.edit({  
            title: 'Название категории',  
            value: '',  
            free: true,  
            nosave: true  
          }, function(value) {  
            if (value) {  
              plugin.setCategory(value, [], function() {  
                Lampa.Noty.show('Категория "' + value + '" создана');  
              });  
            }  
          });  
        });  
      }  
    });  
  }  
    
  // Расширить контекстное меню карточки  
  function extendCardMenu(card) {  
    plugin.getCustomCategories(function(categories) {  
      categories.forEach(function(category) {  
        var menuItem = {  
          title: category.name + ' (' + category.count + ')',  
          checkbox: true,  
          checked: false  
        };  
          
        // Проверить, есть ли карточка в категории  
        plugin.getBookmarks(function(bookmarks) {  
          var categoryIds = bookmarks[category.name] || [];  
          menuItem.checked = categoryIds.indexOf(card.id) !== -1;  
        });  
          
        menuItem.onSelect = function() {  
          if (menuItem.checked) {  
            plugin.removeFromCategory(category.name, card.id);  
          } else {  
            plugin.addToCategory(category.name, card.id);  
          }  
        };  
          
        // Добавить в меню (требуется доступ к Lampa.Select)  
      });  
    });  
  }  
    
  // Инициализация  
  function start() {  
    if (window.custom_category_plugin) return;  
    window.custom_category_plugin = true;  
      
    addCreateCategoryButton();  
      
    // Подключиться к событиям карточек  
    Lampa.Listener.follow('full', function(event) {  
      if (event.type === 'complite') {  
        var card = Lampa.Activity.active().card;  
        if (card) {  
          extendCardMenu(card);  
        }  
      }  
    });  
  }  
    
  if (window.appready) {  
    start();  
  } else {  
    Lampa.Listener.follow('app', function(event) {  
      if (event.type === 'ready') start();  
    });  
  }  
})();

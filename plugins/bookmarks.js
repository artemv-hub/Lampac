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
(function () {  
  "use strict";  
    
  var LAMPAC_HOST = window.location.origin;  
    
  // ============================================  
  // CORE: Управление категориями через API  
  // ============================================  
  function CustomCategoryAPI() {  
    var self = this;  
      
    this.getBookmarks = function(callback) {  
      fetch(LAMPAC_HOST + '/bookmark/list')  
        .then(function(r) { return r.json(); })  
        .then(callback)  
        .catch(function(err) {   
          console.error('Failed to load bookmarks:', err);  
          callback({});  
        });  
    };  
      
    this.setCategory = function(categoryName, cardIds, callback) {  
      fetch(LAMPAC_HOST + '/bookmark/set', {  
        method: 'POST',  
        headers: { 'Content-Type': 'application/json' },  
        body: JSON.stringify({  
          where: categoryName,  
          data: cardIds  
        })  
      })  
      .then(function(r) { return r.json(); })  
      .then(function(result) {  
        if (callback) callback(result);  
      })  
      .catch(function(err) {   
        console.error('Failed to set category:', err);  
      });  
    };  
      
    this.getCustomCategories = function(callback) {  
      this.getBookmarks(function(bookmarks) {  
        var categories = [];  
        var standardCategories = ['history', 'like', 'watch', 'wath', 'book', 'look', 'viewed', 'scheduled', 'continued', 'thrown', 'card'];  
          
        for (var key in bookmarks) {  
          if (bookmarks.hasOwnProperty(key) && standardCategories.indexOf(key) === -1) {  
            categories.push({  
              name: key,  
              count: Array.isArray(bookmarks[key]) ? bookmarks[key].length : 0,  
              ids: bookmarks[key] || []  
            });  
          }  
        }  
          
        callback(categories);  
      });  
    };  
      
    this.addToCategory = function(categoryName, card, callback) {  
      self.getBookmarks(function(bookmarks) {  
        var currentIds = bookmarks[categoryName] || [];  
        var cardArray = bookmarks.card || [];  
          
        if (currentIds.indexOf(card.id) === -1) {  
          currentIds.unshift(card.id);  
            
          // Добавить карточку в общий массив, если её там нет  
          var cardExists = cardArray.some(function(c) { return c.id === card.id; });  
          if (!cardExists) {  
            cardArray.unshift(card);  
            self.setCategory('card', cardArray, function() {  
              self.setCategory(categoryName, currentIds, callback);  
            });  
          } else {  
            self.setCategory(categoryName, currentIds, callback);  
          }  
        } else if (callback) {  
          callback();  
        }  
      });  
    };  
      
    this.removeFromCategory = function(categoryName, cardId, callback) {  
      self.getBookmarks(function(bookmarks) {  
        var currentIds = bookmarks[categoryName] || [];  
        var index = currentIds.indexOf(cardId);  
          
        if (index !== -1) {  
          currentIds.splice(index, 1);  
          self.setCategory(categoryName, currentIds, callback);  
        } else if (callback) {  
          callback();  
        }  
      });  
    };  
      
    this.createCategory = function(categoryName, callback) {  
      self.setCategory(categoryName, [], callback);  
    };  
      
    this.deleteCategory = function(categoryName, callback) {  
      self.setCategory(categoryName, null, callback);  
    };  
  }  
    
  var api = new CustomCategoryAPI();  
    
  // ============================================  
  // UI: Страница закладок  
  // ============================================  
  function BookmarksPageUI() {  
    this.renderCategoryButton = function(category) {  
      var $register = Lampa.Template.js('register')  
        .addClass('selector')  
        .addClass('custom-category')  
        .attr('data-category', category.name);  
        
      $register.find('.register__name').text(category.name);  
      $register.find('.register__counter').text(category.count || 0);  
        
      // Клик - открыть категорию  
      $register.on('hover:enter', function() {  
        Lampa.Activity.push({  
          url: '',  
          component: 'favorite',  
          title: category.name,  
          type: category.name,  
          page: 1  
        });  
      });  
        
      // Долгое нажатие - меню управления  
      $register.on('hover:long', function() {  
        var menu = [  
          { title: 'Переименовать', action: 'rename' },  
          { title: 'Удалить', action: 'delete' }  
        ];  
          
        Lampa.Select.show({  
          title: 'Действия',  
          items: menu,  
          onSelect: function(item) {  
            if (item.action === 'delete') {  
              api.deleteCategory(category.name, function() {  
                $register.remove();  
                Lampa.Noty.show('Категория удалена');  
              });  
            } else if (item.action === 'rename') {  
              Lampa.Input.edit({  
                title: 'Новое название',  
                value: category.name,  
                free: true,  
                nosave: true  
              }, function(newName) {  
                if (newName && newName !== category.name) {  
                  // Переименование = создание новой + удаление старой  
                  api.getBookmarks(function(bookmarks) {  
                    var ids = bookmarks[category.name] || [];  
                    api.setCategory(newName, ids, function() {  
                      api.deleteCategory(category.name, function() {  
                        $register.find('.register__name').text(newName);  
                        $register.attr('data-category', newName);  
                        Lampa.Noty.show('Категория переименована');  
                      });  
                    });  
                  });  
                }  
              });  
            }  
          }  
        });  
      });  
        
      return $register;  
    };  
      
    this.renderAddButton = function() {  
      var $register = Lampa.Template.js('register')  
        .addClass('selector')  
        .addClass('custom-category-add');  
        
      $register.find('.register__name').text('+ Создать категорию');  
      $register.find('.register__counter').remove();  
        
      $register.on('hover:enter', function() {  
        Lampa.Input.edit({  
          title: 'Название категории',  
          value: '',  
          free: true,  
          nosave: true  
        }, function(value) {  
          if (value) {  
            api.createCategory(value, function() {  
              Lampa.Noty.show('Категория "' + value + '" создана');  
              // Перезагрузить страницу закладок  
              Lampa.Activity.active().activity.toggle();  
            });  
          }  
        });  
      });  
        
      return $register;  
    };  
      
    this.render = function() {  
      var $render = Lampa.Activity.active().activity.render();  
        
      // Добавить кнопку создания  
      var $addBtn = this.renderAddButton();  
      $('.register:first', $render).after($addBtn);  
        
      // Добавить существующие категории  
      api.getCustomCategories(function(categories) {  
        categories.forEach(function(category) {  
          var $btn = new BookmarksPageUI().renderCategoryButton(category);  
          $addBtn.after($btn);  
        });  
          
        Lampa.Controller.collectionSet($render.find('.scroll__body'));  
      });  
    };  
  }  
    
  // ============================================  
  // UI: Контекстное меню карточки  
  // ============================================  
  function CardMenuUI() {  
    this.extend = function(card) {  
      api.getCustomCategories(function(categories) {  
        if (categories.length === 0) return;  
          
        var $menu = $('body > .selectbox');  
        var $bookmarkItem = $menu.find('.selectbox-item__title').filter(function() {  
          return $(this).text() === Lampa.Lang.translate('title_book');  
        }).parent();  
          
        categories.forEach(function(category) {  
          var isChecked = category.ids.indexOf(card.id) !== -1;  
            
          var $item = $('<div class="selectbox-item selector">' +  
            '<div class="selectbox-item__title">' + category.name + '</div>' +  
            '<div class="selectbox-item__checkbox"></div>' +  
            '</div>');  
            
          if (isChecked) {  
            $item.addClass('selectbox-item--checked');  
          }  
            
          $item.on('hover:enter', function() {  
            var $this = $(this);  
            var checked = $this.hasClass('selectbox-item--checked');  
              
            if (checked) {  
              api.removeFromCategory(category.name, card.id, function() {  
                $this.removeClass('selectbox-item--checked');  
                Lampa.Noty.show('Удалено из ' + category.name);  
              });  
            } else {  
              api.addToCategory(category.name, card, function() {  
                $this.addClass('selectbox-item--checked');  
                Lampa.Noty.show('Добавлено в ' + category.name);  
              });  
            }  
          });  
            
          $item.insertBefore($bookmarkItem);  
        });  
          
        Lampa.Controller.collectionSet($menu.find('.scroll__body'));  
      });  
    };  
  }  
    
  // ============================================  
  // INIT: Инициализация плагина  
  // ============================================  
  function init() {  
    if (window.customCategoriesPlugin) return;  
    window.customCategoriesPlugin = true;  
      
    // Рендерить категории на странице закладок  
    Lampa.Listener.follow('activity', function(e) {  
      if (e.type === 'start' && e.component === 'bookmarks') {  
        setTimeout(function() {  
          new BookmarksPageUI().render();  
        }, 100);  
      }  
    });  
      
    // Расширить меню карточки  
    Lampa.Listener.follow('full', function(e) {  
      if (e.type === 'complite') {  
        var $bookBtn = $('.button--book', Lampa.Activity.active().activity.render());  
        $bookBtn.on('hover:enter', function() {  
          setTimeout(function() {  
            new CardMenuUI().extend(Lampa.Activity.active().card);  
          }, 50);  
        });  
      }  
    });  
      
    console.log('[CustomCategories] Plugin initialized');  
  }  
    
  // Запуск  
  if (window.appready) {  
    init();  
  } else {  
    Lampa.Listener.follow('app', function(e) {  
      if (e.type === 'ready') init();  
    });  
  }  
})();

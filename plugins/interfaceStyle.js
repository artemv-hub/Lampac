(function () {
  "use strict";
  
  const style = document.createElement('style');
  style.textContent = `
    .card__view { position: relative !important; }
    .card__quality { left: 0.3em; bottom: 0.3em; border-radius: 1em; padding: 0.2em 0.5em; background: rgba(0, 0, 0, 0.8); width: max-content; max-width: calc(100% - 1em); text-transform: none; }
    .card__quality div { font-weight: bold; font-size: 1.2em; font-style: normal; color: #fff; }
    .card__vote { font-weight: bold; font-size: 1em; right: 0.2em; bottom: 0.2em; background: rgba(0, 0, 0, 0.8); }
    .card__icons { top: 1.6em; }
    .card__marker { top: 0.1em; bottom: unset; left: 50%; transform: translate(-50%); }
    .card__marker > span { font-size: 0.8em; max-width: 16em; }
    .card__type { top: 2.4em; border-radius: 0.4em; padding: 0.2em 0.4em; }
  
    .full-start-new__buttons .full-start__button:not(.focus) span { display: unset; }
    .time-line { background-color: rgba(255, 255, 255, 0.1); }
    .time-line > div,
    .navigation-tabs__button.focus,
    .player-panel__position,
    .player-panel__position > div:after { background-color: #65eaa7; color: #fff; }
  
    .radio-item.focus,
    .lang__selector-item.focus,
    .simple-keyboard .hg-button.focus,
    .modal__button.focus,
    .search-history-key.focus,
    .simple-keyboard-mic.focus,
    .torrent-serial__progress,
    .full-review-add.focus,
    .full-review.focus,
    .tag-count.focus,
    .settings-folder.focus,
    .settings-param.focus,
    .selectbox-item.focus,
    .selectbox-item.hover { background: #65eaa7; color: #000; }
  `;
  document.head.appendChild(style);
  
  function full_start() {
    Lampa.Template.add('full_start_new',
      "<div class=\"full-start-new\">\n" +
      "  <div class=\"full-start-new__body\">\n" +
      "    <div class=\"full-start-new__left\">\n" +
      "      <div class=\"full-start-new__poster\">\n" +
      "        <img class=\"full-start-new__img full--poster\" />\n" +
      "      </div>\n" +
      "    </div>\n" +
      "\n" +
      "    <div class=\"full-start-new__right\">\n" +
      "      <div class=\"full-start-new__head\"></div>\n" +
      "      <div class=\"full-start-new__original-title\">{original_title}</div>\n" +
      "      <div class=\"full-start-new__title\">{title}</div>\n" +
      "      <div class=\"full-start-new__tagline full--tagline\">{tagline}</div>\n" +
      "      <div class=\"full-start-new__rate-line\">\n" +
      "        <div class=\"full-start__rate rate--tmdb\"><div>{rating}</div><div class=\"source--name\">TMDB</div></div>\n" +
      "        <div class=\"full-start__rate rate--imdb hide\"><div></div><div>IMDb</div></div>\n" +
      "        <div class=\"full-start__rate rate--kp hide\"><div></div><div>Кинопоиск</div></div>\n" +
      "        <div class=\"full-start__pg\"></div>\n" +
      "        <div class=\"full-start__status\"></div>\n" +
      "      </div>\n" +
      "      <div class=\"full-start-new__details\"></div>\n" +
      "      <div class=\"full-start-new__reactions hide\"><div>#{reactions_none}</div>\n" +
      "      </div>\n" +
      "\n" +
      "      <div class=\"full-start-new__buttons\">\n" +
      "        <div class=\"full-start__button selector view--torrent\">\n" +
      "          <svg width=\"50px\" height=\"50px\" viewBox=\"0 0 50 50\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
      "            <path d=\"M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z M40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4 S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851 c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29 c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8 c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722 C42.541,30.867,41.756,30.963,40.5,30.963z\" fill=\"currentColor\"/>\n" +
      "          </svg>\n" +
      "          <span>#{full_torrents}</span>\n" +
      "        </div>\n" +
      "\n" +
      "        <div class=\"full-start__button selector button--options\"></div>\n" +
      "\n" +
      "        <div class=\"full-start__button selector button--play\">\n" +
      "          <svg width=\"28\" height=\"29\" viewBox=\"0 0 28 29\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
      "            <circle cx=\"14\" cy=\"14.5\" r=\"13\" stroke=\"currentColor\" stroke-width=\"2.7\"/>\n" +
      "            <path d=\"M18.0739 13.634C18.7406 14.0189 18.7406 14.9811 18.0739 15.366L11.751 19.0166C11.0843 19.4015 10.251 18.9204 10.251 18.1506L10.251 10.8494C10.251 10.0796 11.0843 9.5985 11.751 9.9834L18.0739 13.634Z\" fill=\"currentColor\"/>\n" +
      "          </svg>\n" +
      "          <span>#{title_watch}</span>\n" +
      "        </div>\n" +
      "\n" +
      "        <div class=\"full-start__button selector view--trailer\">\n" +
      "          <svg height=\"70\" viewBox=\"0 0 80 70\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
      "            <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z\" fill=\"currentColor\"></path>\n" +
      "          </svg>\n" +
      "          <span>#{full_trailers}</span>\n" +
      "        </div>\n" +
      "\n" +
      "        <div class=\"full-start__button selector button--book\">\n" +
      "          <svg width=\"21\" height=\"32\" viewBox=\"0 0 21 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">\n" +
      "            <path d=\"M2 1.5H19C19.2761 1.5 19.5 1.72386 19.5 2V27.9618C19.5 28.3756 19.0261 28.6103 18.697 28.3595L12.6212 23.7303C11.3682 22.7757 9.63183 22.7757 8.37885 23.7303L2.30302 28.3595C1.9739 28.6103 1.5 28.3756 1.5 27.9618V2C1.5 1.72386 1.72386 1.5 2 1.5Z\" stroke=\"currentColor\" stroke-width=\"2.5\" fill=\"currentColor\"></path>\n" +
      "          </svg>\n" +
      "          <span>Избранное</span>\n" +
      "        </div>\n" +
      "      </div>\n" +
      "    </div>\n" +
      "  </div>\n" +
      "</div>"
    );
  }
  
  function fixLabelsTV(cards) {
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const typeElem = card.querySelector('.card__type');
      if (typeElem && typeElem.textContent !== 'Сериал') {
        typeElem.textContent = 'Сериал';
      }
    }
  }
  
  function startPlugin() {
    full_start();
    fixLabelsTV(document.querySelectorAll('.card--tv'));
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            if (node.matches('.card--tv')) fixLabelsTV([node]);
            const childCards = node.querySelectorAll('.card--tv');
            if (childCards.length > 0) fixLabelsTV(childCards);
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  if (window.appready) { startPlugin(); }
  else {
    Lampa.Listener.follow("app", function (e) {
      if (e.type === "ready") { startPlugin(); }
    });
  }
})();

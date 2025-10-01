(function() {
  "use strict";
  
  var LQE_CONFIG = {
    SHOW_QUALITY_FOR_TV_SERIES: true,
    CACHE_VERSION: 2,
    CACHE_KEY: 'lampa_quality_cache',
    CACHE_VALID_TIME_MS: 3 * 24 * 60 * 60 * 1000, // 3 days
    CACHE_REFRESH_THRESHOLD_MS: 12 * 60 * 60 * 1000, // 12 hours
    JACRED_PROTOCOL: 'https://',
    JACRED_URL: 'jacred.xyz',
    JACRED_API_KEY: '',
    PROXY_TIMEOUT_MS: 5000,
    PROXY_LIST: [
      'https://api.allorigins.win/raw?url=',
      'https://cors.bwa.workers.dev/'
    ],
  };
  
  var QUALITY_DISPLAY_MAP = (function() {
    const mapGroups = {
      "2160p": ["2160p", "2160", "4k"],
      "1080p": ["1080p", "1080", "fhd"],
      "1080i": ["1080i"],
      "720p": ["720p", "720", "hd"],
      "720i": ["720i"],
      "480p": ["480p", "480", "sd"],
      "BD": ["blu-ray disc", "blu-ray", "bluray"],
      "BDRemux": ["blu-ray remux", "bdremux"],
      "BDRip": ["bdrip"],
      "HDRip": ["hdrip"],
      "DVDRip": ["dvdrip"],
      "WEB-DL": ["web-dl", "webdl"],
      "WEBRip": ["web-dlrip", "webdlrip", "web", "webrip"],
      "CAMRip": ["camrip"],
      "VHSRip": ["vhsrip"],
      "TC": ["telecine", "tc"],
      "TS": ["telesync", "telesynch", "ts"],
      "(TS)": ["звук с ts"],
      "IPTV": ["iptv", "iptvrip"],
      "HDTV": ["hdtv", "hdtvrip",],
      "TV": ["tv", "tvrip", "satrip", "dsrip", "dvb-s2", "dvb-t2", "dvb"]
    };
    
    return Object.entries(mapGroups).reduce((acc, [key, arr]) => {
      arr.forEach(item => acc[item] = key);
      return acc;
    }, {});
  })();
  
  var QUALITY_PRIORITY_ORDER = [
    'resolution',
    'source',
  ];
  
  function fetchWithProxy(url, cardId, callback) {
    var currentProxyIndex = 0;
    var callbackCalled = false;
    
    function tryNextProxy() {
      if (currentProxyIndex >= LQE_CONFIG.PROXY_LIST.length) {
        if (!callbackCalled) {
          callbackCalled = true;
          callback(new Error('All proxies failed for ' + url));
        }
        return;
      }
      var proxyUrl = LQE_CONFIG.PROXY_LIST[currentProxyIndex] + encodeURIComponent(url);
      var timeoutId = setTimeout(function() {
        if (!callbackCalled) {
          currentProxyIndex++;
          tryNextProxy();
        }
      }, LQE_CONFIG.PROXY_TIMEOUT_MS);
      fetch(proxyUrl)
      .then(function(response) {
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error('Proxy error: ' + response.status);
        return response.text();
      })
      .then(function(data) {
        if (!callbackCalled) {
          callbackCalled = true;
          clearTimeout(timeoutId);
          callback(null, data);
        }
      })
      .catch(function() {
        clearTimeout(timeoutId);
        if (!callbackCalled) {
          currentProxyIndex++;
          tryNextProxy();
        }
      });
    }
    tryNextProxy();
  }
  
  function getCardType(cardData) {
    var type = cardData.media_type || cardData.type;
    if (type === 'movie' || type === 'tv') return type;
    return cardData.name || cardData.original_name ? 'tv' : 'movie';
  }
  
  function translateQualityLabel(qualityCode, fullTorrentTitle) {
    let finalDisplayLabel = '';
    const lowerFullTorrentTitle = (fullTorrentTitle || '').toLowerCase();
    let bestDirectMatchKey = '';
    let maxDirectMatchLength = 0;
    const simpleComponentKeywords = [
      '2160p', '2160', '4k', '1080p', '1080', 'fhd', '1080i', '720p', '720', 'hd', '720i', '480p', '480', 'sd',
      'blu-ray disc', 'blu-ray', 'bluray', 'blu-ray remux', 'bdremux',
      'bdrip', 'hdrip', 'dvdrip', 'web-dl', 'webdl', 'web-dlrip', 'webdlrip', 'web', 'webrip',
      'camrip', 'vhsrip', 'telecine', 'tc', 'telesync', 'telesynch', 'ts', 'звук с ts',
      'iptv', 'iptvrip', 'hdtv', 'hdtvrip', 'tv', 'tvrip', 'satrip', 'dsrip', 'dvb-s2', 'dvb-t2', 'dvb'
    ].map(k => k.toLowerCase());
    for (const key in QUALITY_DISPLAY_MAP) {
      if (QUALITY_DISPLAY_MAP.hasOwnProperty(key)) {
        const lowerKey = String(key).toLowerCase();
        if (lowerFullTorrentTitle.includes(lowerKey) && lowerKey.length > 5 && !simpleComponentKeywords.includes(lowerKey)) {
          if (lowerKey.length > maxDirectMatchLength) {
            maxDirectMatchLength = lowerKey.length;
            bestDirectMatchKey = key;
          }
        }
      }
    }
    if (bestDirectMatchKey) {
      finalDisplayLabel = QUALITY_DISPLAY_MAP[bestDirectMatchKey];
      return finalDisplayLabel;
    }
    let extracted = {
      resolution: '',
      source: ''
    };
    const resolutionMatch = lowerFullTorrentTitle.match(/(\d{3,4}p)|(4k)/);
    if (resolutionMatch) {
      let matchedRes = resolutionMatch[1] || resolutionMatch[2];
      if (matchedRes) {
        matchedRes = matchedRes.replace(/\s*/g, '').toLowerCase();
        extracted.resolution = QUALITY_DISPLAY_MAP[matchedRes] || matchedRes;
      }
    }
    const sourceRegex = /(blu-ray disc|blu-ray|bluray|blu-ray remux|bdremux|bdrip|hdrip|dvdrip|web-dl|webdl|web-dlrip|webdlrip|web|webrip|camrip|vhsrip|telecine|tc|telesync|telesynch|ts|звук с ts|iptv|iptvrip|hdtv|hdtvrip|tv|tvrip|satrip|dsrip|dvb-s2|dvb-t2|dvb)\b/g;
    let sourceMatch;
    let tempSource = '';
    while ((sourceMatch = sourceRegex.exec(lowerFullTorrentTitle)) !== null) {
      if (sourceMatch[1] === 'звук с ts') {
        tempSource = sourceMatch[1];
        break;
      }
      if (sourceMatch[1].length > tempSource.length) {
        tempSource = sourceMatch[1];
      }
    }
    if (tempSource) {
      extracted.source = QUALITY_DISPLAY_MAP[tempSource] || tempSource.toUpperCase();
    }
    let assembledParts = [];
    QUALITY_PRIORITY_ORDER.forEach(componentType => {
      if (extracted[componentType]) {
        assembledParts.push(extracted[componentType]);
      }
    });
    finalDisplayLabel = assembledParts.join(' ').trim();
    if (finalDisplayLabel === '' && qualityCode) {
      const lowerQualityCode = String(qualityCode).toLowerCase();
      finalDisplayLabel = QUALITY_DISPLAY_MAP[lowerQualityCode] || qualityCode;
    }
    if (finalDisplayLabel === '') {
      finalDisplayLabel = qualityCode || '';
    }
    return finalDisplayLabel;
  }
  
  function getBestReleaseFromJacred(normalizedCard, cardId, callback) {
    if (!LQE_CONFIG.JACRED_URL) {
      callback(null);
      return;
    }
    var year = '';
    var dateStr = normalizedCard.release_date || '';
    if (dateStr.length >= 4) {
      year = dateStr.substring(0, 4);
    }
    if (!year || isNaN(year)) {
      callback(null);
      return;
    }
    
    function searchJacredApi(searchTitle, searchYear, exactMatch, strategyName, apiCallback) {
      var userId = Lampa.Storage.get('lampac_unic_id', '');
      var apiUrl = LQE_CONFIG.JACRED_PROTOCOL + LQE_CONFIG.JACRED_URL + '/api/v1.0/torrents?search=' +
      encodeURIComponent(searchTitle) +
      '&year=' + searchYear +
      (exactMatch ? '&exact=true' : '') +
      '&uid=' + userId;
      var timeoutId = setTimeout(() => {
        apiCallback(null);
      }, LQE_CONFIG.PROXY_TIMEOUT_MS * LQE_CONFIG.PROXY_LIST.length + 1000);
      fetchWithProxy(apiUrl, cardId, function(error, responseText) {
        clearTimeout(timeoutId);
        if (error || !responseText) {
          apiCallback(null);
          return;
        }
        try {
          var torrents = JSON.parse(responseText);
          if (!Array.isArray(torrents) || torrents.length === 0) {
            apiCallback(null);
            return;
          }
          var bestNumericQuality = -1;
          var bestFoundTorrent = null;
          var searchYearNum = parseInt(searchYear, 10);
          
          function extractNumericQualityFromTitle(title) {
            if (!title) return 0;
            var lower = title.toLowerCase();
            if (/2160p|4k/.test(lower)) return 2160;
            if (/1080p/.test(lower)) return 1080;
            if (/720p/.test(lower)) return 720;
            if (/480p/.test(lower)) return 480;
            if (/ts|telesync/.test(lower)) return 1;
            if (/camrip|камрип/.test(lower)) return 2;
            return 0;
          }
          
          function extractYearFromTitle(title) {
            if (!title) return 0;
            var regex = /(?:^|[^\d])(\d{4})(?:[^\d]|$)/g;
            var match;
            var lastYear = 0;
            var currentYear = new Date().getFullYear();
            while ((match = regex.exec(title)) !== null) {
              var extractedYear = parseInt(match[1], 10);
              if (extractedYear >= 1900 && extractedYear <= currentYear + 1) {
                lastYear = extractedYear;
              }
            }
            return lastYear;
          }
          for (var i = 0; i < torrents.length; i++) {
            var currentTorrent = torrents[i];
            var currentNumericQuality = currentTorrent.quality;
            var torrentYear = currentTorrent.relased;
            if (typeof currentNumericQuality !== 'number' || currentNumericQuality === 0) {
              var extractedQuality = extractNumericQualityFromTitle(currentTorrent.title);
              if (extractedQuality > 0) {
                currentNumericQuality = extractedQuality;
              } else {
                continue;
              }
            }
            var isYearValid = false;
            var parsedYear = 0;
            if (torrentYear && !isNaN(torrentYear) && torrentYear > 1900) {
              parsedYear = parseInt(torrentYear, 10);
              isYearValid = true;
            }
            if (!isYearValid) {
              parsedYear = extractYearFromTitle(currentTorrent.title);
              if (parsedYear > 0) {
                torrentYear = parsedYear;
                isYearValid = true;
              }
            }
            if (isYearValid && !isNaN(searchYearNum) && Math.abs(parsedYear - searchYearNum) > 1) {
              continue;
            }
            if (currentNumericQuality > bestNumericQuality) {
              bestNumericQuality = currentNumericQuality;
              bestFoundTorrent = currentTorrent;
            } else if (currentNumericQuality === bestNumericQuality && bestFoundTorrent && currentTorrent.title.length > bestFoundTorrent.title.length) {
              bestFoundTorrent = currentTorrent;
            }
          }
          if (bestFoundTorrent) {
            apiCallback({
              quality: bestFoundTorrent.quality || bestNumericQuality,
              full_label: bestFoundTorrent.title
            });
          } else {
            apiCallback(null);
          }
        } catch (e) {
          apiCallback(null);
        }
      });
    }
    
    var searchStrategies = [];
    if (normalizedCard.original_title && (/[a-zа-яё]/i.test(normalizedCard.original_title) || /^\d+$/.test(normalizedCard.original_title))) {
      searchStrategies.push({
        title: normalizedCard.original_title.trim(),
        year: year,
        exact: true,
        name: "OriginalTitle Exact Year"
      });
    }
    if (normalizedCard.title && (/[a-zа-яё]/i.test(normalizedCard.title) || /^\d+$/.test(normalizedCard.title))) {
      searchStrategies.push({
        title: normalizedCard.title.trim(),
        year: year,
        exact: true,
        name: "Title Exact Year"
      });
    }
    
    function executeNextStrategy(index) {
      if (index >= searchStrategies.length) {
        callback(null);
        return;
      }
      var strategy = searchStrategies[index];
      searchJacredApi(strategy.title, strategy.year, strategy.exact, strategy.name, function(result) {
        if (result !== null) {
          callback(result);
        } else {
          executeNextStrategy(index + 1);
        }
      });
    }
    if (searchStrategies.length > 0) {
      executeNextStrategy(0);
    } else {
      callback(null);
    }
  }
  
  function getQualityCache(key) {
    var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
    var item = cache[key];
    var isCacheValid = item && (Date.now() - item.timestamp < LQE_CONFIG.CACHE_VALID_TIME_MS);
    return isCacheValid ? item : null;
  }
  
  function saveQualityCache(key, data, cardId) {
    var cache = Lampa.Storage.get(LQE_CONFIG.CACHE_KEY) || {};
    cache[key] = {
      quality_code: data.quality_code,
      full_label: data.full_label,
      timestamp: Date.now()
    };
    Lampa.Storage.set(LQE_CONFIG.CACHE_KEY, cache);
  }
  
  function clearFullCardQualityElements(cardId, renderElement) {
    if (renderElement) {
      var existingElements = $('.full-start__status.lqe-quality', renderElement);
      if (existingElements.length > 0) {
        existingElements.remove();
      }
    }
  }
  
  function updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement, bypassTranslation = false) {
    if (!renderElement) return;
    var element = $('.full-start__status.lqe-quality', renderElement);
    var rateLine = $('.full-start-new__rate-line', renderElement);
    if (!rateLine.length) return;
    
    var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);
    
    if (element.length) {
      element.text(displayQuality).css('opacity', '1');
    } else {
      var div = document.createElement('div');
      div.className = 'full-start__status lqe-quality';
      div.textContent = displayQuality;
      rateLine.append(div);
    }
  }
  
  function processFullCardQuality(cardData, renderElement) {
    if (!renderElement) return;
    var cardId = cardData.id;
    var normalizedCard = {
      id: cardData.id,
      title: cardData.title || cardData.name || '',
      original_title: cardData.original_title || cardData.original_name || '',
      type: getCardType(cardData),
      release_date: cardData.release_date || cardData.first_air_date || ''
    };
    var rateLine = $('.full-start-new__rate-line', renderElement);
    if (rateLine.length) {
      rateLine.addClass('done');
    }
    var isTvSeries = (normalizedCard.type === 'tv' || normalizedCard.name);
    var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + (isTvSeries ? 'tv_' : 'movie_') + normalizedCard.id;
    
    var cachedQualityData = getQualityCache(cacheKey);
    if (!(isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false)) {
      if (cachedQualityData) {
        updateFullCardQualityElement(cachedQualityData.quality_code, cachedQualityData.full_label, cardId, renderElement);
        
        if (Date.now() - cachedQualityData.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
          getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
            if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
              saveQualityCache(cacheKey, {
                quality_code: jrResult.quality,
                full_label: jrResult.full_label
              }, cardId);
              updateFullCardQualityElement(jrResult.quality, jrResult.full_label, cardId, renderElement);
            }
          });
        }
      } else {
        clearFullCardQualityElements(cardId, renderElement);
        var rateLine = $('.full-start-new__rate-line', renderElement);
        if (rateLine.length && !$('.full-start__status.lqe-quality', rateLine).length) {
          var placeholder = document.createElement('div');
          placeholder.className = 'full-start__status lqe-quality';
          placeholder.textContent = 'Загрузка...';
          placeholder.style.opacity = '0.7';
          rateLine.append(placeholder);
        }
        getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
          var qualityCode = (jrResult && jrResult.quality) || null;
          var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
          if (qualityCode && qualityCode !== 'NO') {
            saveQualityCache(cacheKey, {
              quality_code: qualityCode,
              full_label: fullTorrentTitle
            }, cardId);
            updateFullCardQualityElement(qualityCode, fullTorrentTitle, cardId, renderElement);
          } else {
            clearFullCardQualityElements(cardId, renderElement);
          }
        });
      }
    } else {
      clearFullCardQualityElements(cardId, renderElement);
      if (rateLine.length) rateLine.css('visibility', 'visible');
    }
  }
  
  function updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle, bypassTranslation = false) {
    var displayQuality = bypassTranslation ? fullTorrentTitle : translateQualityLabel(qualityCode, fullTorrentTitle);
    
    var existingQualityElements = cardView.getElementsByClassName('card__quality');
    Array.from(existingQualityElements).forEach(el => el.parentNode.removeChild(el));
    
    var qualityDiv = document.createElement('div');
    qualityDiv.className = 'card__quality';
    var innerElement = document.createElement('div');
    innerElement.textContent = displayQuality;
    qualityDiv.appendChild(innerElement);
    cardView.appendChild(qualityDiv);
  }
  
  function updateCardListQuality(cardElement) {
    if (cardElement.hasAttribute('data-lqe-quality-processed')) return;
    
    var cardView = cardElement.querySelector('.card__view');
    var cardData = cardElement.card_data;
    if (!cardData || !cardView) return;
    
    var isTvSeries = (getCardType(cardData) === 'tv');
    if (isTvSeries && LQE_CONFIG.SHOW_QUALITY_FOR_TV_SERIES === false) return;
    
    var normalizedCard = {
      id: cardData.id || '',
      title: cardData.title || cardData.name || '',
      original_title: cardData.original_title || cardData.original_name || '',
      type: getCardType(cardData),
      release_date: cardData.release_date || cardData.first_air_date || ''
    };
    var cardId = normalizedCard.id;
    var cacheKey = LQE_CONFIG.CACHE_VERSION + '_' + normalizedCard.type + '_' + cardId;
    cardElement.setAttribute('data-lqe-quality-processed', 'true');
    
    var cachedQualityData = getQualityCache(cacheKey);
    if (cachedQualityData) {
      updateCardListQualityElement(cardView, cachedQualityData.quality_code, cachedQualityData.full_label);
      
      if (Date.now() - cachedQualityData.timestamp > LQE_CONFIG.CACHE_REFRESH_THRESHOLD_MS) {
        getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
          if (jrResult && jrResult.quality && jrResult.quality !== 'NO') {
            saveQualityCache(cacheKey, {
              quality_code: jrResult.quality,
              full_label: jrResult.full_label
            }, cardId);
            if (document.body.contains(cardElement)) {
              updateCardListQualityElement(cardView, jrResult.quality, jrResult.full_label);
            }
          }
        });
      }
      return;
    }
    
    getBestReleaseFromJacred(normalizedCard, cardId, function(jrResult) {
      if (!document.body.contains(cardElement)) return;
      var qualityCode = (jrResult && jrResult.quality) || null;
      var fullTorrentTitle = (jrResult && jrResult.full_label) || null;
      if (qualityCode && qualityCode !== 'NO') {
        saveQualityCache(cacheKey, {
          quality_code: qualityCode,
          full_label: fullTorrentTitle
        }, cardId);
        updateCardListQualityElement(cardView, qualityCode, fullTorrentTitle);
      }
    });
  }
  
  var observer = new MutationObserver(function(mutations) {
    var newCards = [];
    for (var m = 0; m < mutations.length; m++) {
      var mutation = mutations[m];
      if (mutation.addedNodes) {
        for (var j = 0; j < mutation.addedNodes.length; j++) {
          var node = mutation.addedNodes[j];
          if (node.nodeType !== 1) continue;
          if (node.classList && node.classList.contains('card')) {
            newCards.push(node);
          }
          var nestedCards = node.querySelectorAll('.card');
          for (var k = 0; k < nestedCards.length; k++) {
            newCards.push(nestedCards[k]);
          }
        }
      }
    }
    if (newCards.length) {
      newCards.forEach(updateCardListQuality);
    }
  });
  
  function initializeLampaQualityPlugin() {
    window.lampaQualityPlugin = true;
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    Lampa.Listener.follow('full', function(event) {
      if (event.type == 'complite') {
        var renderElement = event.object.activity.render();
        processFullCardQuality(event.data.movie, renderElement);
      }
    });
  }
  
  if (!window.lampaQualityPlugin) {
    initializeLampaQualityPlugin();
  }
})();

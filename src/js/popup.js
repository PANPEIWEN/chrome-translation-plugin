document.addEventListener('DOMContentLoaded', () => {
const inputText = document.getElementById('inputText');
  const translateBtn = document.getElementById('translateBtn');
  const sourceLang = document.getElementById('sourceLang');
  const targetLang = document.getElementById('targetLang');
  const outputArea = document.getElementById('outputArea');
  const swapBtn = document.getElementById('swapBtn');
  const charCount = document.getElementById('charCount');
  const sourceAudioBtn = document.getElementById('sourceAudioBtn');
  const sourcePhonetic = document.getElementById('sourcePhonetic');
  const targetPhonetic = document.getElementById('targetPhonetic');

  // History elements
  const historyBtn = document.getElementById('historyBtn');
  const historyPanel = document.getElementById('historyPanel');
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const historySearch = document.getElementById('historySearch');
  const historyList = document.getElementById('historyList');

  // History storage key
  const HISTORY_KEY = 'translation_history';
  const MAX_HISTORY = 100;

  // Load history from storage
  function loadHistory() {
    const history = localStorage.getItem(HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  }

  // Save history to storage
  function saveHistory(history) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  // Add translation to history
  function addToHistory(sourceText, translatedText, sourceLangCode, targetLangCode) {
    const history = loadHistory();
    const entry = {
      id: Date.now(),
      source: sourceText,
      target: translatedText,
      sourceLang: sourceLangCode,
      targetLang: targetLangCode,
      timestamp: new Date().toISOString()
    };
    
    // Remove duplicate if exists
    const existingIndex = history.findIndex(h => h.source === sourceText && h.targetLang === targetLangCode);
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1);
    }
    
    // Add to beginning
    history.unshift(entry);
    
    // Limit history size
    if (history.length > MAX_HISTORY) {
      history.pop();
    }
    
    saveHistory(history);
  }

  // Format relative time
  function formatRelativeTime(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  }

  // Get language display name
  function getLangName(code) {
    const names = {
      'auto': 'Auto',
      'en': 'EN',
      'zh-CN': 'ZH',
      'ja': 'JA',
      'ko': 'KO',
      'fr': 'FR',
      'es': 'ES',
      'de': 'DE',
      'ru': 'RU'
    };
    return names[code] || code;
  }

  // Render history list
  function renderHistory(searchQuery = '') {
    const history = loadHistory();
    const filteredHistory = searchQuery 
      ? history.filter(h => 
          h.source.toLowerCase().includes(searchQuery.toLowerCase()) || 
          h.target.toLowerCase().includes(searchQuery.toLowerCase()))
      : history;

    if (filteredHistory.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span>${searchQuery ? 'No results found' : 'No translation history yet'}</span>
        </div>
      `;
      return;
    }

    historyList.innerHTML = filteredHistory.map(item => `
      <div class="history-item" data-id="${item.id}">
        <div class="history-item-header">
          <span class="history-item-langs">${getLangName(item.sourceLang)} → ${getLangName(item.targetLang)}</span>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="history-item-time">${formatRelativeTime(item.timestamp)}</span>
            <button class="history-item-delete" data-id="${item.id}" title="Delete">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        <div class="history-item-source">${escapeHtml(item.source)}</div>
        <div class="history-item-target">${escapeHtml(item.target)}</div>
      </div>
    `).join('');

    // Add click handlers for history items
    historyList.querySelectorAll('.history-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.history-item-delete')) return;
        const id = parseInt(item.dataset.id);
        const entry = history.find(h => h.id === id);
        if (entry) {
          inputText.value = entry.source;
          sourceLang.value = entry.sourceLang;
          targetLang.value = entry.targetLang;
          charCount.textContent = `${entry.source.length} / 5000`;
          historyPanel.classList.add('hidden');
          performTranslation();
        }
      });
    });

    // Add delete handlers
    historyList.querySelectorAll('.history-item-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        deleteHistoryItem(id);
      });
    });
  }

  // Delete single history item
  function deleteHistoryItem(id) {
    const history = loadHistory();
    const newHistory = history.filter(h => h.id !== id);
    saveHistory(newHistory);
    renderHistory(historySearch.value);
  }

  // Escape HTML
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // History button click
  historyBtn.addEventListener('click', () => {
    historyPanel.classList.remove('hidden');
    historySearch.value = '';
    renderHistory();
    historySearch.focus();
  });

  // Close history panel
  closeHistoryBtn.addEventListener('click', () => {
    historyPanel.classList.add('hidden');
  });

  // Clear all history
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Clear all translation history?')) {
      localStorage.removeItem(HISTORY_KEY);
      renderHistory();
    }
  });

  // Search history
  historySearch.addEventListener('input', () => {
    renderHistory(historySearch.value);
  });

  // Close history with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !historyPanel.classList.contains('hidden')) {
      historyPanel.classList.add('hidden');
    }
  });

  // Char Count
  inputText.addEventListener('input', () => {
    charCount.textContent = `${inputText.value.length} / 5000`;
  });

  // Enter to translate
  inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      performTranslation();
    }
  });

// Swap
  swapBtn.addEventListener('click', () => {
    const originalSource = sourceLang.value;
    const originalTarget = targetLang.value;
    sourceLang.value = originalTarget;
    // Handle 'auto' cases if necessary, though explicit switching handles most
    targetLang.value = originalSource === 'auto' ? 'en' : originalSource;

    if (outputArea.innerText && inputText.value) {
        // Swap text logic
        const currentOutput = outputArea.innerText.split('\n')[0]; // Simple grab
        inputText.value = currentOutput;
        outputArea.innerHTML = '';
        setTimeout(performTranslation, 100);
    }
  });

  // Audio Playback
  function playAudio(text, lang) {
    if (!text) return;
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob`;
    const audio = new Audio(url);
    audio.play().catch(e => console.error("Audio playback failed", e));
  }

sourceAudioBtn.addEventListener('click', () => {
    playAudio(inputText.value, sourceLang.value === 'auto' ? 'en' : sourceLang.value);
  });

  // Main Translation
  translateBtn.addEventListener('click', performTranslation);

  function performTranslation() {
    const text = inputText.value.trim();
    if (!text) return;

    translateBtn.textContent = '...';
    translateBtn.disabled = true;
    outputArea.style.opacity = '0.5';
    outputArea.innerHTML = ''; 

    const sl = sourceLang.value;
    const tl = targetLang.value;
    
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(text)}`;

fetch(url)
      .then(response => response.json())
      .then(data => {
        // Check if source and target language are the same
        const detectedLang = data[2] || sl; // data[2] contains detected source language
        let actualTl = tl;
        
        // If detected language is the same as target language, switch target
        if (detectedLang === tl || (tl === 'auto' && detectedLang === sl)) {
          // Determine if input is Chinese or English, then switch accordingly
          const isChinese = /^zh/.test(detectedLang); // zh, zh-CN, zh-TW
          const isEnglish = detectedLang === 'en';
          
          if (isChinese) {
            actualTl = 'en'; // Chinese input -> English output
            targetLang.value = 'en';
          } else if (isEnglish) {
            actualTl = 'zh-CN'; // English input -> Chinese output
            targetLang.value = 'zh-CN';
          } else {
            // For other languages, default to English
            actualTl = 'en';
            targetLang.value = 'en';
          }
          
          // Re-fetch with new target language
          const newUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${actualTl}&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(text)}`;
          return fetch(newUrl).then(res => res.json()).then(newData => {
            return { data: newData, tl: actualTl };
          });
        }
        
        return { data, tl: actualTl };
      })
      .then(result => {
        const data = result.data;
        const tl = result.tl;
        
        let translatedText = '';
        let srcPhoneticText = '';
        let tgtPhoneticText = '';

        if (data[0] && data[0].length > 0) {
          data[0].forEach(item => {
            if (item[0]) translatedText += item[0];
          });
          
          if (data[0].length > 0) {
             data[0].forEach(segment => {
               if (segment[2]) tgtPhoneticText = segment[2];
               if (segment[3]) srcPhoneticText = segment[3];
             });
          }
        }

// Tighter HTML structure with audio and copy buttons
        const mainAudioIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
        const mainCopyIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        const mainCheckIcon = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34a853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        
        let finalHtml = `<div class="main-result-row" style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 6px; padding: 4px 0; width: 100%;">`;
        finalHtml += `<div style="flex-shrink: 1; min-width: 0;">`;   
        finalHtml += `<div style="line-height: 1.4; font-size: 18px;">${translatedText}</div>`;
        // Always add a placeholder for main phonetic, will be filled async
        finalHtml += `<div id="mainPhonetic" class="phonetic" style="margin-top: 2px; color: #5f6368; font-family: 'Times New Roman', serif; font-style: italic;">${tgtPhoneticText || ''}</div>`;
        finalHtml += `</div>`;
        finalHtml += `<div style="display: flex; align-items: center; flex-shrink: 0; gap: 4px;">`;
        finalHtml += `<button id="mainAudioBtn" class="icon-btn" style="background: none; border: none; cursor: pointer; padding: 4px; color: #5f6368; display: flex; align-items: center; justify-content: center;" title="Listen">${mainAudioIcon}</button>`;
        finalHtml += `<button id="mainCopyBtn" class="icon-btn" style="background: none; border: none; cursor: pointer; padding: 4px; color: #5f6368; display: flex; align-items: center; justify-content: center;" title="Copy">${mainCopyIcon}</button>`;
        finalHtml += `</div>`;
        finalHtml += `</div>`;
        
        sourcePhonetic.textContent = srcPhoneticText || '';

        // Dictionary - each word on separate line with pinyin, audio and copy button
        if (data[1] && data[1].length > 0) {
          // SVG icons
          const copyIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
          const audioIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
          
          let dictHtml = '<div class="dictionary-content" style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 8px; text-align: left; width: 100%;">';
          
          // Collect all terms to fetch pinyin
          const allTerms = [];
          data[1].forEach(entry => {
            entry[1].slice(0, 10).forEach(term => allTerms.push(term));
          });
          
          data[1].forEach(entry => {
            const partOfSpeech = entry[0];
            const terms = entry[1];
            const termDetails = entry[2] || [];
            
            // Part of speech header
            dictHtml += `<div class="pos-header" style="font-weight: bold; color: #4285f4; font-style: italic; margin-top: 8px; margin-bottom: 4px;">${partOfSpeech}</div>`;
            
            // Each term on separate line
            terms.slice(0, 10).forEach((term, index) => {
              // Get source word(s) for this term
              let sourceWords = '';
              if (termDetails[index] && termDetails[index][1] && termDetails[index][1].length > 0) {
                sourceWords = termDetails[index][1].join(', ');
              }
              
              dictHtml += `<div class="term-row" style="display: flex; align-items: center; margin-bottom: 6px; padding: 4px 0; border-bottom: 1px solid #f0f0f0;">`;
              dictHtml += `<div style="flex: 1;">`;
              dictHtml += `<span class="term-word" style="font-size: 14px; color: #202124; font-weight: 500;">${term}</span>`;
              // Placeholder for pinyin (will be filled by async request)
              dictHtml += `<span class="term-pinyin" data-term="${term}" style="font-size: 12px; color: #70757a; font-style: italic; margin-left: 6px;"></span>`;
              if (sourceWords) {
                dictHtml += `<span class="term-source" style="font-size: 12px; color: #5f6368; margin-left: 8px;">(${sourceWords})</span>`;
              }
              dictHtml += `</div>`;
              // Audio button
              dictHtml += `<button class="audio-term-btn" data-term="${term}" data-lang="${tl}" style="background: none; border: none; cursor: pointer; padding: 4px; color: #5f6368; display: flex; align-items: center; justify-content: center;" title="Play">${audioIconSvg}</button>`;
              // Copy button
              dictHtml += `<button class="copy-term-btn" data-term="${term}" style="background: none; border: none; cursor: pointer; padding: 4px; color: #5f6368; display: flex; align-items: center; justify-content: center;" title="Copy">${copyIconSvg}</button>`;
              dictHtml += `</div>`;
            });
          });
          dictHtml += '</div>';
          
          finalHtml += dictHtml;
          
          // Fetch pinyin for all terms asynchronously
          setTimeout(() => {
            allTerms.forEach(term => {
              const pinyinUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${tl}&tl=en&dt=rm&q=${encodeURIComponent(term)}`;
              fetch(pinyinUrl)
                .then(res => res.json())
                .then(pData => {
                  // pData[0][0][3] contains the romanization/pinyin
                  let pinyin = '';
                  if (pData[0] && pData[0][0] && pData[0][0][3]) {
                    pinyin = pData[0][0][3];
                  }
                  // Update the pinyin span
                  const pinyinSpan = document.querySelector(`.term-pinyin[data-term="${term}"]`);
                  if (pinyinSpan && pinyin) {
                    pinyinSpan.textContent = `/${pinyin}/`;
                  }
                })
                .catch(err => console.error('Pinyin fetch error:', err));
            });
          }, 100);
        }

outputArea.innerHTML = finalHtml;

        // Save to history
        addToHistory(text, translatedText, sl, tl);

        // Async fetch phonetic for main translated text if not already present
        if (!tgtPhoneticText && translatedText) {
          const mainPhoneticUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${tl}&tl=en&dt=rm&q=${encodeURIComponent(translatedText)}`;
          fetch(mainPhoneticUrl)
            .then(res => res.json())
            .then(pData => {
              let phonetic = '';
              if (pData[0] && pData[0][0] && pData[0][0][3]) {
                phonetic = pData[0][0][3];
              }
              const mainPhoneticEl = document.getElementById('mainPhonetic');
              if (mainPhoneticEl && phonetic) {
                mainPhoneticEl.textContent = phonetic;
              }
            })
            .catch(err => console.error('Main phonetic fetch error:', err));
        }

        // Add click handlers for main audio and copy buttons
        const mainAudioBtnEl = document.getElementById('mainAudioBtn');
        const mainCopyBtnEl = document.getElementById('mainCopyBtn');
        
        if (mainAudioBtnEl) {
          mainAudioBtnEl.addEventListener('click', () => {
            playAudio(translatedText, tl);
          });
        }
        
        if (mainCopyBtnEl) {
          mainCopyBtnEl.addEventListener('click', () => {
            navigator.clipboard.writeText(translatedText).then(() => {
              mainCopyBtnEl.innerHTML = mainCheckIcon;
              setTimeout(() => { mainCopyBtnEl.innerHTML = mainCopyIcon; }, 1000);
            });
          });
        }

        // Add click handlers for individual copy buttons
        const copyIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;
        const checkIconSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34a853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        
        outputArea.querySelectorAll('.copy-term-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const term = btn.getAttribute('data-term');
            navigator.clipboard.writeText(term).then(() => {
              btn.innerHTML = checkIconSvg;
              setTimeout(() => { btn.innerHTML = copyIconSvg; }, 1000);
            });
          });
        });

        // Add click handlers for audio buttons
        outputArea.querySelectorAll('.audio-term-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const term = btn.getAttribute('data-term');
            const lang = btn.getAttribute('data-lang');
            playAudio(term, lang);
          });
        });

      })
      .catch(error => {
        console.error(error);
        outputArea.textContent = "Error during translation.";
      })
      .finally(() => {
        translateBtn.textContent = 'Translate';
        translateBtn.disabled = false;
        outputArea.style.opacity = '1';
      });
  }
});
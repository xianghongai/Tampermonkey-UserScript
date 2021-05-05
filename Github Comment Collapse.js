// ==UserScript==
// @name         Github Comment Collapse
// @namespace    https://github.com/xianghongai/Tampermonkey-UserScript
// @version      0.0.1
// @description  Github Comment 展开折叠
// @author       Nicholas Hsiang
// @icon         https://xinlu.ink/favicon.ico
// @match        https://*.github.com/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  // .timeline-comment-header
  // .edit-comment-hide
  // .js-discussion
  // .d-inline-block
  // <svg t="1620193282766" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3081" width="200" height="200"><path d="M512 714.666667c-8.533333 0-17.066667-2.133333-23.466667-8.533334l-341.333333-341.333333c-12.8-12.8-12.8-32 0-44.8 12.8-12.8 32-12.8 44.8 0l320 317.866667 317.866667-320c12.8-12.8 32-12.8 44.8 0 12.8 12.8 12.8 32 0 44.8L533.333333 704c-4.266667 8.533333-12.8 10.666667-21.333333 10.666667z" p-id="3082"></path></svg>
  // <svg t="1620193291726" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3218" width="200" height="200"><path d="M904.533333 311.466667c-17.066667-17.066667-42.666667-17.066667-59.733333 0L512 644.266667 179.2 311.466667c-17.066667-17.066667-42.666667-17.066667-59.733333 0-17.066667 17.066667-17.066667 42.666667 0 59.733333l362.666666 362.666667c8.533333 8.533333 19.2 12.8 29.866667 12.8s21.333333-4.266667 29.866667-12.8l362.666666-362.666667c17.066667-17.066667 17.066667-42.666667 0-59.733333z" p-id="3219"></path></svg>

  // 定时器，直到目标 DOM 出来结束
  let interval = null;

  interval = setInterval(ready, 3000);

  // 页面准备就绪
  function ready() {
    const actions = document.querySelector(
      '.timeline-comment-header .timeline-comment-actions'
    );

    if (actions) {
      clearInterval(interval);
      init();
    }
  }

  function init() {
    header();
  }

  // 生成元素
  function icon(element) {
    const template = `<svg t="1620193291726" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3218" width="200" height="200"><path d="M904.533333 311.466667c-17.066667-17.066667-42.666667-17.066667-59.733333 0L512 644.266667 179.2 311.466667c-17.066667-17.066667-42.666667-17.066667-59.733333 0-17.066667 17.066667-17.066667 42.666667 0 59.733333l362.666666 362.666667c8.533333 8.533333 19.2 12.8 29.866667 12.8s21.333333-4.266667 29.866667-12.8l362.666666-362.666667c17.066667-17.066667 17.066667-42.666667 0-59.733333z" p-id="3219"></path></svg>`;
  }

  // 向目标插入元素
  function header() {}

  // 绑定事件
  function on() {}

  // 执行操作
  function collapse() {}

  // #region COMMON
  function hasClass(el, className) {
    if (el.classList) {
      return el.classList.contains(className);
    } else {
      return !!el.className.match(
        new RegExp('(\\s|^)' + className + '(\\s|$)')
      );
    }
  }

  function getParents(elem, selector) {
    // Get the closest matching element
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  }
  // #endregion COMMON
})();

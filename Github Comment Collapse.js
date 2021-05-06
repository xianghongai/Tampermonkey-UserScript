// ==UserScript==
// @name         Github Comment Collapse
// @namespace    https://github.com/xianghongai/Tampermonkey-UserScript
// @version      0.0.1
// @description  Github Comment 展开折叠
// @author       Nicholas Hsiang
// @icon         https://xinlu.ink/favicon.ico
// @match        https://*.github.com/*
// @grant        GM_addStyle
// @grant        GM_addElement
// ==/UserScript==

// GM_addStyle(".x-timeline-comment-action { position: relative; float: right; padding: 8px 4px; width: 16px; height: 16px; margin-left: 4px; cursor: pointer; }");
// GM_addStyle(".x-timeline-comment-action__icon { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); transition: transform .2s; vertical-align: text-bottom; }");
// GM_addStyle(".x-timeline-comment--active .x-timeline-comment-action__icon { transform: translate(-50%, -50%) rotate(-90deg); }");
// GM_addStyle(".edit-comment-hide { transition: all .2s; }");
// GM_addStyle(".x-timeline-comment--active .edit-comment-hide { height: 0 !important; overflow: hidden; opacity: 0.2; }");

(function () {
  'use strict';

  // 定时器，直到目标 DOM 出来结束
  let interval = null;

  interval = setInterval(ready, 2000);

  // 页面准备就绪
  function ready() {
    const actions = document.querySelector('.timeline-comment-header .timeline-comment-actions');

    if (actions) {
      clearInterval(interval);
      init();
    }
  }

  // 初始
  function init() {
    style(); /* CSP!!! */
    header();
    height();
    on();
  }

  // 生成样式表
  // Content Security Policy: The page’s settings blocked the loading of a resource at inline (“script-src”).
  function style() {
    const style = `
    .x-timeline-comment-action { position: relative; float: right; padding: 8px 4px; width: 16px; height: 16px; margin-left: 4px; cursor: pointer; }
    .x-timeline-comment-action__icon { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); transition: transform .2s; vertical-align: text-bottom; }
    .x-timeline-comment--active .x-timeline-comment-action__icon { transform: translate(-50%, -50%) rotate(-90deg); }
    .edit-comment-hide { transition: all .2s; }
    .x-timeline-comment--active .edit-comment-hide { height: 0 !important; overflow: hidden; opacity: 0.2; }
    `;
    const headEle = document.head || document.getElementsByTagName("head")[0];
    const styleEle = document.createElement("style");
    styleEle.type = "text/css";
    if (styleEle.styleSheet) {
      styleEle.styleSheet.cssText = style;
    } else {
      styleEle.appendChild(document.createTextNode(style));
    }
    headEle.appendChild(styleEle);
  }

  // 生成元素
  function icon(element) {
    const template = `<svg t="1620193291726" class="x-timeline-comment-action__icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3218" width="16" height="16"><path d="M904.533333 311.466667c-17.066667-17.066667-42.666667-17.066667-59.733333 0L512 644.266667 179.2 311.466667c-17.066667-17.066667-42.666667-17.066667-59.733333 0-17.066667 17.066667-17.066667 42.666667 0 59.733333l362.666666 362.666667c8.533333 8.533333 19.2 12.8 29.866667 12.8s21.333333-4.266667 29.866667-12.8l362.666666-362.666667c17.066667-17.066667 17.066667-42.666667 0-59.733333z" p-id="3219"></path></svg>`;
    const ele = document.createElement('i');
    ele.classList.add('x-timeline-comment-action');
    ele.innerHTML = template;
    element.prepend(ele);
    /* Content Security Policy: The page’s settings blocked the loading of a resource at inline (“script-src”). */
    // const ele = GM_addElement(element, 'i', { class: 'x-timeline-comment-action' });
    // ele.innerHTML = template;
  }

  // 向目标插入元素
  function header() {
    const headerEl = document.querySelectorAll('.timeline-comment-header');
    headerEl.forEach((item) => {
      icon(item);
    });
  }

  // 设定内容区高度，为了过渡效果
  function height() {
    const items = document.querySelectorAll('.edit-comment-hide');
    items.forEach((item) => {
      const { height = 'auto' } = item?.getBoundingClientRect();
      item.style.height = `${height}px`;
    });
  }

  // 绑定事件
  function on() {
    document.addEventListener('click', listener);
  }

  function listener(event) {
    const theTarget = event.target;
    // collapse
    collapse(theTarget);
    // others
  }

  // 执行 collapse 操作
  function collapse(target) {
    const parent = getParents(target, '.timeline-comment');
    if (parent) {
      parent.classList.toggle('x-timeline-comment--active')
    }
  }

  // #region COMMON
  function getParents(elem, selector) {
    // Get the closest matching element
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  }
  // #endregion COMMON
})();

// ==UserScript==
// @name         Disable Jira 'Click to Edit'
// @namespace    https://xianghongai.github.io/
// @version      1.0.0
// @description  禁用 Jira 点击编辑
// @author       Nicholas Hsiang
// @icon         https://xinlu.ink/favicon.ico
// @match        *://jira.*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  function main() {
    // 内容区
    const userContentBlockEl = document.querySelector('.user-content-block');

    userContentBlockEl.addEventListener(
      'click',
      (event) => {
        event.preventDefault();
        event.stopPropagation();

        return false;
      },
    );

    // 可编辑字段
    const $body = document.querySelector('body');

    $body.addEventListener(
      'click',
      (event) => {
        const targetEle = event.target;
        const targetEleParent = getParents(targetEle, '.editable-field:not(#description-val)');
        if (
          (targetEleParent && hasClass(targetEleParent, '.inactive')) ||
          (hasClass(targetEle, 'editable-field') && hasClass(targetEle, 'inactive'))
        ) {
          event.preventDefault();
          event.stopPropagation();

          return false;
        }
      },
      true
    );
  }

  main();

  // #region COMMON
  function hasClass(el, className) {
    if (el.classList) {
      return el.classList.contains(className);
    }
    return !!el.className.match(
      new RegExp('(\\s|^)' + className + '(\\s|$)')
    );
  }

  function getParents(elem, selector) {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  }
  // #endregion
})();

// ==UserScript==
// @name         Jira Description disable 'click to Edit'
// @namespace    https://github.com/xianghongai/Tampermonkey-UserScript
// @version      0.0.1
// @description  禁用点击编辑
// @author       Nicholas Hsiang
// @icon         https://xinlu.ink/favicon.ico
// @match        http*://jira.*.com/*
// @grant        none
// ==/UserScript==

(function() {
  "use strict";

  // #region COMMON
  function hasClass(el, className) {
    if (el.classList) {
      return el.classList.contains(className);
    } else {
      return !!el.className.match(new RegExp("(\\s|^)" + className + "(\\s|$)"));
    }
  }

  function getParents(elem, selector) {
    // Element.matches() polyfill
    if (!Element.prototype.matches) {
      Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function(s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
            i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {}
          return i > -1;
        };
    }

    // Get the closest matching element
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  }
  // #endregion

  const $body = document.querySelector("body");

  $body.addEventListener(
    "click",
    event => {
      const targetEle = event.target;
      // img
      // a
      if (["a", "img"].includes(targetEle.tagName.toLowerCase())) {
        return true;
      }

      // other
      if (getParents(targetEle, ".user-content-block") || hasClass(targetEle, "user-content-block")) {
        event.preventDefault();
        event.stopPropagation();

        return false;
      }
    },
    true
  );
})();

// ==UserScript==
// @name         Hold Ctrl + Alt or Alt click on text, copy it
// @name:zh-CN   按住 Ctrl + Alt 或 Alt 键点击文本，复制
// @namespace    https://github.com/xianghongai/Tampermonkey-UserScript
// @version      1.0.0
// @description  Hold Ctrl + Alt or Alt click on text, Copy as plain text.
// @description:zh-CN   按住 Ctrl + Alt 或 Alt 键点击文本，复制为纯文本。
// @author       Nicholas Hsiang
// @icon         https://xinlu.ink/favicon.ico
// @match        http*://*/*
// @grant        none
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  function wrapperMsg(input) {
    const prefix = `__Tampermonkey® (Hold Ctrl + Alt or Alt click on text, copy it)__: `;
    return `${prefix}${input}`;
  }

  function fallbackCopyTextToClipboard(text) {
    let textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log(wrapperMsg('Copying text command was ' + msg));
    } catch (err) {
      console.error(wrapperMsg('Oops, unable to copy'), err);
    }

    document.body.removeChild(textArea);
  }

  function copyTextToClipboard(text) {
    if (!navigator.clipboard) {
      fallbackCopyTextToClipboard(text);
      return;
    }
    navigator.clipboard.writeText(text).then(
      function () {
        console.log(wrapperMsg('Copying to clipboard was successful!'));
      },
      function (err) {
        console.error(wrapperMsg('Could not copy text: '), err);
      }
    );
  }

  function listener(event) {
    if ((event.ctrlKey && event.altKey) || event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      const text = event.target.innerText;
      copyTextToClipboard(text);
      return false;
    }
  }
})();

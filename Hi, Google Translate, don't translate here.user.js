// ==UserScript==
// @name         Hi, Google Translate, don't translate here (*)
// @name:zh-CN   Hi, 谷歌翻译，不要翻译代码块 (*)
// @namespace    https://github.com/xianghongai/Tampermonkey-UserScript
// @version      0.0.1
// @description  Google Translate, don't translate code
// @description:zh-CN   谷歌翻译不翻译代码块
// @author       Nicholas Hsiang
// @icon         https://xinlu.ink/favicon.ico
// @match        http*://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  const preEles = [
    ...document.querySelectorAll("pre"),
    ...document.querySelectorAll("code"),
    ...document.querySelectorAll(".graf--figure.graf--iframe"),
    ...document.querySelectorAll("emu-xref"),
    ...document.querySelectorAll("a.type"), // Node.js
  ];

  if (Array.isArray(preEles)) {
    preEles.forEach((tiem) => {
      tiem.classList.add("notranslate");
      tiem.setAttribute("translate", "no");
    });
  }
})();

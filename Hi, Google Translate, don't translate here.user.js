// ==UserScript==
// @name         Hi, Google Translate, don't translate here (*)
// @name:zh-CN   Hi, 谷歌翻译，不要翻译代码块 (*)
// @namespace    https://github.com/xianghongai/Tampermonkey-UserScript
// @version      0.0.2
// @description  Google Translate, don't translate code
// @description:zh-CN   谷歌翻译不翻译代码块
// @author       Nicholas Hsiang
// @icon         https://xinlu.ink/favicon.ico
// @match        http*://*/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";
  console.log(GM_info.script.name);

  const toolboxCls = "google-translate__no";

  function handleEvent() {
    const preEles = [
      ...document.querySelectorAll("pre"),
      ...document.querySelectorAll("code"),
      ...document.querySelectorAll(".prism-code"), // https://formatjs.io
      ...document.querySelectorAll("a.type"), // https://nodejs.org
    ];

    if (Array.isArray(preEles)) {
      preEles.forEach((tiem) => {
        tiem.classList.add("notranslate");
        tiem.setAttribute("translate", "no");
      });
    }
  }

  function createStyleSheet() {
    const style = `.${toolboxCls} { position: fixed; right: 10px; bottom: 10px; z-index: 999; cursor: pointer; margin: 0; padding: 0; width: 18px; height: 18px; line-height: 18px; text-align: center; }`;
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

  function createElement() {
    const icon = `<svg t="1596095144953" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2003"><path d="M549.12 642.986667l-108.373333-107.093334 1.28-1.28A747.52 747.52 0 0 0 600.32 256H725.333333V170.666667h-298.666666V85.333333H341.333333v85.333334H42.666667v85.333333h476.586666C490.666667 337.92 445.44 416 384 484.266667 344.32 440.32 311.466667 392.106667 285.44 341.333333h-85.333333c31.146667 69.546667 73.813333 135.253333 127.146666 194.56l-217.173333 214.186667L170.666667 810.666667l213.333333-213.333334 132.693333 132.693334 32.426667-87.04M789.333333 426.666667h-85.333333L512 938.666667h85.333333l47.786667-128h202.666667L896 938.666667h85.333333l-192-512m-111.786666 298.666666l69.12-184.746666L815.786667 725.333333h-138.24z" p-id="2004"></path></svg>`;
    const bodyContainer = document.querySelector("body");
    const ele = document.createElement("span");

    ele.setAttribute("title", `Hi, Google Translate, don't translate here`);
    ele.classList.add(`${toolboxCls}`);

    // const text = document.createTextNode(`don't translate code`);
    // ele.appendChild(text);

    ele.innerHTML = icon;
    bodyContainer.appendChild(ele);
  }

  // 有的站点不生效，需要手动触发
  function addEvent() {
    const ele = document.querySelector(`.${toolboxCls}`);

    ele.addEventListener("click", () => {
      handleEvent();
    });
  }

  createStyleSheet();
  createElement();
  addEvent();
  handleEvent();
})();

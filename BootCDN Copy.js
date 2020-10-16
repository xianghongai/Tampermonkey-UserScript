// ==UserScript==
// @name         BootCDN Copy All 💪!!!
// @name:zh-CN   复制 BootCDN 中的所有链接
// @namespace    https://github.com/xianghongai/Tampermonkey-UserScript
// @version      0.0.1
// @description  复制 BootCDN 中的所有链接
// @description:zh-CN   复制 BootCDN 中的所有链接
// @author       Nicholas Hsiang
// @icon         https://xinlu.ink/favicon.ico
// @match        https://www.bootcdn.cn/*
// @grant        none
// @require      https://cdn.bootcdn.net/ajax/libs/clipboard.js/2.0.6/clipboard.min.js
// ==/UserScript==

(function () {
  "use strict";

  const toolboxCls = "x-bootcdn__toolbox";

  function handleEvent() {
    const urls = document.querySelectorAll(".library-url");

    let str = "";
    urls.forEach((url) => (str += `${url.textContent}\n`));

    var clipboard = new ClipboardJS(`.${toolboxCls}`, {
      text: function () {
        return str;
      },
    });
  }

  function createStyleSheet() {
    const style = `.${toolboxCls} { position: fixed; right: 10px; top: 10px; z-index: 9999; cursor: pointer; margin: 0; padding: 0; width: 18px; height: 18px; line-height: 18px; text-align: center; }`;
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
    const icon = `<svg t="1602847820538" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3119"><path d="M427.128 342.177c84.606 2.554 153.304 35.534 204.927 102.458 10.839 14.052 12.112 29.809 4.017 45.526-8.02 15.572-21.559 23.266-39.048 22.906-13.56-0.279-24.578-6.25-32.88-17.127-25.387-33.264-58.282-55.356-99.281-63.93-59.423-12.428-112.076 2.069-155.753 44.328-43.524 42.111-86.017 85.296-128.57 128.398-30.629 31.025-46.635 68.846-48.129 112.342-1.684 49.014 14.838 91.523 49.388 126.285 34.415 34.626 76.638 51.492 125.497 50.206 45.6-1.201 84.534-18.571 116.798-50.842 22.824-22.829 45.603-45.703 68.499-68.46 12.423-12.348 27.355-16.301 43.975-10.93 16.677 5.39 26.413 17.426 28.947 34.781 1.883 12.896-1.425 24.824-10.587 34.057-28.24 28.457-55.905 57.599-85.644 84.423-40.05 36.125-88.077 55.889-141.828 60.966C221.33 987.591 122.742 933.268 74.215 838.35c-49.339-96.506-30.261-217.761 46.31-294.334 42.476-42.476 84.748-85.158 127.486-127.369 41.882-41.366 92.267-65.537 150.825-72.306 9.564-1.105 19.211-1.487 28.292-2.164z" p-id="3120"></path><path d="M599.009 684.178C514.58 681.57 446.04 648.63 394.457 581.957c-10.981-14.194-12.343-30.082-4.074-45.948 8.088-15.52 21.675-23.146 39.16-22.718 13.16 0.322 24.107 5.95 32.166 16.513 27.883 36.548 64.27 59.432 109.742 66.453 55.248 8.53 104.224-6.182 144.472-44.972 44.556-42.942 87.986-87.067 131.369-131.206 25.978-26.431 40.989-58.685 45.386-95.52 6.111-51.198-7.684-96.653-42.037-135.088-65.664-73.468-178.013-76.157-247.719-6.523-23.303 23.279-46.755 46.409-70.132 69.613-16.785 16.661-43.429 16.892-60.185 0.509-16.601-16.232-17.07-43.397-0.438-60.182 25.522-25.758 50.94-51.65 77.278-76.56 39.323-37.191 86.214-59.631 139.947-66.381 79.336-9.968 149.226 11.894 208.222 65.929 44.098 40.389 70.774 90.823 78.801 150.126 11.442 84.538-13.116 157.743-72.983 218.608-41.183 41.869-82.83 83.286-124.565 124.606-42.088 41.669-92.675 66.076-151.601 72.825-9.564 1.094-19.209 1.47-28.257 2.137z" p-id="3121"></path></svg>`;
    const bodyContainer = document.querySelector("body");
    const ele = document.createElement("span");

    ele.setAttribute("title", `Copy All Link`);
    ele.classList.add(toolboxCls);
    ele.innerHTML = icon;
    bodyContainer.appendChild(ele);
  }

  createStyleSheet();
  createElement();
  handleEvent();
})();

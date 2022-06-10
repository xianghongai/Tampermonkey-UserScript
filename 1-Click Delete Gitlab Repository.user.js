// ==UserScript==
// @name         1-Click Delete Gitlab Repository
// @namespace    https://github.com/xianghongai/Tampermonkey-UserScript
// @version      0.1
// @description  一键删除 Gitlab 仓库，⛔ 权限越大，越不安全！⛔
// @author       Nicholas Hsiang
// @match        https://gitlab.com/*
// @icon         https://xinlu.ink/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
  
    function hasGeneralSettings() {
      const pathname = new URL(window.location.href).pathname.split('/').filter(Boolean).pop();
  
      if (pathname === 'edit') {
        return true;
      }
  
      if (pathname === 'projects') {
        return false;
      }
  
      // 自动跳到 Settings 页面
      if (pathname === 'activity') {
        const href = window.location.href.replace(/\/activity/, '/edit');
        setTimeout(() => {
          window.location.href = href;
        }, 1000);
      }
  
      if (document.querySelector('.project-home-panel')) {
        window.location.href = `${window.location.href}/edit`;
      }
  
      const paths = window.location.href.split('/-/');
  
      if (paths.length > 1) {
        window.location.href = paths[0] + '/edit';
      }
  
      return false;
    }
  
    function expandAdvanced() {
      // prettier-ignore
      const advancedSettingsEle = document.getElementById('js-project-advanced-settings');
      const expandEle = advancedSettingsEle.querySelector('.js-settings-toggle');
      expandEle.click();
    }
  
    function triggerDeleteProject() {
      // prettier-ignore
      const removeTips = document.querySelector('a[href="/help/user/project/settings/index#removing-a-fork-relationship"]');
      const parentNode = getParents(removeTips, '.sub-section');
      parentNode.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => {
        const deleteProjectBtn = parentNode.querySelector('.btn-danger');
        deleteProjectBtn.click();
      }, 1000);
    }
  
    function handleDeleteProject() {
      // prettier-ignore
      const contentEle = document.getElementById('delete-project-modal-2___BV_modal_content_');
      // prettier-ignore
      const confirmText = contentEle.querySelector('.gl-white-space-pre-wrap')?.innerText;
      const confirmInput = document.getElementById('confirm_name_input');
      confirmInput.value = confirmText;
      const event = new Event('change', {
        bubbles: true,
        cancelable: true,
      });
      confirmInput.dispatchEvent(event);
      setTimeout(() => {
        // prettier-ignore
        const removeBtn = contentEle.querySelector('.js-modal-action-primary.btn-danger');
        removeBtn.click();
      }, 500);
    }
  
    function getParents(elem, selector) {
      for (; elem && elem !== document; elem = elem.parentNode) {
        if (elem.matches(selector)) return elem;
      }
  
      return null;
    }
  
    function init() {
      if (!hasGeneralSettings()) {
        return;
      }
  
      const btn = document.createElement('button');
      const text = document.createTextNode('Delete project');
  
      btn.append(text);
      btn.setAttribute('style', 'position: fixed; z-index: 9999; top: 50px; right: 10px;');
      btn.addEventListener('click', () => {
        expandAdvanced();
        triggerDeleteProject();
        setTimeout(() => {
          handleDeleteProject();
        }, 1000);
      });
  
      const body = document.querySelector('body');
      body.append(btn);
    }
  
    init();
  })();
  
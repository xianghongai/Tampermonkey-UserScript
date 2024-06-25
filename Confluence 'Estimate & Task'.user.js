// ==UserScript==
// @name         Confluence 'Estimate & Task'
// @namespace    https://xianghongai.github.io/
// @version      1.0.0
// @description  Confluence 工时评估&任务分解
// @author       Nicholas Hsiang / 山茶树和葡萄树
// @icon         https://xinlu.ink/favicon.ico
// @match        *://jira.*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

(function () {
  'use strict';

  const GONG_SHI = '工时';
  const TOTAL_KEYWORDS = ['总计', '汇总', '合计', '共计', 'Total'];

  // Confluence 页面状态
  const VIEW_TYPE = {
    // 编辑模式
    edit: 'edit',
    // 阅读模式
    view: 'view',
  };

  // 本脚本能力
  const ACTION_TYPE = {
    // 评估工时
    estimate: 'estimate',
    // 分解任务
    task: 'task',
  };

  // Confluence 中表格的结构，在不同页面状态下，有多种可能，目前己知：
  const TABLE_TYPE = {
    // 仅有 tbody
    onlyTbody: 'onlyTbody',
    // 仅有 thead
    onlyThead: 'onlyThead',
    // 有 (多个) thead，有 tbody
    both: 'both',
  };

  insertElement();
  extendStyleHandler();
  messageStyleHandler();

  // 复制文本到剪贴板
  function clipboard(text) {
    GM_setClipboard(text, 'text');
  }

  // 页面状态
  function getViewType() {
    const body = document.body;
    // 检查 body 元素的 className 是否包含 edit 类
    if (body.classList.contains('edit')) {
      // 编辑模式
      return VIEW_TYPE.edit;
    }
    // 阅读模式
    return VIEW_TYPE.view;
  }

  // 获取页面中所有表格
  function getTables() {
    const body = document.body;
    let tables = [];

    const viewType = getViewType();

    switch (viewType) {
      // 编辑模式
      case VIEW_TYPE.edit:
        tables = window.frames[0]?.document.querySelectorAll('table') ?? [];
        break;
      // 阅读模式
      case VIEW_TYPE.view:
        tables = body.querySelectorAll('table');
        break;
    }

    return tables;
  }

  // 获取单元格
  function getCells(part) {
    return part?.querySelectorAll('th, td') ?? [];
  }

  // 获取 tbody 第一行
  function getFirstRow(part) {
    return part?.querySelector('tr');
  }

  // 确定表格类型
  function getTableType(table) {
    const tbody = table?.querySelector('tbody');
    const thead = table?.querySelector('thead');

    let estimateColumnInThead = false;
    let estimateColumnInTbody = false;

    if (thead) {
      estimateColumnInThead = hasEstimateColumn(getCells(getFirstRow(thead)));
    }

    if (tbody) {
      estimateColumnInTbody = hasEstimateColumn(getCells(getFirstRow(tbody)));
    }

    if (tbody && estimateColumnInThead) {
      // 有 tbody 并且有 thead，且 thead 中有"工时"列
      return TABLE_TYPE.both;
    } else if (!thead && estimateColumnInTbody) {
      // 有 tbody 但没有 thead，且 tbody 中有"工时"列
      return TABLE_TYPE.onlyTbody;
    } else if (!tbody && estimateColumnInThead) {
      // 有 thead，且 thead 中有"工时"列，但无 tbody
      return TABLE_TYPE.onlyThead;
    }

    return null;
  }

  // 获取表格的表头
  function getTheadCells(table) {
    const tableType = getTableType(table);
    const tbody = table?.querySelector('tbody');
    const thead = table?.querySelector('thead');
    let cells = [];

    switch (tableType) {
      case TABLE_TYPE.onlyTbody:
        // 取 tbody 第一行所有列
        cells = getCells(getFirstRow(tbody));
        break;
      case TABLE_TYPE.onlyThead:
        // 取 thead 第一行所有列
        cells = getCells(getFirstRow(thead));
        break;
      case TABLE_TYPE.both:
        // 取 thead 第一行所有列
        cells = getCells(getFirstRow(thead));
        break;
    }

    return cells;
  }

  // 获取表格中"任务"行
  function getEstimateRows(table) {
    const tableType = getTableType(table);
    const tbody = table?.querySelector('tbody');
    const thead = table?.querySelector('thead');

    const tbodyRows = tbody?.querySelectorAll('tr') ?? [];
    const theadRows = thead?.querySelectorAll('tr') ?? [];

    // 任务行
    let rows = [];

    switch (tableType) {
      case TABLE_TYPE.onlyTbody:
        // 取 tbody 非第一行所有行
        rows = Array.from(tbodyRows).slice(1);
        break;
      case TABLE_TYPE.onlyThead:
        // 取 thead 非第一行所有行
        rows = Array.from(theadRows).slice(1);
        break;
      case TABLE_TYPE.both:
        // 取 tbody 所有行
        rows = Array.from(tbodyRows);
        break;
    }

    return rows;
  }


  // 单元格文本是否包含‘工时’
  function hasEstimateColumn(cells) {
    return Array.from(cells).some((cell) => cell.textContent.includes(GONG_SHI));
  }

  // 单元格文本包含‘工时’，返回其索引
  function getEstimateColumnIndex(cells) {
    let index = -1;

    // 遍历 theadCells，找到"工时"列的索引
    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i];
      if (cell.textContent.includes(GONG_SHI)) {
        index = i;
        break;
      }
    }

    return index
  }

  function joinCellsText(cells) {
    const textArray = Array.from(cells).map((cell) => cell.textContent.trim());
    return textArray.join(', ');
  }

  function lastRowHandler({ rows, estimateColumnIndex }) {
    const cells = getCells(rows[rows.length - 1]);
    // 最后一行的"工时"单元格
    const lastRowEstimateCell = cells[estimateColumnIndex];

    let cellText = '';

    for (let i = 0; i < estimateColumnIndex; i++) {
      cellText += cells[i].textContent.trim();
    }

    // 最后一行是否是空白行 (工时列之前的单元格都是空白)
    const containsAnyTotal = TOTAL_KEYWORDS.some(keyword => cellText.includes(keyword));
    const hasEmptyLastRow = cellText === '' || containsAnyTotal;

    return {
      hasEmptyLastRow,
      lastRowEstimateCell
    }
  }

  function estimateTable(table) {
    const theadCells = getTheadCells(table);
    if (theadCells.length === 0) return;
    const estimateColumnIndex = getEstimateColumnIndex(theadCells);
    if (estimateColumnIndex === -1) return;
    const rows = getEstimateRows(table);
    const rowsLength = rows.length;

    let totalEstimate = 0;
    // 1. 最后一行"工时"列之前的单元格是空白行，则不参与计算总工时
    // 2. 最后一行"工时"单元格写入总工时
    const { hasEmptyLastRow, lastRowEstimateCell } = lastRowHandler({ rows, estimateColumnIndex });

    rows.forEach((row, index) => {
      if (index === rowsLength - 1 && hasEmptyLastRow) {
        return;
      }

      const cell = getCells(row)[estimateColumnIndex];
      const estimateText = cell?.textContent.trim() ?? '';
      const match = estimateText.match(/^(\d+(\.\d+)?)d$/);

      if (match) {
        totalEstimate += parseFloat(match[1]);
      }
    });

    const viewType = getViewType();

    // 编辑模式下，在最后一行的单元格中写入总工时
    if (viewType === VIEW_TYPE.edit) {
      if (hasEmptyLastRow) {
        lastRowEstimateCell.textContent = `${totalEstimate}d`;
      } else {
        lastRowEstimateCell.textContent = `${lastRowEstimateCell.textContent} /总工时: ${totalEstimate}d`;
      }
    }

    return {
      totalEstimate,
      theadText: joinCellsText(theadCells),
    };
  }

  function estimate() {
    const tables = getTables();
    const result = {};

    Array.from(tables).forEach((table) => {
      const temp = estimateTable(table);
      if (!temp) return;
      const { totalEstimate, theadText } = temp;
      result[theadText] = totalEstimate;
      // console.log(`🚀 Confluence ”Estimate & Task:“ —— 表【${theadText}】 工时评估总计： ${totalEstimate}d`);
      // copyTextToClipboard(`${totalEstimate}d`);
      // return totalEstimate;
    });

    // 如果有多个值，合并输出至控制台
    const keys = Object.keys(result);

    const str = keys.reduce((acc, cur) => {
      if (acc === '') {
        return `表【${cur}】 工时评估总计： ${result[cur]}d`
      } else {
        return `${acc}；\n 表【${cur}】 工时评估总计： ${result[cur]}d`
      }
    }, '');

    // 如果仅有一个值，直接复制到剪贴板
    if (keys.length === 1) {
      const value = `${result[keys[0]]}d`;
      clipboard(value);
      createMessage(`总工时： ${value}`);
    } else {
      createMessage(`总工时：\n ${str}`);
    }

    console.log(str);
  }

  function getElementsUpToIndex(arr, index) {
    // 检查边界条件，确保索引在数组的有效范围内
    if (index < 0) {
      index = 0;
    } else if (index >= arr.length) {
      index = arr.length - 1;
    }

    return arr.slice(0, index + 1);
  }

  function wbsTable(table) {
    const theadCells = getTheadCells(table);
    if (theadCells.length === 0) return;
    const estimateColumnIndex = getEstimateColumnIndex(theadCells);
    if (estimateColumnIndex === -1) return;
    const rows = getEstimateRows(table);
    const rowsLength = rows.length;

    const { hasEmptyLastRow } = lastRowHandler({ rows, estimateColumnIndex });

    const rowsText = [];
    const rowsLookup = [];

    rows.forEach((row, rowIndex) => {
      if (rowIndex === rowsLength - 1 && hasEmptyLastRow) {
        return;
      }

      const cells = [...row.querySelectorAll('td, th')];
      const cellTexts = [];
      const cellLookup = [];

      const fnCellsText = cells.slice(0, estimateColumnIndex).reduce((acc, cell) => `${acc}${cell.textContent.trim()}`, '');

      if (fnCellsText === '') {
        return;
      }

      for (i = 0; i < estimateColumnIndex; i += 1) {
        const cell = cells[i];
        const cellText = cell.textContent.trim();

        // 第一行数据，直接添加单元格
        if (rowsText.length === 0) {
          cellTexts.push(cellText);
          cellLookup.push(false);
          continue;
        }

        // 非第一行所有行

        // 有值，不用查上一行对应单元格
        if (cellText !== '') {
          cellTexts.push(cellText);
          cellLookup.push(false);
          continue;
        }

        // 无值
        // 前一个单元格是否有值 (是否经历过向上查找)
        const lookup = cellLookup[i - 1];

        // 无值，第一个单元格，或前面单元格同样无值
        if (lookup === undefined || lookup === true) {
          cellTexts.push(rowsText[rowIndex - 1][i]);
          cellLookup.push(true);
          continue;
        }

        // 无值，前面单元格无值
        cellTexts.push('');
        cellLookup.push(false);
      }

      // 保存记录
      rowsText.push(cellTexts);
      rowsLookup.push(cellLookup);
    });

    const wbs = rowsText.map((row) => row.filter(text => text !== '').join(' - ')).join('\n');
    console.log(wbs);
    console.log('rows text: %o', rowsText);
    console.log('rows lookup: %o', rowsLookup);
    clipboard(wbs);

    return wbs;
  }

  function wbs() {
    const tables = getTables();
    const result = {};
    Array.from(tables).forEach((table) => {
      const wbsStr = wbsTable(table);
      if (wbsStr) {
        createMessage(wbsStr, 'pre');
      }
    });
  }

  // 事件入口
  function eventListener(key) {
    switch (key) {
      case ACTION_TYPE.estimate:
        estimate();
        break;
      case ACTION_TYPE.task:
        wbs();
        break;
    }
  }

  // UI

  function insertElement() {
    const icons = {
      [ACTION_TYPE.estimate]: { title: '汇总评估工时', icon: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M44 31C44 36.5228 39.5228 41 34 41C32.2091 41 30.5281 40.5292 29.0741 39.7046C26.5143 38.2529 24.6579 35.7046 24.1436 32.6983C24.0492 32.1463 24 31.5789 24 31C24 28.4323 24.9678 26.0906 26.5585 24.3198C28.3892 22.2818 31.0449 21 34 21C39.5228 21 44 25.4772 44 31Z" fill="none" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 12V20V21C31.0449 21 28.3892 22.2818 26.5585 24.3198C24.9678 26.0906 24 28.4323 24 31C24 31.5789 24.0492 32.1463 24.1436 32.6983C24.6579 35.7046 26.5143 38.2529 29.0741 39.7046C26.4116 40.5096 22.8776 41 19 41C10.7157 41 4 38.7614 4 36V28V20V12" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 12C34 14.7614 27.2843 17 19 17C10.7157 17 4 14.7614 4 12C4 9.23858 10.7157 7 19 7C27.2843 7 34 9.23858 34 12Z" fill="none" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 28C4 30.7614 10.7157 33 19 33C20.807 33 22.5393 32.8935 24.1436 32.6983" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 20C4 22.7614 10.7157 25 19 25C21.7563 25 24.339 24.7522 26.5585 24.3198" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 31H34V27" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
      [ACTION_TYPE.task]: { title: 'WBS', icon: `<?xml version="1.0" encoding="UTF-8"?><svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10L8 13L14 7" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 24L8 27L14 21" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 38L8 41L14 35" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 24H43" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 38H43" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 10H43" stroke="#bbb" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>` },
    };

    const keys = Object.keys(icons);

    const wrapperEl = document.createElement('div');
    wrapperEl.classList.add('x-jira-actions');

    keys.forEach((key) => {
      const itemEl = document.createElement('i');
      itemEl.classList.add('x-icon', `x-icon-${key}`, 'x-jira-action', `x-jira-action-${key}`);
      itemEl.innerHTML = icons[key].icon;
      itemEl.title = icons[key].title;

      itemEl.addEventListener('click', () => eventListener(key));

      wrapperEl.appendChild(itemEl);
    });

    document.body.appendChild(wrapperEl);
  }

  function extendStyleHandler() {
    const style = `
.x-jira-actions {
  position: fixed;
  bottom: 42px;
  right: 18px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 100%;
}

.x-jira-action {
  opacity: 0.5;
  cursor: pointer;
}

.x-jira-action:hover {
  opacity: 1;
}

.x-jira-action svg {
  width: 16px;
  height: 16px;
}
  `;

    GM_addStyle(style);
  }

  function createMessage(message, contentTag = 'strong') {
    const messageElement = document.createElement('div');
    messageElement.classList.add('x-message');
    messageElement.style.top = `${(document.querySelectorAll('.x-message').length * 50) + 220}px`;
    messageElement.style.zIndex = `${(document.querySelectorAll('.x-message').length + 1) + 2030}`;

    const tipsElement = document.createElement('div');
    tipsElement.classList.add('x-message__tips')
    tipsElement.textContent = '已复制: ';
    messageElement.appendChild(tipsElement);

    const contentElement = document.createElement(contentTag);
    contentElement.classList.add('x-message__content')
    const textNode = document.createTextNode(message);
    contentElement.appendChild(textNode);
    messageElement.appendChild(contentElement);

    document.body.appendChild(messageElement);

    setTimeout(() => {
      messageElement.remove();
      document.querySelectorAll('.x-message').forEach((item) => {
        item.style.top = `${parseInt(item.style.top) - 50}px`;
        item.style.zIndex = `${parseInt(item.style.zIndex) - 1}`;
      });
    }, 3000);
  }

  function messageStyleHandler() {
    const style = `
  .x-message { box-sizing: border-box; position: fixed; top: 20px; left: 50%; z-index: 99999; padding: 8px 16px; border: 1px solid #ccc; border-radius: 3px; background: #fff; box-shadow: 0 2px 8px 0 rgba(0, 0, 0, .1); transform: translateX(-50%); min-width: auto; min-height: auto; transition: all .4s linear; }
  .x-message__tips { font-size: 12px; color: #333; font-weight: 400;  }
  .x-message__content { font-size: 12px; color: #339900; }
  `;

    GM_addStyle(style);
  }
})();

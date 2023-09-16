function switchTab(activeTabId) {
  document.querySelector('body').className = activeTabId;
}

function initTab() {
  const tabItems = document.getElementsByClassName('tab_item');
  for (let i = 0; i < tabItems.length; i += 1) {
    tabItems[i].addEventListener('click', () => switchTab(tabItems[i].id));
  }
}

initTab();

const switchTab = (activeTabId) => {
  document.getElementsByTagName('body')[0].className = activeTabId;
};

const initTab = () => {
  const tabItems = document.getElementsByClassName('tab-item');
  for (let i = 0; i < tabItems.length; i += 1) {
    tabItems[i].addEventListener('click', () => switchTab(tabItems[i].id));
  }
};

initTab();

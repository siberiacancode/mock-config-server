function switchTab(activeTabId) {
  const activeTabArray = activeTabId.split('-');
  document.getElementsByTagName('body')[0].className = activeTabArray[activeTabArray.length-1];
}

function tabInit() {
  const tabItems = document.getElementsByClassName("tab-item")
    for (let i = 0; i < tabItems.length; i += 1) {
      tabItems[i].addEventListener("click", () => switchTab(tabItems[i].id))
    }
}

tabInit();
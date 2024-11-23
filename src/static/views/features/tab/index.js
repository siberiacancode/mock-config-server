const initTabGroup = (tabGroupClassName, tabIds) => {
  for (let tabId of tabIds) {
    const tabTrigger = document.getElementById(`${tabId}_trigger`);
    const tabContent = document.getElementById(`${tabId}_content`);

    tabTrigger.addEventListener('click', () => {
      switchActiveItem(`${tabGroupClassName} tab_trigger`, tabTrigger);
      switchActiveItem(`${tabGroupClassName} tab_content`, tabContent);
    });
  }
};

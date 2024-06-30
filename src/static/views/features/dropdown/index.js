function onClickOutside(element, handler) {
  const onClickOutsideListener = (event) => {
    if (!element.contains(event.target)) {
      handler();
    }
  };

  document.addEventListener('click', onClickOutsideListener);
}

// eslint-disable-next-line no-unused-vars
function initDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  const dropwdownTrigger = document.getElementById(`${dropdownId}_trigger`);
  const dropdownContent = document.getElementById(`${dropdownId}_content`);

  function closeDropdown() {
    dropdownContent.className = 'dropdown_content';
  }

  function openDropdown() {
    dropdownContent.className = 'dropdown_content_active';
  }

  dropwdownTrigger.addEventListener('click', (event) => {
    event.stopPropagation();
    const isDropdownActive = dropdownContent.className === 'dropdown_content_active';

    if (isDropdownActive) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  document.addEventListener('click', () => onClickOutside(dropdown, closeDropdown));

  return { openDropdown, closeDropdown };
}

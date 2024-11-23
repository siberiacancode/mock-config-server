const onClickOutside = (element, handler) => {
  const onClickOutsideListener = (event) => {
    if (!element.contains(event.target)) {
      handler();
    }
  };

  document.addEventListener('click', onClickOutsideListener);
};

// eslint-disable-next-line no-unused-vars
const initDropdown = (dropdownId) => {
  const dropdown = document.getElementById(dropdownId);
  const dropdownTrigger = document.getElementById(`${dropdownId}_trigger`);
  const dropdownContent = document.getElementById(`${dropdownId}_content`);

  const closeDropdown = () => {
    dropdownContent.classList.remove('active');
  };

  const openDropdown = () => {
    dropdownContent.classList.add('active');
  };

  const onClickDropdownListener = (event) => {
    event.stopPropagation();
    dropdownContent.classList.toggle('active');
  };

  dropdownTrigger.addEventListener('click', onClickDropdownListener);

  document.addEventListener('click', () => onClickOutside(dropdown, closeDropdown));

  return { openDropdown, closeDropdown };
};

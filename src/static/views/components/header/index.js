const initSchemeSwitcher = () => {
  // eslint-disable-next-line no-undef
  const { scheme, setScheme } = initScheme();
  // eslint-disable-next-line no-undef
  const { closeDropdown } = initDropdown('scheme_switcher_dropdown');

  const radioGroupItems = document.getElementsByClassName('scheme_switcher_radio_group_item');

  for (let item of radioGroupItems) {
    const value = item.getAttribute('data-value');

    if (scheme === value) {
      item.classList.add('active');
    }

    item.addEventListener('click', () => {
      setScheme(value);
      switchActiveItem('scheme_switcher_radio_group_item', item);
      closeDropdown();
    });
  }
};

initSchemeSwitcher();

function initSchemeSwitcher() {
  // eslint-disable-next-line no-undef
  const { scheme, setScheme } = initScheme();
  // eslint-disable-next-line no-undef
  const { closeDropdown } = initDropdown('scheme_switcher_dropdown');

  const radioGroupItems = document.getElementsByClassName('scheme_switcher_radio_group_item');

  function setActiveRadioGroupItem(element) {
    for (let i = 0; i < radioGroupItems.length; i += 1) {
      radioGroupItems[i].className = 'scheme_switcher_radio_group_item';
    }
    element.className = 'scheme_switcher_radio_group_item active';
  }

  for (let i = 0; i < radioGroupItems.length; i += 1) {
    const value = radioGroupItems[i].getAttribute('data-value');

    if (scheme === value) {
      radioGroupItems[i].className = 'scheme_switcher_radio_group_item active';
    }

    radioGroupItems[i].addEventListener('click', () => {
      setScheme(value);
      setActiveRadioGroupItem(radioGroupItems[i]);
      closeDropdown();
    });
  }
}

initSchemeSwitcher();

const switchActiveItem = (groupClassName, activatedElement) => {
  const activeItems = document.getElementsByClassName(`${groupClassName} active`);
  for (let activeItem of activeItems) {
    activeItem.classList.remove('active');
  }
  activatedElement.classList.add('active');
};

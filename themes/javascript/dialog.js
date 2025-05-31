  const dialogs = document.querySelectorAll(".info-dialog");

  dialogs.forEach(dialog => {
  const openButton = dialog.nextElementSibling;
  
  if (openButton) {
    openButton.addEventListener("click", () => dialog.open = true);
  }
});
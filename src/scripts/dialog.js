  const dialogs = document.querySelectorAll(".info-dialog, .preview-dialog");

  dialogs.forEach(dialog => {
  const openButton = dialog.nextElementSibling;
  
  if (openButton) {
    openButton.addEventListener("click", () => dialog.open = true);
  }
});
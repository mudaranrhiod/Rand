const { snackbar } = mdui;

const button = document.querySelector(".copy");

button.addEventListener("click", () => {
  snackbar({
    message: "Link Copied",
    action: "Undo",
    onActionClick: () => console.log("click action button")
  });
});
const { snackbar } = mdui;

const copyButtons = document.querySelectorAll(".copy");

copyButtons.forEach(button => {
  button.addEventListener("click", () => {
    snackbar({
      message: "Link Copied",
    });
  });
});
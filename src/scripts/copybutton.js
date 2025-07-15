document.querySelectorAll(".copy").forEach(copyButton => {
        copyButton.addEventListener("click", () => {
            const targetElement = copyButton.dataset.copy;
        
            navigator.clipboard.writeText(targetElement).then(() => {
                
            });
        });
    });
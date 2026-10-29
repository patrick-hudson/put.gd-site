// put.gd landing page. Everything works without this; it only adds the copy buttons.
(() => {
  "use strict";

  // Copy buttons next to the install commands.
  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.parentElement.querySelector("code").textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
        setTimeout(() => { btn.textContent = "Copy"; }, 1600);
      } catch {
        btn.textContent = "Select and copy";
      }
    });
  });
})();

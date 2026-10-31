// put.gd landing page: install method selection and copy buttons.
// The default command and AppImage hint remain available without JavaScript.
(() => {
  "use strict";

  // Each box has its own native radio group, including keyboard arrow navigation.
  document.querySelectorAll(".install-command").forEach((box) => {
    const methods = box.querySelector(".install-method");
    if (!methods) return; // A cached page may predate the toggle.
    const command = box.querySelector(".cmd code");
    const packageCommand = command.textContent;
    const update = () => {
      const appimage = methods.querySelector('[value="appimage"]').checked;
      command.textContent = packageCommand + (appimage ? " -s -- --appimage" : "");
      box.querySelector(".copy").textContent = "Copy";
    };
    methods.addEventListener("change", update);
    update();
    methods.hidden = false;
    box.querySelector(".install-fallback").hidden = true;
  });

  // Read the currently displayed command when copying.
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

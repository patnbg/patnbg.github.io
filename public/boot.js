document.body.classList.add("is-booting");
window.nullStarBootObserver = new MutationObserver(() => {
  const shell = document.querySelector(".terminal-shell");
  if (shell) {
    shell.inert = true;
    window.nullStarBootObserver.disconnect();
  }
});
window.nullStarBootObserver.observe(document.documentElement, { childList: true, subtree: true });
window.nullStarBootFallback = window.setTimeout(() => {
  document.body.classList.remove("is-booting");
  document.body.classList.add("is-ready");
  const shell = document.querySelector(".terminal-shell");
  if (shell) {
    shell.inert = false;
  }
}, 5000);

  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

const { invoke } = window.__TAURI__.core;

let greetInputEl;
let greetMsgEl;

async function greet() {

  greetMsgEl.innerHTML = `${await invoke("greet", { name: greetInputEl.value })} ${await invoke("my_custom_command")}`;
}


const taskbar = document.querySelector("#taskbar-content");

taskbar.addEventListener("wheel", (event) => {
  event.preventDefault();
  taskbar.scrollLeft += event.deltaY;
}, { passive: false });


const resizer = document.querySelector("#left-resizer");
const styles = getComputedStyle(document.documentElement);
let isResizing = false;

resizer.addEventListener("pointerdown", (event) => {
  isResizing = true;
  resizer.setPointerCapture(event.pointerId);
});

resizer.addEventListener("pointermove", (event) => {
  if (!isResizing) return;

  const min = parseFloat(styles.getPropertyValue("--left-min-width")) / 100 * window.innerWidth;
  const max = parseFloat(styles.getPropertyValue("--left-max-width")) / 100 * window.innerWidth;

  const width = Math.max(min, Math.min(max, event.clientX));

  document.documentElement.style.setProperty(
    "--left-width",
    `${width}px`
  );
});

resizer.addEventListener("pointerup", () => {
  isResizing = false;
});
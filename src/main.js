  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

const { invoke } = window.__TAURI__.core;

let greetInputEl;
let greetMsgEl;

async function greet() {

  greetMsgEl.innerHTML = `${await invoke("greet", { name: greetInputEl.value })} ${await invoke("my_custom_command")}`;
}



// HEADER AND TASKBAR

const headerItems = document.querySelectorAll(".header-item")
const taskbar = document.querySelector("#taskbar-content");
//console.log(headerItems)
const map = {
  "file": [
    "New File",
    "New Window",
    "Open File...",
    "Open Folder...",
    "Open Recent",
    "Save",
    "Save As...",
    "Save All",
    "Auto Save",
    "Export as PDF",
    "Share",
    "Page Setup",
    "Print...",
    "Preferences",
    "Close Editor",
    "Close Window",
    "Exit"
  ],
  "edit": [
    "Undo",
    "Redo",
    "Cut",
    "Copy",
    "Paste",
    "Paste Without Formatting",
    "Delete",
    "Select All",
    "Find",
    "Replace",
    "Find in Files",
    "Replace in Files",
    "Duplicate Line",
    "Move Line Up",
    "Move Line Down",
    "Toggle Comment",
    "Auto Indent"
  ],
  "view": [
    "Command Palette",
    "Appearance",
    "Full Screen",
    "Zen Mode",
    "Zoom In",
    "Zoom Out",
    "Reset Zoom",
    "Toggle Sidebar",
    "Toggle Status Bar",
    "Toggle Terminal",
    "Show Minimap",
    "Word Wrap",
    "Split Editor Right",
    "Split Editor Down",
    "Rulers and Guides",
    "Theme Settings"
  ],
  "tools": [
    "Extensions & Plugins",
    "Spell Check",
    "Word Count",
    "Format Document",
    "Compare Files",
    "Code Snippets",
    "Task Runner",
    "Build Project",
    "Start Debugging",
    "Performance Profiler",
    "Network Monitor",
    "Developer Tools",
    "Color Picker",
    "Keyboard Shortcuts",
    "Import / Export Settings"
  ]
};

headerItems.forEach((headerItem)=>{
  //console.log(headerItem)
  headerItem.addEventListener("click",()=>{
    //console.log(headerItem,"clicked. ID:", headerItem.id)
    //console.log(taskbar)
    let select = map[headerItem.id]
    headerItems.forEach((el) => el.classList.remove("active"));
    headerItem.classList.add("active")
    let html = ""
    select.forEach((item)=>{
      html+=`<div class="task">${item}</div>` 
    });
    taskbar.innerHTML=html
  });
});


// TASKBAR SCROLL
taskbar.addEventListener("wheel", (event) => {
  event.preventDefault();
  taskbar.scrollLeft += event.deltaY;
}, { passive: false });



// RESIZER
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
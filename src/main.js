
// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

const { invoke } = window.__TAURI__.core;

let greetInputEl;
let greetMsgEl;

async function greet() {
  greetMsgEl.innerHTML = `${await invoke("greet", { name: greetInputEl.value })} ${await invoke("my_custom_command")}`;
}


// HEADER AND TASKBAR

const headerItems = document.querySelectorAll(".header-item");
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

headerItems.forEach((headerItem) => {
  //console.log(headerItem)
  headerItem.addEventListener("click", () => {
    //console.log(headerItem,"clicked. ID:", headerItem.id)
    //console.log(taskbar)

    let select = map[headerItem.id];

    headerItems.forEach((el) => el.classList.remove("active"));

    headerItem.classList.add("active");

    let html = "";

    select.forEach((item) => {
      html += `<div class="task">${item}</div>`;
    });

    taskbar.innerHTML = html;
    taskbar.scrollLeft = 0;
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


// WORKSPACE

const workspace = document.querySelector("#workspace");
const gridBackground = document.querySelector("#grid-background");
const workspaceSize = workspace.getBoundingClientRect();

const initialHeight = 2000;
const initialWidth = initialHeight * (workspaceSize.width / workspaceSize.height);

workspace.setAttribute(
  "viewBox",
  `0 0 ${initialWidth} ${initialHeight}`
);

function updateGrid() {
  const viewBox = workspace.viewBox.baseVal;

  gridBackground.setAttribute("x", viewBox.x);
  gridBackground.setAttribute("y", viewBox.y);
  gridBackground.setAttribute("width", viewBox.width);
  gridBackground.setAttribute("height", viewBox.height);
}

updateGrid();

function setViewBox(x, y, width, height) {
  workspace.setAttribute(
    "viewBox",
    `${x} ${y} ${width} ${height}`
  );

  updateGrid();
}


// WORKSPACE RESIZING

const resizeObserver = new ResizeObserver(() => {
  const bounds = workspace.getBoundingClientRect();
  const viewBox = workspace.viewBox.baseVal;

  const newHeight = viewBox.height;
  const newWidth = newHeight * (bounds.width / bounds.height);

  const centreX = viewBox.x + viewBox.width / 2;

  setViewBox(
    centreX - newWidth / 2,
    viewBox.y,
    newWidth,
    newHeight
  );
});

resizeObserver.observe(workspace);


// ZOOM

workspace.addEventListener("wheel", (event) => {
  event.preventDefault();

  const viewBox = workspace.viewBox.baseVal;

  const point = workspace.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;

  const cursor = point.matrixTransform(
    workspace.getScreenCTM().inverse()
  );

  const zoomFactor = Math.exp(event.deltaY * 0.001);

  const newWidth = viewBox.width * zoomFactor;
  const newHeight = viewBox.height * zoomFactor;

  const newX = cursor.x - (cursor.x - viewBox.x) * zoomFactor;
  const newY = cursor.y - (cursor.y - viewBox.y) * zoomFactor;

  setViewBox(newX, newY, newWidth, newHeight);

}, { passive: false });




// PAN & SELECT & GATE DRAGGING

let isPanning = false;
let panStart = null;
let gates = document.querySelectorAll(".gate");
let preview = null;
let image = null;
let hasDragged = false;
let selectedGate = null;
let grabOffset = { x: 0, y: 0 };

workspace.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  if (event.button === 1) {
    isPanning = true;

    const viewBox = workspace.viewBox.baseVal;

    const startX = viewBox.x;
    const startY = viewBox.y;

    const inverseMatrix = workspace.getScreenCTM().inverse();

    const point = workspace.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const startPoint = point.matrixTransform(inverseMatrix);

    panStart = {
      startX,
      startY,
      startPoint,
      inverseMatrix
    };

    workspace.setPointerCapture(event.pointerId);
  } else if (event.button === 0) {
    //console.log("click:", event.target)

    if (event.target.classList.contains("logic-gate")) {
      selectedGate = event.target;
      selectedGate.classList.add("active")

      const point = workspace.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;

      const cursor = point.matrixTransform(
        workspace.getScreenCTM().inverse()
      );

      grabOffset.x = cursor.x - Number(selectedGate.getAttribute("x"));
      grabOffset.y = cursor.y - Number(selectedGate.getAttribute("y"));
  }
  } else {
    return;
  }
});

workspace.addEventListener("pointermove", (event) => {
  if (isPanning) {
    const point = workspace.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;

    const currentPoint = point.matrixTransform(
      panStart.inverseMatrix
    );

    const deltaX = currentPoint.x - panStart.startPoint.x;
    const deltaY = currentPoint.y - panStart.startPoint.y;

    setViewBox(
      panStart.startX - deltaX,
      panStart.startY - deltaY,
      workspace.viewBox.baseVal.width,
      workspace.viewBox.baseVal.height
    );
  } else if (selectedGate != null) {
    const point = workspace.createSVGPoint();

    point.x = event.clientX;
    point.y = event.clientY;

    const cursor = point.matrixTransform(
      workspace.getScreenCTM().inverse()
    );

    selectedGate.setAttribute("x", cursor.x - grabOffset.x);
    selectedGate.setAttribute("y", cursor.y - grabOffset.y);
  } else {
    return;
  }
});

function stopPanning() {
  isPanning = false;
  panStart = null;
}

workspace.addEventListener("pointercancel", stopPanning);
workspace.addEventListener("pointerup", stopPanning);

function dropDrag(event) {
  if (!selectedGate) return;

  image = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "image"
  );

  //selectedGate.classList.add("logic-gate");

  const point = workspace.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;

  const cursor = point.matrixTransform(
    workspace.getScreenCTM().inverse()
  );

  selectedGate.setAttribute("x", cursor.x - grabOffset.x);
  selectedGate.setAttribute("y", cursor.y - grabOffset.y);
  selectedGate.classList.remove("active")

  workspace.appendChild(selectedGate);
  selectedGate = null;
}

workspace.addEventListener("pointerup", (event) => {
  dropDrag(event);
});

workspace.addEventListener("pointercancel", (event) => {
  dropDrag(event);
});

gates.forEach((gate) => {
  gate.addEventListener("pointerdown", (event) => {
    event.preventDefault();

    hasDragged = false;

    const bounds = gate.getBoundingClientRect();

    // Where the mouse grabbed the original gate
    const offsetX = event.clientX - bounds.left;
    const offsetY = event.clientY - bounds.top;

    // Convert sidebar grab offset to SVG coordinates
    const workspaceBounds = workspace.getBoundingClientRect();
    const viewBox = workspace.viewBox.baseVal;

    grabOffset = {
      x: offsetX * (viewBox.width / workspaceBounds.width),
      y: offsetY * (viewBox.height / workspaceBounds.height)
    };

    preview = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );

    preview.setAttribute("href", gate.src);
    preview.classList.add("drag-preview");

    workspace.appendChild(preview);
  });
});

window.addEventListener("pointermove", (event) => {
  if (!preview) return;

  hasDragged = true;

  const point = workspace.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;

  const cursor = point.matrixTransform(
    workspace.getScreenCTM().inverse()
  );

  preview.setAttribute("x", cursor.x - grabOffset.x);
  preview.setAttribute("y", cursor.y - grabOffset.y);
});

window.addEventListener("pointerup", (event) => {
  if (!preview) return;

  if (hasDragged) {
    image = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "image"
    );

    image.setAttribute("href", preview.getAttribute("href"));
    image.classList.add("logic-gate");

    image.setAttribute("x", preview.getAttribute("x"));
    image.setAttribute("y", preview.getAttribute("y"));

    workspace.appendChild(image);
  }

  preview.remove();
  preview = null;
  hasDragged = false;
});


// WIRE LOGIC

/*
START
END
DATA
GEOMETRY
*/
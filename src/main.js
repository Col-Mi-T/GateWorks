  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

const { invoke } = window.__TAURI__.core;

let greetInputEl;
let greetMsgEl;

async function greet() {

  greetMsgEl.innerHTML = `${await invoke("greet", { name: greetInputEl.value })} ${await invoke("my_custom_command")}`;
}


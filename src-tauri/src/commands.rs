

#[tauri::command]
pub fn my_custom_command() ->String{
  "I was invoked from JavaScript!".into()
}
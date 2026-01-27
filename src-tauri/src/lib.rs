use tauri::PhysicalPosition;

#[tauri::command]
fn resize_to_editor(window: tauri::Window) -> Result<(), String> {
    let new_width: u32 = 1200;
    let new_height: u32 = 800;
    
    // Get monitor info for centering
    if let Some(monitor) = window.current_monitor().map_err(|e| e.to_string())?.or_else(|| None) {
        let monitor_size = monitor.size();
        let monitor_pos = monitor.position();
        let scale = monitor.scale_factor();
        
        let x = monitor_pos.x + ((monitor_size.width as i32 - (new_width as f64 * scale) as i32) / 2);
        let y = monitor_pos.y + ((monitor_size.height as i32 - (new_height as f64 * scale) as i32) / 2);
        
        window.set_size(tauri::LogicalSize::new(new_width as f64, new_height as f64))
            .map_err(|e| e.to_string())?;
        window.set_position(PhysicalPosition::new(x, y))
            .map_err(|e| e.to_string())?;
    } else {
        // Fallback: just resize and try center
        window.set_size(tauri::LogicalSize::new(new_width as f64, new_height as f64))
            .map_err(|e| e.to_string())?;
        let _ = window.center();
    }
    
    Ok(())
}

#[tauri::command]
fn resize_to_onboarding(window: tauri::Window) -> Result<(), String> {
    let new_width: u32 = 700;
    let new_height: u32 = 500;
    
    // Get monitor info for centering
    if let Some(monitor) = window.current_monitor().map_err(|e| e.to_string())?.or_else(|| None) {
        let monitor_size = monitor.size();
        let monitor_pos = monitor.position();
        let scale = monitor.scale_factor();
        
        let x = monitor_pos.x + ((monitor_size.width as i32 - (new_width as f64 * scale) as i32) / 2);
        let y = monitor_pos.y + ((monitor_size.height as i32 - (new_height as f64 * scale) as i32) / 2);
        
        window.set_size(tauri::LogicalSize::new(new_width as f64, new_height as f64))
            .map_err(|e| e.to_string())?;
        window.set_position(PhysicalPosition::new(x, y))
            .map_err(|e| e.to_string())?;
    } else {
        // Fallback: just resize and try center
        window.set_size(tauri::LogicalSize::new(new_width as f64, new_height as f64))
            .map_err(|e| e.to_string())?;
        let _ = window.center();
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![resize_to_editor, resize_to_onboarding])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

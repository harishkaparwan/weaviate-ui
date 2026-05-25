use std::collections::HashMap;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NativeHttpRequest {
  url: String,
  method: String,
  headers: HashMap<String, String>,
  body: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct NativeHttpResponse {
  ok: bool,
  status: u16,
  status_text: String,
  headers: HashMap<String, String>,
  body: String,
  error: Option<String>,
}

#[tauri::command]
async fn native_http_fetch(request: NativeHttpRequest) -> Result<NativeHttpResponse, String> {
  let method = reqwest::Method::from_bytes(request.method.as_bytes())
    .map_err(|err| format!("Invalid HTTP method: {err}"))?;

  let client = reqwest::Client::builder()
    .build()
    .map_err(|err| format!("HTTP client init failed: {err}"))?;

  let mut request_builder = client.request(method, &request.url);

  for (name, value) in &request.headers {
    request_builder = request_builder.header(name, value);
  }

  if let Some(body) = request.body {
    request_builder = request_builder.body(body);
  }

  let response = request_builder
    .send()
    .await
    .map_err(|err| format!("Network request failed: {err}"))?;

  let status = response.status();
  let status_text = status.canonical_reason().unwrap_or("").to_string();

  let mut headers = HashMap::new();
  for (name, value) in response.headers() {
    if let Ok(text_value) = value.to_str() {
      headers.insert(name.to_string(), text_value.to_string());
    }
  }

  let body = response
    .text()
    .await
    .map_err(|err| format!("Failed to read response body: {err}"))?;

  Ok(NativeHttpResponse {
    ok: status.is_success(),
    status: status.as_u16(),
    status_text,
    headers,
    body,
    error: None,
  })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
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
    .invoke_handler(tauri::generate_handler![native_http_fetch])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

use axum::{
    Json, Router,
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::get,
};
use serde::{Deserialize, Serialize};

pub fn hello_router() -> Router {
    Router::new().route("/hello", get(hello))
}

#[derive(Debug, Deserialize)]
struct HelloPayload {
    name: String,
}

#[derive(Debug, Deserialize, Serialize)]
struct HelloResponse {
    message: String,
}

#[derive(Debug, Serialize)]
struct HelloError;

impl IntoResponse for HelloError {
    fn into_response(self) -> Response {
        (StatusCode::INTERNAL_SERVER_ERROR, "Internal Server Error").into_response()
    }
}

async fn hello(Json(payload): Json<HelloPayload>) -> Result<Json<HelloResponse>, HelloError> {
    Ok(Json(HelloResponse {
        message: format!("Hello, {}!", payload.name),
    }))
}

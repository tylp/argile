use axum::{
    Json, Router,
    extract::FromRequestParts,
    http::{HeaderValue, StatusCode, request::Parts},
    response::{IntoResponse, Response},
    routing::{get, post},
};
use chrono::{Duration, Utc};
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fmt::Display;
use std::sync::LazyLock;
use tower::ServiceBuilder;
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

static KEYS: LazyLock<Keys> = LazyLock::new(|| {
    dotenv::dotenv().ok();

    let secret = std::env::var("JWT_SECRET").expect("JWT_SECRET must be set");
    Keys::new(secret.as_bytes())
});

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
                format!("{}=debug,tower_http=debug", env!("CARGO_CRATE_NAME")).into()
            }),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let cors_layer = CorsLayer::new()
        .allow_credentials(true)
        .allow_headers([
            axum::http::header::ACCEPT,
            axum::http::header::CONTENT_TYPE,
            axum::http::header::AUTHORIZATION,
        ])
        .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
        .allow_methods([
            axum::http::Method::GET,
            axum::http::Method::POST,
            axum::http::Method::OPTIONS,
        ]);

    let app = Router::new()
        .route("/auth/me", get(me))
        .route("/auth/login", post(login))
        .layer(
            ServiceBuilder::new()
                .layer(TraceLayer::new_for_http())
                .layer(cors_layer),
        );

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

async fn me(claims: Claims) -> Result<Json<AuthResponse>, AuthError> {
    // Here you can fetch the user data from a database using claims.sub

    let user = User {
        username: claims.iss,
    };

    Ok(Json(AuthResponse { data: user }))
}

async fn login(Json(payload): Json<AuthPayload>) -> Result<Json<AuthBody>, AuthError> {
    // Check if the user sent the credentials
    if payload.username.is_empty() || payload.password.is_empty() {
        return Err(AuthError::MissingCredentials);
    }

    // Checkk auth with pam
    let service = "login";
    let username = payload.username.clone();
    let password = payload.password.clone();

    let mut client = pam::Client::with_password(service).map_err(|_| AuthError::PamError)?;
    client
        .conversation_mut()
        .set_credentials(username, password);

    client
        .authenticate()
        .map_err(|_| AuthError::WrongCredentials)?;

    let iat = Utc::now().timestamp();
    let exp = (Utc::now() + Duration::days(1)).timestamp();

    let claims = Claims {
        iss: payload.username.clone(),
        exp,
        iat,
    };
    // Create the authorization token
    let token = encode(&Header::default(), &claims, &KEYS.encoding)
        .map_err(|_| AuthError::TokenCreation)?;

    let auth_body = Json(AuthBody::new(token, payload.username.clone()));

    // Send the authorized token
    tracing::debug!(
        "Created token: {} for user {}",
        auth_body.access_token,
        payload.username
    );
    Ok(auth_body)
}

impl Display for Claims {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Issuer: {}\nIssued At: {}", self.iss, self.iat)
    }
}

impl AuthBody {
    fn new(access_token: String, username: String) -> Self {
        Self {
            access_token,
            token_type: "Bearer".to_string(),
            user: User { username },
        }
    }
}

impl<S> FromRequestParts<S> for Claims
where
    S: Send + Sync,
{
    type Rejection = AuthError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        // Verify the token contained in the cookie
        if let Some(cookie) = parts.headers.get(axum::http::header::COOKIE) {
            if let Ok(cookie_str) = cookie.to_str() {
                for c in cookie_str.split(';') {
                    if let Some((name, value)) = c.split_once('=') {
                        if name.trim() == "access_token" {
                            let token_data = decode::<Claims>(
                                value.trim(),
                                &KEYS.decoding,
                                &Validation::default(),
                            )
                            .map_err(|_| AuthError::InvalidToken)?;
                            return Ok(token_data.claims);
                        }
                    }
                }
            }
        }

        Err(AuthError::InvalidToken)
    }
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AuthError::WrongCredentials => (StatusCode::UNAUTHORIZED, "Wrong credentials"),
            AuthError::MissingCredentials => (StatusCode::BAD_REQUEST, "Missing credentials"),
            AuthError::TokenCreation => (StatusCode::INTERNAL_SERVER_ERROR, "Token creation error"),
            AuthError::InvalidToken => (StatusCode::BAD_REQUEST, "Invalid token"),
            AuthError::PamError => (StatusCode::UNAUTHORIZED, "PAM authentication error"),
        };
        let body = Json(json!({
            "error": error_message,
        }));
        (status, body).into_response()
    }
}

struct Keys {
    encoding: EncodingKey,
    decoding: DecodingKey,
}

impl Keys {
    fn new(secret: &[u8]) -> Self {
        Self {
            encoding: EncodingKey::from_secret(secret),
            decoding: DecodingKey::from_secret(secret),
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    iss: String,
    exp: i64,
    iat: i64,
}

#[derive(Debug, Serialize)]
struct AuthResponse {
    data: User,
}

#[derive(Debug, Serialize)]
struct User {
    username: String,
}

#[derive(Debug, Serialize)]
struct AuthBody {
    access_token: String,
    token_type: String,
    user: User,
}

#[derive(Debug, Deserialize)]
struct AuthPayload {
    username: String,
    password: String,
}

#[derive(Debug)]
enum AuthError {
    WrongCredentials,
    MissingCredentials,
    TokenCreation,
    InvalidToken,
    PamError,
}

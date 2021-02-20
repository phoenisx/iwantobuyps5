use config::{Config, File};
use serde::{Deserialize};

#[derive(Debug, Deserialize)]
pub struct Secret {
    pub telegram_token: String,
    pub product_id: String,
    pub bot_username: String,
    pub channel_id: i64,
}

impl Secret {
    pub fn new() -> Self {
        let mut settings = Config::default();
        match settings.merge(File::with_name("secrets")) {
            Err(_) => {
                println!("Provide `secrets.toml` in root");
            },
            _ => {}
        }
        settings.try_into().unwrap()
    }
}

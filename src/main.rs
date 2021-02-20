use fantoccini::{ClientBuilder};
use serde_json::json;
use telegram_bot::{Api, Chat, Channel, ChannelId, SendMessage};

mod store;
mod secrets;

const PS5_ID: &'static str = "B08FV5GC28";

// let's set up the sequence of steps we want the browser to take
#[tokio::main]
async fn main() -> Result<(), fantoccini::error::CmdError> {
    let secrets = secrets::Secret::new();

    let api = Api::new(secrets.telegram_token);
    let channel = Channel{
        id: ChannelId::new(-1001199774902),
        title: String::from("Random Title"),
        username: Some("ps5amz_bot".to_string()),
        invite_link: None,
    };
    let message = SendMessage::new(Chat::Channel(channel), "Something worth texting");

    // https://developer.mozilla.org/en-US/docs/Web/WebDriver/Capabilities/firefoxOptions
    let caps = {
        let mut caps = serde_json::map::Map::new();
        let moz_opts = json!({ "args": ["-headless"] });
        caps.insert("moz:firefoxOptions".to_string(), moz_opts);
        caps
    };

    let mut client = ClientBuilder::native()
        .capabilities(caps)
        .connect("http://localhost:4444")
        .await
        .expect("failed to connect to WebDriver");

    let amz = store::Amazon::new("https://www.amazon.in");
    let path = format!(
        "{}/{}",
        *store::PATHS.get("PRODUCT_PAGE").unwrap(),
        PS5_ID
    );
    amz.goto(
        &mut client,
        path.as_str(),
    )
    .await?;

    client.close().await
}

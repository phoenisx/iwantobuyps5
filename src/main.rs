use fantoccini::{ClientBuilder};
use serde_json::json;
use telegram_bot::{
    Api, Channel, ChannelId, Chat, SendMessage,
};
use tokio::time::{self, Duration};

mod secrets;
mod store;

// let's set up the sequence of steps we want the browser to take
#[tokio::main]
async fn main() {
    let secrets = secrets::Secret::new();

    let api = Api::new(secrets.telegram_token);
    let channel = Channel {
        id: ChannelId::new(secrets.channel_id),
        title: String::from("Random Title"),
        username: Some(secrets.bot_username),
        invite_link: None,
    };

    // // Fetch new updates via long poll method
    // let mut stream = api.stream();
    // while let Some(update) = stream.next().await {
    //     // If the received update contains a new message...
    //     let update = update.unwrap();
    //     if let UpdateKind::Message(message) = update.kind {
    //         if let MessageKind::Text { ref data, .. } = message.kind {
    //             // Print received text message to stdout.
    //             println!("<{}>: {}", &message.from.first_name, data);

    //             // Answer message with "Hi".
    //             api.send(message.text_reply(format!(
    //                 "Hi, {}! You just wrote '{}'",
    //                 &message.from.first_name, data
    //             )))
    //             .await.unwrap();
    //         }
    //     }
    // }

    // https://developer.mozilla.org/en-US/docs/Web/WebDriver/Capabilities/firefoxOptions
    let caps = {
        let mut caps = serde_json::map::Map::new();
        // let moz_opts = json!({ "args": ["-headless"] });
        let moz_opts = json!({});
        caps.insert("moz:firefoxOptions".to_string(), moz_opts);
        caps
    };

    let mut client = ClientBuilder::native()
        .capabilities(caps)
        .connect("http://localhost:4444")
        .await
        .expect("failed to connect to WebDriver");
    let sleep = time::sleep(Duration::from_millis(10));
    tokio::pin!(sleep);

    loop {
        let amz = store::Amazon::new("https://www.amazon.in");
        let path = format!("{}/{}", *store::PATHS.get("PRODUCT_PAGE").unwrap(), secrets.product_id);
        amz.goto(&mut client, path.as_str()).await.unwrap();

        let is_available = amz.check_availabilty(&mut client).await.unwrap();

        println!("Is Item Available: {:?}", is_available);

        match is_available {
            store::Message::Available(msg) => {
                api.send(SendMessage::new(Chat::Channel(channel), msg)).await.unwrap();
                break;
            },
            store::Message::Unavailable(_) => {
                sleep.as_mut().await;
            }
        }
    }

    client.close().await.unwrap();
}

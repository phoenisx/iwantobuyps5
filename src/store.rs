use error::CmdError;
use fantoccini::{error, Client, Locator};
use phf::phf_map;
use regex::Regex;

#[allow(dead_code)]
const INPUTS: phf::Map<&'static str, &'static str> = phf_map! {
    "EMAIL" => r#"//input[@id="ap_email" and @name="email"]"#,
    "EMAIL_SUBMIT" => r#"//span[@id='continue']"#,
    "PWD" => r#"//input[@id="ap_password" and @name="password"]"#,
    "REMEMBER_ME" =>
        r#"//input[@type="checkbox" and @name="rememberMe"]"#,
     "LOGIN_SUBMIT" =>
        r#"//input[@id="signInSubmit" and @type="submit"]"#,
    "PRODUCT_ADD_TO_CART" =>
        r#"//input[@id="add-to-cart-button" and @name="submit.add-to-cart"]"#,
    "PRE_ORDER_NOW" => r#"#buy-now-button"#,
};

#[allow(dead_code)]
const ANCHORS: phf::Map<&'static str, &'static str> = phf_map! {
    "NAV_ACCOUNT_LIST" => "//*[@id='nav-link-accountList']",
};

#[allow(dead_code)]
const ELEMENTS: phf::Map<&'static str, &'static str> = phf_map! {
    "SEARCH_ITEMS" => "//div[contains(@data-component-type, 's-search-result')]",
    "SEARCH_ITEM_TITLE" => "span.a-text-normal",
    "SEARCH_ITEM_COST" => ".a-price-whole",
    "AVAILABILITY" => r#"//div[@id="availability"]/span"#,
    "TITLE" => r#"//span[@id="productTitle"]"#,
};

#[allow(dead_code)]
pub const PATHS: phf::Map<&'static str, &'static str> = phf_map! {
    "SIGN_IN" => "/ap/signin",
    "HOMEPAGE" => "/gp/css/homepage.html",
    "SEARCH_ITEM_COST" => ".a-price-whole",
    "SEARCH" => "/search/s?k=",
    "PRODUCT_PAGE" => "/gp/product",
    "CART_PAGE" => "/gp/cart/view.html",
};

const AVAILABLE_MESSAGE: &'static str = " is now available on Amazon:";
const UNAVAILABLE_MESSAGE: &'static str = " is not yet available on Amazon";

#[derive(Debug)]
pub enum Message {
    Available(String),
    Unavailable(String),
}

pub struct Amazon {
    base_domain: String,
}

impl Amazon {
    pub fn new(base_domain: &'static str) -> Self {
        Amazon {
            base_domain: String::from(base_domain),
        }
    }
    pub async fn goto(&self, client: &mut Client, path: &str) -> Result<(), error::CmdError> {
        let mut local = self.base_domain.clone();
        local.push_str(path);
        println!("Path: {}", local);
        client.goto(local.as_str()).await
    }

    /// Returns true if PS5 is available
    pub async fn check_availabilty(&self, client: &mut Client) -> Result<Message, CmdError> {
        let is_unavailable = {
            let mut element = client
                .find(Locator::XPath(ELEMENTS.get("AVAILABILITY").unwrap()))
                .await?;
            match element.text().await {
                Ok(value) => Regex::new(r"(?i)^Currently unavailable")
                    .unwrap()
                    .is_match(value.as_str()),
                _ => false,
            }
        };
        let has_add_cart_btn = {
            match client
                .find(Locator::XPath(INPUTS.get("PRODUCT_ADD_TO_CART").unwrap()))
                .await
            {
                Ok(_) => true,
                _ => false,
            }
        };

        let title = match client
            .find(Locator::XPath(ELEMENTS.get("TITLE").unwrap()))
            .await
        {
            Ok(mut element) => element.text().await.unwrap(),
            _ => "Unknown".to_string(),
        };
        let url = client.current_url().await.unwrap().to_string();

        if !is_unavailable && has_add_cart_btn {
            Ok(Message::Available(
                format!("{}{}{}", title, AVAILABLE_MESSAGE, url).to_string(),
            ))
        } else {
            Ok(Message::Unavailable(
                format!("{}{}", title, UNAVAILABLE_MESSAGE).to_string(),
            ))
        }
    }
}

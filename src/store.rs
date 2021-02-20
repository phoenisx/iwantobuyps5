use fantoccini::{error, Client};
use phf::phf_map;

#[allow(dead_code)]
const INPUTS: phf::Map<&'static str, &'static str> = phf_map! {
    "EMAIL" => "//input[@id='ap_email' and @name='email']",
    "EMAIL_SUBMIT" => "//span[@id='continue']",
    "PWD" => "//input[@id=\"ap_password\" and @name=\"password\"]",
    "REMEMBER_ME" =>
        "//input[@type=\"checkbox\" and @name=\"rememberMe\"]",
     "LOGIN_SUBMIT" =>
        "//input[@id=\"signInSubmit\" and @type=\"submit\"]",
    "PRODUCT_ADD_TO_CART" =>
        "//input[@id=\"add-to-cart-button\" and @name=\"submit.add-to-cart\"]",
    "PRE_ORDER_NOW" => "#buy-now-button",
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

const available: &'static str = "PS5 is available now on Amazon: {}";
const unavailable: &'static str = "PS5 is not yet available on Amazon";

enum Message {
    Available(String),
    Unavailable(String)
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
}

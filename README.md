# I Want to Buy PS5

Telegram bot to notify PS5 availability.

For now it's not customizable, as it's for personal
use. Please feel free to raise PR/issues, if more support
needs to be added

> NOTE: Previous NodeJS code was more versatile as it
> was trying to search and get the product id dynamically.
> Doing such an operation takes time, specially on
> networks having high latency. Since PS5
> is now globally available, and product id for Amazon
> India has been generated, I have simplified the code
> to just look for the item, and no extra searches are
> required.

## Setup

* This project uses `config` rust crate, which is use to
  manage Secrets.

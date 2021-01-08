import { DEFAULTS, ElementDetails, Store } from './base';
import { asyncSome, clickAndNavigate, logger, sleep } from '@src/utils';
import { BehaviorSubject } from 'rxjs';
import notifier from 'node-notifier';

const ANCHORS = {
  NAV_ACCOUNT_LIST: '//*[@id="nav-link-accountList"]',
};
/**
 * PS5 Buy Page - https://www.amazon.in/gp/product/B08FV5GC28
 */
const INPUTS = {
  EMAIL: '//input[@id="ap_email" and @name="email"]',
  EMAIL_SUBMIT: '//span[@id="continue"]',
  PWD: '//input[@id="ap_password" and @name="password"]',
  REMEMBER_ME: '//input[@type="checkbox" and @name="rememberMe"]',
  LOGIN_SUBMIT: '//input[@id="signInSubmit" and @type="submit"]',
  PRODUCT_ADD_TO_CART:
    '//input[@id="add-to-cart-button" and @name="submit.add-to-cart"]',
  PRE_ORDER_NOW: '#buy-now-button'.
};

const ELEMENTS = {
  SEARCH_ITEMS: '//div[contains(@data-component-type, "s-search-result")]',
  SEARCH_ITEM_TITLE: 'span.a-text-normal',
  SEARCH_ITEM_COST: '.a-price-whole',
};

const LINKS = {
  SIGN_IN: 'https://www.amazon.in/ap/signin',
  HOMEPAGE: 'https://www.amazon.in/gp/css/homepage.html',
  SEARCH: 'https://www.amazon.in/search/s?k=',
  PRODUCT_PAGE: 'https://www.amazon.in/gp/product',
  CART_PAGE: 'https://www.amazon.in/gp/cart/view.html',
};

export class Amazon extends Store {
  isLoginInProgress = false;
  login$ = new BehaviorSubject<boolean>(false);

  // Will search approx for an hour, with 500ms delay, depending on network speed
  async search(
    item: string,
    priceRange: number[],
    xorSearchTerms = [] as RegExp[],
    delay = 500,
    maxRepeat = 7200
  ) {
    let itemFound = false;
    let counter = 0;
    let itemDetails = null;
    do {
      await this.page.goto(`${LINKS.SEARCH}${encodeURIComponent(item)}`, {
        waitUntil: 'networkidle2',
      });
      const results = await this.page.$x(ELEMENTS.SEARCH_ITEMS);
      itemDetails = null;
      if (results.length > 0) {
        itemFound = await asyncSome(results, async (element, index) => {
          const elDetails = await element.evaluate(
            (node: HTMLElement, elms: typeof ELEMENTS) => {
              const id = node.dataset['asin'];
              const title = node.querySelector<HTMLAnchorElement>(
                elms.SEARCH_ITEM_TITLE
              );
              const cost = node.querySelector(elms.SEARCH_ITEM_COST);
              return title
                ? {
                    id: id || '',
                    title: title.textContent || '',
                    cost: cost?.textContent
                      ? parseInt(cost.textContent.replace(/[-,.]/, ''), 10)
                      : -1,
                  }
                : null;
            },
            ELEMENTS,
            index
          );
          let matched = false;
          if (elDetails && xorSearchTerms.length > 0) {
            if (xorSearchTerms.length === 1) {
              matched = !!elDetails.title.match(xorSearchTerms[0]);
            } else {
              matched = !!xorSearchTerms.reduce((acc, term) => {
                return acc ^ +!!elDetails.title.match(term);
              }, +!!elDetails.title.match(xorSearchTerms[0]));
            }
          }
          if (matched) {
            const isInRange =
              elDetails.cost > priceRange[0] && elDetails.cost < priceRange[1];
            itemDetails = elDetails;
            if (isInRange) {
              console.log('Item Found: ', elDetails);
              notifier.notify({
                title: `Item Found ${elDetails.title}`,
                sound: true,
                subtitle: `${elDetails.id}: ${elDetails.cost}`,
              });
            } else {
              console.log('Item Not Found: ', elDetails.id);
            }
            return isInRange;
          }
          return false;
        });
        if (itemFound) {
          counter = maxRepeat;
        }
      } else {
        itemFound = false;
      }
      await sleep(delay);
      counter++;
    } while (counter < maxRepeat);
    return {
      ele: itemDetails,
      itemFound,
    };
  }
  async login() {
    this.isLoginInProgress = true;
    await this.page.goto('https://www.amazon.in', {
      waitUntil: 'networkidle2',
    });
    const accountLink = await this.page.$x(ANCHORS.NAV_ACCOUNT_LIST);
    const [res] = await clickAndNavigate(this.page, accountLink[0]);

    if (res.url().includes(LINKS.SIGN_IN)) {
      // User is not signed in...
      try {
        const email$ = await this.page.$x(
          `${INPUTS.EMAIL} | ${INPUTS.EMAIL_SUBMIT}`
        );
        await email$[0].focus();
        process.env.EMAIL.split('').forEach(async (ch) => {
          await email$[0].type(ch);
          await sleep(300);
        });
        await this.page.waitForTimeout(DEFAULTS.DELAY_PER_CLICK);
        await clickAndNavigate(this.page, email$[1], {
          waitUntil: 'networkidle0',
        });
        const elements$ = await this.page.$x(
          `${INPUTS.PWD} | ${INPUTS.LOGIN_SUBMIT}`
        );
        const rememberMe$ = await this.page.$x(INPUTS.REMEMBER_ME);
        await elements$[0].focus();
        process.env.PASSWORD.split('').forEach(async (ch) => {
          await elements$[0].type(ch);
          await sleep(300);
        });
        await this.page.waitForTimeout(DEFAULTS.DELAY_PER_CLICK * 2);
        await rememberMe$[0].click();
        await this.page.waitForTimeout(DEFAULTS.DELAY_PER_CLICK * 4);
        await clickAndNavigate(this.page, elements$[1]);
        this.isLoggedIn = true;
        console.log('Logged In Successfully:');
      } catch (e) {
        // Login Failed
        console.error('Something went wrong: ', e);
        this.isLoggedIn = false;
      }
    } else {
      console.log('Already Logged In:');
      this.isLoggedIn = true;
    }
    this.login$.next(this.isLoggedIn);
    this.isLoginInProgress = false;
    return this.isLoggedIn;
  }

  async addToCart(itemDetails?: ElementDetails | null) {
    if (itemDetails) {
      await this.page.goto(`${LINKS.PRODUCT_PAGE}/${itemDetails.id}`, {
        waitUntil: 'networkidle2',
      });
      const addToCartBtn = await this.page.$x(INPUTS.PRODUCT_ADD_TO_CART);
      await clickAndNavigate(this.page, addToCartBtn[0]);
      console.log('Added To Cart: ', itemDetails.title, LINKS.CART_PAGE);
      notifier.notify({
        title: `Item Found ${itemDetails.title}`,
        sound: true,
        subtitle: `${itemDetails.id}: ${itemDetails.cost}`,
        open: `${LINKS.CART_PAGE}`,
      });
    }
  }
}

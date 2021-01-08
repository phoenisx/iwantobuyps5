import Puppeteer from 'puppeteer';
import dotenv from 'dotenv';

// Will convert this to Factory later on
import { Amazon } from '@src/store/amazon';
import { DEFAULTS } from '@src/store/base';
import { BehaviorSubject } from 'rxjs';
// import { logger } from '@src/utils';

dotenv.config();

const globalRx$ = new BehaviorSubject<boolean>(false);

(async () => {
  const browser1 = await Puppeteer.launch({
    headless: true,
  });
  const browser2 = await Puppeteer.launch({
    headless: true,
  });
  const page1 = await browser1.newPage();
  const page2 = await browser2.newPage();
  const store1 = new Amazon(page1);
  const store2 = new Amazon(page2);

  if (!store2.isLoggedIn) {
    await store2.login();
  }
  const { itemFound: PS5Found, ele: PS5Details } = await store1.search(
    DEFAULTS.SEARCH_TERM_PLAYSTATION,
    DEFAULTS.PRICE_RANGE_PS5,
    [DEFAULTS.SEARCH_TERM_LONG_REGEXP, DEFAULTS.SEARCH_TERM_SHORT_REGEXP],
    500,
    3600
  );

  if (PS5Found) {
    await store2.addToCart(PS5Details);
  }

  const {
    itemFound: DualSenseFound,
    ele: DualSenseDetails,
  } = await store1.search(
    DEFAULTS.SEARCH_TERM_CONTROLLER,
    DEFAULTS.PRICE_RANGE_DUALSENSE,
    [DEFAULTS.SEARCH_DUALSENSE_REGEXP],
    500,
    3600
  );

  if (!store2.isLoggedIn && DualSenseFound) {
    globalRx$.subscribe(async (isLoggedIn) => {
      if (isLoggedIn) {
        console.log('>>>>> Triggered: ', isLoggedIn);
      }

      await store2.addToCart(DualSenseDetails);

      await browser1.close();
      await browser2.close();
    });
  } else {
    globalRx$.subscribe(async () => {
      await browser1.close();
      await browser2.close();
    });
  }

  // setTimeout(async () => {

  // }, 200000);
})();

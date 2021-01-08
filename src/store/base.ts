import { Page } from 'puppeteer';

export const DEFAULTS = {
  DELAY_PER_CLICK: 1000, // To simulate login, without captcha
  SEARCH_TERM_PLAYSTATION: 'playstation 5',
  SEARCH_TERM_LONG_REGEXP: /playstation\s+5(\s+console)?/i,
  SEARCH_TERM_SHORT_REGEXP: /ps5(\s+console)?/i,
  PRICE_RANGE_PS5: [45000, 54000],
  SEARCH_TERM_CONTROLLER: 'dualsense controller',
  SEARCH_DUALSENSE_REGEXP: /dualsense[\S\s]*controller/i,
  PRICE_RANGE_DUALSENSE: [5000, 7000],
};

export interface ElementDetails {
  id: string;
  cost: number;
  title: string;
}

export abstract class Store {
  page: Page;
  isLoggedIn: boolean;

  constructor(page: Page) {
    this.page = page;
    this.isLoggedIn = false;
  }

  /**
   * This method is used to login a user to any store
   * that extends this class
   *
   * @returns {boolean} true is succeeds else false
   */
  abstract async login(): Promise<boolean>;

  /**
   * Search PS5 specifically for now, as the logic right now
   * is very naive and might fail, coz there are multiple item
   * titles with same name that pops up for PS5 or PS4 console search
   * out of which 1st result is most likely the one we are looking
   * for, but u may never know!!
   *
   * @param item Search Term, that will be sent to a store to get results
   * @param xorSearchTerms Terms that are exclusive ORs to each other
   * @param iterationDelay Delay per saerch iteration
   * @param maxRepeat Max amount times the program should search for the term
   *
   * @returns Is item found, if yes it's Product Id that we can
   *  use later on, to add to cart.
   */
  abstract async search(
    item: string,
    priceRange: number[],
    xorSearchTerms?: RegExp[],
    iterationDelay?: number,
    maxRepeat?: number
  ): Promise<{
    itemFound: boolean;
    ele: ElementDetails | null;
  }>;
}

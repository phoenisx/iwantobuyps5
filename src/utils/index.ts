import { ElementHandle, NavigationOptions, Page, Response } from 'puppeteer';

export const clickAndNavigate = (
  page: Page,
  element: ElementHandle<any>,
  config: NavigationOptions = {
    waitUntil: 'networkidle2',
  }
): Promise<[Response, void]> =>
  Promise.all([page.waitForNavigation(config), element.click()]);

export const asyncSome = async (arr, predicate) => {
  for (const key in arr) {
    if (await predicate(arr[key], key)) {
      return true;
    }
  }
  return false;
};

export const sleep = (timeout) =>
  new Promise((res) =>
    setTimeout(() => {
      res();
    }, timeout)
  );

export { logger } from './bunyan';

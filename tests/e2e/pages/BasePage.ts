import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object Model
 * Provides common functionality for all page objects
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a URL
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for page to be loaded
   */
  async waitForLoadState(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click an element
   */
  async click(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  /**
   * Fill an input field
   */
  async fill(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  /**
   * Get text from an element
   */
  async getText(selector: string): Promise<string> {
    return await this.page.textContent(selector) || '';
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisible(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForHidden(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'hidden' });
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  /**
   * Take screenshot
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  /**
   * Hover over element
   */
  async hover(selector: string): Promise<void> {
    await this.page.hover(selector);
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string): Promise<void> {
    await this.page.selectOption(selector, value);
  }

  /**
   * Check checkbox
   */
  async check(selector: string): Promise<void> {
    await this.page.check(selector);
  }

  /**
   * Uncheck checkbox
   */
  async uncheck(selector: string): Promise<void> {
    await this.page.uncheck(selector);
  }

  /**
   * Upload file
   */
  async upload(selector: string, filePath: string): Promise<void> {
    await this.page.setInputFiles(selector, filePath);
  }

  /**
   * Get URL
   */
  getUrl(): string {
    return this.page.url();
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    await this.page.reload();
  }

  /**
   * Go back
   */
  async back(): Promise<void> {
    await this.page.goBack();
  }

  /**
   * Go forward
   */
  async forward(): Promise<void> {
    await this.page.goForward();
  }

  /**
   * Press keyboard key
   */
  async keyboardPress(key: string): Promise<void> {
    await this.page.keyboard.press(key);
  }

  /**
   * Type text
   */
  async type(selector: string, text: string): Promise<void> {
    await this.page.type(selector, text);
  }

  /**
   * Clear input field
   */
  async clear(selector: string): Promise<void> {
    await this.page.fill(selector, '');
  }

  /**
   * Get attribute value
   */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    return await this.page.getAttribute(selector, attribute);
  }

  /**
   * Wait for timeout
   */
  async wait(timeout: number): Promise<void> {
    await this.page.waitForTimeout(timeout);
  }

  /**
   * Evaluate JavaScript in page context
   */
  async evaluate<T>(pageFunction: () => T): Promise<T> {
    return await this.page.evaluate(pageFunction);
  }

  /**
   * Wait for API response
   */
  async waitForResponse(urlPattern: string | RegExp): Promise<void> {
    await this.page.waitForResponse(urlPattern);
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get all text content from multiple elements
   */
  async getAllText(selector: string): Promise<string[]> {
    return await this.page.$$eval(selector, elements =>
      elements.map(el => el.textContent || '')
    );
  }

  /**
   * Count elements
   */
  async countElements(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string): Promise<void> {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Verify element contains text
   */
  async verifyTextContains(selector: string, text: string): Promise<void> {
    await expect(this.page.locator(selector)).toContainText(text);
  }

  /**
   * Verify element has exact text
   */
  async verifyTextEquals(selector: string, text: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveText(text);
  }

  /**
   * Verify element is visible
   */
  async verifyVisible(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Verify element is hidden
   */
  async verifyHidden(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeHidden();
  }

  /**
   * Verify URL contains
   */
  async verifyUrlContains(url: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(url));
  }

  /**
   * Verify element has attribute
   */
  async verifyAttribute(selector: string, attribute: string, value: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveAttribute(attribute, value);
  }

  /**
   * Verify element is enabled
   */
  async verifyEnabled(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeEnabled();
  }

  /**
   * Verify element is disabled
   */
  async verifyDisabled(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeDisabled();
  }

  /**
   * Verify element is checked
   */
  async verifyChecked(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeChecked();
  }

  /**
   * Set viewport size
   */
  async setViewport(width: number, height: number): Promise<void> {
    await this.page.setViewportSize({ width, height });
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Handle alert
   */
  async handleAlert(accept: boolean): Promise<void> {
    this.page.on('dialog', async dialog => {
      accept ? dialog.accept() : dialog.dismiss();
    });
  }

  /**
   * Execute in parallel context (access shadow DOM, iframes)
   */
  async locateInShadowDOM(hostSelector: string, shadowSelector: string): Promise<Locator> {
    const host = this.page.locator(hostSelector);
    return host.locator('shadow-root').locator(shadowSelector);
  }

  /**
   * Switch to iframe
   */
  async switchToIframe(selector: string): Promise<void> {
    const frame = this.page.frameLocator(selector);
    return frame.page();
  }

  /**
   * Wait for element to be attached to DOM
   */
  async waitForAttached(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'attached' });
  }

  /**
   * Wait for element to be detached from DOM
   */
  async waitForDetached(selector: string): Promise<void> {
    await this.page.waitForSelector(selector, { state: 'detached' });
  }

  /**
   * Verify element has class
   */
  async verifyHasClass(selector: string, className: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveClass(new RegExp(className));
  }

  /**
   * Verify element has focus
   */
  async verifyHasFocus(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toBeFocused();
  }

  /**
   * Get element count
   */
  async getElementCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  /**
   * Verify element count equals
   */
  async verifyElementCount(selector: string, count: number): Promise<void> {
    await expect(this.page.locator(selector)).toHaveCount(count);
  }

  /**
   * Verify element exists
   */
  async verifyExists(selector: string): Promise<void> {
    await expect(this.page.locator(selector).first()).toBeAttached();
  }

  /**
   * Verify element not exists
   */
  async verifyNotExists(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveCount(0);
  }

  /**
   * Get CSS property value
   */
  async getCSSProperty(selector: string, property: string): Promise<string> {
    const element = this.page.locator(selector);
    return await element.evaluate((el: any, prop) =>
      window.getComputedStyle(el).getPropertyValue(prop), property);
  }

  /**
   * Verify CSS property
   */
  async verifyCSSProperty(selector: string, property: string, value: string): Promise<void> {
    const actualValue = await this.getCSSProperty(selector, property);
    expect(actualValue).toContain(value);
  }

  /**
   * Get bounding box
   */
  async getBoundingBox(selector: string) {
    return await this.page.locator(selector).boundingBox();
  }

  /**
   * Verify element is in viewport
   */
  async verifyInViewport(selector: string): Promise<void> {
    const box = await this.getBoundingBox(selector);
    expect(box).toBeTruthy();
    const viewportSize = this.page.viewportSize();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewportSize!.height);
  }

  /**
   * Drag and drop
   */
  async dragAndDrop(source: string, target: string): Promise<void> {
    await this.page.dragAndDrop(source, target);
  }

  /**
   * Right click
   */
  async rightClick(selector: string): Promise<void> {
    await this.page.click(selector, { button: 'right' });
  }

  /**
   * Double click
   */
  async doubleClick(selector: string): Promise<void> {
    await this.page.dblclick(selector);
  }

  /**
   * Hover and click
   */
  async hoverAndClick(hoverSelector: string, clickSelector: string): Promise<void> {
    await this.hover(hoverSelector);
    await this.click(clickSelector);
  }

  /**
   * Type with delay
   */
  async typeWithDelay(selector: string, text: string, delay: number): Promise<void> {
    await this.page.type(selector, text, { delay });
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(title: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(title));
  }

  /**
   * Verify input value
   */
  async verifyInputValue(selector: string, value: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveValue(value);
  }

  /**
   * Get input value
   */
  async getInputValue(selector: string): Promise<string> {
    return await this.page.inputValue(selector);
  }

  /**
   * Verify element is editable
   */
  async verifyEditable(selector: string): Promise<void> {
    const isEditable = await this.page.locator(selector).isEditable();
    expect(isEditable).toBe(true);
  }

  /**
   * Verify element is readonly
   */
  async verifyReadonly(selector: string): Promise<void> {
    const isEditable = await this.page.locator(selector).isEditable();
    expect(isEditable).toBe(false);
  }

  /**
   * Scroll to top
   */
  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  /**
   * Scroll to bottom
   */
  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  /**
   * Scroll by amount
   */
  async scrollBy(x: number, y: number): Promise<void> {
    await this.page.evaluate((scrollX, scrollY) => {
      window.scrollBy(scrollX, scrollY);
    }, x, y);
  }

  /**
   * Wait for selector state
   */
  async waitForSelectorState(selector: string, state: 'attached' | 'detached' | 'visible' | 'hidden'): Promise<void> {
    await this.page.waitForSelector(selector, { state });
  }

  /**
   * Get all attributes
   */
  async getAllAttributes(selector: string): Promise<Record<string, string>> {
    return await this.page.locator(selector).evaluate((el: any) => {
      const attrs: Record<string, string> = {};
      for (const attr of el.attributes) {
        attrs[attr.name] = attr.value;
      }
      return attrs;
    });
  }

  /**
   * Verify element order
   */
  async verifyElementOrder(upperSelector: string, lowerSelector: string): Promise<void> {
    const upperBox = await this.getBoundingBox(upperSelector);
    const lowerBox = await this.getBoundingBox(lowerSelector);
    expect(upperBox!.y).toBeLessThan(lowerBox!.y);
  }

  /**
   * Get computed font size
   */
  async getFontSize(selector: string): Promise<string> {
    return await this.getCSSProperty(selector, 'font-size');
  }

  /**
   * Verify font size
   */
  async verifyFontSize(selector: string, size: string): Promise<void> {
    await this.verifyCSSProperty(selector, 'font-size', size);
  }

  /**
   * Get computed color
   */
  async getColor(selector: string): Promise<string> {
    return await this.getCSSProperty(selector, 'color');
  }

  /**
   * Verify color
   */
  async verifyColor(selector: string, color: string): Promise<void> {
    await this.verifyCSSProperty(selector, 'color', color);
  }

  /**
   * Get background color
   */
  async getBackgroundColor(selector: string): Promise<string> {
    return await this.getCSSProperty(selector, 'background-color');
  }

  /**
   * Verify background color
   */
  async verifyBackgroundColor(selector: string, color: string): Promise<void> {
    await this.verifyCSSProperty(selector, 'background-color', color);
  }

  /**
   * Verify element width
   */
  async verifyWidth(selector: string, width: number): Promise<void> {
    const box = await this.getBoundingBox(selector);
    expect(box!.width).toBe(width);
  }

  /**
   * Verify element height
   */
  async verifyHeight(selector: string, height: number): Promise<void> {
    const box = await this.getBoundingBox(selector);
    expect(box!.height).toBe(height);
  }

  /**
   * Get element text content (including hidden)
   */
  async getInnerText(selector: string): Promise<string> {
    return await this.page.locator(selector).innerText();
  }

  /**
   * Get inner HTML
   */
  async getInnerHTML(selector: string): Promise<string> {
    return await this.page.locator(selector).innerHTML();
  }

  /**
   * Verify inner HTML contains
   */
  async verifyInnerHTMLContains(selector: string, html: string): Promise<void> {
    const innerHTML = await this.getInnerHTML(selector);
    expect(innerHTML).toContain(html);
  }

  /**
   * Verify placeholder text
   */
  async verifyPlaceholder(selector: string, placeholder: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveAttribute('placeholder', placeholder);
  }

  /**
   * Get tab index
   */
  async getTabIndex(selector: string): Promise<number> {
    const tabIndex = await this.page.locator(selector).getAttribute('tabindex');
    return tabIndex ? parseInt(tabIndex) : -1;
  }

  /**
   * Verify tab index
   */
  async verifyTabIndex(selector: string, index: number): Promise<void> {
    const actualIndex = await this.getTabIndex(selector);
    expect(actualIndex).toBe(index);
  }

  /**
   * Verify ARIA label
   */
  async verifyAriaLabel(selector: string, label: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveAttribute('aria-label', label);
  }

  /**
   * Get ARIA role
   */
  async getAriaRole(selector: string): Promise<string | null> {
    return await this.page.locator(selector).getAttribute('role');
  }

  /**
   * Verify ARIA role
   */
  async verifyAriaRole(selector: string, role: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveAttribute('role', role);
  }

  /**
   * Verify accessibility tree
   */
  async verifyAccessibilityTree(): Promise<void> {
    const snapshot = await this.page.accessibility.snapshot();
    expect(snapshot).toBeTruthy();
  }

  /**
   * Get all console messages
   */
  getConsoleMessages(): string[] {
    const messages: string[] = [];
    this.page.on('console', msg => {
      messages.push(msg.text());
    });
    return messages;
  }

  /**
   * Verify no console errors
   */
  async verifyNoConsoleErrors(): Promise<void> {
    const errors: string[] = [];
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    await this.page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  }

  /**
   * Mock API response
   */
  async mockAPI(urlPattern: string, response: any): Promise<void> {
    await this.page.route(urlPattern, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify(response),
      });
    });
  }

  /**
   * Wait for download
   */
  async waitForDownload(selector: string) {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.click(selector),
    ]);
    return download;
  }

  /**
   * Verify PDF downloaded
   */
  async verifyPDFDownloaded(selector: string): Promise<void> {
    const download = await this.waitForDownload(selector);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  }

  /**
   * Verify file downloaded
   */
  async verifyFileDownloaded(selector: string, extension: string): Promise<void> {
    const download = await this.waitForDownload(selector);
    expect(download.suggestedFilename()).toMatch(new RegExp(`\\.${extension}$`));
  }
}

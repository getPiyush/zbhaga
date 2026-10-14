import { Page } from '@playwright/test';

/**
 * Robust element finder that tries multiple selector strategies
 * Useful when element IDs might vary between environments
 */

export class ElementFinder {
  constructor(private page: Page) {}

  /**
   * Find an element by trying multiple selector strategies
   */
  async findElement(hints: {
    testid?: string;
    name?: string;
    id?: string;
    type?: string;
    placeholder?: string;
    label?: string;
    ariaLabel?: string;
    role?: string;
    selector?: string;
  }) {
    const selectors = this.buildSelectors(hints);

    console.log(`🔍 Finding element with hints:`, hints);
    console.log(`   Trying ${selectors.length} selector variations...\n`);

    for (const selector of selectors) {
      try {
        const element = this.page.locator(selector);
        const count = await element.count();

        if (count > 0) {
          console.log(`   ✅ Found with: ${selector}`);
          return element;
        }
      } catch (error) {
        // Selector didn't work, try next
      }
    }

    // If nothing found, provide diagnostics
    console.log('❌ Element not found with any selector\n');
    await this.providePageDiagnostics();
    throw new Error(`Cannot find element with hints: ${JSON.stringify(hints)}`);
  }

  /**
   * Fill a field by finding it robustly
   */
  async fillField(hints: {
    testid?: string;
    name?: string;
    id?: string;
    type?: string;
    placeholder?: string;
    ariaLabel?: string;
  }, value: string) {
    const element = await this.findElement(hints);
    await element.fill(value);
    return element;
  }

  /**
   * Click a button by finding it robustly
   */
  async clickButton(hints: {
    testid?: string;
    text?: string;
    id?: string;
    ariaLabel?: string;
  }) {
    const element = await this.findElement(hints);
    await element.click();
    return element;
  }

  /**
   * Build multiple selector variations
   */
  private buildSelectors(hints: any): string[] {
    const selectors: string[] = [];

    // 1. data-testid (most specific)
    if (hints.testid) {
      selectors.push(`[data-testid="${hints.testid}"]`);
    }

    // 2. aria-label
    if (hints.ariaLabel) {
      selectors.push(`[aria-label="${hints.ariaLabel}"]`);
    }

    // 3. ID
    if (hints.id) {
      selectors.push(`#${hints.id}`);
    }

    // 4. Name attribute
    if (hints.name) {
      selectors.push(`[name="${hints.name}"]`);
    }

    // 5. Placeholder
    if (hints.placeholder) {
      selectors.push(`[placeholder="${hints.placeholder}"]`);
      selectors.push(`input[placeholder*="${hints.placeholder.split(' ')[0]}"]`);
    }

    // 6. Type + name combination
    if (hints.type && hints.name) {
      selectors.push(`input[type="${hints.type}"][name="${hints.name}"]`);
    }

    // 7. Type only
    if (hints.type) {
      selectors.push(`input[type="${hints.type}"]`);
    }

    // 8. Label text
    if (hints.label) {
      selectors.push(`text="${hints.label}"`);
      selectors.push(`label:has-text("${hints.label}") + input`);
    }

    // 9. Button text
    if (hints.text) {
      selectors.push(`button:has-text("${hints.text}")`);
      selectors.push(`button:has-text("${hints.text.toLowerCase()}")`);
    }

    // 10. Custom selector
    if (hints.selector) {
      selectors.push(hints.selector);
    }

    // 11. Generic fallbacks
    if (hints.type === 'email') {
      selectors.push('input[type="email"]');
      selectors.push('input[type="text"][placeholder*="email"]');
      selectors.push('input[name*="email"]');
    }

    if (hints.type === 'password') {
      selectors.push('input[type="password"]');
      selectors.push('input[name*="password"]');
    }

    // Remove duplicates
    return [...new Set(selectors)];
  }

  /**
   * Provide diagnostics when element not found
   */
  private async providePageDiagnostics() {
    try {
      const html = await this.page.content();

      console.log('\n📊 Page Diagnostics:');
      console.log(`   Page Title: ${await this.page.title()}`);
      console.log(`   Page URL: ${this.page.url()}`);
      console.log(`   HTML Size: ${html.length} bytes`);

      // Count input elements
      const inputs = await this.page.locator('input').count();
      console.log(`   Input Elements: ${inputs}`);

      // Count buttons
      const buttons = await this.page.locator('button').count();
      console.log(`   Button Elements: ${buttons}`);

      // List all inputs found
      console.log('\n   Available inputs:');
      const allInputs = await this.page.locator('input').all();
      for (let i = 0; i < Math.min(5, allInputs.length); i++) {
        const input = allInputs[i];
        const attrs = await input.evaluate((el: any) => ({
          type: el.type,
          name: el.name,
          id: el.id,
          placeholder: el.placeholder,
          testid: el.getAttribute('data-testid'),
        }));
        console.log(`     ${i + 1}. ${JSON.stringify(attrs)}`);
      }

      if (allInputs.length > 5) {
        console.log(`     ... and ${allInputs.length - 5} more`);
      }

      console.log('\n   💡 Suggestion: Check the HTML or update element selectors');

    } catch (diagError) {
      console.log('   (Could not gather diagnostics)');
    }
  }
}

/**
 * Common selector sets for different element types
 */
export const ElementSelectors = {
  EMAIL_INPUT: {
    testid: 'email-input',
    name: 'email',
    type: 'email',
    placeholder: 'email',
  },
  PASSWORD_INPUT: {
    testid: 'password-input',
    name: 'password',
    type: 'password',
    placeholder: 'password',
  },
  SIGNIN_BUTTON: {
    testid: 'signin-button',
    text: 'Sign In',
    id: 'signin-btn',
  },
  SIGNUP_BUTTON: {
    testid: 'signup-button',
    text: 'Sign Up',
    id: 'signup-btn',
  },
};

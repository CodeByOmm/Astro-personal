import { siteConfig } from '../config.js';

/**
 * Generate page title with site suffix
 * @param {string} title - Page specific title
 * @returns {string} Complete page title
 */
export function generatePageTitle(title) {
  if (!title) {
    return `${siteConfig.templateName} - ${siteConfig.templateSuffix}`;
  }
  return `Demo: ${title} | ${siteConfig.templateSuffix}`;
}

/**
 * Generate meta description with fallback
 * @param {string} description - Page specific description
 * @returns {string} Meta description
 */
export function generateMetaDescription(description) {
  if (!description) {
    return `${siteConfig.templateName} - ${siteConfig.templateKeyword}`;
  }
  return description;
}

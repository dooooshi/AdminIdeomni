/**
 * Centralized Resource Icon Constants
 * 
 * This file defines standardized icons for gold and carbon resources
 * to ensure consistency across the entire application.
 */

export const RESOURCE_ICONS = {
  // Emoji symbols for display
  GOLD_EMOJI: '🪙',
  CARBON_EMOJI: '🌿',
  
  // Material-UI icon identifiers for components
  GOLD_MUI: 'MonetizationOn',
  CARBON_MUI: 'Co2',
  
  // SVG icon identifiers for components (legacy support)
  GOLD_SVG: 'heroicons-solid:currency-dollar',
  CARBON_SVG: 'heroicons-solid:leaf',
  
  // Outline versions for navigation and lighter contexts
  GOLD_SVG_OUTLINE: 'heroicons-outline:currency-dollar',
  CARBON_SVG_OUTLINE: 'heroicons-outline:leaf',
} as const;

/**
 * Resource type enum
 */
export enum ResourceType {
  GOLD = 'gold',
  CARBON = 'carbon'
}

/**
 * Get emoji symbol for resource type (legacy)
 */
export function getResourceEmoji(type: 'gold' | 'carbon'): string {
  return type === 'gold' ? RESOURCE_ICONS.GOLD_EMOJI : RESOURCE_ICONS.CARBON_EMOJI;
}

/**
 * Get Material-UI icon component for resource type
 * Note: This returns the icon name, not the component. 
 * Import and use MonetizationOn/Co2 directly in components.
 */
export function getResourceIcon(type: 'gold' | 'carbon'): 'MonetizationOn' | 'Co2' {
  return type === 'gold' ? 'MonetizationOn' : 'Co2';
}

/**
 * Get Material-UI icon name for resource type
 */
export function getResourceMuiIcon(type: 'gold' | 'carbon'): string {
  return type === 'gold' ? RESOURCE_ICONS.GOLD_MUI : RESOURCE_ICONS.CARBON_MUI;
}

/**
 * Get SVG icon identifier for resource type
 */
export function getResourceSvgIcon(type: 'gold' | 'carbon', outline = false): string {
  const isGold = type === 'gold';
  
  if (outline) {
    return isGold ? RESOURCE_ICONS.GOLD_SVG_OUTLINE : RESOURCE_ICONS.CARBON_SVG_OUTLINE;
  }
  
  return isGold ? RESOURCE_ICONS.GOLD_SVG : RESOURCE_ICONS.CARBON_SVG;
}

/**
 * Format resource value with appropriate emoji (legacy)
 */
export function formatResourceWithIcon(value: number, type: 'gold' | 'carbon'): string {
  const emoji = getResourceEmoji(type);
  return `${emoji} ${new Intl.NumberFormat('en-US').format(value)}`;
}

/**
 * Format resource value (use with Material-UI icons in components)
 */
export function formatResourceValue(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
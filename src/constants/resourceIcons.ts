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
  
  // SVG icon identifiers for components
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
 * Get emoji symbol for resource type
 */
export function getResourceEmoji(type: 'gold' | 'carbon'): string {
  return type === 'gold' ? RESOURCE_ICONS.GOLD_EMOJI : RESOURCE_ICONS.CARBON_EMOJI;
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
 * Format resource value with appropriate emoji
 */
export function formatResourceWithIcon(value: number, type: 'gold' | 'carbon'): string {
  const emoji = getResourceEmoji(type);
  return `${emoji} ${new Intl.NumberFormat('en-US').format(value)}`;
}
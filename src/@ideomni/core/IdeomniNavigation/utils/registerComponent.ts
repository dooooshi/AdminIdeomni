import components from './components';

/**
 * Register a component to IdeomniNavItem.
 */
export function registerComponent<T = unknown>(name: string, Component: React.FC<T>) {
	components[name] = Component as React.FC<unknown>;
}

'use client';

import * as React from 'react';
import { useMemo, useRef } from 'react';
import rtlPlugin from 'stylis-plugin-rtl';
import IdeomniTheme from '@ideomni/core/IdeomniTheme';
import { useMainTheme } from '@ideomni/core/IdeomniSettings/hooks/IdeomniThemeHooks';
import createCache, { Options, StylisPlugin } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

type MainThemeProviderProps = {
	children: React.ReactNode;
};

const wrapInLayer: (layerName: string) => StylisPlugin = (layerName) => (node) => {
	if (node.root) {
		return;
	}

	// if we're at the root, replace node with `@layer layerName { node }`
	const child = { ...node, parent: node, root: node };
	Object.assign(node, {
		children: [child],
		length: 6,
		parent: null,
		props: [layerName],
		return: '',
		root: null,
		type: '@layer',
		value: `@layer ${layerName}`
	});
};

const emotionCacheOptions: Record<string, Options> = {
	rtl: {
		key: 'muirtl',
		stylisPlugins: [rtlPlugin, wrapInLayer('mui')],
		prepend: false
	},
	ltr: {
		key: 'muiltr',
		stylisPlugins: [wrapInLayer('mui')],
		prepend: false
	}
};

function MainThemeProvider({ children }: MainThemeProviderProps) {
	const mainTheme = useMainTheme();
	const langDirection = mainTheme?.direction;
	
	// Cache references to avoid recreation unless direction actually changes
	const cacheRefs = useRef<Record<string, ReturnType<typeof createCache>>>({});
	
	const cacheProviderValue = useMemo(() => {
		// Return existing cache if direction hasn't changed
		if (cacheRefs.current[langDirection]) {
			return cacheRefs.current[langDirection];
		}
		
		// Create new cache only when direction changes
		const newCache = createCache(emotionCacheOptions[langDirection]);
		cacheRefs.current[langDirection] = newCache;
		
		// Clean up old cache to prevent memory leaks
		const otherDirection = langDirection === 'rtl' ? 'ltr' : 'rtl';
		if (cacheRefs.current[otherDirection]) {
			delete cacheRefs.current[otherDirection];
		}
		
		return newCache;
	}, [langDirection]);

	return (
		<CacheProvider value={cacheProviderValue}>
			<IdeomniTheme
				theme={mainTheme}
				root
			>
				{children}
			</IdeomniTheme>
		</CacheProvider>
	);
}

export default MainThemeProvider;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	reactStrictMode: true, // Enable React Strict Mode for better performance debugging
	eslint: {
		// Only enable ESLint in development
		ignoreDuringBuilds: process.env.NODE_ENV === 'production'
	},
	typescript: {
		// Enable strict type checking - fail build on type errors
		ignoreBuildErrors: false
	},
	// Optimize webpack for better HMR performance
	webpack: (config, { dev, isServer }) => {
		if (config.module && config.module.rules) {
			config.module.rules.push({
				test: /\.(json|js|ts|tsx|jsx)$/,
				resourceQuery: /raw/,
				use: 'raw-loader'
			});
		}

		// Improve HMR performance in development
		if (dev && !isServer) {
			config.watchOptions = {
				poll: 1000,
				aggregateTimeout: 300,
			};
		}

		return config;
	},
	// Enable experimental features for better performance
	experimental: {
		optimizePackageImports: ['@mui/material', '@mui/icons-material'],
	},
};

export default nextConfig;

import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Admin Sign In - Ideomni',
	description: 'Secure administrator access to the Ideomni system',
	robots: {
		index: false,
		follow: false,
	},
};

export default function AdminSignInLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
} 
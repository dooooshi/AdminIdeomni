'use client';

import { GuestGuard } from 'src/lib/auth';
import { AdminSignInPage } from 'src/components/auth';

export default function AdminSignIn() {
	return (
		<GuestGuard>
			<AdminSignInPage />
		</GuestGuard>
	);
} 
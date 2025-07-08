'use client';

import { GuestGuard } from 'src/lib/auth';
import { SignInPage } from '@/components/auth';

function Page() {
	return (
		<GuestGuard>
			<SignInPage />
		</GuestGuard>
	);
}

export default Page;

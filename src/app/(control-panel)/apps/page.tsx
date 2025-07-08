import { redirect } from 'next/navigation';

function AppsPage() {
	redirect(`/apps/e-commerce/products`);
	return null;
}

export default AppsPage;

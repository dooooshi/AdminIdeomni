import MainLayout from 'src/components/MainLayout';
import { AuthGuard } from 'src/lib/auth';

function Layout({ children }) {
	return (
		<AuthGuard requireAuth={true}>
			<MainLayout>{children}</MainLayout>
		</AuthGuard>
	);
}

export default Layout;

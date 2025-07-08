'use client';

import { useEffect, useState } from 'react';
import IdeomniPageSimple from '@ideomni/core/IdeomniPageSimple';
import { styled } from '@mui/material/styles';
import useThemeMediaQuery from '@ideomni/hooks/useThemeMediaQuery';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import CryptoDashboardAppHeader from './CryptoDashboardAppHeader';
import CryptoDashboardAppSidebar from './CryptoDashboardAppSidebar';
import CryptoDashboardAppContent from './CryptoDashboardAppContent';
import { useGetCryptoDashboardWidgetsQuery } from './CryptoDashboardApi';

const Root = styled(IdeomniPageSimple)(({ theme }) => ({
	'& .IdeomniPageSimple-header': {
		backgroundColor: theme.vars.palette.background.paper,
		borderBottomWidth: 1,
		borderBottomColor: theme.vars.palette.divider
	},
	'& .IdeomniPageSimple-toolbar': {},
	'& .IdeomniPageSimple-content': {},
	'& .IdeomniPageSimple-sidebarHeader': {},
	'& .IdeomniPageSimple-sidebarContent': {
		backgroundColor: theme.vars.palette.background.default
	}
}));

/**
 * The CryptoDashboardApp page.
 */
function CryptoDashboardApp() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);

	const { data: widgets, isLoading } = useGetCryptoDashboardWidgetsQuery();

	useEffect(() => {
		setLeftSidebarOpen(!isMobile);
	}, [isMobile]);

	if (!widgets) {
		return null;
	}

	if (isLoading) {
		return <IdeomniLoading />;
	}

	return (
		<Root
			header={<CryptoDashboardAppHeader onToggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)} />}
			leftSidebarContent={<CryptoDashboardAppSidebar />}
			leftSidebarOpen={leftSidebarOpen}
			leftSidebarOnClose={() => setLeftSidebarOpen(false)}
			leftSidebarWidth={320}
			content={<CryptoDashboardAppContent />}
		/>
	);
}

export default CryptoDashboardApp;

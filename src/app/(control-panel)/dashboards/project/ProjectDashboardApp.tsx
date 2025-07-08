'use client';

import IdeomniPageSimple from '@ideomni/core/IdeomniPageSimple';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import * as React from 'react';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import IdeomniTabs from 'src/components/tabs/IdeomniTabs';
import IdeomniTab from 'src/components/tabs/IdeomniTab';
import ProjectDashboardAppHeader from './ProjectDashboardAppHeader';
import HomeTab from './tabs/home/HomeTab';
import TeamTab from './tabs/team/TeamTab';
import BudgetTab from './tabs/budget/BudgetTab';
import { useGetProjectDashboardWidgetsQuery } from './ProjectDashboardApi';

const Root = styled(IdeomniPageSimple)(({ theme }) => ({
	'& .IdeomniPageSimple-header': {
		backgroundColor: theme.vars.palette.background.paper,
		boxShadow: `inset 0 -1px 0 0px  ${theme.vars.palette.divider}`
	}
}));

/**
 * The ProjectDashboardApp page.
 */
function ProjectDashboardApp() {
	const { isLoading } = useGetProjectDashboardWidgetsQuery();

	const [tabValue, setTabValue] = useState('home');

	function handleTabChange(event: React.SyntheticEvent, value: string) {
		setTabValue(value);
	}

	if (isLoading) {
		return <IdeomniLoading />;
	}

	return (
		<Root
			header={<ProjectDashboardAppHeader />}
			content={
				<div className="w-full pt-4 sm:pt-6">
					<div className="w-full px-6 md:px-8">
						<IdeomniTabs
							value={tabValue}
							onChange={handleTabChange}
							aria-label="New user tabs"
						>
							<IdeomniTab
								value="home"
								label="Home"
							/>
							<IdeomniTab
								value="budget"
								label="Budget"
							/>
							<IdeomniTab
								value="team"
								label="Team"
							/>
						</IdeomniTabs>
					</div>
					{tabValue === 'home' && <HomeTab />}
					{tabValue === 'budget' && <BudgetTab />}
					{tabValue === 'team' && <TeamTab />}
				</div>
			}
		/>
	);
}

export default ProjectDashboardApp;

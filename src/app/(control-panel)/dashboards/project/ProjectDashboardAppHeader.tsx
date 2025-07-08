import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import _ from 'lodash';
import Button from '@mui/material/Button';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import { useAuth, useUserDisplayName } from 'src/lib/auth';
import { useGetProjectDashboardProjectsQuery } from './ProjectDashboardApi';

/**
 * The ProjectDashboardAppHeader page.
 */
function ProjectDashboardAppHeader() {
	const { data: projects } = useGetProjectDashboardProjectsQuery();

	const { user, isAuthenticated } = useAuth();
	const displayName = useUserDisplayName();

	const [selectedProject, setSelectedProject] = useState<{ id: number; menuEl: HTMLElement | null }>({
		id: 1,
		menuEl: null
	});

	function handleChangeProject(id: number) {
		setSelectedProject({
			id,
			menuEl: null
		});
	}

	function handleOpenProjectMenu(event: React.MouseEvent<HTMLElement>) {
		setSelectedProject({
			id: selectedProject.id,
			menuEl: event.currentTarget
		});
	}

	function handleCloseProjectMenu() {
		setSelectedProject({
			id: selectedProject.id,
			menuEl: null
		});
	}

	return (
		<div className="flex flex-col w-full px-6 sm:px-8">
			<div className="flex flex-col sm:flex-row flex-auto sm:items-center min-w-0 my-8 sm:my-12">
				<div className="flex flex-auto items-start min-w-0">
					<div className="flex flex-col min-w-0 mx-4">
						<PageBreadcrumb />
						<Typography className="text-2xl md:text-5xl font-semibold tracking-tight leading-7 md:leading-[1.375] truncate">
							{!isAuthenticated ? 'Hi Guest!' : `Welcome back, ${displayName}!`}
						</Typography>

						<div className="flex items-center">
							<IdeomniSvgIcon
								size={20}
								color="action"
							>
								heroicons-solid:bell
							</IdeomniSvgIcon>
							<Typography
								className="mx-1.5 leading-6 truncate"
								color="text.secondary"
							>
								You have 2 new messages and 15 new tasks
							</Typography>
						</div>
					</div>
				</div>
				<div className="flex items-center mt-6 sm:mt-0 sm:mx-2 space-x-2">
					<Button
						className="whitespace-nowrap"
						variant="contained"
						color="primary"
						startIcon={<IdeomniSvgIcon size={20}>heroicons-solid:envelope</IdeomniSvgIcon>}
					>
						Messages (removed)
					</Button>
					<Button
						className="whitespace-nowrap"
						variant="contained"
						color="secondary"
						startIcon={<IdeomniSvgIcon size={20}>heroicons-solid:cog-6-tooth</IdeomniSvgIcon>}
					>
						Settings (removed)
					</Button>
				</div>
			</div>
			<div className="flex items-center">
				<Button
					onClick={handleOpenProjectMenu}
					className="flex items-center border border-solid border-b-0 rounded-b-none h-9 px-4 text-md sm:text-base"
					sx={(theme) => ({
						backgroundColor: `${theme.vars.palette.background.default}!important`,
						borderColor: theme.vars.palette.divider
					})}
					endIcon={
						<IdeomniSvgIcon
							size={16}
							color="action"
						>
							heroicons-solid:chevron-down
						</IdeomniSvgIcon>
					}
				>
					{_.find(projects, ['id', selectedProject.id])?.name}
				</Button>
				<Menu
					id="project-menu"
					anchorEl={selectedProject.menuEl}
					open={Boolean(selectedProject.menuEl)}
					onClose={handleCloseProjectMenu}
				>
					{projects &&
						projects.map((project) => (
							<MenuItem
								key={project.id}
								onClick={() => {
									handleChangeProject(project.id);
								}}
							>
								{project.name}
							</MenuItem>
						))}
				</Menu>
			</div>
		</div>
	);
}

export default ProjectDashboardAppHeader;

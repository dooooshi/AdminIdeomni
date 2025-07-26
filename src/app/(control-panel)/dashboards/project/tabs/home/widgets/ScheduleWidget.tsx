import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { memo, useState } from 'react';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import IdeomniLoading from '@ideomni/core/IdeomniLoading';
import IdeomniTab from 'src/components/tabs/IdeomniTab';
import IdeomniTabs from 'src/components/tabs/IdeomniTabs';
import { useGetProjectDashboardWidgetsQuery } from '../../../ProjectDashboardApi';
import ScheduleDataType from './types/ScheduleDataType';

/**
 * The ScheduleWidget widget.
 */
function ScheduleWidget() {
	const { data: widgets, isLoading } = useGetProjectDashboardWidgetsQuery();
	const widget = widgets?.schedule as ScheduleDataType;
	const series = widget?.series;
	const ranges = widget?.ranges;
	const [tabValue, setTabValue] = useState(0);
	const currentRange = ranges ? Object.keys(ranges)[tabValue] : undefined;

	if (isLoading) {
		return <IdeomniLoading />;
	}

	if (!widget || !ranges || !series) {
		return null;
	}

	return (
		<Paper className="flex flex-col flex-auto p-6 shadow-sm rounded-xl overflow-hidden h-full">
			<div className="flex flex-col sm:flex-row items-start justify-between">
				<Typography className="text-lg font-medium tracking-tight leading-6 truncate">Schedule</Typography>
				<div className="mt-3 sm:mt-0">
					<IdeomniTabs
						value={tabValue}
						onChange={(ev, value: number) => setTabValue(value)}
					>
						{Object.entries(ranges).map(([key, label], index) => (
							<IdeomniTab
								key={key}
								value={index}
								label={label}
							/>
						))}
					</IdeomniTabs>
				</div>
			</div>
			<List className="py-0 mt-2 divide-y">
				{currentRange && series[currentRange]?.map((item, index) => (
					<ListItem
						key={index}
						className="px-0"
					>
						<ListItemText
							classes={{ root: 'px-8', primary: 'font-medium' }}
							primary={item.title}
							secondary={
								<span className="flex flex-col sm:flex-row sm:items-center -ml-0.5 mt-2 sm:mt-1 space-y-1 sm:space-y-0 sm:space-x-3">
									{item.time && (
										<span className="flex items-center">
											<IdeomniSvgIcon
												size={20}
												color="disabled"
											>
												heroicons-solid:clock
											</IdeomniSvgIcon>
											<Typography
												component="span"
												className="mx-1.5 text-md"
												color="text.secondary"
											>
												{item.time}
											</Typography>
										</span>
									)}

									{item.location && (
										<span className="flex items-center">
											<IdeomniSvgIcon
												size={20}
												color="disabled"
											>
												heroicons-solid:map-pin
											</IdeomniSvgIcon>
											<Typography
												component="span"
												className="mx-1.5 text-md"
												color="text.secondary"
											>
												{item.location}
											</Typography>
										</span>
									)}
								</span>
							}
						/>
						<ListItemSecondaryAction>
							<IconButton aria-label="more">
								<IdeomniSvgIcon>heroicons-solid:chevron-right</IdeomniSvgIcon>
							</IconButton>
						</ListItemSecondaryAction>
					</ListItem>
				)) || []}
			</List>
		</Paper>
	);
}

export default memo(ScheduleWidget);

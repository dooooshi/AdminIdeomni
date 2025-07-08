import List from '@mui/material/List';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import IdeomniNavVerticalTab from './types/IdeomniNavVerticalTab';
import { IdeomniNavigationProps } from '../IdeomniNavigation';
import { IdeomniNavItemType } from '../types/IdeomniNavItemType';

const StyledList = styled(List)(({ theme }) => ({
	'& .Ideomni-list-item': {
		'&:hover': {
			backgroundColor: 'rgba(0,0,0,.04)',
			...theme.applyStyles('dark', {
				backgroundColor: 'rgba(255, 255, 255, 0.05)'
			})
		},
		'&:focus:not(.active)': {
			backgroundColor: 'rgba(0,0,0,.05)',
			...theme.applyStyles('dark', {
				backgroundColor: 'rgba(255, 255, 255, 0.06)'
			})
		}
	},
	'& .Ideomni-list-item-text-primary': {
		lineHeight: '1'
	},
	'&.active-square-list': {
		'& .Ideomni-list-item, & .active.Ideomni-list-item': {
			width: '100%',
			borderRadius: '0'
		}
	},
	'&.dense': {}
}));

/**
 * IdeomniNavVerticalLayout2 component represents a vertical navigation layout with material UI elements.
 * It displays the navigation object in the structured vertical menu and allows to handle onClick events for each navigation item.
 */
function IdeomniNavVerticalLayout2(props: IdeomniNavigationProps) {
	const { navigation, active, dense, className, onItemClick, firstLevel, selectedId, checkPermission } = props;

	function handleItemClick(item: IdeomniNavItemType) {
		onItemClick?.(item);
	}

	return (
		<StyledList
			className={clsx(
				'navigation flex flex-col items-center whitespace-nowrap',
				`active-${active}-list`,
				dense && 'dense',
				className
			)}
		>
			{navigation.map((_item) => (
				<IdeomniNavVerticalTab
					key={_item.id}
					type={`vertical-${_item.type}`}
					item={_item}
					nestedLevel={0}
					onItemClick={handleItemClick}
					firstLevel={firstLevel}
					dense={dense}
					selectedId={selectedId}
					checkPermission={checkPermission}
				/>
			))}
		</StyledList>
	);
}

export default IdeomniNavVerticalLayout2;

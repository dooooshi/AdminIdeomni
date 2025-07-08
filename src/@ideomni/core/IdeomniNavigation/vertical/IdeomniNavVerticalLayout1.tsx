import List from '@mui/material/List';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import IdeomniNavItem from '../IdeomniNavItem';
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
	'& .Ideomni-list-item-text': {
		margin: 0
	},
	'& .Ideomni-list-item-text-primary': {
		lineHeight: '20px'
	},
	'&.active-square-list': {
		'& .Ideomni-list-item, & .active.Ideomni-list-item': {
			width: '100%',
			borderRadius: '0'
		}
	},
	'&.dense': {
		'& .Ideomni-list-item': {
			paddingTop: 0,
			paddingBottom: 0,
			height: 32
		}
	}
}));

/**
 * IdeomniNavVerticalLayout1
 * This component is used to render vertical navigations using
 * the Material-UI List component. It accepts the IdeomniNavigationProps props
 * and renders the IdeomniNavItem components accordingly
 */
function IdeomniNavVerticalLayout1(props: IdeomniNavigationProps) {
	const { navigation, active, dense, className, onItemClick, checkPermission } = props;

	function handleItemClick(item: IdeomniNavItemType) {
		onItemClick?.(item);
	}

	return (
		<StyledList
			className={clsx(
				'navigation whitespace-nowrap px-3 py-0',
				`active-${active}-list`,
				dense && 'dense',
				className
			)}
		>
			{navigation.map((_item) => (
				<IdeomniNavItem
					key={_item.id}
					type={`vertical-${_item.type}`}
					item={_item}
					nestedLevel={0}
					onItemClick={handleItemClick}
					checkPermission={checkPermission}
				/>
			))}
		</StyledList>
	);
}

export default IdeomniNavVerticalLayout1;

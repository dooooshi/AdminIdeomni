import List from '@mui/material/List';
import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import IdeomniNavItem from '../IdeomniNavItem';
import { IdeomniNavigationProps } from '../IdeomniNavigation';

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
		},
		padding: '8px 12px 8px 12px',
		height: 36,
		minHeight: 36,
		'&.level-0': {
			minHeight: 36
		},
		'& .Ideomni-list-item-text': {
			padding: '0 0 0 8px'
		}
	},
	'&.active-square-list': {
		'& .Ideomni-list-item': {
			borderRadius: '0'
		}
	}
}));

/**
 * IdeomniNavHorizontalLayout1 is a react component used for building and
 * rendering horizontal navigation menus, using the Material UI List component.
 */
function IdeomniNavHorizontalLayout1(props: IdeomniNavigationProps) {
	const { navigation, active, dense, className, checkPermission } = props;

	return (
		<StyledList
			className={clsx(
				'navigation flex whitespace-nowrap p-0',
				`active-${active}-list`,
				dense && 'dense',
				className
			)}
		>
			{navigation?.map((_item) => (
				<IdeomniNavItem
					key={_item.id}
					type={`horizontal-${_item.type}`}
					item={_item}
					nestedLevel={0}
					dense={dense}
					checkPermission={checkPermission}
				/>
			))}
		</StyledList>
	);
}

export default IdeomniNavHorizontalLayout1;

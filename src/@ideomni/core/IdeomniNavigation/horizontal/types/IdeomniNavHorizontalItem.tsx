'use client';

import NavLinkAdapter from '@ideomni/core/NavLinkAdapter';
import { styled } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';
import clsx from 'clsx';
import { memo, useMemo } from 'react';
import { ListItemButton, ListItemButtonProps } from '@mui/material';
import { WithRouterProps } from '@ideomni/core/withRouter/withRouter';
import IdeomniNavBadge from '../../IdeomniNavBadge';
import IdeomniSvgIconExtended from '../../../IdeomniSvgIcon/IdeomniSvgIconExtended';
import { IdeomniNavItemComponentProps } from '../../IdeomniNavItem';

const Root = styled(ListItemButton)<ListItemButtonProps>(({ theme }) => ({
	color: theme.vars.palette.text.primary,
	textDecoration: 'none!important',
	minHeight: 48,
	'&.active': {
		backgroundColor: `${theme.vars.palette.secondary.main}!important`,
		color: `${theme.vars.palette.secondary.contrastText}!important`,
		'& .Ideomni-list-item-text-primary': {
			color: 'inherit'
		},
		'& .Ideomni-list-item-icon': {
			color: 'inherit'
		}
	},
	'& .Ideomni-list-item-icon': {},
	'& .Ideomni-list-item-text': {
		padding: '0 0 0 16px'
	}
}));

type IdeomniNavHorizontalItemProps = IdeomniNavItemComponentProps & WithRouterProps;

/**
 * IdeomniNavHorizontalItem is a component responsible for rendering the navigation element in the horizontal menu in the Ideomni theme.
 */
function IdeomniNavHorizontalItem(props: IdeomniNavHorizontalItemProps) {
	const { item, checkPermission } = props;
	const component = item.url ? NavLinkAdapter : 'li';

	const itemProps = useMemo(
		() => ({
			...(component !== 'li' && {
				disabled: item.disabled,
				to: item.url || '',
				end: item.end,
				role: 'button',
				exact: item?.exact
			})
		}),
		[item, component]
	);

	const memoizedContent = useMemo(
		() => (
			<Root
				component={component}
				className={clsx('Ideomni-list-item', item.active && 'active')}
				sx={item.sx}
				{...itemProps}
			>
				{item.icon && (
					<IdeomniSvgIconExtended
						className={clsx('Ideomni-list-item-icon shrink-0', item.iconClass)}
						color="action"
					>
						{item.icon}
					</IdeomniSvgIconExtended>
				)}

				<ListItemText
					className="Ideomni-list-item-text"
					primary={item.title}
					classes={{ primary: 'text-md Ideomni-list-item-text-primary truncate' }}
				/>

				{item.badge && (
					<IdeomniNavBadge
						className="ml-2"
						badge={item.badge}
					/>
				)}
			</Root>
		),
		[component, item.active, item.badge, item.icon, item.iconClass, item.sx, item.title, itemProps]
	);

	if (checkPermission && !item?.hasPermission) {
		return null;
	}

	return memoizedContent;
}

const NavHorizontalItemWithMemo = memo(IdeomniNavHorizontalItem);

export default NavHorizontalItemWithMemo;

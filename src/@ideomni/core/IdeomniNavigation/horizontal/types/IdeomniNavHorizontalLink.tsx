'use client';

import { styled } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';
import clsx from 'clsx';
import { memo, useMemo } from 'react';
import { Link, ListItemButton, ListItemButtonProps } from '@mui/material';
import { WithRouterProps } from '@ideomni/core/withRouter/withRouter';
import IdeomniNavBadge from '../../IdeomniNavBadge';
import IdeomniSvgIcon from '../../../IdeomniSvgIcon';
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

type IdeomniNavHorizontalLinkProps = IdeomniNavItemComponentProps & WithRouterProps;

/*
 * IdeomniNavHorizontalLink
 * This is a component to render horizontal navigation links in the Ideomni navigations.
 * It receieves `IdeomniNavItemComponentProps` and `WithRouterProps` as props.
 */
function IdeomniNavHorizontalLink(props: IdeomniNavHorizontalLinkProps) {
	const { item, checkPermission } = props;
	const component = item.url ? Link : 'li';

	const itemProps = useMemo(
		() => ({
			...(component !== 'li' && {
				disabled: item.disabled,
				to: item.url,
				role: 'button',
				target: item.target ? item.target : '_blank',
				exact: item?.exact
			})
		}),
		[item, component]
	);

	const memoizedContent = useMemo(
		() => (
			<Root
				component={component}
				className={clsx('Ideomni-list-item')}
				sx={item.sx}
				{...itemProps}
			>
				{item.icon && (
					<IdeomniSvgIcon
						className={clsx('Ideomni-list-item-icon shrink-0', item.iconClass)}
						color="action"
					>
						{item.icon}
					</IdeomniSvgIcon>
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
		[component, item.badge, item.icon, item.iconClass, item.sx, item.title, itemProps]
	);

	if (checkPermission && !item?.hasPermission) {
		return null;
	}

	return memoizedContent;
}

const NavHorizontalLinkWithMemo = memo(IdeomniNavHorizontalLink);

export default NavHorizontalLinkWithMemo;

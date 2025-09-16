'use client';
import NavLinkAdapter from '@ideomni/core/NavLinkAdapter';
import { styled } from '@mui/material/styles';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import List, { ListProps } from '@mui/material/List';
import isUrlInChildren from '@ideomni/core/IdeomniNavigation/isUrlInChildren';
import { ListItemButton } from '@mui/material';
import usePathname from '@ideomni/hooks/usePathname';
import IdeomniNavBadge from '../../IdeomniNavBadge';
import IdeomniNavItem, { IdeomniNavItemComponentProps } from '../../IdeomniNavItem';
import IdeomniSvgIconExtended from '../../../IdeomniSvgIcon/IdeomniSvgIconExtended';
import { IdeomniNavItemType } from '../../types/IdeomniNavItemType';

type ListComponentProps = ListProps & {
	itempadding: number;
};

const Root = styled(List)<ListComponentProps>(({ theme, ...props }) => ({
	padding: 0,
	'&.open': {},
	'& > .Ideomni-list-item': {
		minHeight: 36,
		width: '100%',
		borderRadius: '8px',
		margin: '0 0 4px 0',
		paddingRight: 16,
		paddingLeft: props.itempadding > 80 ? 80 : props.itempadding,
		paddingTop: 10,
		paddingBottom: 10,
		color: `rgba(${theme.vars.palette.text.primaryChannel} / 0.7)`,
		'&:hover': {
			color: theme.vars.palette.text.primary
		},
		'& > .Ideomni-list-item-icon': {
			marginRight: 16,
			color: 'inherit'
		}
	}
}));

function needsToBeOpened(pathname: string, item: IdeomniNavItemType) {
	return pathname && isUrlInChildren(item, pathname);
}

/**
 * IdeomniNavVerticalCollapse component used for vertical navigation items with collapsible children.
 */
function IdeomniNavVerticalCollapse(props: IdeomniNavItemComponentProps) {
	const pathname = usePathname();
	const { item, nestedLevel = 0, onItemClick, checkPermission } = props;
	const [open, setOpen] = useState(() => needsToBeOpened(pathname, item));
	const itempadding = nestedLevel > 0 ? 38 + nestedLevel * 16 : 16;
	const component = item.url ? NavLinkAdapter : 'li';

	const itemProps = useMemo(
		() => ({
			...(component !== 'li' && {
				disabled: item.disabled,
				to: item.url,
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
				className={clsx(open && 'open')}
				itempadding={itempadding}
				sx={item.sx}
			>
				<ListItemButton
					component={component}
					className="Ideomni-list-item"
					onClick={() => {
						setOpen(!open);
					}}
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
						secondary={item.subtitle}
						classes={{
							primary: 'text-md font-medium Ideomni-list-item-text-primary truncate',
							secondary: 'text-sm font-medium Ideomni-list-item-text-secondary leading-[1.5] truncate'
						}}
					/>

					{item.badge && (
						<IdeomniNavBadge
							className="mx-1"
							badge={item.badge}
						/>
					)}

					<IconButton
						disableRipple
						className="-mx-3 h-5 w-5 p-0 hover:bg-transparent focus:bg-transparent"
						onClick={(ev) => {
							ev.preventDefault();
							ev.stopPropagation();
							setOpen(!open);
						}}
					>
						<IdeomniSvgIconExtended
							size={13}
							className="arrow-icon"
							color="inherit"
						>
							{open ? 'heroicons-solid:chevron-down' : 'heroicons-solid:chevron-right'}
						</IdeomniSvgIconExtended>
					</IconButton>
				</ListItemButton>

				{item.children && (
					<Collapse
						in={open}
						className="collapse-children"
					>
						{item.children.map((_item) => (
							<IdeomniNavItem
								key={_item.id}
								type={`vertical-${_item.type}`}
								item={_item}
								nestedLevel={nestedLevel + 1}
								onItemClick={onItemClick}
								checkPermission={checkPermission}
							/>
						))}
					</Collapse>
				)}
			</Root>
		),
		[
			checkPermission,
			component,
			item.badge,
			item.children,
			item.icon,
			item.iconClass,
			item.subtitle,
			item.sx,
			item.title,
			itemProps,
			itempadding,
			nestedLevel,
			onItemClick,
			open
		]
	);

	if (checkPermission && !item?.hasPermission) {
		return null;
	}

	return memoizedContent;
}

const NavVerticalCollapse = IdeomniNavVerticalCollapse;

export default NavVerticalCollapse;

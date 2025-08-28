import Button from '@mui/material/Button';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import Link from '@ideomni/core/Link';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import Tooltip from '@mui/material/Tooltip';
import clsx from 'clsx';
import Popover, { PopoverProps } from '@mui/material/Popover';
import { useAuth, useUserDisplayName, useLogout } from 'src/lib/auth';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

type UserMenuProps = {
	className?: string;
	popoverProps?: Partial<PopoverProps>;
	arrowIcon?: string;
};

/**
 * The user menu.
 */
function UserMenu(props: UserMenuProps) {
	const { className, popoverProps, arrowIcon = 'heroicons-outline:chevron-up' } = props;
	const { user, isAuthenticated, userType } = useAuth();
	const displayName = useUserDisplayName();
	const { logout } = useLogout();
	const { t } = useTranslation();
	const [userMenu, setUserMenu] = useState<HTMLElement | null>(null);
	const userMenuClick = (event: React.MouseEvent<HTMLElement>) => {
		setUserMenu(event.currentTarget);
	};

	const userMenuClose = () => {
		setUserMenu(null);
	};

	if (!user) {
		return null;
	}

	return (
		<>
			<Button
				className={clsx(
					'user-menu flex justify-start shrink-0 min-h-14 h-14 rounded-lg p-2 space-x-3',
					className
				)}
				sx={(theme) => ({
					borderColor: theme.vars.palette.divider,
					'&:hover, &:focus': {
						backgroundColor: `rgba(${theme.vars.palette.dividerChannel} / 0.6)`,
						...theme.applyStyles('dark', {
							backgroundColor: `rgba(${theme.vars.palette.dividerChannel} / 0.1)`
						})
					}
				})}
				onClick={userMenuClick}
				color="inherit"
			>
				<div className="flex flex-col flex-auto space-y-2">
					<Typography
						component="span"
						className="title flex font-semibold text-base capitalize truncate tracking-tight leading-none"
					>
						{displayName}
					</Typography>
					<Typography
						className="subtitle flex text-md font-medium tracking-tighter leading-none"
						color="text.secondary"
					>
						{user?.email}
					</Typography>
				</div>
				<div className="flex shrink-0 items-center space-x-2">
					<Tooltip
						title={
							<>
								{userType === 'admin' ? t('common.ADMINISTRATOR') : userType === 'user' ? t('common.USER') : t('common.GUEST')}
							</>
						}
					>
						<IdeomniSvgIcon
							className="info-icon"
							size={20}
						>
							heroicons-outline:information-circle
						</IdeomniSvgIcon>
					</Tooltip>
					<IdeomniSvgIcon
						className="arrow"
						size={13}
					>
						{arrowIcon}
					</IdeomniSvgIcon>
				</div>
			</Button>
			<Popover
				open={Boolean(userMenu)}
				anchorEl={userMenu}
				onClose={userMenuClose}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'center'
				}}
				transformOrigin={{
					vertical: 'bottom',
					horizontal: 'center'
				}}
				classes={{
					paper: 'py-2 min-w-64'
				}}
				{...popoverProps}
			>
				{!isAuthenticated ? (
					<>
						<MenuItem
							component={Link}
							to="/sign-in"
							role="button"
						>
							<ListItemIcon className="min-w-9">
								<IdeomniSvgIcon>heroicons-outline:lock-closed</IdeomniSvgIcon>
							</ListItemIcon>
							<ListItemText primary={t('common.SIGN_IN')} />
						</MenuItem>
						<MenuItem
							component={Link}
							to="/sign-up"
							role="button"
						>
							<ListItemIcon className="min-w-9">
								<IdeomniSvgIcon>heroicons-outline:user-plus</IdeomniSvgIcon>
							</ListItemIcon>
							<ListItemText primary={t('common.SIGN_UP')} />
						</MenuItem>
					</>
				) : (
					<>
						{/* 切换活动 */}
						{/* <MenuItem
							component={Link}
							to="/apps/mailbox"
							onClick={userMenuClose}
							role="button"
						>
							<ListItemIcon className="min-w-9">
								<IdeomniSvgIcon>heroicons-outline:envelope</IdeomniSvgIcon>
							</ListItemIcon>
							<ListItemText primary="Inbox" />
						</MenuItem> */}
						<MenuItem
							onClick={() => {
								logout();
							}}
						>
							<ListItemIcon className="min-w-9">
								<IdeomniSvgIcon>heroicons-outline:arrow-right-on-rectangle</IdeomniSvgIcon>
							</ListItemIcon>
							<ListItemText primary={t('common.SIGN_OUT')} />
						</MenuItem>
					</>
				)}
			</Popover>
		</>
	);
}

export default UserMenu;

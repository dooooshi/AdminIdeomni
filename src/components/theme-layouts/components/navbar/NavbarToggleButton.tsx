import IconButton from '@mui/material/IconButton';
import { useAppDispatch } from 'src/store/hooks';
import _ from 'lodash';
import useThemeMediaQuery from '@ideomni/hooks/useThemeMediaQuery';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import clsx from 'clsx';
import { IconButtonProps } from '@mui/material/IconButton';
import useIdeomniLayoutSettings from '@ideomni/core/IdeomniLayout/useIdeomniLayoutSettings';
import useIdeomniSettings from '@ideomni/core/IdeomniSettings/hooks/useIdeomniSettings';
import { navbarToggle, navbarToggleMobile } from './navbarSlice';

export type NavbarToggleButtonProps = IconButtonProps;

/**
 * The navbar toggle button.
 */
function NavbarToggleButton(props: NavbarToggleButtonProps) {
	const {
		className = '',
		children = (
			<IdeomniSvgIcon
				size={20}
				color="action"
			>
				heroicons-outline:bars-3
			</IdeomniSvgIcon>
		),
		...rest
	} = props;

	const dispatch = useAppDispatch();
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const { config } = useIdeomniLayoutSettings();
	const { setSettings } = useIdeomniSettings();

	return (
		<IconButton
			onClick={() => {
				if (isMobile) {
					dispatch(navbarToggleMobile());
				} else if (config?.navbar?.style === 'style-2') {
					setSettings(_.set({}, 'layout.config.navbar.folded', !config?.navbar?.folded));
				} else {
					dispatch(navbarToggle());
				}
			}}
			{...rest}
			className={clsx('border border-divider', className)}
		>
			{children}
		</IconButton>
	);
}

export default NavbarToggleButton;

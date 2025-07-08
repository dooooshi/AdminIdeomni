import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';

type NotificationIconProps = {
	value?: string;
};

/**
 * The notification icon.
 */
function NotificationIcon(props: NotificationIconProps) {
	const { value } = props;

	switch (value) {
		case 'error': {
			return (
				<IdeomniSvgIcon
					className="mr-2 opacity-75"
					color="inherit"
					size={20}
				>
					heroicons-outline:minus-circle
				</IdeomniSvgIcon>
			);
		}
		case 'success': {
			return (
				<IdeomniSvgIcon
					className="mr-2 opacity-75"
					color="inherit"
					size={20}
				>
					heroicons-outline:check-circle
				</IdeomniSvgIcon>
			);
		}
		case 'warning': {
			return (
				<IdeomniSvgIcon
					className="mr-2 opacity-75"
					color="inherit"
					size={20}
				>
					heroicons-outline:exclamation-circle
				</IdeomniSvgIcon>
			);
		}
		case 'info': {
			return (
				<IdeomniSvgIcon
					className="mr-2 opacity-75"
					color="inherit"
					size={20}
				>
					heroicons-outline:information-circle
				</IdeomniSvgIcon>
			);
		}
		default: {
			return null;
		}
	}
}

export default NotificationIcon;

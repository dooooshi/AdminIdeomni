import IdeomniScrollbars from '@ideomni/core/IdeomniScrollbars';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import Button from '@mui/material/Button';
import _ from 'lodash';
import usePathname from '@ideomni/hooks/usePathname';
import { useTranslation } from 'react-i18next';
import NotificationCard from './NotificationCard';
import {
	closeNotificationPanel,
	selectNotificationPanelState,
	toggleNotificationPanel
} from './notificationPanelSlice';
import {
	useCreateNotificationMutation,
	useDeleteNotificationMutation,
	useDeleteNotificationsMutation,
	useGetAllNotificationsQuery
} from './NotificationApi';
import NotificationModel from './models/NotificationModel';
import NotificationTemplate from './NotificationTemplate';

const StyledSwipeableDrawer = styled(SwipeableDrawer)(({ theme }) => ({
	'& .MuiDrawer-paper': {
		backgroundColor: theme.vars.palette.background.default,
		width: 320
	}
}));

/**
 * The notification panel.
 */
function NotificationPanel() {
	const { t } = useTranslation('auth');
	const pathname = usePathname();
	const dispatch = useAppDispatch();
	const state = useAppSelector(selectNotificationPanelState);

	const [deleteNotification] = useDeleteNotificationMutation();

	const [deleteNotifications] = useDeleteNotificationsMutation();
	const [addNotification] = useCreateNotificationMutation();

	const { data: notifications } = useGetAllNotificationsQuery();

	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	useEffect(() => {
		if (state) {
			dispatch(closeNotificationPanel());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname, dispatch]);

	useEffect(() => {
		const item = NotificationModel({
			title: t('WELCOME_BACK_NOTIFICATION_TITLE'),
			description: t('WELCOME_BACK_NOTIFICATION_DESC'),
			link: '/dashboards',
			icon: 'heroicons-solid:home',
			variant: 'primary'
		});

		setTimeout(() => {
			// addNotification(item);

			// enqueueSnackbar(item.title, {
			// 	key: item.id,
			// 	autoHideDuration: 6000,
			// 	content: (
			// 		<NotificationTemplate
			// 			item={item}
			// 			onClose={() => {
			// 				closeSnackbar(item.id);
			// 			}}
			// 		/>
			// 	)
			// });
		}, 2000);
	}, [addNotification, closeSnackbar, enqueueSnackbar, t]);

	function handleClose() {
		dispatch(closeNotificationPanel());
	}

	function handleDismiss(id: string) {
		deleteNotification(id);
	}

	function handleDismissAll() {
		deleteNotifications(notifications.map((notification) => notification.id));
	}

	function demoNotification() {
		const item = NotificationModel({ title: 'Great Job! this is awesome.' });

		addNotification(item);

		enqueueSnackbar(item.title, {
			key: item.id,

			// autoHideDuration: 3000,
			content: (
				<NotificationTemplate
					item={item}
					onClose={() => {
						closeSnackbar(item.id);
					}}
				/>
			)
		});
	}

	return (
		<StyledSwipeableDrawer
			open={state}
			anchor="right"
			onOpen={() => {}}
			onClose={() => dispatch(toggleNotificationPanel())}
			disableSwipeToOpen
		>
			<IconButton
				className="absolute right-0 top-0 z-999 m-1"
				onClick={handleClose}
				size="large"
			>
				<IdeomniSvgIcon color="action">heroicons-outline:x-mark</IdeomniSvgIcon>
			</IconButton>

			<IdeomniScrollbars className="flex flex-col p-4 h-full">
				{notifications && notifications?.length > 0 ? (
					<div className="flex flex-auto flex-col">
						<div className="mb-9 flex items-end justify-between pt-8">
							<Typography className="text-4xl font-semibold leading-none">Notifications</Typography>
							<Typography
								className="cursor-pointer text-md underline"
								color="secondary"
								onClick={handleDismissAll}
							>
								dismiss all
							</Typography>
						</div>
						{_.orderBy(notifications, ['time'], ['desc']).map((item) => (
							<NotificationCard
								key={item.id}
								className="mb-4"
								item={item}
								onClose={handleDismiss}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-1 items-center justify-center p-4">
						<Typography
							className="text-center text-xl"
							color="text.secondary"
						>
							There are no notifications for now.
						</Typography>
					</div>
				)}
				<div className="flex items-center justify-center py-4">
					<Button
						size="small"
						variant="outlined"
						onClick={demoNotification}
					>
						Create a notification example
					</Button>
				</div>
			</IdeomniScrollbars>
		</StyledSwipeableDrawer>
	);
}

export default NotificationPanel;

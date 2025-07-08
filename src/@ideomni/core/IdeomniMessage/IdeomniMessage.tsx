import { amber, blue, green } from '@mui/material/colors';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Snackbar from '@mui/material/Snackbar';
import SnackbarContent from '@mui/material/SnackbarContent';
import Typography from '@mui/material/Typography';
import { memo } from 'react';
import { hideMessage, selectIdeomniMessageOptions, selectIdeomniMessageState } from '@ideomni/core/IdeomniMessage/IdeomniMessageSlice';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import IdeomniSvgIcon from '../IdeomniSvgIcon';

export type IdeomniMessageVariantType = 'success' | 'error' | 'warning' | 'info';

type StyledSnackbarProps = {
	variant?: IdeomniMessageVariantType;
};

const StyledSnackbar = styled(Snackbar)<StyledSnackbarProps>(({ theme }) => ({
	'& .IdeomniMessage-content': {},
	variants: [
		{
			props: {
				variant: 'success'
			},
			style: {
				'& .IdeomniMessage-content': {
					backgroundColor: green[600],
					color: '#FFFFFF'
				}
			}
		},
		{
			props: {
				variant: 'error'
			},
			style: {
				'& .IdeomniMessage-content': {
					backgroundColor: theme.vars.palette.error.dark,
					color: theme.palette.getContrastText(theme.palette.error.dark)
				}
			}
		},
		{
			props: {
				variant: 'info'
			},
			style: {
				'& .IdeomniMessage-content': {
					backgroundColor: blue[600],
					color: '#FFFFFF'
				}
			}
		},
		{
			props: {
				variant: 'warning'
			},
			style: {
				'& .IdeomniMessage-content': {
					backgroundColor: amber[600],
					color: '#FFFFFF'
				}
			}
		}
	]
}));

const variantIcon = {
	success: 'check_circle',
	warning: 'warning',
	error: 'error_outline',
	info: 'info'
};

/**
 * IdeomniMessage
 * The IdeomniMessage component holds a snackbar that is capable of displaying message with 4 different variant. It uses the @mui/material React packages to create the components.
 */
function IdeomniMessage() {
	const dispatch = useAppDispatch();
	const state = useAppSelector(selectIdeomniMessageState);
	const options = useAppSelector(selectIdeomniMessageOptions);

	return (
		<StyledSnackbar
			{...options}
			open={state}
			onClose={() => dispatch(hideMessage())}
		>
			<SnackbarContent
				className="IdeomniMessage-content"
				message={
					<div className="flex items-center">
						{variantIcon[options.variant] && (
							<IdeomniSvgIcon color="inherit">{variantIcon[options.variant]}</IdeomniSvgIcon>
						)}
						<Typography className="mx-2">{options.message}</Typography>
					</div>
				}
				action={[
					<IconButton
						key="close"
						aria-label="Close"
						color="inherit"
						onClick={() => dispatch(hideMessage())}
						size="large"
					>
						<IdeomniSvgIcon>heroicons-outline:x-mark</IdeomniSvgIcon>
					</IconButton>
				]}
			/>
		</StyledSnackbar>
	);
}

export default memo(IdeomniMessage);

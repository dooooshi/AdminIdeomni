import Dialog from '@mui/material/Dialog';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { closeDialog, selectIdeomniDialogProps } from '@ideomni/core/IdeomniDialog/IdeomniDialogSlice';

/**
 * IdeomniDialog component
 * This component renders a material UI ```Dialog``` component
 * with properties pulled from the redux store
 */
interface DialogOptions {
	open: boolean;
	children: React.ReactElement | string;
}

function IdeomniDialog() {
	const dispatch = useAppDispatch();
	const options = useAppSelector(selectIdeomniDialogProps) as DialogOptions;

	return (
		<Dialog
			open={options?.open || false}
			onClose={() => dispatch(closeDialog())}
			aria-labelledby="ideomni-dialog-title"
			classes={{
				paper: 'rounded-lg'
			}}
		>
			{options?.children}
		</Dialog>
	);
}

export default IdeomniDialog;

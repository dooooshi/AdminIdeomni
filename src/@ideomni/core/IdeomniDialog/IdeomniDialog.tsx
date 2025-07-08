import Dialog from '@mui/material/Dialog';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { closeDialog, selectIdeomniDialogProps } from '@ideomni/core/IdeomniDialog/IdeomniDialogSlice';

/**
 * IdeomniDialog component
 * This component renders a material UI ```Dialog``` component
 * with properties pulled from the redux store
 */
function IdeomniDialog() {
	const dispatch = useAppDispatch();
	const options = useAppSelector(selectIdeomniDialogProps);

	return (
		<Dialog
			onClose={() => dispatch(closeDialog())}
			aria-labelledby="ideomni-dialog-title"
			classes={{
				paper: 'rounded-lg'
			}}
			{...options}
		/>
	);
}

export default IdeomniDialog;

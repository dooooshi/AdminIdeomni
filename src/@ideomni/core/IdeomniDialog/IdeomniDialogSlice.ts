import { createSlice, PayloadAction, WithSlice, Draft } from '@reduxjs/toolkit';
import { ReactElement } from 'react';
import rootReducer from '@/store/rootReducer';

type InitialStateProps = {
	open: boolean;
	children: ReactElement | string;
};

/**
 * The initial state of the dialog slice.
 */
const initialState: InitialStateProps = {
	open: false,
	children: ''
};

/**
 * The Ideomni Dialog slice
 */
export const IdeomniDialogSlice = createSlice({
	name: 'IdeomniDialog',
	initialState,
	reducers: {
		openDialog: (state, action: PayloadAction<{ children: InitialStateProps['children'] }>) => {
			state.open = true;
			state.children = action.payload.children;
		},
		closeDialog: (state) => {
			state.open = false;
			state.children = '';
		}
	},
	selectors: {
		selectIdeomniDialogState: (IdeomniDialog) => IdeomniDialog.open,
		selectIdeomniDialogProps: (IdeomniDialog) => IdeomniDialog
	}
});

/**
 * Lazy load
 * */
rootReducer.inject(IdeomniDialogSlice);
const injectedSlice = IdeomniDialogSlice.injectInto(rootReducer);
declare module '@/store/rootReducer' {
	export interface LazyLoadedSlices extends WithSlice<typeof IdeomniDialogSlice> {}
}

export const { closeDialog, openDialog } = IdeomniDialogSlice.actions;

export const { selectIdeomniDialogState, selectIdeomniDialogProps } = injectedSlice.selectors;

export type dialogSliceType = typeof IdeomniDialogSlice;

export default IdeomniDialogSlice.reducer;

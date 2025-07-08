import { createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from 'src/store/store';
import { PartialDeep } from 'type-fest';
import { IdeomniFlatNavItemType, IdeomniNavItemType } from '@ideomni/core/IdeomniNavigation/types/IdeomniNavItemType';
import IdeomniNavigationHelper from '@ideomni/utils/IdeomniNavigationHelper';
import IdeomniNavItemModel from '@ideomni/core/IdeomniNavigation/models/IdeomniNavItemModel';
import navigationConfig from 'src/configs/navigationConfig';

const navigationAdapter = createEntityAdapter<IdeomniFlatNavItemType>();

const emptyInitialState = navigationAdapter.getInitialState([]);

const initialState = navigationAdapter.upsertMany(
	emptyInitialState,
	IdeomniNavigationHelper.flattenNavigation(navigationConfig)
);

/**
 * Redux Thunk actions related to the navigation store state
 */
/**
 * Appends a navigation item to the navigation store state.
 */
export const appendNavigationItem =
	(item: IdeomniNavItemType, parentId?: string | null): AppThunk =>
	async (dispatch, getState) => {
		const AppState = getState();
		const navigation = IdeomniNavigationHelper.unflattenNavigation(selectNavigationAll(AppState));

		dispatch(setNavigation(IdeomniNavigationHelper.appendNavItem(navigation, IdeomniNavItemModel(item), parentId)));

		return Promise.resolve();
	};

/**
 * Prepends a navigation item to the navigation store state.
 */
export const prependNavigationItem =
	(item: IdeomniNavItemType, parentId?: string | null): AppThunk =>
	async (dispatch, getState) => {
		const AppState = getState();
		const navigation = IdeomniNavigationHelper.unflattenNavigation(selectNavigationAll(AppState));

		dispatch(setNavigation(IdeomniNavigationHelper.prependNavItem(navigation, IdeomniNavItemModel(item), parentId)));

		return Promise.resolve();
	};

/**
 * Adds a navigation item to the navigation store state at the specified index.
 */
export const updateNavigationItem =
	(id: string, item: PartialDeep<IdeomniNavItemType>): AppThunk =>
	async (dispatch, getState) => {
		const AppState = getState();
		const navigation = IdeomniNavigationHelper.unflattenNavigation(selectNavigationAll(AppState));

		dispatch(setNavigation(IdeomniNavigationHelper.updateNavItem(navigation, id, item)));

		return Promise.resolve();
	};

/**
 * Removes a navigation item from the navigation store state.
 */
export const removeNavigationItem =
	(id: string): AppThunk =>
	async (dispatch, getState) => {
		const AppState = getState();
		const navigation = IdeomniNavigationHelper.unflattenNavigation(selectNavigationAll(AppState));

		dispatch(setNavigation(IdeomniNavigationHelper.removeNavItem(navigation, id)));

		return Promise.resolve();
	};

export const {
	selectAll: selectNavigationAll,
	selectIds: selectNavigationIds,
	selectById: selectNavigationItemById
} = navigationAdapter.getSelectors<RootState>((state) => state.navigation);

/**
 * The navigation slice
 */
export const navigationSlice = createSlice({
	name: 'navigation',
	initialState,
	reducers: {
		setNavigation(state, action: PayloadAction<IdeomniNavItemType[]>) {
			return navigationAdapter.setAll(state, IdeomniNavigationHelper.flattenNavigation(action.payload));
		},
		resetNavigation: () => initialState
	}
});

export const { setNavigation, resetNavigation } = navigationSlice.actions;

export type navigationSliceType = typeof navigationSlice;

export default navigationSlice.reducer;

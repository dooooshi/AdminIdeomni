import { SxProps } from '@mui/system';
import { IdeomniNavBadgeType } from './IdeomniNavBadgeType';

/**
 * IdeomniNavItemType
 * A type for Ideomni navigation item and its properties.
 */
export type IdeomniNavItemType = {
	id: string;
	title?: string;
	translate?: string;
	auth?: string[] | string;
	subtitle?: string;
	translateSubtitle?: string;
	icon?: string;
	iconClass?: string;
	url?: string;
	target?: string;
	type?: string;
	sx?: SxProps;
	disabled?: boolean;
	active?: boolean;
	exact?: boolean;
	end?: boolean;
	badge?: IdeomniNavBadgeType;
	children?: IdeomniNavItemType[];
	hasPermission?: boolean;
};

export type IdeomniFlatNavItemType = Omit<IdeomniNavItemType, 'children' | 'sx'> & { children?: string[]; order: string };

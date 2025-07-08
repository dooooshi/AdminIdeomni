import { IdeomniNavItemType } from './types/IdeomniNavItemType';
import components from './utils/components';

export type IdeomniNavItemComponentProps = {
	type: string;
	item: IdeomniNavItemType;
	dense?: boolean;
	nestedLevel?: number;
	onItemClick?: (T: IdeomniNavItemType) => void;
	checkPermission?: boolean;
};

/**
Component to render NavItem depending on its type.
*/
function IdeomniNavItem(props: IdeomniNavItemComponentProps) {
	const { type } = props;

	const C = components[type];

	return C ? <C {...(props as object)} /> : null;
}

export default IdeomniNavItem;

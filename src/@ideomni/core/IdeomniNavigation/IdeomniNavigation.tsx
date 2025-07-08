import Divider from '@mui/material/Divider';
import { memo } from 'react';
import GlobalStyles from '@mui/material/GlobalStyles';
import IdeomniNavHorizontalLayout1 from './horizontal/IdeomniNavHorizontalLayout1';
import IdeomniNavVerticalLayout1 from './vertical/IdeomniNavVerticalLayout1';
import IdeomniNavVerticalLayout2 from './vertical/IdeomniNavVerticalLayout2';
import IdeomniNavHorizontalCollapse from './horizontal/types/IdeomniNavHorizontalCollapse';
import IdeomniNavHorizontalGroup from './horizontal/types/IdeomniNavHorizontalGroup';
import IdeomniNavHorizontalItem from './horizontal/types/IdeomniNavHorizontalItem';
import IdeomniNavHorizontalLink from './horizontal/types/IdeomniNavHorizontalLink';
import IdeomniNavVerticalCollapse from './vertical/types/IdeomniNavVerticalCollapse';
import IdeomniNavVerticalGroup from './vertical/types/IdeomniNavVerticalGroup';
import IdeomniNavVerticalItem from './vertical/types/IdeomniNavVerticalItem';
import IdeomniNavVerticalLink from './vertical/types/IdeomniNavVerticalLink';
import { IdeomniNavItemType } from './types/IdeomniNavItemType';
import { registerComponent } from './utils/registerComponent';

const inputGlobalStyles = (
	<GlobalStyles
		styles={() => ({
			'.popper-navigation-list': {
				'& .Ideomni-list-item': {
					padding: '8px 12px 8px 12px',
					height: 36,
					minHeight: 36,
					'& .Ideomni-list-item-text': {
						padding: '0 0 0 8px'
					}
				},
				'&.dense': {
					'& .Ideomni-list-item': {
						minHeight: 32,
						height: 32,
						'& .Ideomni-list-item-text': {
							padding: '0 0 0 8px'
						}
					}
				}
			}
		})}
	/>
);

/*
Register Ideomni Navigation Components
 */
registerComponent('vertical-group', IdeomniNavVerticalGroup);
registerComponent('vertical-collapse', IdeomniNavVerticalCollapse);
registerComponent('vertical-item', IdeomniNavVerticalItem);
registerComponent('vertical-link', IdeomniNavVerticalLink);
registerComponent('horizontal-group', IdeomniNavHorizontalGroup);
registerComponent('horizontal-collapse', IdeomniNavHorizontalCollapse);
registerComponent('horizontal-item', IdeomniNavHorizontalItem);
registerComponent('horizontal-link', IdeomniNavHorizontalLink);
registerComponent('divider', () => <Divider className="my-4" />);
registerComponent('vertical-divider', () => <Divider className="my-4" />);
registerComponent('horizontal-divider', () => <Divider className="my-4" />);

export type IdeomniNavigationProps = {
	className?: string;
	dense?: boolean;
	active?: boolean;
	onItemClick?: (T: IdeomniNavItemType) => void;
	navigation?: IdeomniNavItemType[];
	layout?: 'horizontal' | 'vertical' | 'vertical-2';
	firstLevel?: boolean;
	selectedId?: string;
	checkPermission?: boolean;
};

/**
 * IdeomniNavigation
 * Component for displaying a navigation bar which contains IdeomniNavItem components
 * and acts as parent for providing props to its children components
 */
function IdeomniNavigation(props: IdeomniNavigationProps) {
	const { navigation, layout = 'vertical' } = props;

	if (!navigation || navigation.length === 0) {
		return null;
	}

	return (
		<>
			{inputGlobalStyles}
			{layout === 'horizontal' && (
				<IdeomniNavHorizontalLayout1
					checkPermission={false}
					{...props}
				/>
			)}
			{layout === 'vertical' && (
				<IdeomniNavVerticalLayout1
					checkPermission={false}
					{...props}
				/>
			)}
			{layout === 'vertical-2' && (
				<IdeomniNavVerticalLayout2
					checkPermission={false}
					{...props}
				/>
			)}
		</>
	);
}

export default memo(IdeomniNavigation);

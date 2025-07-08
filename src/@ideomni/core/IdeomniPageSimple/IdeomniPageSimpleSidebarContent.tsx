import IdeomniScrollbars from '@ideomni/core/IdeomniScrollbars';
import { ReactNode } from 'react';

/**
 * Props for the IdeomniPageSimpleSidebarContent component.
 */
type IdeomniPageSimpleSidebarContentProps = {
	innerScroll?: boolean;
	children?: ReactNode;
};

/**
 * The IdeomniPageSimpleSidebarContent component is a content container for the IdeomniPageSimpleSidebar component.
 */
function IdeomniPageSimpleSidebarContent(props: IdeomniPageSimpleSidebarContentProps) {
	const { innerScroll, children } = props;

	if (!children) {
		return null;
	}

	return (
		<IdeomniScrollbars enable={innerScroll}>
			<div className="IdeomniPageSimple-sidebarContent flex flex-col min-h-full min-w-80 lg:min-w-0">{children}</div>
		</IdeomniScrollbars>
	);
}

export default IdeomniPageSimpleSidebarContent;

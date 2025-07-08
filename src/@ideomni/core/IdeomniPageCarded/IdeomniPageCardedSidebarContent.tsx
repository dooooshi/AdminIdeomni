import IdeomniScrollbars from '@ideomni/core/IdeomniScrollbars';
import { ReactNode } from 'react';

/**
 * Props for the IdeomniPageCardedSidebarContent component.
 */
type IdeomniPageCardedSidebarContentProps = {
	innerScroll?: boolean;
	children?: ReactNode;
};

/**
 * The IdeomniPageCardedSidebarContent component is a content container for the IdeomniPageCardedSidebar component.
 */
function IdeomniPageCardedSidebarContent(props: IdeomniPageCardedSidebarContentProps) {
	const { innerScroll, children } = props;

	if (!children) {
		return null;
	}

	return (
		<IdeomniScrollbars enable={innerScroll}>
			<div className="IdeomniPageCarded-sidebarContent min-w-80 lg:min-w-0">{children}</div>
		</IdeomniScrollbars>
	);
}

export default IdeomniPageCardedSidebarContent;

import clsx from 'clsx';
import { ReactNode } from 'react';

/**
 * Props for the IdeomniPageCardedHeader component.
 */
type IdeomniPageCardedHeaderProps = {
	header?: ReactNode;
};

/**
 * The IdeomniPageCardedHeader component is a header for the IdeomniPageCarded component.
 */
function IdeomniPageCardedHeader(props: IdeomniPageCardedHeaderProps) {
	const { header = null } = props;

	return <div className={clsx('IdeomniPageCarded-header', 'container')}>{header}</div>;
}

export default IdeomniPageCardedHeader;

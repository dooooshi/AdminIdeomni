import clsx from 'clsx';
import { ReactNode } from 'react';

/**
 * Props for the IdeomniPageSimpleHeader component.
 */
type IdeomniPageSimpleHeaderProps = {
	className?: string;
	header?: ReactNode;
};

/**
 * The IdeomniPageSimpleHeader component is a sub-component of the IdeomniPageSimple layout component.
 * It provides a header area for the layout.
 */
function IdeomniPageSimpleHeader(props: IdeomniPageSimpleHeaderProps) {
	const { header = null, className } = props;
	return (
		<div className={clsx('IdeomniPageSimple-header', className)}>
			<div className="container">{header}</div>
		</div>
	);
}

export default IdeomniPageSimpleHeader;

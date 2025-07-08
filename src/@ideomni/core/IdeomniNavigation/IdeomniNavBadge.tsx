import { styled } from '@mui/material/styles';
import clsx from 'clsx';
import { memo } from 'react';
import { IdeomniNavBadgeType } from './types/IdeomniNavBadgeType';

const Root = styled('div')(({ theme }) => ({
	padding: '0 7px',
	fontSize: 11,
	fontWeight: 600,
	height: 20,
	minWidth: 20,
	borderRadius: 20,
	display: 'flex',
	alignItems: 'center',
	backgroundColor: theme.vars.palette.secondary.main,
	color: theme.vars.palette.secondary.contrastText
}));

type IdeomniNavBadgeProps = {
	className?: string;
	classes?: string;
	badge: IdeomniNavBadgeType;
};

/**
 * IdeomniNavBadge component.
 * This component will render a badge on a IdeomniNav element. It accepts a `IdeomniNavBadgeType` as a prop,
 * which is an object containing a title and background and foreground colour.
 */
function IdeomniNavBadge(props: IdeomniNavBadgeProps) {
	const { className = '', classes = '', badge } = props;

	return (
		<Root
			className={clsx('item-badge', className, classes)}
			style={{
				backgroundColor: badge.bg,
				color: badge.fg
			}}
		>
			{badge.title}
		</Root>
	);
}

export default memo(IdeomniNavBadge);

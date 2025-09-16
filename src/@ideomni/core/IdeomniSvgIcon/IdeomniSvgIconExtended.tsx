'use client';
import { styled } from '@mui/material/styles';
import { Box, BoxProps } from '@mui/material';
import Icon from '@mui/material/Icon';
import clsx from 'clsx';
import NatureIcon from '@/components/icons/NatureIcon';

type IdeomniSvgIconExtendedProps = BoxProps & {
	fill?: string;
	xmlns?: string;
	viewBox?: string;
	size?: number | string;
	color?: 'inherit' | 'disabled' | 'primary' | 'secondary' | 'action' | 'error' | 'info' | 'success' | 'warning';
	ref?: React.RefObject<SVGSVGElement>;
};

const Root = styled(Box)<IdeomniSvgIconExtendedProps>(({ theme, size = 20, color = 'inherit' }) => ({
	width: size,
	height: size,
	minWidth: size,
	minHeight: size,
	fontSize: size,
	lineHeight: size,
	color: {
		primary: theme.vars.palette.primary.main,
		secondary: theme.vars.palette.secondary.main,
		info: theme.vars.palette.info.main,
		success: theme.vars.palette.success.main,
		warning: theme.vars.palette.warning.main,
		action: theme.vars.palette.action.active,
		error: theme.vars.palette.error.main,
		disabled: theme.vars.palette.action.disabled,
		inherit: 'currentColor'
	}[color] as string
}));

/**
 * Extended IdeomniSvgIcon that supports custom icons
 */
function IdeomniSvgIconExtended(props: IdeomniSvgIconExtendedProps) {
	const { children, className = '', color = 'inherit', ref, size = 20, ...rest } = props;

	if (typeof children !== 'string') {
		return null;
	}

	// Handle custom nature icon
	if (children === 'custom:nature-tree') {
		return (
			<NatureIcon
				className={clsx('shrink-0', className)}
				sx={{
					fontSize: size,
					color: color === 'inherit' ? 'inherit' : undefined
				}}
			/>
		);
	}

	// Handle Material Icons
	if (!children.includes(':')) {
		return (
			<Box
				component={Icon}
				ref={ref}
				{...props}
			/>
		);
	}

	// Handle heroicons
	const iconPath = children.replace(':', '.svg#');

	return (
		<Root
			{...props}
			as="svg"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 100 100"
			className={clsx('shrink-0 fill-current', className)}
			ref={ref}
			color={color}
		>
			<use xlinkHref={`/assets/icons/${iconPath}`} />
		</Root>
	);
}

export default IdeomniSvgIconExtended;
import Drawer from '@mui/material/Drawer';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import clsx from 'clsx';
import { ReactNode, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { SwipeableDrawerProps } from '@mui/material/SwipeableDrawer';
import IdeomniPageSimpleSidebarContent from './IdeomniPageSimpleSidebarContent';
import useThemeMediaQuery from '../../hooks/useThemeMediaQuery';

/**
 * Props for the IdeomniPageSimpleSidebar component.
 */
type IdeomniPageSimpleSidebarProps = {
	open?: boolean;
	position?: SwipeableDrawerProps['anchor'];
	variant?: SwipeableDrawerProps['variant'];
	onClose?: () => void;
	children?: ReactNode;
	ref?: React.RefObject<{ toggleSidebar: (T: boolean) => void }>;
	width?: number;
};

/**
 * The IdeomniPageSimpleSidebar component.
 */
function IdeomniPageSimpleSidebar(props: IdeomniPageSimpleSidebarProps) {
	const { open = true, position, variant, onClose = () => {}, ref } = props;

	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	const [isOpen, setIsOpen] = useState(open);

	useImperativeHandle(ref, () => ({
		toggleSidebar: handleToggleDrawer
	}));

	const handleToggleDrawer = useCallback((val: boolean) => {
		setIsOpen(val);
	}, []);

	useEffect(() => {
		handleToggleDrawer(open);
	}, [handleToggleDrawer, open]);

	return (
		<>
			{((variant === 'permanent' && isMobile) || variant !== 'permanent') && (
				<SwipeableDrawer
					variant="temporary"
					anchor={position}
					open={isOpen}
					onOpen={() => {}}
					onClose={() => onClose()}
					disableSwipeToOpen
					classes={{
						root: clsx('IdeomniPageSimple-sidebarWrapper', variant),
						paper: clsx(
							'IdeomniPageSimple-sidebar',
							variant,
							position === 'left' ? 'IdeomniPageSimple-leftSidebar' : 'IdeomniPageSimple-rightSidebar',
							'max-w-full'
						)
					}}
					ModalProps={{
						keepMounted: true // Better open performance on mobile.
					}}
					// container={rootRef.current}
					slotProps={{
						backdrop: {
							classes: {
								root: 'IdeomniPageSimple-backdrop'
							}
						}
					}}
					sx={{ position: 'absolute', '& .MuiPaper-root': { width: `${props.width}px` } }}
				>
					<IdeomniPageSimpleSidebarContent {...props} />
				</SwipeableDrawer>
			)}
			{variant === 'permanent' && !isMobile && (
				<Drawer
					variant="permanent"
					anchor={position}
					className={clsx(
						'IdeomniPageSimple-sidebarWrapper',
						variant,
						isOpen ? 'opened' : 'closed',
						position === 'left' ? 'IdeomniPageSimple-leftSidebar' : 'IdeomniPageSimple-rightSidebar'
					)}
					open={isOpen}
					onClose={onClose}
					classes={{
						paper: clsx('IdeomniPageSimple-sidebar border-0 w-full', variant)
					}}
					sx={{ '& .MuiPaper-root': { width: `${props.width}px` } }}
				>
					<IdeomniPageSimpleSidebarContent {...props} />
				</Drawer>
			)}
		</>
	);
}

export default IdeomniPageSimpleSidebar;

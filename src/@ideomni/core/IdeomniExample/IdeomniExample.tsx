'use client';

import IdeomniHighlight from '@ideomni/core/IdeomniHighlight';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import clsx from 'clsx';
import { ElementType, ReactNode, useState } from 'react';
import { darken } from '@mui/material/styles';
import Box from '@mui/material/Box';
import DemoFrame from './DemoFrame';
import IdeomniSvgIcon from '../IdeomniSvgIcon';

type IdeomniExampleProps = {
	name?: string;
	raw?: string;
	currentTabIndex?: number;
	component: ElementType;
	iframe?: ReactNode;
	className: string;
};

/**
 * IdeomniExample component gives a visual display as well as code for a component example.
 * It consists of two tabs, a visual tab and code tab.
 */
function IdeomniExample(props: IdeomniExampleProps) {
	const { component: Component, raw, iframe, className, name = '', currentTabIndex = 0 } = props;

	const [currentTab, setCurrentTab] = useState(currentTabIndex);

	function handleChange(event: React.SyntheticEvent, value: number) {
		setCurrentTab(value);
	}

	return (
		<Card className={clsx(className, 'shadow-sm not-prose')}>
			<Box
				sx={{
					backgroundColor: (theme) =>
						darken(theme.palette.background.paper, theme.palette.mode === 'light' ? 0.02 : 0.2)
				}}
			>
				<Tabs
					classes={{
						root: 'border-b-1',
						flexContainer: 'justify-end'
					}}
					value={currentTab}
					onChange={handleChange}
					textColor="secondary"
					indicatorColor="secondary"
				>
					{Component && (
						<Tab
							classes={{ root: 'min-w-16' }}
							icon={<IdeomniSvgIcon>heroicons-outline:eye</IdeomniSvgIcon>}
						/>
					)}
					{raw && (
						<Tab
							classes={{ root: 'min-w-16' }}
							icon={<IdeomniSvgIcon>heroicons-outline:code-bracket</IdeomniSvgIcon>}
						/>
					)}
				</Tabs>
			</Box>
			<div className="relative flex max-w-full justify-center">
				<div className={currentTab === 0 ? 'flex max-w-full flex-1' : 'hidden'}>
					{Component &&
						(iframe ? (
							<DemoFrame name={name}>
								<Component />
							</DemoFrame>
						) : (
							<div className="flex max-w-full flex-1 justify-center p-6">
								<Component />
							</div>
						))}
				</div>
				<div className={currentTab === 1 ? 'flex flex-1' : 'hidden'}>
					{raw && (
						<div className="flex flex-1">
							<IdeomniHighlight
								component="pre"
								className="language-javascript w-full"
							>
								{raw}
							</IdeomniHighlight>
						</div>
					)}
				</div>
			</div>
		</Card>
	);
}

export default IdeomniExample;

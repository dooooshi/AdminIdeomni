import { styled, Palette } from '@mui/material/styles';
import { Controller, useForm } from 'react-hook-form';
import themeLayoutConfigs, { themeLayoutDefaultsProps } from 'src/components/theme-layouts/themeLayoutConfigs';
import _ from 'lodash';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Switch, Typography } from '@mui/material';
import { memo, useEffect, useMemo } from 'react';
import { PartialDeep } from 'type-fest';
import IdeomniLayoutConfigs from '@ideomni/core/IdeomniSettings/IdeomniLayoutConfigs';
import usePrevious from '@ideomni/hooks/usePrevious';
import PaletteSelector from './palette-generator/PaletteSelector';
import SectionPreview from './palette-generator/SectionPreview';

/**
 * The Root styled component is used to style the root div of the IdeomniSettings component.
 * It uses the styled function from the MUI styles library to create a styled component.
 */
const Root = styled('div')(({ theme }) => ({
	'& .IdeomniSettings-formControl': {
		margin: '6px 0',
		width: '100%',
		'&:last-child': { marginBottom: 0 }
	},
	'& .IdeomniSettings-formGroupTitle': {
		position: 'absolute',
		top: -10,
		left: 8,
		fontWeight: 600,
		padding: '0 4px',
		backgroundColor: theme.vars.palette.background.paper
	},
	'& .IdeomniSettings-formGroup': {
		position: 'relative',
		border: `1px solid ${theme.vars.palette.divider}`,
		borderRadius: 2,
		padding: '12px 12px 0 12px',
		margin: '24px 0 16px 0',
		'&:first-of-type': { marginTop: 16 }
	}
}));

export type IdeomniThemeType = { palette: PartialDeep<Palette> };
export type IdeomniThemesType = Record<string, IdeomniThemeType>;
export type IdeomniSettingsConfigType = {
	layout: { style?: string; config?: PartialDeep<themeLayoutDefaultsProps> };
	customScrollbars?: boolean;
	direction: 'rtl' | 'ltr';
	theme: { main: IdeomniThemeType; navbar: IdeomniThemeType; toolbar: IdeomniThemeType; footer: IdeomniThemeType };
	defaultAuth?: string[];
	loginRedirectUrl: string;
};

type IdeomniSettingsProps = {
	value: IdeomniSettingsConfigType;
	onChange: (settings: IdeomniSettingsConfigType) => void;
};

/**
 * The IdeomniSettings component is responsible for rendering the settings form for the Ideomni React application.
 * It uses the useForm hook from the react-hook-form library to handle form state and validation.
 * It also uses various MUI components to render the form fields and sections.
 * The component is memoized to prevent unnecessary re-renders.
 */
function IdeomniSettings(props: IdeomniSettingsProps) {
	const { onChange, value: settings } = props;
	const { reset, watch, control } = useForm({ mode: 'onChange', defaultValues: settings });

	const form = watch();
	const formLayoutStyle = watch('layout.style');

	const layoutFormConfigs = useMemo(() => themeLayoutConfigs[formLayoutStyle].form, [formLayoutStyle]);

	const prevForm = usePrevious(form ? _.merge({}, form) : null);
	const prevSettings = usePrevious(settings ? _.merge({}, settings) : null);

	const formChanged = useMemo(() => !_.isEqual(form, prevForm), [form, prevForm]);
	const settingsChanged = useMemo(() => !_.isEqual(settings, prevSettings), [settings, prevSettings]);

	useEffect(() => {
		// reset form if settings change and not same with form
		if (!_.isEqual(settings, form)) {
			reset(settings);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [settings]);

	useEffect(() => {
		// Skip initial changes
		if (!prevForm && !prevSettings) {
			return;
		}

		const newSettings = _.merge({}, settings, form);

		// No need to change
		if (_.isEqual(newSettings, settings)) {
			return;
		}

		// If form changed update theme settings
		if (formChanged) {
			if (settings.layout.style !== newSettings.layout.style) {
				_.set(newSettings, 'layout.config', themeLayoutConfigs[newSettings?.layout?.style]?.defaults);
			}

			onChange(newSettings);
		}
	}, [form, onChange, formChanged, prevForm, prevSettings, reset, settings, settingsChanged]);

	return (
		<Root>
			<div className="IdeomniSettings-formGroup">
				<Typography
					className="IdeomniSettings-formGroupTitle"
					color="text.secondary"
				>
					Layout
				</Typography>

				<Controller
					name="layout.style"
					control={control}
					render={({ field }) => (
						<FormControl
							component="fieldset"
							className="IdeomniSettings-formControl"
						>
							<FormLabel
								component="legend"
								className="text-base"
							>
								Style
							</FormLabel>
							<RadioGroup
								{...field}
								aria-label="Layout Style"
								className="IdeomniSettings-group"
							>
								{Object.entries(themeLayoutConfigs).map(([key, layout]) => (
									<FormControlLabel
										key={key}
										value={key}
										control={<Radio />}
										label={layout.title}
									/>
								))}
							</RadioGroup>
						</FormControl>
					)}
				/>

				{useMemo(
					() => (
						<IdeomniLayoutConfigs
							value={layoutFormConfigs}
							prefix="layout.config"
							control={control}
						/>
					),
					[layoutFormConfigs, control]
				)}

				<Typography
					className="my-4 text-md italic"
					color="text.secondary"
				>
					*Not all option combinations are available
				</Typography>
			</div>

			<div className="IdeomniSettings-formGroup pb-4">
				<Typography
					className="IdeomniSettings-formGroupTitle"
					color="text.secondary"
				>
					Theme
				</Typography>

				<div className="-mx-2 flex flex-wrap">
					<Controller
						name="theme.main"
						control={control}
						render={({ field: { value, onChange } }) => (
							<PaletteSelector
								value={value}
								onChange={onChange}
								triggerElement={
									<div className="group m-2 flex w-32 cursor-pointer flex-col items-center space-y-2">
										<SectionPreview
											className="transition-shadow group-hover:shadow-lg"
											section="main"
										/>
										<Typography className="mb-6 flex-1 text-base font-semibold opacity-80 group-hover:opacity-100">
											Main Palette
										</Typography>
									</div>
								}
							/>
						)}
					/>
					<Controller
						name="theme.navbar"
						control={control}
						render={({ field: { value, onChange } }) => (
							<PaletteSelector
								value={value}
								onChange={onChange}
								triggerElement={
									<div className="group m-2 flex w-32 cursor-pointer flex-col items-center space-y-2">
										<SectionPreview
											className="transition-shadow group-hover:shadow-lg"
											section="navbar"
										/>
										<Typography className="mb-6 flex-1 text-base font-semibold opacity-80 group-hover:opacity-100">
											Navbar Palette
										</Typography>
									</div>
								}
							/>
						)}
					/>
					<Controller
						name="theme.toolbar"
						control={control}
						render={({ field: { value, onChange } }) => (
							<PaletteSelector
								value={value}
								onChange={onChange}
								triggerElement={
									<div className="group m-2 flex w-32 cursor-pointer flex-col items-center space-y-2">
										<SectionPreview
											className="transition-shadow group-hover:shadow-lg"
											section="toolbar"
										/>
										<Typography className="mb-6 flex-1 text-base font-semibold opacity-80 group-hover:opacity-100">
											Toolbar Palette
										</Typography>
									</div>
								}
							/>
						)}
					/>
					<Controller
						name="theme.footer"
						control={control}
						render={({ field: { value, onChange } }) => (
							<PaletteSelector
								value={value}
								onChange={onChange}
								triggerElement={
									<div className="group m-2 flex w-32 cursor-pointer flex-col items-center space-y-2">
										<SectionPreview
											className="transition-shadow group-hover:shadow-lg"
											section="footer"
										/>
										<Typography className="mb-6 flex-1 text-base font-semibold opacity-80 group-hover:opacity-100">
											Footer Palette
										</Typography>
									</div>
								}
							/>
						)}
					/>
				</div>
			</div>
			<Controller
				name="customScrollbars"
				control={control}
				render={({ field: { onChange, value } }) => (
					<FormControl
						component="fieldset"
						className="IdeomniSettings-formControl"
					>
						<FormLabel
							component="legend"
							className="text-base"
						>
							Custom Scrollbars
						</FormLabel>
						<Switch
							checked={value}
							onChange={(ev) => onChange(ev.target.checked)}
							aria-label="Custom Scrollbars"
						/>
					</FormControl>
				)}
			/>
			<Controller
				name="direction"
				control={control}
				render={({ field }) => (
					<FormControl
						component="fieldset"
						className="IdeomniSettings-formControl"
					>
						<FormLabel
							component="legend"
							className="text-base"
						>
							Direction
						</FormLabel>
						<RadioGroup
							{...field}
							aria-label="Layout Direction"
							className="IdeomniSettings-group"
							row
						>
							<FormControlLabel
								key="rtl"
								value="rtl"
								control={<Radio />}
								label="RTL"
							/>
							<FormControlLabel
								key="ltr"
								value="ltr"
								control={<Radio />}
								label="LTR"
							/>
						</RadioGroup>
					</FormControl>
				)}
			/>
		</Root>
	);
}

export default memo(IdeomniSettings);

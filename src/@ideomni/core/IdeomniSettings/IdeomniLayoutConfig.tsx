import { Control } from 'react-hook-form';
import { Typography } from '@mui/material';
import { AnyFormFieldType } from '@ideomni/core/IdeomniSettings/ThemeFormConfigTypes';
import { IdeomniSettingsConfigType } from '@ideomni/core/IdeomniSettings/IdeomniSettings';
import IdeomniLayoutConfigs from './IdeomniLayoutConfigs';
import RadioFormController from './form-controllers/RadioFormController';
import SwitchFormController from './form-controllers/SwitchFormController';
import NumberFormController from './form-controllers/NumberFormController';

type IdeomniSettingsControllerProps = {
	key?: string;
	name: keyof IdeomniSettingsConfigType;
	control: Control<IdeomniSettingsConfigType>;
	title?: string;
	item: AnyFormFieldType;
};

function IdeomniLayoutConfig(props: IdeomniSettingsControllerProps) {
	const { item, name, control } = props;

	switch (item.type) {
		case 'radio':
			return (
				<RadioFormController
					name={name}
					control={control}
					item={item}
				/>
			);
		case 'switch':
			return (
				<SwitchFormController
					name={name}
					control={control}
					item={item}
				/>
			);
		case 'number':
			return (
				<NumberFormController
					name={name}
					control={control}
					item={item}
				/>
			);
		case 'group':
			return (
				<div
					key={name}
					className="IdeomniSettings-formGroup"
				>
					<Typography
						className="IdeomniSettings-formGroupTitle"
						color="text.secondary"
					>
						{item.title}
					</Typography>
					<IdeomniLayoutConfigs
						value={item.children}
						prefix={name}
						control={control}
					/>
				</div>
			);
		default:
			return '';
	}
}

export default IdeomniLayoutConfig;

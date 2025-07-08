import { FormControl, FormLabel, Switch } from '@mui/material';
import { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { IdeomniSettingsConfigType } from '../IdeomniSettings';

type SwitchFormControllerProps = {
	name: keyof IdeomniSettingsConfigType;
	control: Control<IdeomniSettingsConfigType>;
	item: {
		title: string;
	};
};

function SwitchFormController(props: SwitchFormControllerProps) {
	const { name, control, item } = props;

	return (
		<Controller
			key={name}
			name={name}
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
						{item.title}
					</FormLabel>
					<Switch
						checked={value as boolean}
						onChange={(ev, checked) => onChange(checked)}
						aria-label={item.title}
					/>
				</FormControl>
			)}
		/>
	);
}

export default SwitchFormController;

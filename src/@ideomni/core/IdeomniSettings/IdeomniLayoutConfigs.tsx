import { Control } from 'react-hook-form';
import IdeomniLayoutConfig from './IdeomniLayoutConfig';
import ThemeFormConfigTypes from './ThemeFormConfigTypes';
import { IdeomniSettingsConfigType } from './IdeomniSettings';

type IdeomniSettingsControllersProps = {
	value: ThemeFormConfigTypes;
	prefix: string;
	control: Control<IdeomniSettingsConfigType>;
};

function IdeomniLayoutConfigs(props: IdeomniSettingsControllersProps) {
	const { value, prefix, control } = props;

	return Object?.entries?.(value)?.map?.(([key, item]) => {
		const name = prefix ? `${prefix}.${key}` : key;
		return (
			<IdeomniLayoutConfig
				key={key}
				name={name as keyof IdeomniSettingsConfigType}
				control={control}
				item={item}
			/>
		);
	});
}

export default IdeomniLayoutConfigs;

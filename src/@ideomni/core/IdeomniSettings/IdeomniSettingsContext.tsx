import { IdeomniSettingsConfigType, IdeomniThemesType } from '@ideomni/core/IdeomniSettings/IdeomniSettings';
import { createContext } from 'react';

// IdeomniSettingsContext type
export type IdeomniSettingsContextType = {
	data: IdeomniSettingsConfigType;
	setSettings: (newSettings: Partial<IdeomniSettingsConfigType>) => IdeomniSettingsConfigType;
	changeTheme: (newTheme: IdeomniThemesType) => void;
};

// Context with a default value of undefined
const IdeomniSettingsContext = createContext<IdeomniSettingsContextType | undefined>(undefined);

export default IdeomniSettingsContext;

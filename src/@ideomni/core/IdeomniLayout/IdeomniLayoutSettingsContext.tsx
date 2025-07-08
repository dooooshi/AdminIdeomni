import { createContext } from 'react';
import { IdeomniSettingsConfigType } from '@ideomni/core/IdeomniSettings/IdeomniSettings';

type IdeomniLayoutSettingsContextType = IdeomniSettingsConfigType['layout'];

const IdeomniLayoutSettingsContext = createContext<IdeomniLayoutSettingsContextType | undefined>(undefined);

export default IdeomniLayoutSettingsContext;

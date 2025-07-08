import { useContext } from 'react';
import IdeomniSettingsContext, { IdeomniSettingsContextType } from '../IdeomniSettingsContext';

const useIdeomniSettings = (): IdeomniSettingsContextType => {
	const context = useContext(IdeomniSettingsContext);

	if (!context) {
		throw new Error('useSettings must be used within a IdeomniSettingsProvider');
	}

	return context;
};

export default useIdeomniSettings;

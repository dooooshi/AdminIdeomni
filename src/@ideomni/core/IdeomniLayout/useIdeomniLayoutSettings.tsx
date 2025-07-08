import { useContext } from 'react';
import IdeomniLayoutSettingsContext from './IdeomniLayoutSettingsContext';

const useIdeomniLayoutSettings = () => {
	const context = useContext(IdeomniLayoutSettingsContext);

	if (context === undefined) {
		throw new Error('useIdeomniLayoutSettings must be used within a SettingsProvider');
	}

	return context;
};

export default useIdeomniLayoutSettings;

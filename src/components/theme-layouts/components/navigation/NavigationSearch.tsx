'use client';

import IdeomniSearch from '@ideomni/core/IdeomniSearch';
import useNavigation from './hooks/useNavigation';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

type NavigationSearchProps = {
	className?: string;
	variant?: 'basic' | 'full';
};

/**
 * The navigation search.
 */
function NavigationSearch(props: NavigationSearchProps) {
	const { variant, className } = props;
	const { flattenNavigation: navigation } = useNavigation();
	const { t } = useTranslation('common');

	return (
		<IdeomniSearch
			className={className}
			variant={variant}
			navigation={navigation}
			placeholder={t('SEARCH_PLACEHOLDER')}
			noResults={t('NO_RESULTS')}
		/>
	);
}

export default NavigationSearch;

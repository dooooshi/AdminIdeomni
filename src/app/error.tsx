'use client';

import { useEffect } from 'react';
import { Typography, Button, Container } from '@mui/material';
import Link from '@ideomni/core/Link';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';
import { useTranslation } from '@/lib/i18n/hooks/useTranslation';

type ErrorProps = {
	error: Error & { digest?: string };
	reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
	const { t } = useTranslation();
	
	useEffect(() => {
		console.error(error);
	}, [error]);

	return (
		<Container maxWidth="sm">
			<div className="flex flex-col items-center justify-center min-h-screen text-center">
				<IdeomniSvgIcon
					className="mb-4"
					color="error"
					size={64}
				>
					heroicons-outline:information-circle
				</IdeomniSvgIcon>
				<Typography
					className="text-xl lg:text-3xl mb-4"
					color="error.main"
				>
					{t('common.ERROR_SOMETHING_WENT_WRONG')}
				</Typography>
				<Typography
					className="mb-8"
					color="text.secondary"
				>
					{error.message || t('common.ERROR_UNEXPECTED')}
				</Typography>
				<div className="flex gap-2">
					<Button
						component={Link}
						to="/"
						variant="contained"
						color="primary"
						size="small"
					>
						{t('common.GO_TO_HOMEPAGE')}
					</Button>
					<Button
						onClick={() => reset()}
						variant="outlined"
						color="secondary"
						size="small"
					>
						{t('common.TRY_AGAIN')}
					</Button>
				</div>
			</div>
		</Container>
	);
}

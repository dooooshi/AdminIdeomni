import Typography from '@mui/material/Typography';
import Link from '@ideomni/core/Link';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from 'src/components/theme-layouts/components/LanguageSwitcher';
import AdminSignInForm from 'src/lib/auth/forms/AdminSignInForm';
import { keyframes } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import IdeomniSvgIcon from '@ideomni/core/IdeomniSvgIcon';

// Define keyframe animations
const pulseGlow = keyframes`
	0%, 100% { 
		opacity: 0.2;
		transform: scale(1);
	}
	50% { 
		opacity: 0.4;
		transform: scale(1.02);
	}
`;

const fadeInUp = keyframes`
	0% { 
		opacity: 0; 
		transform: translateY(30px); 
	}
	100% { 
		opacity: 1; 
		transform: translateY(0px); 
	}
`;

const slideInLeft = keyframes`
	0% { 
		opacity: 0; 
		transform: translateX(-50px); 
	}
	100% { 
		opacity: 1; 
		transform: translateX(0px); 
	}
`;

const securityPulse = keyframes`
	0%, 100% { 
		opacity: 0.1;
		transform: scale(1) rotate(0deg);
	}
	50% { 
		opacity: 0.3;
		transform: scale(1.1) rotate(2deg);
	}
`;

/**
 * The admin sign in page with enhanced security features and professional styling.
 */
function AdminSignInPage() {
	const { t } = useTranslation();
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		setIsLoaded(true);
	}, []);
	
	return (
		<Box 
			className="flex min-h-screen w-full items-center justify-center relative overflow-hidden"
			sx={{ 
				backgroundColor: 'background.default',
				backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.01) 100%)'
			}}
		>
			{/* Enhanced Background Elements for Admin */}
			<Box
				className="absolute inset-0 pointer-events-none"
				sx={{
					background: 'radial-gradient(circle at 20% 80%, rgba(220, 38, 127, 0.06) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.04) 0%, transparent 50%)',
				}}
			/>
			
			{/* Security-themed Background Elements */}
			<Box
				className="absolute top-1/4 left-1/6 opacity-5"
				sx={{
					width: 120,
					height: 120,
					borderRadius: '50%',
					border: '2px solid',
					borderColor: 'error.main',
					animation: `${securityPulse} 5s ease-in-out infinite`,
				}}
			/>

			<Box
				className="absolute bottom-1/3 right-1/6 opacity-5"
				sx={{
					width: 100,
					height: 100,
					borderRadius: 1,
					border: '2px solid',
					borderColor: 'warning.main',
					animation: `${securityPulse} 7s ease-in-out infinite`,
					animationDelay: '2s'
				}}
			/>

			{/* Admin Shield Icon Background */}
			<Box
				className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-5"
				sx={{
					fontSize: '300px',
					color: 'primary.main',
					animation: `${pulseGlow} 8s ease-in-out infinite`,
					zIndex: 0,
				}}
			>
				<IdeomniSvgIcon size={300}>heroicons-outline:shield-check</IdeomniSvgIcon>
			</Box>

			{/* Language Switcher - positioned at top right */}
			<Box 
				className="absolute top-6 right-6 z-10"
				sx={{
					animation: isLoaded ? `${slideInLeft} 0.6s ease-out` : 'none',
				}}
			>
				<LanguageSwitcher />
			</Box>

			{/* Back to Regular Sign In Link */}
			<Box 
				className="absolute top-6 left-6 z-10"
				sx={{
					animation: isLoaded ? `${slideInLeft} 0.6s ease-out 0.2s both` : 'none',
				}}
			>
				<Link
					to="/sign-in"
					className="flex items-center space-x-2 text-sm hover:underline"
					style={{
						color: 'rgba(0, 0, 0, 0.6)',
						transition: 'all 0.2s ease',
					}}
				>
					<IdeomniSvgIcon size={16}>heroicons-outline:arrow-left</IdeomniSvgIcon>
					<span>{t('auth:BACK_TO_USER_SIGNIN')}</span>
				</Link>
			</Box>
			
			{/* Main Admin Sign In Card */}
			<Paper 
				elevation={0}
				className="w-full max-w-md mx-4 relative z-10"
				sx={{ 
					backgroundColor: 'background.paper',
					border: '2px solid',
					borderColor: 'divider',
					borderRadius: 3,
					animation: isLoaded ? `${fadeInUp} 0.8s ease-out` : 'none',
					transition: 'all 0.3s ease',
					boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
				}}
			>
				<CardContent className="p-8">
					{/* Admin Header Section */}
					<Box 
						className="text-center mb-8"
						sx={{
							animation: isLoaded ? `${fadeInUp} 0.6s ease-out 0.2s both` : 'none',
						}}
					>
						{/* Admin Badge */}
						<Box className="flex justify-center mb-4">
													<Chip 
							icon={<IdeomniSvgIcon size={16}>heroicons-outline:shield-check</IdeomniSvgIcon>}
							label={t('auth:ADMIN_ACCESS')}
							variant="outlined"
							sx={{
								borderColor: 'error.main',
								color: 'error.main',
								fontWeight: 600,
								fontSize: '0.75rem',
								'& .MuiChip-icon': {
									color: 'error.main',
								}
							}}
						/>
						</Box>

						<Typography 
							variant="h4" 
							component="h1"
							className="font-light mb-3"
							sx={{ 
								color: 'text.primary',
								fontSize: '1.875rem',
								letterSpacing: '-0.025em',
								fontWeight: 300,
							}}
						>
							{t('auth:ADMIN_SIGN_IN')}
						</Typography>
						
						<Typography 
							variant="body2" 
							className="text-center mb-4"
							sx={{ 
								color: 'text.secondary',
								fontSize: '0.875rem',
								lineHeight: 1.6,
							}}
						>
							{t('auth:ADMIN_SUBTITLE')}
						</Typography>
					</Box>

					{/* Form Section */}
					<Box 
						className="space-y-6"
						sx={{
							animation: isLoaded ? `${fadeInUp} 0.6s ease-out 0.4s both` : 'none',
						}}
					>
						<AdminSignInForm />
					</Box>

				</CardContent>
			</Paper>
		</Box>
	);
}

export default AdminSignInPage; 
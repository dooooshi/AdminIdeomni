import { useTranslation as useReactI18nextTranslation } from 'react-i18next';

/**
 * Main translation hook
 */
export const useTranslation = (ns?: string | string[]) => {
  return useReactI18nextTranslation(ns);
};

/**
 * Map-specific translation hook
 */
export const useMapTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string, options?: any) => t(`map.${key}`, options)
  };
};

/**
 * Facility management translation hook
 */
export const useFacilityTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string, options?: any) => t(`facility.${key}`, options)
  };
};

/**
 * Activity management translation hook
 */
export const useActivityTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string, options?: any) => t(`activity.${key}`, options)
  };
};

/**
 * Auth translation hook
 */
export const useAuthTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string, options?: any) => t(`auth.${key}`, options)
  };
};

/**
 * Navigation translation hook
 */
export const useNavigationTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string, options?: any) => t(`navigation.${key}`, options)
  };
};

/**
 * Admin management translation hook
 */
export const useAdminTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string, options?: any) => t(`admin.${key}`, options)
  };
};

/**
 * User management translation hook
 */
export const useUserTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string, options?: any) => t(`user.${key}`, options)
  };
};

/**
 * Team management translation hook
 */
export const useTeamTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string, options?: any) => t(`team.${key}`, options)
  };
};

/**
 * Land management translation hook
 */
export const useLandTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string, options?: any) => t(`land.${key}`, options)
  };
};

/**
 * Map template management translation hook
 */
export const useMapTemplateTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string, options?: any) => t(`mapTemplate.${key}`, options)
  };
};

/**
 * Infrastructure configuration translation hook
 */
export const useInfrastructureTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string, options?: any) => t(`infrastructure.${key}`, options)
  };
};

export default useTranslation;
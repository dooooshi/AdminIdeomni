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
    t: (key: string) => t(`map.${key}`)
  };
};

/**
 * Facility management translation hook
 */
export const useFacilityTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string) => t(`facility.${key}`)
  };
};

/**
 * Activity management translation hook
 */
export const useActivityTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string) => t(`activity.${key}`)
  };
};

/**
 * Auth translation hook
 */
export const useAuthTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string) => t(`auth.${key}`)
  };
};

/**
 * Navigation translation hook
 */
export const useNavigationTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string) => t(`navigation.${key}`)
  };
};

/**
 * Admin management translation hook
 */
export const useAdminTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string) => t(`admin.${key}`)
  };
};

/**
 * User management translation hook
 */
export const useUserTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string) => t(`user.${key}`)
  };
};

/**
 * Team management translation hook
 */
export const useTeamTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string) => t(`team.${key}`)
  };
};

/**
 * Land management translation hook
 */
export const useLandTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string) => t(`land.${key}`)
  };
};

/**
 * Map template management translation hook
 */
export const useMapTemplateTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string) => t(`mapTemplate.${key}`)
  };
};

/**
 * Infrastructure configuration translation hook
 */
export const useInfrastructureTranslation = () => {
  const { t } = useReactI18nextTranslation();
  return {
    t: (key: string) => t(`infrastructure.${key}`)
  };
};

export default useTranslation;
export interface Permissions {
    canManagePricing: boolean;
    canAdminister: boolean;
    isViewer: boolean;
    isAnonymous: boolean;
    isDemoViewer: boolean;
}

const PRICING_MANAGEMENT_ROLES = ['admin', 'pricing_manager'];

export function usePermissions(role: string | null, isAnonymous: boolean): Permissions {
    const canManagePricing = !!role && PRICING_MANAGEMENT_ROLES.indexOf(role) !== -1;
    const canAdminister = role === 'admin';
    const isViewer = !role || role === 'viewer';

  return {
        canManagePricing: canManagePricing && !isAnonymous,
        canAdminister: canAdminister && !isAnonymous,
        isViewer,
        isAnonymous,
        isDemoViewer: isAnonymous
  };
}

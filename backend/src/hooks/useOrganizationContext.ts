import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface OrganizationContextState {
    organizationId: string | null;
    organizationSlug: string | null;
    role: string | null;
    loading: boolean;
    error: string | null;
}

const emptyState: OrganizationContextState = {
    organizationId: null,
    organizationSlug: null,
    role: null,
    loading: true,
    error: null
};

export function useOrganizationContext(userId: string | null | undefined): OrganizationContextState {
    const [state, setState] = useState<OrganizationContextState>(emptyState);

  useEffect(() => {
        let cancelled = false;

                async function load() {
                        if (!userId) {
                                  if (!cancelled) setState({ organizationId: null, organizationSlug: null, role: null, loading: false, error: null });
                                  return;
                        }

          const result = await supabase
                          .from('organization_memberships')
                          .select('role, organizations ( id, slug )')
                          .eq('user_id', userId)
                          .limit(1)
                          .maybeSingle();

          if (cancelled) return;

          if (result.error) {
                    setState({ organizationId: null, organizationSlug: null, role: null, loading: false, error: result.error.message });
                    return;
          }

          const row = result.data as any;
                        const org = row ? row.organizations : null;

          setState({
                    organizationId: org ? org.id : null,
                    organizationSlug: org ? org.slug : null,
                    role: row ? row.role : null,
                    loading: false,
                    error: null
          });
                }

                load();

                return () => {
                        cancelled = true;
                };
  }, [userId]);

  return state;
}

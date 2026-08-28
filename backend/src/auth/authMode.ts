export type AuthMode = 'anonymous-demo' | 'disabled';

export function getAuthMode(): AuthMode {
  return 'disabled';
}

export function isAnonymousDemoMode(): boolean {
  return false;
}

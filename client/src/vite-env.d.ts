/// <reference types="vite/client" />

// better-auth ships ESM without bundled .d.ts for the /react sub-path
declare module "better-auth/react" {
  export function createAuthClient(options?: {
    baseURL?: string;
    [key: string]: unknown;
  }): {
    useSession: () => {
      data: { user: { id: string; name: string; email: string } | null; session: unknown } | null;
      isPending: boolean;
      error: unknown;
    };
    signIn: {
      email: (credentials: { email: string; password: string }) => Promise<unknown>;
    };
    signUp: {
      email: (credentials: { email: string; password: string; name: string }) => Promise<unknown>;
    };
    signOut: () => Promise<unknown>;
    [key: string]: unknown;
  };
}

interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// react-router-dom v7 type augmentation — ensures useNavigate is recognized
declare module "react-router-dom" {
  export function useNavigate(): (to: string, options?: { replace?: boolean; state?: unknown }) => void;
  export function useLocation(): { pathname: string; search: string; hash: string; state: unknown };
  export function useParams<T extends Record<string, string>>(): T;
  export function useSearchParams(): [URLSearchParams, (params: URLSearchParams | Record<string, string>) => void];
  export function BrowserRouter(props: { children: React.ReactNode }): JSX.Element;
  export function Routes(props: { children: React.ReactNode }): JSX.Element;
  export function Route(props: { path: string; element: React.ReactNode }): JSX.Element;
  export function Link(props: { to: string; children: React.ReactNode; [key: string]: unknown }): JSX.Element;
  export function Navigate(props: { to: string; replace?: boolean }): JSX.Element;
}

// Temporary shims to avoid TypeScript errors when dependencies are not installed.
// These are low-risk, narrow declarations to allow local typechecking and incremental fixes.


declare module 'lucide-react' {
  import * as React from 'react';
  // Commonly used icons in the codebase — declare them individually to support named imports.
  export const Upload: React.ComponentType<any>;
  export const Eye: React.ComponentType<any>;
  export const Plus: React.ComponentType<any>;
  export const Edit2: React.ComponentType<any>;
  export const Trash2: React.ComponentType<any>;
  export const CheckCircle: React.ComponentType<any>;
  export const XCircle: React.ComponentType<any>;
  export const Pause: React.ComponentType<any>;
  export const Clock: React.ComponentType<any>;
  export const RefreshCw: React.ComponentType<any>;
  export const AlertTriangle: React.ComponentType<any>;
  export const ExternalLink: React.ComponentType<any>;
  export const Calendar: React.ComponentType<any>;
  export const Globe: React.ComponentType<any>;
  export const Building: React.ComponentType<any>;
  export const Edit: React.ComponentType<any>;
  export const Save: React.ComponentType<any>;
  export const X: React.ComponentType<any>;
  export const MessageSquare: React.ComponentType<any>;
  export const User: React.ComponentType<any>;
  export const TrendingUp: React.ComponentType<any>;
  export const BarChart3: React.ComponentType<any>;
  export const PieChartIcon: React.ComponentType<any>;
  export const LineChart: React.ComponentType<any>;
  export const Download: React.ComponentType<any>;
  export const Filter: React.ComponentType<any>;
  export const Target: React.ComponentType<any>;
  export const Users: React.ComponentType<any>;
  export const BookOpen: React.ComponentType<any>;
  export const FileText: React.ComponentType<any>;
  export const Activity: React.ComponentType<any>;
  export const Send: React.ComponentType<any>;
  export const ClockIcon: React.ComponentType<any>;

  const _default: { [key: string]: React.ComponentType<any> } & React.ComponentType<any>;
  export default _default;
}

declare module 'react/jsx-runtime' {
  // Minimal declarations for the JSX runtime used by tooling when @types/react isn't available yet.
  export function jsx(type: any, props?: any, key?: any): any;
  export function jsxs(type: any, props?: any, key?: any): any;
  export function jsxDEV(type: any, props?: any, key?: any, isStatic?: any, source?: any, self?: any): any;
}

declare module 'react' {
  export type ReactNode = any;
  export type ReactElement = any;
  export interface HTMLAttributes<T> {
    className?: string;
    children?: ReactNode;
    [key: string]: any;
  }
  export type ComponentType<P = any> = (props: P) => any;
  export const createElement: any;
  export default any;

  // JSX namespace minimal
  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// Provide common hooks as any to silence temporary type errors before installing @types/react
declare module 'react' {
  export function useState<T = any>(initial?: T): [T, (v: any) => void];
  export function useEffect(callback: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(fn: () => T, deps?: any[]): T;
  export function useRef<T = any>(initial?: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps?: any[]): T;
  export function useContext<T = any>(ctx: any): T;
  export function useReducer(reducer: any, initialState: any): [any, (action: any) => void];
  export function useLayoutEffect(callback: () => void | (() => void), deps?: any[]): void;
}

// Generic shims for asset imports that sometimes appear in the project (svg, png etc.)
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module 'class-variance-authority' {
  export function cva(base?: string, opts?: any): (params?: any) => string;
  export type VariantProps<T> = { [key: string]: any };
}

declare module 'date-fns' {
  export function format(date: any, formatStr: string, opts?: any): string;
}

declare module 'date-fns/locale' {
  export const es: any;
}

declare module 'recharts' {
  export const ResponsiveContainer: any;
  export const LineChart: any;
  export const Line: any;
  export const XAxis: any;
  export const YAxis: any;
  export const CartesianGrid: any;
  export const Tooltip: any;
  export const Legend: any;
  export const BarChart: any;
  export const Bar: any;
  export const PieChart: any;
  export const Pie: any;
  export const Cell: any;
  export const AreaChart: any;
  export const Area: any;
  export const ComposedChart: any;
  const _default: any;
  export default _default;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module 'react' {
  export * from 'react';
  
  export interface FC<P = {}> {
    (props: P): JSX.Element | null;
    displayName?: string;
    defaultProps?: Partial<P>;
  }
  
  export interface FunctionComponent<P = {}> extends FC<P> {}

  export interface SyntheticEvent<T = Element, E = Event> {
    bubbles: boolean;
    cancelable: boolean;
    currentTarget: T;
    defaultPrevented: boolean;
    eventPhase: number;
    isTrusted: boolean;
    nativeEvent: E;
    preventDefault(): void;
    isDefaultPrevented(): boolean;
    stopPropagation(): void;
    isPropagationStopped(): boolean;
    persist(): void;
    target: EventTarget;
    timeStamp: number;
    type: string;
  }

  export interface MouseEvent<T = Element, E = MouseEvent> extends SyntheticEvent<T, E> {
    altKey: boolean;
    button: number;
    buttons: number;
    clientX: number;
    clientY: number;
    ctrlKey: boolean;
    getModifierState(key: string): boolean;
    metaKey: boolean;
    movementX: number;
    movementY: number;
    pageX: number;
    pageY: number;
    relatedTarget: EventTarget | null;
    screenX: number;
    screenY: number;
    shiftKey: boolean;
  }
  
  // Named exports for React hooks
  export function useState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>];
  export function useEffect(effect: EffectCallback, deps?: DependencyList): void;
  export function useRef<T>(initialValue: T): MutableRefObject<T>;
  export function useRef<T>(initialValue: T | null): RefObject<T>;
  export function useRef<T = undefined>(): MutableRefObject<T | undefined>;
  
  export type Dispatch<A> = (value: A) => void;
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type EffectCallback = () => void | (() => void);
  export type DependencyList = ReadonlyArray<any>;
  export interface MutableRefObject<T> { current: T; }
  export interface RefObject<T> { readonly current: T | null; }
  
  // Define type for the React namespace
  interface ReactNamespace {
    useState<T>(initialState: T | (() => T)): [T, Dispatch<SetStateAction<T>>];
    useEffect(effect: EffectCallback, deps?: DependencyList): void;
    useRef<T>(initialValue: T): MutableRefObject<T>;
    useRef<T>(initialValue: T | null): RefObject<T>;
    useRef<T = undefined>(): MutableRefObject<T | undefined>;
    // Add other React properties and methods
    FC: typeof FC;
    FunctionComponent: typeof FunctionComponent;
  }

  // Export the React namespace as the default export
  const React: ReactNamespace;
  export default React;

  export type ReactNode = 
    | React.ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | React.ReactNodeArray;

  export type ReactNodeArray = Array<ReactNode>;
}

declare module 'next/link' {
  import React from 'react';
  
  interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
  }
  
  const Link: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
  export default Link;
}

declare module 'next/image' {
  import React from 'react';
  
  interface ImageProps {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    layout?: 'fixed' | 'intrinsic' | 'responsive' | 'fill';
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    className?: string;
    quality?: number;
    objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
    objectPosition?: string;
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    style?: React.CSSProperties;
    fill?: boolean;
    sizes?: string;
    [key: string]: any; // Allow any other props to be passed
  }
  
  const Image: React.FC<ImageProps>;
  export default Image;
}

declare module 'react-icons/fa' {
  import { IconType } from 'react-icons';
  
  export const FaGithub: IconType;
  export const FaTwitter: IconType;
  export const FaEnvelope: IconType;
  export const FaUser: IconType;
  export const FaSearch: IconType;
  export const FaBars: IconType;
  export const FaTimes: IconType;
  export const FaPlay: IconType;
  export const FaPlus: IconType;
  export const FaCheck: IconType;
  export const FaHeart: IconType;
  export const FaHistory: IconType;
  export const FaSignOutAlt: IconType;
  export const FaArrowLeft: IconType;
  export const FaExpand: IconType;
  export const FaPause: IconType;
  export const FaVolumeUp: IconType;
  export const FaVolumeMute: IconType;
  export const FaThumbsUp: IconType;
}

declare module 'react-icons/md' {
  import { IconType } from 'react-icons';
  
  export const MdMovieFilter: IconType;
  export const MdOutlineTv: IconType;
  export const MdFavorite: IconType;
  export const MdPlaylistAdd: IconType;
}

declare module 'react-icons' {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
  }

  export type IconType = React.FC<IconBaseProps>;
}

// Add components and lib declarations
declare module '../components/Layout' {
  import React from 'react';
  
  interface LayoutProps {
    children: React.ReactNode;
  }
  
  export default function Layout(props: LayoutProps): JSX.Element;
}

declare module '../components/MediaGrid' {
  import React from 'react';
  
  interface MediaItem {
    id: string;
    title: string;
    thumbnailPath: string;
    type: string;
  }
  
  interface MediaGridProps {
    items: MediaItem[];
  }
  
  export default function MediaGrid(props: MediaGridProps): JSX.Element;
}

declare module '../lib/auth' {
  export function isAuthenticated(): boolean;
  export function fetchWithAuth(url: string, options?: RequestInit): Promise<any>;
  export function login(username: string, password: string): Promise<any>;
  export function register(userData: { username: string; email: string; password: string; display_name?: string }): Promise<any>;
  export function logout(): void;
  export function setLocalToken(token: string): void;
  export function getLocalToken(): string | null;
  export function removeLocalToken(): void;
}

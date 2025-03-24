/// <reference types="next" />
/// <reference types="next/types/global" />

declare module 'react' {
  export * from 'react';
  
  // Add ReactNode type
  export type ReactNode = 
    | React.ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactNodeArray;
  
  export type ReactNodeArray = Array<ReactNode>;
  
  // Add FC type
  export interface FC<P = {}> {
    (props: P): JSX.Element | null;
    displayName?: string;
    defaultProps?: Partial<P>;
  }
  
  export interface FunctionComponent<P = {}> extends FC<P> {}
}

declare module 'next/link' {
  import { LinkProps as NextLinkProps } from 'next/dist/client/link';
  import React from 'react';
  
  type LinkProps = NextLinkProps & {
    children?: React.ReactNode;
  };
  
  const Link: React.FC<LinkProps>;
  export default Link;
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

  export type IconType = React.ComponentType<IconBaseProps>;
} 
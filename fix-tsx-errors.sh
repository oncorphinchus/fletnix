#!/bin/bash

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting TypeScript error fix process...${NC}"

# Create types directory if it doesn't exist
mkdir -p frontend/types
echo -e "${GREEN}Created types directory${NC}"

# Generate next-env.d.ts
cat > frontend/types/next-env.d.ts << 'EOL'
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
EOL
echo -e "${GREEN}Generated next-env.d.ts to reference Next.js types${NC}"

# Create JSX type declarations
cat > frontend/types/jsx.d.ts << 'EOL'
// This file is needed to make TypeScript understand JSX
import React from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
EOL
echo -e "${GREEN}Created JSX type declarations${NC}"

# Create comprehensive module declarations
cat > frontend/types/declarations.d.ts << 'EOL'
// This file contains type declarations for modules that don't have type definitions

// Define Next.js Link type to support legacyBehavior
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
  
  export default function Link(props: LinkProps): JSX.Element;
}

// Define React types
declare module 'react' {
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
  
  export function useState<T>(initialState: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>];
  export function useEffect(effect: React.EffectCallback, deps?: React.DependencyList): void;
  export function useRef<T>(initialValue: T): React.MutableRefObject<T>;
  export function useRef<T>(initialValue: T | null): React.RefObject<T>;
  export function useRef<T = undefined>(): React.MutableRefObject<T | undefined>;
}

// Define react-icons module
declare module 'react-icons/fa' {
  import { IconType } from 'react-icons';
  export const FaPlay: IconType;
  export const FaPlus: IconType;
  export const FaCheck: IconType;
  export const FaArrowLeft: IconType;
  export const FaExpand: IconType;
  export const FaPause: IconType;
  export const FaVolumeUp: IconType;
  export const FaVolumeMute: IconType;
  export const FaThumbsUp: IconType;
}
EOL
echo -e "${GREEN}Created comprehensive module declarations${NC}"

# Create basic _app.tsx file if it doesn't exist or is empty
if [ ! -s frontend/pages/_app.tsx ]; then
  cat > frontend/pages/_app.tsx << 'EOL'
import '../styles/globals.css';
import type { AppProps } from 'next/app';

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
EOL
  echo -e "${GREEN}Created _app.tsx file${NC}"
fi

# Create proper _document.tsx file
cat > frontend/pages/_document.tsx << 'EOL'
import Document, { DocumentContext, DocumentInitialProps } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext): Promise<DocumentInitialProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return initialProps;
  }

  render(): JSX.Element {
    return (
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body>
          <div id="__next"></div>
        </body>
      </html>
    );
  }
}

export default MyDocument;
EOL
echo -e "${GREEN}Created proper _document.tsx file${NC}"

# Create README file explaining common issues
cat > frontend/types/README.md << 'EOL'
# TypeScript Types for Fletnix

This directory contains TypeScript declarations to help with common type issues in the project.

## Common Issues and Solutions

### Issue: React.FC missing children property

**Solution**: Avoid using React.FC and use function declarations instead.

```tsx
// Instead of this:
const MyComponent: React.FC<Props> = ({ children }) => { ... }

// Use this:
function MyComponent({ children }: Props & { children?: React.ReactNode }) { ... }
```

### Issue: Next.js Link component and className

**Solution**: Use legacyBehavior with an inner <a> tag to apply className.

```tsx
// Instead of this (will cause type errors):
<Link href="/path" className="my-class">Link Text</Link>

// Use this:
<Link href="/path" legacyBehavior>
  <a className="my-class">Link Text</a>
</Link>
```

### Issue: Missing icon type declarations

If you get errors about missing exports from react-icons, add the icon to the declarations.d.ts file.
EOL
echo -e "${GREEN}Created README file with common issues and solutions${NC}"

# Install @types/react and @types/react-dom
echo -e "${YELLOW}Installing type definitions for React...${NC}"
cd frontend && npm install --save-dev @types/react @types/react-dom
cd ..

echo -e "${GREEN}TypeScript error fix process completed!${NC}"
echo -e "${YELLOW}Note: You may need to restart your development server for changes to take effect.${NC}" 
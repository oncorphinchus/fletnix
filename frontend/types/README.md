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

# 🪝 Custom React Hooks - useResponsive

This directory contains custom React hooks for handling responsive behavior in the application.

## 📁 Files

### `useResponsive.js`
Collection of responsive hooks that make it easy to implement responsive features without writing media queries.

---

## 🎯 Main Exports

### 1. `useResponsive()` - Main Hook
Detects current screen size and provides breakpoint information.

**Returns:**
```javascript
{
  width: number,              // Window width
  height: number,             // Window height
  isMobile: boolean,          // < 640px
  isSmallTablet: boolean,     // 640px - 768px
  isTablet: boolean,          // 768px - 1024px
  isDesktop: boolean,         // 1024px - 1280px
  isLargeDesktop: boolean,    // 1280px+
  isSmallScreen: boolean,     // < 768px (mobile + small tablet)
  isMediumScreen: boolean,    // 768px - 1024px
  isLargeScreen: boolean,     // 1024px+
  currentBreakpoint: string   // 'mobile' | 'sm' | 'md' | 'lg' | 'xl'
}
```

**Example:**
```jsx
import { useResponsive } from '../hooks/useResponsive'

function MyComponent() {
  const { isMobile, isDesktop, currentBreakpoint } = useResponsive()
  
  return (
    <div>
      {isMobile && <p>Showing mobile view</p>}
      {isDesktop && <p>Showing desktop view</p>}
      <p>Current breakpoint: {currentBreakpoint}</p>
    </div>
  )
}
```

---

### 2. `useResponsiveGrid()`
Returns the appropriate number of grid columns based on screen size.

**Returns:**
```javascript
{
  cols2: number,  // 1 (mobile) or 2 (sm+)
  cols3: number,  // 1 (mobile) or 2 (sm) or 3 (md+)
  cols4: number,  // 1 (mobile) or 2 (sm) or 3 (md) or 4 (lg+)
  cols5: number   // 1 (mobile) or 2 (sm) or 3 (md) or 4 (lg) or 5 (xl+)
}
```

**Example:**
```jsx
function GridComponent() {
  const { cols3 } = useResponsiveGrid()
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols3}, 1fr)` }}>
      {items.map(item => <div key={item.id}>{item.name}</div>)}
    </div>
  )
}
```

---

### 3. `useResponsiveSpacing()`
Returns responsive spacing values as Tailwind classes.

**Returns:**
```javascript
{
  gap: string,        // 'gap-2' or 'gap-4'
  gapX: string,       // 'gap-x-2' or 'gap-x-4'
  gapY: string,       // 'gap-y-2' or 'gap-y-4'
  padding: string,    // 'p-2' or 'p-4'
  paddingX: string,   // 'px-2' or 'px-4'
  paddingY: string    // 'py-2' or 'py-4'
}
```

**Example:**
```jsx
function SpacedComponent() {
  const spacing = useResponsiveSpacing()
  
  return (
    <div className={`flex ${spacing.gap}`}>
      <div className={spacing.padding}>Item 1</div>
      <div className={spacing.padding}>Item 2</div>
    </div>
  )
}
```

---

### 4. `useResponsiveContainerPadding()`
Returns the appropriate container padding based on screen size.

**Returns:** `string` - 'px-3' (mobile) | 'px-4' (tablet) | 'px-6' (desktop)

**Example:**
```jsx
function Container() {
  const padding = useResponsiveContainerPadding()
  
  return (
    <div className={`max-w-7xl mx-auto ${padding}`}>
      Content here
    </div>
  )
}
```

---

### 5. `useResponsiveFontSize()`
Returns responsive font size classes for headings and body text.

**Returns:**
```javascript
{
  h1: string,    // 'text-2xl' (mobile) → 'text-5xl' (xl)
  h2: string,    // 'text-xl' (mobile) → 'text-4xl' (xl)
  h3: string,    // 'text-lg' (mobile) → 'text-3xl' (xl)
  h4: string,    // 'text-base' (mobile) → 'text-2xl' (xl)
  h5: string,    // 'text-sm' (mobile) → 'text-xl' (xl)
  body: string   // 'text-xs' (mobile) → 'text-base' (lg+)
}
```

**Example:**
```jsx
function HeadingComponent() {
  const fontSize = useResponsiveFontSize()
  
  return (
    <div>
      <h1 className={fontSize.h1}>Page Title</h1>
      <p className={fontSize.body}>Body text here</p>
    </div>
  )
}
```

---

### 6. `useShowOnScreenSize(showOn)`
Conditionally show/hide content based on screen size.

**Parameters:**
- `showOn: string` - 'mobile' | 'tablet' | 'desktop' | 'smallScreen' | 'largeScreen' | 'all'

**Returns:** `boolean`

**Example:**
```jsx
function ConditionalComponent() {
  const showMobileVersion = useShowOnScreenSize('mobile')
  const showDesktopVersion = useShowOnScreenSize('desktop')
  
  return (
    <>
      {showMobileVersion && <MobileMenu />}
      {showDesktopVersion && <DesktopMenu />}
    </>
  )
}
```

---

## 🎯 Common Patterns

### Show/Hide Components
```jsx
const isMobile = useShowOnScreenSize('mobile')
const isDesktop = useShowOnScreenSize('desktop')

{isMobile && <MobileView />}
{isDesktop && <DesktopView />}
```

### Responsive Layouts
```jsx
const { cols3 } = useResponsiveGrid()

<div style={{
  display: 'grid',
  gridTemplateColumns: `repeat(${cols3}, 1fr)`,
  gap: useResponsiveSpacing().gap
}}>
  {/* Grid items */}
</div>
```

### Responsive Styling
```jsx
const { isMobile } = useResponsive()

<button
  style={{
    padding: isMobile ? '8px 12px' : '12px 24px',
    fontSize: isMobile ? '12px' : '16px'
  }}
>
  Click me
</button>
```

### Debug Current Breakpoint
```jsx
const { currentBreakpoint } = useResponsive()

<div className="fixed bottom-4 right-4 bg-black text-white p-2 text-sm">
  Breakpoint: {currentBreakpoint}
</div>
```

---

## 📱 Breakpoint Reference

| Name | Size | Used By |
|------|------|---------|
| Mobile | < 640px | `isMobile` |
| Small Tablet | 640px - 768px | `isSmallTablet` |
| Tablet | 768px - 1024px | `isTablet` |
| Desktop | 1024px - 1280px | `isDesktop` |
| Large Desktop | 1280px+ | `isLargeDesktop` |

---

## ⚡ Performance Notes

- Hooks use `useState` and `useEffect` for resize detection
- Resize listener is throttled naturally (only on actual resize)
- No performance impact when not in use
- Safe to use in multiple components (React optimizes)

---

## 🎓 Best Practices

1. **Use global utilities first**: Most common patterns are in global CSS
2. **Use hooks for logic**: Only use hooks for conditional rendering or calculations
3. **Avoid overuse**: Don't use hooks for styling (use Tailwind classes instead)
4. **Cache values**: Destructure hook returns to avoid re-renders
5. **Combine with Tailwind**: Use both for best results

---

## ❌ Anti-Patterns

```jsx
// ❌ Don't - Unnecessary complexity
const { isMobile } = useResponsive()
return <div style={{ display: isMobile ? 'block' : 'flex' }}>

// ✅ Do - Use Tailwind utilities
return <div className="block sm:flex">

// ❌ Don't - Use hook in every component
<h1 className={useResponsiveFontSize().h1}>Title</h1>

// ✅ Do - Use global utilities
<h1>Title</h1>

// ❌ Don't - Complex calculations in render
const cols = useResponsive().isMobile ? 1 : 2

// ✅ Do - Use dedicated hook
const { cols2 } = useResponsiveGrid()
```

---

## 🔗 Related Files

- Global utilities: `src/index.css`
- Tailwind config: `tailwind.config.js`
- Examples: `src/RESPONSIVE_EXAMPLES.jsx`
- Guide: `RESPONSIVE_UTILITIES_GUIDE.md`
- Quick reference: `QUICK_REFERENCE.md`

---

## 📞 Need Help?

See the comprehensive guides:
1. `QUICK_REFERENCE.md` - Quick answers
2. `RESPONSIVE_UTILITIES_GUIDE.md` - Complete reference
3. `RESPONSIVE_EXAMPLES.jsx` - Working examples

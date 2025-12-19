# Global Mobile-Responsive Utilities Guide

This project now has **comprehensive global mobile-responsive utilities** that automatically apply to all pages without needing to add responsive classes to individual components.

## 🎯 Overview

The responsive system is implemented at three levels:

1. **Global CSS Utilities** (`src/index.css`) - Automatic responsive styling
2. **Tailwind Config Enhancements** (`tailwind.config.js`) - Custom responsive components
3. **Custom React Hooks** (`src/hooks/useResponsive.js`) - Programmatic responsive logic

## 📱 How It Works

### Mobile-First Approach
The design follows a **mobile-first** strategy:
- Base styles are for mobile (small screens)
- `sm:`, `md:`, `lg:`, `xl:` prefixes add styles for larger screens
- Automatically scales up on larger devices

### Automatic Global Responsive Classes

All these utilities are **automatically applied globally** and don't require any additional setup:

#### **Responsive Text Scaling**
```jsx
<h1>This scales automatically</h1>  // text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl
<p>Paragraph text</p>               // text-xs sm:text-sm md:text-base lg:text-lg
```

#### **Responsive Grid Layouts**
```jsx
<div className="grid-3-col-auto">
  {/* Automatically 1 col on mobile, 2 on tablet, 3 on desktop */}
</div>

<div className="grid-4-col-auto">
  {/* Automatically 1 col on mobile, 2 on sm, 3 on md, 4 on lg */}
</div>
```

#### **Responsive Spacing**
```jsx
<div className="responsive-padding">
  {/* px-3 py-4 on mobile, px-4 py-6 on sm, px-6 py-8 on md, px-8 on lg */}
</div>

<div className="responsive-padding-sm">
  {/* Smaller padding variant */}
</div>

<div className="responsive-padding-lg">
  {/* Larger padding variant */}
</div>
```

#### **Responsive Flex**
```jsx
<div className="flex-responsive">
  {/* flex-col on mobile, flex-row on sm+, with automatic gap */}
</div>

<div className="flex-responsive-between">
  {/* Stack vertically on mobile, horizontal with space-between on sm+ */}
</div>
```

#### **Responsive Cards**
```jsx
<div className="card-responsive">
  {/* Responsive padding, shadows, and hover effects */}
</div>

<div className="card-responsive-lg">
  {/* Larger responsive card */}
</div>
```

## 🎨 Pre-Built Tailwind Components

These are ready-to-use component classes:

```jsx
// Responsive container with padding
<div className="container-responsive">
  Content automatically has proper padding
</div>

// Responsive section
<section className="section-responsive">
  Section with responsive padding
</section>

// Responsive grids
<div className="grid-responsive-2">  {/* 1 col mobile, 2 col tablet+ */}</div>
<div className="grid-responsive-3">  {/* 1 col mobile, 2 col sm, 3 col md+ */}</div>
<div className="grid-responsive-4">  {/* 1 col mobile, 2 col sm, 3 col md, 4 col lg+ */}</div>

// Responsive text
<h1 className="text-responsive-h1">Heading 1</h1>
<h2 className="text-responsive-h2">Heading 2</h2>
<h3 className="text-responsive-h3">Heading 3</h3>
<p className="text-responsive-body">Body text</p>

// Responsive button
<button className="btn-responsive bg-blue-600 text-white rounded">
  Click me
</button>
```

## 🪝 Custom React Hooks

For programmatic responsive logic, use these hooks:

### `useResponsive()`
Detects current screen size and provides breakpoint information:

```jsx
import { useResponsive } from './hooks/useResponsive'

function MyComponent() {
  const { 
    isMobile,           // < 640px
    isSmallTablet,      // 640px - 768px
    isTablet,           // 768px - 1024px
    isDesktop,          // 1024px - 1280px
    isLargeDesktop,     // 1280px+
    currentBreakpoint,  // 'mobile', 'sm', 'md', 'lg', 'xl'
    width, height       // Actual window dimensions
  } = useResponsive()

  return (
    <div>
      {isMobile && <MobileMenu />}
      {!isMobile && <DesktopMenu />}
    </div>
  )
}
```

### `useResponsiveGrid()`
Get responsive grid column counts:

```jsx
const { cols2, cols3, cols4, cols5 } = useResponsiveGrid()
// cols2 = number of columns for 2-col grid based on screen size
```

### `useResponsiveSpacing()`
Get responsive spacing values:

```jsx
const { gap, gapX, gapY, padding, paddingX, paddingY } = useResponsiveSpacing()
// Returns Tailwind classes like 'gap-2' or 'gap-4' based on screen size
```

### `useResponsiveContainerPadding()`
Get container padding based on screen size:

```jsx
const padding = useResponsiveContainerPadding()
// Returns 'px-3' for mobile, 'px-4' for tablet, 'px-6' for desktop
```

### `useResponsiveFontSize()`
Get responsive font size classes:

```jsx
const { h1, h2, h3, h4, h5, body } = useResponsiveFontSize()
// Returns responsive Tailwind classes
```

### `useShowOnScreenSize()`
Conditionally show/hide content:

```jsx
const showMobileMenu = useShowOnScreenSize('mobile')
const showDesktopMenu = useShowOnScreenSize('desktop')
const showOnSmallScreens = useShowOnScreenSize('smallScreen')

return (
  <>
    {showMobileMenu && <MobileMenu />}
    {showDesktopMenu && <DesktopMenu />}
  </>
)
```

## 📐 Breakpoints Reference

| Breakpoint | Size | Class Prefix |
|---|---|---|
| Mobile | < 640px | (no prefix) |
| Small Tablet (sm) | 640px - 768px | `sm:` |
| Tablet (md) | 768px - 1024px | `md:` |
| Desktop (lg) | 1024px - 1280px | `lg:` |
| Large Desktop (xl) | 1280px+ | `xl:` |

## 🔐 Safe Area Support

For notched devices (iPhone X, etc.):

```jsx
<div className="pt-safe">
  {/* Automatically adds padding accounting for notch */}
</div>

<div className="pb-safe pr-safe pl-safe">
  {/* Safe area padding on multiple sides */}
</div>
```

## 👁️ Show/Hide Utilities

```jsx
{/* Hide on mobile, show on tablet+ */}
<div className="hide-mobile">Desktop only content</div>

{/* Show on mobile, hide on tablet+ */}
<div className="show-mobile">Mobile only content</div>

{/* Hide on large screens */}
<div className="hide-desktop">Small screen content</div>

{/* Show only on large screens */}
<div className="show-desktop">Desktop only content</div>
```

## 🖼️ Responsive Images

```jsx
// Responsive image with natural aspect ratio
<img src="..." alt="..." className="img-responsive-container" />

// Square image (1:1 aspect ratio)
<img src="..." alt="..." className="img-responsive-square" />

// Video aspect ratio (16:9)
<div className="img-responsive-video">
  <iframe src="..." className="w-full h-full"></iframe>
</div>
```

## 📋 Touch Target Optimization

All interactive elements are automatically optimized for touch:
- Minimum 44x44px touch targets on mobile
- Automatically scales down on desktop (min-h-auto, min-w-auto)

```jsx
<button>
  {/* Automatically 44x44px minimum on mobile, auto on desktop */}
</button>
```

## 🧪 Debugging

To see current breakpoint during development:

```jsx
<div className="breakpoint-indicator">
  {/* Shows 'Mobile', 'Tablet', 'Medium', 'Desktop', 'Large' based on screen size */}
</div>
```

## 📝 Common Patterns

### Hero Section
```jsx
<section className="section-responsive bg-gradient-to-br from-rose-600 to-rose-900 text-white">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid-2-col-auto items-center">
      <div>
        <h1>Learn Without Limits</h1>
        <p>Responsive paragraph automatically scales</p>
      </div>
      <div>Image or content</div>
    </div>
  </div>
</section>
```

### Grid of Cards
```jsx
<div className="max-w-7xl mx-auto responsive-padding">
  <div className="grid-3-col-auto">
    {items.map(item => (
      <div key={item.id} className="card-responsive">
        {/* Card content */}
      </div>
    ))}
  </div>
</div>
```

### Sidebar Layout
```jsx
<div className="sidebar-layout">
  <div className="main-content">
    {/* Main content here */}
  </div>
  <div className="sidebar">
    {/* Sidebar here - automatically 1 column on mobile, separate on desktop */}
  </div>
</div>
```

## ✅ Best Practices

1. **Always use responsive utilities** - Don't hardcode specific widths
2. **Mobile-first approach** - Write for mobile, then enhance for larger screens
3. **Use semantic HTML** - It helps with responsive design
4. **Test on real devices** - Chrome DevTools is good, but real devices are better
5. **Consider touch interactions** - Make buttons and links easy to tap
6. **Use flexbox/grid** - Better than floats for responsive layouts
7. **Optimize images** - Use responsive images and appropriate sizes

## 🎓 Examples

### Before (Without Global Utilities)
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-4">
    <h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>
    <p className="text-sm md:text-base">Description</p>
  </div>
</div>
```

### After (With Global Utilities)
```jsx
<div className="grid-3-col-auto">
  <div className="card-responsive">
    <h1>Title</h1>  {/* Automatically responsive */}
    <p>Description</p>  {/* Automatically responsive */}
  </div>
</div>
```

## 📚 Documentation Links

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Mobile-First Design](https://www.mobileapproachability.org/)
- [Responsive Web Design Basics](https://web.dev/responsive-web-design-basics/)

---

**All pages in this project automatically benefit from these responsive utilities without any additional configuration!**

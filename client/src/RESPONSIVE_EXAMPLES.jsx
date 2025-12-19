/**
 * RESPONSIVE UTILITIES - QUICK REFERENCE EXAMPLES
 * 
 * This file demonstrates how to use the global responsive utilities
 * in your pages and components. All these patterns work automatically
 * without any additional setup!
 */

// ============================================
// EXAMPLE 1: Using Pre-built Responsive Classes
// ============================================

export function HeroSectionExample() {
  return (
    <section className="section-responsive bg-gradient-to-br from-rose-600 to-rose-900 text-white">
      <div className="max-w-7xl mx-auto container-responsive">
        <div className="grid-2-col-auto items-center">
          <div>
            <h1>Learn Without Limits</h1>
            {/* H1 automatically scales: text-2xl sm:text-3xl md:text-4xl lg:text-5xl */}
            
            <p className="text-responsive-body mt-4">
              Responsive paragraph that automatically scales on all devices
            </p>
            
            <button className="btn-responsive bg-white text-rose-600 hover:bg-gray-100 mt-6 rounded-lg font-semibold">
              Get Started
            </button>
          </div>
          
          <div>
            {/* Your image or content here */}
            <div className="img-responsive-container">
              <img src="..." alt="Hero" className="img-responsive-video" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// EXAMPLE 2: Grid of Cards
// ============================================

export function CourseGridExample() {
  const courses = [
    { id: 1, title: "Web Development", price: "$49" },
    { id: 2, title: "UI Design", price: "$39" },
    { id: 3, title: "Mobile Apps", price: "$59" },
    { id: 4, title: "Cloud Computing", price: "$69" },
  ]

  return (
    <div className="responsive-padding bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="mb-8">Featured Courses</h2>
        {/* Automatically 1 col on mobile, 2 on sm, 3 on md, 4 on lg */}
        <div className="grid-4-col-auto">
          {courses.map(course => (
            <div key={course.id} className="card-responsive-lg">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-600 rounded mb-4"></div>
              <h3>{course.title}</h3>
              <p className="text-gray-600 text-responsive-body mt-2">
                Learn industry-relevant skills from expert instructors
              </p>
              <div className="flex-responsive-between mt-4 pt-4 border-t">
                <span className="font-bold">{course.price}</span>
                <button className="btn-responsive bg-blue-600 text-white rounded">
                  Enroll
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// EXAMPLE 3: Using Custom Hooks for Logic
// ============================================

import { useResponsive, useShowOnScreenSize } from '../hooks/useResponsive'

export function NavbarExample() {
  const { isMobile, currentBreakpoint } = useResponsive()
  const showMobileMenu = useShowOnScreenSize('mobile')
  const showDesktopMenu = useShowOnScreenSize('desktop')

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto responsive-padding">
        <div className="flex-responsive-between">
          <div className="text-2xl font-bold text-rose-600">Ryma Academy</div>
          
          {/* Mobile menu - only shows on small screens */}
          {showMobileMenu && (
            <div className="mobile-menu active">
              <a href="/">Home</a>
              <a href="/courses">Courses</a>
              <a href="/about">About</a>
            </div>
          )}
          
          {/* Desktop menu - only shows on large screens */}
          {showDesktopMenu && (
            <div className="flex gap-6">
              <a href="/" className="hover:text-rose-600">Home</a>
              <a href="/courses" className="hover:text-rose-600">Courses</a>
              <a href="/about" className="hover:text-rose-600">About</a>
            </div>
          )}
        </div>
        
        {/* Debug: Shows current breakpoint */}
        <small className="text-gray-400">Current: {currentBreakpoint}</small>
      </div>
    </nav>
  )
}

// ============================================
// EXAMPLE 4: Sidebar Layout
// ============================================

export function DashboardExample() {
  return (
    <div className="responsive-padding bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="mb-8">Dashboard</h1>
        
        <div className="sidebar-layout gap-6">
          {/* Main content - 3 cols on desktop, full width on mobile */}
          <div className="main-content">
            <div className="card-responsive">
              <h3>Main Content</h3>
              <p>This takes up 3 columns on desktop, full width on mobile</p>
            </div>
          </div>
          
          {/* Sidebar - 1 col on desktop, full width on mobile */}
          <div className="sidebar">
            <div className="card-responsive">
              <h3>Sidebar</h3>
              <p>This is the sidebar content</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// EXAMPLE 5: Responsive Form
// ============================================

export function FormExample() {
  return (
    <div className="responsive-padding max-w-md mx-auto">
      <form className="card-responsive-lg">
        <h2 className="mb-6">Sign Up</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Email</label>
          <input type="email" placeholder="your@email.com" />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Password</label>
          <input type="password" placeholder="••••••••" />
        </div>
        
        <div className="grid-2-col-auto gap-3">
          <button className="btn-responsive bg-gray-200 text-gray-700 rounded">
            Cancel
          </button>
          <button className="btn-responsive bg-blue-600 text-white rounded">
            Sign Up
          </button>
        </div>
      </form>
    </div>
  )
}

// ============================================
// EXAMPLE 6: Feature Cards with Icons
// ============================================

export function FeaturesExample() {
  const features = [
    {
      id: 1,
      icon: '📚',
      title: 'Expert Courses',
      description: 'Learn from industry professionals'
    },
    {
      id: 2,
      icon: '🎓',
      title: 'Certificates',
      description: 'Get recognized credentials'
    },
    {
      id: 3,
      icon: '🏆',
      title: 'Achievements',
      description: 'Track your progress and growth'
    },
    {
      id: 4,
      icon: '💼',
      title: 'Career Support',
      description: 'Access job opportunities'
    },
  ]

  return (
    <div className="responsive-padding bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-center mb-12">Why Choose Us?</h2>
        
        {/* Automatically 1 col on mobile, 2 on sm, 3 on md, 4 on lg */}
        <div className="grid-4-col-auto">
          {features.map(feature => (
            <div key={feature.id} className="card-responsive text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-responsive-body">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// EXAMPLE 7: Using Responsive Hooks for Conditional Rendering
// ============================================

import { useResponsiveGrid, useResponsiveSpacing, useResponsiveFontSize } from '../hooks/useResponsive'

export function AdvancedExample() {
  const spacing = useResponsiveSpacing()
  const fontSize = useResponsiveFontSize()
  const grid = useResponsiveGrid()

  return (
    <div className={`${spacing.padding} bg-gray-50`}>
      <h2 className={fontSize.h2}>Dynamic Responsive Example</h2>
      
      <div className={spacing.gap}>
        <p className={fontSize.body}>
          This component uses custom hooks to dynamically adjust
          layout based on screen size
        </p>
        
        <div className={`grid gap-${spacing.gap}`}>
          {/* Render different number of items based on grid cols */}
          {[...Array(grid.cols3)].map((_, i) => (
            <div key={i} className="card-responsive">
              Item {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// EXAMPLE 8: Responsive Image Gallery
// ============================================

export function ImageGalleryExample() {
  const images = [
    { id: 1, src: '...', alt: 'Course 1' },
    { id: 2, src: '...', alt: 'Course 2' },
    { id: 3, src: '...', alt: 'Course 3' },
    { id: 4, src: '...', alt: 'Course 4' },
    { id: 5, src: '...', alt: 'Course 5' },
    { id: 6, src: '...', alt: 'Course 6' },
  ]

  return (
    <div className="responsive-padding">
      <div className="max-w-7xl mx-auto">
        <h2 className="mb-8">Gallery</h2>
        
        {/* Automatically responsive grid */}
        <div className="grid-3-col-auto">
          {images.map(image => (
            <div key={image.id} className="overflow-hidden rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
              <div className="img-responsive-container">
                <img src={image.src} alt={image.alt} className="img-responsive-square hover:scale-110 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// KEY TAKEAWAYS
// ============================================

/**
 * 1. ALL pages automatically get responsive utilities
 * 2. Use grid-2-col-auto, grid-3-col-auto, etc. instead of grid grid-cols-3
 * 3. Use card-responsive instead of writing custom padding
 * 4. Use container-responsive instead of max-w-7xl + padding
 * 5. Text automatically scales with h1, h2, h3, p elements
 * 6. Use show-mobile, hide-mobile for conditional rendering
 * 7. Use custom hooks for advanced responsive logic
 * 8. Mobile-first: write for small screens, enhance for large screens
 * 
 * BENEFIT: Much less code to write and maintain!
 */

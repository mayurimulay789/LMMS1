// Image utilities for handling fallbacks and default images

/**
 * Generate a default avatar/profile picture based on user name
 * @param {string} name - User name
 * @param {number} size - Image size (default 40)
 * @returns {string} - Data URL for generated avatar
 */
export const generateDefaultAvatar = (name = 'User', size = 40) => {
  const initials = name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);

  // Generate a consistent color based on the name
  const colors = [
    '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3',
    '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a',
    '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'
  ];
  
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const backgroundColor = colors[colorIndex];

  // Create SVG
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size / 2}"/>
      <text x="50%" y="50%" text-anchor="middle" dy="0.35em" 
            font-family="Arial, sans-serif" font-size="${size * 0.4}" 
            font-weight="500" fill="white">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Generate a default course thumbnail
 * @param {string} title - Course title
 * @param {string} category - Course category
 * @returns {string} - Data URL for generated thumbnail
 */
export const generateDefaultThumbnail = (title = 'Course', category = 'General') => {
  const colors = {
    'Programming': '#2196f3',
    'Design': '#e91e63',
    'Marketing': '#ff9800',
    'Business': '#4caf50',
    'Technology': '#9c27b0',
    'Health': '#00bcd4',
    'Language': '#673ab7',
    'Creative': '#ff5722',
    'General': '#607d8b'
  };

  const backgroundColor = colors[category] || colors['General'];
  const initials = title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 3);

  const svg = `
    <svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${backgroundColor}" stop-opacity="1" />
          <stop offset="100%" stop-color="${backgroundColor}CC" stop-opacity="1" />
        </linearGradient>
      </defs>
      <rect width="300" height="200" fill="url(#grad)"/>
      <text x="50%" y="40%" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="32" 
            font-weight="600" fill="white">${initials}</text>
      <text x="50%" y="70%" text-anchor="middle" 
            font-family="Arial, sans-serif" font-size="14" 
            font-weight="400" fill="white" opacity="0.9">${category}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Handle image loading errors by setting a fallback
 * @param {Event} event - Image error event
 * @param {string} fallback - Fallback image URL or generated image
 */
export const handleImageError = (event, fallback) => {
  if (event.target.src !== fallback) {
    event.target.src = fallback;
  }
};

/**
 * Get appropriate image with fallback
 * @param {string} src - Original image source
 * @param {string} type - Type of image ('avatar', 'thumbnail', 'generic')
 * @param {object} options - Options for generating fallback
 * @returns {string} - Image source with fallback
 */
export const getImageWithFallback = (src, type = 'generic', options = {}) => {
  // Check if src is a valid, non-empty string and not a placeholder
  if (src && typeof src === 'string' && src.trim() !== '' && src !== '/placeholder.svg' && !src.includes('placeholder')) {
    return src;
  }

  // Generate fallback based on type
  switch (type) {
    case 'avatar':
      return generateDefaultAvatar(options.name || 'User', options.size || 40);
    case 'thumbnail':
      return generateDefaultThumbnail(options.title || 'Course', options.category || 'General');
    default:
      return generateDefaultAvatar('User', 40);
  }
};
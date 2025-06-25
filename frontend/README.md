# Pylon Proxy Frontend

A mobile-optimized web interface for accessing Pylon issue tracking services.

## Features

- 🎨 **Modern UI/UX**: Clean, minimal interface optimized for mobile devices
- 🌓 **Dark/Light Themes**: Automatic theme detection with manual toggle
- 🔐 **Secure API Key Storage**: Local storage for Pylon API credentials
- 📱 **Mobile-First Design**: Optimized for iPhone 15 and similar devices
- ⚡ **Single Page Application**: Fast client-side routing without page reloads
- 💀 **Skeleton Loading**: Smooth loading states for better UX

## Tech Stack

- **Vanilla JavaScript** (ES6+)
- **HTML5** & **CSS3**
- **Parcel** - Zero-configuration build tool
- **No frameworks** - Lightweight and fast

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 8080

### Setup

1. Navigate to the frontend assets directory:
   ```bash
   cd frontend/assets
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   This will:
   - Start Parcel dev server (usually on port 1234)
   - Open your browser automatically
   - Enable hot module replacement
   - Proxy `/api/*` requests to the backend server

### Build for Production

```bash
npm run build
```

This creates optimized files in the `frontend/dist` directory.

## Project Structure

```
frontend/assets/src/
├── index.html          # Main HTML file
├── styles/
│   ├── main.css       # Base styles and layout
│   ├── themes.css     # Theme variables (light/dark)
│   └── components.css # Reusable UI components
├── js/
│   ├── main.js        # Application entry point
│   ├── router.js      # Client-side routing
│   ├── api.js         # Backend API client
│   ├── storage.js     # LocalStorage wrapper
│   └── pages/
│       ├── home.js    # Home page (API key input)
│       └── issues.js  # Issues page (main app)
└── .proxyrc           # Parcel proxy configuration
```

## Usage

### First Time Setup

1. Open the app in your mobile browser
2. Enter your Pylon API key on the home page
3. Click "Submit" to validate and save the key
4. You'll be redirected to the Issues page

### Viewing Issues

1. Select a **User** from the dropdown
2. Select a **Team** from the dropdown
3. Issues will automatically load when both are selected
4. Issue cards show:
   - Account name with VIP badge (if applicable)
   - Issue ID
   - Priority level (color-coded)
   - Last update time

### Managing API Key

- To update: Return to home page and enter new key
- To clear: Click the "Clear" button on home page

## Styling Guide

### Color Scheme (Pylon-inspired)

- **Primary**: `#5B4FE5` (Purple)
- **Light Background**: `#F0EDFF` (Lavender)
- **Dark Background**: `#0F0E1C` (Deep purple)
- **Success**: Green shades
- **Warning**: Yellow/Orange shades
- **Error**: Red shades

### CSS Classes

- `.card` - Standard card container
- `.btn-primary` - Primary action button
- `.btn-secondary` - Secondary action button
- `.btn-danger` - Destructive action button
- `.alert-*` - Alert messages (success, warning, error, info)
- `.skeleton` - Loading placeholder

## Browser Support

- iOS Safari 14+
- Chrome 90+
- Firefox 88+
- Edge 90+

## Performance Optimizations

- Minimal JavaScript bundle size
- CSS custom properties for theming
- Lazy loading of page components
- Efficient DOM updates
- Optimized for 3G connections

## Contributing

When making changes:
1. Follow the existing code style
2. Test on actual mobile devices
3. Ensure dark/light themes work correctly
4. Keep bundle size minimal
5. Comment complex logic

## Notes

- The frontend server proxies `/api/*` requests to the backend
- API keys are stored in browser localStorage
- No external dependencies except for build tools
- Designed specifically for mobile use cases

# CS Club Photobooth 

A modern web-based photobooth application built for the **2026 Spring Activities Fair**! Take or upload photos, customize with stickers, and share via email - all powered by vanilla HTML, CSS, and JavaScript.

## ✨ Features

### 📷 Photo Capture & Upload
- **Live Camera Feed**: Real-time camera preview with countdown timer
- **4-Photo Strip**: Automatically captures 4 photos in classic photobooth style
- **Photo Upload**: Alternative mode for uploading existing photos
- **Frame Selection**: Choose from 5 different decorative frames

### 🎨 Photo Customization
- **Interactive Stickers**: 6 themed stickers (star, heart, console, arrows, dinosaur, energy)
- **Drag & Drop**: Intuitive sticker positioning with visual feedback
- **Resize & Rotate**: Full sticker manipulation with selection handles
- **Smart Cursors**: Context-aware cursor changes for better UX

### 📧 Sharing & Export
- **Email Integration**: Share photos directly via EmailJS (no backend required)
- **Download**: Save photo strips as PNG files
- **LocalStorage**: Seamless data transfer between pages

### 🎯 User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Keyboard Navigation**: Arrow keys for frame selection, keyboard shortcuts
- **Modern UI**: Clean, professional interface with smooth animations
- **Error Handling**: Comprehensive error management and user feedback

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/thyduong1325/CSClub-photobooth.git
cd CSClub-photobooth

# Start local server (required for camera access)
npx serve
# or
python -m http.server 3000
```

### Deploy to Vercel (Recommended)
1. Push to GitHub repository
2. Connect to [Vercel](https://vercel.com)
3. Deploy with zero configuration needed!

## 📁 Project Structure

```
CSClub-photobooth/
├── 📄 Pages
│   ├── index.html          # Homepage with start button
│   ├── menu.html           # Choose between camera/upload
│   ├── camera.html         # Live camera capture
│   ├── upload.html         # Photo upload interface
│   └── final.html          # Sticker editing & sharing
├── 💻 JavaScript
│   ├── home.js            # Homepage logic & animations
│   ├── camera.js          # Camera handling & photo capture
│   ├── upload.js          # File upload & processing
│   └── final.js           # Sticker system & email sharing
├── 🎨 Stylesheets
│   ├── home.css           # Homepage styling
│   ├── camera.css         # Camera page styling
│   ├── upload.css         # Upload page styling
│   └── final.css          # Final page styling
├── 🖼️ Assets
│   └── photobooth/
│       ├── favicon.png    # Site icon
│       ├── logo.png       # CS Club logo
│       ├── camerapage/
│       │   ├── frame/     # 5 decorative frames
│       │   └── stickers/  # 6 interactive stickers
│       ├── finalpage/     # UI button assets
│       └── homepage/      # Homepage decorations
└── ⚙️ Config
    └── package.json       # Project metadata
```

## 🔄 Application Flow

1. **Homepage** (`index.html`) - Welcome screen with animated elements
2. **Menu** (`menu.html`) - Choose camera capture or photo upload
3. **Camera/Upload** - Capture 4 photos or upload existing ones
4. **Final Editor** (`final.html`) - Add stickers, choose frames, share

## 🛠️ Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Email Service**: [EmailJS](https://emailjs.com) - client-side email sending
- **Camera API**: WebRTC MediaDevices API for live video capture
- **File API**: HTML5 File API for photo uploads
- **Canvas API**: HTML5 Canvas for image processing and sticker rendering
- **Local Storage**: Browser storage for seamless page transitions
- **CSS Features**: Flexbox, Grid, Custom Properties, Animations
- **Deployment**: Static hosting compatible (Vercel, Netlify, GitHub Pages)

## ⚙️ Technical Features

### Advanced JavaScript
- **Modular Design**: Separate JS files for each page functionality
- **Error Handling**: Comprehensive try-catch blocks and user feedback
- **Event Management**: Efficient event listeners with proper cleanup
- **Canvas Manipulation**: Complex 2D rendering for stickers and frames
- **File Processing**: Image upload, resize, and cropping algorithms

### Modern CSS
- **Responsive Layout**: Mobile-first design with breakpoints
- **CSS Variables**: Consistent theming and easy customization
- **Animations**: Smooth transitions and hover effects
- **Flexbox/Grid**: Modern layout techniques
- **Cross-browser**: Compatible styling across browsers

### User Experience
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Optimized image loading and canvas operations
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Mobile Optimization**: Touch-friendly controls and responsive design

## 📧 Email Configuration

The application uses EmailJS for email functionality:
- ✅ **Pre-configured**: Ready-to-use email service
- ✅ **No Backend**: Pure client-side solution
- ✅ **Secure**: No server-side email credentials needed
- ✅ **Reliable**: Professional email delivery service

## 🚀 Deployment Options

### Vercel (Recommended)
- Zero configuration deployment
- Automatic HTTPS
- Global CDN
- Perfect for static sites

### Other Options
- **GitHub Pages**: Free hosting for public repos
- **Netlify**: Drag-and-drop deployment
- **Firebase Hosting**: Google's static hosting
- **Any Static Host**: Works with any provider

## 🎯 Browser Support

- **Chrome**: ✅ Full support
- **Firefox**: ✅ Full support  
- **Safari**: ✅ Full support
- **Edge**: ✅ Full support
- **Mobile**: ✅ iOS Safari, Android Chrome

## 📄 License

This project is licensed for **educational and personal use only**.

- ✅ **Educational Use**: Free for learning and academic projects
- ✅ **Personal Use**: Use for personal, non-commercial purposes
- ✅ **Modification**: Feel free to modify and improve the code
- ❌ **Commercial Use**: Cannot be sold or used for commercial purposes
- ❌ **Redistribution**: No commercial redistribution allowed

## 🏗️ Development

Built with ❤️ for the UST Computer Science Club by the development team.

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

*Ready to capture some memories? Start the photobooth and have fun! 📸*

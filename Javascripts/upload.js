// constants
const WIDTH = 1000, HEIGHT = 3000;

// frame management  
let currentFrame = 1;
const totalFrames = 5;

// dom elements
const elements = {
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas')?.getContext('2d'),
  uploadInput: document.getElementById('uploadPhotoInput'),
  uploadBtn: document.getElementById('uploadPhoto'),
  readyBtn: document.getElementById('readyButton'),
  downloadBtn: document.getElementById('downloadBtn'), // May be null if not present
  frameOverlay: document.getElementById('frameOverlay'),
  prevFrameBtn: document.getElementById('prevFrame'),
  nextFrameBtn: document.getElementById('nextFrame')
};

let photoStage = 0; // 0=top1,1=top2,2=top3,3=top4,4=done

// draw photo to quarters
const drawPhoto = img => {
  const { ctx } = elements;
  
  if (!ctx) {
    console.error('❌ Canvas context not found!');
    return;
  }
  
  const yOffset = photoStage * 634; // Same as camera.js spacing
  const photoHeight = 621; // Same as camera.js photo height
  const imgAspect = img.width / img.height;
  const targetAspect = 1.41; // Same as camera.js target aspect
  let sx, sy, sw, sh;

  // Less aggressive cropping to reduce zoom effect (same as camera.js)
  if (imgAspect > targetAspect) { 
    // Image is wider than target - crop less from sides
    sh = img.height; 
    sw = img.height * targetAspect * 0.9; // Use 90% to reduce crop
    sx = (img.width - sw) / 2; 
    sy = 0; 
  } else { 
    // Image is taller than target - crop less from top/bottom
    sw = img.width; 
    sh = img.width / targetAspect * 0.86;
    sx = 0; 
    sy = (img.height - sh) / 2; 
  }

  // Draw the image without mirroring (uploaded images should not be flipped)
  ctx.drawImage(img, sx, sy, sw, sh, 0, yOffset, WIDTH, photoHeight);

  console.log(`📸 Photo ${photoStage + 1} uploaded!`);
  photoStage++;
  
  if (photoStage < 4) {
    // Show message for next photo
    console.log(`📋 Please upload photo ${photoStage + 1} of 4`);
  } else {
    // All 4 photos uploaded, finalize
    finalizePhotoStrip();
  }
};

// finalize photo strip
const finalizePhotoStrip = () => {
  const { ctx, readyBtn, downloadBtn, uploadBtn, canvas } = elements;
  
  if (!ctx || !canvas) {
    console.error('❌ Canvas or context not found!');
    return;
  }
  
  const frame = new Image();
  frame.src = `Assets/photobooth/camerapage/frame/frame ${currentFrame}.png`;
  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
    localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));
    // Save the current frame selection for the final page
    localStorage.setItem('selectedFrame', currentFrame.toString());
    console.log(`💾 Saved frame ${currentFrame} to localStorage`);
    
    // Update UI
    if (uploadBtn) uploadBtn.style.display = 'none';
    if (readyBtn) {
      readyBtn.style.display = 'inline-block';
      readyBtn.disabled = false;
    }
    if (downloadBtn) downloadBtn.style.display = 'inline-block';
    
    console.log('✅ Photo strip finalized!');
  };
  frame.onerror = () => {
    console.error(`❌ Failed to load frame ${currentFrame}`);
  };
};

// frame switching functions
const updateFrame = () => {
  const { frameOverlay } = elements;
  if (frameOverlay) {
    frameOverlay.src = `Assets/photobooth/camerapage/frame/frame ${currentFrame}.png`;
    console.log(`🖼️ Switched to frame ${currentFrame}`);
  }
};

const nextFrame = () => {
  console.log('🔄 nextFrame() called, current:', currentFrame);
  currentFrame = currentFrame >= totalFrames ? 1 : currentFrame + 1;
  console.log('🔄 nextFrame() new frame:', currentFrame);
  updateFrame();
};

const prevFrame = () => {
  console.log('🔄 prevFrame() called, current:', currentFrame);
  currentFrame = currentFrame <= 1 ? totalFrames : currentFrame - 1;
  console.log('🔄 prevFrame() new frame:', currentFrame);
  updateFrame();
};

// setup frame navigation
const setupFrameNavigation = () => {
  console.log('🚀 Setting up frame navigation...');
  const { prevFrameBtn, nextFrameBtn, frameOverlay } = elements;
  
  // Debug: Check if elements exist
  console.log('🔍 Element check:');
  console.log('prevFrameBtn:', prevFrameBtn);
  console.log('nextFrameBtn:', nextFrameBtn);
  console.log('frameOverlay:', frameOverlay);
  
  if (prevFrameBtn && nextFrameBtn) {
    // frame navigation buttons
    console.log('🎯 Adding click listeners...');
    nextFrameBtn.addEventListener('click', () => {
      console.log('➡️ Next button clicked!');
      nextFrame();
    });
    
    prevFrameBtn.addEventListener('click', () => {
      console.log('⬅️ Prev button clicked!');
      prevFrame();
    });
    
    console.log('✅ Frame navigation setup complete!');
  } else {
    console.log('ℹ️ Frame navigation buttons not found - skipping (this is normal for upload page)');
  }
  
  // keyboard navigation for frames (only arrow keys)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      console.log('⌨️ Left arrow key pressed');
      prevFrame();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      console.log('⌨️ Right arrow key pressed');
      nextFrame();
    }
  });
};

// ready button
elements.readyBtn.addEventListener('click', () => {
  localStorage.setItem('photoStrip', elements.canvas.toDataURL('image/png'));
  window.location.href = 'final.html';
});

// setup event listeners
const setupEventListeners = () => {
  const { uploadBtn, uploadInput, downloadBtn } = elements;

  // Setup upload button event listener
  if (uploadBtn) {
    uploadBtn.addEventListener('click', () => {
      if (uploadInput) {
        uploadInput.click();
      } else {
        console.error('❌ Upload input not found!');
      }
    });
    console.log('✅ Upload button event listener added');
  } else {
    console.error('❌ Upload button not found!');
  }

  // Setup download button event listener (optional)
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadPhoto);
    console.log('✅ Download button event listener added');
  } else {
    console.log('ℹ️ Download button not found - skipping (this is normal)');
  }

  // Handle file upload
  if (uploadInput) {
    uploadInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) {
        console.log('ℹ️ No file selected');
        return;
      }
      
      console.log(`📁 File selected: ${file.name}`);
      const img = new Image();
      img.onload = () => {
        console.log(`🖼️ Image loaded: ${img.width}x${img.height}`);
        drawPhoto(img);
      };
      img.onerror = () => {
        console.error('❌ Failed to load image');
        alert('Failed to load the selected image. Please try another file.');
      };
      img.src = URL.createObjectURL(file);
      uploadInput.value = ''; // Clear input for next upload
    });
    console.log('✅ Upload input event listener added');
  } else {
    console.error('❌ Upload input not found!');
  }
};

// download photo
const downloadPhoto = () => {
  const { canvas } = elements;
  if (!canvas) {
    console.error('❌ Canvas not found for download!');
    return;
  }
  
  canvas.toBlob(blob => {
    if (!blob) {
      console.error('❌ Failed to create blob for download!');
      return;
    }
    
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'photo-strip.png';
    a.click();
    console.log('💾 Photo strip downloaded');
  }, 'image/png');
};

// initialize upload page
const initUploadPage = () => { 
  console.log('🚀 Initializing upload page...');
  console.log('📋 DOM elements check:');
  console.log('- canvas:', document.getElementById('finalCanvas'));
  console.log('- uploadBtn:', document.getElementById('uploadPhoto'));
  console.log('- uploadInput:', document.getElementById('uploadPhotoInput'));
  console.log('- readyBtn:', document.getElementById('readyButton'));
  console.log('- downloadBtn:', document.getElementById('downloadBtn'));
  console.log('- frameOverlay:', document.getElementById('frameOverlay'));
  console.log('- prevFrame:', document.getElementById('prevFrame'));
  console.log('- nextFrame:', document.getElementById('nextFrame'));
  
  try {
    console.log('🎮 Setting up event listeners...');
    setupEventListeners();
    console.log('✅ Event listeners setup complete');
  } catch (error) {
    console.error('❌ Event listeners setup failed:', error);
  }
  
  try {
    console.log('🖼️ Setting up frame navigation...');
    setupFrameNavigation();
    console.log('✅ Frame navigation setup complete');
  } catch (error) {
    console.error('❌ Frame navigation setup failed:', error);
  }
  
  try {
    console.log('🎨 Setting initial frame...');
    updateFrame(); // Set initial frame
    console.log('✅ Initial frame set');
  } catch (error) {
    console.error('❌ Initial frame setup failed:', error);
  }
  
  console.log('✅ Upload page initialization complete!');
  console.log(`📋 Ready to upload photo ${photoStage + 1} of 4`);
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM Content Loaded - starting initialization...');
  
  // Clear local storage
  localStorage.removeItem('photoStrip');
  console.log('🧹 Cleared previous photo strip from localStorage');
  
  initUploadPage();
  
  // Setup logo redirect
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', () => window.location.href = 'index.html');
    console.log('🏠 Logo redirect setup complete');
  }
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === 'loading') {
  console.log('📄 Document still loading, waiting for DOMContentLoaded...');
} else {
  console.log('📄 Document already loaded, initializing immediately...');
  // Clear local storage
  localStorage.removeItem('photoStrip');
  initUploadPage();
}

// Debug functions for testing in console
window.testFrameChange = (frameNumber) => {
  console.log('🧪 Testing frame change to:', frameNumber);
  currentFrame = frameNumber;
  updateFrame();
};

window.testUpload = () => {
  console.log('🧪 Testing upload functionality...');
  const { uploadBtn, uploadInput } = elements;
  
  console.log('📋 Upload button:', uploadBtn);
  console.log('📋 Upload input:', uploadInput);
  console.log('📋 Photo stage:', photoStage);
  
  if (uploadBtn && uploadInput) {
    console.log('✅ Upload elements found');
  } else {
    console.log('❌ Upload elements missing');
  }
};

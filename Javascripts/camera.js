// constants
const WIDTH = 1000, HEIGHT = 3000;

// frame management
let currentFrame = 1;
const totalFrames = 5;

// dom elements
const elements = {
  video: document.getElementById('liveVideo'),
  rightVideo: document.getElementById('rightLiveVideo'),
  canvas: document.getElementById('finalCanvas'),
  ctx: document.getElementById('finalCanvas')?.getContext('2d'),
  takePhotoBtn: document.getElementById('takePhoto'),
  downloadBtn: document.getElementById('downloadBtn'), // May be null if not present
  countdownEl: document.querySelector('.countdown-timer'),
  frameOverlay: document.getElementById('frameOverlay'),
  prevFrameBtn: document.getElementById('prevFrame'),
  nextFrameBtn: document.getElementById('nextFrame'),
  flashIndicator: document.getElementById('flashIndicator'),
  flashOverlay: document.getElementById('flashOverlay')
};

let photoStage = 0; // 0=top1,1=top2,2=top3,3=top4,4=done
let flashEnabled = false; // Flash indicator state

// move video to quarter positions
const moveVideoToHalf = i => {
  const { video } = elements;
  video.style.display = 'block';
  // Position video at different quarters: 0%, 20%, 40%, 60%
  video.style.top = (i * 160) + 'px';
  video.style.left = '0';
  video.style.width = '100%';
  video.style.height = '160px'; // Slightly smaller than 25% to avoid overlap
};

// flash functionality
const toggleFlash = () => {
  const { flashIndicator } = elements;
  
  if (!flashIndicator) {
    console.error('❌ Flash indicator not found!');
    return;
  }
  
  flashEnabled = !flashEnabled;
  
  if (flashEnabled) {
    flashIndicator.classList.add('red');
    console.log('📸 Flash enabled - indicator turned red');
  } else {
    flashIndicator.classList.remove('red');
    console.log('📸 Flash disabled - indicator turned green');
  }
};

const triggerFlash = () => {
  if (!flashEnabled) return;
  
  const { flashOverlay } = elements;
  
  if (!flashOverlay) {
    console.error('❌ Flash overlay not found!');
    return;
  }
  
  console.log('⚡ Triggering flash effect');
  
  // Show flash
  flashOverlay.classList.add('active');
  
  // Hide flash after 300ms
  setTimeout(() => {
    flashOverlay.classList.remove('active');
    console.log('⚡ Flash effect completed');
  }, 300);
};

// countdown
const startCountdown = callback => {
  let count = 3;
  const { countdownEl } = elements;
  countdownEl.textContent = count;
  countdownEl.style.display = 'flex';
  const intervalId = setInterval(() => {
    count--;
    if (count > 0) countdownEl.textContent = count;
    else {
      clearInterval(intervalId);
      countdownEl.style.display = 'none';
      callback();
    }
  }, 1000);
};

// capture photo
const capturePhoto = () => {
  const { video, ctx, takePhotoBtn } = elements;

  // Trigger flash effect if enabled
  triggerFlash();

  const yOffset = photoStage * 634;
  const photoHeight = 621;
  const vW = video.videoWidth, vH = video.videoHeight;

  const targetAspect = 1.41; 
  const vAspect = vW / vH;
  let sx, sy, sw, sh;

  // Less aggressive cropping to reduce zoom effect
  if (vAspect > targetAspect) { 
    // Video is wider than target - crop less from sides
    sh = vH; 
    sw = vH * targetAspect * 0.9; // Use 90% to reduce crop
    sx = (vW - sw) / 2; 
    sy = 0; 
  } else { 
    // Video is taller than target - crop less from top/bottom
    sw = vW; 
    sh = vW / targetAspect * 0.86;
    sx = 0; 
    sy = (vH - sh) / 2; 
  }

  // Wait a moment for flash effect, then draw the image
  setTimeout(() => {
    ctx.save();
    ctx.translate(WIDTH, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, yOffset, WIDTH, photoHeight);
    ctx.restore();

    console.log(`📸 Photo ${photoStage + 1} captured!`);
    photoStage++;
    
    if (photoStage < 4) {
      // Move to next position and continue the photo sequence
      moveVideoToHalf(photoStage);
      // Wait 1 second, then start countdown for next photo
      setTimeout(() => {
        startCountdown(capturePhoto);
      }, 1000);
    } else {
      // All 4 photos taken, finalize
      finalizePhotoStrip();
    }
  }, flashEnabled ? 100 : 0); // Delay slightly if flash is enabled for better effect
};

// start the complete photo sequence
const startPhotoSequence = () => {
  const { takePhotoBtn } = elements;
  
  // Disable button during the entire sequence
  takePhotoBtn.disabled = true;
  // Don't change textContent since button uses CSS ::before for camera icon
  
  // Reset to beginning if needed
  if (photoStage >= 4) {
    photoStage = 0;
    moveVideoToHalf(0);
  }
  
  console.log('🚀 Starting complete photo sequence...');
  
  // Start the first countdown
  startCountdown(capturePhoto);
};

// finalize photo strip
const finalizePhotoStrip = () => {
  const { video, ctx, canvas, takePhotoBtn } = elements;
  video.style.display = 'none';
  
  // Re-enable button (don't change text since it uses CSS ::before)
  takePhotoBtn.disabled = false;
  photoStage = 0; // Reset for next use
  
  const frame = new Image();
  frame.src = `Assets/photobooth/camerapage/frame/frame ${currentFrame}.png`;
  frame.onload = () => {
    ctx.drawImage(frame, 0, 0, WIDTH, HEIGHT);
    localStorage.setItem('photoStrip', canvas.toDataURL('image/png'));
    // Save the current frame selection for the final page
    localStorage.setItem('selectedFrame', currentFrame.toString());
    console.log(`💾 Saved frame ${currentFrame} to localStorage`);
    setTimeout(() => window.location.href = 'final.html', 50);
  };
  frame.complete && frame.onload();
};

// download photo
const downloadPhoto = () => {
  elements.canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'photo-strip.png';
    a.click();
  }, 'image/png');
};

// setup camera
const setupCamera = () => {
  // Setup main camera (left side, used for capture)
  navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 2560 }, height: { ideal: 1440 }, facingMode: 'user' }, audio: false })
    .then(stream => { 
      elements.video.srcObject = stream; 
      elements.video.play(); 
      moveVideoToHalf(0);
      
      // Ensure the take photo button is enabled once camera is ready
      if (elements.takePhotoBtn) {
        elements.takePhotoBtn.disabled = false;
        console.log('✅ Main camera initialized');
        console.log('🎮 Take photo button enabled:', !elements.takePhotoBtn.disabled);
      } else {
        console.log('✅ Main camera initialized');
        console.log('⚠️ Take photo button not found');
      }
    })
    .catch(err => {
      console.error('❌ Main camera access failed:', err);
      alert('Main camera access failed: ' + err);
    });
    
  // Setup right side camera (preview/monitoring)
  navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' }, audio: false })
    .then(stream => { 
      elements.rightVideo.srcObject = stream; 
      elements.rightVideo.play();
      console.log('✅ Right camera initialized');
    })
    .catch(err => {
      console.error('❌ Right camera access failed:', err);
      // Don't alert for right camera failure - it's supplementary
    });
};

// setup events
const setupEventListeners = () => {
  const { takePhotoBtn, downloadBtn, flashIndicator } = elements;

  // Setup take photo button event listener
  if (takePhotoBtn) {
    takePhotoBtn.addEventListener('click', startPhotoSequence);
    console.log('✅ Take photo button event listener added');
  } else {
    console.error('❌ Take photo button not found!');
  }

  // Setup download button event listener (optional)
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadPhoto);
    console.log('✅ Download button event listener added');
  } else {
    console.log('ℹ️ Download button not found - skipping (this is normal)');
  }

  // Setup flash indicator event listener
  if (flashIndicator) {
    flashIndicator.addEventListener('click', toggleFlash);
    console.log('✅ Flash indicator event listener added');
  } else {
    console.log('ℹ️ Flash indicator not found - skipping');
  }
  
  // Enhanced keyboard support for takePhoto button
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('🎯 Enter key pressed!');
      console.log('📋 Button state - disabled:', takePhotoBtn?.disabled);
      console.log('📋 Photo stage:', photoStage);
      
      // Only trigger if button exists, is not disabled and we're not in the middle of a sequence
      if (takePhotoBtn && !takePhotoBtn.disabled) {
        console.log('✅ Triggering photo sequence via Enter key');
        startPhotoSequence();
      } else {
        console.log('⚠️ Photo sequence blocked - button disabled, missing, or sequence in progress');
      }
    }
    
    // Space bar as alternative trigger
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      console.log('🎯 Space bar pressed!');
      if (takePhotoBtn && !takePhotoBtn.disabled) {
        console.log('✅ Triggering photo sequence via Space bar');
        startPhotoSequence();
      }
    }

    // F key to toggle flash
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      console.log('🎯 F key pressed - toggling flash');
      toggleFlash();
    }
  });
  
  window.addEventListener('resize', () => {
    if (photoStage >= 0 && photoStage <= 3) moveVideoToHalf(photoStage);
  });
};

// frame switching functions
const updateFrame = () => {
  const { frameOverlay } = elements;
  frameOverlay.src = `Assets/photobooth/camerapage/frame/frame ${currentFrame}.png`;
  console.log(`🖼️ Switched to frame ${currentFrame}`);
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

// enhanced event listeners
const setupFrameNavigation = () => {
  console.log('🚀 Setting up frame navigation...');
  const { prevFrameBtn, nextFrameBtn, frameOverlay } = elements;
  
  // Debug: Check if elements exist
  console.log('🔍 Element check:');
  console.log('prevFrameBtn:', prevFrameBtn);
  console.log('nextFrameBtn:', nextFrameBtn);
  console.log('frameOverlay:', frameOverlay);
  
  if (!prevFrameBtn || !nextFrameBtn) {
    console.error('❌ Arrow buttons not found! Check HTML IDs.');
    return;
  }
  
  if (!frameOverlay) {
    console.error('❌ Frame overlay not found! Check HTML ID.');
    return;
  }
  
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

// initialize photo booth
const initPhotoBooth = () => { 
  console.log('🚀 Initializing photobooth...');
  console.log('📋 DOM elements check:');
  console.log('- video:', document.getElementById('liveVideo'));
  console.log('- rightVideo:', document.getElementById('rightLiveVideo'));
  console.log('- canvas:', document.getElementById('finalCanvas'));
  console.log('- takePhotoBtn:', document.getElementById('takePhoto'));
  console.log('- downloadBtn:', document.getElementById('downloadBtn'));
  console.log('- countdownEl:', document.querySelector('.countdown-timer'));
  console.log('- prevFrame:', document.getElementById('prevFrame'));
  console.log('- nextFrame:', document.getElementById('nextFrame'));
  console.log('- frameOverlay:', document.getElementById('frameOverlay'));
  console.log('- flashIndicator:', document.getElementById('flashIndicator'));
  console.log('- flashOverlay:', document.getElementById('flashOverlay'));
  
  try {
    console.log('📷 Setting up camera...');
    setupCamera();
    console.log('✅ Camera setup complete');
  } catch (error) {
    console.error('❌ Camera setup failed:', error);
  }
  
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
  
  console.log('✅ Photobooth initialization complete!');
  console.log('⚡ Flash indicator available - click to toggle or press F key');
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('📄 DOM Content Loaded - starting initialization...');
  initPhotoBooth();
  
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
  initPhotoBooth();
}

// Debug functions for testing in console
window.testFrameButtons = () => {
  console.log('🧪 Testing frame buttons manually...');
  const prevBtn = document.getElementById('prevFrame');
  const nextBtn = document.getElementById('nextFrame');
  console.log('prevFrame button:', prevBtn);
  console.log('nextFrame button:', nextBtn);
  
  if (prevBtn) {
    console.log('✅ prevFrame button found');
    prevBtn.style.border = '3px solid red'; // Visual indicator
  } else {
    console.log('❌ prevFrame button NOT found');
  }
  
  if (nextBtn) {
    console.log('✅ nextFrame button found');
    nextBtn.style.border = '3px solid red'; // Visual indicator
  } else {
    console.log('❌ nextFrame button NOT found');
  }
};

window.testFrameChange = (frameNumber) => {
  console.log('🧪 Testing frame change to:', frameNumber);
  currentFrame = frameNumber;
  updateFrame();
};

// Debug function to test Enter key functionality
window.testEnterKey = () => {
  console.log('🧪 Testing Enter key functionality...');
  const { takePhotoBtn } = elements;
  
  console.log('📋 Button element:', takePhotoBtn);
  console.log('📋 Button disabled:', takePhotoBtn ? takePhotoBtn.disabled : 'Button not found');
  console.log('📋 Photo stage:', photoStage);
  
  // Simulate Enter key press
  const enterEvent = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    bubbles: true
  });
  
  console.log('🚀 Dispatching Enter key event...');
  document.dispatchEvent(enterEvent);
};

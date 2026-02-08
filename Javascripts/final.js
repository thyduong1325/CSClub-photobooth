// constants
const WIDTH = 1000, HEIGHT = 3000;

// frame management
let currentFrame = 1;
const totalFrames = 5;

// dom elements
const canvas = document.getElementById('finalCanvas'),
      ctx = canvas.getContext('2d'),
      addFishBtn = document.getElementById('addFish'),
      addOctopusBtn = document.getElementById('addOctopus'),
      addSeaweedBtn = document.getElementById('addSeaweed'),
      addAxBtn = document.getElementById('addAx'),
      addBubbleBtn = document.getElementById('addBubble'),
      downloadBtn = document.getElementById('downloadBtn'),
      shareBtn = document.getElementById('shareBtn'),
      emailBtn = document.getElementById('emailBtn'),
      homeBtn = document.getElementById('homeBtn'),
      resetBtn = document.getElementById('reset'),
      emailModal = document.getElementById('emailModal'),
      emailInput = document.getElementById('emailInput'),
      sendEmailBtn = document.getElementById('sendEmailBtn'),
      cancelBtn = document.getElementById('cancelBtn'),
      closeBtn = document.querySelector('.close'),
      frameOverlay = document.getElementById('finalFrameOverlay'),
      prevFrameBtn = document.getElementById('prevFrame'),
      nextFrameBtn = document.getElementById('nextFrame');

// sticker state
let stickers = [], dragOffset = { x: 0, y: 0 }, selectedSticker = null;

// frame image for canvas drawing
const frameImage = new Image();
frameImage.src = `Assets/fish-photobooth/camerapage/frame/frame ${currentFrame}.png`;
frameImage.onload = () => drawCanvas(); // Redraw when frame loads

// load photo
const finalImage = new Image(), dataURL = localStorage.getItem('photoStrip');
if (dataURL) {
  finalImage.src = dataURL;
  finalImage.onload = () => {
    drawCanvas(); // Initial draw when photo loads
  };
  localStorage.removeItem('photoStrip');
} else alert("No photo found!");

// draw canvas
function drawCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  // Draw photo first
  ctx.drawImage(finalImage, 0, 0, WIDTH, HEIGHT);
  // Draw frame over the photo
  if (frameImage.complete && frameImage.naturalWidth !== 0) {
    ctx.drawImage(frameImage, 0, 0, WIDTH, HEIGHT);
  }
  // Draw stickers on top of frame
  stickers.forEach(s => ctx.drawImage(s.img, s.x, s.y, s.width, s.height));
}

// add sticker
function addSticker(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    stickers.push({
      img,
      x: WIDTH / 2 - img.width / 5,
      y: HEIGHT / 2 - img.height / 5,
      width: img.width / 2,
      height: img.height / 2,
      dragging: false
    });
    drawCanvas();
  };
}

// pointer position
function getPointerPos(e) {
  const rect = canvas.getBoundingClientRect(), scaleX = canvas.width / rect.width, scaleY = canvas.height / rect.height;
  const clientX = e.touches?.[0]?.clientX ?? e.clientX,
        clientY = e.touches?.[0]?.clientY ?? e.clientY;
  return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
}

// drag and drop
function pointerDown(e) {
  const { x: mouseX, y: mouseY } = getPointerPos(e);
  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (mouseX >= s.x && mouseX <= s.x + s.width && mouseY >= s.y && mouseY <= s.y + s.height) {
      selectedSticker = s;
      s.dragging = true;
      dragOffset.x = mouseX - s.x;
      dragOffset.y = mouseY - s.y;
      stickers.splice(i, 1);
      stickers.push(s);
      drawCanvas();
      e.preventDefault();
      break;
    }
  }
}
function pointerMove(e) {
  if (!selectedSticker?.dragging) return;
  const { x: mouseX, y: mouseY } = getPointerPos(e);
  selectedSticker.x = mouseX - dragOffset.x;
  selectedSticker.y = mouseY - dragOffset.y;
  drawCanvas();
  e.preventDefault();
}
function pointerUp() { if (selectedSticker) selectedSticker.dragging = false; selectedSticker = null; }

// mouse events
canvas.addEventListener('mousedown', pointerDown);
canvas.addEventListener('mousemove', pointerMove);
canvas.addEventListener('mouseup', pointerUp);
canvas.addEventListener('mouseleave', pointerUp);

// touch events
canvas.addEventListener('touchstart', pointerDown);
canvas.addEventListener('touchmove', pointerMove);
canvas.addEventListener('touchend', pointerUp);
canvas.addEventListener('touchcancel', pointerUp);

// stickers
addFishBtn.addEventListener('click', () => addSticker('Assets/fish-photobooth/camerapage/stickers/fish.png'));
addOctopusBtn.addEventListener('click', () => addSticker('Assets/fish-photobooth/camerapage/stickers/octopus.png'));


addSeaweedBtn.addEventListener('click', () => { addSticker('Assets/fish-photobooth/camerapage/stickers/seaweed.png'); });
addAxBtn.addEventListener('click', () => addSticker('Assets/fish-photobooth/camerapage/stickers/axolotl.png'));
addBubbleBtn.addEventListener('click', () => { addSticker('Assets/fish-photobooth/camerapage/stickers/bubble.png'); });

// reset
resetBtn.addEventListener('click', () => { stickers = []; drawCanvas(); });

// download
downloadBtn.addEventListener('click', () => {
  // Create download with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `CS-Club-Photobooth-${timestamp}.png`;
  
  canvas.toBlob(blob => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }, 'image/png');
});

// share - native macOS share
shareBtn.addEventListener('click', async () => {
  try {
    console.log('🚀 Starting native share process...');
    
    // Convert canvas to blob for native sharing
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png', 1.0);
    });
    
    console.log('📊 Blob created:', blob.size, 'bytes');
    
    // Create file object with proper name
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `CS-Club-Photobooth-${timestamp}.png`;
    const file = new File([blob], filename, { type: 'image/png' });
    
    console.log('📄 File created:', filename, file.size, 'bytes');

    // Check if Web Share API is supported
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }
    
    // Check if files can be shared
    if (!navigator.canShare) {
      console.log('⚠️ canShare not available, trying direct share...');
    } else if (!navigator.canShare({ files: [file] })) {
      throw new Error('File sharing not supported');
    }
    
    console.log('✅ Share API checks passed, attempting share...');
    
    // Try sharing with file
    await navigator.share({
      title: '🐠 CS Club Photobooth Photo',
      text: 'Check out my awesome photo from the Computer Science Club photobooth at the 2026 Spring Activities Fair! 🐠🐙🌊',
      files: [file]
    });
    
    console.log('✅ Native share completed successfully!');
    
  } catch (error) {
    console.error('❌ Native share failed:', error);
    console.log('🔍 Error details:', {
      name: error.name,
      message: error.message,
      navigator_share: !!navigator.share,
      navigator_canShare: !!navigator.canShare,
      userAgent: navigator.userAgent
    });
    
    if (error.name === 'AbortError') {
      // User cancelled the share - this is normal, don't show error
      console.log('👤 User cancelled share');
      return;
    }
    
    // Fallback: Try sharing without file (just link)
    try {
      console.log('🔄 Trying fallback share without file...');
      
      if (navigator.share) {
        await navigator.share({
          title: '🐠 CS Club Photobooth Photo',
          text: 'Check out the Computer Science Club photobooth at the 2026 Spring Activities Fair! Create your own underwater-themed photo with stickers! 🐠🐙🌊',
          url: window.location.href
        });
        
        console.log('✅ Fallback share completed!');
        alert('Shared link to photobooth! 🎉\n\nNote: The image couldn\'t be shared directly.\nTip: Use the Download button to save the image, then share manually via AirDrop.');
        return;
      }
    } catch (fallbackError) {
      console.error('❌ Fallback share also failed:', fallbackError);
    }
    
    // Show helpful error message with alternatives
    let errorMessage = 'Native sharing not available.\n\n';
    let suggestions = [];
    
    if (navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome')) {
      suggestions.push('• Try updating Safari to the latest version');
      suggestions.push('• Make sure you\'re on macOS Big Sur or later');
    } else {
      suggestions.push('• Try using Safari instead of Chrome for better macOS integration');
    }
    
    suggestions.push('• Use the Download button, then share the file manually via AirDrop');
    suggestions.push('• Use the Email button to share via email');
    
    alert(errorMessage + 'Alternatives:\n' + suggestions.join('\n'));
  }
});

// email - EmailJS function
emailBtn.addEventListener('click', () => {
  emailModal.style.display = 'block';
});

// modal event listeners
closeBtn.addEventListener('click', () => {
  emailModal.style.display = 'none';
  emailInput.value = '';
});

cancelBtn.addEventListener('click', () => {
  emailModal.style.display = 'none';
  emailInput.value = '';
});

sendEmailBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  console.log('📧 Starting email send process...');
  console.log('Email address:', email);
  
  if (!email) {
    alert('Please enter a valid email address.');
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address format.');
    return;
  }

  // Show loading state
  const originalText = sendEmailBtn.textContent;
  sendEmailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  sendEmailBtn.disabled = true;

  try {
    console.log('🎨 Processing image with smart compression...');
    
    // Create a canvas for email with optimized quality
    const emailCanvas = document.createElement('canvas');
    const emailCtx = emailCanvas.getContext('2d');
    
    // Start with moderate dimensions for better quality
    let emailWidth = Math.floor(WIDTH * 0.5);  // 588px
    let emailHeight = Math.floor(HEIGHT * 0.5); // 735px
    let quality = 0.8; // Start with high quality JPEG
    let imageData;
    let imageSizeKB;
    
    // Try different compression settings until we get under 40KB (leaving 10KB for other variables)
    for (let attempt = 0; attempt < 6; attempt++) {
      emailCanvas.width = emailWidth;
      emailCanvas.height = emailHeight;
      
      // Draw the current canvas content
      emailCtx.drawImage(canvas, 0, 0, WIDTH, HEIGHT, 0, 0, emailWidth, emailHeight);
      
      // Convert to JPEG with current quality setting
      imageData = emailCanvas.toDataURL('image/jpeg', quality);
      imageSizeKB = Math.round(imageData.length / 1024);
      
      console.log(`📊 Attempt ${attempt + 1}: ${emailWidth}x${emailHeight} at ${Math.round(quality * 100)}% quality = ${imageSizeKB}KB`);
      
      if (imageData.length <= 40000) { // 40KB limit for image (leaving 10KB for other variables)
        console.log('✅ Found optimal compression settings!');
        break;
      }
      
      // Adjust settings for next attempt - much more aggressive
      if (attempt === 0) {
        quality = 0.3; // Start with lower quality
      } else if (attempt === 1) {
        quality = 0.2; // Even lower quality
      } else if (attempt === 2) {
        emailWidth = Math.floor(WIDTH * 0.3);  // Smaller size
        emailHeight = Math.floor(HEIGHT * 0.3);
        quality = 0.4;
      } else if (attempt === 3) {
        emailWidth = Math.floor(WIDTH * 0.25); // Even smaller
        emailHeight = Math.floor(HEIGHT * 0.25);
        quality = 0.3;
      } else if (attempt === 4) {
        emailWidth = Math.floor(WIDTH * 0.2);  // Much smaller
        emailHeight = Math.floor(HEIGHT * 0.2);
        quality = 0.3;
      } else if (attempt === 5) {
        emailWidth = Math.floor(WIDTH * 0.15); // Very small
        emailHeight = Math.floor(HEIGHT * 0.15);
        quality = 0.2;
      }
    }
    
    console.log('📏 Final image size:', imageSizeKB, 'KB');
    console.log('🖼️ Image data length:', imageData.length);
    console.log('📐 Email canvas dimensions:', emailWidth, 'x', emailHeight);
    
    // Final check - if still too large, throw error
    if (imageData.length > 40000) { 
      throw new Error('Image still too large after optimization: ' + imageSizeKB + 'KB (EmailJS limit is 50KB total)');
    }

    // Prepare email data
    const formData = {
      from_name: 'UST Computer Science Club',
      from_email: 'csclub@stthomas.edu',
      message: `Someone wanted to share their awesome photo from the Computer Science Club photobooth at the 2026 Spring Activities Fair!

Check out this fantastic underwater-themed photo created using our interactive photobooth where visitors can add fun stickers like fish, octopus, seaweed, and bubbles! 🐠🐙🌊

Interested in Computer Science? Come visit our club booth or reach out to learn more about programming, web development, and all the exciting projects we work on!

Hope you enjoy the photo! 🎉

This image has been compressed for email delivery. For full quality, use the Download button on the photobooth!`,
      to_email: email,
      image_data: imageData
    };

    console.log('📋 Email data prepared:', {
      to_email: formData.to_email,
      from_name: formData.from_name,
      message_length: formData.message.length,
      image_data_size: Math.round(formData.image_data.length / 1024) + 'KB'
    });

    console.log('🚀 Sending email via EmailJS...');
    console.log('📧 Service ID:', 'service_ev0644d');
    console.log('📄 Template ID:', 'template_evikrle');

    // Check if EmailJS is loaded
    if (typeof emailjs === 'undefined') {
      throw new Error('EmailJS not loaded. Check your internet connection.');
    }

    // Send email with detailed logging
    const result = await emailjs.send(
      'service_ev0644d',     // Your updated service ID
      'template_evikrle',    // Your NEW template ID with image support
      formData
    );

    console.log('✅ EmailJS response:', result);
    console.log('📤 Email sent successfully!');

    alert('Photo sent successfully! 🎉\n\nThe recipient will receive your photobooth picture via email!\n\n(Image compressed for email - use Download for full quality)');
    
    // Close modal
    emailModal.style.display = 'none';
    emailInput.value = '';

  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.log('🔍 Full error object:', error);
    console.log('📊 Error details:', {
      name: error.name,
      message: error.message,
      status: error.status || 'No status',
      text: error.text || 'No text'
    });
    
    let userMessage = 'Unable to send photo email.';
    let debugInfo = '';
    
    if (error.message && error.message.includes('Image still too large')) {
      userMessage = 'The image is too complex for email. Try using fewer stickers or use the Share/Download buttons instead.';
      debugInfo = `Image size: ${Math.round(error.message.match(/\d+/)[0])}KB (EmailJS total limit is 50KB)`;
    } else if (error.status === 413) {
      if (error.text && error.text.includes('Variables size limit')) {
        userMessage = 'Image too large for EmailJS (50KB total limit). Try using fewer stickers or use Share/Download buttons.';
        debugInfo = 'EmailJS has a 50KB limit for all email data combined';
      } else {
        userMessage = 'Image file is too large for email service.';
        debugInfo = 'Try reducing the number of stickers or use the Share/Download options for full quality';
      }
    } else if (error.status === 422) {
      userMessage = 'Email template configuration issue.';
      debugInfo = 'Template variables needed: {{from_name}}, {{to_email}}, {{message}}, {{image_data}}';
    } else if (error.status === 400) {
      userMessage = 'EmailJS service configuration issue.';
      debugInfo = 'Service ID might need verification';
    } else if (error.status === 401) {
      userMessage = 'EmailJS authentication issue.';
      debugInfo = 'Public key might be incorrect';
    } else if (typeof emailjs === 'undefined') {
      userMessage = 'EmailJS library not loaded. Check your internet connection.';
      debugInfo = 'EmailJS CDN might be blocked';
    } else {
      debugInfo = `Error: ${error.message || 'Unknown error'}`;
    }
    
    alert(userMessage + '\n\nDebug info: ' + debugInfo + '\n\nAlternative: Use the DOWNLOAD button to save the photo at full quality, then email it manually.');
  } finally {
    // Reset button state
    sendEmailBtn.innerHTML = originalText;
    sendEmailBtn.disabled = false;
  }
});

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === emailModal) {
    emailModal.style.display = 'none';
    emailInput.value = '';
  }
});

// frame navigation functions
const updateFrame = () => {
  // Update canvas frame image
  frameImage.src = `Assets/fish-photobooth/camerapage/frame/frame ${currentFrame}.png`;
  frameImage.onload = () => drawCanvas(); // Redraw canvas when frame loads
  
  // Also update HTML overlay (keep it hidden but functional for consistency)
  if (frameOverlay) {
    frameOverlay.src = `Assets/fish-photobooth/camerapage/frame/frame ${currentFrame}.png`;
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

// frame navigation event listeners
if (nextFrameBtn && prevFrameBtn) {
  nextFrameBtn.addEventListener('click', () => {
    console.log('➡️ Next button clicked!');
    nextFrame();
  });
  
  prevFrameBtn.addEventListener('click', () => {
    console.log('⬅️ Prev button clicked!');
    prevFrame();
  });
  
  // keyboard navigation for frames
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
  
  console.log('✅ Frame navigation setup complete!');
  
  // Set initial frame
  updateFrame();
} else {
  console.error('❌ Frame navigation buttons not found!');
}

// home
homeBtn.addEventListener('click', () => window.location.href = 'index.html');

// logo
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});

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
let isResizing = false, isRotating = false;
const HANDLE_SIZE = 12;

// frame image for canvas drawing
const frameImage = new Image();

// Load the selected frame from camera page first, then set the frame image
const savedFrame = localStorage.getItem('selectedFrame');
if (savedFrame) {
  currentFrame = parseInt(savedFrame, 10);
  console.log(`📋 Loaded saved frame: ${currentFrame}`);
  localStorage.removeItem('selectedFrame'); // Clean up after use
} else {
  console.log(`📋 No saved frame found, using default: ${currentFrame}`);
}

// Set the frame image source with the correct frame
frameImage.src = `Assets/photobooth/camerapage/frame/frame ${currentFrame}.png`;
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
  stickers.forEach(s => {
    ctx.save();
    const centerX = s.x + s.width / 2;
    const centerY = s.y + s.height / 2;
    ctx.translate(centerX, centerY);
    ctx.rotate(s.rotation || 0);
    ctx.drawImage(s.img, -s.width / 2, -s.height / 2, s.width, s.height);
    ctx.restore();
  });
  
  // Draw selection handles for selected sticker
  if (selectedSticker && !selectedSticker.dragging && !isResizing && !isRotating) {
    drawSelectionHandles(selectedSticker);
  }
}

// draw selection handles
function drawSelectionHandles(sticker) {
  const handles = getStickerHandles(sticker);
  
  ctx.save();
  ctx.strokeStyle = '#0066ff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2;
  
  // Draw bounding box
  const corners = [
    { x: sticker.x, y: sticker.y },
    { x: sticker.x + sticker.width, y: sticker.y },
    { x: sticker.x + sticker.width, y: sticker.y + sticker.height },
    { x: sticker.x, y: sticker.y + sticker.height }
  ];
  
  if (sticker.rotation) {
    const centerX = sticker.x + sticker.width / 2;
    const centerY = sticker.y + sticker.height / 2;
    corners.forEach(corner => {
      const rotated = rotatePoint(corner.x, corner.y, centerX, centerY, sticker.rotation);
      corner.x = rotated.x;
      corner.y = rotated.y;
    });
  }
  
  ctx.beginPath();
  ctx.moveTo(corners[0].x, corners[0].y);
  corners.slice(1).forEach(corner => ctx.lineTo(corner.x, corner.y));
  ctx.closePath();
  ctx.stroke();
  
  // Draw handles
  Object.values(handles).forEach(handle => {
    ctx.beginPath();
    ctx.arc(handle.x, handle.y, HANDLE_SIZE / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  
  ctx.restore();
}

// get sticker handle positions
function getStickerHandles(sticker) {
  const centerX = sticker.x + sticker.width / 2;
  const centerY = sticker.y + sticker.height / 2;
  const rotation = sticker.rotation || 0;
  
  const corners = {
    topLeft: { x: sticker.x, y: sticker.y },
    topRight: { x: sticker.x + sticker.width, y: sticker.y },
    bottomRight: { x: sticker.x + sticker.width, y: sticker.y + sticker.height },
    bottomLeft: { x: sticker.x, y: sticker.y + sticker.height }
  };
  
  // Rotate corners if sticker is rotated
  if (rotation) {
    Object.keys(corners).forEach(key => {
      const rotated = rotatePoint(corners[key].x, corners[key].y, centerX, centerY, rotation);
      corners[key] = rotated;
    });
  }
  
  // Add rotation handle (above top center)
  const topCenter = {
    x: (corners.topLeft.x + corners.topRight.x) / 2,
    y: (corners.topLeft.y + corners.topRight.y) / 2 - 25
  };
  
  return {
    resizeTopLeft: corners.topLeft,
    resizeTopRight: corners.topRight,
    resizeBottomLeft: corners.bottomLeft,
    resizeBottomRight: corners.bottomRight,
    rotate: topCenter
  };
}

// rotate point around center
function rotatePoint(x, y, centerX, centerY, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const dx = x - centerX;
  const dy = y - centerY;
  return {
    x: centerX + dx * cos - dy * sin,
    y: centerY + dx * sin + dy * cos
  };
}

// add sticker
function addSticker(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    const sticker = {
      img,
      x: WIDTH / 2 - img.width / 5,
      y: HEIGHT / 2 - img.height / 5,
      width: img.width / 2,
      height: img.height / 2,
      rotation: 0,
      dragging: false
    };
    stickers.push(sticker);
    selectedSticker = sticker; // Auto-select new sticker
    drawCanvas();
    
    // Set cursor to move since we auto-select the new sticker
    canvas.style.cursor = 'move';
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
  
  // Check if clicking on a handle first
  if (selectedSticker) {
    const handles = getStickerHandles(selectedSticker);
    
    // Check all resize handles
    for (const [handleType, handle] of Object.entries(handles)) {
      if (handleType.startsWith('resize') && 
          Math.abs(mouseX - handle.x) <= HANDLE_SIZE && 
          Math.abs(mouseY - handle.y) <= HANDLE_SIZE) {
        isResizing = true;
        selectedSticker.resizeHandle = handleType; // Store which handle is being used
        canvas.style.cursor = 'grabbing';
        e.preventDefault();
        return;
      }
    }
    
    // Check rotate handle
    const rotateHandle = handles.rotate;
    if (Math.abs(mouseX - rotateHandle.x) <= HANDLE_SIZE && Math.abs(mouseY - rotateHandle.y) <= HANDLE_SIZE) {
      isRotating = true;
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
      return;
    }
  }
  
  // Check if clicking on a sticker
  for (let i = stickers.length - 1; i >= 0; i--) {
    const s = stickers[i];
    if (isPointInSticker(mouseX, mouseY, s)) {
      selectedSticker = s;
      s.dragging = true;
      canvas.style.cursor = 'grabbing'; // Set cursor for active drag
      dragOffset.x = mouseX - (s.x + s.width / 2);
      dragOffset.y = mouseY - (s.y + s.height / 2);
      stickers.splice(i, 1);
      stickers.push(s);
      drawCanvas();
      e.preventDefault();
      break;
    }
  }
  
  // If not clicking on any sticker, deselect
  if (!selectedSticker || !selectedSticker.dragging) {
    selectedSticker = null;
    canvas.style.cursor = 'default'; // Reset cursor
    drawCanvas();
  }
}

// check if point is inside sticker (considering rotation)
function isPointInSticker(x, y, sticker) {
  const centerX = sticker.x + sticker.width / 2;
  const centerY = sticker.y + sticker.height / 2;
  
  if (sticker.rotation) {
    // Rotate point back to check against unrotated rectangle
    const rotated = rotatePoint(x, y, centerX, centerY, -sticker.rotation);
    x = rotated.x;
    y = rotated.y;
  }
  
  return x >= sticker.x && x <= sticker.x + sticker.width && 
         y >= sticker.y && y <= sticker.y + sticker.height;
}

// cursor management
function updateCursor(mouseX, mouseY) {
  // Default cursor
  let cursor = 'default';
  
  if (isResizing) {
    cursor = 'grabbing'; // During resize operation
  } else if (isRotating) {
    cursor = 'grab'; // During rotation (could use 'grabbing' for active rotation)
  } else if (selectedSticker) {
    const handles = getStickerHandles(selectedSticker);
    
    // Check if hovering over any resize handle
    let foundHandle = false;
    for (const [handleType, handle] of Object.entries(handles)) {
      if (handleType.startsWith('resize') && 
          Math.abs(mouseX - handle.x) <= HANDLE_SIZE && 
          Math.abs(mouseY - handle.y) <= HANDLE_SIZE) {
        foundHandle = true;
        // Set cursor based on corner position
        switch (handleType) {
          case 'resizeTopLeft':
            cursor = 'nw-resize';
            break;
          case 'resizeTopRight':
            cursor = 'ne-resize';
            break;
          case 'resizeBottomLeft':
            cursor = 'sw-resize';
            break;
          case 'resizeBottomRight':
            cursor = 'se-resize';
            break;
        }
        break;
      }
    }
    
    // Check if hovering over rotate handle (only if not already on resize handle)
    if (!foundHandle && Math.abs(mouseX - handles.rotate.x) <= HANDLE_SIZE && Math.abs(mouseY - handles.rotate.y) <= HANDLE_SIZE) {
      cursor = 'grab'; // Rotation cursor
    }
    // Check if hovering over sticker body (only if not on any handle)
    else if (!foundHandle && isPointInSticker(mouseX, mouseY, selectedSticker)) {
      cursor = 'move'; // Move cursor when hovering over sticker
    }
  } else {
    // Check if hovering over any sticker when none is selected
    for (let i = stickers.length - 1; i >= 0; i--) {
      if (isPointInSticker(mouseX, mouseY, stickers[i])) {
        cursor = 'pointer'; // Indicate sticker is clickable
        break;
      }
    }
  }
  
  canvas.style.cursor = cursor;
}

function pointerMove(e) {
  const { x: mouseX, y: mouseY } = getPointerPos(e);
  
  if (isResizing && selectedSticker) {
    // Update cursor to grabbing during active resize
    canvas.style.cursor = 'grabbing';
    
    // Resize sticker based on which handle is being used
    const resizeHandle = selectedSticker.resizeHandle;
    const originalAspectRatio = selectedSticker.img.width / selectedSticker.img.height;
    
    let newWidth, newHeight, newX, newY;
    
    switch (resizeHandle) {
      case 'resizeTopLeft':
        newWidth = selectedSticker.x + selectedSticker.width - mouseX;
        newHeight = selectedSticker.y + selectedSticker.height - mouseY;
        newX = mouseX;
        newY = mouseY;
        break;
      case 'resizeTopRight':
        newWidth = mouseX - selectedSticker.x;
        newHeight = selectedSticker.y + selectedSticker.height - mouseY;
        newX = selectedSticker.x;
        newY = mouseY;
        break;
      case 'resizeBottomLeft':
        newWidth = selectedSticker.x + selectedSticker.width - mouseX;
        newHeight = mouseY - selectedSticker.y;
        newX = mouseX;
        newY = selectedSticker.y;
        break;
      case 'resizeBottomRight':
      default:
        newWidth = mouseX - selectedSticker.x;
        newHeight = mouseY - selectedSticker.y;
        newX = selectedSticker.x;
        newY = selectedSticker.y;
        break;
    }
    
    // Maintain aspect ratio
    if (newWidth / newHeight > originalAspectRatio) {
      newWidth = newHeight * originalAspectRatio;
    } else {
      newHeight = newWidth / originalAspectRatio;
    }
    
    // Minimum size constraints
    newWidth = Math.max(Math.abs(newWidth), 30);
    newHeight = Math.max(Math.abs(newHeight), 30);
    
    // Adjust position based on resize direction
    switch (resizeHandle) {
      case 'resizeTopLeft':
        selectedSticker.x = selectedSticker.x + selectedSticker.width - newWidth;
        selectedSticker.y = selectedSticker.y + selectedSticker.height - newHeight;
        break;
      case 'resizeTopRight':
        selectedSticker.y = selectedSticker.y + selectedSticker.height - newHeight;
        break;
      case 'resizeBottomLeft':
        selectedSticker.x = selectedSticker.x + selectedSticker.width - newWidth;
        break;
      case 'resizeBottomRight':
      default:
        // Position stays the same for bottom-right resize
        break;
    }
    
    selectedSticker.width = newWidth;
    selectedSticker.height = newHeight;
    
    drawCanvas();
    e.preventDefault();
  } else if (isRotating && selectedSticker) {
    // Update cursor to indicate active rotation
    canvas.style.cursor = 'grabbing';
    
    // Rotate sticker
    const centerX = selectedSticker.x + selectedSticker.width / 2;
    const centerY = selectedSticker.y + selectedSticker.height / 2;
    const angle = Math.atan2(mouseY - centerY, mouseX - centerX);
    selectedSticker.rotation = angle + Math.PI / 2; // Adjust for handle position
    
    drawCanvas();
    e.preventDefault();
  } else if (selectedSticker?.dragging) {
    // Update cursor to grabbing during active drag
    canvas.style.cursor = 'grabbing';
    
    // Move sticker
    selectedSticker.x = mouseX - dragOffset.x - selectedSticker.width / 2;
    selectedSticker.y = mouseY - dragOffset.y - selectedSticker.height / 2;
    drawCanvas();
    e.preventDefault();
  } else {
    // Update cursor based on what's under the mouse when not dragging
    updateCursor(mouseX, mouseY);
  }
}

function pointerUp() { 
  if (selectedSticker) {
    selectedSticker.dragging = false;
    selectedSticker.resizeHandle = null; // Clear resize handle reference
  }
  isResizing = false;
  isRotating = false;
  
  // Reset cursor to default, then let pointerMove update it on next mouse move
  canvas.style.cursor = 'default';
  
  drawCanvas(); // Redraw to show/hide handles
}

// mouse events
canvas.addEventListener('mousedown', pointerDown);
canvas.addEventListener('mousemove', pointerMove);
canvas.addEventListener('mouseup', pointerUp);
canvas.addEventListener('mouseleave', () => {
  pointerUp(); // Reset states
  canvas.style.cursor = 'default'; // Reset cursor when leaving canvas
});

// touch events
canvas.addEventListener('touchstart', pointerDown);
canvas.addEventListener('touchmove', pointerMove);
canvas.addEventListener('touchend', pointerUp);
canvas.addEventListener('touchcancel', pointerUp);

// stickers
addFishBtn.addEventListener('click', () => addSticker('Assets/photobooth/camerapage/stickers/star.png'));
addOctopusBtn.addEventListener('click', () => addSticker('Assets/photobooth/camerapage/stickers/heart.png'));


addSeaweedBtn.addEventListener('click', () => { addSticker('Assets/photobooth/camerapage/stickers/console.png'); });
addAxBtn.addEventListener('click', () => addSticker('Assets/photobooth/camerapage/stickers/arrows.png'));
addBubbleBtn.addEventListener('click', () => { addSticker('Assets/photobooth/camerapage/stickers/dinosaur.png'); });

// reset
resetBtn.addEventListener('click', () => { 
  stickers = []; 
  selectedSticker = null;
  drawCanvas(); 
});

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
      title: '2026 Spring Activities Fair CS Club Photobooth',
      text: 'Nice to see you at the 2026 Spring Activities Fair!',
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
          title: '2026 Spring Activities Fair CS Club Photobooth',
          text: 'Nice to see you at the 2026 Spring Activities Fair!',
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
      message:`Hey! 👋
      
      Here is the awesome photo from the CS Club photobooth at the Spring Activities Fair! 
      
      🖥️ Interested in coding, web development, or tech projects? Come check out our Computer Science Club! We're always working on exciting stuff and would love to have you join us!
      
      Hope you love the photo! 🎉`,
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
  frameImage.src = `Assets/photobooth/camerapage/frame/frame ${currentFrame}.png`;
  frameImage.onload = () => drawCanvas(); // Redraw canvas when frame loads
  
  // Also update HTML overlay (keep it hidden but functional for consistency)
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
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      // Delete selected sticker
      if (selectedSticker) {
        e.preventDefault();
        const index = stickers.indexOf(selectedSticker);
        if (index > -1) {
          stickers.splice(index, 1);
          selectedSticker = null;
          drawCanvas();
        }
      }
    } else if (e.key === 'Escape') {
      // Deselect sticker
      selectedSticker = null;
      drawCanvas();
    } else if (selectedSticker && !e.ctrlKey && !e.metaKey) {
      // Rotate selected sticker with R key
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        selectedSticker.rotation = (selectedSticker.rotation || 0) + Math.PI / 8; // 22.5 degrees
        drawCanvas();
      }
      // Scale selected sticker with + and - keys
      else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        const scale = 1.1;
        const centerX = selectedSticker.x + selectedSticker.width / 2;
        const centerY = selectedSticker.y + selectedSticker.height / 2;
        selectedSticker.width *= scale;
        selectedSticker.height *= scale;
        selectedSticker.x = centerX - selectedSticker.width / 2;
        selectedSticker.y = centerY - selectedSticker.height / 2;
        drawCanvas();
      }
      else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        const scale = 0.9;
        const centerX = selectedSticker.x + selectedSticker.width / 2;
        const centerY = selectedSticker.y + selectedSticker.height / 2;
        selectedSticker.width = Math.max(selectedSticker.width * scale, 20);
        selectedSticker.height = Math.max(selectedSticker.height * scale, 20);
        selectedSticker.x = centerX - selectedSticker.width / 2;
        selectedSticker.y = centerY - selectedSticker.height / 2;
        drawCanvas();
      }
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
  
  // Ensure the frame overlay is updated with the correct frame on page load
  console.log('📄 DOM loaded - ensuring frame overlay matches current frame');
  if (frameOverlay) {
    frameOverlay.src = `Assets/photobooth/camerapage/frame/frame ${currentFrame}.png`;
    console.log(`🖼️ Set frame overlay to frame ${currentFrame}`);
  }
});

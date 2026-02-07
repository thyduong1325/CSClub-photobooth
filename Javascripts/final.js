// constants
const WIDTH = 1176, HEIGHT = 1470;

// dom elements
const canvas = document.getElementById('finalCanvas'),
      ctx = canvas.getContext('2d'),
      addFishBtn = document.getElementById('addFish'),
      addOctopusBtn = document.getElementById('addOctopus'),
      addSeaweedBtn = document.getElementById('addSeaweed'),
      addAxBtn = document.getElementById('addAx'),
      addBubbleBtn = document.getElementById('addBubble'),
      shareBtn = document.getElementById('shareBtn'),
      homeBtn = document.getElementById('homeBtn'),
      resetBtn = document.getElementById('reset'),
      emailModal = document.getElementById('emailModal'),
      emailInput = document.getElementById('emailInput'),
      sendEmailBtn = document.getElementById('sendEmailBtn'),
      cancelBtn = document.getElementById('cancelBtn'),
      closeBtn = document.querySelector('.close');

// sticker state
let stickers = [], dragOffset = { x: 0, y: 0 }, selectedSticker = null;

// load photo
const finalImage = new Image(), dataURL = localStorage.getItem('photoStrip');
if (dataURL) {
  finalImage.src = dataURL;
  finalImage.onload = drawCanvas;
  localStorage.removeItem('photoStrip');
} else alert("No photo found!");

// draw canvas
function drawCanvas() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.drawImage(finalImage, 0, 0, WIDTH, HEIGHT);
  stickers.forEach(s => ctx.drawImage(s.img, s.x, s.y, s.width, s.height));
}

// add sticker
function addSticker(src) {
  const img = new Image();
  img.src = src;
  img.onload = () => {
    stickers.push({
      img,
      x: WIDTH / 2 - img.width / 6,
      y: HEIGHT / 2 - img.height / 6,
      width: img.width / 2.5,
      height: img.height / 2.5,
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

const seaweedImages = ['Assets/fish-photobooth/camerapage/stickers/seaweed1.png','Assets/fish-photobooth/camerapage/stickers/seaweed2.png'], 
      bubbleImages = ['Assets/fish-photobooth/camerapage/stickers/bubble1.png','Assets/fish-photobooth/camerapage/stickers/bubble2.png'];
let seaweedIndex = 0, bubbleIndex = 0;

addSeaweedBtn.addEventListener('click', () => { addSticker(seaweedImages[seaweedIndex]); seaweedIndex = (seaweedIndex + 1) % seaweedImages.length; });
addAxBtn.addEventListener('click', () => addSticker('Assets/fish-photobooth/camerapage/stickers/axolotl.png'));
addBubbleBtn.addEventListener('click', () => { addSticker(bubbleImages[bubbleIndex]); bubbleIndex = (bubbleIndex + 1) % bubbleImages.length; });

// reset
resetBtn.addEventListener('click', () => { stickers = []; drawCanvas(); });

// share
shareBtn.addEventListener('click', () => {
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
  if (!email) {
    alert('Please enter a valid email address.');
    return;
  }

  // Show loading state
  const originalText = sendEmailBtn.textContent;
  sendEmailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  sendEmailBtn.disabled = true;

  try {
    // Convert canvas to base64 image data
    const imageData = canvas.toDataURL('image/png');

    // Prepare email data
    const emailData = {
      to_email: email,
      from_name: 'CS Club Photobooth',
      subject: '2026 Spring Activities Fair with Computer Science Club',
      message: `Hi there!\n\nSomeone wanted to share their awesome photo from the Computer Science Club photobooth at the 2026 Spring Activities Fair!\n\nCheck out the attached image - it was created using our interactive underwater-themed photobooth where visitors could add fun stickers like fish, octopus, seaweed, and bubbles! 🐠🐙🌊\n\nInterested in Computer Science? Come visit our club booth or reach out to learn more about programming, web development, and all the exciting projects we work on!\n\nHope you enjoy the photo! 🎉\n\nBest regards,\nComputer Science Club`,
      image_data: imageData
    };

    // Send email using EmailJS (using your new template)
    await emailjs.send(
      'service_nt7h0ek',    // Your EmailJS service ID
      'template_evikrle',   // Your new EmailJS template ID
      emailData
    );

    alert('Photo sent successfully! 🎉\n\nThe recipient will receive your photobooth picture with a nice message from the CS Club!');
    // Close modal
    emailModal.style.display = 'none';
    emailInput.value = '';

  } catch (error) {
    console.error('Error sending email:', error);
    
    // More helpful error messages for users
    let userMessage = 'Sorry, there was an error sending the email.';
    
    if (error.status === 422) {
      userMessage = 'Please check the email address and try again.';
    } else if (error.status === 400) {
      userMessage = 'Email service error. Please try again in a moment.';
    }
    
    alert(userMessage + '\n\nPlease try again or contact the CS Club for assistance.');
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

// home
homeBtn.addEventListener('click', () => window.location.href = 'index.html');

// logo
document.addEventListener('DOMContentLoaded', () => {
  const logo = document.querySelector('.logo');
  if (logo) logo.addEventListener('click', () => window.location.href = 'index.html');
});

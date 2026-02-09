// dom references
const selectButton = document.getElementById('select-button');
const cameraBtn = document.getElementById('menu-camera-button');
const uploadBtn = document.getElementById('menu-upload-button');
const logoEl = document.querySelector('.logo');

// set static photobooth image
const photoboothMock = document.querySelector('.photobooth-mock');
if (photoboothMock) {
  photoboothMock.style.backgroundImage = "url('Assets/fish-photobooth/homepage/photobooth_home.png')";
}


// fish animations
const fishes = [
  { el: document.querySelector('.fish-mock-1'), rotation: 7.52, dir: -1 },
  { el: document.querySelector('.fish-mock-2'), rotation: 7.52, dir: 1 },
  { el: document.querySelector('.fish-mock-3'), rotation: 7.52, dir: -1 },
];

let fishAnimating = false;
let fishTimeouts = [];

function animateFish(index) {
  if (!fishAnimating) return;
  const fish = fishes[index];
  if (!fish.el) return;

  fish.el.style.transform = `rotate(${fish.rotation * fish.dir}deg)`;
  fish.dir *= -1;

  fishTimeouts[index] = setTimeout(() => {
    requestAnimationFrame(() => animateFish(index));
  }, 200);
}

function startFishAnimation() {
  if (fishAnimating) return;
  fishAnimating = true;
  fishes.forEach((_, i) => animateFish(i));
}

function stopFishAnimation() {
  fishAnimating = false;
  fishTimeouts.forEach(clearTimeout);
  fishes.forEach(f => {
    if (f.el) f.el.style.transform = 'rotate(0deg)';
  });
}


// button interactions + adding safe navigation
function addSafeNavigation(button, url, id) {
  if (!button) return;

  button.addEventListener('click', e => {
    if (typeof gtag === 'function') {
      gtag('event', 'button_click', {
        button_id: id || button.id || 'no-id',
        button_text: button.innerText || 'no-text',
      });
      console.log('GA event sent:', id || button.id);
    }

    e.preventDefault();
    setTimeout(() => (window.location.href = url), 100);
  });
}

// animation for select button
if (selectButton) {
  ['mouseenter', 'mousedown'].forEach(evt =>
    selectButton.addEventListener(evt, () => {
      startFishAnimation();
    })
  );

  ['mouseleave', 'mouseup'].forEach(evt =>
    selectButton.addEventListener(evt, () => {
      stopFishAnimation();
    })
  );
}

// add more safe nav
addSafeNavigation(selectButton, 'menu.html');
addSafeNavigation(cameraBtn, 'camera.html');
addSafeNavigation(uploadBtn, 'upload.html');
addSafeNavigation(logoEl, 'index.html', 'logo');

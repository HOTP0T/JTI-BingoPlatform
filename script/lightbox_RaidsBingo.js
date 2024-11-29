document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxNotes = document.getElementById('lightbox-notes');
  const lightboxText = document.getElementById('lightbox-text-content');  // Added lightbox-text element
  const lightboxUrl = document.getElementById('lightbox-url'); // Added lightbox-url element
  const closeBtn = document.getElementById('close-button');
  const leftArrow = document.getElementById('prev-button');
  const rightArrow = document.getElementById('next-button');
  let currentIndex = -1;
  window.tiles = [];

  // Hide the lightbox initially
  lightbox.style.display = 'none';

  window.openLightbox = function (index, note) {
    currentIndex = index;
    const tile = window.tiles[currentIndex];
    lightboxImg.src = tile.img_path;
    lightboxTitle.textContent = tile.tile;
    lightboxNotes.value = note || '';

    const lightboxText = document.getElementById('lightbox-text');
    lightboxText.innerHTML = ''; // Clear any existing content

    // Add the JSON text under the title
    const descriptionText = document.createElement('p');
    descriptionText.textContent = tile.text;
    descriptionText.classList.add('lightbox-description');
    lightboxText.appendChild(descriptionText);

    // Add player and links
    if (tile.urls && tile.urls.length > 0) {
        tile.urls.forEach(link => {
            const buttonElement = document.createElement('button');
            buttonElement.textContent = link.label;
            buttonElement.title = link.url;
            buttonElement.onclick = () => {
                const newWindow = window.open(link.url, '_blank');
                if (newWindow) newWindow.opener = null;
            };
            buttonElement.classList.add('lightbox-link-button');
            lightboxText.appendChild(buttonElement);
            lightboxText.appendChild(document.createElement('br'));
        });
    }

    lightbox.style.display = 'flex';
    closeBtn.focus();
};

  lightboxNotes.addEventListener('input', () => {
    const tileName = window.tiles[currentIndex].tile;
    const tileElement = document.querySelector(`.bingo-tile[data-tile-name="${tileName}"]`);
    const noteTextbox = tileElement.querySelector('.note-textbox');
    noteTextbox.value = lightboxNotes.value;
    saveState(); // Ensure state is saved whenever lightbox notes change
  });

  function closeLightbox() {
    lightbox.style.display = 'none';
  }

  function showNext() {
    if (currentIndex < window.tiles.length - 1) {
      currentIndex++;
      const tile = window.tiles[currentIndex];
      const tileElement = document.querySelector(`.bingo-tile[data-tile-name="${tile.tile}"]`);
      const note = tileElement.querySelector('.note-textbox').value;
      window.openLightbox(currentIndex, note);
    }
  }

  function showPrevious() {
    if (currentIndex > 0) {
      currentIndex--;
      const tile = window.tiles[currentIndex];
      const tileElement = document.querySelector(`.bingo-tile[data-tile-name="${tile.tile}"]`);
      const note = tileElement.querySelector('.note-textbox').value;
      window.openLightbox(currentIndex, note);
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (leftArrow) leftArrow.addEventListener('click', showPrevious);
  if (rightArrow) rightArrow.addEventListener('click', showNext);

  // Keyboard accessibility for lightbox
  document.addEventListener('keydown', (event) => {
    if (lightbox.style.display === 'flex') {
      switch (event.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowLeft':
          showPrevious();
          break;
        case 'ArrowRight':
          showNext();
          break;
      }
    }
  });

  // Close lightbox when clicking outside of it
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  // Fetch data and initialize tiles
  fetch('../../Data/RaidsBingo_12_2024.json')
    .then(response => response.json())
    .then(data => {
      window.tiles = data.BingoTiles;
    })
    .catch(error => console.error('Error fetching the JSON data:', error));
});
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

    // Replace text with buttons
    const lightboxText = document.getElementById('lightbox-text');
    lightboxText.innerHTML = ''; // Clear any existing content

    if (tile.urls && tile.urls.length > 0) {
        tile.urls.forEach(link => {
            const buttonElement = document.createElement('button');
            buttonElement.textContent = link.label;
            buttonElement.onclick = () => window.open(link.url, '_blank'); // Open link in new tab
            buttonElement.classList.add('lightbox-link-button');
            lightboxText.appendChild(buttonElement);

            // Optional: add a line break between buttons for better spacing
            lightboxText.appendChild(document.createElement('br'));
        });
    }

    lightbox.style.display = 'flex';
    closeBtn.focus();
}

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

  // Fetch data and initialize tiles
  fetch('../Data/updated_bingo.json')
    .then(response => response.json())
    .then(data => {
      window.tiles = data.BingoTiles;
    })
    .catch(error => console.error('Error fetching the JSON data:', error));
});
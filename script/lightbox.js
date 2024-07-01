document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxNotes = document.getElementById('lightbox-notes');
  const closeBtn = document.getElementById('close-button');
  const leftArrow = document.getElementById('prev-button');
  const rightArrow = document.getElementById('next-button');
  let currentIndex = -1;
  window.tiles = [];

  window.openLightbox = function(index) {
    currentIndex = index;
    const tile = window.tiles[currentIndex];
    lightboxImg.src = tile.img_path;
    lightboxTitle.textContent = tile.tile;
    lightboxNotes.textContent = tile.text;
    lightbox.style.display = 'flex'; // Changed to 'flex' to match the CSS
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
  }

  function showNext() {
    if (currentIndex < window.tiles.length - 1) {
      window.openLightbox(currentIndex + 1);
    }
  }

  function showPrevious() {
    if (currentIndex > 0) {
      window.openLightbox(currentIndex - 1);
    }
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (leftArrow) leftArrow.addEventListener('click', showPrevious);
  if (rightArrow) rightArrow.addEventListener('click', showNext);

  // Fetch data and initialize tiles
  fetch('Data/bingo.json')
    .then(response => response.json())
    .then(data => {
      window.tiles = data.BingoTiles;
    })
    .catch(error => console.error('Error fetching the JSON data:', error));
});
document.addEventListener("DOMContentLoaded", () => {
  const bingoCard = document.getElementById('bingoCard');
  const completedCount = document.getElementById('completedCount');
  const uncompletedCount = document.getElementById('uncompletedCount');
  const resetAllButton = document.getElementById('resetAllButton');
  const confirmResetButton = document.getElementById('confirmResetButton');
  const cancelResetButton = document.getElementById('cancelResetButton');
  const resetConfirmModal = document.getElementById('resetConfirmModal');
  const burgerMenu = document.querySelector('.burger-menu');
  const navMenu = document.querySelector('.nav-menu');
  const savedState = JSON.parse(localStorage.getItem('bingoState')) || {};

  // New code integration
  const menuLinks = document.querySelectorAll('.nav-menu a');
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);

  burgerMenu.addEventListener('click', () => {
    navMenu.style.display = navMenu.style.display === 'block' ? 'none' : 'block';
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
  
      const target = link.getAttribute('data-target');
  
      // Skip if the link doesn't have a data-target attribute (like the Home link)
      if (!target) {
        window.location.href = link.getAttribute('href'); // Navigate to the link's href if no data-target is present
        return;
      }
  
      const targetPopup = document.getElementById(target);
  
      if (targetPopup) {
        document.querySelectorAll('.popup-sidebar').forEach(popup => {
          popup.classList.remove('active');
        });
        targetPopup.classList.add('active');
        overlay.classList.add('active');
      } else {
        console.error(`Popup with target '${target}' not found. Check the data-target attribute.`);
      }
    });
  });

  overlay.addEventListener('click', () => {
    document.querySelectorAll('.popup-sidebar').forEach(popup => {
      popup.classList.remove('active');
    });
    overlay.classList.remove('active');
    navMenu.style.display = 'none'; // Hide the menu when overlay is clicked
    window.closeLightbox(); // Close any open lightbox
  });

  // Add escape key listener to close lightbox and overlay
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      window.closeLightbox();
      overlay.classList.remove('active');
    }
  });

  fetch('../Data/updated_bingo.json')
    .then(response => response.json())
    .then(data => {
      const tiles = data.BingoTiles;
      tiles.forEach(tile => {
        const tileElement = createTileElement(tile, savedState[tile.tile]);
        bingoCard.appendChild(tileElement);
      });
      updateScoreboard();
      adjustTileSizes();
      // adjustBingoCardHeight();
    })
    .catch(error => console.error('Error fetching the JSON data:', error));

  resetAllButton.addEventListener('click', () => {
    resetConfirmModal.style.display = 'block';
  });

  confirmResetButton.addEventListener('click', () => {
    resetAll();
    resetConfirmModal.style.display = 'none';
  });

  cancelResetButton.addEventListener('click', () => {
    resetConfirmModal.style.display = 'none';
  });

  // Adjust tile sizes on window resize
  window.addEventListener('resize', () => {
    adjustTileSizes();
    // adjustBingoCardHeight();
  });

  // Initial call to adjust tile sizes
  adjustTileSizes();
  // adjustBingoCardHeight();
});

function createTileElement(tile, savedTileState) {
  const tileElement = document.createElement('div');
  tileElement.className = 'bingo-tile';
  tileElement.dataset.tileName = tile.tile;
  tileElement.tabIndex = 0; // Make the tile focusable

  const frontSide = document.createElement('div');
  frontSide.className = 'front-side';

  const backSide = document.createElement('div');
  backSide.className = 'back-side';

  const img = document.createElement('img');
  img.src = tile.img_path;
  img.alt = tile.tile;

  const title = document.createElement('p');
  title.textContent = tile.tile;

  const buttons = document.createElement('div');
  buttons.className = 'buttons';

  const noteButton = createButton('Notes', 'note-button', () => toggleNoteTextbox(tileElement));
  const colorButton = createButton('Color', 'color-button', () => showColorOptions(tileElement));
  const completedButton = createButton(savedTileState && savedTileState.completed ? 'Mark as Incomplete' : 'Mark as Complete', 'completed-button', () => toggleCompletion(tileElement, tile.tile));

  buttons.append(noteButton, colorButton, completedButton);
  frontSide.append(img, title);
  tileElement.append(frontSide, backSide, buttons);

  const noteTextbox = document.createElement('textarea');
  noteTextbox.className = 'note-textbox';
  noteTextbox.dataset.tileName = tile.tile;
  noteTextbox.value = savedTileState?.note || '';
  noteTextbox.style.display = 'none'; // Initially hidden
  noteTextbox.addEventListener('input', () => {
    adjustFontSize(noteTextbox);
    saveState();
  });
  noteTextbox.addEventListener('click', (event) => {
    event.stopPropagation(); // Prevent the tile from flipping back when clicking on the text area
  });
  backSide.appendChild(noteTextbox);

  tileElement.addEventListener('click', (event) => {
    if (!tileElement.classList.contains('completed') && !event.target.closest('.buttons')) {
      const note = noteTextbox.value;
      const lightboxIndex = window.tiles.findIndex(t => t.tile === tile.tile);
      window.openLightbox(lightboxIndex, note);

      overlay.classList.add('active'); // Make overlay visible when the lightbox is open
    }
  });

  tileElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !tileElement.classList.contains('completed')) {
      const note = noteTextbox.value;
      window.openLightbox(window.tiles.findIndex(t => t.tile === tile.tile), note);
    }
  });

  if (savedTileState) {
    if (savedTileState.completed) {
      setTileCompletion(tileElement, true, false);
    }
    if (savedTileState.color) {
      tileElement.style.backgroundColor = savedTileState.color;
    }
  }

  return tileElement;
}

function createButton(text, className, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = className;
  button.tabIndex = 0; // Make the button focusable
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.stopPropagation();
      onClick();
    }
  });
  return button;
}

function toggleNoteTextbox(tileElement) {
  const noteTextbox = tileElement.querySelector('.note-textbox');
  tileElement.classList.toggle('flipped');
  if (tileElement.classList.contains('flipped')) {
    noteTextbox.style.display = 'block';
    noteTextbox.focus();
  } else {
    noteTextbox.style.display = 'none';
  }
  noteTextbox.addEventListener('input', saveState); // Add this line to update state on input
}

function adjustFontSize(noteTextbox) {
  const maxFontSize = 16;
  const minFontSize = 8;
  const textLength = noteTextbox.value.length;
  const newFontSize = Math.max(minFontSize, maxFontSize - Math.floor(textLength / 10));
  noteTextbox.style.fontSize = `${newFontSize}px`;
}

function showColorOptions(tileElement) {
  const colorPicker = document.createElement('input');
  colorPicker.type = 'color';
  colorPicker.value = window.getComputedStyle(tileElement).backgroundColor;

  colorPicker.addEventListener('input', () => {
    tileElement.style.backgroundColor = colorPicker.value;
    saveState();
  });

  colorPicker.click(); // Trigger the color picker UI
}

function toggleCompletion(tileElement, tileName) {
  const isCompleted = !tileElement.classList.contains('completed');
  setTileCompletion(tileElement, isCompleted);
  saveState();
  updateScoreboard();
}

function setTileCompletion(tileElement, isCompleted, updateButton = true) {
  tileElement.classList.toggle('completed', isCompleted);
  tileElement.classList.remove('flipped');

  const completedButton = tileElement.querySelector('.completed-button');
  const noteButton = tileElement.querySelector('.note-button');
  const colorButton = tileElement.querySelector('.color-button');
  const title = tileElement.querySelector('p');

  if (isCompleted) {
    tileElement.style.backgroundColor = 'green';
    title.style.color = '#00FE00';
    if (updateButton) completedButton.textContent = 'Mark as Incomplete';
    tileElement.style.pointerEvents = 'none';
    completedButton.style.pointerEvents = 'auto';
    noteButton.style.display = 'none';
    colorButton.style.display = 'none';
  } else {
    if (updateButton) completedButton.textContent = 'Mark as Complete';
    tileElement.style.pointerEvents = 'auto';
    tileElement.style.backgroundColor = '';
    title.style.color = 'white';
    noteButton.style.display = 'inline-block';
    colorButton.style.display = 'inline-block';
  }
}

function saveState() {
  const tiles = document.querySelectorAll('.bingo-tile');
  const state = {};
  tiles.forEach(tile => {
    const tileName = tile.dataset.tileName;
    const noteTextbox = tile.querySelector('.note-textbox');
    state[tileName] = {
      completed: tile.classList.contains('completed'),
      color: tile.style.backgroundColor,
      note: noteTextbox?.value || ''
    };
  });
  localStorage.setItem('bingoState', JSON.stringify(state));
}

function updateScoreboard() {
  const tiles = document.querySelectorAll('.bingo-tile');
  let completedCountValue = 0;
  let uncompletedCountValue = 0;

  tiles.forEach(tile => {
    if (tile.classList.contains('completed')) {
      completedCountValue++;
    } else {
      uncompletedCountValue++;
    }
  });

  completedCount.textContent = completedCountValue;
  uncompletedCount.textContent = uncompletedCountValue;
}

function resetAll() {
  localStorage.removeItem('bingoState');
  document.querySelectorAll('.bingo-tile').forEach(tile => {
    tile.classList.remove('completed', 'flipped');
    tile.style.backgroundColor = '';
    const noteTextbox = document.querySelector(`.note-textbox[data-tile-name="${tile.dataset.tileName}"]`);
    if (noteTextbox) {
      noteTextbox.value = '';
      noteTextbox.style.display = 'none';
    }
    const completedButton = tile.querySelector('.completed-button');
    if (completedButton) completedButton.textContent = 'Mark as Complete';
    tile.querySelectorAll('.note-button, .color-button').forEach(button => button.style.display = 'inline-block');
    const title = tile.querySelector('p');
    if (title) title.style.color = 'white'; // Reset the title color
    tile.style.pointerEvents = 'auto';
  });
  updateScoreboard();
}

function adjustTileSizes() {
  const tiles = document.querySelectorAll('.bingo-tile');
  tiles.forEach(tile => {
    const tileWidth = tile.offsetWidth;
    tile.style.height = `${tileWidth}px`; // Make the height equal to the width for a square tile
  });
}

// Ensure you have this function to close the lightbox properly
window.closeLightbox = function() {
  const activePopup = document.querySelector('.popup-sidebar.active');
  if (activePopup) {
    activePopup.classList.remove('active');
  }
  overlay.classList.remove('active');
};

const teamScores = {
  team1: 0,
  team2: 0,
  team3: 0,
  team4: 0
};

// Function to update the scoreboard
function updateTeamScores() {
  document.getElementById('team1Score').textContent = teamScores.team1;
  document.getElementById('team2Score').textContent = teamScores.team2;
  document.getElementById('team3Score').textContent = teamScores.team3;
  document.getElementById('team4Score').textContent = teamScores.team4;
}

// Example of setting team scores programmatically
function setTeamScores(newScores) {
  teamScores.team1 = newScores.team1 || 0;
  teamScores.team2 = newScores.team2 || 0;
  teamScores.team3 = newScores.team3 || 0;
  teamScores.team4 = newScores.team4 || 0;
  updateTeamScores();
}

// Initial call to set the scores
setTeamScores({ team1: 0, team2: 0, team3: 0, team4: 0 });
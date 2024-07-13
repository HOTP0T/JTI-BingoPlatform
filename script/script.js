import './auth.js';
import './team.js';
import './bingo.js';
import './chat.js';
import { supabase } from './supabase.js';


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
      const targetPopup = document.getElementById(link.getAttribute('data-target'));
      document.querySelectorAll('.popup-sidebar').forEach(popup => {
        popup.classList.remove('active');
      });
      targetPopup.classList.add('active');
      overlay.classList.add('active');
    });
  });

  overlay.addEventListener('click', () => {
    document.querySelectorAll('.popup-sidebar').forEach(popup => {
      popup.classList.remove('active');
    });
    overlay.classList.remove('active');
    navMenu.style.display = 'none'; // Hide the menu when overlay is clicked
  });

  fetch('Data/updated_bingo.json')
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
      window.openLightbox(window.tiles.findIndex(t => t.tile === tile.tile), note);
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
    event.stopPropagation();q
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
  const colorOptions = ['red', '#3a3a3a', 'green', 'purple']; // Use the initial grey color #3a3a3a
  const currentColor = window.getComputedStyle(tileElement).backgroundColor; // Get the computed style for accurate color

  const colorsMap = {
    'rgb(255, 0, 0)': 'red', // Red
    'rgb(58, 58, 58)': '#3a3a3a', // Grey
    'rgb(0, 128, 0)': 'green', // Green
    'rgb(128, 0, 128)': 'purple' // Purple
  };

  const currentColorKey = colorsMap[currentColor] || '#3a3a3a';
  const currentColorIndex = colorOptions.indexOf(currentColorKey);
  const nextColor = colorOptions[(currentColorIndex + 1) % colorOptions.length];
  tileElement.style.backgroundColor = nextColor;
  saveState();
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
    tileElement.style.backgroundColor = 'grey';
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

// function adjustBingoCardHeight() {
//   const bingoCard = document.getElementById('bingoCard');
//   const tiles = document.querySelectorAll('.bingo-tile');
//   const rowHeight = tiles[0].offsetHeight;
//   const rows = Math.ceil(tiles.length / 5); // Assuming 5 tiles per row
//   // Remove the line that sets the height of the bingo card
//   // bingoCard.style.height = `${rows * rowHeight + 40}px`; // This line is no longer needed
// }


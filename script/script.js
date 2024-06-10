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

  fetch('Data/bingo.json')
    .then(response => response.json())
    .then(data => {
      const tiles = data.BingoTiles;
      tiles.forEach(tile => {
        const tileElement = createTileElement(tile, savedState[tile.tile]);
        bingoCard.appendChild(tileElement);
      });
      // Update the scoreboard with initial values
      updateScoreboard();
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

  burgerMenu.addEventListener('click', () => {
    navMenu.style.display = navMenu.style.display === 'block' ? 'none' : 'block';
  });

  // Popup Sidebar Functionality
  const menuLinks = document.querySelectorAll('.nav-menu a');
  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  document.body.appendChild(overlay);

  menuLinks.forEach(link => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const targetPopup = document.getElementById(link.getAttribute('data-target'));
      targetPopup.classList.add('active');
      overlay.classList.add('active');
    });
  });

  overlay.addEventListener('click', () => {
    document.querySelectorAll('.popup-sidebar').forEach(popup => {
      popup.classList.remove('active');
    });
    overlay.classList.remove('active');
  });
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
  backSide.textContent = tile.text;

  const img = document.createElement('img');
  img.src = tile.img_path;
  img.alt = tile.tile;

  const title = document.createElement('p');
  title.textContent = tile.tile;

  const buttons = document.createElement('div');
  buttons.className = 'buttons';

  const noteButton = document.createElement('button');
  noteButton.textContent = 'Notes';
  noteButton.classList.add('note-button');
  noteButton.tabIndex = 0; // Make the button focusable
  noteButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleNoteTextbox(tileElement);
  });

  const colorButton = document.createElement('button');
  colorButton.textContent = 'Color';
  colorButton.classList.add('color-button');
  colorButton.tabIndex = 0; // Make the button focusable
  colorButton.addEventListener('click', (event) => {
    event.stopPropagation();
    showColorOptions(tileElement);
  });

  const completedButton = document.createElement('button');
  completedButton.textContent = savedTileState && savedTileState.completed ? 'Mark as Incomplete' : 'Mark as Complete';
  completedButton.classList.add('completed-button');
  completedButton.tabIndex = 0; // Make the button focusable
  completedButton.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleCompletion(tileElement, tile.tile);
  });

  buttons.appendChild(noteButton);
  buttons.appendChild(colorButton);
  buttons.appendChild(completedButton);

  frontSide.appendChild(img);
  frontSide.appendChild(title);

  tileElement.appendChild(frontSide);
  tileElement.appendChild(backSide);
  tileElement.appendChild(buttons);

  const noteTextbox = document.createElement('textarea');
  noteTextbox.className = 'note-textbox';
  noteTextbox.dataset.tileName = tile.tile;
  noteTextbox.style.display = 'none'; // Initially hidden
  if (savedTileState && savedTileState.note) {
    noteTextbox.value = savedTileState.note;
  }
  noteTextbox.addEventListener('input', () => saveState());

  document.body.appendChild(noteTextbox);

  // Make the entire tile (except buttons) clickable
  tileElement.addEventListener('click', (event) => {
    if (!tileElement.classList.contains('completed') && !event.target.classList.contains('buttons') && !event.target.closest('.buttons')) {
      flipTile(tileElement, tile.tile);
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

function toggleNoteTextbox(tileElement) {
  const tileName = tileElement.dataset.tileName;
  const noteTextbox = document.querySelector(`.note-textbox[data-tile-name="${tileName}"]`);
  const rect = tileElement.getBoundingClientRect();
  noteTextbox.style.top = `${rect.top + window.scrollY}px`;
  noteTextbox.style.left = `${rect.left + window.scrollX}px`;
  noteTextbox.style.display = noteTextbox.style.display === 'block' ? 'none' : 'block';
}

function showColorOptions(tileElement) {
  const colorOptions = ['red', '#3a3a3a', 'green', 'yellow']; // Use the initial grey color #3a3a3a
  const currentColor = tileElement.style.backgroundColor || '#3a3a3a';
  const nextColor = colorOptions[(colorOptions.indexOf(currentColor) + 1) % colorOptions.length];
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

  if (isCompleted) {
    tileElement.style.backgroundColor = 'grey';

    if (updateButton && completedButton) {
      completedButton.textContent = 'Mark as Incomplete';
    }

    tileElement.style.pointerEvents = 'none';
    completedButton.style.pointerEvents = 'auto';

    if (noteButton) noteButton.style.display = 'none';
    if (colorButton) colorButton.style.display = 'none';
  } else {
    if (updateButton && completedButton) {
      completedButton.textContent = 'Mark as Complete';
    }

    tileElement.style.pointerEvents = 'auto';
    tileElement.style.backgroundColor = '';

    if (noteButton) noteButton.style.display = 'inline-block';
    if (colorButton) colorButton.style.display = 'inline-block';
  }
}

function flipTile(tileElement, tileName) {
  tileElement.classList.toggle('flipped');
  saveState();
}

function saveState() {
  const tiles = document.querySelectorAll('.bingo-tile');
  const state = {};
  tiles.forEach(tile => {
    const tileName = tile.dataset.tileName;
    const noteTextbox = document.querySelector(`.note-textbox[data-tile-name="${tileName}"]`);
    state[tileName] = {
      completed: tile.classList.contains('completed'),
      color: tile.style.backgroundColor,
      note: noteTextbox && noteTextbox.value ? noteTextbox.value : ''
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
    if (completedButton) {
      completedButton.textContent = 'Mark as Complete';
    }
    const noteButton = tile.querySelector('.note-button');
    const colorButton = tile.querySelector('.color-button');
    if (noteButton) noteButton.style.display = 'inline-block';
    if (colorButton) colorButton.style.display = 'inline-block';
    tile.style.pointerEvents = 'auto';
  });
  updateScoreboard();
}

function checkViewportWidth() {
  if (window.innerWidth <= 768) {
    document.getElementById("mobileWarningModal").style.display = "block";
  }
}

function closeModal() {
  document.getElementById("mobileWarningModal").style.display = "none";
}

window.addEventListener("resize", checkViewportWidth);
window.addEventListener("load", checkViewportWidth);

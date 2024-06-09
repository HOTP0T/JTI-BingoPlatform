document.addEventListener("DOMContentLoaded", () => {
  const bingoCard = document.getElementById('bingoCard');
  const completedCount = document.getElementById('completedCount');
  const uncompletedCount = document.getElementById('uncompletedCount');
  const completionDates = document.getElementById('completionDates');
  
  const savedState = JSON.parse(localStorage.getItem('bingoState')) || {};
  
  fetch('../Data/bingo.json')
      .then(response => response.json())
      .then(data => {
          const tiles = data.BingoTiles;
          tiles.forEach(tile => {
              const tileElement = document.createElement('div');
              tileElement.className = 'bingo-tile';
              if (savedState[tile.tile] && savedState[tile.tile].completed) {
                tileElement.classList.add('completed');
              }

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
              noteButton.addEventListener('click', () => addNote(tileElement, tile.tile));

              const colorButton = document.createElement('button');
              colorButton.textContent = 'Color';
              colorButton.addEventListener('click', () => showColorOptions(tileElement));

              buttons.appendChild(noteButton);
              buttons.appendChild(colorButton);

              frontSide.appendChild(img);
              frontSide.appendChild(title);
              frontSide.appendChild(buttons);

              tileElement.appendChild(frontSide);
              tileElement.appendChild(backSide);

              tileElement.addEventListener('click', () => flipTile(tileElement, tile.tile));

              bingoCard.appendChild(tileElement);
          });
          updateScoreboard();
      })
      .catch(error => console.error('Error fetching the JSON data:', error));
});

function addNote(tileElement, tileName) {
  const note = prompt('Enter your note:');
  if (note) {
      let noteElement = tileElement.querySelector('.note');
      if (!noteElement) {
          noteElement = document.createElement('div');
          noteElement.className = 'note';
          tileElement.appendChild(noteElement);
      }
      noteElement.textContent = note;
      
      const savedState = JSON.parse(localStorage.getItem('bingoState')) || {};
      savedState[tileName] = savedState[tileName] || {};
      savedState[tileName].note = note;
      localStorage.setItem('bingoState', JSON.stringify(savedState));
  }
}

function showColorOptions(tileElement) {
  const colorOptions = ['red', 'white', 'green', 'yellow'];
  const currentColor = tileElement.style.backgroundColor || 'white';
  const nextColor = colorOptions[(colorOptions.indexOf(currentColor) + 1) % colorOptions.length];
  tileElement.style.backgroundColor = nextColor;
}

function flipTile(tileElement, tileName) {
  tileElement.classList.toggle('flipped');
  
  const savedState = JSON.parse(localStorage.getItem('bingoState')) || {};
  savedState[tileName] = savedState[tileName] || {};
  savedState[tileName].completed = tileElement.classList.contains('flipped');
  savedState[tileName].completionDate = new Date().toLocaleDateString();
  localStorage.setItem('bingoState', JSON.stringify(savedState));
  
  updateScoreboard();
}

function updateScoreboard() {
  const savedState = JSON.parse(localStorage.getItem('bingoState')) || {};
  let completedCountValue = 0;
  let uncompletedCountValue = 0;
  const datesList = completionDates;
  datesList.innerHTML = '';
  
  Object.keys(savedState).forEach(key => {
    if (savedState[key].completed) {
      completedCountValue++;
      const dateItem = document.createElement('li');
      dateItem.textContent = `${key} - ${savedState[key].completionDate}`;
      datesList.appendChild(dateItem);
    } else {
      uncompletedCountValue++;
    }
  });
  
  completedCount.textContent = completedCountValue;
  uncompletedCount.textContent = uncompletedCountValue;
}

// Real-time updates
const socket = new WebSocket('ws://your-websocket-server-url');

socket.addEventListener('message', event => {
  const { action, tileName, note, color, completed } = JSON.parse(event.data);
  const tileElement = document.querySelector(`[data-tile-name="${tileName}"]`);
  if (tileElement) {
    if (action === 'addNote') {
      let noteElement = tileElement.querySelector('.note');
      if (!noteElement) {
        noteElement = document.createElement('div');
        noteElement.className = 'note';
        tileElement.appendChild(noteElement);
      }
      noteElement.textContent = note;
    } else if (action === 'changeColor') {
      tileElement.style.backgroundColor = color;
    } else if (action === 'flipTile') {
      tileElement.classList.toggle('flipped', completed);
    }
    updateScoreboard();
  }
});

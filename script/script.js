let socket;
let currentUser;

function login() {
    const username = document.getElementById('username').value;

    if (username) {
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Login failed');
            }
            return response.json();
        })
        .then(user => {
            currentUser = user;
            console.log('Logged in user:', user);  // Debugging statement
            initSocket(user);
            document.getElementById('login').style.display = 'none';
            loadBingoCard(user.team);
        })
        .catch(error => {
            console.error('Error logging in:', error);
            alert('Login failed. Please check your username.');
        });
    }
}

function initSocket(user) {
    socket = io();
    socket.emit('join', { username: user.username, team: user.team });

    socket.on('tileUpdated', updateTile);
}

function loadBingoCard(team) {
    console.log('Loading bingo card for team:', team);  // Debugging statement
    // Load bingo tiles based on team
    fetch(`/api/tiles?team=${team}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch tiles');
            }
            return response.json();
        })
        .then(tiles => {
            console.log('Fetched tiles:', tiles);  // Debugging statement
            const bingoCard = document.getElementById('bingoCard');
            bingoCard.innerHTML = ''; // Clear previous tiles

            tiles.forEach(tile => {
                const tileElement = document.createElement('div');
                tileElement.className = `bingo-tile ${tile.flipped ? 'flipped' : ''}`;
                tileElement.dataset.id = tile._id;

                const frontSide = document.createElement('div');
                frontSide.className = 'front-side';

                const backSide = document.createElement('div');
                backSide.className = 'back-side';
                backSide.textContent = tile.text;

                const img = document.createElement('img');
                img.src = tile.img_path;
                img.alt = tile.tile;
                img.addEventListener('click', () => flipTile(tileElement));

                const title = document.createElement('p');
                title.textContent = tile.tile;

                const buttons = document.createElement('div');
                buttons.className = 'buttons';

                const noteButton = document.createElement('button');
                noteButton.textContent = 'Add Note';
                noteButton.addEventListener('click', () => addNote(tileElement));

                const colorButton = document.createElement('button');
                colorButton.textContent = 'Change Color';
                colorButton.addEventListener('click', () => showColorOptions(tileElement));

                buttons.appendChild(noteButton);
                buttons.appendChild(colorButton);

                frontSide.appendChild(img);
                frontSide.appendChild(title);
                frontSide.appendChild(buttons);

                tileElement.appendChild(frontSide);
                tileElement.appendChild(backSide);

                bingoCard.appendChild(tileElement);
            });
        })
        .catch(error => {
            console.error('Error fetching tiles:', error);  // Debugging statement
        });
}

function addNote(tileElement) {
    const note = prompt('Enter your note:');
    if (note) {
        const tileId = tileElement.dataset.id;
        socket.emit('addNote', { team: currentUser.team, tileId, note });
    }
}

function showColorOptions(tileElement) {
    const colorOptions = ['red', 'white', 'green'];
    const currentColor = tileElement.style.backgroundColor || 'white';
    const nextColor = colorOptions[(colorOptions.indexOf(currentColor) + 1) % colorOptions.length];
    const tileId = tileElement.dataset.id;
    socket.emit('changeColor', { team: currentUser.team, tileId, color: nextColor });
}

function flipTile(tileElement) {
    const tileId = tileElement.dataset.id;
    const flipped = !tileElement.classList.contains('flipped');
    socket.emit('flipTile', { team: currentUser.team, tileId, flipped });
}

function updateTile(tile) {
    const tileElement = document.querySelector(`.bingo-tile[data-id="${tile._id}"]`);
    if (tileElement) {
        tileElement.classList.toggle('flipped', tile.flipped);
        tileElement.style.backgroundColor = tile.color || 'white';
        const noteElement = tileElement.querySelector('.note');
        if (noteElement) {
            noteElement.textContent = tile.note;
        } else if (tile.note) {
            const newNoteElement = document.createElement('div');
            newNoteElement.className = 'note';
            newNoteElement.textContent = tile.note;
            tileElement.appendChild(newNoteElement);
        }
    }
}

const giftForm = document.getElementById('giftForm');
const giftList = document.getElementById('giftItems');

// Geschenkliste laden
fetch('/gifts')
    .then(response => response.json())
    .then(data => {
        data.forEach(entry => {
            const listItem = document.createElement('li');
            listItem.textContent = `${entry.username} hat bekommen: ${entry.gift}`;
            giftList.appendChild(listItem);
        });
    });

// Neues Geschenk speichern
giftForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const gift = document.getElementById('gift').value.trim();

    if (username && gift) {
        fetch('/gifts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, gift }),
        })
            .then(response => response.json())
            .then(data => {
                const listItem = document.createElement('li');
                listItem.textContent = `${data.username} hat bekommen: ${data.gift}`;
                giftList.appendChild(listItem);
                giftForm.reset();
            });
    }
});

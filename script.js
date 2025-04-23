document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const resultsContainer = document.getElementById('results');
    const initialMessage = document.querySelector('.initial-message');
    let jargonData = [];

    // --- Fetch Jargon Data ---
    fetch('jargon.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            jargonData = data;
        })
        .catch(error => {
            console.error('Error loading jargon data:', error);
            resultsContainer.innerHTML = '<p class="not-found-message">Error loading jargon database. Please try again later.</p>';
            if (initialMessage) initialMessage.style.display = 'none';
        });

    // --- Search Functionality ---
    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        filterAndDisplay(searchTerm);
    });

    // --- Filter and Display Logic ---
    function filterAndDisplay(searchTerm) {
        if (!searchTerm) {
            resultsContainer.innerHTML = '';
            if (initialMessage) {
                initialMessage.style.display = 'block';
            } else {
                resultsContainer.innerHTML = '<p class="initial-message">Enter a term above to explore climate jargon.</p>';
            }
            return;
        }

        if (initialMessage) initialMessage.style.display = 'none';

        const filteredJargon = jargonData.filter(item => {
            // Create word boundary regex for term and definition
            const termRegex = new RegExp(`\\b${escapeRegExp(searchTerm)}\\b`, 'i');
            const definitionRegex = new RegExp(`\\b${escapeRegExp(searchTerm)}\\b`, 'i');

            return termRegex.test(item.term) || definitionRegex.test(item.definition);
        });

        displayResults(filteredJargon, searchTerm);
    }

    // --- Display Results ---
    function displayResults(filteredData, searchTerm) {
        resultsContainer.innerHTML = '';

        if (filteredData.length === 0 && searchTerm) {
            resultsContainer.innerHTML = `
                <div class="not-found-message">
                    <p>Sorry, the term "<strong>${escapeHTML(searchTerm)}</strong>" was not found in our database.</p>
                    <p><a href="https://forms.gle/wUsAuJvhSD1Pfnc99" target="_blank">Click here to suggest adding it.</a></p>
                </div>`;
        } else {
            filteredData.forEach(item => {
                const resultDiv = document.createElement('div');
                resultDiv.classList.add('result-item');

                const termElement = document.createElement('h3');
                termElement.innerHTML = highlightSearchTerm(item.term, searchTerm);

                const definitionElement = document.createElement('p');
                definitionElement.innerHTML = highlightSearchTerm(item.definition, searchTerm);

                resultDiv.appendChild(termElement);
                resultDiv.appendChild(definitionElement);
                resultsContainer.appendChild(resultDiv);
            });
        }
    }

    // --- Helper function to highlight search term ---
    function highlightSearchTerm(text, term) {
        if (!term) return text;
        const regex = new RegExp(`(\\b${escapeRegExp(term)}\\b)`, 'gi'); // 'gi' for global, case-insensitive
        return text.replace(regex, '<mark>$1</mark>'); // Wrap matches in <mark> tags
    }

    // --- Helper function to escape special characters for regex ---
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    }

    // --- Helper function to escape HTML to prevent XSS ---
    function escapeHTML(str) {
        const div = document.createElement('div');
        div.appendChild(document.createTextNode(str));
        return div.innerHTML;
    }
});

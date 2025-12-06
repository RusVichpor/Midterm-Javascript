// script.js

document.addEventListener('DOMContentLoaded', () => {
    const trendingSection = document.querySelector('.trending');
    const bookModalOverlay = document.getElementById('book-modal-overlay');
    const bookModalContent = document.getElementById('book-modal-content');
    const closeModalButton = document.querySelector('.close-modal-button');

    // Modal elements
    const modalBookCover = document.getElementById('modal-book-cover');
    const modalBookTitle = document.getElementById('modal-book-title');
    const modalBookAuthor = document.getElementById('modal-book-author');
    const modalBookGenre = document.getElementById('modal-book-genre');
    const modalBookRating = document.getElementById('modal-book-rating');
    const modalBookDescription = document.getElementById('modal-book-description');
    const modalBookPrice = document.getElementById('modal-book-price');
    const modalBookISBN = document.getElementById('modal-book-isbn'); // New element for ISBN
    const modalBookPublisher = document.getElementById('modal-book-publisher'); // New element for Publisher
    const modalAddToCartButton = document.querySelector('.modal-add-to-cart');


    // Store all fetched and processed book data for easy access by modal
    let allBooksData = {}; // Using an object (map) to store by book ID for quick lookup

    // --- Helper Functions for Random Data Generation ---
    function generateRandomPrice() {
        const minPrice = 7.99;
        const maxPrice = 35.99;
        const randomValue = Math.random() * (maxPrice - minPrice) + minPrice;
        return randomValue.toFixed(2);
    }

    function generateRandomRating() {
        const minRating = 4.0;
        const maxRating = 5.0;
        const randomValue = Math.random() * (maxRating - minRating) + minRating;
        return randomValue.toFixed(1);
    }

    function generateRandomRatingsCount() {
        const minCount = 100;
        const maxCount = 10000;
        return Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    }

    // --- Function to Display Book Details in Modal ---
    function displayBookModal(book) {
        if (!book) {
            console.error("No book data provided for modal display.");
            return;
        }

        modalBookCover.src = book.coverUrl;
        modalBookTitle.textContent = book.title;
        modalBookAuthor.textContent = book.authors;
        modalBookGenre.textContent = book.genres;
        modalBookRating.textContent = book.ratingDisplay;
        modalBookDescription.innerHTML = book.fullDescription; // Use innerHTML if description has basic formatting
        modalBookPrice.textContent = `$${book.price}`;

        // Display ISBN and Publisher
        modalBookISBN.textContent = `ISBN: ${book.isbn || 'N/A'}`;
        modalBookPublisher.textContent = `Publisher: ${book.publisher || 'N/A'}`;

        // Set data attributes for potential future cart functionality
        modalAddToCartButton.dataset.bookId = book.id;
        modalAddToCartButton.dataset.price = book.price;

        bookModalOverlay.classList.remove('hidden'); // Show the modal
        document.body.classList.add('no-scroll'); // Prevent body from scrolling when modal is open
    }

    // --- Function to Hide Modal ---
    function hideBookModal() {
        bookModalOverlay.classList.add('hidden'); // Hide the modal
        document.body.classList.remove('no-scroll'); // Re-enable body scrolling
    }

    // --- Event Listeners for Modal ---
    closeModalButton.addEventListener('click', hideBookModal);
    bookModalOverlay.addEventListener('click', (event) => {
        // Hide modal if overlay itself is clicked (but not the content inside)
        if (event.target === bookModalOverlay) {
            hideBookModal();
        }
    });


    // --- Main Function to Fetch and Display Trending Books ---
    async function fetchAndDisplayTrendingBooks() {
        try {
            const query = 'fiction bestsellers OR science fiction classics OR popular history books'; // Diverse query
            const apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                trendingSection.innerHTML = '<h2>Trending Books</h2><div class="book-grid"></div>';
                const bookGrid = trendingSection.querySelector('.book-grid');

                data.items.forEach((item) => {
                    const volumeInfo = item.volumeInfo;

                    if (!volumeInfo || !volumeInfo.title || !volumeInfo.authors) {
                        console.warn("Skipping book due to missing essential info:", item);
                        return;
                    }

                    const title = volumeInfo.title;
                    const authors = volumeInfo.authors.join(', ');
                    const coverUrl = volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail
                                     ? volumeInfo.imageLinks.thumbnail.replace('&edge=curl', '')
                                     : 'https://via.placeholder.com/128x192?text=No+Cover';

                    const fullDescription = `<strong>Description: </strong>${volumeInfo.description}` || 'No description available for this book.';

                    const genres = volumeInfo.categories && volumeInfo.categories.length > 0
                                   ? `Genre: ${volumeInfo.categories.slice(0, 2).join(', ')}`
                                   : 'Genre: Not available';

                    const generatedPrice = generateRandomPrice();
                    const generatedRating = generateRandomRating();
                    const generatedRatingsCount = generateRandomRatingsCount();
                    const ratingDisplay = `Rating: ${generatedRating} / 5 (${generatedRatingsCount} ratings)`;
                    
                    // Extract ISBN (often multiple, we'll take the first ISBN_13 or ISBN_10)
                    let isbn = 'N/A';
                    if (volumeInfo.industryIdentifiers && Array.isArray(volumeInfo.industryIdentifiers)) {
                        const isbn13 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_13');
                        const isbn10 = volumeInfo.industryIdentifiers.find(id => id.type === 'ISBN_10');
                        isbn = (isbn13 && isbn13.identifier) || (isbn10 && isbn10.identifier) || 'N/A';
                    }

                    // Extract Publisher
                    const publisher = volumeInfo.publisher || 'N/A';


                    // Store all necessary data for the modal in our global storage
                    allBooksData[item.id] = {
                        id: item.id,
                        title: title,
                        authors: authors,
                        coverUrl: coverUrl,
                        genres: genres,
                        ratingDisplay: ratingDisplay,
                        fullDescription: fullDescription,
                        price: generatedPrice,
                        isbn: isbn,          // Storing ISBN
                        publisher: publisher // Storing Publisher
                    };

                    const bookElement = document.createElement('div');
                    const genreLabel = genres.replace('Genre: ', ''); // Remove "Genre: " prefix for cleaner display

                    // Create the book card HTML structure
                    bookElement.classList.add('book-card');
                    bookElement.dataset.bookId = item.id; // Store book ID on the card

                    bookElement.innerHTML = `
                        <div class="book-cover-container">
                            <!-- Promo Tags -->
                            <div class="rating-tags">
                                <p class="rating-promo-badge" style="color:rgb(255, 255, 255);">⭐ ${generatedRating}</p>
                            </div>
                            <img src="${coverUrl}" alt="${title} Cover" class="book-cover-img">
                        </div>
                        <p class="book-genre-label style="color:rgb(255, 0, 0);">${genreLabel}</p>
                        <h3 class="book-title">${title}</h3>
                        <p class="book-author">${authors}</p>
                        <div class="price-section">
                            <button class="price-button">$${generatedPrice}</button>
                        </div>
                    `;
                    bookGrid.appendChild(bookElement);

                    // Add click listener to the newly created card
                    bookElement.addEventListener('click', () => {
                        displayBookModal(allBooksData[item.id]);
                    });
                });
            } else {
                trendingSection.innerHTML = '<p>No trending books found with the current query. Try a different search term!</p>';
            }
        } catch (error) {
            console.error('Error fetching trending books:', error);
            trendingSection.innerHTML = '<p>Failed to load trending books. Please try again later.</p>';
        }
    }

    fetchAndDisplayTrendingBooks();
});








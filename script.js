const booksContainer = document.getElementById("books-container"); // The area where books will be displayed
const gridViewButton = document.getElementById("grid-view"); // Button to switch to grid view
const listViewButton = document.getElementById("list-view"); // Button to switch to list view
const searchInput = document.getElementById("search-input"); // Search input field
const searchButton = document.getElementById("search-button"); // Search button
const sortSelect = document.getElementById("sort-select"); // Dropdown for sorting books

let books = []; // Stores all books fetched from the API
let currentView = "grid"; // Default view mode
let filteredBooks = []; // Stores books after filtering/searching
let currentPage = 1; // Keeps track of the current page
const booksPerPage = 9; // Number of books to show per page

async function fetchBooks() {
  const url =
    "https://api.freeapi.app/api/v1/public/books?page=1&limit=20&inc=kind%252Cid%252Cetag%252CvolumeInfo&query=tech";
  const options = { method: "GET", headers: { accept: "application/json" } };
  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.data && data.data.data) {
      books = data.data.data;
      console.log(books);
      
      renderBooks();
    } else {
      booksContainer.innerHTML = '<div class="error">No books found</div>';
    }
  } catch (error) {
    booksContainer.innerHTML =
      '<div class="error">Error fetching books. Please try again.</div>'; // Show error if API request fails
  }
}

function renderBooks() {
  booksContainer.innerHTML = "";
  const displayedBooks = filteredBooks.length > 0 ? filteredBooks : books; // Show filtered books if available
  const startIndex = (currentPage - 1) * booksPerPage;
  const endIndex = startIndex + booksPerPage;
  const paginatedBooks = displayedBooks.slice(startIndex, endIndex); // Get books for the current page

  paginatedBooks.forEach((book) => {
    const { title, authors, imageLinks, publishedDate, categories, infoLink } =
      book.volumeInfo; // get book details

    const bookElement = document.createElement("div");
    bookElement.className = "book-item";

    if (currentView === "grid") {
      // if grid view
      bookElement.innerHTML = `
        <div class="book-cover"> 
            <a href="${infoLink}" target="_blank"> <img src="${imageLinks.thumbnail}" alt="${title}"> </a>
        </div>
        <div class="book-info">
            <a href="${infoLink}" target="_blank"> <h3 class="book-title">${title}</h3> </a>
            <p class="book-author">By: ${authors}</p>
            <p class="book-category"><i class="fa-solid fa-tag"></i> ${categories}</p>
            <p class="book-date">Published: ${publishedDate}</p>
        </div>
      `;
    } else {
      // if list view
      bookElement.innerHTML = `
        <div class="flex-layout">
            <div class="book-cover-list">
              <a href="${infoLink}" target="_blank"> <img src="${imageLinks.thumbnail}" alt="${title}"> </a>
            </div>
            <div class="book-info-list">
                <a href="${infoLink}" target="_blank"> <h3 class="book-title">${title}</h3> </a>
                <p class="book-author">${authors}</p>
            </div>
            <div class="book-metadata-list">
                <div class="book-year">${publishedDate}</div>
                <div class="book-category"><i class="fa-solid fa-tag"></i> ${categories}</div>
            </div>
        </div>
      `;
    }

    booksContainer.appendChild(bookElement);
  });

  // Pagination controls
  const totalPages = Math.ceil(
    (filteredBooks.length || books.length) / booksPerPage
  ); // find total pages
  const pageNav = document.getElementById("page-navigation");

  pageNav.innerHTML = `
    <button class="page-btn" ${
      currentPage === 1 ? "disabled" : ""
    } onclick="changePage(${currentPage - 1})">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
    <span>Page ${currentPage} of ${totalPages}</span>
    <button class="page-btn" ${
      currentPage === totalPages ? "disabled" : ""
    } onclick="changePage(${currentPage + 1})">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;
}

function changePage(page) {
  const totalPages = Math.ceil(
    (filteredBooks.length || books.length) / booksPerPage
  );
  if (page >= 1 && page <= totalPages) {
    currentPage = page;
    renderBooks();
  }
}

function searchBooks() {
  const searchTerm = searchInput.value.toLowerCase().trim();
  filteredBooks = books.filter((book) => {
    const title = book.volumeInfo.title.toLowerCase();
    const authors = book.volumeInfo.authors
      ? book.volumeInfo.authors.join(", ").toLowerCase()
      : "";
    return title.includes(searchTerm) || authors.includes(searchTerm); // check if book title or author matches
  });
  renderBooks();
}

function sortBooks() {
  const sortValue = sortSelect.value;
  currentPage = 1;

  if (sortValue.includes("category-")) {
    const category = sortValue.replace("category-", "");
    filteredBooks = books.filter((book) => {
      const categories = book.volumeInfo.categories || [];
      return categories.some((val) => val.toLowerCase().includes(category)); // check if book belongs to category
    });
  } else {
    filteredBooks = [];
  }

  renderBooks();
}

// Event listeners for search and sorting
searchButton.addEventListener("click", searchBooks);
searchInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") searchBooks();
});

sortSelect.addEventListener("change", sortBooks);

// Toggle between grid and list view
gridViewButton.addEventListener("click", () => {
  currentView = "grid";
  booksContainer.className = "grid-view";
  gridViewButton.classList.add("active");
  listViewButton.classList.remove("active");
  renderBooks();
});

listViewButton.addEventListener("click", () => {
  currentView = "list";
  booksContainer.className = "list-view";
  gridViewButton.classList.remove("active");
  listViewButton.classList.add("active");
  renderBooks();
});

// Fetch books when the page loads
document.addEventListener("DOMContentLoaded", fetchBooks);

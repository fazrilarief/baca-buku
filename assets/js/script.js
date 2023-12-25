const books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "book-storage";

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookRead = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBookRead.innerHTML = "";

  const completedBookRead = document.getElementById("completeBookshelfList");
  completedBookRead.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      uncompletedBookRead.append(bookElement);
    } else {
      completedBookRead.append(bookElement);
    }
  }
});

function generateID() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year: Number(year),
    isComplete,
  };
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget === null) return;

  bookTarget.isComplete = false;
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function deleteBookList(bookId) {
  const bookTarget = findBookIndex(bookId);
  const isConfirmed = window.confirm("Yakin mau dihapus?");

  if (bookTarget === -1) return;

  if (isConfirmed) {
    books.splice(bookTarget, 1);
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

function doneReadToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

const inputBook = document.querySelector("#inputBook");
inputBook.addEventListener("submit", function (event) {
  event.preventDefault();
  addBook();
});

function addBook() {
  const bookId = generateID();
  const bookTitle = document.getElementById("inputBookTitle").value;
  const bookAuthor = document.getElementById("inputBookAuthor").value;
  const bookYear = document.getElementById("inputBookYear").value;
  const bookisComplete = document.getElementById("inputBookIsComplete").checked
    ? true
    : false;
  const bookObject = generateBookObject(
    bookId,
    bookTitle,
    bookAuthor,
    bookYear,
    bookisComplete,
    false
  );
  books.push(bookObject);
  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function makeBook(bookObject) {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = "Judul : " + bookObject.title;
  const bookAuthor = document.createElement("p");
  bookAuthor.innerText = "Penulis : " + bookObject.author;
  const bookYear = document.createElement("p");
  bookYear.innerText = "Tahun : " + bookObject.year;

  const bookContainer = document.createElement("div");
  bookContainer.classList.add("book_item");
  bookContainer.append(bookTitle, bookAuthor, bookYear);

  const container = document.createElement("div");
  container.classList.add("book_shelf");
  container.append(bookContainer);

  if (bookObject.isComplete) {
    const undoBook = document.createElement("button");
    undoBook.classList.add("yellow");
    undoBook.innerHTML = '<i class="fas fa-undo"></i>';
    undoBook.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });

    const deleteBook = document.createElement("button");
    deleteBook.classList.add("red");
    deleteBook.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBook.addEventListener("click", function () {
      deleteBookList(bookObject.id);
    });

    bookContainer.append(undoBook, deleteBook);
  } else {
    const doneRead = document.createElement("button");
    doneRead.classList.add("green");
    doneRead.innerHTML = '<i class="fas fa-check"></i>';
    doneRead.addEventListener("click", function () {
      doneReadToCompleted(bookObject.id);
    });

    const deleteBook = document.createElement("button");
    deleteBook.classList.add("red");
    deleteBook.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteBook.addEventListener("click", function () {
      deleteBookList(bookObject.id);
    });

    const editBook = document.createElement("button");
    editBook.classList.add("yellow");
    editBook.innerHTML = '<i class="fas fa-pen"></i>';
    editBook.addEventListener("click", function () {
      editBookDetails(bookObject.id);
    });

    bookContainer.append(doneRead, deleteBook, editBook);
  }
  return container;
}

function editBookDetails(bookId) {
  const bookToEdit = findBook(bookId);

  if (bookToEdit === null) return;

  const newTitle = prompt(
    `Edit judul buku (sekarang: ${bookToEdit.title}):`,
    bookToEdit.title
  );
  const newAuthor = prompt(
    `Edit penulis buku (sekarang: ${bookToEdit.author}):`,
    bookToEdit.author
  );
  const newYear = prompt(
    `Edit tahun terbit buku (sekarang: ${bookToEdit.year}):`,
    bookToEdit.year
  );

  if (newTitle !== null && newAuthor !== null && newYear !== null) {
    bookToEdit.title = newTitle;
    bookToEdit.author = newAuthor;
    bookToEdit.year = newYear;
    saveData();
    document.dispatchEvent(new Event(RENDER_EVENT));
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
}

function loadDataFromStorage() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (storedData) {
    books.length = 0;
    const parsedData = JSON.parse(storedData);
    books.push(...parsedData);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  loadDataFromStorage();
  document.dispatchEvent(new Event(RENDER_EVENT));
});

function searchBooks() {
  const searchTitle = document
    .getElementById("searchBookTitle")
    .value.toLowerCase();

  const filteredBooks = books.filter(function (bookItem) {
    const lowerCaseTitle = bookItem.title.toLowerCase();
    return lowerCaseTitle.includes(searchTitle);
  });

  renderBooks(filteredBooks);
}

document.addEventListener("DOMContentLoaded", function () {
  loadDataFromStorage();
  document.dispatchEvent(new Event(RENDER_EVENT));

  const searchForm = document.getElementById("searchBook");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBooks();
  });
});

function renderBooks(booksToRender) {
  const uncompletedBookRead = document.getElementById(
    "incompleteBookshelfList"
  );
  uncompletedBookRead.innerHTML = "";

  const completedBookRead = document.getElementById("completeBookshelfList");
  completedBookRead.innerHTML = "";

  for (const bookItem of booksToRender) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      uncompletedBookRead.append(bookElement);
    } else {
      completedBookRead.append(bookElement);
    }
  }
}

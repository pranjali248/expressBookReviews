const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Base URL of this same server (Axios calls go to our own API)
const BASE_URL = `http://localhost:${process.env.PORT || 5000}`;

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

// Fetch the full book list through Axios (async/await)
const fetchAllBooks = async () => {
  const response = await axios.get(`${BASE_URL}/internal/books`);
  return response.data;
};

// Internal data endpoint that serves the raw book data to the Axios calls
public_users.get("/internal/books", (req, res) => {
  return res.status(200).json(books);
});

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Missing username or password" });
  } else if (doesExist(username)) {
    return res.status(404).json({ message: "user already exists." });
  } else {
    users.push({ username: username, password: password });
    return res
      .status(200)
      .json({ message: "User successfully registered.  Please login." });
  }
});

// Get the book list available in the shop (Axios + async/await)
public_users.get("/", async (req, res) => {
  try {
    const allBooks = await fetchAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (e) {
    return res.status(500).json({ message: "Error fetching books." });
  }
});

// Get book details based on ISBN (Axios + async/await)
public_users.get("/isbn/:isbn", async (req, res) => {
  try {
    const allBooks = await fetchAllBooks();
    const targetBook = allBooks[parseInt(req.params.isbn)];
    if (!targetBook) {
      return res.status(404).json({ message: "ISBN not found." });
    }
    return res.status(200).json(targetBook);
  } catch (e) {
    return res.status(500).json({ message: "Error fetching book." });
  }
});

// Get book details based on author (Axios + async/await)
public_users.get("/author/:author", async (req, res) => {
  try {
    const allBooks = await fetchAllBooks();
    const matchingBooks = Object.values(allBooks).filter(
      (book) => book.author.toLowerCase() === req.params.author.toLowerCase()
    );
    if (matchingBooks.length > 0) {
      return res.status(200).send(JSON.stringify(matchingBooks, null, 4));
    }
    return res.status(404).json({ message: "No books by that author." });
  } catch (e) {
    return res.status(500).json({ message: "Error fetching books." });
  }
});

// Get book details based on title (Axios + async/await)
public_users.get("/title/:title", async (req, res) => {
  try {
    const allBooks = await fetchAllBooks();
    const matchingTitle = Object.values(allBooks).filter(
      (book) => book.title.toLowerCase() === req.params.title.toLowerCase()
    )[0];
    if (matchingTitle) {
      return res.status(200).json(matchingTitle);
    }
    return res.status(404).json({ message: "Title not found." });
  } catch (e) {
    return res.status(500).json({ message: "Error fetching book." });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const targetISBN = req.params.isbn;
  const targetBook = books[targetISBN];
  if (targetBook) {
    return res.status(200).send(JSON.stringify(targetBook.reviews, null, 4));
  } else {
    return res.status(404).json({ message: "ISBN not found." });
  }
});

module.exports.general = public_users;
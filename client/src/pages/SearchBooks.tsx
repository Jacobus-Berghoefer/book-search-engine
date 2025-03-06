import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { SAVE_BOOK } from '../graphql/mutations';
import { GET_ME } from '../graphql/queries';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';
import { Book } from '../models/Book';
import { GoogleAPIBook } from '../models/GoogleAPIBook'; // ✅ Import API book model

const SearchBooks = () => {
  const [searchedBooks, setSearchedBooks] = useState<Book[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const { data } = useQuery(GET_ME);
  const savedBooks: Book[] = data?.me?.savedBooks || [];

  // GraphQL mutation for saving a book
  const [saveBook] = useMutation(SAVE_BOOK, {
    update(cache, { data }) {
      const newBook = data?.saveBook;
      if (!newBook) return;

      cache.modify({
        id: cache.identify(data.me),
        fields: {
          savedBooks(existingBooks = []) {
            return [...existingBooks, newBook];
          }
        }
      });
    }
  });

  // Handle searching for books
  const handleSearch = async () => {
    if (!searchInput.trim()) return; // Prevent empty searches

    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${searchInput}`);
      const apiData = await response.json();

      //  Map API data into `Book` format
      const formattedBooks: Book[] = apiData.items.map((item: GoogleAPIBook) => ({
        bookId: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ["Unknown Author"], // ✅ Fallback for missing authors
        description: item.volumeInfo.description || "No description available.",
        image: item.volumeInfo.imageLinks?.thumbnail || "",
        link: item.volumeInfo.imageLinks?.smallThumbnail || "",
      }));

      setSearchedBooks(formattedBooks);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  // Handle form submission
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSearch();
  };

  const handleSaveBook = async (book: Book) => {
    if (!localStorage.getItem('token')) return;
  
    console.log("🟡 Attempting to save book:", book);
  
    try {
      const { data } = await saveBook({
        variables: { book: { 
          bookId: book.bookId, 
          title: book.title, 
          authors: book.authors, 
          description: book.description, 
          image: book.image, 
          link: book.link 
        }},
      });
  
      console.log("✅ Book saved successfully:", data);
    } catch (err) {
      console.error("❌ Error saving book:", err);
    }
  };
  

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Search for Books!</h1>
          <Form onSubmit={handleFormSubmit}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Control
                  name='searchInput'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  type='text'
                  size='lg'
                  placeholder='Search for a book'
                />
              </Col>
              <Col xs={12} md={4}>
                <Button type='submit' variant='success' size='lg'>
                  Submit Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Container>
      </div>

      <Container>
        <h2 className='pt-5'>
          {searchedBooks.length ? `Viewing ${searchedBooks.length} results:` : 'Search for a book to begin'}
        </h2>
        <Row>
          {searchedBooks.map((book) => {
            const isSaved = savedBooks.some((savedBook: Book) => savedBook.bookId === book.bookId);
            return (
              <Col md="4" key={book.bookId}>
                <Card border='dark'>
                  {book.image && <Card.Img src={book.image} alt={`Cover of ${book.title}`} />}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors?.join(', ') || "Unknown Author"}</p> 
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-info'
                      disabled={isSaved}
                      onClick={() => handleSaveBook(book)}>
                      {isSaved ? 'Book Already Saved!' : 'Save this Book!'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SearchBooks;



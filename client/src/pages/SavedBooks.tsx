import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../graphql/queries';
import { REMOVE_BOOK } from '../graphql/mutations';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Book } from '../models/Book';

const SavedBooks = () => {
  // Fetch user data using Apollo Client with explicit TypeScript typing
  const { loading, data } = useQuery<{ me?: { username?: string; savedBooks: Book[] } }>(GET_ME);

  // Ensure `userData` always has a valid structure
  const userData = data?.me || { username: "User", savedBooks: [] };

  // Mutation for removing a book
  const [removeBook] = useMutation(REMOVE_BOOK, {
    update(cache, { data }) {
      if (!data?.removeBook) return;

      const existingData = cache.readQuery<{ me?: { savedBooks: Book[] } }>({ query: GET_ME });

      if (existingData?.me) {
        cache.writeQuery({
          query: GET_ME,
          data: {
            me: {
              ...existingData.me,
              savedBooks: existingData.me.savedBooks.filter(
                (book) => book.bookId !== data.removeBook.bookId
              ),
            },
          },
        });
      }
    }
  });

  const handleDeleteBook = async (bookId: string) => {
    console.log("🟡 Attempting to delete book with ID:", bookId);
  
    try {
      const { data } = await removeBook({
        variables: { bookId },
      });
  
      console.log("✅ Book removed successfully:", data);
    } catch (err) {
      console.error("❌ Error removing book:", err);
    }
  };
  

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          <h1>Viewing {userData.username ? `${userData.username}'s` : 'your'} saved books!</h1>
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book: Book) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {book.image && <Card.Img src={book.image} alt={`Cover of ${book.title}`} />}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors?.join(', ') || 'Unknown Author'}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button className="btn-danger" onClick={() => handleDeleteBook(book.bookId)}>
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;

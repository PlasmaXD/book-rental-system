// server.go
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"net/http"

	pb "grpc-server/grpc-server/proto"

	"google.golang.org/grpc"
)

// server は BookServiceServer を実装します。
type server struct {
	pb.UnimplementedBookServiceServer
}

// GraphQLRequest は GraphQL エンドポイントへのリクエスト形式です。
type GraphQLRequest struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables"`
}

// GraphQLResponse は GraphQL エンドポイントからのレスポンス形式です。
type GraphQLResponse struct {
	Data   map[string]interface{} `json:"data"`
	Errors []struct {
		Message string `json:"message"`
	} `json:"errors"`
}

// sendGraphQLRequest は GraphQL BFF にリクエストを送信し、レスポンスを返します。
func sendGraphQLRequest(query string, variables map[string]interface{}) (map[string]interface{}, error) {
	url := "http://localhost:4000/graphql" // GraphQL BFF のエンドポイントに変更してください

	requestBody := GraphQLRequest{
		Query:     query,
		Variables: variables,
	}

	jsonData, err := json.Marshal(requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal GraphQL request: %v", err)
	}

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to send GraphQL request: %v", err)
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read GraphQL response: %v", err)
	}

	var graphqlResp GraphQLResponse
	if err := json.Unmarshal(body, &graphqlResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal GraphQL response: %v", err)
	}

	if len(graphqlResp.Errors) > 0 {
		return nil, fmt.Errorf("GraphQL errors: %v", graphqlResp.Errors[0].Message)
	}

	return graphqlResp.Data, nil
}

// GetBooks はすべての本を取得します。
func (s *server) GetBooks(ctx context.Context, in *pb.GetBooksRequest) (*pb.GetBooksResponse, error) {
	query := `
	query {
		books {
			id
			title
			author
			isbn
			image_url
			description
			available
			owner {
				id
			}
			borrower {
				id
			}
		}
	}
	`

	data, err := sendGraphQLRequest(query, nil)
	if err != nil {
		log.Printf("GetBooks failed: %v", err)
		return nil, err
	}

	booksData, ok := data["books"].([]interface{})
	if !ok {
		log.Printf("GetBooks: invalid data format")
		return nil, fmt.Errorf("invalid data format")
	}

	var books []*pb.Book
	for _, b := range booksData {
		bookMap, ok := b.(map[string]interface{})
		if !ok {
			continue
		}
		book := &pb.Book{
			Id:        bookMap["id"].(string),
			Title:     bookMap["title"].(string),
			Author:    bookMap["author"].(string),
			Isbn:      bookMap["isbn"].(string),
			Available: bookMap["available"].(bool),
			Owner:     bookMap["owner"].(map[string]interface{})["id"].(string),
		}

		books = append(books, book)
	}

	return &pb.GetBooksResponse{Books: books}, nil
}

// GetBook は特定の本を取得します。
func (s *server) GetBook(ctx context.Context, in *pb.GetBookRequest) (*pb.GetBookResponse, error) {
	query := `
	query($id: ID!) {
		book(id: $id) {
			id
			title
			author
			isbn
			image_url
			description
			available
			owner {
				id
			}
			borrower {
				id
			}
		}
	}
	`

	variables := map[string]interface{}{
		"id": in.Id,
	}

	data, err := sendGraphQLRequest(query, variables)
	if err != nil {
		log.Printf("GetBook failed: %v", err)
		return nil, err
	}

	bookData, ok := data["book"].(map[string]interface{})
	if !ok {
		log.Printf("GetBook: book not found")
		return nil, fmt.Errorf("book not found")
	}

	book := &pb.Book{
		Id:        bookData["id"].(string),
		Title:     bookData["title"].(string),
		Author:    bookData["author"].(string),
		Isbn:      bookData["isbn"].(string),
		Available: bookData["available"].(bool),
		// Owner:       bookData["owner"].(map[string]interface{})["id"].(string),
		// Borrower:    "", // borrowBook、returnBook で設定
		// ImageUrl:    "", // 必要に応じて設定
		// Description: "", // 必要に応じて設定
	}
	// Optional: image_url と description を設定する場合
	// if img, ok := bookData["image_url"].(string); ok {
	// 	book.ImageUrl = img
	// }
	// if desc, ok := bookData["description"].(string); ok {
	// 	book.Description = desc
	// }
	// // Optional: borrower が存在する場合
	// if borrower, ok := bookData["borrower"].(map[string]interface{}); ok && borrower["id"] != nil {
	// 	book.Borrower = borrower["id"].(string)
	// }

	return &pb.GetBookResponse{Book: book}, nil
}

// AddBook は新しい本を追加します。
func (s *server) AddBook(ctx context.Context, in *pb.AddBookRequest) (*pb.AddBookResponse, error) {
	mutation := `
	mutation($title: String!, $author: String!, $isbn: String!, $ownerId: ID!) {
		addBook(title: $title, author: $author, isbn: $isbn, image_url: "", description: "") {
			id
			title
			author
			isbn
			available
			owner {
				id
			}
		}
	}
	`

	variables := map[string]interface{}{
		"title":   in.Title,
		"author":  in.Author,
		"isbn":    in.Isbn,
		"ownerId": in.Owner, // オーナーのID
	}

	data, err := sendGraphQLRequest(mutation, variables)
	if err != nil {
		log.Printf("AddBook failed: %v", err)
		return nil, err
	}

	bookData, ok := data["addBook"].(map[string]interface{})
	if !ok {
		log.Printf("AddBook: invalid data format")
		return nil, fmt.Errorf("invalid data format")
	}

	book := &pb.Book{
		Id:        bookData["id"].(string),
		Title:     bookData["title"].(string),
		Author:    bookData["author"].(string),
		Isbn:      bookData["isbn"].(string),
		Available: bookData["available"].(bool),
		Owner:     bookData["owner"].(map[string]interface{})["id"].(string),
	}

	return &pb.AddBookResponse{Book: book}, nil
}

// RentBook は本をレンタルします。
func (s *server) RentBook(ctx context.Context, in *pb.RentBookRequest) (*pb.RentBookResponse, error) {
	mutation := `
	mutation($bookId: ID!, $userId: ID!) {
		rentBook(bookId: $bookId, userId: $userId) {
			id
			title
			available
		}
	}
	`

	variables := map[string]interface{}{
		"bookId": in.BookId,
		"userId": in.UserId,
	}

	data, err := sendGraphQLRequest(mutation, variables)
	if err != nil {
		log.Printf("RentBook failed: %v", err)
		return nil, err
	}

	bookData, ok := data["rentBook"].(map[string]interface{})
	if !ok {
		log.Printf("RentBook: invalid data format")
		return nil, fmt.Errorf("invalid data format")
	}

	book := &pb.Book{
		Id:        bookData["id"].(string),
		Title:     bookData["title"].(string),
		Available: bookData["available"].(bool),
	}

	return &pb.RentBookResponse{Book: book}, nil
}

// ReturnBook は本を返却します。
func (s *server) ReturnBook(ctx context.Context, in *pb.ReturnBookRequest) (*pb.ReturnBookResponse, error) {
	mutation := `
	mutation($bookId: ID!, $userId: ID!) {
		returnBook(bookId: $bookId, userId: $userId) {
			id
			title
			available
		}
	}
	`

	variables := map[string]interface{}{
		"bookId": in.BookId,
		"userId": in.UserId,
	}

	data, err := sendGraphQLRequest(mutation, variables)
	if err != nil {
		log.Printf("ReturnBook failed: %v", err)
		return nil, err
	}

	bookData, ok := data["returnBook"].(map[string]interface{})
	if !ok {
		log.Printf("ReturnBook: invalid data format")
		return nil, fmt.Errorf("invalid data format")
	}

	book := &pb.Book{
		Id:        bookData["id"].(string),
		Title:     bookData["title"].(string),
		Available: bookData["available"].(bool),
	}

	return &pb.ReturnBookResponse{Book: book}, nil
}

func main() {
	log.Println("Starting gRPC server...")

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("Failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterBookServiceServer(s, &server{})
	log.Printf("gRPC server listening at %v", lis.Addr())

	if err := s.Serve(lis); err != nil {
		log.Fatalf("Failed to serve: %v", err)
	}
}

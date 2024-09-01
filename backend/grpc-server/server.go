package main

import (
	"context"
	"log"
	"net"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
	"google.golang.org/grpc"

	pb "grpc-server/grpc-server/proto"

	"github.com/google/uuid"
)

type server struct {
	pb.UnimplementedBookServiceServer
	db *mongo.Client
}

func (s *server) GetBooks(ctx context.Context, in *pb.GetBooksRequest) (*pb.GetBooksResponse, error) {
	collection := s.db.Database("bookrental").Collection("books")
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	var books []*pb.Book
	if err := cursor.All(ctx, &books); err != nil {
		return nil, err
	}
	return &pb.GetBooksResponse{Books: books}, nil
}

func (s *server) AddBook(ctx context.Context, in *pb.AddBookRequest) (*pb.AddBookResponse, error) {
	collection := s.db.Database("bookrental").Collection("books")
	book := &pb.Book{
		Id:        uuid.New().String(),
		Title:     in.Title,
		Author:    in.Author,
		Isbn:      in.Isbn,
		Available: true,
		Owner:     in.Owner, // クライアントから送られてくる所有者IDを設定
	}
	_, err := collection.InsertOne(ctx, book)
	if err != nil {
		return nil, err
	}
	return &pb.AddBookResponse{Book: book}, nil
}

func (s *server) RentBook(ctx context.Context, in *pb.RentBookRequest) (*pb.RentBookResponse, error) {
	collection := s.db.Database("bookrental").Collection("books")
	filter := bson.M{"id": in.BookId, "available": true}
	update := bson.M{"$set": bson.M{"available": false}}
	book := &pb.Book{}
	err := collection.FindOneAndUpdate(ctx, filter, update).Decode(book)
	if err != nil {
		return nil, err
	}
	return &pb.RentBookResponse{Book: book}, nil
}

func (s *server) ReturnBook(ctx context.Context, in *pb.ReturnBookRequest) (*pb.ReturnBookResponse, error) {
	collection := s.db.Database("bookrental").Collection("books")
	filter := bson.M{"id": in.BookId, "available": false}
	update := bson.M{"$set": bson.M{"available": true}}
	book := &pb.Book{}
	err := collection.FindOneAndUpdate(ctx, filter, update).Decode(book)
	if err != nil {
		return nil, err
	}
	return &pb.ReturnBookResponse{Book: book}, nil
}

func main() {
	client, err := mongo.Connect(context.TODO(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal(err)
	}
	if err := client.Ping(context.TODO(), readpref.Primary()); err != nil {
		log.Fatal(err)
	}

	lis, err := net.Listen("tcp", ":50051")
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}

	s := grpc.NewServer()
	pb.RegisterBookServiceServer(s, &server{db: client})
	log.Printf("server listening at %v", lis.Addr())
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

# Dockerfile
FROM golang:1.16

WORKDIR /app

COPY . .

RUN go get google.golang.org/grpc
RUN go get go.mongodb.org/mongo-driver/mongo
RUN go build -o grpc-server .

CMD ["./grpc-server"]

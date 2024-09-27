# 古いGoバージョンのイメージから最新のGoバージョンに変更
FROM golang:1.23 AS build

WORKDIR /app
COPY . .

# 依存関係の解決とビルド
RUN go mod tidy
RUN go build -o grpc-server .

EXPOSE 50051

CMD ["./grpc-server"]

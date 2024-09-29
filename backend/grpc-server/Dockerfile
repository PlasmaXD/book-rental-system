# ビルドステージ: Goを使ってバイナリをビルド
FROM golang:1.21-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# Goモジュールの依存関係を解決
COPY go.mod go.sum ./
RUN go mod download

# ソースコードをコピー
COPY . .

# gRPCサーバーをビルドして実行可能ファイルを生成
RUN go build -o grpc-server .

# 実行ステージ: 小さな実行環境でアプリを実行
FROM alpine:3.18

# 必要なライブラリをインストール
RUN apk add --no-cache ca-certificates

# 作業ディレクトリを設定
WORKDIR /app

# ビルドステージからバイナリをコピー
COPY --from=builder /app/grpc-server .

# バイナリに実行権限を付与
RUN chmod +x grpc-server

# ポートを公開
EXPOSE 50051

# サーバーを実行
CMD ["./grpc-server"]

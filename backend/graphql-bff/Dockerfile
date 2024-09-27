# Dockerfile for GraphQL BFF
FROM node:16
# 作業ディレクトリを作成
WORKDIR /usr/src/app

# アプリケーションの依存関係をインストール
COPY package*.json ./
RUN npm install

# ソースコードをコピー
COPY . .

# grpc-server の book.proto をコピー
COPY ./proto/book.proto /usr/src/grpc-server/proto/

# アプリケーションのポートを指定
EXPOSE 4000

# アプリケーションの起動コマンド
CMD ["npm", "start"]

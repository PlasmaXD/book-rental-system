### レンタルシステムの技術スタックと概要

#### 技術スタック

1. **フロントエンド**:
   - **React**: ユーザーインターフェースを構築するためのJavaScriptライブラリ。
   - **Chakra UI**: UIコンポーネントライブラリを使用して、レスポンシブでスタイリッシュなデザインを実装。

2. **バックエンド**:
   - **Express**: Node.jsのWebアプリケーションフレームワーク。GraphQL APIを提供。
   - **GraphQL**: クライアントが必要なデータを要求し、特定の形式で返すためのAPIクエリ
   - **MongoDB**: NoSQLデータベース。ユーザー情報や書籍情報の保存に使用。
   -  **gRPC(server.go)**: 書籍のレンタルや返却動作を処理。

3. **認証とセキュリティ**:
   - **JWT (JSON Web Token)**: ユーザーの認証と認可を行うためのトークンベースの認証方式。

<!-- 4. **インフラ**:
   - **Docker**: アプリケーションをコンテナ化し、どこでも実行可能にするためのコンテナ技術。
   - **Kubernetes (AKS)**: Azure Kubernetes Serviceを利用して、コンテナ化されたアプリケーションをスケーラブルにデプロイ、管理。
   - **Azure Container Registry (ACR)**: Dockerイメージをホスティングするためのプライベートレジストリ。
   - **Azure Kubernetes Service (AKS)**: Kubernetesクラスターを管理するためのAzureのマネージドサービス。 -->

#### 概要

このレンタルシステムは、ユーザーが書籍を登録し、他のユーザーから書籍を借りたり返却したりできるWebアプリケーションです。ユーザーは自身が所有する書籍をシステムに登録し、他のユーザーに貸し出すことができます。また、他のユーザーが所有する書籍を借りて読むことも可能です。

- **書籍登録**: ユーザーは書籍のタイトル、著者、ISBN、説明などを入力して書籍をシステムに登録できます。
- **書籍検索と借りる機能**: 登録された書籍を検索し、所有者にリクエストを送って書籍を借りることができます。
- **書籍返却**: 借りた書籍を返却することで、所有者に返すことができます。
- **ユーザー認証**: JWTを使用して、ユーザーのログインと認証を行い、セキュアにアクセスを管理します。



![Untitled diagram-2024-10-20-110529](https://github.com/user-attachments/assets/b0052c83-66dd-4747-9d18-e213ab9731b6)

### プロトコルバッファファイルの再生成

新しいメソッドを追加した後、プロトコルバッファファイルを再生成します。

```sh
protoc --go_out=. --go-grpc_out=. proto/book.proto
```

### 起動方法

#### gRPC サーバー

```sh
cd book-rental-system/backend/grpc-server
go run server.go
```

#### GraphQL サーバー

```sh
cd book-rental-system/backend/graphql-bff
npm start
```

#### React アプリケーション

```sh
cd book-rental-system/frontend
npm start
```


https://github.com/user-attachments/assets/a99a9c22-9a3d-4b52-9af9-d71ab947fc13


![Screenshot from 2024-10-09 02-38-31](https://github.com/user-attachments/assets/cb8e8ce5-0b37-4a9b-b96d-00476ec5c62a)

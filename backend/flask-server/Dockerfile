# ベースイメージ
FROM python:3.9-slim

# 作業ディレクトリを設定
WORKDIR /app

# requirements.txt をコピーして依存パッケージをインストール
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションのコードを全てコピー
COPY . .

# Flaskサーバーを外部アクセス可能にするため、ホストとポートを指定
ENV FLASK_APP=flask_app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_RUN_PORT=5000

# Flaskアプリケーションを実行
CMD ["flask", "run"]

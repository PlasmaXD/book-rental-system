from flask import Flask, jsonify, request
import requests
import os
from flask_cors import CORS  # CORSをインポート

app = Flask(__name__)
CORS(app)

RAKUTEN_API_URL = "https://app.rakuten.co.jp/services/api/BooksTotal/Search/20170404"
RAKUTEN_APP_ID = os.environ.get('RAKUTEN_APP_ID')
@app.route('/api/books', methods=['GET'])
def get_books():
    search_word = request.args.get('search_word', '')
    params = {
        'format': 'json',
        'applicationId': RAKUTEN_APP_ID,
        'keyword': search_word,  # 'title' ではなく 'keyword' を使用
        'booksGenreId': '000',  # 必要に応じてジャンルIDを設定
        'hits': 10,
    }
    
    print(f"Request params: {params}")  # リクエストパラメータを表示
    response = requests.get(RAKUTEN_API_URL, params=params)
    print(f"Response status code: {response.status_code}")  # ステータスコードを表示
    print(f"Response body: {response.text}")  # レスポンスの本文を表示

    if response.status_code == 200:
        data = response.json()
        print(f"Data received from API: {data}")  # ここでAPIから取得したデータを表示
        books = [{
            'title': item['Item']['title'],
            'author': item['Item']['author'],
            'image_url': item['Item']['largeImageUrl'],
            'description': item['Item']['itemCaption'],
        } for item in data['Items']]
        return jsonify(books)
    else:
        return jsonify({'error': f"Failed to fetch books from Rakuten API, Status Code: {response.status_code}, Response: {response.text}"}), 500

if __name__ == '__main__':
    app.run(debug=True)

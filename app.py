from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

# Create the user table if it doesn't exist
conn = sqlite3.connect('user.db')
cursor = conn.cursor()
cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        first_name TEXT,
        last_name TEXT,
        age INTEGER,
        gender TEXT,
        email TEXT,
        phone TEXT,
        birth_date TEXT
    )
''')
conn.commit()
conn.close()

# Endpoint to search for users by first_name
@app.route('/api/users', methods=['GET'])
def search_users():
    first_name = request.args.get('first_name')
    if not first_name:
        return jsonify({'error': 'Missing required query parameter: first_name'}), 400

    conn = sqlite3.connect('user.db')
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE first_name LIKE ?', ('%' + first_name + '%',))
    rows = cursor.fetchall()
    
    if rows:
        return jsonify(rows)
    else:
        # If no users found in the database, call the external API
        # In this example, we'll simulate calling the external API and returning dummy data
        dummy_api_response = [
            # Dummy user data
        ]
        
        # Save the dummy data to the user table
        placeholders = ', '.join(['?' for _ in dummy_api_response[0]])
        insert_query = f"INSERT INTO users (first_name, last_name, age, gender, email, phone, birth_date) VALUES ({placeholders})"
        cursor.executemany(insert_query, dummy_api_response)
        conn.commit()
        conn.close()
        
        return jsonify(dummy_api_response)

if __name__ == '__main__':
    app.run()

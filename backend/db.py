import mysql.connector

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="cv_website"
    )
    if conn.is_connected():
        print("Connection done!!!")
        conn.close()
except mysql.connector.Error as err:
    print(f"Error: {err}")

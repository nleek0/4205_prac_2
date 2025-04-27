import psycopg2
from config import *

class Database:
    def __init__(self):
        try:
            self.conn = psycopg2.connect(
                host = dbhost,
                database = dbname,
                user = dbuser,
                password = dbpassword,
                port = 5432
            )

            self.cur = self.conn.cursor()
        except psycopg2.Error as e:
            print("Unable to connect to the database")
            print(e)
    
    def close(self):
        self.conn.close()
        self.cur.close()

    def test(self):
        self.cur.execute("SELECT * FROM gowcheckins limit 10")
        db_version = self.cur.fetchone()
        print("Database version:", db_version)
    

hi = Database()
hi.test()
hi.close()
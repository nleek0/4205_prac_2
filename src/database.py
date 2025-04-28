import psycopg2
from src.config import *

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
    
    def get_checkins(self, user_id) -> list[tuple]:
        query = """
            SELECT user_id, latitude,longitude FROM gowcheckins
            WHERE user_id = %s
        """

        self.cur.execute(query, (user_id,))
        #self.cur.execute(query)
        rows = self.cur.fetchall()
        return rows
    
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
import psycopg2
from src.config import *
#from config import *

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
            SELECT * FROM gowcheckins
            WHERE user_id = %s
        """

        self.cur.execute(query, (user_id,))
        rows = self.cur.fetchall()
        updated_rows = [(row[0],str(row[1]),row[2],row[3],row[4]) for row in rows]

        return updated_rows
    
    def close(self):
        self.conn.close()
        self.cur.close()

    def get_nn(self, user_id, latitude, longitude):
        query = """
            SELECT *
            FROM (
            SELECT DISTINCT ON (ch.user_id) ch.*,
            ST_SetSRID(ST_MakePoint(%s, %s), 4326) <-> ST_SetSRID(ST_MakePoint(ch.latitude, ch.longitude), 4326) AS dist
            FROM gowedges e
            JOIN gowcheckins ch ON ch.user_id = e.friend_id
            WHERE e.user_id = %s
            ORDER BY ch.user_id, dist
            ) sub
            ORDER BY dist
            LIMIT 10;
        """

        self.cur.execute(query, (latitude,longitude,user_id))
        rows = self.cur.fetchall()
        updated_rows = [(row[0],str(row[1]),row[2],row[3],row[4]) for row in rows]

        return updated_rows

    def test(self):
        self.cur.execute("SELECT * FROM gowcheckins limit 10")
        db_version = self.cur.fetchone()
        print(str(db_version[1]))


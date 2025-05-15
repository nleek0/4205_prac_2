import psycopg2
from fastdtw import fastdtw
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

    def get_dtw(self,user_id):
        friend_checkins = self.__dtw_friend_checkin(user_id)
        coords_list = {}
        for row in friend_checkins:
            user = row[0]
            latitude = row[1]
            longitude = row[2]
            if user in coords_list:
                coords_list[user].append((latitude,longitude))
            else:
                coords_list[user] = [(latitude,longitude)]

        user_checkins = list(self.__dtw_self_checkin(user_id))

        dtw_list = {}
        for key in coords_list:
            dtw_list[key] = fastdtw(user_checkins,coords_list[key],dist = self.__coord_distance)[0]

        closest_friend = sorted(dtw_list, key=lambda k: dtw_list[k])[:10]

        closest_friend_dict = {key:coords_list[key] for key in closest_friend if key in coords_list}
        return closest_friend_dict

    def __dtw_friend_checkin(self, user_id):
        query = """
            SELECT ch.user_id, ch.latitude, ch.longitude
            FROM gowcheckins ch
            JOIN gowedges e ON ch.user_id = e.friend_id
            WHERE e.user_id = %s
            ORDER BY ch.user_id, ch.checkin_time;
        """
        self.cur.execute(query,(user_id,))
        rows = self.cur.fetchall()
        return rows
    
    def __dtw_self_checkin(self,user_id):
        query = """
            SELECT latitude, longitude
            FROM gowcheckins ch
            WHERE user_id = %s
            ORDER BY checkin_time;
        """
        self.cur.execute(query,(user_id,))
        rows = self.cur.fetchall()
        return rows


    def __coord_distance(self,a, b):
        return ((a[0] - b[0])**2 + (a[1] - b[1])**2)**0.5
        #return abs(a[0] - b[0]) + abs(a[1] - b[1])
    
    def get_trajectory(self,user_id):
        query = """
            SELECT latitude, longitude
            FROM gowcheckins
            WHERE user_id = %s
            ORDER BY checkin_time;
        """

        self.cur.execute(query,(user_id,))
        trajectory = self.cur.fetchall()
        return trajectory

    def get_rectangle(self,user_id, lat_max, lat_min, lon_max, lon_min):
        query = """
            SELECT ch.*
            FROM gowcheckins ch
            JOIN gowedges e ON ch.user_id = e.friend_id
            WHERE e.user_id = %s
            AND ch.latitude >= %s AND ch.latitude <= %s
            AND ch.longitude >= %s AND ch.longitude <= %s
            LIMIT 2000;
        """
        self.cur.execute(query, (user_id, lat_min, lat_max, lon_min, lon_max))
        rows = self.cur.fetchall()
        updated_rows = [(row[0],str(row[1]),row[2],row[3],row[4]) for row in rows]
        return updated_rows


    def test(self):
        self.cur.execute("SELECT * FROM gowcheckins limit 10")
        db_version = self.cur.fetchone()
        print(str(db_version[1]))

#db = Database()
#start = time()
#hello = db.get_dtw(0)
#finish = time() - start
#print(finish)
#hi = db.get_trajectory(0)
#print(hi[1])
#hi = db.get_rectangle(0,0,0,0,0)
#print(hi)


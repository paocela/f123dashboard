# SCRIPT USED TO CREATE AUTOMATICALLY INSERT SCRIPT FOR FANTA TABLE #
#####################################################################

num_tracks = 25
num_players = 2

id = 1
for player in range(1, num_players + 1):
    for track in range(1, num_tracks + 1):
        print(f"INSERT INTO \"fanta\" (\"id\", \"fanta_player_id\", \"race_id\", \"1_place_id\", \"2_place_id\", \"3_place_id\", \"4_place_id\", \"5_place_id\", \"6_place_id\", \"fast_lap_id\", \"sprint_id\") VALUES ({id}, {player}, {track}, 0, 0, 0, 0, 0, 0, 0, 0);")
        id = id + 1
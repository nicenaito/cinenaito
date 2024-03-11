import requests
import json
import os

class TMDB:
    def __init__(self, token):
        self.token = token
        self.base_url = "https://api.themoviedb.org/3"

    def _json_by_get_request(self, url, params={}):
        res = requests.get(url, params=params)
        return json.loads(res.text)

    def get_now_playing_movies(self, language=None, region=None, page=1):
        url = f"{self.base_url}/movie/now_playing"
        params = {
            "api_key": self.token,
            "language": language,
            "region": region,
            "page": page
            
        }
        return self._json_by_get_request(url, params)
    
    def upsert_movie(movies):
        print("Hello")
        

if __name__ == "__main__":
    # Set your TMDb API key here
    # api_key = "YOUR_TMDb_API_KEY"
    api_key = os.environ.get("YOUR_TMDb_API_KEY")

    tmdb = TMDB(api_key)
    now_playing_movies = tmdb.get_now_playing_movies(language="ja-JP",region="JP")
    total_pages = now_playing_movies.get("total_pages")
    print(f"Total pages: {total_pages}")
    
    if total_pages == 1:
        for movie in now_playing_movies.get("results", []):
            title = movie.get("title")
            release_date = movie.get("release_date")
            # total_pages = movie.get("total_pages")
            print(f"Title: {title} | Release Date: {release_date}")
    elif total_pages >= 2:
        for i in range(1,total_pages+1):
            now_playing_movies = tmdb.get_now_playing_movies(language="ja-JP",region="JP", page=i)
            for movie in now_playing_movies.get("results", []):
                title = movie.get("title")
                release_date = movie.get("release_date")
                # total_pages = movie.get("total_pages")
                print(f"Title: {title} | Release Date: {release_date}")

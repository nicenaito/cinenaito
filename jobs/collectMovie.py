import os
import click
from flask.cli import with_appcontext
from models.movie import db, Movie
import movielist

@click.command('collect', help="Hello World.")
@with_appcontext
def collect_run():
    api_key = os.environ.get("YOUR_TMDb_API_KEY")
    tmdb = movielist.TMDB(api_key)
    now_playing_movies = tmdb.get_now_playing_movies(language="ja-JP",region="JP")
    print(now_playing_movies)
    
    total_pages = now_playing_movies.get("total_pages")
    print(f"Total pages: {total_pages}")
    
    if total_pages == 1:
        for movie in now_playing_movies.get("results", []):
            title = movie.get("title")
            release_date = movie.get("release_date")
            # total_pages = movie.get("total_pages")
            Movie.add_movie(movie.get("id"), movie.get("title"), movie.get("release_date"), movie.get("poster_path"))
    elif total_pages >= 2:
        for i in range(1,total_pages+1):
            now_playing_movies = tmdb.get_now_playing_movies(language="ja-JP",region="JP", page=i)
            for movie in now_playing_movies.get("results", []):
                title = movie.get("title")
                release_date = movie.get("release_date")
                # total_pages = movie.get("total_pages")
                # print(f"Title: {title} | Release Date: {release_date}")
                Movie.add_movie(movie.get("id"), movie.get("title"), movie.get("release_date"), movie.get("poster_path"))
                
    db.session.commit()

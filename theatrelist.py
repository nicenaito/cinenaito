# coding:utf-8
from flask import jsonify
import requests
import os

def get_nearby_movie_theaters(latitude, longitude, radius=1000):
    """
    Get nearby movie theaters using Foursquare API.

    Args:
        latitude (float): Latitude of the location.
        longitude (float): Longitude of the location.
        radius (int, optional): Search radius in meters (default is 1000 meters).

    Returns:
        list: List of dictionaries containing information about nearby movie theaters.
    """

    CLIENT_ID = os.environ.get("YOUR_FOURSQUARE_CLIENT_ID")
    CLIENT_SECRET = os.environ.get("YOUR_FOURSQUARE_CLIENT_SECRET")
    VERSION = "20240304"  # Specify the version of Foursquare API

    # Construct the API endpoint URL
    url = f"https://api.foursquare.com/v2/venues/search?locale=ja&ll={latitude},{longitude}&radius={radius}&categoryId=4bf58dd8d48988d17f941735&client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&v={VERSION}"

    try:
        response = requests.get(url)
        # SWARMのAPIがエラーレスポンスを返した場合はエラー処理
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch nearby theaters'}), 500

        data = response.json()
        
         # 映画館リストを抽出
        theaters = []
        for venue in data["response"]["venues"]:
            theaters.append({
                'id': venue['id'],
                'name': venue['name'],
                'address': venue.get('location', {}).get('address', ''),
                'latitude': venue['location']['lat'],
                'longitude': venue['location']['lng']
            })

        return jsonify(theaters)
        
    except Exception as e:
        print(f"Error fetching data from Foursquare API: {e}")
        return []

# Example usage
if __name__ == "__main__":
    latitude = 35.6895  # Example latitude (Tokyo)
    longitude = 139.6917  # Example longitude (Tokyo)
    nearby_theaters = get_nearby_movie_theaters(latitude, longitude)

    for theater in nearby_theaters:
        print(f"Name: {theater['name']}")
        # print(f"Address: {theater['location']['address']}")
        # print(f"Distance: {theater['location']['distance']} meters\n")

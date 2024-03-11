"""postgresql.py
"""

SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://{user}:{password}@{host}/{name}'.format(**{
    'user': 'cinenaito',
    'password': 'cinenaito+',
    'host': '127.0.0.1',
    'name': 'cinenaito'
})
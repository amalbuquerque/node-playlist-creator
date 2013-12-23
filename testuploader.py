import requests
from struct import pack
# send two unsigned shorts (16-bits each).
# requests.post('http://localhost:3000/api/upload-spot', data={'name':pack('!HH',1,2)})
requests.post('http://localhost:3000/api/upload-spot', data={'name':pack('!HHHH',1,2,3,4)})

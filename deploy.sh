#!/bin/bash
#
# None of this works due to the keys expiring after 1h. Super dumb. If anyone knows how to fix...!
#

# #curl "https://accounts.google.com/o/oauth2/token" -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET&code=$CODE&grant_type=authorization_code&redirect_uri=urn:ietf:wg:oauth:2.0:oob"

# curl \
# -H "Authorization: Bearer $TOKEN"  \
# -H "x-goog-api-version: 2" \
# -X POST \
# -T $FILE_NAME \
# -v \
# https://www.googleapis.com/upload/chromewebstore/v1.1/items
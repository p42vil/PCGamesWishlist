# USED TO MAKE API REQUESTS
# CURRENTLY ONLY USING 'STEAM API' AND 'IS THERE ANY DEAL API'

import requests
import json
import urllib.parse

import app_list

### REQUESTS (they return dict)
## IS THERE ANY DEAL API
def requestGamesSearch(title): # shows games with names close to the title
    return json.loads(requests.get('https://api.isthereanydeal.com/games/search/v1' 
    + '?key=11de525301e5b53121183c8864f6bbc3a390ebd6'
    + '&title=' + urllib.parse.quote(title)
    + '&results=5').text)

def requestGamesLookup(appid, title): # gets game from itad
    return json.loads(requests.get('https://api.isthereanydeal.com/games/lookup/v1'
    + '?key=11de525301e5b53121183c8864f6bbc3a390ebd6'
    + '&appid=' + appid
    + '&title=' + urllib.parse.quote(title)).text)

def requestGamesInfo(itad_id): # game info
    return json.loads(requests.get('https://api.isthereanydeal.com/games/info/v2'
    + '?key=11de525301e5b53121183c8864f6bbc3a390ebd6'
    + '&id=' + itad_id).text)

def requestGamesOverview(itad_id): # shows prices and other info (needs an id array)
    return json.loads(requests.post('https://api.isthereanydeal.com/games/overview/v2'
    + '?key=11de525301e5b53121183c8864f6bbc3a390ebd6'
    + '&country=' + app_list.getConfig()["country"]
    + '&vouchers=false', json.dumps(itad_id)).text)

def requestGamesPrices(itad_id): # shows prices/deals (needs an id array)
    return json.loads(requests.post('https://api.isthereanydeal.com/games/prices/v2'
    + '?key=11de525301e5b53121183c8864f6bbc3a390ebd6'
    + '&country=' + app_list.getConfig()["country"]
    + '&nondeals=true', json.dumps(itad_id)).text)

## STEAM API
def requestSteamAppdetails(appid): # steam game details
    return json.loads(requests.get('http://store.steampowered.com/api/appdetails?appids=' + appid).text)

def requestSteamGetAppList(): # all steam games (is really slow)
    return json.loads(requests.get('https://api.steampowered.com/ISteamApps/GetAppList/v2/').text)

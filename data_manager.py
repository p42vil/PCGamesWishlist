# USED MANAGE 'app-data.json' AND 'app-data-simplified.txt'
# FUNCTIONS FOR DATA MANAGEMENT 

import json
import time
import os
import eel

import app_list
import requests_api

### FILE MANAGEMENT
def updateDataFile(): # Update files
    # Json file
    dataj = open(app_list.getConfig()["datapath"] + '/data/app_data.json', "w").close() # Cleans file
    dataj = open(app_list.getConfig()["datapath"] + '/data/app_data.json', "a")
    
    # Write a JSON FILE

    dataj.write("[ ")

    for app in app_list.originalAppList:
        if app_list.originalAppList.index(app) > 0:
            dataj.write(',')

        dataj.write(json.dumps(app))
    
    dataj.write(" ]")


# Config data object
class ConfigData:
    def __init__(self, country, datapath, updatetime, updatestartup):
        self.country = country
        self.datapath = datapath
        self.updatetime = updatetime
        self.updatestartup = updatestartup

@eel.expose
def dataConfigUpdate(country, datapath, updatetime, updatestartup):
    dict = ConfigData(country, datapath, updatetime, updatestartup).__dict__

    if dict["country"] == None:
        dict["country"] = app_list.getConfig()["country"]

    if dict["datapath"] == None:
        dict["datapath"] = app_list.getConfig()["datapath"]

    if dict["updatetime"] == None:
        dict["updatetime"] = app_list.getConfig()["updatetime"]

    if dict["updatestartup"] == None:
        dict["updatestartup"] = app_list.getConfig()["updatestartup"]
        

    dataj = open(os.path.dirname(os.path.abspath(__file__)) + '/web/config/config.json', "w").close() # Cleans file
    dataj = open(os.path.dirname(os.path.abspath(__file__)) + '/web/config/config.json', "a")

    str = '{ "country": "' + dict["country"] + '", "datapath": "' + dict["datapath"].replace("\\", "/") + '", "updatetime": "' + dict["updatetime"] + '", "updatestartup": "' + dict["updatestartup"] + '" }'
    dataj.write(str)

    app_list.setConfig(dict)


@eel.expose
def dataAdd(dataDict):
    app_list.addApp(dataDict) # Add data to list
    app_list.updateAppListOrder()

    updateDataFile() # Update json and txt file

@eel.expose
def dataRemove(name):
    app_list.removeApp(name) # Remove data from list
    app_list.updateAppListOrder()

    updateDataFile() # Update json and txt file

@eel.expose
def dataUpdate(index, dataDict):
    app_list.updateApp(index, dataDict) # Remove data from list
    app_list.updateAppListOrder()

    updateDataFile() # Update json and txt file


@eel.expose
def getCountriesJson():
    data = open(os.path.dirname(os.path.abspath(__file__)) + '/web/config/ISO3166-1.alpha2.json', "r")

    return data.read()


### REQUESTS MANAGEMENT
# Main app data object
class AppData:
    def __init__(self, name, current_price, regular_price, lowest_price, type, assets, tags, release_date, developers, publishers, urls, appid, deals, short_description, screenshots, itad_id):
        self.name = name
        self.current_price = current_price
        self.regular_price = regular_price
        self.lowest_price = lowest_price
        self.type = type
        self.assets = assets
        self.tags = tags
        self.release_date = release_date
        self.developers = developers
        self.publishers = publishers
        self.urls = urls
        self.appid = appid
        self.deals = deals
        self.short_description = short_description
        self.screenshots = screenshots
        self.itad_id = itad_id

@eel.expose
def appSearchList(app): # Get search list from ITAD api
    gamelist = []
    searchgamelist = requests_api.requestGamesSearch(app)

    for game in searchgamelist:
        gamelist.append(game)

    return gamelist

@eel.expose
def appInfo(itad_id): # Get app info from ITAD api
    gameinfo = requests_api.requestGamesInfo(itad_id)

    return gameinfo

@eel.expose
def appStores(itad_id): # Get stores from ITAD api
    gameprices = requests_api.requestGamesPrices(itad_id)

    return gameprices

@eel.expose
def appPrices(itad_id): # Get prices from ITAD api
    gamepricesov = requests_api.requestGamesOverview(itad_id)

    return gamepricesov

def appUnreleasedCheck(itad_id): # Checks to see it's an unreleased game (currently not being used)
    gameinfo = requests_api.requestGamesInfo(itad_id)
    present = time.localtime()

    if gameinfo["releaseDate"] == None:
        return True
    else:
        newdate = time.strptime(gameinfo["releaseDate"], "%Y-%m-%d")

        return (False if newdate <= present else True)


# Var to check game specification
specificationOption = None

@eel.expose
def setSpecificationOption(val):
    global specificationOption 
    specificationOption = val

def appSearchSpecific(app):
        # Shows multiple results with close names
        games = appSearchList(app)

        for game in games:
            name = game["title"]
            itad_id = game["id"] # Specific ITAD id
            
            if app.lower().strip() == game["title"].lower():
                return [name, itad_id]
            else:
                while True: # Makes it wait
                    global specificationOption 

                    eel.showAppSpecification(game["title"])() 

                    match specificationOption:
                        case 1:   
                            specificationOption = None
                            eel.cleanAppSpecification()()
                            return [name, itad_id]
                        case 0:
                            specificationOption = None
                            eel.cleanAppSpecification()()
                            print("Be more specific (search for games).")
                            return False
                            
@eel.expose
def appRequestData(app, itad_id = None): # Transform api data into an object and return it
    if (app != None): # If it's a game name
        print(app)

    if (itad_id != None): # If it's an ITAD id
        print(itad_id)
    
    if (app != None):
        #try: # Getting from appid (not being used)
        #   appid = app
        #   
        #   steamappinfo = requests_api.requestSteamAppdetails(appid)
        #   name = steamappinfo[appid]["data"]["name"] # steam game name
        #
        #   # Get ITAD id from steam appid and title
        #   gameinfo = requests_api.requestGamesLookup(appid, name)
        #
        #   itad_id = gameinfo["game"]["id"] # specific ITAD id
        #except:

        try: # Getting from ITAD app name
            specficgame = appSearchSpecific(app)
                
            if specficgame != False:
                name = specficgame[0]
                itad_id = specficgame[1]
            else:
                raise
        except:
            print("\nFailed to get appid or ITAD id from input given.")
            return False

    # Prices
    try:
        # Get store price history from ITAD
        storeprices = requests_api.requestGamesOverview([itad_id])

        regular_price = 0
        current_price = 0
        lowest_price = 0
        
        regular_price = storeprices["prices"][0]["current"]["regular"]["amount"]
        
        if regular_price != 0:
            current_price = storeprices["prices"][0]["current"]["price"]["amount"]

            # Correct price values
            try:
                lowest_price = storeprices["prices"][0]["lowest"]["price"]["amount"]
            except:
                lowest_price = current_price
    except: # No available prices
        current_price = "?"
        regular_price = "?"
        lowest_price = "?"
        
    # Other info
    try:
        # ITAD info
        itadgameinfo = requests_api.requestGamesInfo(itad_id) 

        name = itadgameinfo["title"]
        type = itadgameinfo["type"]
        assets = itadgameinfo["assets"]
        tags = itadgameinfo["tags"]
        developers = itadgameinfo["developers"]
        publishers = itadgameinfo["publishers"]
        urls = itadgameinfo["urls"]
        appid_ = itadgameinfo["appid"]

        # All deals
        try: 
            itadgameprice = requests_api.requestGamesPrices([itad_id])
            deals = []

            for deal in itadgameprice[0]["deals"]:
                deals.append(deal)
        except:
            deals = None

        # Steam info
        try:
            steamappinfo = requests_api.requestSteamAppdetails(str(appid_))
            
            short_description = steamappinfo[str(appid_)]["data"]["short_description"]
            screenshots = steamappinfo[str(appid_)]["data"]["screenshots"]
            release_date = steamappinfo[str(appid_)]["data"]["release_date"]["date"]
        except: # If it's not from Steam
            short_description = "No available description."
            screenshots = None

            try:
                release_date = itadgameinfo["releaseDate"]
            except:
                release_date = None

    except:
        print("\nFailed to get game information.")


    # Return data in object
    return AppData(name, current_price, regular_price, lowest_price, type, assets, tags, release_date, developers, publishers, urls, appid_, deals, short_description, screenshots, itad_id).__dict__

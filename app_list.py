# USED FOR SORTING THE LIST, AND GETTING SPECIFIC INDEXES

import json
import os
import eel
import dateutil.parser as parser

import data_manager

appList = []
originalAppList = []

appListOrder = {
    "name": "null",
    "date": "null",
    "current_price": "null",
    "regular_price": "null",
    "lowest_price": "null",
    "publisher": "null",
    "developer": "null",
}

config = None
    
### DO AT THE START OF PROGRAM ###
def loadAppList():
    configj = open(os.path.dirname(os.path.abspath(__file__)) + '/web/config/config.json', "r")
    json_config = configj.read()

    # Config 
    global config
    try:
        global config

        config = json.loads(json_config)

        if config["country"] == None:
            config["country"] = "US"

        if config["datapath"] == None:
            config["datapath"] = os.path.dirname(os.path.abspath(__file__)) + '/web/'

        if config["updatestartup"] == None:
            config["updatestartup"] = "true"

    except:
        print("Empty config\n")

    configj.close()

    # App list data
    dataj = open(config["datapath"] + '/data/app_data.json', "r")
    json_data = dataj.read()

    try:
        for app in json.loads(json_data):
            appList.append(app)

        global originalAppList
        originalAppList = list(appList)

    except:
        print("Empty list\n")

    dataj.close()


def addApp(dict): # Only admits dicts
    # Checks to see if there isn't any duplicates
    for app in originalAppList:
        if app.get('name').lower().strip() == dict.get('name').lower().strip():
            print("App has already been added.\n")
            return False

    originalAppList.insert(0, dict)
    print("App added successfully.\n")

def removeApp(name): # Remove by name
    for app in originalAppList:
        if app.get('name').lower().strip() == name.lower().strip():
            originalAppList.pop(originalAppList.index(app))
            print("App removed successfully.\n")
            return False
        
    print("App wasn't found in list.\n")

def updateApp(index, dict):
    originalAppList[index] = dict 

    print("App updated.\n")

def updateAppListOrder():
    global appList

    appList = list(originalAppList)

    for order_name, order_value in appListOrder.items():
         if order_value != "null":
            if order_value == "asc":
                reverse_ = False
            elif order_value == "desc":
                reverse_ = True
                
            match (order_name):
                case "name":
                    def f(e): return e.get('name')
                    appList.sort(key=f, reverse=reverse_)
                case "date":
                    def f(e): 
                        try:
                            return parser.parse(e.get('release_date')).day
                        except:
                            return 0.0
                    appList.sort(key=f, reverse=reverse_) # Sort by day

                    def f(e): 
                        try:
                            return parser.parse(e.get('release_date')).month
                        except:
                            return 0.0
                    appList.sort(key=f, reverse=reverse_) # Sort by month

                    def f(e): 
                        try:
                            return parser.parse(e.get('release_date')).year
                        except:
                            return 5000.0
                    appList.sort(key=f, reverse=reverse_) # Sort by year
                case "current_price":
                    def f(e):
                        if e.get('current_price') == "?":
                            return 0.0
                        return e.get('current_price')
                    appList.sort(key=f, reverse=reverse_)
                case "regular_price":
                    def f(e):
                        if e.get('regular_price') == "?":
                            return 0.0
                        return e.get('regular_price')
                    appList.sort(key=f, reverse=reverse_)
                case "lowest_price":
                    def f(e):
                        if e.get('lowest_price') == "?":
                            return 0.0
                        return e.get('lowest_price')
                    appList.sort(key=f, reverse=reverse_)
                case "publisher":
                    def f(e): 
                        names = []
                        for val in e.get('publishers'):
                            names.append(val.get('name'))
                        return names
                    appList.sort(key=f, reverse=reverse_)
                case "developer":
                    def f(e): 
                        names = []
                        for val in e.get('developers'):
                            names.append(val.get('name'))
                        return names
                    appList.sort(key=f, reverse=reverse_)

@eel.expose
def orderAppListOption(option):
    if appListOrder[option] == "asc":
        appListOrder[option] = "desc"
        updateAppListOrder()
    elif appListOrder[option] == "desc":
        appListOrder[option] = "null"
        updateAppListOrder()
    elif appListOrder[option] == "null":
        appListOrder[option] = "asc"
        updateAppListOrder()

@eel.expose
def getConfig():  
    global config
   
    return config

@eel.expose
def setConfig(dict):
    global config

    config = dict

@eel.expose
def getAppList():
    return appList

@eel.expose
def getOriginalAppList():
    return originalAppList

@eel.expose
def getAppListOrder():
    return appListOrder

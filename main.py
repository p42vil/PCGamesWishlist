import eel

import requests_api
import app_list
import data_manager
import view

######### OBLIGATORY #########
app_list.loadAppList()
##############################

# Start eel
eel.init('web')
eel.start('index.html', size=(1000, 1600)) 
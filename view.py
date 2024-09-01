# FOR PYTHON RELATED VIEW FUNCTIONS

from tkinter import filedialog
from tkinter import *

import eel
import os
import shutil

import app_list

@eel.expose
def folderSelection(): # Opens folder selection, returns folder path
    root = Tk()
    root.iconbitmap(os.path.dirname(os.path.abspath(__file__)) + '/web/img/logo.ico') # Setting up icon image
    root.withdraw()

    folder_selected = filedialog.askdirectory()

    if len(folder_selected) > 0: # If a folder is selected
        filename_json = folder_selected + '/data/app_data.json'
        filename_simple = folder_selected + '/data/app_data_simplified.txt'

        dataj = open(app_list.getConfig()["datapath"] + '/data/app_data.json', "r")
        json_data = dataj.read()

        datas = open(app_list.getConfig()["datapath"] + '/data/app_data_simplified.txt', "r")
        simple_data = datas.read()

        # Rewrite info in new folder
        os.makedirs(os.path.dirname(filename_json), exist_ok=True) 
        with open(filename_json, "w") as f:
            f.write(json_data)

        dataj.close()

        os.makedirs(os.path.dirname(filename_simple), exist_ok=True)
        with open(filename_simple, "w") as f:
            f.write(simple_data)

        datas.close()

        shutil.rmtree(app_list.getConfig()["datapath"] + '/data') # Delete previously used folder

    return folder_selected

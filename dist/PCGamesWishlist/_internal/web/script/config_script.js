
/// CONFIG ///

// Show current country abbreviation and update time
function updateConfigShow(){
    configdata = eel.getConfig()()

    configdata.then(function(result){
        $("#country").html("")
        $("#updatetime").html("")

        if (result.country != null){
            const p_country = document.createElement("p")
            p_country.classList.add("text-muted")
            p_country.textContent = `${result.country}`
            $("#country").append(p_country)
        }

        if (result.updatetime != 0){
            const p_time = document.createElement("p")
            p_time.classList.add("text-muted")
            p_time.textContent = `Last updated: ${result.updatetime}`
            $("#updatetime").append(p_time)
        }
    })
}

// Show all countries on configuration tab
async function showCountries(){
    // All countries
    countriesj = eel.getCountriesJson()()

    await countriesj.then(async function(result){
        configj = eel.getConfig()()

        await configj.then(function(config) {
            Object.entries(JSON.parse(result)).forEach(function([key, val]){
                const option_country = document.createElement("option")
                option_country.value = `${key}`
                option_country.textContent = `${val}`
                $("#formCountry").append(option_country)

                if (key == config.country){ // If it's the selected country
                    option_country.selected = true
                }
            }) 
        })
    })

    $('#formCountry').on("mouseup", function() { // If a country is selected
        eel.dataConfigUpdate($('#formCountry').val(), null, null, null)()
        updateConfigShow()
    })    
}

// Show data file path on configuration tab
async function showDatapath(){
    configj = eel.getConfig()()

    await configj.then(function(config) { // Show current path
        $("#formFilePath").text(config.datapath)
    })

    $("#formFile").on("click", function() { // If the path button is clicked
        folder = eel.folderSelection()()

        folder.then(function(result){
            if (result.length > 0){
                $("#formFilePath").text(result)
                eel.dataConfigUpdate(null, result, null, null)()
            }
        })
    })    
}

// Show update on startup option on configuration tab
async function showUpdateStartup(){
    configj = eel.getConfig()()

    await configj.then(function(config) { // Set to current value
        $("#formUpdate").attr("checked", JSON.parse(config.updatestartup))

        if (config.updatestartup == "true"){ 
            updateList(document.getElementById("updatebutton"))
        }       
    })

    $("#formUpdate").on("input", function() { // If state changes
        eel.dataConfigUpdate(null, null, null, `${$("#formUpdate").prop("checked")}`)()
    })
}

// Set configs
updateConfigShow()
showCountries()
showDatapath()
showUpdateStartup()

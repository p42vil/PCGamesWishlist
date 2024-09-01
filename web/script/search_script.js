
/// SEARCH ///

// Search list results
async function updateSearchList(){
    //Checks to see if it should be cancelled or not
    elem = document.getElementById("searchInput")

    $("#searchList").html("")
    const ul_list = document.createElement("ul")
    ul_list.classList.add("list-group", "list-group-flush")
    ul_list.id = "resultList"
    $("#searchList").append(ul_list)
    
    var list_apps = eel.getAppList()() // App list
    var list = eel.appSearchList(elem.value)() // ITAD search request

    var list_apps_name = [] // App list names
    var list_apps_id = []   // App search id
    var list_apps_info = [] // App search info
    
    // Registers all app names (maybe when it first runs the program, already have it registered)
    await list_apps.then(function(result_app){
        result_app.forEach(function(appl){
            list_apps_name.push(appl.name)
        })
    })

    // Adds list item layout and main info
    await list.then(function(result){
        result.forEach(async function(app){
            if (!list_apps_name.includes(app.title)){ // Checks if it already exists
                const li_app = document.createElement("li")
                li_app.classList.add("list-group-item", "searchItem")
                li_app.id = `${app.id}`
                li_app.setAttribute("onclick", `addApp('${app.title.replace(/(['"])/g, "\\$1")}')`) // Make text with ' compatible
                ul_list.append(li_app)

                const div_content = document.createElement("div")
                div_content.classList.add("d-flex", "align-items-center")
                div_content.style.minHeight = "45px"
                li_app.append(div_content)

                const img_cover = document.createElement("img")
                div_content.append(img_cover)

                const div_name = document.createElement("div")
                div_name.classList.add("name")
                div_name.textContent = `${app.title}`
                div_content.append(div_name)

                const div_date = document.createElement("div")
                div_date.classList.add("me-auto", "px-2", "date")
                div_content.append(div_date)

                const span_type = document.createElement("span")
                div_content.append(span_type)

                const div_prices = document.createElement("div")
                div_prices.classList.add("prices")
                div_content.append(div_prices)

                const div_stores = document.createElement("div")
                div_stores.classList.add("stores")
                div_content.append(div_stores)

                const div_dropdown = document.createElement("div")
                div_dropdown.classList.add("dropdown-center")
                div_stores.append(div_dropdown)

                const i_dropdown = document.createElement("i")
                i_dropdown.classList.add("fa-solid", "fa-store", "fa-lg", "me-4", "storeDropdown")
                i_dropdown.setAttribute("data-bs-toggle", "dropdown")
                i_dropdown.setAttribute("aria-expanded", "false")
                div_dropdown.append(i_dropdown)

                const ul_dropdown = document.createElement("ul")
                ul_dropdown.classList.add("dropdown-menu", "mt-3")
                div_dropdown.append(ul_dropdown)

                var list_info = eel.appInfo(app.id)()

                list_apps_id.push(app.id)
                list_apps_info.push(list_info)
            }
        })
    })

    // Adds more game info
    list_apps_info.forEach(async function(result){
        await result.then(function(app){ 
            var date = new Date(app.releaseDate)

            Array.from(document.getElementsByClassName("searchItem")).forEach(function(elem){
                last_elem = $(elem).find('div')

                if ($(last_elem).find('.name').text() == app.title){
                    $(last_elem).find('.name').addClass("ms-3") // Name

                    $(last_elem).find('img').addClass("border m-0") // Image
                    $(last_elem).find('img').attr("src", `${app.assets.banner145}`)
                    $(last_elem).find('img').attr("width", "90px")

                    if (app.type != null){ // Type
                        $(last_elem).find('span').addClass("badge rounded-pill text-bg-primary me-3") 
                        $(last_elem).find('span').text(`${app.type.toUpperCase()}`)
                    }

                    // Date
                    if ((app.releaseDate != null) && (!(isNaN(date)))){ // Checks if release date is a date
                        $(last_elem).find('.date').text(`(${date.getFullYear()})`) 
                    }

                    const li_dropdownitad = document.createElement("li") // Store ITAD link
                    $(last_elem).find('ul').append(li_dropdownitad)

                    const a_linkitad = document.createElement("a")
                    a_linkitad.classList.add("dropdown-item")
                    a_linkitad.href = `${app.urls.game}`
                    a_linkitad.setAttribute("target", "_blank")
                    a_linkitad.textContent = "Is There Any Deal"
                    li_dropdownitad.append(a_linkitad)  

                    if (app.appid != null){
                        const li_dropdownsteam = document.createElement("li") // Store Steam link
                        $(last_elem).find('ul').append(li_dropdownsteam)

                        const a_linksteam = document.createElement("a")
                        a_linksteam.classList.add("dropdown-item")
                        a_linksteam.href = `https://store.steampowered.com/app/${app.appid}`
                        a_linksteam.setAttribute("target", "_blank")
                        a_linksteam.textContent = "Steam"
                        li_dropdownsteam.append(a_linksteam)  
                    }
                }
            })
            
        })
    })

    // Adds shop links
    var list_stores = eel.appStores(list_apps_id)()

    await list_stores.then(function(result){ 
        result.forEach(function(deal){
            deal.deals.forEach(function(inddeal){
                var elem = $("#" + deal.id)

                if (elem != null || elem != undefined){
                    if (inddeal.shop.name != "Steam"){
                        // Store links
                        const li_dropdown = document.createElement("li")
                        $(elem).find('ul').append(li_dropdown)

                        const a_link = document.createElement("a")
                        a_link.classList.add("dropdown-item")
                        a_link.href = `${inddeal.url}`
                        a_link.setAttribute("target", "_blank")
                        a_link.textContent = `${inddeal.shop.name}`
                        li_dropdown.append(a_link)
                    }
                }    
            })
        })
    })

    // Add prices
    var list_prices = eel.appPrices(list_apps_id)()

    await list_prices.then(function(result){ 
        result.prices.forEach(function(price){
            if (price != undefined){
                var elem = $("#" + price.id)

                if (elem != null || elem != undefined){
                    // Prices
                    const div_prices = document.createElement("div")
                    div_prices.classList.add("d-flex")
                    div_prices.style.width = "190px"
                    $(elem).find('.prices').append(div_prices)
            
                    // Current price
                    const div_currentprice = document.createElement("div")
                    div_currentprice.classList.add("text-center", "me-3")
                    div_prices.append(div_currentprice)

                    const p_currentpricetitle = document.createElement("p")
                    p_currentpricetitle.style.fontSize = "14px"
                    p_currentpricetitle.classList.add("m-0", "text-center")
                    p_currentpricetitle.textContent = "Current price"
                    div_currentprice.append(p_currentpricetitle)

                    const p_currentprice = document.createElement("p")
                    p_currentprice.classList.add("m-0")
                    div_currentprice.append(p_currentprice)

                    // Lowest price
                    const div_lowestprice = document.createElement("div")
                    div_lowestprice.classList.add("text-center", "me-3")
                    div_prices.append(div_lowestprice)

                    const p_lowestpricetitle = document.createElement("p")
                    p_lowestpricetitle.style.fontSize = "14px"
                    p_lowestpricetitle.classList.add("m-0", "text-center")
                    p_lowestpricetitle.textContent = "Lowest price"
                    div_lowestprice.append(p_lowestpricetitle)

                    const p_lowestprice = document.createElement("p")
                    p_lowestprice.classList.add("m-0")
                    div_lowestprice.append(p_lowestprice)

                    if (price.lowest != null){
                        if (price.lowest.price.amount > price.current.price.amount){
                            p_currentprice.textContent += `${price.current.price.amount}`
                            p_lowestprice.textContent += `${price.current.price.amount}`
                        }
                        else{
                            p_currentprice.textContent += `${price.current.price.amount}`
                            p_lowestprice.textContent += `${price.lowest.price.amount}`
                        }
                    }
                    else{
                        p_currentprice.textContent += `${price.current.price.amount}`
                        p_lowestprice.textContent += `${price.current.price.amount}`
                    }
                } 
            }
        })
    })
}

// Show specification message
eel.expose(showAppSpecification)
function showAppSpecification(text){ 
    $("#searchList").html("") // Clean HTML
    $("#searchResult").html("")

    if (document.getElementById("yes") == null){
        const div_message = document.createElement("div")
        div_message.classList.add("d-flex", "align-items-center")
        $("#searchResult").append(div_message)

        const p_game = document.createElement("p")
        p_game.classList.add("p-2", "mt-3")
        p_game.textContent = `Do you mean ${text}?`
        div_message.append(p_game)

        const button_yes = document.createElement("button")
        button_yes.classList.add("btn", "btn-success", "btn-block", "px-3", "ms-3", "border")
        button_yes.type = "button"
        button_yes.id = 'yes'
        button_yes.textContent = `YES`
        p_game.append(button_yes)

        const button_no = document.createElement("button")
        button_no.classList.add("btn", "btn-danger", "btn-block", "px-3", "ms-3")
        button_no.type = "button"
        button_no.id = 'no'
        button_no.textContent = `NO`
        p_game.append(button_no)
    
        // Check to see if YES or NO was clicked
        button_yes.addEventListener("mouseup", (e) => {
            eel.setSpecificationOption(1)
        })

        button_no.addEventListener("mouseup", (e) => {
            eel.setSpecificationOption(0)
        })
    }
}

eel.expose(cleanAppSpecification)
function cleanAppSpecification(){
    $("#searchResult").html("")
    const p = document.createElement("p")
    $("#searchResult").append(p)
    p.className = "text-warning p-2"
    p.textContent = `ADDING APP...`
}

// Add app to list
async function addApp(title){
    // Checks to see if it's not hovering the stores button
    var store_btn = document.getElementsByClassName("stores")
    var hover = false

    for (const btn of store_btn) {
        if (btn.matches(':hover')){
            hover = true
        }
    }

    if (hover) { return false }
    
    //Add and show result message
    $("#searchResult").html("")
    const p = document.createElement("p")
    $("#searchResult").append(p)

    try{
        p.className = "text-warning p-2"
        p.textContent = `ADDING APP...`

        dict = eel.appRequestData(title)()

        await dict.then(function(result){
            if (result == false){
                throw new Error("Request result is false");
            }

            eel.dataAdd(result)()
            clearFilter()
        })
                
        // 'p' is deleted during specification
        // Making it compatible
        $("#searchResult p").attr("class", "text-success p-2")
        $("#searchResult p").text("APP ADDED")
    }
    catch{
        $("#searchResult p").attr("class", "text-danger p-2")
        $("#searchResult p").text("FAILED TO ADD APP")
    }
}

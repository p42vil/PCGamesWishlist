
// FILTERS //

filter_ = null // Registered filter

class filter {
    constructor(stores, tags, publishers, developers, released, notreleased, minyear, maxyear, minprice, maxprice, pricetype, noreleasedate) {
        this.stores = stores
        this.tags = tags
        this.publishers = publishers
        this.developers = developers
        this.released = released
        this.notreleased = notreleased
        this.minyear = minyear
        this.maxyear = maxyear
        this.minprice = minprice
        this.maxprice = maxprice
        this.pricetype = pricetype
        this.noreleasedate = noreleasedate
    }
}

// Set filter list based on selected fields
function filterList(){ 
    stores = []
    tags = []
    publishers = []
    developers = []
    released = null
    notreleased = null
    minyear = null
    maxyear = null
    minprice = null
    maxprice = null
    pricetype = null
    noreleasedate = null

    $("#filterStore").select2('val').forEach(function(val){ stores.push(val) })

    $("#filterTag").select2('val').forEach(function(val){ tags.push(val) })

    $("#filterPublisher").select2('val').forEach(function(val){ publishers.push(val) })

    $("#filterDeveloper").select2('val').forEach(function(val){ developers.push(val) })
    
    released = $("#checkReleased").prop("checked")
    notreleased = $("#checkNotReleased").prop("checked")
    noreleasedate = $("#checkNoReleaseDate").prop("checked")

    minyear = $("#rangeYearMin").val()
    maxyear = $("#rangeYearMax").val()
    minprice = $("#rangePriceMin").val()
    maxprice = $("#rangePriceMax").val()

    pricetype = $("#radioPrice input[type='radio']:checked").val()

    filter_ = new filter(stores, tags, publishers, developers, released, notreleased, minyear, maxyear, minprice, maxprice, pricetype, noreleasedate)

    run()
}

// Clear filters
function clearFilter(){
    if (filter_ != null){
        $("#filterStore").html("")
        $("#filterTag").html("")
        $("#filterPublisher").html("")
        $("#filterDeveloper").html("")

        $("#checkReleased").prop("checked", true)
        $("#checkNotReleased").prop("checked", true)
        $("#checkNoReleaseDate").prop("checked", true)

        $("#rangeYearMin").val($("#rangeYearMin").attr("min"))
        $("#rangeYearMax").val($("#rangeYearMax").attr("max"))
        $("#rangePriceMin").val("")
        $("#rangePriceMax").val("")

        $("#radioCurrent").prop("checked", true)
        $("#rangePriceMinLabel").text("Min. current price: ")
        $("#rangePriceMaxLabel").text("Max. current price: ")

        $("#clear").attr("hidden", true)

        run()

        filter_ = null
    }
    else{
        run()
    }
}

// Order list and update item
async function orderList(elem, val){
    try{
        // Update app list file and HTML list
        await eel.orderAppListOption(val)
        run()

        // Order list
        order_dict = await eel.getAppListOrder()()

        // Update icons
        if (val == 'name' || val == 'publisher' || val == 'developer'){
            if (order_dict[val] == "asc"){
                elem.getElementsByTagName("i")[0].className = "fa-solid fa-arrow-down-a-z"
            }
            else if (order_dict[val] == "desc"){
                elem.getElementsByTagName("i")[0].className = "fa-solid fa-arrow-up-z-a"
            }
        }
        else{
            if (order_dict[val] == "asc"){
                elem.getElementsByTagName("i")[0].className = "fa-solid fa-arrow-down-1-9"
            }
            else if (order_dict[val] == "desc"){
                elem.getElementsByTagName("i")[0].className = "fa-solid fa-arrow-up-9-1"
            }
        }

        if (order_dict[val] == "null"){
            elem.getElementsByTagName("i")[0].className = ""
        }
    }
    catch{
        console.log("Failed to order list")
    }
}


/// GAMES LIST ///

// Show app list and their respective info
eel.expose(run)
async function run(){
    // Filter vars
    var store_filters = []
    var tag_filters = []
    var publisher_filters = []
    var developer_filters = []
    var year_min = null
    var year_max = null

    var obj = eel.getAppList()() // Get apps
    var prevapps = []

    // Get previous apps
    $("#apps .name").each(function() {
        prevapps.push($(this).text())
    })

    if (filter_ == null){
        // Check to see if there's a different app
        var index = null

        if ($("#apps").text().length != 0){
            await obj.then(function(result){
                result.forEach(function(app, pos){
                    if (prevapps.indexOf(app.name) == -1){
                        index = pos
                        return false
                    }
                })
            })
        }
    }

    // Create list
    const ul_list = document.createElement("ul")
    ul_list.classList.add("list-group", "list-group-flush")
    
    await obj.then(function(result){
        $("#apps").html("") // Clean HTML

        result.forEach(function(app, pos){
            delete_ = false // If true, delete current list item

            if (filter_ != null){
                // Compare stores with store filters
                storenames = []

                if (filter_.stores.length > 0){
                    if (app.deals != undefined || app.deals != null){
                        Object.entries(app.deals).forEach(function([key, value]){
                            storenames.push(value["shop"]["name"])
                        })

                        filter_.stores.forEach(function(store){
                            if (!(storenames.includes(store))){
                                delete_ = true
                            }
                        })
                    }
                    else{
                        delete_ = true
                    }
                }   
               
                // Compare tags with tag filters
                if (filter_.tags.length > 0){
                    filter_.tags.forEach(function(tag){
                        if (!(app.tags.includes(tag))){
                            delete_ = true
                        }
                    })
                }

                // Compare publishers with publisher filters
                publishernames = []

                if (filter_.publishers.length > 0){
                    Object.entries(app.publishers).forEach(function([key, value]){
                        publishernames.push(value["name"])
                    })

                    filter_.publishers.forEach(function(publisher){
                        if (!(publishernames.includes(publisher))){
                            delete_ = true
                        }
                    })
                }

                // Compare developers with developer filters
                developernames = []

                if (filter_.developers.length > 0){
                    Object.entries(app.developers).forEach(function([key, value]){
                        developernames.push(value["name"])
                    })

                    filter_.developers.forEach(function(developer){
                        if (!(developernames.includes(developer))){
                            delete_ = true
                        }
                    })
                }

                // Compare dates with date filters
                var currentDate = new Date()

                if (app.release_date.date != undefined){
                    d = new Date(app.release_date.date)
                }
                else{
                    d = new Date(app.release_date)
                }

                // Released or not released
                if (filter_.released == true && filter_.notreleased == false){
                    if (isNaN(d.getTime())){
                        delete_ = true
                    }
                    else{
                        if (currentDate.getTime() < d.getTime()){
                            delete_ = true
                        }
                    }
                }
                else if (filter_.released == false && filter_.notreleased == true){    
                    if (!(isNaN(d.getTime()))){    
                        if (currentDate.getTime() >= d.getTime()){
                            delete_ = true
                        }
                    }
                }
                else if (filter_.released == false && filter_.notreleased == false){
                    delete_ = true
                }

                // Compare year with year range filter
                if (!(filter_.minyear <= d.getFullYear() && filter_.maxyear >= d.getFullYear())){
                    if (!(filter_.noreleasedate == true && isNaN(d.getTime()))){
                        delete_ = true
                    }
                }

                // Compare price with price range filter
                if (filter_.minprice != "" && filter_.maxprice != ""){
                    if (filter_.pricetype == "current"){
                        if (!(filter_.minprice <= app.current_price && filter_.maxprice >= app.current_price)){
                            delete_ = true
                        }
                    }
                    else if (filter_.pricetype == "regular"){
                        if (!(filter_.minprice <= app.regular_price && filter_.maxprice >= app.regular_price)){
                            delete_ = true
                        }
                    }
                    else if (filter_.pricetype == "lowest"){
                        if (!(filter_.minprice <= app.lowest_price && filter_.maxprice >= app.lowest_price)){
                            delete_ = true
                        }
                    }
                }
            }

            //Create list items
            const li_app = document.createElement("li")
            li_app.classList.add("list-group-item")
            li_app.setAttribute("onclick", "expandAppItem(this)");
            li_app.id = app.itad_id
            ul_list.append(li_app)

            // Upper info
            const div_content = document.createElement("div")
            div_content.classList.add("d-flex", "align-items-center")
            li_app.append(div_content)

            if (index == pos){ // Add class if app didn't exist before
                li_app.classList.add("added")
            }

            const i_update = document.createElement("i")
            i_update.classList.add("update-icon")
            div_content.append(i_update)

            if (app.assets != undefined && app.assets != null){ // Image
                const img_cover = document.createElement("img")
                img_cover.classList.add("border", "m-0")
                img_cover.style.width = "120px"
                img_cover.src = `${app.assets.banner145}`
                div_content.append(img_cover)
            }

            if (app.name != undefined && app.name != null){ // Name
                const div_name = document.createElement("div")
                div_name.classList.add("me-auto", "ms-3", "name")
                div_name.textContent = `${app.name}`
                div_content.append(div_name)
            }

            if (app.type != undefined && app.type != null){ // Type
                const span_type = document.createElement("span")
                span_type.classList.add("badge", "rounded-pill")
                span_type.textContent = `${app.type.toUpperCase()}`
                div_content.append(span_type)
                
                if (app.type == "game"){
                    span_type.classList.add("text-bg-primary")
                }
                else if (app.type == "dlc"){
                    span_type.classList.add("text-bg-info")
                }
                else if (app.type == "package"){
                    span_type.classList.add("text-bg-warning")
                }
            }
            

            // Register lowest deal store
            var lowest_deal_store = ""
            var lowest_deal_value = null

            if (app.deals != undefined && app.deals != null){
                Object.entries(app.deals).forEach(function([key, value]){
                    if (value["regular"]["amount"] != 0){
                        if (lowest_deal_value == null){
                            lowest_deal_store = value["shop"]["name"]
                            lowest_deal_value = value["storeLow"]["amount"]
                        }

                        if (value["storeLow"]["amount"] < lowest_deal_value){
                            lowest_deal_store = value["shop"]["name"]
                            lowest_deal_value = value["storeLow"]["amount"]
                        }
                    }
                })
            }

            // Main prices
            const div_mainprices = document.createElement("div")
            div_mainprices.classList.add("d-flex", "align-items-center")
            div_content.append(div_mainprices)

            // Current price
            const div_currentprice = document.createElement("div")
            div_currentprice.classList.add("px-2", "price", "text-center")
            div_currentprice.textContent = `${app.current_price}`
            div_mainprices.append(div_currentprice) 

            // Regular price
            const div_regularprice = document.createElement("div")
            div_regularprice.classList.add("px-2", "price", "text-center")
            div_regularprice.textContent = `${app.regular_price}`
            div_mainprices.append(div_regularprice)

            // Lowest price
            const div_lowestpricebox = document.createElement("div")
            div_lowestpricebox.classList.add("px-2", "price", "text-center")
            div_lowestpricebox.style.position = "relative"
            div_mainprices.append(div_lowestpricebox)

            const div_lowestprice = document.createElement("div")
            div_lowestprice.textContent = `${app.lowest_price}`
            div_lowestpricebox.append(div_lowestprice)

            const div_loweststore = document.createElement("div")
            div_loweststore.style.position = "absolute"
            div_loweststore.style.width = "100%"
            div_loweststore.style.bottom = "10%"
            div_lowestpricebox.append(div_loweststore)

            const small_loweststore = document.createElement("small")
            div_loweststore.append(small_loweststore)

            const p_loweststore = document.createElement("p")
            p_loweststore.classList.add("text-center", "text-secondary", "me-3", "lowest-store", "text-truncate")
            p_loweststore.textContent = `${lowest_deal_store}`
            small_loweststore.append(p_loweststore)


            // Store dropdown
            const div_dropdown = document.createElement("div")
            div_dropdown.classList.add("dropdown-center")
            div_mainprices.append(div_dropdown)

            const i_dropdown = document.createElement("i")
            i_dropdown.classList.add("fa-solid", "fa-store", "fa-lg", "me-4", "storeDropdown")
            i_dropdown.setAttribute("data-bs-toggle", "dropdown")
            i_dropdown.setAttribute("aria-expanded", "false")
            div_dropdown.append(i_dropdown)

            const ul_dropdown = document.createElement("ul")
            ul_dropdown.classList.add("dropdown-menu", "mt-3")
            div_dropdown.append(ul_dropdown)

            // ITAD link
            if (app.urls != undefined && app.urls != null){
                const li_dropdownitad = document.createElement("li")
                ul_dropdown.append(li_dropdownitad)

                const a_linkitad = document.createElement("a")
                a_linkitad.classList.add("dropdown-item")
                a_linkitad.href = `${app.urls.game}`
                a_linkitad.setAttribute("target", "_blank")
                a_linkitad.textContent = "Is There Any Deal"
                li_dropdownitad.append(a_linkitad)
            }

            // Steam link
            if (app.appid != undefined && app.appid != null){
                const li_dropdownitad = document.createElement("li")
                ul_dropdown.append(li_dropdownitad)

                const a_linkitad = document.createElement("a")
                a_linkitad.classList.add("dropdown-item")
                a_linkitad.href = `https://store.steampowered.com/app/${app.appid}`
                a_linkitad.setAttribute("target", "_blank")
                a_linkitad.textContent = "Steam"
                li_dropdownitad.append(a_linkitad)
            }
                   
            // Store links
            if (app.deals != undefined && app.deals != null){
                Object.entries(app.deals).forEach(function([key, value]){
                    if (!store_filters.includes(value["shop"]["name"])){ // Stores available
                        store_filters.push(value["shop"]["name"])
                    }
                    
                    if (value["shop"]["name"] != "Steam"){
                        const li_dropdown = document.createElement("li")
                        ul_dropdown.append(li_dropdown)

                        const a_link = document.createElement("a")
                        a_link.classList.add("dropdown-item")
                        a_link.href = `${value["url"]}`
                        a_link.setAttribute("target", "_blank")
                        a_link.textContent = `${value["shop"]["name"]}`
                        li_dropdown.append(a_link)
                    }
                })
            }

            
            // Remove app
            const i_remove = document.createElement("i")
            i_remove.classList.add("fa-regular", "fa-circle-xmark", "fa-lg", "removeDropdown")
            i_remove.style.color = "#ff0000"
            i_remove.setAttribute("onclick", `removeApp('${app.name.replace(/(['"])/g, "\\$1")}')`)
            div_mainprices.append(i_remove)
              
            
            // Lower info
            const div_gameinfo = document.createElement("div")
            div_gameinfo.classList.add("gameInfo", "d-flex")
            li_app.append(div_gameinfo)

            // Left info
            const div_leftinfo = document.createElement("div")
            div_gameinfo.append(div_leftinfo)
 
            if (app.screenshots != undefined && app.screenshots != null){ // App screenshots
                const div_carousel = document.createElement("div")
                div_carousel.id = `carousel${pos}`
                div_carousel.classList.add("carousel", "slide", "mt-3", "mb-2", "border")
                div_carousel.style.width = "290px"
                div_leftinfo.append(div_carousel)

                const div_carouselinner = document.createElement("div")
                div_carouselinner.classList.add("carousel-inner")
                div_carousel.append(div_carouselinner)

                Object.entries(app.screenshots).forEach(function([key, value]){
                    const div_carouselitem = document.createElement("div")
                    div_carouselitem.classList.add("carousel-item")
                    div_carouselinner.append(div_carouselitem)

                    const img_carousel = document.createElement("img")
                    img_carousel.classList.add("d-block", "w-100")
                    img_carousel.src = `${value["path_thumbnail"]}`
                    div_carouselitem.append(img_carousel)

                    if (value["id"] == "1"){
                        div_carouselitem.classList.add("active")
                    }
                })

                const button_carouselprev = document.createElement("button")
                button_carouselprev.classList.add("carousel-control-prev")
                button_carouselprev.type = "button"
                button_carouselprev.setAttribute("data-bs-target", `#carousel${pos}`)
                button_carouselprev.setAttribute("data-bs-slide", "prev")
                div_carouselinner.append(button_carouselprev)

                const span_controlprev = document.createElement("span")
                span_controlprev.classList.add("carousel-control-prev-icon")
                span_controlprev.setAttribute("aria-hidden", "true")
                button_carouselprev.append(span_controlprev)

                const span_prev = document.createElement("span")
                span_prev.classList.add("visually-hidden")
                span_prev.textContent = "Previous"
                button_carouselprev.append(span_prev)

                const button_carouselnext = document.createElement("button")
                button_carouselnext.classList.add("carousel-control-next")
                button_carouselnext.type = "button"
                button_carouselnext.setAttribute("data-bs-target", `#carousel${pos}`)
                button_carouselnext.setAttribute("data-bs-slide", "next")
                div_carouselinner.append(button_carouselnext)

                const span_controlnext = document.createElement("span")
                span_controlnext.classList.add("carousel-control-next-icon")
                span_controlnext.setAttribute("aria-hidden", "true")
                button_carouselnext.append(span_controlnext)

                const span_next = document.createElement("span")
                span_next.classList.add("visually-hidden")
                span_next.textContent = "Next"
                button_carouselnext.append(span_next)
            }

            // Description
            const p_description = document.createElement("p")
            p_description.classList.add("mt-2", "mb-2", "me-2")
            p_description.style.fontSize = "14px"
            p_description.textContent = `${app.short_description}`
            div_leftinfo.append(p_description)

            if (app.release_date != undefined && app.release_date != null){ // Release date
                const div_release = document.createElement("div")
                div_release.style.fontSize = "14px"
                div_leftinfo.append(div_release)

                const b_release = document.createElement("span")
                b_release.innerHTML = "<b>Release date:</b> "
                div_release.append(b_release)

                const span_release = document.createElement("span")
                div_release.append(span_release)

                var d = new Date(app.release_date)

                if (isNaN(d)){ // If release date isn't a date
                    span_release.textContent += app.release_date
                }
                else{
                    span_release.textContent += `${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`

                    if (year_min > d.getFullYear() || year_min == null) { year_min = d.getFullYear() } // Min year for every game

                    if (year_max < d.getFullYear() || year_max == null) { year_max = d.getFullYear() } // Max year for every game
                }
            }
                
            if (app.tags != undefined && app.tags != null && app.tags.length != 0){ // Tags
                const div_tags = document.createElement("div")
                div_tags.classList.add("mb-2")
                div_tags.style.fontSize = "14px"
                div_leftinfo.append(div_tags)

                const b_tags = document.createElement("span")
                b_tags.innerHTML = "<b>Tags:</b> "
                div_tags.append(b_tags)

                const span_tags = document.createElement("span")
                div_tags.append(span_tags)

                Object.entries(app.tags).forEach(function([key, value]){
                    if (!tag_filters.includes(value)){ // Tags available
                        tag_filters.push(value)
                    }

                    if (key != 0){
                        span_tags.textContent += `, `
                    }
                    span_tags.textContent += `${value}`
                })
            }


            // Right info
            const div_rightinfo = document.createElement("div")
            div_rightinfo.classList.add("ms-auto", "mt-1", "mb-3")
            div_gameinfo.append(div_rightinfo)

            if (app.deals != undefined && app.deals != null){ // Deals
                Object.entries(app.deals).forEach(function([key, value]){
                    const div_deals = document.createElement("div")
                    div_deals.classList.add("d-flex", "deals")
                    div_rightinfo.append(div_deals)

                    if (value["regular"]["amount"] != 0){ // Isn't free
                        const div_store = document.createElement("div")
                        div_store.classList.add("px-2")
                        div_store.style.width = "170px"
                        div_deals.append(div_store)

                        const div_storelink = document.createElement("a")
                        div_storelink.classList.add("link-body-emphasis", "link-offset-2", "link-underline-opacity-25", "link-underline-opacity-75-hover")
                        div_storelink.href = `${value["url"]}`
                        div_storelink.setAttribute("target", "_blank")
                        div_storelink.textContent = `${value["shop"]["name"]}`
                        div_store.append(div_storelink)

                        const div_dealcurrent = document.createElement("div")
                        div_dealcurrent.classList.add("px-2", "price", "text-center")
                        div_dealcurrent.textContent = `${value["price"]["amount"]}`
                        div_deals.append(div_dealcurrent)

                        const div_dealregular = document.createElement("div")
                        div_dealregular.classList.add("px-2", "price", "text-center")
                        div_dealregular.textContent = `${value["regular"]["amount"]}`
                        div_deals.append(div_dealregular)

                        const div_deallowest = document.createElement("div")
                        div_deallowest.classList.add("px-2", "price", "text-center")
                        div_deallowest.textContent = `${value["storeLow"]["amount"]}`
                        div_deals.append(div_deallowest)
                    }
                    else{ // Free game
                        const p_store = document.createElement("p")
                        p_store.classList.add("m-0", "px-2")
                        p_store.textContent = "It's a free game."
                        div_deals.append(p_store)
                    }   
                })
            }
            else{ // Doesn't have any deal
                const div_deals = document.createElement("div")
                div_deals.classList.add("d-flex", "deals")
                div_rightinfo.append(div_deals)

                const p_deals = document.createElement("p")
                p_deals.classList.add("m-0", "px-2")
                p_deals.textContent = "This game has no available deals."
                div_deals.append(p_deals)
            }

            // Separation
            const hr = document.createElement("hr")
            hr.classList.add("me-3")
            div_rightinfo.append(hr)

            if (app.publishers != undefined && app.publishers != null && app.publishers.length != 0){ // Publishers
                const div_publishers = document.createElement("div")
                div_publishers.classList.add("m-0", "ms-2", "mt-3")
                div_publishers.style.fontSize = "14px"
                div_rightinfo.append(div_publishers)

                const b_publishers = document.createElement("span")
                b_publishers.innerHTML = "<b>Publishers:</b> "
                div_publishers.append(b_publishers)

                const span_publishers = document.createElement("span")
                div_publishers.append(span_publishers)

                Object.entries(app.publishers).forEach(function([key, value]){
                    if (!publisher_filters.includes(value["name"])){ // Publishers available
                        publisher_filters.push(value["name"])
                    }

                    if (key != 0){
                        span_publishers.textContent += `, `
                    }
                    span_publishers.textContent += `${value["name"]}`
                })
            }

            if (app.developers != undefined && app.developers != null && app.developers.length != 0){ // Developers
                const div_developers = document.createElement("div")
                div_developers.classList.add("m-0", "ms-2")
                div_developers.style.fontSize = "14px"
                div_rightinfo.append(div_developers)

                const b_developers = document.createElement("span")
                b_developers.innerHTML = "<b>Developers:</b> "
                div_developers.append(b_developers)

                const span_developers = document.createElement("span")
                div_developers.append(span_developers)
                
                Object.entries(app.developers).forEach(function([key, value]){
                    if (!developer_filters.includes(value["name"])){ // Developers available
                        developer_filters.push(value["name"])
                    }

                    if (key != 0){
                        span_developers.textContent += `, `
                    }
                    span_developers.textContent += `${value["name"]}`
                })
            }

            if (delete_ == true){ // Delete current app item
                document.getElementById("clear").hidden = false
                li_app.remove() 
            }
        });
    })

    $("#apps").append(ul_list) // Finish list

    // Set filter values

    // Stores
    store_filters.forEach(function(value){
        if (!(document.getElementById("filterStore").innerHTML.includes(value))){
            const option_filter = document.createElement("option")
            option_filter.value = `${value}`
            option_filter.textContent = `${value}`
            $("#filterStore").append(option_filter)
        }
    }) 

    // Tags
    tag_filters.forEach(function(value){
        if (!(document.getElementById("filterTag").innerHTML.includes(value))){
            const option_filter = document.createElement("option")
            option_filter.value = `${value}`
            option_filter.textContent = `${value}`
            $("#filterTag").append(option_filter)
        }
    }) 

    // Publishers
    publisher_filters.forEach(function(value){
        if (!(document.getElementById("filterPublisher").innerHTML.includes(value))){
            const option_filter = document.createElement("option")
            option_filter.value = `${value}`
            option_filter.textContent = `${value}`
            $("#filterPublisher").append(option_filter)
        }
    }) 

    // Developers
    developer_filters.forEach(function(value){
        if (!(document.getElementById("filterDeveloper").innerHTML.includes(value))){
            const option_filter = document.createElement("option")
            option_filter.value = `${value}`
            option_filter.textContent = `${value}`
            $("#filterDeveloper").append(option_filter)
        }
    }) 

    // Min. year
    if (year_min != null && year_max != null){
    if ($("#rangeYearMin").attr("min") != year_min || ($("#rangeYearMin").attr("max") != year_max)){
        $("#rangeYearMin").attr("min", year_min)
        $("#rangeYearMin").attr("max", year_max)
        $("#rangeYearMin").val(year_min)
    }
    $("#rangeYearMinLabel").text(`Min. year: ${$("#rangeYearMin").val()}`)

    // Max. year
    if ($("#rangeYearMax").attr("min") != year_min || ($("#rangeYearMax").attr("max") != year_max)){
        $("#rangeYearMax").attr("min", year_min)
        $("#rangeYearMax").attr("max", year_max)
        $("#rangeYearMax").val(year_max)
    }
    $("#rangeYearMaxLabel").text(`Max. year: ${$("#rangeYearMax").val()}`)
    }
}

run()


// Update list with filters
async function updateList(elem){
    if ($(elem).find("span")[0].textContent == "Update list"){
        $(elem).find("span")[0].textContent = "Updating..."
        elem.disabled = true

        // Prepare and disable options that could interfere with update
        clearFilter()
        $("#searchList").html("")
        $("#filter").attr("disabled", true)
        $("#searchInput").attr("disabled", true)
        $("#searchButton").attr("disabled", true)
        $("#configbutton").attr("disabled", true)
        $(".removeDropdown").each(function() {
            $(this).attr("pointer-events", "none")
        })

        var obj = eel.getAppList()()

        await obj.then(async function(list) {
            try{
                for (let i = 0; i < list.length; i++){
                    await run()
                    for (let j = i; j < list.length; j++){ // Set update icon to all items than remove
                        $("#apps .update-icon")[j].classList.add("fa-solid", "fa-rotate", "fa-lg", "me-3")
                    }

                    datar = eel.appRequestData(null, list[i].itad_id)() // Get data from ITAD id
                        
                    if (datar != null){
                        await datar.then(function(data){
                            eel.dataUpdate(i, data)()
                        })
                    }
                }
            }
            catch{
                await run()

                $("#filter").attr("disabled", false)
                $("#searchInput").attr("disabled", false)
                $("#searchButton").attr("disabled", false)
                $("#configbutton").attr("disabled", false)
                $(".removeDropdown").each(function() {
                    $(this).attr("pointer-events", "none")
                })
        
                $(elem).find("span")[0].textContent = "Update list"
                elem.disabled = false

                throw new Error("App item doesn't exist.")
            }
            await run()

            /// Update to current time
            var now = new Date()
            var time = `${now.getDate()}/${now.getMonth()}/${now.getFullYear()}  ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`

            await eel.dataConfigUpdate(null, null, time, null)()
            updateConfigShow()
        })

        $("#filter").attr("disabled", false)
        $("#searchInput").attr("disabled", false)
        $("#searchButton").attr("disabled", false)
        $("#configbutton").attr("disabled", false)
        $(".removeDropdown").each(function() {
            $(this).attr("pointer-events", "none")
        })

        $(elem).find("span")[0].textContent = "Update list"
        elem.disabled = false
    }
}

async function removeApp(val){
    //Remove and show result message
    $("#searchResult").html("")
    const p = document.createElement("p")
    $("#searchResult").append(p)

    try{
        await eel.dataRemove(val)()
        await run()

        p.className = "text-success p-2"
        p.textContent = `APP REMOVED`
    }
    catch{
        p.className = "text-danger p-2"
        p.textContent = `FAILED TO REMOVE APP`
    } 
}
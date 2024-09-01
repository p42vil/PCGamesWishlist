
/// INTERFACE RELATED THAT DOESN'T HAVE TO DO WITH DATA MANIPULATION ///

// Cancel javascript search list
var cancelUpdateSearchList = false

function setCancelUpdateSearchList(boolean){
    cancelUpdateSearchList = boolean
}

function getCancelUpdateSearchList(){
    return cancelUpdateSearchList
}

// Search for an app
$("#searchBar").submit(function(e){
    e.preventDefault();
    addApp(document.getElementById('searchInput').value)
})

// When clicking on results, don't unfocus
$('#searchList').mousedown(function (e){
    e.preventDefault()
    $("#searchInput").focus()
    return false
})

// When focusing out of search input
$('#searchInput').focusout(function (e){
    e.preventDefault()
    $("#searchList").html("")
    setCancelUpdateSearchList(true)
})

// Expand app for more information
function expandAppItem(elem){
    if (($(elem).find('.dropdown-center').is(':hover')) || 
    ($(elem).find('.removeDropdown').is(':hover')) ||
    ($(elem).find('.gameInfo').is(':hover'))){
        return false
    }

    // Expand or shrink
    if (!elem.classList.contains("expanded")){
        elem.classList.add("expanded")
        $(elem).find('.gameInfo').css("maxHeight", "1000px")
    }
    else{
        elem.classList.remove("expanded")
        $(elem).find('.gameInfo').css("maxHeight", "0")
    }
}


// FILTERS //

// Exapnd filter options
function expandFilterOptions(){
    elem = document.getElementById("filterOptions")
    
    // Expand or shrink
    if (!elem.classList.contains("expanded")){
        elem.classList.add("expanded")
        elem.style.maxHeight = "1000px"
    }
    else{
        elem.classList.remove("expanded")
        elem.style.maxHeight = "0px"
    }
}

// Set up Select2
$( '#filterStore' ).select2( { // Store filters
    theme: "bootstrap-5",
    width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
    placeholder: $( this ).data( 'placeholder' ),
    closeOnSelect: false,
} );

$( '#filterTag' ).select2( { // Tag filters
    theme: "bootstrap-5",
    width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
    placeholder: $( this ).data( 'placeholder' ),
    closeOnSelect: false,
} );

$( '#filterPublisher' ).select2( { // Publisher filters
    theme: "bootstrap-5",
    width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
    placeholder: $( this ).data( 'placeholder' ),
    closeOnSelect: false,
} );

$( '#filterDeveloper' ).select2( { // Developer filters
    theme: "bootstrap-5",
    width: $( this ).data( 'width' ) ? $( this ).data( 'width' ) : $( this ).hasClass( 'w-100' ) ? '100%' : 'style',
    placeholder: $( this ).data( 'placeholder' ),
    closeOnSelect: false,
} );

// Range selection for min. year
$("#rangeYearMin").on("input", function(){
    if($("#rangeYearMin").val() > $("#rangeYearMax").val()){
        $("#rangeYearMin").val($("#rangeYearMax").val())
    }

    $("#rangeYearMinLabel").text(`Min. year: ${$("#rangeYearMin").val()}`)
})

// Range selection for max. year
$("#rangeYearMax").on("input", function(){
    if($("#rangeYearMax").val() < $("#rangeYearMin").val()){
        $("#rangeYearMax").val($("#rangeYearMin").val())
    }

    $("#rangeYearMaxLabel").text(`Max. year: ${$("#rangeYearMax").val()}`)
})

// When selecting a price option
$("#radioPrice").on("input", function(){
    $("#rangePriceMinLabel").text(`Min. ${$("#radioPrice input[type='radio']:checked").val()} price: `)
    $("#rangePriceMaxLabel").text(`Max. ${$("#radioPrice input[type='radio']:checked").val()} price: `)
})

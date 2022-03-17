var params = new URLSearchParams(window.location.search)
var searchParam = params.get('search')

function getUrl() {
    let url = window.location.origin + window.location.pathname + "?"

    var search = params.get('search')
    var tab = params.get('tab')

    if (search) {
        url = `${url}search=${search}&display=1&`
    }

    if (tab) {
        url = `${url}tab=${tab}&`
    }

    return url
}

function card_funtion1(num) {
    if (num === 1) {
        var x = document.getElementById("sec_2_div_1");
        if (x.style.display === "none") {
            document.getElementById("sec_2_div_1").style.display = "block";
        } else {
            document.getElementById("sec_2_div_1").style.display = "none";
        }
    }
}

function tab_funtion() {
    let search = params.get('search');
    let display = params.get('display');
    if(search && search != "" && display == "1")
        $('#search').dropdown('toggle');
}

function tooltip_load() {
    let search = params.get('search');
    let display = params.get('display');
    if(search && search != "" && display == "1")
        $('#search').dropdown('toggle');
}

function slide_funtion() {
    let slide_num = window.location.pathname.substring(window.location.pathname.lastIndexOf('/') + 1)
    let current_slide = "#slide-" + slide_num;
    let content_div = "content-" + slide_num;

    let siteCode = $("#siteCode").val();
    let sectionCode = $("#sectionCode").val();
    let prefix = $("#prefix").val();
    let dataindex = $("#current_index").val();
    let filename = siteCode + "_" + sectionCode + "_" + prefix + "_" + dataindex + ".mp3";
    $.ajax({
        url : "/detail/check-file?filename=" + filename,
        type: "GET",
        success: function(response) {
            if (response.status === undefined || response.status == 0) {
                $(".playbtn").hide();
            } else {
                $(".playbtn").show();
            }
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
            alert("Error occurred while trying to send message. Please reload page: " + errorThrown)
        }
    });

    if (slide_num !== null) {
        $("#slide-1").removeClass("active");
        $(current_slide).addClass("active");
        $(content_div).removeClass("content-hidden").addClass("content-show");
    }

    let search = params.get('search');
    let display = params.get('display');
    if(search && search != "" && display == "1")
        $('#search').dropdown('toggle');

    var imgElement = document.createElement("img");
    if(image_arr.length > 0 && image_arr[dataindex - 1])
        imgElement.src = "/sitedata/images/" + image_arr[dataindex-1] + ".png";
    else {
        imgElement.src = "/sitedata/images/card_" + siteCode + "_" + sectionCode + "_" + prefix + ".png";
        if (sectionCode === "ppb" && dataindex <= 12)
            imgElement.src = "/sitedata/images/card_" + siteCode + "_" + sectionCode + "_" + prefix + "_1.png";
        else if (sectionCode === "ppb" && dataindex > 12)
            imgElement.src = "/sitedata/images/card_" + siteCode + "_" + sectionCode + "_" + prefix + "_2.png";

        if(sectionCode === "cree") {
            let category = "number";
            if(prefix === 2) {
                category = "moon";
            }
            imgElement.src = "/sitedata/images/card_" + siteCode + "_" + sectionCode + "_" + category + "_" + dataindex + ".png";
        }
    }
    imgElement.className = "slider_img";
    $(".detail-img").html(imgElement);
}

$('.sec_buttons').click(function (e) {
    let index = $(this).data("index");
    if($("#sec_2_div_" + index).is(":hidden")){
        $(".sec_buttons").hide();
        $(this).show();
        $(".sec_divs").hide();
        $("#sec_2_div_" + index).show();
    } else {
        $(".sec_buttons").show();
        $(".sec_divs").hide();
    }
});

function slider_prev_funtion() {
    var currentIndex = $('div.active').index();
    if (currentIndex === 0) {
        currentIndex = main_text_arr.length;
    }
    document.getElementById("main_text").innerHTML = main_text_arr[currentIndex - 1];
    if(main_title_arr.length > 0) {
        if (main_title_arr[currentIndex - 1].length > 45) {
            document.getElementById("main_title").outerHTML = document.getElementById("main_title").outerHTML.replace(/span/g, "marquee");
        } else {
            document.getElementById("main_title").outerHTML = document.getElementById("main_title").outerHTML.replace(/marquee/g, "span");
        }
        document.getElementById("main_title").innerHTML = main_title_arr[currentIndex - 1];
    }
    $(".data-contents").removeClass("content-show").addClass("content-hidden");
    $("#content-" + currentIndex).removeClass("content-hidden").addClass("content-show");
    $("#current_index").val(currentIndex);


    let siteCode = $("#siteCode").val();
    let sectionCode = $("#sectionCode").val();
    let prefix = $("#prefix").val();
    let filename = siteCode + "_" + sectionCode + "_" + prefix + "_" + currentIndex + ".mp3";
    $.ajax({
        url : "/detail/check-file?filename=" + filename,
        type: "GET",
        success: function(response) {
            if (response.status === undefined || response.status == 0) {
                $(".playbtn").hide();
            } else {
                $(".playbtn").show();
            }
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
            alert("Error occurred while trying to send message. Please reload page: " + errorThrown)
        }
    });

    if(image_arr.length > 0 && image_arr[currentIndex - 1])
        $(".slider_img").attr("src", "/sitedata/images/" + image_arr[currentIndex-1] + ".png");
    else {
        if (sectionCode === "ppb" && currentIndex <= 12)
            $(".slider_img").attr("src", "/sitedata/images/card_" + siteCode + "_" + sectionCode + "_" + prefix + "_1.png");
        else if (sectionCode === "ppb" && currentIndex > 12)
            $(".slider_img").attr("src", "/sitedata/images/card_" + siteCode + "_" + sectionCode + "_" + prefix + "_2.png");

        if (sectionCode === "cree") {
            let category = "number";
            if (prefix === 2) {
                category = "moon";
            }
            $(".slider_img").attr("src", "/sitedata/images/card_" + siteCode + "_" + sectionCode + "_" + category + "_" + currentIndex + ".png");
        }
    }
}

function slider_next_funtion() {
    var currentIndex = $('div.active').index() + 1 + 1;
    if (currentIndex === main_text_arr.length + 1) {
        currentIndex = 1;
    }
    document.getElementById("main_text").innerHTML = main_text_arr[currentIndex - 1];
    if(main_title_arr.length > 0) {
        if (main_title_arr[currentIndex - 1].length > 45) {
            document.getElementById("main_title").outerHTML = document.getElementById("main_title").outerHTML.replace(/span/g, "marquee");
        } else {
            document.getElementById("main_title").outerHTML = document.getElementById("main_title").outerHTML.replace(/marquee/g, "span");
        }
        document.getElementById("main_title").innerHTML = main_title_arr[currentIndex - 1];
    }
    $(".data-contents").removeClass("content-show").addClass("content-hidden");
    $("#content-" + currentIndex).removeClass("content-hidden").addClass("content-show");
    $("#current_index").val(currentIndex);

    let siteCode = $("#siteCode").val();
    let sectionCode = $("#sectionCode").val();
    let prefix = $("#prefix").val();
    let filename = siteCode + "_" + sectionCode + "_" + prefix + "_" + currentIndex + ".mp3";
    $.ajax({
        url : "/detail/check-file?filename=" + filename,
        type: "GET",
        success: function(response) {
            if (response.status === undefined || response.status == 0) {
                $(".playbtn").hide();
            } else {
                $(".playbtn").show();
            }
        },
        error: function (jqXHR, textStatus, errorThrown)
        {
            alert("Error occurred while trying to send message. Please reload page: " + errorThrown)
        }
    });

    if(image_arr.length > 0 && image_arr[currentIndex - 1])
        $(".slider_img").attr("src", "/sitedata/images/" + image_arr[currentIndex-1] + ".png");
    else {
        if (sectionCode === "ppb" && currentIndex <= 12)
            $(".slider_img").attr("src", "/sitedata/images/card_" + siteCode + "_" + sectionCode + "_" + prefix + "_1.png");
        else if (sectionCode === "ppb" && currentIndex > 12)
            $(".slider_img").attr("src", "/sitedata/images/card_" + siteCode + "_" + sectionCode + "_" + prefix + "_2.png");

        if (sectionCode === "cree") {
            let category = "number";
            if (prefix === 2) {
                category = "moon";
            }
            $(".slider_img").attr("src", "/sitedata/images/card_" + siteCode + "_" + sectionCode + "_" + category + "_" + currentIndex + ".png");
        }
    }
}

function play() {
    let siteCode = $("#siteCode").val();
    let sectionCode = $("#sectionCode").val();
    let prefix = $("#prefix").val();
    let dataindex = $("#current_index").val();
    let filename = "/sitedata/audio/" + siteCode + "_" + sectionCode + "_" + prefix + "_" + dataindex + ".mp3";

    if(filename !== "/sitedata/audio/") {
        let audio = new Audio(filename);
        $(".speaker-icon").css('opacity', '0.5');
        $(".playbtn").css('pointer-events', 'none');
        audio.play();
        audio.addEventListener("ended", function(){
            audio.currentTime = 0;
            $(".speaker-icon").css('opacity', '1');
            $(".playbtn").css('pointer-events', 'all');
            console.log("ended");
        });
    }
}


$('#search_field').keypress(function (e) {
    var key = e.which;
    if(key == 13)  // the enter key code
    {
        let search_val = $(this).val();
        if(search_val != "") {
            params.set('search', search_val);
            window.location.href = getUrl();
        } else {
            params.delete('search');
            window.location.href = getUrl();
        }
    }
});
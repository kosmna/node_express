var orgDataforSites = {};

$(document).on('click', '.map-link', function(){
    if($(this).hasClass('dropdown')) {
        let dataId = $(this).data("id");
        if(dataId)
            $("." + dataId + "Menu").show();
    } else {
        let href = $(this).data("href");
        window.location.href = href;
    }
});


$("body").click(function(event) {
    let element = event.target;
    if(!element.className.includes("dropdown") && !element.className.includes("map-link"))
        $(".dropdown-menu").hide();
});

$( document ).ready(function() {
    let orgMapWidth = $(".hero_image").width();
    let orgMapHeight = $(".hero_image").height();
    let windowWidth = $(window).width();
    let windowHeight = $(window).height();
    let leftPosition = (windowWidth - orgMapWidth) / 2;
    let topPosition = (windowHeight - orgMapHeight) / 2;

    $(".site-position").each(function (i) {
        if(windowWidth <= 475) {
            let top = this.style.top.split("%")[0];
            if(top >= 50)
                this.style.top = (parseInt(top) - 9) + "%";
            else
                this.style.top = (parseInt(top) + 9) + "%";

            let left = this.style.left.split("%")[0];
            if(left < 40)
                this.style.left = (parseInt(left) - 12) + "%";
        }
        let key = this.className.split(" ")[1];
        if(!orgDataforSites.hasOwnProperty(key)){
            orgDataforSites[key] = {};
        }
        orgDataforSites[key]["top"] = this.style.top.split("%")[0]/100;
        orgDataforSites[key]["left"] = this.style.left.split("%")[0]/100;
        orgDataforSites[key]["deltaW"] = (windowWidth * orgDataforSites[key]["left"] - leftPosition) * 100 / orgMapWidth;
        orgDataforSites[key]["deltaH"] = (windowHeight * orgDataforSites[key]["top"] - topPosition) * 100 / orgMapHeight;
    });
});

$(window).on('resize', function(){
    let mapWidth = $(".hero_image").width();
    let mapHeight = $(".hero_image").height();
    let windowWidth = $(window).width();
    let windowHeight = $(window).height();
    let leftPosition = (windowWidth - mapWidth) / 2;
    let topPosition = (windowHeight - mapHeight) / 2;

    Object.keys(orgDataforSites).forEach(function(key) {
        let currentWidth = leftPosition + mapWidth * orgDataforSites[key]["deltaW"] / 100;
        let currentHeight = topPosition + mapHeight * orgDataforSites[key]["deltaH"] / 100;

        $("." + key + "Position").css("top", currentHeight / windowHeight * 100 + "%");
        $("." + key + "Position").css("left", currentWidth / windowWidth * 100 + "%");
    });
});
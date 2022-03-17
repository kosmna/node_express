const fs = require('fs');
Helpers = require("./helpers")

CreateRequestDebug = require("debug")("Create-Campaign-Request")
ConfigureCreatorDebug = require("debug")("Configure-Creator")
UploadMediaDebug = require('debug')("Upload-Media")

var siteConfData = {};
const siteDataPath = "public/sitedata/";
function loadSiteConf() {
    let index = -1;
    let filename = siteDataPath + "text/sites_config.txt";

    let data = fs.readFileSync(filename, {flag:'r'});
    let lines = data.toString().split('\n');

    let fSection = false;
    let tagName = "";
    for(let line of lines) {
        line = line.trim();
        if(line == "" || line == "\r")
            continue;

        if (line.startsWith("<location>")) {
            tagName = "location";
            index++;
        } else if (line.startsWith("<abbreviation>")) {
            tagName = "abbreviation";
        } else if (line.startsWith("<top>")) {
            tagName = "top";
        } else if (line.startsWith("<left>")) {
            tagName = "left";
        } else if (line.startsWith("<sites>")) {
            fSection = true;
            tagName = "sites";
        } else if (line.startsWith("<title>") && fSection) {
            sectionTag = "title";
        } else if (line.startsWith("<prefix>") && fSection) {
            sectionTag = "prefix";
        } else if (line.startsWith("{")) {
            continue;
        } else if (line.startsWith("}")) {
            fSection = false;
            continue;
        } else {
            if(fSection){
                if (!(sectionTag in siteConfData[tagName])) {
                    siteConfData[tagName][sectionTag] = [];
                }
                if (typeof (siteConfData) != 'undefined' &&
                    typeof (siteConfData[tagName]) != 'undefined' &&
                    typeof (siteConfData[tagName][sectionTag]) != 'undefined' &&
                    typeof (siteConfData[tagName][sectionTag][index]) != 'undefined') {
                    siteConfData[tagName][sectionTag][index] += ',' + line;
                } else {
                    siteConfData[tagName][sectionTag][index] = line;
                }
            } else {
                if (typeof (siteConfData) != 'undefined' &&
                    typeof (siteConfData[tagName]) != 'undefined' &&
                    typeof (siteConfData[tagName][index]) != 'undefined')
                    siteConfData[tagName][index] += '\n' + line;
                else
                    siteConfData[tagName][index] = line;
            }
        }
        if (!(tagName in siteConfData)){
            if(tagName === "sites")
                siteConfData[tagName] = {};
            else
                siteConfData[tagName] = [];
        }
    }
}

module.exports = {
    home: function (req, res) {
        siteConfData = {};
        loadSiteConf();
        let mapConfData = {};
        if(siteConfData && siteConfData.abbreviation) {
            for(let i = 0; i < siteConfData.abbreviation.length; i++) {
                let sites = siteConfData.sites.prefix[i].split(",");
                let titles = siteConfData.sites.title[i].split(",");
                let top = siteConfData.top[i].split("%")[0];
                let left = siteConfData.left[i].split("%")[0];
                if(!mapConfData[top + left]) {
                    mapConfData[top + left] = [];
                }
                for (let j = 0; j < sites.length; j++) {
                    let prefix = sites[j];
                    let title = titles[0];
                    if(titles[j])
                        title = titles[j];

                    mapConfData[top + left].push({
                        "top": top,
                        "left": left,
                        "abbreviation": siteConfData.abbreviation[i],
                        "prefix": prefix,
                        "title": title
                    });
                }
            }
        }
        res.render("home", {
            siteConfData: mapConfData
        });
    }
}

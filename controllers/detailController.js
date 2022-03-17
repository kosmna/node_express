const fs = require('fs');
Helpers = require("./helpers")

const siteDataPath = "public/sitedata/";

var siteConfData = {};
var allSitesConf = {};
var introData = {};
var siteDetailData = [];
var thyData = [];

function searchData(sitecode, search) {
    thyData = [];
    loadingAllData(sitecode);
    var searchResult = [];
    for(let i = 0; i < thyData.length; i++){
        let result = [];
        let detailData = thyData[i];
        if(detailData.hasOwnProperty("keywords")) {
            for(let j = 0; j < detailData['keywords'].length; j++) {
                if(!detailData['keywords'][j])
                    continue;
                let keywords = detailData['keywords'][j];
                let keywords_arr = keywords.toLowerCase().split(";");
                keywords_arr = keywords_arr.map(s => s.trim());
                if(keywords_arr.indexOf(search.toLowerCase()) >= 0){
                    searchResult.push({
                        episode: detailData['episode'][j],
                        tagline: detailData['tagline'][j],
                        link: detailData['link'][j]
                    });
                }
            }
        }
        if(result.length > 0)
            searchResult.push(result);
    }
    return searchResult
}

function mergeObjects(obj1, obj2) {
    let obj = {};
    for (let key in obj1) {
        if(obj2.hasOwnProperty(key))
            obj[key] = obj1[key].concat(obj2[key]);
        else
            obj[key] = obj1[key]
    }
    return obj;
}

function loadAllSitesConf() {
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
                if (!(sectionTag in allSitesConf[tagName])) {
                    allSitesConf[tagName][sectionTag] = [];
                }
                if (typeof (allSitesConf) != 'undefined' &&
                    typeof (allSitesConf[tagName]) != 'undefined' &&
                    typeof (allSitesConf[tagName][sectionTag]) != 'undefined' &&
                    typeof (allSitesConf[tagName][sectionTag][index]) != 'undefined') {
                    allSitesConf[tagName][sectionTag][index] += ',' + line;
                } else {
                    allSitesConf[tagName][sectionTag][index] = line;
                }
            } else {
                if (typeof (allSitesConf) != 'undefined' &&
                    typeof (allSitesConf[tagName]) != 'undefined' &&
                    typeof (allSitesConf[tagName][index]) != 'undefined')
                    allSitesConf[tagName][index] += '\n' + line;
                else
                    allSitesConf[tagName][index] = line;
            }
        }
        if (!(tagName in allSitesConf)){
            if(tagName === "sites")
                allSitesConf[tagName] = {};
            else
                allSitesConf[tagName] = [];
        }
    }
}

function loadingAllData(sitecode) {
    for (let siteIndex = 0; siteIndex < siteConfData.prefix.length; siteIndex++) {
        if(!siteConfData.prefix[siteIndex].trim().startsWith(sitecode))
            continue;
        let sectionPrefixs = siteConfData.section_tabs.prefix[siteIndex].split(",");
        for (let prefixIndex = 0; prefixIndex < sectionPrefixs.length; prefixIndex++) {
            let prefix = sectionPrefixs[prefixIndex].trim();
            let filename = siteDataPath + 'text/' + siteConfData.prefix[siteIndex].trim() + "_" + prefix + ".txt";
            if (!fs.existsSync(filename)) {
                if(thyData[prefix-1] === undefined)
                    thyData[prefix-1] = [];
                continue;
            }
            var data = fs.readFileSync(filename, {flag: 'r'});
            var lines = data.toString().split('\n');
            let rawData = {};
            let index = -1;
            let sliderIndex = 0;
            for (let line of lines) {
                line = line.trim();
                if (index === -1 && line === "" || line === "")
                    continue;
                if (!('link' in rawData))
                    rawData['link'] = [];
                if (line.startsWith("<episode>")) {
                    tagName = "episode";
                    index++;
                    sliderIndex++;
                } else if (line.startsWith("<index>")) {
                    tagName = "index";
                } else if (line.startsWith("<title>")) {
                    tagName = "title";
                } else if (line.startsWith("<quotation>")) {
                    tagName = "quotation";
                } else if (line.startsWith("<tagline>")) {
                    tagName = "tagline";
                } else if (line.startsWith("<takeaway>")) {
                    tagName = "takeaway";
                } else if (line.startsWith("<overview>")) {
                    tagName = "overview";
                } else if (line.startsWith("<practice>")) {
                    tagName = "practice";
                } else if (line.startsWith("<in the centre>")) {
                    tagName = "inthecentre";
                } else if (line.startsWith("<builds on>")) {
                    tagName = "buildson";
                } else if (line.startsWith("<reflection>")) {
                    tagName = "reflection";
                } else if (line.startsWith("<keywords>")) {
                    tagName = "keywords";
                } else {
                    if (typeof (rawData) != 'undefined' &&
                        typeof (rawData[tagName]) != 'undefined' &&
                        typeof (rawData[tagName][index]) != 'undefined') {
                        if (tagName === "overview" || tagName === "practice" || tagName === "reflection")
                            rawData[tagName][index] += '<br>' + line;
                        else
                            rawData[tagName][index] += '\n' + line;
                        rawData['link'][index] = "detail/detailview/" + (siteIndex+1) + "/" + siteConfData.prefix[siteIndex].replace("_", "/") + "/" + prefix + "/" + sliderIndex;
                    } else {
                        rawData[tagName][index] = line;
                    }
                }
                if (!(tagName in rawData))
                    rawData[tagName] = [];
            }
            if(thyData[prefix-1] === undefined)
                thyData[prefix-1] = rawData;
            else
                thyData[prefix-1] = mergeObjects(thyData[prefix-1], rawData);
        }
    }
}

function loadIntroData(sectionCode) {
    let index = 0;
    let filename = siteDataPath + "text/ey_" + sectionCode + "_intro.txt";

    let data = fs.readFileSync(filename, {flag:'r'});
    let lines = data.toString().split('\r');

    for(let line of lines) {
        if(line == "")
            continue;
        if(index == 0) {
            introData['title'] = line;
            introData['data'] = "";
        } else {
            introData['data'] += line + "<br>";
        }
        index++;
    }
}

function loadSiteConf(sitecode) {
    let index = -1;
    let filename = siteDataPath + "text/" + sitecode + "_config.txt";

    let data = fs.readFileSync(filename, {flag:'r'});
    let lines = data.toString().split('\n');

    let fSection = false;
    let tagName = "";
    for(let line of lines) {
        line = line.trim();
        if(line == "" || line == "\r")
            continue;

        if (line.startsWith("<title>") && !fSection) {
            tagName = "title";
            index++;
        } else if (line.startsWith("<description>")) {
            tagName = "description";
        } else if (line.startsWith("<prefix>") && !fSection) {
            tagName = "prefix";
        } else if (line.startsWith("<color>")) {
            tagName = "color";
        } else if (line.startsWith("<section_tabs>")) {
            fSection = true;
            tagName = "section_tabs";
        } else if (line.startsWith("<title>") && fSection) {
            sectionTag = "title";
        } else if (line.startsWith("<prefix>") && fSection) {
            sectionTag = "prefix";
        } else if (line.startsWith("<app_color>") && fSection) {
            sectionTag = "app_color";
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
            if(tagName === "section_tabs")
                siteConfData[tagName] = {};
            else
                siteConfData[tagName] = [];
        }
    }
}

function loadDetailData(siteCode, sectionCode, prefixs, sectionIndex){
    for(let prefixIndex = 0; prefixIndex < prefixs.length; prefixIndex++) {
        let prefix = prefixs[prefixIndex].trim();
        let filename = siteDataPath + 'text/' + siteCode + "_" + sectionCode + "_" + prefix + ".txt";

        if (!fs.existsSync(filename)) {
            siteDetailData[prefixIndex] = {};
            continue;
        }
        var data = fs.readFileSync(filename, {flag:'r'});
        var lines = data.toString().split('\n');
        if(lines.length < 40)
            lines = data.toString().split('\r');
        let rawData = {};
        let index = -1;
        let sliderIndex = 0;
        let tagName = "";
        for(let line of lines) {
            line = line.trim();
            if (line === "")
                continue;
            if (!('link' in rawData))
                rawData['link'] = [];
            if (line.startsWith("<episode>")) {
                tagName = "episode";
                index++;
                sliderIndex++;
            } else if (line.startsWith("<index>")) {
                tagName = "index";
            } else if (line.startsWith("<title>")) {
                tagName = "title";
            } else if (line.startsWith("<quotation>")) {
                tagName = "quotation";
            } else if (line.startsWith("<tagline>")) {
                tagName = "tagline";
            } else if (line.startsWith("<takeaway>")) {
                tagName = "takeaway";
            } else if (line.startsWith("<overview>")) {
                tagName = "overview";
            } else if (line.startsWith("<practice>")) {
                tagName = "practice";
            } else if (line.startsWith("<in the centre>")) {
                tagName = "inthecentre";
            } else if (line.startsWith("<builds on>")) {
                tagName = "buildson";
            } else if (line.startsWith("<reflection>")) {
                tagName = "reflection";
            } else if (line.startsWith("<keywords>")) {
                tagName = "keywords";
            } else if (line.startsWith("<image>")) {
                tagName = "image";
            } else {
                if (typeof (rawData) != 'undefined' &&
                    typeof (rawData[tagName]) != 'undefined' &&
                    typeof (rawData[tagName][index]) != 'undefined') {
                    if (tagName === "overview" || tagName === "practice" || tagName === "reflection")
                        rawData[tagName][index] += '<br>' + line;
                    else
                        rawData[tagName][index] += '\n' + line;
                    rawData['link'][index] = "detail/detailview/" + sectionIndex + "/" + siteCode + "/" + sectionCode + "/" + prefix + "/" + sliderIndex;
                } else {
                    rawData[tagName][index] = line;
                }
            }
            if (!(tagName in rawData))
                rawData[tagName] = [];
        }

        siteDetailData[prefix-1] = rawData;
    }
}
module.exports = {
    checkfile: function(req, res) {
        let filename = req.query.filename;
        let filepath = siteDataPath + "audio/" + filename;

        fs.exists(filepath, function (isExist) {
            if (isExist) {
                res.json({
                    status: 1,
                    message: "File is exists"
                });
            } else {
                res.json({
                    status: 0,
                    message: "File does not exists"
                });
            }
        });
    },
    overview: function(req, res) {
        let datacode = req.params.datacode;
        let dataindex = req.params.dataindex;
        let siteCode = "";
        let sectionCode = "";
        if(datacode) {
            let codeArr = datacode.split("_");
            siteCode = codeArr[0];
            sectionCode = codeArr[1];
        }

        if(siteCode != "" && sectionCode != ""){
            introData = {};
            loadIntroData(sectionCode);
            siteConfData = {};
            loadSiteConf(siteCode);
        }
        if(siteConfData && Object.keys(siteConfData).length > 0){
            let app_colors = siteConfData.section_tabs.app_color[dataindex-1].split(",");
            let prefixs = siteConfData.section_tabs.prefix[dataindex-1].split(",");
            let titles = siteConfData.section_tabs.title[dataindex-1].split(",");

            siteDetailData = [];
            loadDetailData(siteCode, sectionCode, prefixs, dataindex);

            let search = req.query.search;
            let searchResult = {};
            if(search && search !== "" && siteDetailData.length > 0) {
                searchResult = searchData(siteCode, search);
            }

            allSitesConf = {};
            loadAllSitesConf();
            let mapConfData = [];
            if(allSitesConf && allSitesConf.abbreviation) {
                for(let i = 0; i < allSitesConf.abbreviation.length; i++) {
                    let sites = allSitesConf.sites.prefix[i].split(",");
                    let titles = allSitesConf.sites.title[i].split(",");
                    for (let j = 0; j < sites.length; j++) {
                        let prefix = sites[j];
                        let title = titles[0];
                        if(titles[j])
                            title = titles[j];

                        mapConfData.push({
                            "abbreviation": allSitesConf.abbreviation[i],
                            "prefix": prefix,
                            "title": title
                        });
                    }
                }
            }
            res.render("overview", {
                siteCode: siteCode,
                sectionCode: sectionCode,
                title: introData.title,
                description: introData.data,
                app_colors: app_colors,
                prefixs: prefixs,
                titles: titles,
                search_result: searchResult,
                searchKey: search,
                siteConfData: siteConfData,
                siteDetailData: siteDetailData,
                secIndex: dataindex,
                mapConfData: mapConfData
            })
        }
    },
    detailview: function(req, res) {
        let siteCode = req.params.sitecode;
        let sectionCode = req.params.sectioncode;
        let prefix = req.params.prefix;
        let dataindex = req.params.dataindex;
        let secindex = req.params.secindex;

        if(siteCode != "" && sectionCode != ""){
            siteConfData = {};
            loadSiteConf(siteCode);
        }
        if(siteConfData && Object.keys(siteConfData).length > 0){
            let app_colors = siteConfData.section_tabs.app_color[secindex-1].split(",");
            let prefixs = siteConfData.section_tabs.prefix[secindex-1].split(",");

            siteDetailData = [];
            loadDetailData(siteCode, sectionCode, prefixs, secindex);

            let search = req.query.search;
            let searchResult = {};
            if(search && search !== "" && siteDetailData.length > 0) {
                searchResult = searchData(siteCode, search);
            }

            allSitesConf = {};
            loadAllSitesConf();
            let mapConfData = [];
            if(allSitesConf && allSitesConf.abbreviation) {
                for(let i = 0; i < allSitesConf.abbreviation.length; i++) {
                    let sites = allSitesConf.sites.prefix[i].split(",");
                    let titles = allSitesConf.sites.title[i].split(",");
                    for (let j = 0; j < sites.length; j++) {
                        let prefix = sites[j];
                        let title = titles[0];
                        if(titles[j])
                            title = titles[j];

                        mapConfData.push({
                            "abbreviation": allSitesConf.abbreviation[i],
                            "prefix": prefix,
                            "title": title
                        });
                    }
                }
            }
            res.render("detailview", {
                siteCode: siteCode,
                sectionCode: sectionCode,
                prefix: prefix,
                slider: dataindex,
                search_result: searchResult,
                searchKey: search,
                siteDetailData: siteDetailData,
                siteConfData: siteConfData,
                secindex: secindex,
                app_colors: app_colors,
                mapConfData: mapConfData
            });
        }
    },
};
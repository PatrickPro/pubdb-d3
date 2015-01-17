/**
 * Created by patrickpro on 13/01/15.
 */

var authorsJSON;
var pubCount = [];
var pubAuthor = [];
var filteredAuthorJSON = [];

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var conferenceFilter = true;
var workshopFilter = true;
var proceedingsBookFilter = true;
var journalFilter = true;

var tagitOn = false;

var timeFrame = [1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014]; // will be updated according to JSON


var wordcloudAuthor = '';
var wordcloudMinYear = 0;
var wordcloudMaxYear = 0;
var wordcloudTypes = [];

$(document).ready(function () {
    getAuthorsFromAPI();
});

function barWordcloudListener() {
    //create wordcloud accoring to each author bar
    $(".chart svg g.bars g rect").on('click', function() {
        wordcloudAuthor = ($(this).text());
        var index = $(this).index()+1;
        $(".chart svg g.labels g text")
            .attr("style","font-weight: 300");
        $(".chart svg g.labels g text:nth-child("+index+")")
            .attr("style","font-weight: 400");
        $(".chart svg g.bars g rect")
            .attr("filter","");
        $(".chart svg g.bars g rect:nth-child("+index+")")
            .attr("filter","url(#dropshadow)");
        $(".chart svg g.bars g rect:nth-child("+index+")")
            .attr("filter","url(#dropshadow)");
        $(".chart svg g.bars g.conference rect")
            .attr("fill","darkred");
        $(".chart svg g.bars g.workshop rect")
            .attr("fill","orange");
        $(".chart svg g.bars g.proceedings-book rect")
            .attr("fill","green");
        $(".chart svg g.bars g.journal rect")
            .attr("fill","steelblue");
        $(".chart svg g.bars g.conference rect:nth-child("+index+")")
            .attr("fill","#A23333");
        $(".chart svg g.bars g.workshop rect:nth-child("+index+")")
            .attr("fill","#FFB733");
        $(".chart svg g.bars g.proceedings-book rect:nth-child("+index+")")
            .attr("fill","#338333");
        $(".chart svg g.bars g.journal rect:nth-child("+index+")")
            .attr("fill","#6B9BC3");

            updateWordcloud();


    });

    $('#addInfoCloseButton').click(function(){
        $('#addInfos').fadeOut('slow');
    });

}

function updateWordcloud(){

    wordcloudMinYear=parseInt($("#slider").val()[0]);
    wordcloudMaxYear =parseInt($("#slider").val()[1]);
    wordcloudTypes = [];
    $("input:checkbox[name=pub_type]:checked").each(function()
    {
        wordcloudTypes.push($(this).val());
    });

    var url = 'http://prostuff.net:3000/search?author='+encodeURI(wordcloudAuthor)+'&dev=true&year='+wordcloudMinYear+'-'+wordcloudMaxYear+'&type='+wordcloudTypes;
    //var url = 'http://prostuff.net:3000/search?author='+encodeURI(wordcloudAuthor)+'&dev=true&year='+wordcloudMinYear+'-'+wordcloudMaxYear;
    $('#currentAuthor').text(wordcloudAuthor);
    createWordCloud(500, 300, url);
}


function tagit() {
    //-------------------------------
    // Minimal
    //-------------------------------
    $('#myTags').tagit();

    //-------------------------------
    // Single field
    //-------------------------------
    $('#singleFieldTags').tagit({
        availableTags: pubAuthor,
        // This will make Tag-it submit a single form value, as a comma-delimited field.
        singleField: true,
        singleFieldNode: $('#mySingleField')
    });

    // singleFieldTags2 is an INPUT element, rather than a UL as in the other
    // examples, so it automatically defaults to singleField.
    $('#singleFieldTags2').tagit({
        availableTags: pubAuthor
    });

    //-------------------------------
    // Preloading data in markup
    //-------------------------------
    $('#myULTags').tagit({
        availableTags: pubAuthor, // this param is of course optional. it's for autocomplete.
        // configure the name of the input field (will be submitted with form), default: item[tags]
        itemName: 'item',
        fieldName: 'tags'
    });

    //-------------------------------
    // Tag events
    //-------------------------------
    var eventTags = $('#eventTags');

    var addEvent = function (text) {
        $('#events_container').append(text + '<br>');
    };

    eventTags.tagit({
        availableTags: pubAuthor,
        beforeTagAdded: function (evt, ui) {
            if (!ui.duringInitialization) {
                addEvent('beforeTagAdded: ' + eventTags.tagit('tagLabel', ui.tag));
            }
        },
        afterTagAdded: function (evt, ui) {
            if (!ui.duringInitialization) {
                addEvent('afterTagAdded: ' + eventTags.tagit('tagLabel', ui.tag));
            }
        },
        beforeTagRemoved: function (evt, ui) {
            addEvent('beforeTagRemoved: ' + eventTags.tagit('tagLabel', ui.tag));
        },
        afterTagRemoved: function (evt, ui) {
            addEvent('afterTagRemoved: ' + eventTags.tagit('tagLabel', ui.tag));
        },
        onTagClicked: function (evt, ui) {
            addEvent('onTagClicked: ' + eventTags.tagit('tagLabel', ui.tag));
        },
        onTagExists: function (evt, ui) {
            addEvent('onTagExists: ' + eventTags.tagit('tagLabel', ui.existingTag));
        }
    });

    //-------------------------------
    // Read-only
    //-------------------------------
    $('#readOnlyTags').tagit({
        readOnly: true
    });

    //-------------------------------
    // Tag-it methods
    //-------------------------------
    $('#methodTags').tagit({
        availableTags: pubAuthor
    });

    //-------------------------------
    // Allow spaces without quotes.
    //-------------------------------
    $('#allowSpacesTags').tagit({
        availableTags: pubAuthor,
        allowSpaces: true
    });

    //-------------------------------
    // Remove confirmation
    //-------------------------------
    $('#removeConfirmationTags').tagit({
        availableTags: pubAuthor,
        removeConfirmation: true
    });



    $(document).on('click', '.ui-menu-item', function (e) {

        while (filteredAuthorJSON.length > 0) {
            filteredAuthorJSON.pop();
        }
        var texts = $('.tagit-label').map(function () {
            return $(this).text();
        }).get();

        $.each(authorsJSON, function (i, v) {

            for (var s = 0; s < texts.length; s++) {
                if (v._id == texts[s]) {
                    // found it...
                    filteredAuthorJSON.push(v); // stops the loop
                }
            }
        });
        tagitOn = true;
        changeBar(filteredAuthorJSON);
    });

    $(document).on('click', '.tagit-close', function (e) {

        while (filteredAuthorJSON.length > 0) {
            filteredAuthorJSON.pop();
        }


        var texts = $('.tagit-label').map(function () {
            if ($(this).text() != $(event.target).parent().prev().text())
                return $(this).text();
        }).get();


        $.each(authorsJSON, function (i, v) {


            for (var s = 0; s < texts.length; s++) {
                if (v._id == texts[s]) {
                    // found it...
                    filteredAuthorJSON.push(v); // stops the loop
                }
            }
        });

        if (texts.length > 0) {
            tagitOn = true;
            changeBar(filteredAuthorJSON);
        } else {
            tagitOn = false;
            changeBar(authorsJSON);
        }


    });

    $("input[type='checkbox']").click(function () {
        if ($("input[value='conference']").is(':checked')) {
            conferenceFilter = true;
        } else {
            conferenceFilter = false;
        }
        if ($("input[value='workshop']").is(':checked')) {
            workshopFilter = true;
        } else {
            workshopFilter = false;
        }
        if ($("input[value='proceedings-book']").is(':checked')) {
            proceedingsBookFilter = true;
        } else {
            proceedingsBookFilter = false;
        }
        if ($("input[value='journal']").is(':checked')) {
            journalFilter = true;
        } else {
            journalFilter = false;
        }

        if (tagitOn == true) {
            changeBar(filteredAuthorJSON);
        } else {
            changeBar(authorsJSON);
        }
        if($('#addInfos').is(':visible')) {
            updateWordcloud();
        }

    });

    $("#slider").on({
        slide: function() {
            var left = parseInt($("#slider").val()[0]);
            var right = parseInt($("#slider").val()[1]);

            $('#current-time').text(left+" - "+right);
            //$('#slider-margin-value-max').text(right);
        },
        set: function () {

            var left = parseInt($("#slider").val()[0]);
            var right = parseInt($("#slider").val()[1]);

            $('#current-time').text(left+" - "+right);

            timeFrame = [];
            for (var i = left; i <= right; i++) {
                timeFrame.push(i);
            }

            if (tagitOn == true) {
                changeBar(filteredAuthorJSON);
            } else {
                changeBar(authorsJSON);
            }
        },
        change: function () {

            var left = parseInt($("#slider").val()[0]);
            var right = parseInt($("#slider").val()[1]);

            $('#current-time').text(left+" - "+right);

            timeFrame = [];
            for (var i = left; i <= right; i++) {
                timeFrame.push(i);
            }

            if (tagitOn == true) {
                changeBar(filteredAuthorJSON);
            } else {
                changeBar(authorsJSON);
            }
            if($('#addInfos').is(':visible')) {
                updateWordcloud();
            }
        }
    });

}

function getAuthorsFromAPI() {
    $.ajax({
        url: 'http://prostuff.net:3000/authors?dev=true',
        dataType: "text",
        success: function (data) {

            authorsJSON = JSON.parse(data);
            for (var i = 0; i < authorsJSON.length; i++) {
                pubCount.push(parseInt(authorsJSON[i].count));
                pubAuthor.push(authorsJSON[i]._id);
            }
            initAuthors();
            tagit();
            barWordcloudListener();
            //wordcloudLoading


        },
        error: function () {
            // PROPER ERROR HANDLING HERE ;)
            alert("Can't get JSON!");
        }
    });


}

function changeBar(json) {

    json_sort = json.sort(function (obj1, obj2) {
        // Ascending: first age less than the previous
        var count1 = 0;
        var count2 = 0;
        $.each(obj1.count, function (i, l) {
            for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                if (parseInt(i) == timeFrame[ctr]) {
                    $.each(l, function (j, k) {
                        if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "journal" && journalFilter) || (j == "proceedings-book" && proceedingsBookFilter)) {
                            count1 += k;
                        }
                    })
                }
            }
        });
        $.each(obj2.count, function (i, l) {
            for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                if (parseInt(i) == timeFrame[ctr]) {
                    $.each(l, function (j, k) {
                        if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "journal" && journalFilter) || (j == "proceedings-book" && proceedingsBookFilter)) {
                            count2 += k;
                        }
                    })
                }
            }
        });


        return count2 - count1;
    });

    var x = d3.scale.linear()
        .domain([0, d3.max(json, function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "journal" && journalFilter) || (j == "proceedings-book" && proceedingsBookFilter)) {
                                count += k;
                            }
                        })
                    }
                }
            })
            return count;
        })])
        .range([0, 940 - 0 * 2]);

    //Define X axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(6, 1)
        .tickFormat(d3.format("d"))
        .orient("top");

    //Create SVG element
    var svg = d3.select(".chart svg")


    //Create X axis
    svg.select("g.scala")
        .transition().duration(1000).ease("sin-in-out")
        .attr('transform', 'translate(160,50)')
        .call(xAxis);


    // Vertical grid
    svg.select("g[class='grid vertical']")
        .call(d3.svg.axis().scale(x)
            .orient("top")
            .tickSize(-height, 0, 0)
            .tickFormat("")
    );


    var selection = d3.select(".chart svg g.bars g.conference")
        .selectAll("rect")
        .data(json)
        .text(function (d) {
            return d._id;
        })
        .attr('transform', 'translate(160,70)')
        .attr("y", function (d) {
            return json.indexOf(d) * 30;
        })
        .attr('height', 15)
        .attr("width", function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if (j == "conference") {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr("fill", "darkred");

    selection.enter()
        .append("rect")
        .attr('transform', 'translate(160,70)')
        .attr("y", function (d) {
            return json.indexOf(d) * 30;
        })
        .attr('height', 15)
        .attr("width", function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if (j == "conference") {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr("fill", "darkred")
        .text(function (d) {
            return d._id;
        });

    selection.exit().remove();

    if (conferenceFilter == false) {
        selection.remove();
    }


    var selection = d3.select(".chart svg g.bars g.workshop")
        .selectAll("rect")
        .data(json)
        .attr('transform', 'translate(160,70)')
        .attr("y", function (d) {
            return json.indexOf(d) * 30;
        })
        .attr("x", function (d) {

            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if ((j == "conference" && conferenceFilter)) {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr('height', 15)
        .attr("width", function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if (j == "workshop") {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr("fill", "orange");

    selection.enter()
        .append("rect")
        .text(function (d) {
            return d._id;
        })
        .attr('transform', 'translate(160,70)')
        .attr("y", function (d) {
            return json.indexOf(d) * 30;
        })
        .attr("x", function (d) {

            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if ((j == "conference" && conferenceFilter)) {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr('height', 15)
        .attr("width", function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if (j == "workshop") {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr("fill", "orange")
        .text(function (d) {
            return d._id;
        });

    selection.exit().remove();

    if (workshopFilter == false) {
        selection.remove();
    }

    var selection = d3.select(".chart svg g.bars g.proceedings-book")
        .selectAll("rect")
        .data(json)
        .text(function (d) {
            return d._id;
        })
        .attr('transform', 'translate(160,70)')
        .attr("y", function (d) {
            return json.indexOf(d) * 30;
        })
        .attr("x", function (d) {

            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter)) {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr('height', 15)
        .attr("width", function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if (j == "proceedings-book") {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr("fill", "green");

    selection.enter()
        .append("rect")
        .text(function (d) {
            return d._id;
        })
        .attr('transform', 'translate(160,70)')
        .attr("y", function (d) {
            return json.indexOf(d) * 30;
        })
        .attr("x", function (d) {

            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter)) {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr('height', 15)
        .attr("width", function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if (j == "proceedings-book") {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr("fill", "green")
        .text(function (d) {
            return d._id;
        });

    selection.exit().remove();

    if (proceedingsBookFilter == false) {
        selection.remove();
    }


    var selection = d3.select(".chart svg g.bars g.journal")
        .selectAll("rect")
        .data(json)
        .text(function (d) {
            return d._id;
        })
        .attr('transform', 'translate(160,70)')
        .attr("y", function (d) {
            return json.indexOf(d) * 30;
        })
        .attr("x", function (d) {

            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "proceedings-book" && proceedingsBookFilter)) {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr('height', 15)
        .attr("width", function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if (j == "journal") {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr("fill", "steelblue");

    selection.enter()
        .append("rect")
        .text(function (d) {
            return d._id;
        })
        .attr('transform', 'translate(160,70)')
        .attr("y", function (d) {
            return json.indexOf(d) * 30;
        })
        .attr("x", function (d) {

            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "proceedings-book" && proceedingsBookFilter)) {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr('height', 15)
        .attr("width", function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if (j == "journal") {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr("fill", "steelblue")
        .text(function (d) {
            return d._id;
        });

    selection.exit().remove();

    if (journalFilter == false) {
        selection.remove();
    }


    var selection = d3.select(".chart svg g.labels g")
        .selectAll("text")
        .data(json)
        .text(function (d) {
            return d._id;
        })
        .attr('transform', 'translate(150,77)')
        .text(function (d) {
            return d._id;
        })
        .attr("y", function (d) {
            return json.indexOf(d) * 30;
        })
        .attr("stroke", "none")
        .attr("fill", "black")
        .attr("dy", ".35em")
        .attr("text-anchor", "end");

    selection.enter()
        .append("text")
        .text(function (d) {
            return d._id;
        })
        .attr('transform', 'translate(150,77)')
        .text(function (d) {
            return d._id;
        })
        .attr("y", function (d) {
            return json.indexOf(d) * 30;
        })
        .attr("stroke", "none")
        .attr("fill", "black")
        .attr("dy", ".35em")
        .attr("text-anchor", "end");

    selection.exit().remove();

    var selection = d3.select(".chart svg g.values g")
            .selectAll("text")
            .data(json)
            .attr('transform', 'translate(185,77)')
            .text(function (d) {
                var count = 0;
                $.each(d.count, function (i, l) {
                    for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                        if (parseInt(i) == timeFrame[ctr]) {
                            $.each(l, function (j, k) {
                                if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "proceedings-book" && proceedingsBookFilter) || (j == "journal" && journalFilter)) {
                                    count += k;
                                }
                            })
                        }
                    }
                })
                return count;
            })
            .attr("y", function (d) {
                return json.indexOf(d) * 30;
            })
            .attr("x", function (d) {
                var count = 0;
                $.each(d.count, function (i, l) {
                    for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                        if (parseInt(i) == timeFrame[ctr]) {
                            $.each(l, function (j, k) {
                                if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "proceedings-book" && proceedingsBookFilter) || (j == "journal" && journalFilter)) {
                                    count += k;
                                }
                            })
                        }
                    }
                })
                return x(count) + "px";
            })
            .attr("stroke", "none")
            .attr("fill", "black")
            .attr("dy", ".35em")
            .attr("text-anchor", "end")
        ;

    selection.enter()
        .append("text")
        .attr('transform', 'translate(185,77)')
        .text(function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "proceedings-book" && proceedingsBookFilter) || (j == "journal" && journalFilter)) {
                                count += k;
                            }
                        })
                    }
                }
            })
            return count;
        })
        .attr("y", function (d) {
            return json.indexOf(d) * 30;
        })
        .attr("x", function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                    if (parseInt(i) == timeFrame[ctr]) {
                        $.each(l, function (j, k) {
                            if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "proceedings-book" && proceedingsBookFilter) || (j == "journal" && journalFilter)) {
                                count += k;
                            }
                        })
                    }
                }
            })
            return x(count) + "px";
        })
        .attr("stroke", "none")
        .attr("fill", "black")
        .attr("dy", ".35em")
        .attr("text-anchor", "end");

    selection.exit().remove();

    var index = $(".chart svg g.labels g text:contains("+ wordcloudAuthor +")").index()+1;
    $(".chart svg g.labels g text")
        .attr("style","font-weight: 300");
    $(".chart svg g.labels g text:nth-child("+index+")")
        .attr("style","font-weight: 400");
    $(".chart svg g.bars g rect")
        .attr("filter","");
    $(".chart svg g.bars g rect:nth-child("+index+")")
        .attr("filter","url(#dropshadow)");
    $(".chart svg g.bars g rect:nth-child("+index+")")
        .attr("filter","url(#dropshadow)");
    $(".chart svg g.bars g.conference rect")
        .attr("fill","darkred");
    $(".chart svg g.bars g.workshop rect")
        .attr("fill","orange");
    $(".chart svg g.bars g.proceedings-book rect")
        .attr("fill","green");
    $(".chart svg g.bars g.journal rect")
        .attr("fill","steelblue");
    $(".chart svg g.bars g.conference rect:nth-child("+index+")")
        .attr("fill","#A23333");
    $(".chart svg g.bars g.workshop rect:nth-child("+index+")")
        .attr("fill","#FFB733");
    $(".chart svg g.bars g.proceedings-book rect:nth-child("+index+")")
        .attr("fill","#338333");
    $(".chart svg g.bars g.journal rect:nth-child("+index+")")
        .attr("fill","#6B9BC3");

    barWordcloudListener();

}

function initAuthors() {

    var date = [];

    // save all
    $.map(authorsJSON, function (o) {
        $.each(o.count, function (i, l) {
            date.push(i);
        });
    });

    var minDate = Math.min.apply(this, date);
    var maxDate = Math.max.apply(this, date);

    $('#slider-margin-value-min').text(minDate);
    $('#slider-margin-value-max').text(maxDate);

    $("#slider").noUiSlider({
        start: [minDate, maxDate],
        connect: true,
        step: 1,
        range: {
            'min': minDate,
            'max': maxDate
        }
    });

    var left = parseInt($("#slider").val()[0]);
    var right = parseInt($("#slider").val()[1]);

    $('#current-time').text(left+" - "+right);

    d3.select('.chart').select('svg')
        .attr('width', 1240)
        .attr('height', 17740);


    json_sort = authorsJSON.sort(function (obj1, obj2) {
        var count1 = 0;
        var count2 = 0;
        $.each(obj1.count, function (i, l) {
            $.each(l, function (j, k) {
                if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "journal" && journalFilter) || (j == "proceedings-book" && proceedingsBookFilter)) {
                    count1 += k;
                }
            })
        });
        $.each(obj2.count, function (i, l) {
            $.each(l, function (j, k) {
                if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "journal" && journalFilter) || (j == "proceedings-book" && proceedingsBookFilter)) {
                    count2 += k;
                }
            })
        });


        return count2 - count1;
    });


    //Scales
    var y = d3.scale.ordinal()
        .rangeRoundBands([height, 0], .1);

    var x = d3.scale.linear()
        .domain([0, d3.max(authorsJSON, function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                $.each(l, function (j, k) {
                    if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "journal" && journalFilter) || (j == "proceedings-book" && proceedingsBookFilter)) {
                        count += k;
                    }
                })
            })
            return count;
        })])
        .range([0, 940 - 0 * 2]);


    //Define X axis
    var xAxis = d3.svg.axis()
        .scale(x)
        .tickSize(6, 1)
        .tickFormat(d3.format("d"))
        .orient("top");

    //Create SVG element
    var svg = d3.select(".chart svg")


    //Create X axis
    svg.append("g")
        .attr('class', 'scala')
        .attr('transform', 'translate(160,50)')
        .call(xAxis);

    // Vertical grid
    svg.insert("g", ".bars")
        .attr("class", "grid vertical")
        .attr("transform", "translate(160," + 50 + ")")
        .call(d3.svg.axis().scale(x)
            .orient("top")
            .tickSize(-height, 0, 0)
            .tickFormat("")
    );


    if (conferenceFilter) {
        d3.select(".chart svg g.bars")
            .append("g")
            .attr("class", "conference")
            .selectAll("rect")
            .data(authorsJSON)
            .enter().append("rect")
            .text(function (d) {
                return d._id;
            })
            .attr('transform', 'translate(160,70)')
            .attr("y", function (d) {
                return authorsJSON.indexOf(d) * 30;
            })
            .attr('height', 15)
            .attr("width", function (d) {
                var count = 0;
                $.each(d.count, function (i, l) {
                    for (var ctr = 0; ctr < timeFrame.length; ctr++) {
                        if (parseInt(i) == timeFrame[ctr]) {
                            $.each(l, function (j, k) {
                                if (j == "conference") {
                                    count += k;
                                }
                            })
                        }
                    }
                })
                return x(count) + "px";
            })
            .attr("fill", "darkred");
    }

    if (workshopFilter) {
        d3.select(".chart svg g.bars")
            .append("g")
            .attr("class", "workshop")
            .selectAll("rect")
            .data(authorsJSON)
            .enter().append("rect")
            .text(function (d) {
                return d._id;
            })
            .attr("type", authorsJSON._id)
            .attr('transform', 'translate(160,70)')
            .attr("y", function (d) {
                return authorsJSON.indexOf(d) * 30;
            })
            .attr("x", function (d) {

                var count = 0;
                $.each(d.count, function (i, l) {
                    $.each(l, function (j, k) {
                        if ((j == "conference" && conferenceFilter)) {
                            count += k;
                        }
                    })
                })
                return x(count) + "px";
            })
            .attr('height', 15)
            .attr("width", function (d) {
                var count = 0;
                $.each(d.count, function (i, l) {
                    $.each(l, function (j, k) {
                        if (j == "workshop") {
                            count += k;
                        }
                    })
                })
                return x(count) + "px";
            })
            .attr("fill", "orange")
    }

    if (proceedingsBookFilter) {
        d3.select(".chart svg g.bars")
            .append("g")
            .attr("class", "proceedings-book")
            .selectAll("rect")
            .data(authorsJSON)
            .enter().append("rect")
            .text(function (d) {
                return d._id;
            })
            .attr("type", authorsJSON._id)
            .attr('transform', 'translate(160,70)')
            .attr("y", function (d) {
                return authorsJSON.indexOf(d) * 30;
            })
            .attr("x", function (d) {

                var count = 0;
                $.each(d.count, function (i, l) {
                    $.each(l, function (j, k) {
                        if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter)) {
                            count += k;
                        }
                    })
                })
                return x(count) + "px";
            })
            .attr('height', 15)
            .attr("width", function (d) {
                var count = 0;
                $.each(d.count, function (i, l) {
                    $.each(l, function (j, k) {
                        if (j == "proceedings-book") {
                            count += k;
                        }
                    })
                })
                return x(count) + "px";
            })
            .attr("fill", "green")
    }

    if (journalFilter) {
        d3.select(".chart svg g.bars")
            .append("g")
            .attr("class", "journal")
            .selectAll("rect")
            .data(authorsJSON)
            .enter().append("rect")
            .text(function (d) {
                return d._id;
            })
            .attr("type", authorsJSON._id)
            .attr('transform', 'translate(160,70)')
            .attr("y", function (d) {
                return authorsJSON.indexOf(d) * 30;
            })
            .attr("x", function (d) {

                var count = 0;
                $.each(d.count, function (i, l) {
                    $.each(l, function (j, k) {
                        if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "proceedings-book" && proceedingsBookFilter)) {
                            count += k;
                        }
                    })
                })
                return x(count) + "px";
            })
            .attr('height', 15)
            .attr("width", function (d) {
                var count = 0;
                $.each(d.count, function (i, l) {
                    $.each(l, function (j, k) {
                        if (j == "journal") {
                            count += k;
                        }
                    })
                })
                return x(count) + "px";
            })
            .attr("fill", "steelblue")
    }

    d3.select(".chart svg g.labels")
        .append("g")
        .selectAll("text")
        .data(authorsJSON)
        .enter().append("text")
        .attr('transform', 'translate(150,77)')
        .text(function (d) {
            return d._id;
        })
        .attr("y", function (d) {
            return authorsJSON.indexOf(d) * 30;
        })
        .attr("stroke", "none")
        .attr("fill", "black")
        .attr("dy", ".35em") // vertical-align: middle
        .attr("text-anchor", "end")
    ;

    d3.select(".chart svg g.values")
        .append("g")
        .selectAll("text")
        .data(authorsJSON)
        .enter().append("text")
        .attr('transform', 'translate(185,77)')
        .text(function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                $.each(l, function (j, k) {
                    if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "proceedings-book" && proceedingsBookFilter) || (j == "journal" && journalFilter)) {
                        count += k;
                    }
                })
            })
            return count;
        })
        .attr("y", function (d) {
            return authorsJSON.indexOf(d) * 30;
        })
        .attr("x", function (d) {
            var count = 0;
            $.each(d.count, function (i, l) {
                $.each(l, function (j, k) {
                    if ((j == "conference" && conferenceFilter) || (j == "workshop" && workshopFilter) || (j == "proceedings-book" && proceedingsBookFilter) || (j == "journal" && journalFilter)) {
                        count += k;
                    }
                })
            })
            return x(count) + "px";
        })
        .attr("stroke", "none")
        .attr("fill", "black")
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
    ;


}


// Parts of this code are based on https://github.com/jasondavies/d3-cloud
//
// Copyright (c) 2013, Jason Davies.
//    All rights reserved.
//
//    Redistribution and use in source and binary forms, with or without
//modification, are permitted provided that the following conditions are met:
//
//    * Redistributions of source code must retain the above copyright notice, this
//list of conditions and the following disclaimer.
//
//* Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//and/or other materials provided with the distribution.
//
//* The name Jason Davies may not be used to endorse or promote products
//derived from this software without specific prior written permission.
//
//    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
//ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
//WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
//DISCLAIMED. IN NO EVENT SHALL JASON DAVIES BE LIABLE FOR ANY DIRECT, INDIRECT,
//    INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
//PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
//OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
//ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


function newRow($table, cols) {
    $row = $('<tr/>');
    for (i = 0; i < cols.length; i++) {
        $col = $('<tr/>');
        $row.append(cols[i]);
        $row.append($col);
    }
    $table.html($row);
}


var fill = d3.scale.category20b()
var singleAuthorJSON;

var c_w = 500,
    c_h = 300;

var c_words = [],
    c_scale = 1,
    c_complete = 0,
    c_tags,
    c_fontSize,
    c_fetcher;

var c_layout = d3.layout.cloud()
    .timeInterval(100)
    .size([c_w, c_h])
    .fontSize(function (d) {
        return c_fontSize(+d.value);
    })
    .text(function (d) {
        return d.key;
    })
    .on("end", c_draw);

var c_svg = d3.select("#vis").append("svg")
    .attr("width", c_w)
    .attr("height", c_h);


var c_background = c_svg.append("g"),
    vis = c_svg.append("g")
        .attr("transform", "translate(" + [c_w >> 1, c_h >> 1] + ")");


var c_wordSeparators = /[,]/;
(function () {
    var r = 40.5,
        px = 35,
        py = 20;


    var c_radians = Math.PI / 180,

        c_scale = d3.scale.linear(),
        c_arc = d3.svg.arc()
            .innerRadius(0)
            .outerRadius(r);


    c_count = 3;
    c_from = -90;
    c_to = 90;

    c_scale.domain([0, c_count - 1]).range([c_from, c_to]);
    var c_step = (c_to - c_from) / c_count;


    c_layout.rotate(function () {
        return c_scale(~~(Math.random() * c_count));
    });


})();


function c_parseText(text) {
    c_tags = {};
    var c_cases = {};
    text.split(c_wordSeparators).forEach(function (word) {
        c_cases[word.toLowerCase()] = word;
        c_tags[word = word.toLowerCase()] = (c_tags[word] || 0) + 1;
    });
    c_tags = d3.entries(c_tags).sort(function (a, b) {
        return b.value - a.value;
    });
    c_tags.forEach(function (d) {
        d.key = c_cases[d.key];
    });
    c_generate();
}

function c_generate() {
    c_layout
        .font('Impact')
        .spiral("archimedean");
    c_fontSize = d3.scale['log']().range([10, 120]);
    c_complete = 0;
    c_words = [];
    // max 150 words in cloud
    c_layout.stop().words(c_tags.slice(0, max = Math.min(c_tags.length, 150))).start();

}


function c_draw(data, bounds) {
    c_scale = bounds ? Math.min(
        c_w / Math.abs(bounds[1].x - c_w / 2),
        c_w / Math.abs(bounds[0].x - c_w / 2),
        c_h / Math.abs(bounds[1].y - c_h / 2),
        c_h / Math.abs(bounds[0].y - c_h / 2)) / 2 : 1;
    c_words = data;
    var c_text = vis.selectAll("text")
        .data(c_words, function (d) {
            return d.text.toLowerCase();
        });
    c_text.transition()
        //.duration(1000)
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .style("font-size", function (d) {
            return d.size + "px";
        });
    c_text.enter().append("text")
        .attr("text-anchor", "middle")
        .attr("transform", function (d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .style("font-size", function (d) {
            return d.size + "px";
        })
        .on("click", function (d) {
            c_load(d.text);
        })
        .style("opacity", 1e-6)
        .transition()
        //.duration(1000)
        .style("opacity", 1);
    c_text.style("font-family", function (d) {
        return d.font;
    })
        .style("fill", function (d) {

            return fill(d.text.toLowerCase());
        })
        .text(function (d) {
            return d.text;
        });
    var c_exitGroup = c_background.append("g")
        .attr("transform", vis.attr("transform"));
    var c_exitGroupNode = c_exitGroup.node();
    c_text.exit().each(function () {
        c_exitGroupNode.appendChild(this);
    });
    c_exitGroup.transition()
        //.duration(1000)
        .style("opacity", 1e-6)
        .remove();
    //vis.transition()
    //.delay(1000)
    //.duration(750)
    //.attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
    $('#wordcloudLoading').hide();
    $('#addInfos').fadeIn('slow');

}


function c_load(f) {
    c_fetcher = f;
    //if (c_fetcher != null) d3.select("#text").property("value", c_fetcher);
    //if (c_fetcher) c_parseText(c_fetcher);
}


function c_drawCloud(width, height, words) {
    c_w = width;
    c_h = height;
    c_svg = d3.select("#vis").select("svg")
        .attr("width", c_w)
        .attr("height", c_h);
    c_parseText(words);

}


function createWordCloud(width, height, url) {
    $.ajax({
        url: url,
        dataType: 'text',
        beforeSend: function () {
            $('#wordcloudLoading').show();
            //$('#vis').hide();
        },
        error: function () {
            // PROPER ERROR HANDLING HERE ;)
            alert("Can't reach pubdb API!");
        },
        success: function (data) {
            singleAuthorJSON = JSON.parse(data);
            var words = [];
            var rows = [];
            for (var i = 0; i < singleAuthorJSON.length; i++) {
                words.push(singleAuthorJSON[i]["keywords"]);
                rows.push(singleAuthorJSON[i]["title"]);
            }
            var cloudWords = words.join(",");
            //c_layout.size([width , height]);
            c_drawCloud(width, height, cloudWords);
            buildPubdbTable(singleAuthorJSON);

        }
    });


}

function createPubTable(url) {
    $.ajax({
        url: url,
        dataType: 'text',
        beforeSend: function () {
        },
        error: function () {
            // PROPER ERROR HANDLING HERE ;)
            alert("Can't reach pubdb API!");
        },
        success: function (data) {
            singleAuthorJSON = JSON.parse(data);

            buildPubdbTable(singleAuthorJSON);

        }
    });


}

function buildPubdbTable(singleAuthorJSON) {

    $(function () {
        var table = $('<tr>');
        var row = $('<tr>').attr('class', 'pubItem');
        var yearUsed = 0;
        sortedJSON = singleAuthorJSON.sort(function (a, b) {
            return parseFloat(b.year) - parseFloat(a.year)
        });
        $.each(sortedJSON, function (i, item) {

            // add year
            if (yearUsed != item.year) {
                yearUsed = item.year;
                table.append($('<tr>').attr('class', 'yearTable')).append($('<b>').text(item.year));
            }


            //add authors and if possible add their url
            var authors = $('<span>');
            for (var i = 0; i < item.authors.length; i++) {
                var authUrl = '';
                for (var j = 0; j < authorsJSON.length; j++) {
                    if (authorsJSON[j]['_id'] == item.authors[i]) {
                        authUrl = authorsJSON[j]['url'];
                    }
                }
                if (authUrl !== '') {
                    authors.append($('<a>').text(item.authors[i].toString()).attr('href', authUrl));
                    authors.append(', ');
                } else {
                    authors.append(item.authors[i].toString());
                    authors.append(', ');

                }
            }

            var pubLink = 'http://www.medien.ifi.lmu.de/forschung/publikationen/detail?pub=' + item.pdf.split('/').pop().replace('.pdf', '');
            row.append(authors);
            row.append($('<br/>'));

            if (item.pdf !== '') {
                row.append($('<b>').append($('<a>').text(item.title).attr('href', pubLink).attr('target', '_blank')));
            }
            else {
                row.append($('<b>').text(item.title));
            }

            row.append($('<br/>'));
            row.append($('<i>').text(item.info));
            row.append($('<br>'));
            if (item.pdf !== '') {
                row.append($('<a>').attr('href', item.pdf).attr('target', '_blank').append($('<img>').attr('src', 'pdf.png').attr('width', '16').attr('height', '16').attr('title', 'Download PDF')));
            }
            row.append($('<div class="spacer">'));

            table.append(row);
            row = $('<tr>').attr('class', 'pubItem');
        });

        $('#pubTable').html(table);
    });
}

//<a href="/pubdb/publications/pub/wiethoff2014mab/wiethoff2014mab.pdf"><img src="/pubdb/publications/images/pdf.png" title="Download PDF" /></a><span>Download</span>
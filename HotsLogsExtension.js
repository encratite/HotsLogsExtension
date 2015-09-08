var TableExtension = (function () {
    var type = TableExtension;
    
    function TableExtension(table) {
        this._table = table;
        this._addHeader();
        this._addCells();
        this._addClickHandlers();
    }
    
    var proto = type.prototype;

    proto._addHeader = function () {
        var headRow = this._table.querySelector("thead tr");
        var header = document.createElement("th");
        header.scope = "col";
        header.className = "rgHeader";
        header.textContent = "Win/Loss Difference";
        headRow.appendChild(header);
    };

    proto._addCells = function () {
        var rows = this._table.querySelectorAll("tbody tr");
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var gameCell = row.querySelector("td:nth-child(5)");
            var winRatioCell = row.querySelector("td:nth-child(7)");
            var games = parseInt(gameCell.textContent);
            var winRatio = parseFloat(winRatioCell.textContent);
            var wins = Math.round(winRatio / 100 * games);
            var losses = games - wins;
            var winLossDifference = wins - losses;
            var newCell = document.createElement("td");
            var prefix;
            if (winLossDifference === 0) {
                prefix = "±";
            }
            else if (winLossDifference > 0) {
                prefix = "+";
                newCell.style.color = "#4CA300";
            }
            else {
                prefix = "";
                newCell.style.color = "#D10000";
            }
            newCell.textContent = prefix + winLossDifference;
            row.appendChild(newCell);
        }
    };
    
    proto._addClickHandlers = function () {
        var headers = this._table.querySelectorAll("th:nth-child(n + 1)");
        var that = this;
        for (var i = 0; i < headers.length; i++) {
            var header = headers[i];
            header.classList.remove("rgSorted");
            header.onclick = this._sort.bind(this, i);
            var link = header.querySelector("a");
            if (link != null) {
                header.removeChild(link);
                var textNode = document.createTextNode(link.textContent);
                header.appendChild(textNode);
            }
            var button = header.querySelector("button");
            if (button != null) {
                header.removeChild(button);
            }
        }
    };
    
    proto._sort = function (columnIndex) {
        var rows = [];
        var body = this._table.querySelector("tbody");
        var nodes = body.querySelectorAll("tr");
        for (var i = 0; i < nodes.length; i++) {
            var row = nodes[i];
            rows.push(row);
            body.removeChild(row);
        }
        var that = this;
        rows.sort(function (row1, row2) {
            var x = that._getValue(row1, columnIndex);
            var y = that._getValue(row2, columnIndex);
            if (typeof x !== typeof y) {
                throw new Error("Invalid comparison (" + typeof x + ", " + typeof y + ")");
            }
            else if (typeof x === "string") {
                return x.localeCompare(y);
            }
            else {
                return y - x;
            }
        });
        rows.forEach(function (row, index) {
            row.className = index % 2 === 0 ? "rgRow" : "rgAltRow";
            body.appendChild(row);
        });
    };
    
    proto._getValue = function (row, columnIndex) {
        var index = columnIndex + 1;
        var column = row.querySelector("td:nth-child(" + index + ")");
        var content = column.textContent;
        var timePattern = /(\d+):(\d+):(\d+)/;
        var timeMatch = timePattern.exec(content);
        if (timeMatch != null) {
            var hours = parseInt(timeMatch[1]);
            var minutes = parseInt(timeMatch[2]);
            var seconds = parseInt(timeMatch[3]);
            var totalSeconds = seconds + 60 * (minutes + 60 * hours);
            return totalSeconds;
        }
        var numericPattern = /-?\d+(?:\.\d+)?/;
        var match = numericPattern.exec(content);
        if (match == null) {
            return content;
        }
        var numeric = parseFloat(match[0]);
        return numeric;
    };
    
    return type;
})();

(function () {
    var table = document.getElementById("ctl00_MainContent_RadGridCharacterStatistics_ctl00");
    if (table != null) {
        new TableExtension(table);
    }
    else {
        console.error("Failed to detect hero table");
    }
})();
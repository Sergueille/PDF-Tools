const table = document.getElementById("res-grid");
const newColInput = document.getElementById("new-col-input");
const fileNameInput = document.getElementById("file-name")

const maxXDiff = 15;

var tableData = [];
var colNameElements = [];
var valuesElements = [];

newColInput.onkeydown = () => {
    var keyCode = window.event.code || window.event.key;
    if (keyCode == 'Enter') {
        AddColumn(newColInput.value);
    }
};

function AddColumn(name) {
    tableData.push({
        colname: name,
        values: GetColValues(name)
    });

    DisplayTable();
}

function RenameColumn(id, name) {
    if (!name.trim()) {
        DeleteColumn(id)
        return;
    }

    tableData[id] = {
        colname: name,
        values: GetColValues(name)
    };

    DisplayTable();
}

function DeleteColumn(id) {
    tableData.splice(id);
    DisplayTable();
}

// Destroys all the table and create new elements
function DisplayTable() {
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    for (let i = 0; i < tableData.length; i++) {
        const column = tableData[i];

        // Column title
        let element = document.createElement("div");
        element.setAttribute("class", "colname");
        element.style.setProperty("grid-row", "1");

        // Column title input field
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("class", "textinput");
        input.setAttribute("value", column.colname);
        input.setAttribute("placeholder", "Laisser vide pour supprimer");
        input.onkeydown = (event) => {
            var keyCode = window.event.code || window.event.key;
            if (keyCode == 'Enter') {
                RenameColumn(i, event.target.value); // Closure bug on referencing i?
            }
        };

        table.appendChild(element);
        element.appendChild(input);

        // Values
        for (let j = 0; j < column.values.length; j++) {
            let value = document.createElement("div");
            value.style.setProperty("grid-row", j + 2);
            value.innerHTML = column.values[j]
            table.appendChild(value);
        }

        // Correct nb of columns for grid
        table.style.setProperty("grid-template-columns", `repeat(${tableData.length}, ${100 / tableData.length}%)`);
    }
}

function GetColValues(name) {
    if (!currentPageTexts || currentPageTexts.items.length === 0)
        return [];

    let colText = undefined;
    let maxScore = 0;

    // Get text element (best match)
    currentPageTexts.items.forEach(el => {
        let score = (el.str.toLowerCase().includes(name.toLowerCase())? 10000 : 0) - el.str.length;

        if (score > maxScore){
            maxScore = score;
            colText = el;
        }
    })

    if (colText == undefined || !colText.str.trim())
        return [];

    let colXleft = colText.transform[4] - (colText.width / 2);
    let colXcenter = colText.transform[4];
    let colY = colText.transform[5];

    let res = [];

    currentPageTexts.items.forEach(text => {
        let xleft = text.transform[4] - (text.width / 2);
        let xCenter = text.transform[4];
        let y = text.transform[5];

        if (Math.abs(colXcenter - xCenter) < maxXDiff) {
            if (y < colY) {
                if (text.str && text.str.trim()) {
                    res.push(text);
                }
            }
        }
    });

    console.log(res);
    return res.map(text => text.str);
}

function GetFile() {
    let name = fileNameInput.value + ".csv";

    let content = "";
    for (let i = 0; i < tableData.length; i++) {
       content += `"${tableData[i].colname}";`;
    }
    content += "\n"

    let maxSize = Math.max(...tableData.map(col => col.values.length));

    for (let i = 0; i < maxSize; i++) {
        for (let j = 0; j < tableData.length; j++) {
            if (i < tableData[j].values.length)
                content += `"${tableData[j].values[i]}";`;
            else 
                content += " ;"
        }
        content += "\n"
    }

    const a = document.createElement('a');
    const blob = new Blob([content], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    a.setAttribute('href', url);
    a.setAttribute('download', name);
    a.click();
}

const table = document.getElementById("res-grid"); // The results table
const newColInput = document.getElementById("new-col-input"); // The input for a new column
const fileNameInput = document.getElementById("file-name"); // The input for the file name

// Delete when poved per column
var maxXDiff = 15;

// All the data of the table
// See AddColumn() for object structure
var tableData = [];

// Add column when press enter on input
newColInput.onkeydown = () => {
    var keyCode = window.event.code || window.event.key;
    if (keyCode == 'Enter') {
        AddColumn();
    }
};

// Add a new column
function AddColumn() {
    // Do nothing if no name entered
    if (!newColInput.value || !newColInput.value.trim())
        return;

    // Create column
    tableData.push({
        colname: newColInput.value, // The name of the column
        values: GetColValues(newColInput.value) // Get values from doc
    });

    DisplayTable(); // Update UI
}

function RenameColumn(id, name) {
    // If no name, remove column
    if (!name.trim()) {
        DeleteColumn(id)
        return;
    }

    // Update name and values
    tableData[id] = {
        colname: name,
        values: GetColValues(name)
    };

    DisplayTable(); // Update UI
}

function DeleteColumn(id) {
    // Ramove the column
    tableData.splice(id);
    DisplayTable(); // Update UI
}

// Refresh all values
function RefreshAll() {
    tableData.forEach(column => {
        column.values = GetColValues(column.colname) // Get new values
    })

    DisplayTable();
}

// Destroys all the table and create new elements
function DisplayTable() {
    // Destory chids
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    // For each column:
    for (let i = 0; i < tableData.length; i++) {
        const column = tableData[i];

        // Create olumn title
        let element = document.createElement("div");
        element.setAttribute("class", "colname");
        element.style.setProperty("grid-row", "1");

        // Create column title input field
        let input = document.createElement("input");
        input.setAttribute("type", "text");
        input.setAttribute("class", "textinput");
        input.setAttribute("value", column.colname);
        input.setAttribute("placeholder", "Laisser vide pour supprimer");
        input.onkeydown = (event) => {
            var keyCode = window.event.code || window.event.key;
            if (keyCode == 'Enter') {
                RenameColumn(i, event.target.value); // Closure bug on referencing i? Don't know how this works
            }
        };

        table.appendChild(element);
        element.appendChild(input);

        // Creates values
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

// Get values for a column
function GetColValues(name) {
    // Return if no page selected or no text in page
    if (!currentPageTexts || currentPageTexts.items.length === 0)
        return [];

    // Get shorter text element that contains the name
    let colText = undefined; // Result
    let maxScore = 0;
    currentPageTexts.items.forEach(el => {
        let score = (el.str.toLowerCase().includes(name.toLowerCase())? 10000 : 0) - el.str.length;

        if (score > maxScore){
            maxScore = score;
            colText = el;
        }
    })

    // If none found, return nothing
    if (colText == undefined || !colText.str.trim())
        return [];

    // Positions of the column title
    let colXleft = colText.transform[4] - (colText.width / 2); // May not be working
    let colXcenter = colText.transform[4];
    let colY = colText.transform[5];

    let res = []; // Results

    // For each text element in the page
    currentPageTexts.items.forEach(text => {
        // Get text positions
        let xleft = text.transform[4] - (text.width / 2); // May not be working
        let xCenter = text.transform[4];
        let y = text.transform[5];
        
        if (Math.abs(colXcenter - xCenter) < maxXDiff) { // If x difference is smaller than limit
            if (y < colY) { // If text is below column name
                if (text.str && text.str.trim()) { // If text is not empty
                    res.push(text); // Add to results!
                }
            }
        }
    });

    // Get only text content
    return res.map(text => text.str);
}

// Get CSVfile and start downloading
function GetFile() {
    // Name of the file
    let name;
    if (!fileNameInput.value || !fileNameInput.value.trim()) // Get name of PDF if no name specified
        name = docFile.name.replace(".pdf", ".csv");
    else
        name = fileNameInput.value + ".csv";

    // Add column names
    let content = "";
    for (let i = 0; i < tableData.length; i++) {
       content += `"${tableData[i].colname}";`;
    }
    content += "\n"

    // Size of the longest column
    let maxSize = Math.max(...tableData.map(col => col.values.length));

    // For each row
    for (let i = 0; i < maxSize; i++) {
        // For each column
        for (let j = 0; j < tableData.length; j++) {
            if (i < tableData[j].values.length)
                content += `"${tableData[j].values[i]}";`; // Get value
            else 
                content += " ;" // Empty if longer than column
        }
        content += "\n"
    }

    // Download the file
    const a = document.createElement('a');
    const blob = new Blob([content], {type: "text/plain"});
    const url = URL.createObjectURL(blob);
    a.setAttribute('href', url);
    a.setAttribute('download', name);
    a.click();
}

function SetMaxXDiff(event) {
    console.log(event.target.value);
    maxXDiff = event.target.value;
}

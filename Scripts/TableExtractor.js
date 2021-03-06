const table = document.getElementById("res-grid"); // The results table
const newColInput = document.getElementById("new-col-input"); // The input for a new column
const regexInput = document.getElementById("regex"); // The input for the regex

// Settings input
const settingsDropdown = document.getElementById("setting-select");
const maxXDiffInput = document.getElementById("max-x-diff");
const referenceColumnCheck = document.getElementById("reference-column");
const alignValuesCheck = document.getElementById("align-values");
const truncateCheck = document.getElementById("truncate-check");

const Ymargin = 5;

// All the data of the table
// See AddColumn() for object structure
var tableData = [];

var selectedColumn; // Selected column in setting tab
var mainColumn; // Column to refer to for y alignement
var mainColumnValuesPos = []; // Y position of the values in the main column
var truncateColumn; // Column to refer to for table truncation
var truncateMinY = []; // THe min Y allowed to allow value in the table

var hasCreatedColumn = false; // Il the user hes already created a column
var mustConfirmToLeave = false;

window.onbeforeunload = function () {
    if (mustConfirmToLeave)
        return 'Si vous partez, vos données seront pardues!';
};

for (let i = 0; i < 100; i++) {
    mainColumnValuesPos.push([]);
    truncateMinY.push(-1);
}

UpdateSettingsUI();

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

    hasCreatedColumn = true;

    // Create column
    tableData.push({
        colname: newColInput.value, // The name of the column
        values: [], // Values of the column
        maxXDiff: 15, // Max difference between column name x and values x
        alignValues: true, // Should values be duplicated when there is a hole in the table
    });

    // First columns
    if (tableData.length === 1) {
        selectedColumn = tableData[0]; // Select
        mainColumn = selectedColumn;
        UpdateSettingsUI();
    }

    tableData[tableData.length - 1].values = GetColValues(tableData[tableData.length - 1]); // Get values from doc

    DisplayTable(); // Update UI
    UpdateSettingsDropdown();

    newColInput.value = "";
}

function RenameColumn(id, name) {
    // If no name, remove column
    if (!name.trim()) {
        DeleteColumn(id)
        return;
    }

    // Update name and values
    tableData[id].colname = name
    tableData[id].values = GetColValues(tableData[id])

    DisplayTable(); // Update UI
    UpdateSettingsDropdown();
}

function DeleteColumn(id) {
    if (tableData[id] == selectedColumn) {
        if (tableData.length > 0) {
            selectedColumn = tableData[0]
            settingsDropdown.value = 0;
            UpdateSettingsUI();
        } else {
            selectedColumn = null;
            UpdateSettingsUI();
        }
    }

    if (tableData[id] == mainColumn) {
        if (tableData.length > 0)
            mainColumn = tableData[0]
        else
            mainColumn = null;

        UpdateSettingsUI();
    }

    // Remove the column
    tableData.splice(id, 1);
    DisplayTable(); // Update UI
    UpdateSettingsDropdown();
}

// Refresh all values
function RefreshAll() {
    if (truncateColumn)
        truncateColumn.values = GetColValues(truncateColumn, true);

    if (mainColumn)
        mainColumn.values = GetColValues(mainColumn);

    tableData.forEach(column => {
        if (column != mainColumn)
            column.values = GetColValues(column); // Get new values
    })

    DisplayTable();
}

// Destroys all the table and create new elements
function DisplayTable() {
    if (!hasCreatedColumn) return;

    mustConfirmToLeave = true;

    // Destroy chids
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

function GetColValues(column, ignoreMainCol = false) {
    res = [];

    for (let id = 0; id < currentPagesId.length; id++) {
        res.push(...GetColValuesOnPage(column, id, ignoreMainCol));
    }
    return res;
}

// Get values for a column
// The page id is the id of the page in the selected pages, not in the document
function GetColValuesOnPage(column, pageId, ignoreMainCol = false) {
    // Search for column title
    // Get shorter text element that contains the name
    let colText = undefined; // Result
    let maxScore = 0;
    currentPageTexts[pageId].forEach(el => {
        let score = (el.str.toLowerCase().includes(column.colname.toLowerCase()) ? 10000 : 0) - el.str.length;

        if (score > maxScore) {
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

    let isMainColumn = column == mainColumn;
    let mustAlign = column.alignValues && !isMainColumn && mainColumn && !ignoreMainCol;
    let excpectedNearestElement = 0;

    if (isMainColumn) {
        mainColumnValuesPos[pageId] = [];
    }

    // For each text element in the page
    currentPageTexts[pageId].forEach(text => {
        // Get text positions
        let xleft = text.transform[4] - (text.width / 2); // May not be working
        let xCenter = text.transform[4];
        let y = text.transform[5];

        if (Math.abs(colXcenter - xCenter) < column.maxXDiff) { // If x difference is smaller than limit
            if (y < colY) { // If text is below column name
                if (text.str && text.str.trim() && PassRegex(text.str)) { // If text is not empty ans pass regex
                    if (!truncateColumn || column == truncateColumn || y >= truncateMinY[pageId] - Ymargin) { // If can't truncate or not truncated
                        let canAdd = true;
                        if (mustAlign) { // Align values
                            let nearest = GetNearestElementIDOfMainColumn(y, pageId);

                            if (nearest < excpectedNearestElement) { // New line of value
                                res[nearest][0] += " " + text.str;
                                canAdd = false;
                            }
                            else {
                                let emptyCount = nearest - excpectedNearestElement; // Get number of values that have been skipped
                                for (let i = 0; i < emptyCount; i++) {
                                    res.push(["", 0]) // Fill empty
                                }
                                excpectedNearestElement += emptyCount + 1;
                            }
                        }

                        if (canAdd)
                            res.push([text.str, y]); // Add to results!

                        if (isMainColumn) // Update main column values pos
                            mainColumnValuesPos[pageId].push(y)
                    }
                }
            }
        }
    });

    // Get truncation min
    if (column == truncateColumn) {
        truncateMinY[pageId] = res[res.length - 1][1];
    }

    // Get only text content
    return res.map(el => el[0]);
}

function PassRegex(value) {
    if (!regexInput.value || !regexInput.value.trim())
        return true;

    const regex = new RegExp(regexInput.value);
    return !regex.test(value);
}

// Get the id of the nearest value in main column
function GetNearestElementIDOfMainColumn(Ypos, pageId) {
    let minDist = 10000000;
    let nearest;

    for (let i = 0; i < mainColumnValuesPos[pageId].length; i++) {
        let dist = Math.abs(mainColumnValuesPos[pageId][i] - Ypos);
        if (dist < minDist) {
            minDist = dist;
            nearest = i;
        }
    }

    return nearest;
}

// Update choices in the dorpdown
function UpdateSettingsDropdown() {
    // Remove dropdown options
    while (settingsDropdown.firstChild) {
        settingsDropdown.removeChild(settingsDropdown.firstChild);
    }

    // Add new options
    for (let i = 0; i < tableData.length; i++) {
        const column = tableData[i];
        const element = document.createElement("option")
        element.setAttribute("value", i);
        element.text = column.colname;
        settingsDropdown.appendChild(element);
    }
}

// Update the settins UI EXCEPT FOR THE DROPDOWN
function UpdateSettingsUI() {
    if (selectedColumn) {
        document.getElementById("res-settings-inner").classList.remove("transparent")
        maxXDiffInput.value = selectedColumn.maxXDiff;
        alignValuesCheck.checked = selectedColumn.alignValues;
        referenceColumnCheck.checked = selectedColumn == mainColumn;
        truncateCheck.checked = selectedColumn == truncateColumn;
    }
    else {
        document.getElementById("res-settings-inner").classList.add("transparent");
    }
}

function ApplySettings() {
    selectedColumn.maxXDiff = maxXDiffInput.value;
    selectedColumn.alignValues = alignValuesCheck.checked;

    if (!selectedColumn)
        return;

    if (referenceColumnCheck.checked && selectedColumn != mainColumn) { // Change main column
        mainColumn = selectedColumn;
        RefreshAll();
    }
    else if (!referenceColumnCheck.checked && selectedColumn == mainColumn) { // Keep checked
        referenceColumnCheck.checked = true;
    }

    if (truncateCheck.checked && selectedColumn != truncateColumn) { // Change truncate column
        truncateColumn = selectedColumn;
        RefreshAll();
    }
    else if (!truncateCheck.checked && selectedColumn == truncateColumn) { // Disable
        truncateColumn = null;
        RefreshAll();
    }

    selectedColumn.values = GetColValues(selectedColumn); // Update values
    DisplayTable(); // Update UI
}

function SelectColumn() {
    selectedColumn = tableData[settingsDropdown.value];
    UpdateSettingsUI();
}

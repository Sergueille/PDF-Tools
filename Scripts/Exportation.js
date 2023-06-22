const extensionSelect = document.getElementById("export-select"); // The dropdown for the file extesion
const fileNameInput = document.getElementById("file-name"); // The input for the file name

// Get CSVfile and start downloading
function GetFile() {
    mustConfirmToLeave = false;
    let extension = extensionSelect.value;
    let content;
    let MIMEType;

    switch (extension) {
        case ".html":
            MIMEType = "text/html"
            content = GetHTML();
            break;
        case ".xml":
            MIMEType = "text/xml"
            content = GetXML();
            break;
        case ".csv":
            MIMEType = "text/csv"
            content = GetCSV(",");
            break;
        case ".ssv":
            MIMEType = "text/ssv"
            content = GetCSV(";");
            break;
        case ".tsv":
            MIMEType = "text/tsv"
            content = GetCSV("\t");
            break;

        default:
            throw new Error("Wrong file format!")
    }

    // Name of the file
    let name;
    if (!fileNameInput.value || !fileNameInput.value.trim()) // Get name of PDF if no name specified
        name = docFile.name.replace(".pdf", extension);
    else
        name = fileNameInput.value + extension;

    // Download the file
    const a = document.createElement('a');
    const blob = new Blob([content], { type: MIMEType });
    const url = URL.createObjectURL(blob);
    a.setAttribute('href', url);
    a.setAttribute('download', name);
    a.click();
}

function CheckHelp() {
    if (extensionSelect.value === "help")
    {
        extensionSelect.value = ".xml"
        Object.assign(document.createElement('a'), {
            target: '_blank',
            href: "help.html#file-help",
        }).click();
    }
}

function GetCSV(separator = ";") {
    // Add column names
    let content = "";
    for (let i = 0; i < tableData.length; i++) {
        let escaped = EscapeChars(tableData[i].colname, ["\"", separator]);
        content += `"${escaped}"${separator}`;
    }
    content += "\n"

    // Size of the longest column
    let maxSize = Math.max(...tableData.map(col => col.values.length));

    // For each row
    for (let i = 0; i < maxSize; i++) {
        // For each column
        for (let j = 0; j < tableData.length; j++) {
            if (i < tableData[j].values.length)
            {
                let escaped = EscapeChars(tableData[j].values[i], ["\"", separator]);
                content += `"${escaped}"${separator}`; // Get value
            }
            else
                content += `"" ${separator}` // Empty if longer than column
        }
        content += "\n"
    }

    return content;
}

function GetHTML() {
    let content = `<html>
<head>
    <meta charset="UTF-8">
</head>

<body>
<style>
    .Head {
        background-color: gray;
        color: white;
    }
</style>
<table border="1">
    <tr>\n`;

    for (let i = 0; i < tableData.length; i++) {
        content += `    <td class="Head">${tableData[i].colname}</td>\n`;
    }
    content += "</tr>\n"

    // Size of the longest column
    let maxSize = Math.max(...tableData.map(col => col.values.length));

    // For each row
    for (let i = 0; i < maxSize; i++) {
        content += "<tr>\n"

        // For each column
        for (let j = 0; j < tableData.length; j++) {
            if (i < tableData[j].values.length)
                content += `    <td>${tableData[j].values[i]}</td>\n`; // Get value
            else
                content += `    <td></td>\n` // Empty if longer than column
        }
        content += "</tr>\n"
    }

    return content + "</table>\n</html>";
}

function GetXML() {
    let content = `<xml>\n`;

    // Size of the longest column
    let maxSize = Math.max(...tableData.map(col => col.values.length));

    for (let i = 0; i < maxSize; i++) {
        content += `<row>`;

        for (let j = 0; j < tableData.length; j++) {
            if (i < tableData[j].values.length)
                content += `    <${tableData[j].colname}>${tableData[j].values[i]}</${tableData[j].colname}>\n`; // Get value
        }

        content += `</row>`;
    }

    return content + "</xml>";
}

function EscapeChars(text, escapeChars)
{
    let res = "";

    for (char of text)
    {
        if (escapeChars.includes(char))
            res += "\\" + char;
        else
            res += char
    }

    return res;
}

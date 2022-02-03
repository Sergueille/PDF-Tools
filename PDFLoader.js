const canvas = document.getElementById("preview-canvas"); // Preview canvas
const page = document.querySelector(".table-extractor"); // Main page
const fileSelector = document.getElementById("file"); // The file input
const pageSelector = document.getElementById("page-selector"); // Parent of the page buttons

// Setup PDF.js and canvas
const ctx = canvas.getContext("2d");
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'PdfJS/build/pdf.worker.js';

const previewResolution = 0.5; // Smaller values for high resolition. Don't know why.
var pageViewport; // The viewport of the page, must be retrieved from PDF.JS once! Why? Because it increase tne resolution each time until it chrash.

var docFile; // The file that was loaded
var currentDoc; // The PDF document from PDF.js
var currentPage; // The currect page objects
var currentPageTexts; // A list of text objects on the current page
var currentPageId = 1; // The ID of the current page

// Hide the resuts tab
page.style.setProperty("grid-template-columns", "100vw auto")

// User dropped a file
function OnDragDoc(event) {
    event.preventDefault();
    if (event.dataTransfer.items) {
        if (event.dataTransfer.items[0].kind === 'file') {
            OnGetDoc(event.dataTransfer.items[0].getAsFile());
        }
    }
    else {
        OnGetDoc(dataTransfer.files[0]);
    }
}

// User selected a file
function OnGetDoc(doc) {
    docFile = doc;
    let fileReader = new FileReader();

    fileReader.onload = function () {
        var typedarray = new Uint8Array(this.result);
        const task = pdfjsLib.getDocument(typedarray);
        // PDF loaded
        task.promise.then(pdf => {
            currentDoc = pdf;
            OnDocLoaded(currentDoc);
        });
    };

    // Load file
    fileReader.readAsArrayBuffer(doc);
}

// Called when doc is loaded
function OnDocLoaded() {
    page.style.setProperty("grid-template-columns", "500px auto") // Display the resuts tab
    fileSelector.classList.remove("big"); // Change file input style
    fileSelector.classList.add("small");
    pageSelector.classList.remove("transparent"); // Display the page selector
    pageViewport = null; // Remove viewport to create another
    currentPageId = 1;
    selectPage();
}

// Called when a page is loaded
async function OnPageLoaded() {
    var textContent = currentPage.getTextContent();
    currentPageTexts = await textContent.then(text => text);
    RefreshAll();
}

// Update preview, update
function selectPage() {
    // Get the page
    currentDoc.getPage(currentPageId).then(function (page) {
        currentPage = page;
        OnPageLoaded();

        if (!pageViewport) {
            pageViewport = page.getViewport({ scale: previewResolution });
            let newScale = canvas.width / pageViewport.width;
            pageViewport = page.getViewport({ scale: newScale });
        }

        // Set canvas size
        canvas.height = pageViewport.height;
        canvas.width = pageViewport.width;

        // Render PDF page
        var renderContext = {
            canvasContext: ctx,
            viewport: pageViewport
        };
        // TODO: get promise variable and prevent rendering two page at the same time
        page.render(renderContext);
    });

    // Update page counter
    document.getElementById("page-id").innerHTML = `${currentPageId} / ${currentDoc.numPages}`;
}

function NextPage() {
    if (currentPageId < currentDoc.numPages) {
        currentPageId++;
        selectPage()
    }
}

function PreviousPage() {
    if (currentPageId > 1) {
        currentPageId--;
        selectPage()
    }
}

// Open PDF in a new tab
function OpenPDF() {
    window.open(URL.createObjectURL(docFile), "_blank");
}
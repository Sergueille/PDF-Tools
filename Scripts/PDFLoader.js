const canvas = document.getElementById("preview-canvas"); // Preview canvas
const page = document.querySelector(".table-extractor"); // Main page
const fileSelector = document.getElementById("file"); // The file input
const pageSelector = document.getElementById("page-selector"); // Parent of the page buttons
const pageSelectorMultiple = document.getElementById("page-selector-multiple"); // Parent of the page buttons

// Setup PDF.js and canvas
const ctx = canvas.getContext("2d");
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'PdfJS/build/pdf.worker.js';

const previewResolution = 0.5; // Smaller values for high resolition. Don't know why.
var pageViewport; // The viewport of the page, must be retrieved from PDF.JS once! Why? Because it increase tne resolution each time until it chrash.

var docFile; // The file that was loaded
var currentDoc; // The PDF document from PDF.js
var currentPages; // The currect page objects
var currentPageTexts; // A list of text objects on the current page
var currentPagesId = [1]; // The ID of the current page

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
    pageSelector.classList.remove("no-display"); // Display the page selector
    pageViewport = null; // Remove viewport to create another
    currentPagesId = [1];
    selectPages();
}

// Called when a page is loaded
async function OnPagesLoaded() {
    // Get viewport
    if (!pageViewport) {
        pageViewport = currentPages[0].getViewport({ scale: previewResolution });
        let newScale = canvas.width / pageViewport.width;
        pageViewport = currentPages[0].getViewport({ scale: newScale });
    }

    // Set canvas size
    canvas.height = pageViewport.height;
    canvas.width = pageViewport.width;

    // Render PDF page
    var renderContext = {
        canvasContext: ctx,
        viewport: pageViewport
    }
    // TODO: get promise variable and prevent rendering two page at the same time
    currentPages[0].render(renderContext);

    // Update page tools
    if (currentPagesId.length > 1){
        pageSelector.classList.add("no-display");
        pageSelectorMultiple.classList.remove("no-display");
    } else {
        pageSelector.classList.remove("no-display");
        pageSelectorMultiple.classList.add("no-display");
    }

    document.getElementById("page-id").innerHTML = `${currentPagesId[0]} / ${currentDoc.numPages}`;
    document.getElementById("multiple-page-id").innerHTML = `${currentPagesId.length} pages sélectionnées`;

    // Get pages text
    currentPageTexts = [];
    for (let i = 0; i < currentPages.length; i++) {
        var textContents = await currentPages[i].getTextContent()
        currentPageTexts.push(...textContents.items);
    }

    RefreshAll();
}

// Update preview, update
async function selectPages() {
    currentPages = [];

    for (let i = 0; i < currentPagesId.length; i++) {
        var page = await currentDoc.getPage(currentPagesId[i]);
        currentPages.push(page);
    }

    OnPagesLoaded();
}

function NextPage() {
    if (currentPagesId[0] < currentDoc.numPages) {
        currentPagesId[0]++;
        selectPages()
    }
}

function PreviousPage() {
    if (currentPagesId[0] > 1) {
        currentPagesId[0]--;
        selectPages()
    }
}

// Open PDF in a new tab
function OpenPDF() {
    window.open(URL.createObjectURL(docFile), "_blank");
}
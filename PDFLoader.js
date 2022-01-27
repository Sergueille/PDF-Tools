const canvas = document.getElementById("preview-canvas");
const page = document.querySelector(".page");

const ctx = canvas.getContext("2d");
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'PdfJS/build/pdf.worker.js';

const previewScale = 0.8;

var currentDoc;
var currentPage;
var currentPageTexts;
var currentPageId = 1;

page.style.setProperty("grid-template-columns", "100vw auto")

function OnGetDoc(doc) {
    let fileReader = new FileReader();

    fileReader.onload = function () {
        page.style.setProperty("grid-template-columns", "500px auto")

        var typedarray = new Uint8Array(this.result);
        const task = pdfjsLib.getDocument(typedarray);
        task.promise.then(pdf => {
            currentDoc = pdf;
            OnDocLoaded(currentDoc);
        });
    };

    fileReader.readAsArrayBuffer(doc);
}

function OnDocLoaded() {
    selectPage();
}

async function OnPageLoaded() {
    var textContent = currentPage.getTextContent();
    currentPageTexts = await textContent.then(text => text);

    currentPageTexts.items.forEach(text => {
        console.log(text);
    });
}

function selectPage() {
    // Using promise to fetch the page
    currentDoc.getPage(currentPageId).then(function (page) {
        currentPage = page;
        OnPageLoaded()
        let viewport = page.getViewport({ scale: 0.8 });
        let newScale = canvas.width / viewport.width;
        viewport = page.getViewport({ scale: newScale });

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
            canvasContext: ctx,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);
    });

    // Update page counters
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
const pagesView = document.getElementById("pages-view");

let smallPageViewport;
const smallPreviewResolution = 2;

let selected = [];
let buttons = [];

function OpenMultiSelection() {
    OpenPopup('multi-select');
    selected = [];

    while (pagesView.firstChild) {
        pagesView.removeChild(pagesView.firstChild);
    }

    for (let i = 0; i < currentDoc.numPages; i++) {
        selected.push(false);
        buttons.push(null);
        CreateElement(i);
    }
}

function ConfirmSelection() {
    currentPagesId = []

    for (let i = 0; i < selected.length; i++) {
        if (selected[i]) {
            currentPagesId.push(i + 1);
        }
    }

    selectPages()
    ClosePopup();
}

function SelectAll() {
    currentPagesId = []

    for (let i = 0; i < selected.length; i++) {
        currentPagesId.push(i + 1);
    }

    selectPages()
    ClosePopup();
}

function SelectFirst() {
    currentPagesId = [1]
    selectPages();
}

function CheckPage(event, id) {
    selected[id] = !selected[id];

    if (selected[id])
        buttons[id].classList.add("selected");
    else
        buttons[id].classList.remove("selected");
}

async function RenderPage(id, canvas) {
    let page = await currentDoc.getPage(id + 1)
    const ctx = canvas.getContext("2d");

    // Get viewport
    if (!smallPageViewport) {
        smallPageViewport = page.getViewport({ scale: smallPreviewResolution });
        let newScale = canvas.width / smallPageViewport.width;
        smallPageViewport = page.getViewport({ scale: newScale });
    }

    // Set canvas size
    canvas.height = smallPageViewport.height;
    canvas.width = smallPageViewport.width;

    // Render PDF page
    var renderContext = {
        canvasContext: ctx,
        viewport: smallPageViewport
    }
    // TODO: get promise variable and prevent rendering two page at the same time
    page.render(renderContext);
}

function CreateElement(pageId) {
    const canvas = document.createElement("canvas");
    RenderPage(pageId, canvas);

    const button = document.createElement("button");
    button.setAttribute("class", "page-check");
    const btnSpan = document.createElement("span");
    btnSpan.setAttribute("class", "material-icons");
    btnSpan.innerHTML = "done";
    button.appendChild(btnSpan)

    button.onclick = (event) => {
        CheckPage(event, pageId)
    }

    canvas.onclick = (event) => {
        CheckPage(event, pageId)
    }

    buttons[pageId] = button;

    const parent = document.createElement("div");
    parent.setAttribute("class", "small-preview");
    parent.appendChild(canvas);
    parent.appendChild(button);

    pagesView.appendChild(parent);
}

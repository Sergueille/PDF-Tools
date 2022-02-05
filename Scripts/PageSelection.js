let smallPageViewport;
const smallPreviewResolution = 2;

let selected = [];

function OpenMultiSelection() {
    OpenPopup('multi-select');
    selected = [];


}

async function RenderPage(id, canvas) {
    let page = await currentDoc.getPage(id)
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
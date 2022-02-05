const popupBg = document.getElementById("popup-bg");
var openedPopup;

function OpenPopup(id) {
    if (openedPopup)
        openedPopup.classList.add("transparent")

    openedPopup = document.getElementById(id);
    
    popupBg.classList.remove("transparent");
    openedPopup.classList.remove("transparent");
}

function ClosePopup() {
    popupBg.classList.add("transparent");
    openedPopup.classList.add("transparent")
}

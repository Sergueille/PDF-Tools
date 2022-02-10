const tips = [
    `Cliquez sur le nom d'un colonne dans le tableau pour la renommer.
    Laissez vide pour la supprimer.`,
    `Pour trouver une colonne, vous pouvez entrer seulement une partie de son nom.
    Les majuscules ne sont pas prises en compte.`,
    `Vous pouvez changer de page ou même de document en conservant vos colonnes`,
    `Pensez à utiliser la séléction multipage, à coté du sélecteur de page`,
    `Vous n'aimez pas les astuces du jour hein? 
    Dommage, elles vont vous suivre jusqu'à la fin de votre vie...`,
    `Vous pouvez appuyer sur entrée pour ajouter une colonne sans appuyer sur le bouton!`,
]

const tipText = document.getElementById("tip-text");
tipText.innerHTML = tips[Math.floor(Math.random() * tips.length)]

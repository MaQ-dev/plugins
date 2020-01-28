function openAe() {
window.open('https://webforms.roche.com/MIatlasadmin?type=ae', '_blank');	
}

function openTm() {
window.open('https://webforms.roche.com/MIatlasadmin?type=tm', '_blank');	
}

document.getElementById("aeButton").addEventListener("click", openAe);
document.getElementById("tmButton").addEventListener("click", openTm);

import $ from 'jquery';

let nightMode = 'night-mode';
let dayMode = 'day-mode';

//toggle night mode on click
const toggleNightMode = (event) => {
    //get latest local
    let localMode = localStorage.getItem(nightMode),
    //determine if status is false or true
    nightModeStatus = (localMode === "true" || localMode === null) ? false : true,
    //define body id
    bodyId = nightModeStatus ? nightMode : dayMode;
    //set local storage
    localStorage.setItem(nightMode, nightModeStatus);
    //add id
    $('body').attr('id', bodyId);
}

//enable or disable night mode on load
const activateNightMode = (event) => {
    //get latest local
    let nightModeStatus = localStorage.getItem(nightMode),
    bodyId = (nightModeStatus === "true") ? nightMode : dayMode;

    if(nightModeStatus === null){
        toggleNightMode();
    }else{
        $('body').attr('id',bodyId);
    }
}

export { activateNightMode, toggleNightMode };

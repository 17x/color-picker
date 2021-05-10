window.addEventListener('load', Onload);

function Onload(){
    ColorPicker.Open({
        x : 5,
        y : 20,
        // color : 'rgba(255,255,33,0.5)'
        // color : '#FFFF217d'
        color : {
            r : 255,
            g : 0,
            b : 0
        }
    });
}
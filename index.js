class ColorPicker{
    static w = 235;
    static h = 365;

    static Open({ x = 0, y = 0, value = '#00000000', returnType, cb } = {}){
        // 色块
        // 色带
        // 透明度
        // hexa
        // copy
        let domWrap = document.createElement('div');
        let backdrop = document.createElement('div');
        let domMain = document.createElement('div');

        domWrap.id = 'colorPicker-' + Date.now();
        domWrap.className = 'colorPickerWrap';
        backdrop.className = 'backdrop';
        domMain.className = 'main';
        domMain.style.width = ColorPicker.w + 'px';
        domMain.style.height = ColorPicker.h + 'px';
        domMain.style.left = x + 'px';
        domMain.style.top = y + 'px';

        domWrap.append(backdrop, domMain);
        document.body.append(domWrap);
        ColorPicker.cb = cb;
    }

    static ColorTransform(){

    }

    static Close(){
        if(ColorPicker.cb){
            ColorPicker.cb();
        }

        ColorPicker.cb = null;
    }
}
const ColorHelpers = {
    HSVtoRGB : (h, s, v) => {
        var r, g, b, i, f, p, q, t;

        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch(i % 6){
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        return {
            r : Math.round(r * 255),
            g : Math.round(g * 255),
            b : Math.round(b * 255)
        };
    },
    RGBtoHSV : (r, g, b) => {
        var max = Math.max(r, g, b), min = Math.min(r, g, b),
            d = max - min,
            h,
            s = (max === 0 ? 0 : d / max),
            v = max / 255;

        switch(max){
            case min:
                h = 0;
                break;
            case r:
                h = (g - b) + d * (g < b ? 6 : 0);
                h /= 6 * d;
                break;
            case g:
                h = (b - r) + d * 2;
                h /= 6 * d;
                break;
            case b:
                h = (r - g) + d * 4;
                h /= 6 * d;
                break;
        }

        return {
            h : h,
            s : s,
            v : v
        };
    },
    HSV2HSL : ({ h, s, v }) => {
        return {
            h,
            s : (s * v / ((h = (2 - s) * v) < 1 ? h : 2 - h)) || 0,
            l : h / 2
        };
    },
    HUE_Data : [
        /*
        Red R 255 0
        Yellow R 255 G 255 60
        Green G 255 120
        Cyan G 255 B 255 180
        Blue B 255 240
        Magenta R 255 B255 300
        */
        {
            c : { r : 255 },
            degree : 0
        },
        {
            c : {
                r : 255,
                g : 255
            },
            degree : 60
        },
        {
            c : { g : 255 },
            degree : 120
        },
        {
            c : {
                g : 255,
                b : 255
            },
            degree : 180
        },
        {
            c : { b : 255 },
            degree : 240
        },
        {
            c : {
                r : 255,
                b : 255
            },
            degree : 300
        }
    ]
};

class ColorPicker{
    static w = 235;
    static h = 335;
    static HSVCanvasHeight = 124;
    static HSVPos = {
        x : 0,
        y : 0
    };
    static section2CanvasWidth = 130;
    static hueCanvasHeight = 10;
    static alphaCanvasHeight = 92;

    static Open({ x = 0, y = 0, color = 'rgba(255,0,0,1)', returnType, onColorUpdate, onClose } = {}){
        // 色块
        // 色带
        // 透明度
        // hexa
        // copy
        let domWrap = document.createElement('div');
        let backdrop = document.createElement('div');
        let domMain = document.createElement('div');
        let section1 = document.createElement('div');
        let section2 = document.createElement('div');
        let section3 = document.createElement('div');
        const disabledSelection = (event) => {
            event.preventDefault();
        };

        // skeleton
        domWrap.id = 'colorPicker-' + Date.now();
        domWrap.className = 'colorPickerWrap';
        backdrop.className = 'backdrop';
        domMain.className = 'main bottom top';
        domMain.style.width = ColorPicker.w + 'px';
        domMain.style.height = ColorPicker.h + 'px';
        domMain.style.left = x + 'px';
        domMain.style.top = y + 'px';

        // section1
        let canvasHSV = document.createElement('canvas');

        canvasHSV.style.display = 'block';
        canvasHSV.style.cursor = 'pointer';
        canvasHSV.style.width = ColorPicker.w + 'px';
        canvasHSV.style.height = ColorPicker.HSVCanvasHeight + 'px';
        canvasHSV.width = ColorPicker.w;
        canvasHSV.height = ColorPicker.HSVCanvasHeight;
        // event entrance
        canvasHSV.onmousedown = (event) => {
            let _rect = canvasHSV.getBoundingClientRect();
            const HandleMove = ({ x, y }) => {
                let mX = x - _rect.x;
                let mY = y - _rect.y;

                if(mX < 0){
                    mX = 0;
                }
                if(mY < 0){
                    mY = 0;
                }
                if(mX >= ColorPicker.w){
                    mX = ColorPicker.w - 1;
                }
                if(mY >= ColorPicker.HSVCanvasHeight){
                    mY = ColorPicker.HSVCanvasHeight - 1;
                }

                // get color
                /* ColorPicker.color = */
                ColorPicker.GetColorDataByPos({
                    canvas : canvasHSV,
                    x : mX,
                    y : mY,
                    isSection1 : true
                });

                ColorPicker.HSVPos = {
                    x : mX,
                    y : mY
                };
                ColorPicker.RenderHSV(ColorPicker.color);
            };
            const HandleUp = () => {
                document.removeEventListener('mousemove', HandleMove);
                document.removeEventListener('mouseup', HandleUp);
            };
            document.addEventListener('mousemove', HandleMove);
            document.addEventListener('selectstart', disabledSelection);
            document.addEventListener('mouseup', HandleUp);

            HandleMove(event);
        };
        section1.append(canvasHSV);

        // section2
        let canvasHue = document.createElement('canvas');
        let canvasAlpha = document.createElement('canvas');
        canvasHue.width = ColorPicker.section2CanvasWidth;
        canvasHue.height = ColorPicker.hueCanvasHeight;
        canvasHue.style.width = ColorPicker.section2CanvasWidth + 'px';
        canvasHue.style.height = ColorPicker.hueCanvasHeight + 'px';
        canvasHue.onmousedown = (event) => {
            let _rect = canvasHue.getBoundingClientRect();
            const HandleMove = ({ x, y }) => {
                let mX = x - _rect.x;
                let mY = y - _rect.y;

                if(mX < 0){
                    mX = 0;
                }
                if(mY < 0){
                    mY = 0;
                }
                if(mX >= ColorPicker.w){
                    mX = ColorPicker.w - 1;
                }
                if(mY >= ColorPicker.HSVCanvasHeight){
                    mY = ColorPicker.HSVCanvasHeight - 1;
                }

                // get color
                /* ColorPicker.color = */
                ColorPicker.GetColorDataByPos({
                    canvas : canvasHue,
                    x : mX,
                    y : mY,
                    isSection1 : true
                });

                ColorPicker.HSVPos = {
                    x : mX,
                    y : mY
                };
                ColorPicker.RenderHSV(ColorPicker.color);
            };
            const HandleUp = () => {
                document.removeEventListener('mousemove', HandleMove);
                document.removeEventListener('mouseup', HandleUp);
            };
            document.addEventListener('mousemove', HandleMove);
            document.addEventListener('selectstart', disabledSelection);
            document.addEventListener('mouseup', HandleUp);

            HandleMove(event);
        };
        section2.append(canvasHue, canvasAlpha);

        if(onColorUpdate){
            ColorPicker.onColorUpdate = onColorUpdate;
        }
        if(onClose){
            ColorPicker.onClose = onClose;
        }

        domMain.append(section1, section2, section3);
        domWrap.append(backdrop, domMain);
        document.body.append(domWrap);

        ColorPicker.color = ColorPicker.ColorTransform(color);
        ColorPicker.canvasHSV = canvasHSV;
        ColorPicker.canvasHue = canvasHue;
        ColorPicker.canvasAlpha = canvasAlpha;
        ColorPicker.RenderHSV(color);
        ColorPicker.RenderHue(0);
        ColorPicker.RenderAlpha();
    }

    static RenderHSV(color = 'red'){
        let cvs = ColorPicker.canvasHSV;
        let ctx = cvs.getContext('2d');
        let w = ColorPicker.w;
        let h = ColorPicker.HSVCanvasHeight;

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, w, h);

        // left middle to right middle
        let gradient = ctx.createLinearGradient(0, h / 2, w, h / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);

        // top center to bottom center
        let gradient2 = ctx.createLinearGradient(w / 2, 0, w / 2, h);
        gradient2.addColorStop(0, 'rgba(0,0,0,0)');
        gradient2.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, w, h);

        // pointer
        let { x, y } = ColorPicker.HSVPos;
        ctx.strokeStyle = '#4082e3';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2, true);
        ctx.stroke();
    }

    static RenderHue(){
        let cvs = ColorPicker.canvasHue;
        let ctx = cvs.getContext('2d');
        let cData = ColorHelpers.HUE_Data;
        let len = ColorHelpers.HUE_Data.length;
        let w = ColorPicker.section2CanvasWidth;
        let h = ColorPicker.hueCanvasHeight;
        // left middle to right middle
        let last = cData[0];
        let arr = [];

        for(let i = 1; i < len; i++){
            let curr = cData[i];
            let next = null
            let percentage = 0;
            let gradient = ctx.createLinearGradient(0, h / 2, w, h / 2);

            if(i === len - 2){
                next = cData[0];
            }else{
                next = cData[i + 1];
            }

            gradient = ctx.createLinearGradient(0, h / 2, w, h / 2);
            gradient.addColorStop(last.degree / 360, last.c);
            gradient.addColorStop(curr.degree / 360, curr.c);
            last = next
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    static RenderAlpha(){

    }

    static PointSection1(){

    }

    static ColorTransform(color){
        return color;
    }

    static GetColorDataByPos({ canvas, x, y, isSection1 = false }){
        let ctx = canvas.getContext('2d');
        let w = ColorPicker.w;
        let h = ColorPicker.HSVCanvasHeight;
        let data = ctx.getImageData(x, y, 1, 1).data;

        let r1 = {
            h : 0,
            s : (x / w),
            v : (1 - y / h)
        };
        console.log('S');
        let rgb = null;
        /*
                if(isSection1){
                    if(y === 0){
                        if(x === 0){
                            // top left corner
                            rgb = {
                                r : 255,
                                g : 255,
                                b : 255
                            };
                        } else if(x === canvas.width){
                            rgb = {
                                r : 255,
                                g : 255,
                                b : 255
                            };
                        }
                    }
                }
        */
        // console.log(data);
        let r2 = ColorHelpers.RGBtoHSV(data[0], data[1], data[2]);
        console.log(r1);
        console.log(r2);
        console.log('E');

        window.hsv2hsl = ColorHelpers.HSV2HSL;
        return rgb;

    }

    static Close(){
        if(ColorPicker.onClose){
            ColorPicker.onClose();
        }

        ColorPicker.onClose = null;
    }
}
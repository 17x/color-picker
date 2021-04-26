class ColorPicker{
    static w = 235;
    static h = 335;
    static canvas1H = 124;
    static canvas2H = 112;
    static canvas3H = 92;
    static section1Pos = {
        x : 0,
        y : 0
    };

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
        let canvas1 = document.createElement('canvas');

        canvas1.style.display = 'block';
        canvas1.style.cursor = 'pointer';
        canvas1.style.width = ColorPicker.w + 'px';
        canvas1.style.height = ColorPicker.canvas1H + 'px';
        canvas1.width = ColorPicker.w;
        canvas1.height = ColorPicker.canvas1H;
        // event entrance
        canvas1.onmousedown = (event) => {
            let _rect = canvas1.getBoundingClientRect();
            const HandleMove = ({ x, y }) => {
                let mX = x - _rect.x;
                let mY = y - _rect.y;

                  if(mX < 0){
                      mX = 0;
                  }
                  if(mY < 0){
                      mY = 0;
                  }
                     if(mX > ColorPicker.w){
                         mX = ColorPicker.w;
                     }
                     if(mY > ColorPicker.canvas1H){
                         mY = ColorPicker.canvas1H;
                     }

                // get color
               /* ColorPicker.color = */ColorPicker.GetColorDataByPos({
                    canvas : canvas1,
                    x : mX,
                    y : mY,
                    isSection1 : true
                });

                ColorPicker.section1Pos = {
                    x : mX,
                    y : mY
                };
                ColorPicker.RenderSection1(ColorPicker.color);
            };
            const HandleUp = () => {
                document.removeEventListener('mousemove', HandleMove);
                document.removeEventListener('mouseup', HandleUp);
            };
            document.addEventListener('mousemove', HandleMove);
            document.addEventListener('mouseup', HandleUp);

            HandleMove(event);
        };

        section1.append(canvas1);

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
        ColorPicker.canvas1 = canvas1;
        ColorPicker.RenderSection1(color);
    }

    static RenderSection1(color = 'red'){
        let cvs = ColorPicker.canvas1;
        let ctx = cvs.getContext('2d');
        let w = ColorPicker.w;
        let h = ColorPicker.canvas1H;

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
        let { x, y } = ColorPicker.section1Pos;
        ctx.strokeStyle = '#4082e3';
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2, true);
        ctx.stroke();
    }

    static PointSection1(){

    }

    static ColorTransform(color){
        return color;
    }

    static GetColorDataByPos({ canvas, x, y, isSection1 = false }){
        let ctx = canvas.getContext('2d');
        let w = ColorPicker.w;
        let h = ColorPicker.canvas1H;
        let data = ctx.getImageData(x, y, 1, 1);
        console.log(x, y, [...data.data]);
        let rgb = null;
        if(isSection1){
            if(x < 0){
                if(y < 0){
                    // top left corner
                    rgb = {
                        r : 255,
                        g : 255,
                        b : 255
                    };
                } else{

                }
            }
        }

        return rgb;

        /*
                let hsv_value = 1 - (y / h);
                let hsv_saturation = x / w;
                let lightness = (hsv_value / 2) * (2 - hsv_saturation);
                let saturation = (hsv_value * hsv_saturation) / (1 - Math.abs(2 * lightness - 1));
                let hue = Math.round((x / w) * 360 * 100) / 100
         */
        /*     console.log(
                 hsv_value,
                 hsv_saturation,
                 lightness,
                 saturation,
             );*/
        /*   console.log(HSLToRGB(
              hsv_value,
              hsv_saturation,
              lightness,
              // saturation,
               )
          );*/
    }

    static Close(){
        if(ColorPicker.onClose){
            ColorPicker.onClose();
        }

        ColorPicker.onClose = null;
    }
}
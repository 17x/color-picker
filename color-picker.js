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
        Magenta R 255 B 255 300
        */
        {
            n : 'rgb(255,0,0)',
            d : 0
        },
        {
            n : 'rgb(255,0,255)',
            d : 60
        },
        {
            n : 'rgb(0,0,255)',
            d : 120
        },
        {
            n : 'rgb(0,255,255)',
            d : 180
        },
        {
            n : 'rgb(0,255,0)',
            d : 240
        },
        {
            n : 'rgb(255,255,0)',
            d : 300
        }
    ]
};

class ColorPicker{
    static domString = `
        <style>        
        .colorPickerWrap {
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
        }    
        .colorPickerWrap .backdrop {
            position: absolute;
            width: 100%;
            height: 100%;
        }    
        .colorPickerWrap .main {
            background-color: #ffffff;
            position: absolute;
            box-shadow: 0 0 2px 0 #3a3a3a;
            border-radius: 1px;
            /*width: 235px;*/
            /*height: 335px;*/
        }    
        .colorPickerWrap .main::before,
        .colorPickerWrap .main::after {
            position: absolute;
            width: 15px;
            height: 9px;
        }    
        .colorPickerWrap .main.top::before {
            content: "";
            background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAJCAYAAADtj3ZXAAABfmlDQ1BIRCA3MDktQQAAKJGVjrFKI1EUhr8bo1EMGCSohSwXFLGYSHSLGLUZIxjFQqJCkm4yGePCJLlMrqgPYGejhWizy+orLLvNFpZioYUgCMFnEARBRMZi0DQusn/1nQ/OOT+EtKWUGwaqNe3l5mdlvlCUkSbdROllin7LbihzeXmJjyPg8QYBcJ2wlHLXF55uZ3a3fvzqWDz+MqWNf+y9pbvsNGwQnYBdbthVEC5g2MrTII6AxJZWGsQ5EPfyhSKIJhCvBHwPxEv5QhFCYSDureYyEBoAYqWAR4FYJeBJIGZvWGUIZQEj6ABAV3ZOppLphPlJ7/9O1d18+yGAqFNbWwFiwCBZ5pCkSJImgamdbQ2Qqasd71tlQ0tTKdeRmXpVbWrHM+RCzR4z5ERyPAmQLxRlcPohhwBE31XL1X9Cegja9lqudAh//sLARcsNf4eeafh9qSzPei8uHsOfzY31rxMBR2eh/c73H0YgcgAv+77/fOL7L6fQ1oQz9xUmqGnhJTh2ngAAAAlwSFlzAAALEwAACxMBAJqcGAAAB01pVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ4IDc5LjE2NDAzNiwgMjAxOS8wOC8xMy0wMTowNjo1NyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTA0LTI1VDE4OjU4OjE5KzA4OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIxLTA0LTI2VDExOjE2OjA5KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0wNC0yNlQxMToxNjowOSswODowMCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpjOWI5MTJmOC00YWNiLTRjZGItODhiNS01NjA1MDkxYjJkMGQiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo4OTk5NDc0ZC1mYmIzLWY3NDEtODdhMi01YWJlYTJmZjMxZWQiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiODBiMzcxMy01ZDAzLTRiMzAtYjNkOC1kYTFjY2I5ZmIxNTEiIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJIRCA3MDktQSIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmI4MGIzNzEzLTVkMDMtNGIzMC1iM2Q4LWRhMWNjYjlmYjE1MSIgc3RFdnQ6d2hlbj0iMjAyMS0wNC0yNVQxODo1ODoxOSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKE1hY2ludG9zaCkiLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjg0ZjlhODBiLTFiZDAtNGE2ZS1hYWFhLWIxMWZhZmE3ZDM1YyIgc3RFdnQ6d2hlbj0iMjAyMS0wNC0yNVQxODo1ODoxOSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmM5YjkxMmY4LTRhY2ItNGNkYi04OGI1LTU2MDUwOTFiMmQwZCIgc3RFdnQ6d2hlbj0iMjAyMS0wNC0yNlQxMToxNjowOSswODowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKE1hY2ludG9zaCkiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDxwaG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDxyZGY6QmFnPiA8cmRmOmxpPnhtcC5kaWQ6NzMwMDA0NjQtM2YxYi00NjBkLWFmMzYtYjQ1MzgxMzY0ZGE4PC9yZGY6bGk+IDwvcmRmOkJhZz4gPC9waG90b3Nob3A6RG9jdW1lbnRBbmNlc3RvcnM+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+5B3YBwAAAINJREFUKJGdkLENgzAURH8oKFJAJmCHKDUTMC0Va7h068JyY3uBk3wpwAUOJiQnXfFPeq/4klJ6Fb2TlBjjc5lnkpRaD8cQwriBPBMIgA5AA6DJYwZzaoLd4Zx7lOCZQLz3o7W2NcYMNbAmEJKite6/gUcCUUpNV8FS8PGcXwS3VfFf3oL0nGPexqR2AAAAAElFTkSuQmCC");
            top: -9px;
            left: 3px;
        }    
        .colorPickerWrap .main.bottom::after {
            content: "";
            background: transparent url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAJCAYAAADtj3ZXAAABgWlDQ1BIRCA3MDktQQAAKJGVjj9rWmEUh59XTUxRqARpHUp5IaV0uAZjB6vJ4h+ohgxiW1C36/VGA1d9ub5i8gGyZUmG0C4tbb9CSZYMGUOGZAgUCtLPUBACpYTb4ZI6hdDf9JwHzjk/CGhTKScE9Prarb0uyHqjKcMTIkRZJMdj0xqqfLW6wZ25/o4AuEqaSjmbld8/1nbHn77Nr394mtPG3XsARNr20AKxAFjtodUD4QCGpVwN4j2QHGulQZwBcbfeaIKYAPGOz7+AeKveaEIgBMTdt7UiBBJArOXzCyDW8fkVELO6ZhsCZcDwOwDwoFySmVQ2mb+n93+n54xufwggavffvQFiwBPKlJBkSJElSV7b2xqgOFA77lanq2VeKceWxUFPjbTtGrLSt5YNmU6tpADqjab0T09rCEA8upy5wWfILkFwb+Zah3B8AonzmXv2ER6uwtGFMl3zX3FxHbpvHm6+TPscLcDcT8+bPofwAdzse96fL5538xWCEzh1/gIkd2ngdRvKIgAAAAlwSFlzAAALEwAACxMBAJqcGAAABeBpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ4IDc5LjE2NDAzNiwgMjAxOS8wOC8xMy0wMTowNjo1NyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIxLjAgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTA0LTI1VDE4OjQ4OjM4KzA4OjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMS0wNC0yNVQxODo1NDoyNCswODowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMS0wNC0yNVQxODo1NDoyNCswODowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJIRCA3MDktQSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpmYjVkYzQ1NC04ZTE0LTRhMGMtYTIzMS1kNmI1MTA4MjVjMjciIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NzMwMDA0NjQtM2YxYi00NjBkLWFmMzYtYjQ1MzgxMzY0ZGE4IiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NzMwMDA0NjQtM2YxYi00NjBkLWFmMzYtYjQ1MzgxMzY0ZGE4Ij4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo3MzAwMDQ2NC0zZjFiLTQ2MGQtYWYzNi1iNDUzODEzNjRkYTgiIHN0RXZ0OndoZW49IjIwMjEtMDQtMjVUMTg6NDg6MzgrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4wIChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpmYjVkYzQ1NC04ZTE0LTRhMGMtYTIzMS1kNmI1MTA4MjVjMjciIHN0RXZ0OndoZW49IjIwMjEtMDQtMjVUMTg6NTQ6MjQrMDg6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMS4wIChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDwvcmRmOlNlcT4gPC94bXBNTTpIaXN0b3J5PiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PvZ0lgsAAADNSURBVCiRnZAxi8JQEIT3RbBQUNMIXqEWNgo2Nlb5B/cv/QX7mpcfcWKb0oSE1+xr0q5kbMwRxePUge3mm1nGAAB9qCi19iMwtZair+Vyk1p7fBecLRbfBIAAkGP+wQtyzMiybAyASESGZVn2iqLoOeb/wEOe5/Oqqvoikvw2AyDv/favAMcM7/2k6ydVjVTVqKqp69qIyNQxp49gC9z8kaqO7prbCyFM2w8cM0IIyTOfaZpm1RnyTERkjLncVsU+SXZxHJ8ADIho3V39CrynEkQVDqOiAAAAAElFTkSuQmCC");
            bottom: -9px;
            left: 2px;
        }    
        .colorPickerWrap .hsvCanvas {
            display: block;
            cursor: pointer;
            width: 235px;
            height: 124px;
        }    
        .colorPickerWrap .sampleCanvas {
            float: left;
            border-radius: 32px;
        }    
        .colorPickerWrap .hueWrap,
        .colorPickerWrap .alphaWrap {
            position: relative;
            float: left;
            margin-left: 7px;
        }    
        .colorPickerWrap .hueHandle,
        .colorPickerWrap .alphaHandle {
            position: absolute;
            left: -7px;
            top: 2px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            box-shadow: 0 0 4px 1px #999999;
            background-color: #f7f7f7;
        }    
        </style>
        <div class="backdrop"></div>
        <div class="main bottom top">
            <div class="hsvWrap">
                <canvas class="hsvCanvas"></canvas>
            </div>
            <div>
                <canvas class="sampleCanvas"></canvas>
                <div class="hueWrap">
                    <canvas class="hueCanvas"></canvas>
                    <div class="hueHandle"></div>
                </div>
                <div class="alphaWrap">
                    <canvas class="alphaCanvas"></canvas>
                    <div class="alphaHandle"></div>
                </div>
            </div>
            <div class="inputModeList">
                <div class="mode-hex">
                    <input type="text" />
                </div>
            </div>
        </div>
    `;
    static w = 235;
    static h = 335;
    static sampleLen = 32;
    static HSVHeight = 124;
    static HSVPos = {
        x : 0,
        y : 0
    };
    static hueWidth = 160;
    static hueHeight = 10;
    static alphaHeight = 10;

    static Open({ x = 0, y = 0, color = 'rgba(255,0,0,1)', returnType, onColorUpdate = null, onClose = null } = {}){
        let domWrap = document.createElement('div');
        // hexa
        // copy
        let domMain = null
        const DisabledSelection = (event) => {
            event.preventDefault();
        };
        const SetSize = (d, w, h) => {
            d.width = w;
            d.height = h;
            d.style.width = w + 'px';
            d.style.height = h + 'px';
        };
        const CommonHandle = (canvas, handle, cb) => {
            handle.onmousedown = () => {
                let _rect = canvas.getBoundingClientRect();
                const move = ({ x, y }) => {

                };
                const up = () => {
                    document.removeEventListener('mousemove', move);
                    document.removeEventListener('mouseup', up);
                };
                document.addEventListener('mousemove', move);
                document.addEventListener('selectstart', DisabledSelection);
                document.addEventListener('mouseup', up);

                move(event);
            };
        };
        const Get = (a, s) => {
            return a.getElementsByClassName(s)[0];
        };

        // skeleton
        domWrap.id = 'colorPicker-' + Date.now();
        domWrap.className = 'colorPickerWrap';
        domWrap.innerHTML = ColorPicker.domString;
        domMain = domWrap.getElementsByClassName('main')[0];
        domMain.classList.add('top');
        domMain.style.width = ColorPicker.w + 'px';
        domMain.style.height = ColorPicker.h + 'px';
        domMain.style.left = x + 'px';
        domMain.style.top = y + 'px';

        // hsvCanvas
        let hsvCanvas = Get(domWrap, 'hsvCanvas');
        SetSize(hsvCanvas, ColorPicker.w, ColorPicker.HSVHeight);
        // event entrance
        hsvCanvas.onmousedown = (event) => {
            let _rect = hsvCanvas.getBoundingClientRect();
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
                if(mY >= ColorPicker.HSVHeight){
                    mY = ColorPicker.HSVHeight - 1;
                }

                // get color
                /* ColorPicker.color = */
                ColorPicker.GetColorDataByPos({
                    canvas : hsvCanvas,
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
            document.addEventListener('selectstart', DisabledSelection);
            document.addEventListener('mouseup', HandleUp);

            HandleMove(event);
        };

        // section2
        let sampleCanvas = Get(domWrap, 'sampleCanvas');
        let hueCanvas = Get(domWrap, 'hueCanvas');
        let hueHandle = Get(domWrap, 'hueHandle');
        let alphaCanvas = Get(domWrap, 'alphaCanvas');
        let alphaHandle = Get(domWrap, 'alphaHandle');

        SetSize(sampleCanvas, ColorPicker.sampleLen, ColorPicker.sampleLen);
        SetSize(hueCanvas, ColorPicker.hueWidth, ColorPicker.hueHeight);
        SetSize(alphaCanvas, ColorPicker.hueWidth, ColorPicker.hueHeight);
        CommonHandle(hueCanvas, hueHandle, (v) => {
        });
        CommonHandle(alphaCanvas, alphaHandle, (v) => {
        });

        document.body.append(domWrap);

        ColorPicker.onColorUpdate = onColorUpdate;
        ColorPicker.onClose = onClose;
        ColorPicker.color = ColorPicker.ColorTransform(color);
        ColorPicker.hsvCanvas = hsvCanvas;
        ColorPicker.sampleCanvas = sampleCanvas;
        ColorPicker.hueCanvas = hueCanvas;
        ColorPicker.hueHandle = hueHandle;
        ColorPicker.alphaCanvas = alphaCanvas;
        ColorPicker.RenderHSV(color);
        ColorPicker.RenderSample();
        ColorPicker.RenderHue();
        ColorPicker.RenderAlpha();
    }

    static RenderHSV(color = 'red'){
        let cvs = ColorPicker.hsvCanvas;
        let ctx = cvs.getContext('2d');
        let w = ColorPicker.w;
        let h = ColorPicker.HSVHeight;

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

    static SetHueHandle(){

    }

    static RenderHue(){
        let cvs = ColorPicker.hueCanvas;
        let ctx = cvs.getContext('2d');
        let cData = ColorHelpers.HUE_Data;
        let len = ColorHelpers.HUE_Data.length;
        let w = ColorPicker.hueWidth;
        let h = ColorPicker.hueHeight;
        // left middle to right middle
        let gradient = ctx.createLinearGradient(0, h / 2, w, h / 2);

        for(let i = 0; i < len; i++){
            gradient.addColorStop(cData[i].d / 360, cData[i].n);
            if(i === len - 2){
                gradient.addColorStop(1, cData[0].n);
            }
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    static RenderAlpha(){
        let cvs = ColorPicker.alphaCanvas;
        let ctx = cvs.getContext('2d');
        let w = ColorPicker.hueWidth;
        let h = ColorPicker.alphaHeight;
        let _l = 5;
        let len = ColorPicker.hueWidth / _l;

        ctx.fillStyle = '#c5c5c5';
        for(let i = 0; i < len; i++){
            ctx.fillRect(
                i * _l,
                i % 2 === 0 ? 0 : _l,
                _l,
                _l
            );
        }

        // left middle to right middle
        let gradient = ctx.createLinearGradient(0, h / 2, w, h / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');
        gradient.addColorStop(1, '#b3b3b3');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    static RenderSample(){
        let cvs = ColorPicker.sampleCanvas;
        let ctx = cvs.getContext('2d');
        let w = ColorPicker.hueWidth;
        let h = ColorPicker.alphaHeight;
        let _l = 5;
        let _s = ColorPicker.sampleLen;
        let len = ColorPicker.hueWidth / _l;

        ctx.fillStyle = '#c5c5c5';
        for(let i = 0; i < len; i++){
            ctx.fillRect(
                i * _l,
                i % 2 === 0 ? 0 : _l,
                _l,
                _l
            );
        }

        // left middle to right middle
        let gradient = ctx.createLinearGradient(0, h / 2, w, h / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,0)');
        gradient.addColorStop(1, '#b3b3b3');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
    }

    static PointSection1(){

    }

    static ColorTransform(color){
        return color;
    }

    static GetColorDataByPos({ canvas, x, y, isSection1 = false }){
        let ctx = canvas.getContext('2d');
        let w = ColorPicker.w;
        let h = ColorPicker.HSVHeight;
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

        return rgb;
    }

    static Close(){
        if(ColorPicker.onClose){
            ColorPicker.onClose();
        }

        ColorPicker.onClose = null;
    }
}
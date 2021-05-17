# What
Pick a color.

Compatibility: Chrome on OSX.

#### [Demo](https://17x.github.io/color-picker/)

# How
#### coordinate
Pass in `x` and `y`
 
Default values : 0


#### input
Refer `Supported input` in *color-picker.js*

Default values : `rgba(255,0,0,1)`


#### close (*interactive*)

Pass in `close` with one of values on the below

- hsv : close while mousedown on HSV and release mouse

- enter : close while press `enter` key
 
- backdrop : close while **backdrop area** clicked

Default values : **hsv**

#### callback
`onColorUpdate`
A function received one **data-result** parameter 

`onClose`
A function triggered after Component closed

#### cancel
Press escape key to cancel, this will not trigger `color update` or `close` events.

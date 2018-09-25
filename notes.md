//we used bootswatch.com to get our theme for this project--download--copy link(url)---wget in bash  this url into css directory


first go to inspect element...sources...static file..js...graph.js..
put breakpoint on line 7(just before end of code)..this is done by clicking to left of line number.
this pauses debugger

we then go to console:  (to look at the data using a crossfilter)

var ndx = crossfilter(salaryData);
undefined..get this after press enter for above..is repeated below
var dim = ndx.dimension(dc.pluck("rank"));
undefined
var group = dim.group();
undefined
group.all();

//this all went into chrome developer inspect all. wento to sources.. line 8 of graph.js and types the above in



youtube links


layout                              https://youtu.be/spyk9xHMNOM
styling                             https://youtu.be/ZkljDMyOYq8

uniform resource location           https://youtu.be/RA-WlOsl5CA
curl                                https://youtu.be/UtKjy-Qk3ls


links browser                       https://youtu.be/RbQYhOaTJNE
js object notation                  https://youtu.be/BGXBnh5mR28
combining cURL with APIs            https://youtu.be/LV74_ToSCjs
XHR                                 https://youtu.be/LZHoZW-Pc3Q
more in depth XHR                   https://youtu.be/Rla1tOYmpgY
JSON.Parse()                        https://youtu.be/bRrLAhV8RzE
getting functional                  https://youtu.be/wjKQI1aFkps
timeout! consuming APIs             https://youtu.be/YfwlQWuFKMk
callbacks                           https://youtu.be/BLYjGpYjFzc

getting the data onto the page      https://youtu.be/78nGFQKAAO0
Unpacking Our Data Onto The DOM     https://youtu.be/HTT4XD_Klrk
tabular data                        https://youtu.be/dG_SB4TYUdM
tabular data 2                      https://youtu.be/4bULGIoC6Gs
Tabular Data - Part Three           https://youtu.be/loyMGNbSHJk
pagination                          https://youtu.be/eawdRa5UDRI
tying up loose ends                 https://youtu.be/PlVLT5wHjVc











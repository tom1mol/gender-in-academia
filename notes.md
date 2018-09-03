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


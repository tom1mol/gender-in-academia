queue()                                                                 //to load contents of a csv file from queue.js
    .defer(d3.csv, "data/Salaries.csv")         //call defer method..2 arguments. 1=format of data we waNT TO LOAD. csv..so d3.csv. 
                                                //2nd argument is path to csv file..so salaries.csv which is in data directory
    .await(makeGraphs);                          //takes an argument which is a name of a function we want to call when data has been downloaded 

function makeGraphs(error, salaryData) {        //salaryData is a variable that data from csv file will be passed into by queue.js
    var ndx = crossfilter(salaryData);          //create crossfilter. 1 for whole dashboard and load salaryData into it
    
    salaryData.forEach(function(d) {
        d.salary = parseInt(d.salary);
    })
    
    
    show_discipline_selector(ndx);      //pass this ndx as only argument
    show_gender_balance(ndx);       // we pass the ndx variable(crossfilter) to the function that will draw our graph
    show_average_salary(ndx);
    
    dc.renderAll();
}  


function show_discipline_selector(ndx) {            // we call this from makeGraphs function above
                                // select menus easy to render. just need dimension and group and pass them to dimensional charting select menu
    var dim = ndx.dimension(dc.pluck("discipline"));  //to create dimension we pluck discipline column from crossfilter
    var group = dim.group();
      
    dc.selectMenu("#discipline-selector")       //selectMenu needs to be told the div to render in..#discipline-selector(CSS selector pointing)
        .dimension(dim)
        .group(group);
    
}


function show_gender_balance(ndx) {         //each graph has its own function. one argument(ndx). for each graph we have div,function + graph rendered in div
    var dim = ndx.dimension(dc.pluck("sex"));
    var group = dim.group();        //count rows in data that have both genders
    
    dc.barChart("#gender-balance")  //div ID(gen-bal) comes into play. use CSS selector #gender-balance to indicate this chart is rendered in this div
        .width(400)
        .height(300)
        .margins({top: 10, right: 50, bottom:30, left: 50})
        .dimension(dim)
        .group(group)
        .transitionDuration(500)        //how quick chart animates when we filter
        .x(d3.scale.ordinal())          //use ordinal scale because dimension consists of words male and female
                                        //y axis is count of how many of each there were
        .xUnits(dc.units.ordinal)
        //.elasticY(true)  ..got rid of this. the bars didnt change because of it..just the y-axis
        .xAxisLabel("Gender")
        .yAxis().ticks(20);         //number of ticks that appear on y-axis
}




function show_average_salary(ndx) {
    var dim = ndx.dimension(dc.pluck("sex"));
    
    function add_item(p, v) {    //p is the accumulator that keeps track of total count/avg. v represents each data items that we add/remove
        p.count++;
        p.total += v.salary;     //increment total by salary of data item we're looking at
        p.average = p.total / p.count; 
        return p;
    }
    
    function remove_item(p, v) {
        p.count--;
        if(p.count == 0) {      //when count is 0..set total to 0
            p.total = 0;
            p.average = 0;
        } else {
            p.total -= v.salary;
            p.average = p.total / p.count;
        }
        return p;
    }
    
    function initialise() {         //creates initial value for p. doesnt take arguments
        return {count: 0, total: 0, average: 0}; //keeps track of count,total,avg originally set to 0
    }
    
    
    var averageSalaryByGender = dim.group().reduce(add_item, remove_item, initialise);  // for group we call the reduce function
    
    dc.barChart("#average-salary")
        .width(400)
        .height(300)
        .margins({top: 10, right: 50, bottom: 30, left: 50})
        .dimension(dim)
        .group(averageSalaryByGender)  //created using custom reducer
        .valueAccessor(function(d) {
            return d.value.average.toFixed(2);
        })  
        //need this because value being plotted is created by initialised function of custom reducer so has a count,total,avg. we use avg(above)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Gender")
        .yAxis().ticks(4);
        
        
}








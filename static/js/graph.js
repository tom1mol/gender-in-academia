queue()                                                                 //to load contents of a csv file from queue.js
    .defer(d3.csv, "data/Salaries.csv")         //call defer method..2 arguments. 1=format of data we waNT TO LOAD. csv..so d3.csv. 
                                                //2nd argument is path to csv file..so salaries.csv which is in data directory
    .await(makeGraphs);                          //takes an argument which is a name of a function we want to call when data has been downloaded 

function makeGraphs(error, salaryData) {        //salaryData is a variable that data from csv file will be passed into by queue.js
    var ndx = crossfilter(salaryData);          //create crossfilter. 1 for whole dashboard and load salaryData into it
    
    salaryData.forEach(function(d) {            // convert salaries to integers using forEach
        d.salary = parseInt(d.salary);          //salary = integer version of the salary
        d.yrs_service = parseInt(d["yrs.service"]);   //treat data as a number instead of a string
    })
    
    
    show_discipline_selector(ndx);      //pass this ndx as only argument
    
    show_percent_that_are_professors(ndx, "Female", "#percent-of-women-professors");   //generic function..not men/women specific
    show_percent_that_are_professors(ndx, "Male", "#percent-of-men-professors"); //#percent-of-men-professors(ID of where we want data displayed. also for FEM above)
    
    show_gender_balance(ndx);       // we pass the ndx variable(crossfilter) to the function that will draw our graph
    show_average_salary(ndx);
    show_rank_distribution(ndx);
    
    show_service_to_salary_correlation(ndx);
    
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


function show_percent_that_are_professors(ndx, gender, element) { //because 2 different divs(m/f) we pass in element where we want data plotted
    var percentageThatAreProf = ndx.groupAll().reduce(
        function (p, v) {
            if (v.sex === gender) {         //this was originally "Female"
                p.count++;
                if (v.rank === "Prof") {                
                    p.are_prof++;
                }
            }
            return p;
        },
        function (p, v) {
         if (v.sex === gender) {            //this was originally "Female"
                p.count--;
                if (v.rank === "Prof") {
                    p.are_prof--;
                }
            }
            return p;   
        },
        function() {
            return {count: 0, are_prof: 0}; // count=total number of records encountered and 2nd argument that àre professors
        }
        
    );
    
    dc.numberDisplay(element)           //this was previously ("#percentage-of-women-professors")changed it to element where we want num displayed
        .formatNumber(d3.format(".2%"))   // show number as percentage to 2 decimal places..is a format number method to adjust how number is displayed
        .valueAccessor(function (d) {       //valueAccessor because we used a custom reducer. values have count and are_prof parts
            if (d.count == 0) {         //if count is 0..rtn 0
                return 0;
            } else {
                return (d.are_prof / d.count);      //calculate % of overall count for are_prof
            }
        })
        .group(percentageThatAreProf);      //originally (percentageFemaleThatAreProf)
    
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
            return d.value.average.toFixed(2);  //round it to 2 decimal places
        })  
        //need this because value being plotted is created by initialised function of custom reducer so has a count,total,avg. we use avg(above)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Gender")
        .yAxis().ticks(4);
        
        
}

function show_rank_distribution(ndx) {          //splitting data by gender on this one
    
    /*
    var dim = ndx.dimension(dc.pluck("sex"));
    
    var profByGender = dim.group().reduce(          // p= accumulator...keeps track of values. v= individual items being added
        function (p, v) {           //total in add item always increment but match only increment if is professor
            p.total++;                              // ADD
            if(v.rank == "Prof") {
                p.match++;
            }
            return p;
        },
        function (p, v) {
             p.total--;                             //REMOVE
            if(v.rank == "Prof") {
                p.match--;
            }
            return p;
        },
        function () {   // initialise function takes no argument(p,v). creates the data structure that will be threaded through call to add/remove item
            return {total: 0, match: 0};        //total= count/accumulator for number of rows. match= how many of the rows are professors
        }
    );
    */
    
    
    function rankByGender (dimension, rank) {       //nested function...
        return dimension.group().reduce(          
            function (p, v) {           
                p.total++;                              // ADD
                if(v.rank == rank) {
                    p.match++;
                }
                return p;
            },
            function (p, v) {
                 p.total--;                             //REMOVE
                if(v.rank == rank) {
                    p.match--;
                }
                return p;
            },
            function () {   // 
                return {total: 0, match: 0};        
            }
        );
    }
    var dim = ndx.dimension(dc.pluck("sex"));
    var profByGender = rankByGender(dim, "Prof"); 
    var asstProfByGender = rankByGender(dim, "AsstProf");       //pass in a dimension and the rank we want to use for the reduce
    var assocProfByGender = rankByGender(dim, "AssocProf"); 
    
    
    console.log(profByGender.all());
    
    dc.barChart("#rank-distribution")
        .width(400)
        .height(300)
        .dimension(dim)
        .group(profByGender, "Prof")
        .stack(asstProfByGender, "Asst Prof")
        .stack(assocProfByGender, "Assoc Prof")
        .valueAccessor(function (d){                             //need this because we used a custom reducer for this chart
            if(d.value.total > 0) {                                     //total==total number of men/women found
                return (d.value.match / d.value.total) * 100;       //match== number that are prof, assocProf etc. find what % of total is the match
            } else {                        //could have put this calc in custom reducer as 3rd property in data structure created by initialize function
                return 0;
            }
        })
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .legend(dc.legend().x(320).y(20).itemHeight(15).gap(5))
        .margins({top: 10, right: 100, bottom: 30, left: 30});
}


function show_service_to_salary_correlation(ndx) {
    var eDim = ndx.dimension(dc.pluck("yrs_service"));  // used to work out max/min of x-axis. eDim is a pluck on years of service
    var experienceDim = ndx.dimension(function(d) {  // function to extract 2 pieces of info we need for plotting
        return [d.yrs_service, d.salary];  //(used for x coordinate of the dot, used for y coordinate of dot)
    });
    var experienceSalaryGroup = experienceDim.group();  //dot on plot for each unique yrs_serv and salary combo
    
    var minExperience = eDim.bottom(1)[0].yrs_service;    //bottom 1 value
    var maxExperience = eDim.top(1)[0].yrs_service;     //top 1 value
    
    dc.scatterPlot("#service-salary")
        .width(800)
        .height(400)
        .x(d3.scale.linear().domain([minExperience, maxExperience]))  //linear(no of yrs) range from min-max experience
        .brushOn(false)   // changing this to true will allow us highlight dots on chart and filter remaining charts
        .symbolSize(8)      //size of dots
        .clipPadding(10)   //leaves room near top if plot goes high
        .yAxisLabel("Years Of Service")
        .title(function(d) {        // appears when u hover mouse over dot
            return "Earned " + d.key[1];    //tool tip appears with earned and the salary. key[1] relates to yrs of service+salary dimension created above
                                            //if we had said key[0] it would have related to yrs of service. first item =0, 2nd item=1 etc
        })
        .dimension(experienceDim)  //experienceDim...the dim that contains years of service and salary
        .group(experienceSalaryGroup)
        .margins({top: 10, right: 50, bottom: 75, left:75});
        
}





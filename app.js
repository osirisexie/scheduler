/**
 * Created by qianmoxie on 1/19/17.
 */

var app = angular.module('myApp', []);

app.controller('schedulerController',schedulerController);
function schedulerController ($scope,$timeout){

    let scheduler = xqmScheduler.init();
    scheduler.create_event({
        type:'cords',
        cords:{
            x:2,
            y:12,
        }
    });
    scheduler.create_event({
        type:'time',
        time:{
            week:1,
            start:'03:30',
            end:'07:00'
        }
    });
    let scheduler2 = xqmScheduler.init({
        id:'xqm_scheduler2'
    })

    $scope.get=function(){
        let events = scheduler.get_data_only();
        events = events.map(event=>{
            let obj ={
                type: 'time',
                time: event
            }
            scheduler2.create_event(obj)
            return obj;
        })

    }
    $scope.get2=function(){
        console.log(scheduler2.get_events())
    }

    let a = [[1,5],[8,11]], b = [[0,3],[5,9],[10,13]];
    class Node {
        constructor(a,b,c){
            this.label = b?(c?'s1':'e1'):(c?'s2':'e2');
            this.value = a
        }
    }
    class Range{
        constructor(start, end){
            this.start = start;
            this.end = end;
        }
    }
    function create_range(l,c){
        if(c > l){
            ranges.push(new Range(l,c));
        }
    }
    let arrays = [], ranges = [];
    a.map(e=>{
        arrays.push(new Node(e[0],1,1));
        arrays.push(new Node(e[1],1,0));
    })

    b.map(e=>{
        arrays.push(new Node(e[0],0,1));
        arrays.push(new Node(e[1],0,0));
    })

    arrays.sort((a,b)=>{
        return a.value > b.value;
    })

    let start = false;
    let first = arrays[0];
    if(first.label == 's1') start = true;
    arrays.splice(0,1);
    arrays.reduce((l,c)=>{
        if(start){
            switch (c.label){
                case 's2':
                    if(l.label == 's1' || l.label == 'e2') create_range(l.value,c.value);
                    break;
                case 'e1':
                    if(l.label == 'e2') create_range(l.value,c.value);
                    break;
            }
        }
        if(c.label == 'e1') start = false;
        if(c.label == 's1') start = true;
        return c;
    },first)

    console.log(ranges);
};
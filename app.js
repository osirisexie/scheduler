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


};
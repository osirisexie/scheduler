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
    })
    let scheduler2 = xqmScheduler.init({
        id:'xqm_scheduler2'
    })

    $scope.get=function(){
        console.log(scheduler.get_events())
    }
    $scope.get2=function(){
        console.log(scheduler2.get_events())
    }


};
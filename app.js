/**
 * Created by qianmoxie on 1/19/17.
 */

var app = angular.module('myApp', []);

app.controller('schedulerController',schedulerController);
function schedulerController ($scope,$timeout){

    let scheduler = xqmScheduler.init();
    let time = {
      week:1,
      start:'03:30',
      end:'07:00',
      offset: 5
    };
    scheduler.create_event({
        type:'cords',
        cords:{
            x:2,
            y:12,
        }
    });
    scheduler.create_event({
        type:'time',
        time:time
    });
    scheduler.scroll_to_first();
    let scheduler2 = xqmScheduler.init({
        id:'xqm_scheduler2'
    });

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
    };
    $scope.get2=function(){
        console.log(scheduler2.get_events())
    };


    let times = [ { type: 'time',
      offset: 5,
      end: '17:30',
      start: '14:00',
      week: 1 },
      { type: 'time',
        offset: 5,
        end: '18:00',
        start: '13:00',
        week: 2 },
      { type: 'time',
        offset: 5,
        end: '17:30',
        start: '14:00',
        week: 3 },
      { type: 'time',
        offset: 5,
        end: '20:30',
        start: '19:00',
        week: 3 },
      { type: 'time',
        offset: 5,
        end: '20:00',
        start: '15:30',
        week: 4 },
      { type: 'time',
        offset: 5,
        end: '20:30',
        start: '13:30',
        week: 5 },
      { type: 'time',
        offset: 5,
        end: '22:30',
        start: '20:00',
        week: 1 },
      { type: 'time',
        offset: 5,
        end: '19:30',
        start: '16:00',
        week: 2 },
      { type: 'time',
        offset: 5,
        end: '23:30',
        start: '20:30',
        week: 2 } ]



  let reference = moment.utc();
    let time_ref = {
      year:reference.year(),
      month: reference.month(),
      date: reference.date(),
      day: reference.day()
    };
    function t_to_m(time, offset){
      let _temp =time.split(':').map(s=>{
        return parseInt(s);
      })
      return moment.utc()
        .year(time_ref.year)
        .month(time_ref.month)
        .date(time_ref.date)
        .hours(_temp[0]+offset)
        .minutes(_temp[1])
        .seconds(0)
        .milliseconds(0)
    }
    times = times.filter(a=>{
      return a.week == time_ref.day;
    }).sort((a,b)=>{
      return a.start > b.start;
    })
    console.log(times)
    let ranges = times.reduce((ranges,time)=>{
      let start = t_to_m(time.start,time.offset);
      let end = t_to_m(time.end, time.offset);
      let last = ranges[ranges.length-1];
      if(!start.isAfter(last.end)){
        if(end.isAfter(last.end)){
          last.end = end;
        }
      }else{
        ranges.push({
          start:start,
          end:end
        })
      }
      return ranges;
    },[{
      start: t_to_m(times[0].start,times[0].offset),
      end: t_to_m(times[0].end,times[0].offset),
    }]);

    console.log(ranges);


    console.log(t_to_m(time.start,time.offset).toISOString());


};
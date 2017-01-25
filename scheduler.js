(function(factory){
  window.xqmScheduler = factory();
})(function(){
  let options = {
    id:'xqm_scheduler',
    w_width: 500,
    w_height: 600,
  };
  let total_wrapper_id = 'xqmScheduler-wrapper', mouse_wrapper_id = 'xqmScheduler-content',
    weeks = ['Sun','Mon', 'Tues', 'Wen','Thus','Fri','Sat'], hours = [];
    for(let i = 0;i<25;i++){
      hours.push(i<10?`0${i}:00`:`${i}:00`);
    }

  let label = {
    w:30,
    h:60
  };

  function get_cords(e){
    let c_el;
    if(this.el.hasClass(total_wrapper_id)){
      c_el = this.el.find(`.${mouse_wrapper_id}`);
    } else{
      c_el = this.el.closest(`.${mouse_wrapper_id}`);
    }
    let cords = {
      x:e.pageX - c_el.offset().left,
      y:e.pageY - c_el.offset().top,
    }
    return  {
        x: Math.floor(cords.x / this.config.m_w ),
        y: Math.floor(cords.y / this.config.m_h),
    }
  }

  function get_rect_for_resize(block1,block2){
    return [block1.x,Math.min(block1.y, block2.y), 1, Math.max(Math.abs(block2.y-block1.y) + 1,1)]
  }

  function calc_event_rect(e, old_cords){
    if(!old_cords){
      old_cords = {
          x:this.data().cords[0],
          y:this.data().cords[1]
      }
    }
    let new_cords = get_cords.call(this,e);
    return get_rect_for_resize(old_cords,new_cords);
  }

  function to_time_string (num){
    let m = num % 60;
    m = m ==0?'00':m;
    let h = Math.floor(num/60);
    return `${h}:${m}`;
  }

  function time_to_cords(obj){
    function helper(time){
      let nums = time.split(":").map(x=>{return parseInt(x)});
      return (nums[0]*60+nums[1])/30
    }
    return [obj.week, helper(obj.start),1,helper(obj.end) - helper(obj.start)];
  }

  function remove_event_helper(list,event){
    let index = list.indexOf(event);
    list.splice(index,1);
  }

  class Group {
    constructor(data,key){
      this.data = [];
      data.map(data=>{
        this.insert(data[key],data);
      })
    }

    insert(key,val){
      let current = this.get(key);
      if(current){
        current.data.push(val);
      }else{
        this.data.push({
          key:key,
          data:[val]
        })
      }
    }

    get(key){
      for (let i = 0;i<this.data.length;i++){
        if (this.data[i].key == key){
          return this.data[i]
        }
      }
      return null;
    }

    print(){
      return this.data;
    }

  }

  let time_string_helper = {
    isBefore:function(a,b){
      a = this.toMinutes(a);
      b = this.toMinutes(b);
      return a < b;
    },
    isAfter:function(a,b){
      a = this.toMinutes(a);
      b = this.toMinutes(b);
      return a > b;
    },
    toMinutes: function (a) {
      a = a.split(':').map(a=>{return parseInt(a)});
      return a[0]*60 + a[1];
    }
  }

  function _event_combine(data){
    let re = [];
    if(data.length > 0){
      data.sort((a,b)=>{
        return a.start > b.start
      });
      re = data.reduce((pre, data)=>{
        let last = pre[pre.length -1];
        if(!time_string_helper.isAfter(data.start,last.end)){
          last.end = time_string_helper.isAfter(data.end,last.end)?data.end:last.end;
        }else{
          pre.push({
            week:data.week,
            start:data.start,
            end:data.end
          })
        }
        return pre;
      },[data[0]])
    }
    return re;

  }

  class EventGroup extends Group{

    combine(){
      this.data.map(data=>{
        data.data = _event_combine(data.data);
      })
    }

    print(){
      this.combine();
      return super.print()
    }
  }
  
  let events_timezone_helper = {

    new_range: function(s,e,w){
    w = w == -1?6:(w==7?0:w);
    return {
      week:w,
      start: s[0]+':' + s[1],
      end:e[0] + ':' + e[1]
    }
  },

    event_to_local:function(event,offset){
      let ranges = [];
      let s = event.start.split(':').map(a=>{return parseInt(a)});
      s[0] -= offset;
      let s_m = s[0]*60 + s[1];
      let e = event.end.split(':').map(a=>{return parseInt(a)});
      e[0] -= offset;
      let e_m = e[0] * 60 + e[1];
      if(s_m >= 0){
        ranges.push(events_timezone_helper.new_range(s,e,event.week))
      }else if(e_m <= 0 ){
        s[0] += 24;
        e[0] += 24;
        ranges.push(events_timezone_helper.new_range(s,e,event.week-1))
      }else{
        s[0] += 24;
        ranges.push(events_timezone_helper.new_range(s,[24,0],event.week -1))
        ranges.push(events_timezone_helper.new_range([0,0],e,event.week))
      }
      return ranges;

    },

    get_local_events:function(events){
      let offset = events_timezone_helper.get_current_offset();
      let res= events.reduce((ranges,event)=>{
        return ranges.concat(events_timezone_helper.event_to_local(event,offset));
      },[])
      return res;
    },

    get_current_offset:function(){
      return new Date().getTimezoneOffset() / 60;
    },

    //called in event object
    event_to_utc:function(offset){
      let ranges = [];
      let s = this.start.split(':').map(a=>{return parseInt(a)});
      s[0] += offset;
      let s_m = s[0] * 60 + s[1];
      let e = this.end.split(':').map(a=>{return parseInt(a)});
      e[0] += offset;
      let e_m = e[0] * 60 + e[1];
      if(e_m <= 24 * 60){
        ranges.push(events_timezone_helper.new_range(s,e,this.week))
      }else if(s_m >= 24*60){
        s[0] -= 24;
        e[0] -= 24;
        ranges.push(events_timezone_helper.new_range(s,e,this.week+1))
      }else{
        e[0] -= 24;
        ranges.push(events_timezone_helper.new_range(s,[24,0],this.week));
        ranges.push(events_timezone_helper.new_range([0,0],e,this.week+1));
      }
      return ranges;
    }

  };

  let events_helper = Object.assign(events_timezone_helper,{
    combine_events:function(events){
      let group = new EventGroup(events,'week');
      events = group.print();
      return events;

    }

  });

  let event_builder ={

      build: function(){
          event_builder.build_main.call(this);
          event_builder.add_resizer.call(this,'top');
          event_builder.add_resizer.call(this,'bottom');
          event_builder.add_remover.call(this);
          event_builder.add_copier.call(this);
      },

      build_main:function(){
          this.el = $('<div class="xqmScheduler-event"><div class="xqmScheduler-text"></div></div>');
      },

      add_resizer : function(position){
          let el = $(`<div class="xqmScheduler-resizer-${position}">`).appendTo(this.el);
          el.css({
              height:`${this.config.m_h/15}px`
          })
          el.on('mousedown', event_mouse_event_handler.hit_resizer(position, this))
      },

      add_remover: function(){
          let el = $(`<i class="xqmScheduler-remover fa fa-trash-o"></i>`).appendTo(this.el);
          el.on('click',this.destory.bind(this))
      },

      add_copier: function(){
          let el = $('<i class="xqmScheduler-copier fa fa-clone"></i>').appendTo(this.el);
          el.on('click',this.copy.bind(this))
      }

  };

  let scheduler_builder = {

    build:function(options){
        scheduler_builder.build_main.call(this,options);
        scheduler_builder.build_content.call(this,options);
        scheduler_builder.build_scales.call(this,options);
        scheduler_builder.build_weeks.call(this);
        scheduler_builder.build_hours.call(this);


    },

    build_main:function(options){
        let main = $('#'+options.id);
        main.css({
            height: `${options.w_height}px`,
            width: `${options.w_width}px`,

        }).addClass('xqmScheduler-wrapper');
        this.el = main;

    },

    build_content:function(options){
        let content = $('<div class="xqmScheduler-content" />');
        content.css({
            right:'0',
            top:`${label.w}px`,
            width:`${options.w_width-label.h}px`,
            height:`${options.i_height-label.w}px`,
        }).appendTo(this.el);

        this.content = content;
    },

    build_weeks:function(){
      let el = $('<div class="xqmScheduler-weeks"></div>').css({
        left:`${label.h}px`,
        right:'0',
        top:'0',
        height:`${label.w}px`
      }).appendTo(this.el);
      weeks.forEach(week=>{
        let wel = $(`<div class="xqmScheduler-week">${week}</div>`).appendTo(el);
      })
    },

    build_hours:function(){
      let unit_h = this.el.find('.xqmScheduler-hori').height() + 1;
      let current_h = label.w;
      for(let i = 0; i < 24; i++){
        let el = $(`<div class="xqmScheduler-hour">${hours[i]}</div>`).css({
          left:0,
          width:`${label.h}px`,
          height:'20px',
          top:`${current_h-10}px`
        }).appendTo(this.el);
        current_h += unit_h;
      }
      let el = $(`<div class="xqmScheduler-hour">${hours[24]}</div>`).css({
        left:0,
        width:`${label.h}px`,
        height:'20px',
        top:`${current_h-20}px`
      }).appendTo(this.el);

    },

    build_scales:function(options){
        let hori = $('<div class="xqmScheduler-hori-wrapper" />').appendTo(this.content);
        for(let i = 0; i<24; i++){
            $('<div class="xqmScheduler-hori" />').appendTo(hori);
        }

        let vert = $('<div class="xqmScheduler-vert-wrapper" />').appendTo(this.content);
        for(let i = 0; i<7; i++){
            $('<div class="xqmScheduler-vert" />').appendTo(vert);
        }
    }
  }

  let mouse_event_handler = {

      mouse_event:function(e){
          return get_cords.call(this,e);
      },

      stop_further:function(e){
          e.preventDefault();
          e.stopPropagation();
      }
  };

  let event_mouse_event_handler = Object.create(mouse_event_handler);
  Object.assign(event_mouse_event_handler,{

      start_move:function(event){
          return e=>{
              this.stop_further(e);
              let cords = this.mouse_event.call(event,e);
              event_listener_handler.startListen.call(event,'reposition',cords);
          }

      },

      mouse_move_reposition:function(){
          let event = arguments[0], o_cords = arguments[2];
          return e=>{
              let cords = this.mouse_event.call(event,e);
              let rect = [event.el.data('s-data').cords[0] + cords.x - o_cords.x,event.el.data('s-data').cords[1] + cords.y - o_cords.y,event.el.data('s-data').cords[2],event.el.data('s-data').cords[3]]
              event.change_text(...rect);
              event.re_render(...rect)
          }
      },

      mouse_move_reposition_stop:function(){
          let e = arguments[0], event = arguments[1], o_cords = arguments[3];
          let cords = this.mouse_event.call(event,e);
          let data = event.data();
          data.cords = [event.el.data('s-data').cords[0] + cords.x - o_cords.x,event.el.data('s-data').cords[1] + cords.y - o_cords.y,event.el.data('s-data').cords[2],event.el.data('s-data').cords[3]]
          event.data(data);
          event.re_render(...data.cords,true)


      },

      mouse_move_resize: function(){
          let event = arguments[0];
          let o_cords;
          if(arguments.length >= 3) o_cords = arguments[2];
          return e=>{
              this.stop_further(e)
              this.resize = true;
              let rect = calc_event_rect.call(event,e,o_cords);
              event.change_text(...rect);
              event.re_render(...rect);
          }
      },

      mouse_move_resize_stop: function(e){
          if(this.resize){
              let e = arguments[0], event = arguments[1], o_cords;
              if(arguments.length >= 4) o_cords = arguments[3];
              let rect = calc_event_rect.call(event,e,o_cords);
              let data = event.data();
              data.cords = rect;
              event.data(data);
          }
          this.resize = false;

      },

      hit_resizer:function(position,event){
          return e=>{
              this.stop_further(e);
              let cords= {
                  x:event.data().cords[0],
                  y:event.data().cords[1]
              };
              if(position == 'top'){
                  cords.y = event.data().cords[1]+event.data().cords[3]-1;
              }
              event_listener_handler.startListen.call(event,'resize',cords);
          }
      }


  });

  let scheduler_mouse_event_handler = Object.create(mouse_event_handler);
  Object.assign(scheduler_mouse_event_handler,{
      mouse_down:function(scheduler){
          return e=>{
              let cords = this.mouse_event.call(scheduler,e);
              let event = scheduler.create_event({
                  type:'cords',
                  cords: cords,
              });
              event_listener_handler.startListen.call(event,'resize',cords)
          }

      }
  })

  let event_listener_handler = {
      startListen:function(name){
          let mouse_wrapper = this.el.closest('.xqmScheduler-wrapper').find(`.${mouse_wrapper_id}`);
          mouse_wrapper.on('mousemove',event_mouse_event_handler[`mouse_move_${name}`](this,...arguments))
          mouse_wrapper.on('mouseup', e=>{
              mouse_wrapper.unbind('mousemove');
              mouse_wrapper.unbind('mouseup');
              event_mouse_event_handler[`mouse_move_${name}_stop`](e,this,...arguments);
          });
      }
  }

  class Event{
    
    constructor(options){
      let data;
      if(options.type == 'cords'){
        data = {
          cords:[options.cords.x, options.cords.y, 1, options.cords.h?options.cords.h:2],
        };
      }else if(options.type == 'time'){
        data = {
          cords:time_to_cords(options.time)
        }
      }
      this.config={
        m_w:options.m_w,
        m_h:options.m_h
      };
      event_builder.build.call(this);
      this.data(data);
      this.re_render(...data.cords,true);
      this.el.on('mousedown', event_mouse_event_handler.start_move(this));
    }

    setid(id){
      this.id = id;
      let data = this.data();
      this.data(data);
    }


    destory(){
      this.parent.remove_event(this);
    }

    copy(){
      this.parent.copy_event(this);
    }

    re_render(x,y,w,h,bool){
      this.el.css({
        top:`${y * this.config.m_h}px`,
        left:`${x * this.config.m_w}px`,
        width:`${w * this.config.m_w}px`,
        height:`${h * this.config.m_h}px`,
      });
      this.parse_data();
      if(bool) this.el.find('.xqmScheduler-text').html(`${this.start} to ${this.end}`);
    }


    change_text(a,b,c,d){
        let start = b*30,end = start + d*30;
        start = to_time_string(start);
        end = to_time_string(end);
        this.el.find('.xqmScheduler-text').html(`${start} to ${end}`);
    }

    data(data){
      if(data) this.el.data('s-data',data);
      return this.el.data('s-data');
    }

    parse_data(){
      let data = this.data().cords;
      this.week = data[0];
      this.start = data[1]*30;
      this.end = this.start + data[3]*30;
      this.start = to_time_string(this.start);
      this.end = to_time_string(this.end);
    }

    get_range(offset){
      this.parse_data();
      return events_helper.event_to_utc.call(this,offset);
    }

  }

  class Scheduler{
    
    constructor(cus_opt){
      this.events= [];
      this.eventid = 0;
      options = Object.assign(options,cus_opt);
      options.i_height = options.w_height*1.8;
      scheduler_builder.build.call(this,options);
      this.content.on('mousedown',scheduler_mouse_event_handler.mouse_down(this));
      this.config = Object.assign(options,{
          m_w:(this.content.width()+1)/7,
          m_h:(this.content.height()+1)/48
      })

    }

    create_event(options){
      if(options.type == 'events'){
        let events = options.events;
        events = events_helper.get_local_events(events);
        events = events_helper.combine_events(events);
        events.forEach(group=>{
          group.data.forEach(time=>{
            this.create_event({
              type:'time',
              time:time
            })
          })
        })
      }else{
        options = Object.assign({
          m_w:this.config.m_w,
          m_h:this.config.m_h,
        },options)
        let event = new Event(options);
        event.setid(this.eventid++);
        event.parent = this;
        event.el.appendTo(this.content)
        this.events.push(event);
        return event;
      }
    }

    remove_event(event){
      event.el.remove();
      remove_event_helper(this.events,event);
    }

    copy_event(event){
      let cords = event.data().cords;
      let new_event = this.create_event({
        type:'cords',
        cords:{
          x: cords[0],
          y: cords[1],
          h: cords[3]
        }
      });
      new_event.re_render(cords[0]*1.01,cords[1]*1.01, cords[2],cords[3]);
      return new_event;
    }

    get_events(){
      this.events.forEach(event=>{
        event.parse_data();
      });
      return this.events;
    }

    get_data_only(){
      let currentTimeZoneOffsetInHours = events_helper.get_current_offset();
      let utcRanges = this.events.reduce((ranges,event)=>{
        return ranges.concat(event.get_range(currentTimeZoneOffsetInHours));
      },[])
      utcRanges = new EventGroup(utcRanges,'week').print();
      return utcRanges.reduce((pre,data)=>{
        return pre.concat(data.data);
      },[]);
    }

    scroll_to_first(){
      let pos = 0;
      if(this.events.length > 0){
        let first =  this.events.reduce((min,event)=>{
          return Math.min(min,event.data().cords[1])
        },this.events[0].data().cords[1])
        pos = first*this.config.m_h + label.w - this.config.w_height * 0.2;
      }

      this.el.scrollTop(pos);
    }


  }

  return {
    init: function(options){
      return new Scheduler(options)
    }
  }

});



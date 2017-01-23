(function(factory){
  window.xqmScheduler = factory();
})(function(){
  var options = {
    id:'xqm_scheduler',
    w_width: 500,
    w_height: 600,
    i_height: 1000,
  };
  let total_wrapper_id = 'xqmScheduler-wrapper', mouse_wrapper_id = 'xqmScheduler-content';

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
        y: Math.floor(cords.y / this.config.m_h ),
    }
  }

  function get_rect(x1,y1,x2,y2){
    return [x1,Math.min(y1,y2),1,Math.max(Math.abs(y1-y2),1)];
  }

  function calc_event_rect(e, old_cords){
    if(!old_cords){
      old_cords = {
          x:this.data().cords[0],
          y:this.data().cords[1]
      }
    }
    let new_cords = get_cords.call(this,e);
    return get_rect(old_cords.x,old_cords.y,new_cords.x,new_cords.y);
  }

  function to_time_string (num){
    let m = num % 60;
    m = m ==0?'00':m;
    let h = Math.floor(num/60);
    return `${h}:${m}`;
  }

  function remove_event_helper(list,event){
    let index = list.indexOf(event);
    list.splice(index,1);

  }

  let event_builder ={

      build: function(){
          event_builder.add_resizer.call(this,'top');
          event_builder.add_resizer.call(this,'bottom');
          event_builder.add_remover.call(this);
          event_builder.add_copier.call(this);
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
            left:'0',
            right:'0',
            top:'0',
            height:`${options.i_height}px`,
        }).appendTo(this.el);

        this.content = content;
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
              event_listerner_handler.startListen.call(event,'reposition',cords);
          }

      },

      mouse_move_reposition:function(){
          let event = arguments[0], o_cords = arguments[2];
          return e=>{
              let cords = this.mouse_event.call(event,e);
              event.re_render(event.el.data('s-data').cords[0] + cords.x - o_cords.x,event.el.data('s-data').cords[1] + cords.y - o_cords.y,event.el.data('s-data').cords[2],event.el.data('s-data').cords[3])
          }
      },

      mouse_move_reposition_stop:function(){
          let e = arguments[0], event = arguments[1], o_cords = arguments[3];
          let cords = this.mouse_event.call(event,e);
          let data = event.data();
          data.cords = [event.el.data('s-data').cords[0] + cords.x - o_cords.x,event.el.data('s-data').cords[1] + cords.y - o_cords.y,event.el.data('s-data').cords[2],event.el.data('s-data').cords[3]]
          event.data(data);

      },

      mouse_move_resize: function(){
          let event = arguments[0];
          let o_cords;
          if(arguments.length >= 3) o_cords = arguments[2];
          return e=>{
              this.resize = true;
              let rect = calc_event_rect.call(event,e,o_cords);
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
                  cords.y = event.data().cords[1]+event.data().cords[3]
              }
              event_listerner_handler.startListen.call(event,'resize',cords);
          }
      }


  });

  let scheduler_mouse_event_handler = Object.create(mouse_event_handler);
  Object.assign(scheduler_mouse_event_handler,{
      mouse_down:function(scheduler){
          return e=>{
              let event = scheduler.create_event({
                  type:'cords',
                  cords: this.mouse_event.call(scheduler,e),
              });
              event_listerner_handler.startListen.call(event,'resize')
          }

      }
  })

  let event_listerner_handler = {
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
      if(options.type == 'cords'){
        this.config={
          m_w:options.m_w,
          m_h:options.m_h,
        };
        let data = {
          cords:[options.cords.x, options.cords.y, 1, options.cords.h?options.cords.h:2],
        };
        this.el = $('<div class="xqmScheduler-event"/>');
        this.data(data);
        event_builder.build.call(this);
        this.re_render(...data.cords);
        this.el.on('mousedown', event_mouse_event_handler.start_move(this));
      }
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

    re_render(x,y,w,h){
      this.el.css({
        top:`${y * this.config.m_h}px`,
        left:`${x * this.config.m_w}px`,
        width:`${w * this.config.m_w}px`,
        height:`${h * this.config.m_h}px`,
      });
      this.parse_data();
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


  }

  class scheduler{
    
    constructor(cus_opt){
      this.events= [];
      this.eventid = 0;
      options = Object.assign(options,cus_opt);
      scheduler_builder.build.call(this,options);
      this.content.on('mousedown',scheduler_mouse_event_handler.mouse_down(this));
      this.config = Object.assign(options,{
          m_w:(this.content.width()+1)/7,
          m_h:(this.content.height()+1)/48
      })

    }

    create_event(options){
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
      })
      return this.events;
    }
  }

  return {
    init: function(options){
      return new scheduler(options)
    }
  }

})


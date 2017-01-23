(function(factory){
  window.xqmScheduler = factory();
})(function(){
  var options = {
    id:'xqm_scheduler',
    w_width: 700,
    w_height: 700,
    i_height: 1400,
  };

  function get_cords(e){
    let parent;
    if(this.el.hasClass('xqmScheduler-wrapper')){
      parent = this.el;
    } else{
      parent = this.el.closest('.xqmScheduler-wrapper')
    }
    return {
      x:e.pageX - parent.offset().left,
      y:e.pageY - parent.offset().top,
    }
  }

  function get_rect(x1,y1,x2,y2,m_w,m_h){

    return [x2>=x1?x1:Math.min(x1-m_w,x2),y2>=y1?y1:Math.min(y1-m_h,y2),Math.max(m_w,Math.abs(x1-x2)),Math.max(Math.abs(y1-y2),m_h)];
  }

  function calc_event_rect(e){
    let new_cords = get_cords.call(this,e);
    let data = this.data();
    let old_cords = {
      x:data.cords[0],
      y:data.cords[1]
    }
    return get_rect(old_cords.x,old_cords.y,new_cords.x,new_cords.y,this.config.m_w,this.config.m_h);
  }

  class mouseDown{

    bind_mouse_down(){
      this.el.on('mousedown', this.mouse_down.bind(this))
    }

    mouse_down(e){
      return get_cords.call(this, e);
    }

  }

  class Event extends mouseDown{
    constructor(options){
      super()
      if(options.type == 'cords'){
        this.config={
          m_w:options.m_w,
          m_h:options.m_h
        }
        let event = {
          cords:[options.cords.x, options.cords.y, 30, 30]
        }
        this.el = $('<div class="xqmScheduler-event"/>').css({
          top:`${options.cords.y}px`,
          left:`${options.cords.x}px`,
          width:'50px',
          height:'50px',
        })
        this.el.data('s-data',event);
      }
    }

    resize(x,y,w,h){
      this.el.css({
        top:`${y}px`,
        left:`${x}px`,
        width:`${w}px`,
        height:`${h}px`,
      })
    }

    mouse_down(e){
      e.preventDefault()
      this.startListen();
    }

    startListen(){
      let mouse_wrapper = this.el.closest('.xqmScheduler-wrapper').find('.xqmScheduler-mouse');
      mouse_wrapper.on('mousemove',this.mouse_move.bind(this))
      mouse_wrapper.on('mouseup', this.stopListen.bind(this,mouse_wrapper));
    }

    data(){
      return this.el.data('s-data');
    }

    mouse_move(e){
      let rect = calc_event_rect.call(this,e);
      this.resize(...rect);
    }

    stopListen(other,e){
      other.unbind('mousemove');
      other.unbind('mouseup');
      let rect = calc_event_rect.call(this,e);
      let data = this.data();
      data.cords = rect;
      this.el.data('s-data',event);
    }

  }

  class scheduler extends mouseDown{
    constructor(cus_opt){
      super();
      options = Object.assign(options,cus_opt);
      this.options = options;
      let main = $('#'+options.id);
      main.css({
        border: '1px solid grey',
        height: `${options.w_height}px`,
        width: `${options.w_width}px`,
        'overflow-y': 'scroll',
        position: 'relative'
      });
      main.addClass('xqmScheduler-wrapper');
      $('<div class="xqmScheduler-mouse"></div>').appendTo(main);
      this.el= main;
      this.bind_mouse_down();
    }

    create_event(options){
      let event = new Event(options);
      event.el.appendTo(this.el)
      return event;
    }

    mouse_down(e){
      this.create_event({
        type:'cords',
        cords: super.mouse_down(e),
        m_w:this.options.w_width/7,
        m_h:this.options.i_height/48
      }).startListen()
    }

  }

  return {
    init: function(options){
      return new scheduler(options)
    }
  }

})



/**
 * Created by qianmoxie on 1/19/17.
 */
var app = angular.module('myApp', []);

app.controller('schedulerController',schedulerController);
function schedulerController ($scope){
    $scope.days = [1,2,3,4,5,6,7];
    $scope.hours = [1,2,3,4,5,6,7,8,9,10,11,12,13,14];
    let num_days = 7,
        num_hours = 28,
        parent = $('.scheduler-wrapper'),
        wrapper = $('.scheduler-scroll-pen'),
        control = $('.scheduler-controls'),
        w_height = wrapper.height(),
        w_width = wrapper.width(),
        u_width = (w_width +1)/7,
        u_height = (w_height + 1)/28,
        new_div = $(document.createElement('div'));


    let template = new_div.clone().addClass('scheduler-events');
    new_div.clone().addClass('scheduler-dragableBottom').appendTo(template);

    control.mousedown(e=>{
        let x = Math.ceil((e.pageX - parent.offset().left) * num_days / w_width);
        let y = Math.ceil((e.pageY - parent.offset().top + parent.scrollTop()) * num_hours / w_height);
        let div = template.clone();
        div.css({
            width:(u_width*0.9)+'px',
            height:(u_height)+'px',
            left:(u_width * (x-1))+'px',
            top:(u_height * (y-1)) + 'px'
        })
        control.append(div);
        control.mousemove(_init_move(div,x,y))
        control.mouseup(_init_destory(div))
    })

    let _init_move = (div,x,y) =>{
        return e=>{
            let x2 = Math.ceil((e.pageX - parent.offset().left) * num_days / w_width);
            let y2 = Math.ceil((e.pageY - parent.offset().top + parent.scrollTop()) * num_hours / w_height);
            div.css({
                width:(Math.abs(x2-x) * u_width+u_width - 8)+'px',
                height:((Math.abs(y2-y)) * u_height + u_height - 8)+'px',
                left:(u_width * (Math.min(x,x2)-1))+'px',
                top:(u_height * (Math.min(y,y2)-1)) + 'px'
            })
        }
    }

    let _init_destory = div=>{
        return ()=>{
            let dragable = div.find('.scheduler-dragableBottom');
            dragable.mousedown(e=>{
                e.stopPropagation();
                e.preventDefault();
                console.log('yo')

            })

            div.mousedown(e=>{
                e.stopPropagation();
                e.preventDefault();
                let x = e.pageX,y= e.pageY,target = $(e.target),
                    o_x = target.offset().left-wrapper.offset().left,
                    o_y = target.offset().top-wrapper.offset().top,
                    temp = target.clone();
                target.css({
                    transition: '0s'
                })
                temp.css({
                    opacity: '0.3'
                })
                temp.addClass('scheduler-temp-node')
                temp.appendTo(control);
                control.mousemove(_drag_move(target, x, y, o_x, o_y));
                control.mouseup(_drag_destory(target,temp));

            });
            control.unbind('mousemove');
            control.unbind('mouseup');
        }
    }

    let _drag_destory = (target,temp)=>{
        return e=>{
            target.css({
                transition: '0.2s'
            })
            let x =Math.floor((target.offset().left-wrapper.offset().left)/u_width + 0.5),
                y= Math.floor((target.offset().top-wrapper.offset().top)/u_height + 0.5);
            target.css({
                left:x*u_width+'px',
                top:y*u_height+'px'
            });
            temp.remove();
            control.unbind('mousemove');
            control.unbind('mouseup');
        }
    }

    let _drag_move = (target, x, y, o_x, o_y)=>{
        return e=>{
            let d_x = (e.pageX - x), d_y = (e.pageY - y);
            target.css({
                left:o_x+d_x+'px',
                top:o_y+d_y+'px'
            })
        }
    }
};
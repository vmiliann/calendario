var source = false;
var overlappedEvents = [];
var isDragging=false;


$(document).ready(function () {

    /* Configuracion inicial de los elementos del menu que se trataran como eventos( Lo que se va a arrastrar)

     /* Configurando el calendario
     -----------------------------------------------------------------*/

    $('#calendar').fullCalendar({
        header: {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay,basicDay',

        },
        allDaySlot: false,
        nextDayThreshold: '00:00:00',
        slotLabelFormat: 'h(:mm)a',

        views: {
            month: {
                //para que no se pueda arrastrar en la vista month
                droppable: false,
                timeFormat: 'h(:mm)a',
                showNonCurrentDates:true,
            },
            week: {
                timeFormat: 'h(:mm)a'
            },
            day: {
                timeFormat: 'h(:mm)a'
            },
            basicDay:{
                droppable: false,
            }

        },

        locale: getVarLocale(),
        editable: true,
        //droppable si es true podemos arrastrar eventos sobre el calendario
        droppable: true,
        //slotDuration define el tiempo incremental o decremental para  cada evento
        slotDuration: '00:15:00',
        // en el evento eventResize actualizamos en la tabla publicacion si se modifico la fecha fin de un evento en la vista day
        eventResize: function (event, delta, revertFunc, jsEvent, ui, view) {
            if(isAllowedResize(event)==false){
                alert(noNewsResize);
                revertFunc();
                return false;
            }
            updatePersistedEvent(event);
            return true;
        },
        //eventClick define la accion a ejecutar cuando se da clic sobre un evento
        eventClick: function (calEvent, jsEvent, view) {

                var clonedStart=calEvent.start.clone();
                var clonedEnd=calEvent.end.clone();

                if(isAllowedResize(calEvent)==false){
                    $("#finEvento").prop('disabled',true);
                    $('#infoBlock').html(noNewsEdit);
                }
                else{
                    $("#finEvento").prop('disabled',false);
                    $('#infoBlock').html('');
                }
            
            $('#crearPub').click();

            $('#ActualizarHora').on('click', function (evt) {
                    var reg = /^(0[0-9]|1[0-2]):([0-5][0-9]):([0-5][0-9])$/;
                    if(isAllowedResize(calEvent)==false){
                        var duration=moment.duration(calEvent.end.diff(calEvent.start));
                        var hours=duration.asHours();
                        var minutes=duration.asMinutes();
                        var seconds=duration.asSeconds();
                        var inicia=processStart(reg);
                        if(inicia==false){
                            alert(inicioEventoError);return false;
                        }
                        calEvent.start.set({
                            'hour': inicia.get('hour'),
                            'minute': inicia.get('minute'),
                            'second': inicia.get('second')

                        });
                        calEvent.end = moment(calEvent.start);
                        calEvent.end.set({
                            'hour': inicia.get('hour')+hours,
                            'minute': inicia.get('minute')+minutes,
                            'second': inicia.get('second')+seconds

                        });
                    }
                    else{
                        var inicia=processStart(reg);
                        if(inicia==false){
                            alert(inicioEventoError);return false;
                        }
                        var finaliza=processEnd(reg);
                        if(finaliza==false){
                            alert(finEventoError);return false;
                        }
                        var endsTomarrow=false;
                        var ordenCorrecto = inicia.isBefore(finaliza);
                        if (!ordenCorrecto) {
                            //Aki validar si empieza a 11pm hasta las 3 am por ejemplo
                            if(confirm(eventEndsNextDay)){
                                endsTomarrow=true;

                            }
                            //alert(finalMenorInicioError);
                            else
                                return false;
                        }
                        calEvent.start.set({
                            'hour': inicia.get('hour'),
                            'minute': inicia.get('minute'),
                            'second': inicia.get('second')

                        });
                        calEvent.end = moment(calEvent.start);
                        calEvent.end.set({
                            'hour': finaliza.get('hour'),
                            'minute': finaliza.get('minute'),
                            'second': finaliza.get('second')

                        });
                        if(endsTomarrow==true){
                            calEvent.end.set({'day':calEvent.end.get('day')+1});
                        }
                    }
                    var overlapsWith=overlapTo(calEvent);
                    if(overlapsWith.length){
                        if(calEvent.start.isBefore(overlapsWith[0].start)){
                            alert(endDateCollide);
                            calEvent.start=clonedStart;
                            calEvent.end=clonedEnd;
                            return false;
                        }
                        else{
                            updateEvent(overlapsWith, calEvent,false);
                        }
                    }
                    //checkOvelapping(calEvent,false);
                    $('#calendar').fullCalendar('updateEvent', calEvent);
                    updatePersistedEvent(calEvent);
                    $("#FinalizarEventoDef").click();

                });
            
            function processStart(reg){
                var inicio = $("#InicioEvento").val();
                var e = $('#iAmPm').val();
                e = parseInt(e, 10);
                if (reg.test(inicio) == false) {
                    return false;
                }
                inicio = moment(inicio, 'hh:mm:ss');
                inicio.set({'hour':inicio.get('hour')+e});
                return inicio;

            }

            function processEnd(reg){
                var fin = $("#finEvento").val();
                var f = $('#fAmPm').val();
                f = parseInt(f, 10)
                if (reg.test(fin) == false) {
                    return false;
                }
                fin = moment(fin, 'hh:mm:ss');
                fin.set({'hour':fin.get('hour')+f});
                return fin;
            }
        },


        //Aqui le agregamos el boton cerrar a cada evento. Se puede personalizar tanto como se quiere, pero es preferible utilizar un helper
        //si se van a hacer cambios radicales a la vista del evento
        eventRender: function (event, element, view) {
            //Para no mostrar los eventos de otros meses
//            if(isValidDate(event.start)==false)
//                return false;

            if (source == false) {
                checkOvelapping(event);

            }

            if (view.name === "month") {
                element.find(".fc-bg").css("pointer-events", "none");
                element.prepend("<span class='closeon'style='float: right;clear:left;'>X</span> ");
                element.find(".closeon").click(function () {
                    if(confirmClose(event)==false)return false;
                    var closeOper = closeAll(event);
                    if (closeOper == false) {
                        closeOne(event);
                    }
                });
            } else {
                element.find(".fc-bg").css("pointer-events", "none");
                element.prepend("<span  id='btnDeleteEvent' class='closeon'style='float: right;clear:left;'>X</span>");
                element.find("#btnDeleteEvent").click(function () {
                    if(confirmClose(event)==false)return false;
                    var closeOper = closeAll(event);
                    if (closeOper == false) {
                        closeOne(event);
                    }
                });
            }
            function confirmClose(event){
                if(event.type==tiposEventos.bloque){
                    return confirm(confirmCloseBlock);
                }
                else{
                    return confirm(confirmCloseEvent);
                }
            }

            function closeAll(evt) {
                if (evt.overlaped == false)
                    return false;
                var key = evt._id;
                var arr = overlappedEvents[evt._id]
                if (arr==undefined){
                    delete overlappedEvents[key];
                    return false;
                }
                var tot=arr.length;
                for (var value = 0; value < tot; value++) {
                    var e = $('#calendar').fullCalendar('clientEvents', arr[value]);
                    deleteEvent(e[0]);
                    $('#calendar').fullCalendar('removeEvents', arr[value]);

                }
                deleteEvent(evt);
                delete overlappedEvents[key];
                $('#calendar').fullCalendar('removeEvents', key);

                return true;


                return false;
            }
            function closeOne(event){
                removeOverlapsTrackingElement(event);
                deleteEvent(event);
                $('#calendar').fullCalendar('removeEvents', event._id);
            }
        },

        //este evento redirecciona a la vista day desde la vista month
        dayClick: function (date, jsEvent, view) {
            //Deshabilitar el evento para otros meses
            if(isValidDate(date)==false)
                return false;

            if (view.name === "month") {
                $('#calendar').fullCalendar('gotoDate', date);
                $('#calendar').fullCalendar('changeView', 'agendaDay');
            }
        },
        //este evento actualiza la publicacion cuando en la vista day se arrastra un elemento hacia otra hora inicio
        //Ojo esto no es lo mismo que drop, eventDrop no funciona con eventos externos, solo con eventos ya insertados en el calendario
        eventDrop: function (event, delta, revertFunc, jsEvent, ui, view) {
            //si es un bloque con contenido no se puede mover
            if (isBlockwithChildren(event) == true)
                return false;
            //console.log('drop')

            checkOvelapping(event,false);
            updatePersistedEvent(event);

        },

        eventOverlap: function (stillEvent, movingEvent) {
            //No permitir que se inserte pepe dentro de pepe  o dentro de algo
            //que no sea un bloque
            if(movingEvent.overlaped==false){
                if (stillEvent.type!=tiposEventos.bloque){
                    performAlert(noOverlapAllowed,'alertblock');
                    return false;
                }
                if (movingEvent.type == tiposEventos.bloque){
                    performAlert(noNestedBlock,'alertevent');
                    return false;
                }
//                else if(movingEvent.overlaped==true){
//                    return true;
//                }
            }
            if(movingEvent.start.isBefore(stillEvent.start)){
                if(movingEvent.overlaped==false)
                return false;
            }
            updateEvent(stillEvent, movingEvent,true);
            return true;

            function performAlert(msg,type){
                var alerted = localStorage.getItem(type) || '';
                if(alerted=='alerted'){
                    return false;
                }
                else{
                    localStorage.setItem(type,'alerted');
                    alert(msg);
                }
            }
        },
//
//        // en el evento drop insertamos en la tabla publicacion cuando se suelta un elemento sobre el calendario
//        drop: function (date, jsEvent, ui, resourceId, callback) {
//            //var originalEventObject = $(this).data('event');
//
//
//        },
//        //Mejor usar este en lugar del drop
        eventReceive: function (event) {
            if(event.type==tiposEventos.cartelera){
            if(!confirm(tipoCartelera)){
                event.type=tiposEventos.carteleraC;
            }}
            checkOvelapping(event,false);
            $('#calendar').fullCalendar('updateEvent', event);
            createEvent(event);
        },

        eventAfterAllRender: function (view) {
            if (source == false) {
                $('#calendar').fullCalendar('changeView', 'agendaWeek');
                $('#calendar').fullCalendar('changeView', view.name);
                source = true;

            }


        },
        viewRender: function(view,element){
//           if(source==true){
//                //source=false;
//            var e = $('#calendar').fullCalendar('clientEvents',function(ev){
//                        if(ev.start.isSameOrAfter(view.start)&&ev.end.isSameOrBefore(view.end))
//                            return true;
//                        return false;
//                        });
//            for(var i=0;i<e.length;i++){
//               checkOvelapping(e[i]);
//               //console.log(e[i])
//            }
//                        }
        },

        events: function (start, end, timezone, callback) {
            var events = [];
            var options = {};
            options.data = {};
            options.data.start=start.format('YYYY-MM-DD');
            options.data.end=end.format('YYYY-MM-DD');
            options.type = 'text/json'
            options.method = 'POST';
            options.url = Routing.generate('publication_all');
            options.errorcallback = function (error) {
                console.log(error);
            }
            options.successcallback = function (data) {
                var parseData = JSON.parse(data);

                $(parseData).each(function () {
                    var startTime = this.startTime;
                    startTime = (((startTime.date).split(' ')[1]).split('.'))[0];
                    var startObj = moment(startTime, 'HH:mm:ss');
                    var startDate = (this.startDate.date).split(' ')[0];
                    var startDate = moment(startDate, 'YYYY-MM-DD HH:mm:ss').utcOffset(+0000);
                    startDate.set({
                        'hour': startObj.get('hour'),
                        'minute': startObj.get('minute'),
                        'second': startObj.get('second')
                    });
                    var endTime = this.endTime;
                    endTime = (((endTime.date).split(' ')[1]).split('.'))[0];
                    var endObj = moment(endTime, 'HH:mm:ss');
                    var endDate = (this.endDate.date).split(' ')[0];
                    var endDate = moment(endDate, 'YYYY-MM-DD HH:mm:ss').utcOffset(+0000);
                    endDate.set({
                        'hour': endObj.get('hour'),
                        'minute': endObj.get('minute'),
                        'second': endObj.get('second')
                    });
                    //   if(startDate.isSameOrAfter(start)&&endDate.isSameOrBefore(end)){
                    if(isValidDate(startDate)==true){
                        events.push(
                            {
                                title: this.title, // use the element's text as the event title
                                idRef: -1,
                                type: this.type,
                                publicationId: this.idPub,
                                color: setColors(this.type),
                                overlaped: false,
                                overlaps: false,
                                parentBlock: this.parent,
                                start: startDate,
                                end: endDate,
                                stick: true,
                                idRef: this.ref,
                                allDay:false
                            }
                        );
                    }
                    //}
                });

                callback(events);
            };
            ajaxAccess(options);


        },

    });
    
    //Personalizando algunas cosas del calendario:tooltips iconos...
    $('.fc-button-group').click(function(){
        source=false;
    });
    $('.fc-basicDay-button').text('');
    $('.fc-basicDay-button').addClass('button-details-day-calendar');

    $('.fc-basicDay-button').attr('data-toggle',"tooltip").attr('data-placement',"top").attr('title',"Hooray!");
    $('.fc-basicDay-button').tooltip(); 
  

    // $('.fc-basicDay-button').attr('data-toggle',"tooltip").attr('data-placement',"top").attr('title',"Hooray!");
    // $('[data-toggle="tooltip"]').tooltip();


});







//---------------------------------------------------------------------------------------------------
//Comenzamos con las funciones auxiliares

function isValidDate(date){
    var currentDate=$("#calendar").fullCalendar('getDate');
    var currentMonth=currentDate.get('month');
    if(date.get('month')!=currentMonth){
        return false;
    }
    return true;
}

function checkOvelapping(event,state) {
    var overlap = overlapTo(event);
    updateEvent(overlap, event),state;
}
//Verifica si un evento se solapa con cualquier otro de ese mes anno y dia, para simplificar
function overlapTo(event) {
    var start = new Date(event.start);
    var end = new Date(event.end);
    return $('#calendar').fullCalendar('clientEvents', function (ev) {
        if (ev == event) {

            return false;
        }
        if (event.overlaped == true) {
            return false;
        }
        if (event.start.get('day') != ev.start.get('day') || event.start.get('month') != ev.start.get('month') || event.start.get('year') != ev.start.get('year')) {
            return false;
        }
        var estart = new Date(ev.start);
        var eend = new Date(ev.end);

        return (
            (Math.round(start) > Math.round(estart) && Math.round(start) < Math.round(eend))
            ||
            (Math.round(end) > Math.round(estart) && Math.round(end) < Math.round(eend))
            ||
            (Math.round(start) < Math.round(estart) && Math.round(end) > Math.round(eend))
        );
    });
}

function updateEvent(overlap, event,state) {
//    if (source == false) {
//        if (event.parentBlock == -1) {
//            return false;
//        }
//    }

    if (overlap.length) {
        //Si el elemnento no es un bloque
        if (event.overlaped == false) {
            if(state==false){

                return true;
            }
            if(event.type==tiposEventos.bloque)
                return false;
            //Si el elemento no estaba previamente dentro de un bloque lo asignamos al mismo
            if (event.overlaps == false) {
                event.overlaps = true;
            }
            //Si estaba dentro de otro bloque lo eliminamos del mismo
            else if (event.overlaps == true) {
                removeFromParent(overlap,event);
            }
            //marcado como dentro del bloque y se le asignan los colores
            event.direct=overlap._id;
            event.parentBlock = overlap[0].publicationId || -1;
            overlap[0].overlaped = true;
            event.backgroundColor = overlapsColor;


            //lo agregamos a overlappedEvents para rastrearlo
            if (overlappedEvents[overlap[0]._id] == null && overlappedEvents[overlap[0]._id] == undefined) {
                overlappedEvents[overlap[0]._id] = [];
            }
            if (!exists(overlappedEvents[overlap[0]._id], event._id))
                overlappedEvents[overlap[0]._id].push(event._id);
        }
        //Si el elemento es un bloque---No se si esto se cumpla alguna vez--Probar
        else if (event.overlaped == true) {
            return false;
        }
    } else {

        if (event.overlaps == true) {
            event.overlaps = false;
            event.backgroundColor = '';
            removeOverlapsTrackingElement(event);
            event.parentBlock = -1;
        }
        if (event.overlaped == true && isBlockwithChildren(event) == false) {
            event.overlaped = false;
        }

    }
    return true;

}
//Determina si el bloque contiene elementos
function isBlockwithChildren(event) {
    if (event.overlaped == true) {
        for (var key in overlappedEvents) {
            if (key == event._id) {
                var arr = overlappedEvents[key];
                if (arr !== undefined && arr != null && arr.length > 0) {
                    return true;
                }
            }
        }
    }
    return false
}
function isAllowedResize(event){
    if (event.type==tiposEventos.noticia)
        return false;
    return true;
}
function removeFromParent(parent,event){
    var arr=overlappedEvents[parent._id];
    if(arr==null||arr==undefined)return false;
    for (var value = 0; value < arr.length; value++) {
        if (arr[value] == event._id) {
            arr.splice(value, 1);
            if (arr.length == 0) {
                parent.overlaped = false;
                delete(overlappedEvents[key]);
            }
            break;
        }
    }
}

//Elimina, si existe, un evento asociado a algun bloque
function removeOverlapsTrackingElement(event) {
    if(event.direct==-1)return false;
    var arr = overlappedEvents[event.direct]
    if(arr==null||arr==undefined)return false;
    for (var value = 0; value < arr.length; value++) {
        if (arr[value] == event._id) {
            //var parentObject = $('#calendar').fullCalendar('clientEvents', key);
            //parentObject.backgroundColor = '';
            arr.splice(value, 1);
            if (arr.length == 0) {
                var e = $('#calendar').fullCalendar('clientEvents', event.direct);
                e.overlaped = false;
                delete(overlappedEvents[event.direct]);
            }
            break;
        }
    }

}

function exists(arr, elem) {
    for (var item in arr) {
        if (item == elem)
            return true;
    }
    return false;
}

$("#cambiarIntervaloEvento").on('click', function (event)
{
    var range = $("#intervaloEvento").val() || '00:15:00';
    var reg = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/;
    if (reg.test(range) == false) {
        alert(formatEventIntervalError);
        return false;
    }
    if (range == '00:00:00') {
        alert(timeTooShort);
        return false;
    }
    var times=range.split(':');
    if(parseInt(times[0],10)<=0){
        if(parseInt(times[1],10)<1){
            alert(timeTooShort);
            return false;
        }
    }
    $('#calendar').fullCalendar('changeView', 'agendaDay');
    setTimeout(go, 400);
    function go() {
        $('#calendar').fullCalendar('option', 'slotDuration', range);
    }

});
//------------------------------------------------------------------------------------
//Funciones de acceso a datos

function createEvent(event) {
    var options = {};
    options.data = {};
    var time = event.start.format('YYYY-MM-DD h:mm:ss a');
    options.data.startTime = time;
    //var time1=event.end.format('h:mm:ss a')
    var time1 = event.end.format('YYYY-MM-DD h:mm:ss a')
    options.data.endTime = time1;
    var time2 = event.start.format('YYYY-MM-DD h:mm:ss a');
    options.data.startDate = time2;
    var time3 = event.end.format('YYYY-MM-DD h:mm:ss a')
    options.data.endDate = time3;
    options.data.idBlock = event.parentBlock;
    options.data.inTransmission = false;
    options.data.type_id = event.idRef;
    options.data.type_publication = event.type;
    options.method = 'POST';
    options.url = Routing.generate('publication_create');
    options.errorcallback = function (error) {
        console.log(error);
    }
    options.successcallback = function (data) {
        if (event.publicationId != '')
            return true;
        else {
            var id = JSON.parse(data);
            event.publicationId = id;
        }
    };
    ajaxAccess(options);
}

function updatePersistedEvent(event) {
    var options = {};
    options.data = {};
    var time = event.start.format('YYYY-MM-DD h:mm:ss a');
    options.data.startTime = time;
    options.data.parent = event.parentBlock;
    //var time1=event.end.format('h:mm:ss a')
    var time1 = event.end.format('YYYY-MM-DD h:mm:ss a')
    options.data.endTime = time1;
    var time2 = event.start.format('YYYY-MM-DD h:mm:ss a');
    options.data.startDate = time2;
    var time3 = event.end.format('YYYY-MM-DD h:mm:ss a')
    options.data.endDate = time3;
    options.method = 'POST';
    options.url = Routing.generate('publication_update', {id: event.publicationId});
    ajaxAccess(options);
}

function deleteEvent(event) {
    var options = {};
    options.method = 'GET';
    options.url = Routing.generate('publication_delete', {id: event.publicationId});
    ajaxAccess(options);
}

function ajaxAccess(options) {
    $.ajax({
        type: options.method,
        url: options.url,
        cache: false,
        contentType: 'application/json',
        data: JSON.stringify(options.data),
        beforeSend: function () {

        },
        success: function (response) {
            //metiendole el pie al js si no qiero pasar callback
            options.successcallback != undefined ? options.successcallback(response) : 1 == 1;

        },
        error: function (response) {
            options.errorcallback != undefined ? options.errorcallback(response) : 1 == 1;
        }
    });
}

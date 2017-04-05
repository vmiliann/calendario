/**
 * Created by darian on 1/24/17.
 */
$language_es={
    info: "Información",
    infoNews: "Información de la Noticia",
    infoNewsBlock: "Información del Bloque",
    infoSignal: "Información de la Señal",
    edit: "Editar",
    editNewsBlock: "Editar bloque",
    editSignal: "Editar Señal"
};
$language_en={
    info: "Information",
    infoNews: "News Information",
    infoNewsBlock: "News Block Information",
    infoSignal: "Signal Information",
    edit: "Edit",
    editNewsBlock: "Edit Block",
    editSignal: "Edit Signal"
};

var $translation = $language_es;
if(getVarLocale()=="en"){
    $translation = $language_en;
}

var resourcesActions = function (row, data) {
    setupDraggableClass(row);
    var otherButtons = [];
    setupActionRows(row, otherButtons);

    var getId = function () {
        return data[0];
    };

    var getType = function () {
        return data[2];
    };

    var editResource = function () {
        var id = getId();
        var type = getType();

        if (type == 'noticia' || type == 'presentacion' || type == 'creditos' || type == 'patron'){
            document.location.href = Routing.generate('edit_news', {id : id, origin: 'publication',edit:'Edit'});
        } else if (type == 'bloque'){
            var url = Routing.generate('blockgenerate_edit', {id: id, dir: 'publication'});
            uiWindow.templateCustom('', $translation.editNewsBlock, url, function () {
            });
        } else if (type == 'sennal'){
            var url = Routing.generate('signal_edit', {id: id});
            uiWindow.templateCustom('', $translation.editSignal , url, function () {
            });
        }
    };

    var infoResource = function () {
        var id = getId();
        var type = getType();
        if (type == 'noticia'){
            uiWindow.template(' ',$translation.infoNews, Routing.generate('obtener_news',{id: id}),function(){},[]);
        } else if (type == 'bloque'){
            uiWindow.templateCustom(' ',$translation.infoNewsBlock, Routing.generate('blockgenerate_show',{id: id}),function(){},[]);
        } else if (type == 'sennal'){
            uiWindow.templateCustom(' ',$translation.infoSignal, Routing.generate('signal_show', {id: id}), function () {}, []);
        }

    };

    var information = $('.information', row);
    var edit = $('.edit', row);

    registerClickEvent(information, infoResource);
    registerClickEvent(edit, editResource);
    setupResourcesIcon(row);

};

var setupDraggableClass = function (row) {
    /*Para hacer draggable los elementos listados*/
    var ele=$('td:nth-child(2)', row);
    ele.addClass('fc-event');
    var oTable = $('#table_bug_report').DataTable();
    var rowData = oTable.row(row).data();
    ele.data('event', {
        title: $.trim(rowData[1]), // use the element's text as the event title
        stick: true, // maintain when user navigates (see docs on the renderEvent method)
        idRef: rowData[0],
        type: rowData[2],
        publicationId: '',
        color: setColors( rowData[2]),
        direct:-1,
        
    });
    if(rowData[3]!=undefined){
        var dur=moment("1900-01-01 00:00:00").add(rowData[3],'seconds').format('HH:mm:ss');
        ele.data('duration', dur);
    }
    else{
        ele.data('duration', '01:00:00');
    }
    initialize(ele, row);
    setColors(rowData[2],ele);
    ele.draggable({
        zIndex: 999,
        revert: true, // will cause the event to go back to its
        revertDuration: 0  //  original position after the drag
    });
};

function initialize(elem) {
    var dataE = $(elem).data('event');
    dataE.overlaped = false;
    dataE.overlaps = false;
    dataE.parentBlock = -1;

};

function setColors(type){
    if(type==tiposEventos.bloque){
        return overlapedColor
    }
    if(type==tiposEventos.patron){
        return patronColor;
    }
};

var setupResourcesIcon = function (row) {
    var $type = null;
    var oTable = $('#table_bug_report').DataTable();
    oTable.rows().each(function () {
        var $data = this.data();
        $type = $data[0][2];
        console.log($type);
        if ($type == 'bloque'){
            var $iconBlock = $('<span class="sp sp-ico-menu-bloque"></span>');
            $('td:first-child', row).html($iconBlock);
        } else if ($type == 'noticia' || $type == 'presentacion' || $type == 'cartelera' || $type == 'patron' || $type == 'creditos'){
            var $iconNews = $('<span class="sp sp-ico-menu-noticia"></span>');
            $('td:first-child', row).html($iconNews);
        } else if ($type == 'sennal'){
            var $iconSignal = $('<span class="sp sp-ico-menu-sennal"></span>');
            $('td:first-child', row).html($iconSignal);
        }
    });
};

var setupActionRows = function (row, otherButtons) {
    var $btnGroup = $('<div class="btn-group"></div>');

    var $btnInfo = $('<a class="btn btn-mini information " id="info" title="'+$translation.info+'"></a>');
    $btnInfo.append($('<i class="sp sp-ico-btn-mas-informacion"></i>'));

    var $btnEditar = $('<a class="btn btn-mini info edit areal" title="'+$translation.edit+'"></a>');
    $btnEditar.append($('<i class="sp sp-ico-btn-actualizar"></i>'));

    $btnGroup.append($btnInfo).append($btnEditar);

    for (var i = 0; i < otherButtons.length; i++) {
        var b = otherButtons[i];
        $btnGroup.prepend(b);
    }

    var $td = $('<td></td>');
    $td.append($btnGroup);

    $(row).append($td);
};

var drawInPublication = function () {

};

(function ($) {
    var $type = 'bloque';
    var columns = [
        {"bSortable": false, sWidth: '4%'},
        {"bSortable": true, sWidth: '96%'}
    ];
    addDatatable(columns, Routing.generate('publication_list_resources', {type: $type}), drawInPublication, resourcesActions, 'publication');
})(jQuery)


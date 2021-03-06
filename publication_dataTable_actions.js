/**
 * Created by darian on 1/26/17.
 */

$language_es={
    info: "Información",
    infoNews: "Información de la Noticia",
    infoNewsBlock: "Información del Bloque",
    infoSignal: "Información de la Señal",
    edit: "Editar",
    editNewsBlock: "Editar Bloque",
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
$language_fr={
    info: "Information",
    infoNews: "Informations de la nouvelle",
    infoNewsBlock: "Informations sur le bloc",
    infoSignal: "Information sur le signal",
    edit: "Edit",
    editNewsBlock: "Editer le bloc",
    editSignal: "Edit Signal"
};

var $translation = $language_es;
if(getVarLocale()=="en"){
    $translation = $language_en;
}
if(getVarLocale()=="fr"){
    $translation = $language_fr;
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

        if (type == 'Noticia'){
            document.location.href = Routing.generate('edit_news', {id : id, origin: 'publication',edit:'Edit'});
        } else if (type == 'Bloque'){
            var url = Routing.generate('blockgenerate_edit', {id: id, dir: 'publication'});
            uiWindow.templateCustom('', $translation.editNewsBlock, url, function () {
            });
        } else if (type == 'Señal'){
            var url = Routing.generate('signal_edit', {id: id});
            uiWindow.templateCustom('', $translation.editSignal , url, function () {
            });
        }
    };

    var infoResource = function () {
        var id = getId();
        var type = getType();
        if (type == 'Noticia'){
            uiWindow.template(' ',$translation.infoNews, Routing.generate('obtener_news',{id: id}),function(){},[]);
        } else if (type == 'Bloque'){
            uiWindow.templateCustom(' ',$translation.infoNewsBlock, Routing.generate('blockgenerate_show',{id: id}),function(){},[]);
        } else if (type == 'Señal'){
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
        color: setColors( rowData[2])
    });
    ele.data('duration', '01:00:00');
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
        return overlapsColor
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
        if ($type == 'Bloque'){
            var $iconBlock = $('<span class="sp sp-ico-menu-bloque"></span>');
            $('td:first-child', row).html($iconBlock);
        } else if ($type == 'Noticia'){
            var $iconNews = $('<span class="sp sp-ico-menu-noticia"></span>');
            $('td:first-child', row).html($iconNews);
        } else if ($type == 'Señal'){
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

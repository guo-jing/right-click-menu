var $gridHeader = $('#grid-header');
var $gridHeaderMenu = $('#grid-header-menu');
var $menuSpans = null;
var $draggingSpan = null;
var isOpened = false;
var isDragging = false;
var startPosition = {x: 0, y: 0};
var boundaryOfTriggerUpdate = {top: 0, bottom: 0}; // 触发 updateDOM 函数的边界位置
var marginTop = 10; // 每层列名的 margin
var marginBottom = 10;
var menuBorderWidth = 1; // 菜单边框宽度
var lastTime = 0; // 节流函数计时器
var floorHeight = 0; // 每层列名的高度
var lastTop = 0; // 保存 top 属性

renderGrid();

$gridHeader.on('contextmenu', function(event){
    event.preventDefault();
    isOpened = true;
    $gridHeaderMenu.css('left', event.clientX + 'px');
    $gridHeaderMenu.css('top', event.clientY + 'px');
    $gridHeaderMenu.show();
});

$(document).on('click', function(event){
    if (isOpened && !($(event.target).attr('id') === 'grid-header-menu' || $(event.target).parents('#grid-header-menu').length > 0)) {
        var $checkboxs = $gridHeaderMenu.find('.layui-form-checkbox');
        var headerData = [];
        for(var i = 0; i < $checkboxs.length; i++) {
            var $div = $('#grid-header-menu > .layui-form-checkbox[index = ' + i + ']');
            var originIndex = parseInt($div.attr('origin-index'));
            var $input = $('#grid-header-menu > input:nth-of-type(' + (originIndex + 1) + ')');
            headerData.push({
                key: $input.attr('title'),
                checked: $div.hasClass('layui-form-checked')
            });
        }
        resetGridHeader(headerData);
        isOpened = false;
        $gridHeaderMenu.hide();
    }
});

$gridHeaderMenu.on('mouseleave', function(event){
    isDragging = false;
});

function renderGrid() {
    var gridHeaders = getGridHeaders();
    for (var i = 0; i < gridHeaders.length; i++) {
        $gridHeaderMenu.append('<input type="checkbox" lay-skin="primary" title="'
        + gridHeaders[i].name + '"'
        + (gridHeaders[i].checked ? ' checked ' : '') + '>');
    }
    layui.use('form', function(){
        $checkboxs = $('#grid-header-menu > .layui-form-checkbox');
        for (var i = 0; i < $checkboxs.length; i++) {
            $checkboxs.eq(i).attr('origin-index', i);
            $checkboxs.eq(i).attr('index', i);
        }
        $menuSpans = $('#grid-header-menu > .layui-form-checkbox > span');
        $menuSpans.on('mousedown', function(event){
            isDragging = true;
            $draggingSpan = $(event.target);
            floorHeight = $draggingSpan.height() + marginTop;
            startPosition = {x: event.clientX, y: event.clientY};
            boundaryOfTriggerUpdate = {
                top: $(event.target)[0].getBoundingClientRect().top,
                bottom: $(event.target)[0].getBoundingClientRect().bottom
            };
            lastTop = parseInt($draggingSpan.parent('.layui-form-checkbox').css('top'));
        });

        $menuSpans.on('mousemove', function(event){
            if (isDragging) {
                $draggingSpan.parent('.layui-form-checkbox')
                    .css('top', (lastTop + event.clientY - startPosition.y) + 'px');
                if (event.clientY < boundaryOfTriggerUpdate.top - marginTop
                    || event.clientY > boundaryOfTriggerUpdate.bottom + marginBottom) {
                    console.log('当前鼠标高度：', event.clientY);
                    console.log('当前触发更新边界（上）：', boundaryOfTriggerUpdate.top - marginTop);
                    console.log('当前触发更新边界（下）：', boundaryOfTriggerUpdate.bottom + marginBottom);
                    if (event.clientY < boundaryOfTriggerUpdate.top - marginTop) {
                        console.log('预期因为上移而更新 dom');
                    } else {
                        console.log('预期因为下移而更新 dom');
                    }
                    updateDom(event);
                }
            }
        });

        $menuSpans.on('mouseup', function(event){
            isDragging = false;
            var index = parseInt($draggingSpan.parent('.layui-form-checkbox').attr('index'));
            var originIndex = parseInt($draggingSpan.parent('.layui-form-checkbox').attr('origin-index'));
            var offset = index - originIndex;
            $draggingSpan.parent('.layui-form-checkbox').css('top', offset * floorHeight + 'px');
        });

        $menuSpans.on('click', function(event){
            event.stopPropagation();
        });
    });
}

function getGridHeaders() {
    // 从 grid 实例中取得这个数据
    return [
        {name: '列名1', checked: false},
        {name: '列名2', checked: false},
        {name: '列名3', checked: false},
        {name: '列名4', checked: false},
        {name: '列名5', checked: false},
        {name: '列名6', checked: false},
        {name: '列名7', checked: false},
        {name: '列名8', checked: false},
        {name: '列名9', checked: false},
        {name: '列名10', checked: true}
    ];
}

function resetGridHeader(data) {
    // 重置 grid 的表头
    console.log(data);
}

function updateDom(event){
    var currentTime = new Date();
    if (currentTime - lastTime > 300) {
        var menuTop = $gridHeaderMenu[0].getBoundingClientRect().top + menuBorderWidth;
        var targetIndex = Math.floor((event.clientY - menuTop) / floorHeight);
        console.log('目标列名 index:', targetIndex);
        var originIndex = Math.floor((boundaryOfTriggerUpdate.top - menuTop) / floorHeight);
        console.log('源列名 index:', originIndex);
        var offset = originIndex - targetIndex;
        var $targetDIV = $gridHeaderMenu.children('div[index=' + targetIndex + ']');
        console.log('获取到目标 DIV:', $targetDIV, '原始 index：', parseInt($targetDIV.attr('index')));
        var $originDIV = $gridHeaderMenu.children('div[index=' + originIndex + ']');
        console.log('获取到源 DIV:', $originDIV, '源 index：', parseInt($originDIV.attr('index')));
        $targetDIV.attr('index', parseInt($targetDIV.attr('index')) + offset);
        console.log('目标 DIV 的 index 属性被改为：', $targetDIV.attr('index'));
        $originDIV.attr('index', parseInt($originDIV.attr('index')) - offset);
        console.log('源 DIV 的 index 属性被改为：', $originDIV.attr('index'));
        $targetDIV.css('top', parseInt($targetDIV.css('top')) + offset * floorHeight + 'px');
        console.log('目标 DIV 的 top 改为：', $targetDIV.css('top'));
        boundaryOfTriggerUpdate = {
            top: menuTop + floorHeight * (parseInt($originDIV.attr('index')) + 1) - $draggingSpan.height(),
            bottom: menuTop + floorHeight * (parseInt($originDIV.attr('index')) + 1)
        };
        lastTime = currentTime;
    }
}


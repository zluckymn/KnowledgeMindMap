﻿/**
* jhglgrid.js 2011/11/14 by Qingbao.Zhao, depend wkpcomm.js
*/
var zhhyLevel = []; //  [{ lvlid: '-1', lvlname: '请选择' }, { lvlid: '6', lvlname: '一级计划' }, { lvlid: '7', lvlname: '二级计划' }, { lvlid: '8', lvlname: '三级计划' }, { lvlid: '9', lvlname: '四级计划'}]
var zhhynode = []; //  [{ nodeid: '-1', nodename: '请选择' }, { nodeid: '1', nodename: '费用支付' }, { nodeid: '2', nodename: '合同节点' }, { nodeid: '3', nodename: '供应商' }, { nodeid: '4', nodename: '任务书' }, { nodeid: '8', nodename: '开工' }, { nodeid: '9', nodename: '开放' }, { nodeid: '7', nodename: '多审批任务'}];

$.ajax({
    type: 'POST',
    url: "/home/GetSingleTableJson",
    data: { tbName: "TaskLevel", qu: "db.TaskLevel.distinct('_id',{'isUse':'1'})", of: "order" },
    success: function (rs) {
        for (var i = 0; i < rs.length; i++) {
            zhhyLevel.push({ "lvlid": rs[i].level, lvlname: rs[i].name });
        }
    }
});
$.ajax({
    type: 'POST',
    url: "/home/GetSingleTableJson",
    data: { tbName: "PlanTaskType", qu: "db.PlanTaskType.distinct('_id',{'isUse':'1'})", of: "order" },
    success: function (rs) {
        for (var i = 0; i < rs.length; i++) {
            zhhynode.push({ "nodeid": rs[i].taskType, nodename: rs[i].name });
        }
    }
});
var apprSet = (function () {
    var taskId;
    function showPanel(t) {
        $.YH.box({
            title: '审批流程设置',
            width: 630,
            target: '/PlanManage/PlanTaskFlowPartInfo?taskId=' + taskId + '&r=' + Math.random(),
            buttons: {
                '关闭': {
                    click: function () {
                        $(this).dialog("destroy");
                        return false;
                    },
                    text: '关闭'
                }
            }
        });
    }
    return {
        init: function (tid) {
            taskId = tid;
            showPanel(this);
        }
    };
})();

var sourceDataStr = new Array("PlanTaskPage_pageId", "PlanTaskType_taskType", "TaskOrganization_taskOrgId", "SystemProfessional_profId", "TaskLevel_level");
var sourceData = {};
var plvlStr = new Array("taskTypeId", "pageId", "nodeTypeId", "levelId", "taskOrgId", "taskProfId"); //添加
for (var i = 0; i < sourceDataStr.length; i++) {
    // sourceData.push({sourceDataStr[i]});
    (function (i) {
        var tempSplit = sourceDataStr[i].split("_");
        var qu="db." + tempSplit[0] + ".distinct('_id',{'isUse':'1'})";
        if(tempSplit[0] == "TaskOrganization" || tempSplit[0] == "SystemProfessional"){
            qu="db." + tempSplit[0] + ".distinct('_id',{'isPlan':'1'})";
        }
        $.ajax({
            type: 'POST',
            url: "/home/GetSingleTableJson",
            data: { tbName: tempSplit[0], qu: qu, of: "order" },
            success: function (rs) {
                var tempObj = [];
                for (var j = 0; j < rs.length; j++) {
                    tempObj.push({ "id": rs[j][tempSplit[1]], name: rs[j].name });
                }
                sourceData[sourceDataStr[i]] = tempObj;
            }
        });
    })(i);
}
var indicator1 = $('<div class="indicator1"></div>').appendTo('body');
var _isexpLibId = false,
    __globalDomain = typeof globalHostDomain_ != 'undefined' ? globalHostDomain_ : '';
var commApi = {
    "getPlanData": "/Home/PlanTaskList",
    "createTasks": '/Home/QuickCreateTaskJHGL', // 创建任务
    "delTask": '/Home/DeleteTaskJHGL', // 删除任务
    "editFormula": '/Home/FormulaEditJHGL', // 编辑公式
    "delFormula": '/Home/DeleteFormulaJHGL', // 删除公式
    "saveTask": '/Home/SaveTaskInfoJHGL', // 保存任务
    "importExp": '/PlanManage/QuicklyLoadExperience/', // 导入公司经验控件地址
    "iExpLoad": '/Home/NewTaskList', // 获取对应公司经验的任务结构
    "iExpSave": '/Home/QuickyCreatePlanJHGL', // 导入到计划
    "exportExp": '/PlanManage/CreateExperience/', // 导出为公司经验
    "exphasexist": '/Home/HasExistExpLibObj', // 判断导出计划的名称是否重名
    "saveAsExp": '/Home/SaveAsExpLibJHGL/', // 保存为经验
    "projlinkData": '/home/GetTaskListByNodeTypeId', //获取二级项目中一级开发项目下的联动节点
    "doexem": '/Projects/ProjArranged/SaveExemptTask', // 豁免接口
    "saveTaskRelation": '/Home/QuickSaveTaskRelation', // 前置任务保存
    "saveSubWay": '/Home/SaveSubWayPointTask', // 保存地铁图关联
    "moveTask": '/Home/MovePostInfo', // 移动任务
    "setCIList": '/Home/SavePostInfo', // 设置配置清单
    //2012-1-14地址修改projtaskdetail to ProjTaskInfo
    "taskUrl": '/PlanManage/ProjTaskInfo/', // 任务详情链接
    "getLibInfo": '/Home/GetLibInfo/', // 任务详情链接
    "batchFzr": '/Home/BatchSetTaskOwnerJHGL/', // 批量设置负责人
    "batchVal": '/Home/BatchSetTaskInfo', //批量设置值
    'imgUrl': __globalDomain + '/Content/images/icon/', // 任务状态图标目录
    'saveBgColor': '/Home/ChangeDateBgColorJHGL/', // 保存日期单元格底色
    'taskStatImg': { '-1': 'ico_orange.png', '2': 'ico_grey.png', '3': 'ico_red.png', '4': 'ico_blue.png', '5': 'ico_orange1.png' }, // 任务状态图标
    "tpl": ['<tr id="tr{taskId}" taskType="{taskTypeId}" cp="1">',
		'<td field="torder" class="datagrid-td-rownumber"><div class="datagrid-cell-rownumber">{rowindex}</div></td>',
		'<td field="name" class="{cls}" width="234">{hasApproval}<div style="padding-left:{padleft}px;padding-right:5px;float:left"><img style="{icon}" id="img{taskId}" src="' + __globalDomain + '/Content/images/DesignManage/ico14.jpg"></div><div style="float:left;width:{nwidth}px">{name}</div></td>',
        '<td field="levelId" style="text-align:center">{levelName}</td>',
        '<td field="period" style="text-align:center">{period}</td>',
        '<td field="startDate"{clrs} class="dotorange p-j-datepicker" maxlength="10">{startDate}</td>',
		'<td field="endDate"{clre}  class="dotorange p-j-datepicker" maxlength="10">{endDate}</td>',
		'<td field="ownerName" style="text-align:center">{ownerName}</td>',
        '<td field="taskTypeId" >{typeName}</td>',
    //        '<td field="hasApproval" style="text-align:center">{SetApproval}</td>',
        '<td field="taskOrgId" >{taskOrgName}</td>',
        '<td field="taskProfId" taskTypeId="{taskTypeId}" >{taskProfName}</td>',
        '<td field="diagramPointId">{diagramName}</td>',
        '<td field="pointName" swid="{strTextPId}" pointId="{strPointId}">{pointName}</td>',
        '<td field="pageId" >{pageName}</td>',
    //		'<td field="status" style="text-align:center" class="norbor">{statusName}</td>',
		'</tr>'],
    "tplv": ['<tr cp="1">', '<td><div class="tb_con">{rowindex}</div></td>', '<td><div class="tb_con"><div style="padding-left:{padleft}px;padding-right:5px;float:left"><img style="{icon}" src="' + __globalDomain + '/Content/images/DesignManage/ico-Expand.gif"></div><div style="float:left">{name}</div></div></td>', '<td><div class="tb_con">{ownerName}</div></td><td><div class="tb_con">{startDate}</div></td><td><div class="tb_con">{endDate}</div></td>', '</tr>']
}, saveTip = $(".savetip");

var gAjaxQueue = $.manageAjax.create('AjaxQueue', { // 针对上面commApi 编号1的
    queue: true, maxRequests: 2, beforeSend: function () { saveTip.show(); }, complete: function () { saveTip.hide(); }
}), gLoadQueue = $.manageAjax.create('loadQueue', {
    queue: true
});

var hoverbg = '#d0e5f5', selbg = '#fcf1a9', copyDate = { planId: 0, taskId: 0, field: '', v: '', f: '' },
    epcl = [__globalDomain + "/Content/images/DesignManage/ico14.jpg", __globalDomain + "/Content/images/DesignManage/ico15.jpg"];

function a2DataGrid(config) {
    this.config = config || {};
    this.grid = this.config.el;
    this.bd = this.grid.find("table:first");
    this.headcol = this.bd.find("thead"); // 表头
    this.headcol = this.headcol.find("tr:last"); // 参考表头
    this.columns = null;
    this.dt = this.bd.find("tbody"); // 数据
    this.focusDiv = this.grid.find(".focusDiv"); // focus proxy
    this.inputDiv = this.grid.find(".inputDiv"); // editor proxy
    this.colorPk = this.focusDiv.find(".curdot");
    this.selRows = {}; // 选中的行
    this.shiftSel = { 's': -1, 'sels': {} };
    this.orders = this.bd.find("tr.datagrid-bd-th").find("th");


    this.init = function () {
        var self = this, focusDiv = this.focusDiv;
        this.resetData_();
        this.dt.unselectable(); this.colIdxs = {};
        this.setRelations = false; this.exempt = false; // 豁免操作否
        this.columns = this.getCloumns(); // 表头配置
        this.projId = this.grid.attr("data-projId"); this.secdPlanId = this.grid.attr("data-secdPlanId");
        this.pageId = this.grid.attr("data-pageId");
        this.hasRight = this.grid.attr("canedit") || '1';
        this.canDel = this.grid.attr("candel") || '1';
        this.hasRight = this.hasRight == '1' ? true : false;
        this.canDel = this.canDel == '1' ? true : false;
        this._userId = this.grid.attr("userId") || -100;

        this.colorPk.click(function () {
            var _tid = self.curCell.tid, curCol = self.colorPk.attr('cfield'), curCr, cx;
            if (curCol.indexOf('start') != -1) {
                cx = 'startDateBg';
            } else {
                cx = 'endDateBg';
            }
            curCr = self.getTaskFieldData(_tid, cx) || '';
            iColorShow(curCr, $(this), function (c) {
                self.saveColor(_tid, cx, c, curCol);
            });
        });
        this.orders.click(function () {
            self.orderBy(this);
        });
        focusDiv.mousedown(function (ev) {
            var tag = self.curCell.td, _idx = $(tag).index();
            if (self.config.keynav) self.config.keynav.setxy(_idx, tag.parentNode.rowIndex - 1, self.dt, self);
            if (_idx == 1 && (!self.isEdit || !self.setRelations || !self.exempt)) $(tag).trigger('draggable');
            ev.preventDefault();
        }).unselectable().dblclick(function () {
            if ($(self.curCell.td).parent('[tasktype=1]').length && $(self.curCell.td).attr('field') != 'name' && $(self.curCell.td).attr('field') != 'pageId' && $(self.curCell.td).attr('field') !== 'taskTypeId') {
                return false;
            }
            else if ($(self.curCell.td).attr('field') == 'factEdDate') {
                return false;
            }
            if (!self.hasRight) {
                $.tmsg("m_jfw", "暂无编辑权限！", { infotype: 2 });
                return false;
            }
            var cell = self.curCell, td = cell.td, tid = cell.tid, ownerUserId = self.getTaskFieldData(tid, 'ownerUserId');
            if (cell.td.getAttribute("field") == 'diagramPointId') {
                $.YH.box({
                    target: '/PlanManage/ContextDiagramSelector?taskId=' + tid + "&r=" + Math.random(),
                    title: "设置与产品决策流程图关联",
                    width: 400,
                    ok: function () {
                        var obj = $(this).find("input[type=checkbox]:checked").first();
                        $.ajax({
                            url: "/Home/SavePostInfo",
                            type: 'post',
                            data: {
                                tbName: "DesignPlanTask",
                                queryStr: "db.DesignPlanTask.distinct('_id',{'taskId':'" + tid + "'})",
                                dataStr: "diagramPointId=" + $(obj).val()
                            },
                            dataType: 'json',
                            error: function () {
                                $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
                            },
                            success: function (data) {
                                if (data.Success == false) {
                                    $.tmsg("m_jfw", data.Message, { infotype: 2 });
                                }
                                else {
                                    $.tmsg("m_jfw", "保存成功！", { infotype: 1 });
                                    $(td).text($(obj).attr("contextName"));
                                    $(".focusDiv").css("height", $(td).height() + 10);
                                }
                            }
                        });
                    }
                });
            } else {
                if (!self.hasRight) {
                    //if (ownerUserId != self._userId) {
                    return false;
                    //}
                }
                self.initEditor();
            }
        }).bind("contextmenu", function (e) {
            var parameters = window.location.search;
            var cell = self.curCell, tid = cell.tid, ownerUserId = self.getTaskFieldData(tid, 'ownerUserId');
            var taskData = self.getTaskData(tid);
            var statusName = taskData.statusName;
            if (!self.hasRight) {
                if (ownerUserId != self._userId) {
                    $.tmsg("m_jfw", "暂无编辑权限！", { infotype: 2 });
                    return false;
                }
            }
            if (self.setRelations || self.exempt) return false;
            if (expLibId == 0) {
                if (parameters.indexOf("isEdit=1") == -1) return false;
            }
            self.menu(e); var _menu = $("#wkmenu");
            return false;
        });
        this.grid.find(".createTask").click(function () {
            self.createTask(false, 0);
        });
        this.grid.find(".imexp").click(function () {
            self.importExp();
        });
        this.grid.find(".exexp").click(function () {
            self.exportExp();
        });
        this.grid.find(".lchm").click(function () {
            self.pexe();
        });
        this.grid.find(".expall").click(function () { // 全部展开
            var _rows = self.dt[0].rows, _tr, i = 0;
            for (; _tr = _rows[i]; ++i) {
                _tr = $(_tr);
                _tr.show();
                if (_tr.attr("cp") == "0") {
                    _tr.attr("cp", "1");
                    _tr.find("img:first").attr("src", epcl[0]);
                }
            }
            self.focusDiv.hide();
        });
        this.grid.find("a.colall").click(function () { // 全部折叠
            var _rows = self.dt[0].rows, _tr, i = 0, _id;
            for (; _tr = _rows[i]; ++i) {
                _id = _tr.id.replace('tr', '');
                _tr = $(_tr);
                if (self.stof[_id] == 0) {
                    if (_tr.attr("cp") == "1") {
                        _tr.attr("cp", "0");
                        _tr.find("img:first").attr("src", epcl[1]);
                    }
                } else {
                    _tr.hide();
                }
            }
            self.focusDiv.hide();
        });
        $(document).keydown(function (e) { // copyDate = {planId:0, taskId:0, field:'', v:'', f:''}
            if (!self.hasRight) return;
            var keyCode = e.keyCode || e.which;
            if (e.ctrlKey) {
                var ccell = self.curCell, td, _tid, field, _v, copyVal;
                if (!ccell || !ccell.td || ccell.td.tagName.toLowerCase() != 'td') return;
                td = ccell.td; _tid = ccell.tid;
                field = td.getAttribute("field");
                if (field === 'name' || field === 'decisionName' || field === 'pointName' || field === "") return;
                if (keyCode == 67) { // copy
                    //                    if (field === 'startDate' || field === 'endDate') {
                    //                        copyDate.planId = self.secdPlanId;
                    //                        copyDate.taskId = _tid;
                    //                        copyDate.field = field;
                    //                        _v = self.getTaskFieldData(_tid, field);
                    //                        copyDate.v = _v;
                    //                        var _tp = field.indexOf('start') != -1 ? "S" : "E", _f = self.formula[_tp + _tid] || '';
                    //                        copyDate.f = _f != '' ? _f : '';
                    //                    } else {
                    var colIndex = ccell.colindex, rowIndex = ccell.rowindex, _curTid = ccell.tid;
                    var _curTd = $('#tr' + _curTid).children(':eq(' + colIndex + ')');
                    var _curTable = $('#tr' + _curTid).closest('table');
                    if (_curTable.find('.copyActive').length !== $('#tr' + _curTid).find('.copyActive').length) {
                        _curTable.find('.copyActive').removeClass('copyActive');
                        _curTd.addClass("copyActive");
                    } else {
                        _curTd.addClass("copyActive");
                    }
                    //                    }
                } else if (keyCode == 86) { // paste
                    //                    if (field === 'startDate' || field === 'endDate') {
                    //                        if (copyDate.planId == 0 || copyDate.taskId == 0 || copyDate.field == '') return;
                    //                        self.copyDate_();
                    //                    } else {
                    self.batchVal();
                    //                    }
                }
            } else if (keyCode === 27) { //ESC 
                var ccell = self.curCell, td, _table;
                td = ccell.td;
                var copyActive = $(td).closest('table').find('.copyActive');
                if (copyActive.length > 0) {
                    copyActive.removeClass('copyActive');
                }
            }
        });
    }
    this.showColorpk = function () {
        var cell = this.curCell, tid = cell.tid, ownerUserId = this.getTaskFieldData(tid, 'ownerUserId');
        if (!this.hasRight) {
            if (ownerUserId != this._userId) {
                return false;
            }
        }
        var _idx = $(this.curCell.td).index(), cfield = this.columns[_idx].field, isshow;
        if (cfield === 'startDate' || cfield === 'endDate') {
            this.colorPk.show().attr('cfield', cfield);
            isshow = isColorShow();
            if (isshow) iColorHide();
        } else {
            this.colorPk.hide(); iColorHide();
        }
    };
    this.getCloumns = function () { // 获取表头的属性配置
        var tr = this.headcol, _cols = [], self = this;
        tr.find("th").each(function (i) {
            var td = $(this);
            var col = {
                title: td.text(),
                align: td.attr("align") || "left"
            };
            if (td.attr("field")) {
                col.field = td.attr("field");
                self.colIdxs[col.field] = i;
            }
            if (td.attr("sourceData")) {
                col.sourceData = td.attr("sourceData");
                self.colIdxs[col.sourceData] = i;
            }
            if (td.attr("ccode")) {
                col.ccode = td.attr("ccode");
            }
            if (td.attr("formatter")) {
                col.formatter = eval(td.attr("formatter"));
            }
            if (td.attr("editor")) {
                var s = $.trim(td.attr("editor"));
                if (s.substr(0, 1) == "{") {
                    col.editor = eval("(" + s + ")");
                } else {
                    col.editor = s;
                }
            }
            if (td.attr("rowspan")) {
                col.rowspan = parseInt(td.attr("rowspan"));
            }
            if (td.attr("colspan")) {
                col.colspan = parseInt(td.attr("colspan"));
            }
            if (td.attr("width")) {
                col.width = parseInt(td.attr("width"));
            }
            if (td.attr("hidden")) {
                col.hidden = td.attr("hidden") == "true";
            }
            _cols.push(col);
        });
        return _cols;
    }
    this.init();
    this.loadData();
}
a2DataGrid.prototype.orderBy = function (obj) {
    var self = this;
    var field = $(obj).attr("field");
    self.resetData_();
    self.loadData(field);
}
a2DataGrid.prototype.copyDate_ = function () { // 日期粘帖
    var ccell = this.curCell, td, _tid, field, _v, self = this;
    if (!ccell || !ccell.td || ccell.td.tagName.toLowerCase() != 'td') return;
    td = ccell.td; _tid = ccell.tid;
    field = td.getAttribute("field");
    if ((field != 'startDate' && field != 'endDate') || (_tid == copyDate.taskId && copyDate.field == field)) return;
    var _tp = field.indexOf('start') != -1 ? "S" : "E", _f = copyDate.f,
        flag = false, nowc = _tp + _tid, _cr = [];
    if (_f != '') { // copy formula
        if (_f == self.formula[nowc]) return;
        _cr = _f.match(/[seg]\d{1,}/ig);
        var i = 0, fc;
        for (; fc = _cr[i]; ++i) {
            if (fc == nowc) {
                flag = true;
                break;
            }
        }
    } else if (!this.checkModified(_tid, field, copyDate.v)) {
        return;
    }
    if (flag) {
        $.tmsg("errs", '公式拷贝，不允许自己引用自己。请检查！');
        return false;
    }
    self.updateFieldData(_tid, field, copyDate.v);
    if (_f != '') {
        self.formula[nowc] = _f;
        _cr.length > 0 && self.updatefRef(_cr, nowc);
        self.saveFormula({ formula: nowc, fRef: _cr, expression: _f, modified: true, mask: true });
    } else {
        var _nf = self.formula[nowc];
        if (_nf && _nf != '') self.delFormula({ formula: nowc, opera: 'del' });
        /*self.formula[nowc] = "";
        for(var key in self.fRef){
        self.fRef[key].remove(nowc);
        }*/
        self.saveTask(_tid);
    }
    self.updateView(_tid, field, copyDate.v);
};
a2DataGrid.prototype.resetData_ = function () {
    this.curCell = null;
    this.formula = {}; // key:value 公式左边(单元格):公式右边
    this.fRef = {}; // key:value  对应单元格:与之相关的公式
    this.rows = []; // 任务数据
    /* 父子任务关系链
    stof = {
    tid: pid,
    tid1: pid,
    };
    ftos = {
    pid: [tid, tid1],
    pid1: [tid2],
    };
    */
    this.stof = {}; this.ftos = {};
    this.rowsindex = {}; // 任务数据索引
    this.iRowCount = 0;
    this.isEdit = false; this.editFormula = false;
};


a2DataGrid.prototype.loadData = function (order) { // 加载数据
    var self = this;
    self.grid.mask("数据加载中，请稍候...");
    gLoadQueue.add({
        dataType: 'JSON', cache: false,
        url: commApi.getPlanData, data: { planId: self.secdPlanId, pageId: self.pageId, order: order },
        success: function (rs) {
            var r = rs;
            self.zhhyFilter(); //解绑点击事件
            self.iRowCount = 0;
            self.renderRows(rs, 0, 0, 0);
            if (self.config.afterRender) self.config.afterRender.call(self, YH.$id('tplan' + self.secdPlanId));
            self.grid.unmask();
            self.initScheduleRight();
        }
    });
};
//初始化 工期 与 开始与结束时间计算的工期是否符合 csr = 1：true 0 ：false
a2DataGrid.prototype.initScheduleRight = function () {
    var self = this, i = 0, cur;
    var rows = self.rows;
    for (; i < rows.length; i++) {
        cur = rows[i];
        var e = cur.endDate, s = cur.startDate, p = cur.period;

        if (s !== "" && e !== "" && p !== "") {
            s = new Date(s.replace(/-/g, "/"));
            e = new Date(e.replace(/-/g, "/"));

            var np = parseInt(Math.abs(Date.parse(s) - Date.parse(e)) / 1000 / 60 / 60 / 24, 10) + 1;
            if (np == p) {
                $('#tr' + cur.taskId).attr('csr', '1');
            }
        }
    }
}
//改变工期及日期后 需更新 是否 csr 状态
a2DataGrid.prototype.updateScheduleRight = function (taskId) {
    var self = this;
    var cur = self.getTaskData(taskId);

    var e = cur.endDate, s = cur.startDate, p = cur.period;

    if (s !== "" && e !== "" && p !== "") {
        s = new Date(s.replace(/-/g, "/"));
        e = new Date(e.replace(/-/g, "/"));

        var np = parseInt(Math.abs(Date.parse(s) - Date.parse(e)) / 1000 / 60 / 60 / 24, 10) + 1;
        if (np == p) {
            $('#tr' + cur.taskId).attr('csr', '1');
        } else {
            $('#tr' + cur.taskId).attr('csr', '0');
        }
    }
}
a2DataGrid.prototype.zhhyFilter = function () {
    var self = this, rc = this.headcol;
    /*
    rc.find("th:eq(3)").bind("click", function(){
    sxmenu(self, this, "prev");
    });
    rc.find("th:eq(4)").bind("click", function(){
    sxmenu(self, this, "next");
    });;*/
    rc.find("th:eq(6)").bind("click", function () {
        attmenu(self, this);
    })
    rc.find("th:eq(7)").bind("click", function () {
        nodemenu(self, this);
    })

    rc.find("th:eq(10)").bind("click", function () {
        statusmenu(self, this);
    })
};
a2DataGrid.prototype.calcrs_ = function (dt, lvl) {
    var i = 0, _tmp, hasChild = false, _tid = dt['taskId'],
        _cls = "gray", clrs = '', clre = '', pretasks = '', _url, _exemption = '', padleft;
    var fragmentInfo = window.location.hash.replace("#", "");
    if (dt['name'] != "请填写任务名称") {
        _cls = "";
        if (dt['relConDiagId'] > 0 || dt['isKeyTask'] == 1) {
            //_cls = ' class="';
            if (dt['relConDiagId'] > 0) _cls += 'red';
            if (dt['isKeyTask'] == 1) _cls += ' redstrong';
            //_cls += '"';
        }
        if (dt.hasApproval == true) {
            dt["hasApproval"] = "<img src='/Content/images/client/JHGL/icon/aud_Mark.png' alt='' class='pa' style='top:0; right:0'>";
        }
        else {
            dt["hasApproval"] = "";
        }
        //        console.log(dt["hasApproval"]);
        if (dt['pointName'] != "") {
            //计划模板，也开任务展示链接
            //_url = _isexpLibId ? '<a href="javascript:;">' : '<a href="' + commApi.taskUrl + _tid + '" target="_blank" class="' + _cls + '" style="color:Red">';
            if (typeof (dt["taskTypeId"])=="undefined" || dt["taskTypeId"] == "1") {
                _url = '<a href="javascript:;" class="p-j-taskLink ' + _cls + '" style="color:Red;">';
            }
            else {
                var parameters = window.location.search;
                if (parameters.indexOf("isEdit=1") != -1) {
                    _url = '<a href="' + commApi.taskUrl + _tid + '?fragmentInfo=' + fragmentInfo + '&isEdit=1" target="_blank" class="' + _cls + ' p-j-taskLink" style="color:Red">';
                } else {
                    _url = '<a href="' + commApi.taskUrl + _tid + '?fragmentInfo=' + fragmentInfo + '" target="_blank" class="' + _cls + ' p-j-taskLink" style="color:Red">';
                }
            }
        } else {
            //_url = _isexpLibId ? '<a href="javascript:;">' : '<a href="' + commApi.taskUrl + _tid + '" target="_blank" class="' + _cls + '">';
            if (typeof (dt["taskTypeId"])=="undefined" || dt["taskTypeId"] == "1") {
                _url = '<a href="javascript:;" class="' + _cls + '">';
            }
            else {
                var parameters = window.location.search;
                if (parameters.indexOf("isEdit=1") != -1) {
                    _url = '<a href="' + commApi.taskUrl + _tid + '?fragmentInfo=' + fragmentInfo + '&isEdit=1" target="_blank" class="' + _cls + ' p-j-taskLink">';
                } else {
                    _url = '<a href="' + commApi.taskUrl + _tid + '?fragmentInfo=' + fragmentInfo + '" target="_blank" class="' + _cls + ' p-j-taskLink">';
                }
            }
        }
        if (dt['operateStatus'] == 1) {
            _exemption = '<span>（已豁免）</span>';
        } else if (dt['operateStatus'] == 3) {
            _exemption = '<span>（申请豁免中）</span>';
        }
        if (dt['hasCIList'] == 1) _exemption += '<img src="/content/images/icon/ico0006.png" title="有配置清单" name="cilist" style="vertical-align:middle;" />';
        _url = _url + dt['name'].replace(/ /g, "&nbsp;");
        if (dt['isMilestone'] == 1) {
            _url += "<img calss='stars' text='' src='/Content/images/icon/31.png' alt=''>";
        }
        dt["name"] = _url + '</a>' + _exemption;
    }
    dt['SetApproval'] = dt['hasApproval'] ? '是' : '';
    if (dt['startDateBg'] && dt['startDateBg'].indexOf('#') != -1) clrs = ' style="background-color:' + dt['startDateBg'] + '"';
    if (dt['endDateBg'] && dt['endDateBg'].indexOf('#') != -1) clre = ' style="background-color:' + dt['endDateBg'] + '"';
    /*if (dt['taskRelations'] && dt['taskRelations'].length) {
    for (; _tmp = dt['taskRelations'][i]; ++i) {
    pretasks += _tmp.relTaskIndex + _tmp.relTaskType + ',';
    }
    pretasks = pretasks.replace(/,$/g, '');
    }
    dt["pretasks"] = pretasks;*/
    dt["cls"] = _cls + "pr";
    dt["pointName"] = String.cut(dt["pointName"] || "", 12, '...');
    dt['clrs'] = clrs; dt['clre'] = clre;
    if (dt.status != -1 && dt.status <= 2) {//如果不是已延迟并且也不是进行中或已完成
        dt.status = 2;
        dt["statusName"] = "未开始";
    }
    //    if (dt.status <= 2) {
    //        dt["statusName"] = '';
    //    } else {
    if (typeof (dt["taskTypeId"])=="undefined" || dt["taskTypeId"].indexOf("1") == -1) {
        dt["statusName"] = '<img src="' + commApi.imgUrl + commApi.taskStatImg[dt.status] + '" alt="' + dt["statusName"] + '" title="' + dt["statusName"] + '" />';
    }
    else {
        dt["statusName"] = "";
    }
    //}
    padleft = 16 * lvl;
    dt['padleft'] = padleft;
    dt['nwidth'] = 220 - padleft - 28;
    dt['icon'] = "cursor:pointer";
    if (dt['needSplit'] == 0) dt['spliterName'] = "";
    return dt;
};
a2DataGrid.prototype.renderRows = function (data, texp, pid, lvl, ino) { // 渲染
    var tasks, self = this, cc = [], tpl = commApi.tpl.join(""), _rowindex = 0,
        ctsks = [], m = 0, _ex, setv = [], setone = false, f = null, fn = null;
    if ($.isArray(data)) {
        tasks = data || [];
    } else {
        tasks = data.jsonGroupTaskList;
        //有公式List
        f = data.jsonFormulaList;
        fn = data.jsonNotFormulaList

    }
    if (tasks.length === 0 || tasks[0] === 0) return;
    if (texp || ino > 0) _rowindex = self.rows.length;
    this.rows = this.rows.concat(tasks);
    for (; _ex = tasks[m]; ++m) {
        self.rowsindex[_ex.taskId] = { index: _rowindex }; _rowindex++;
        _ex = $.extend({}, _ex);
        ctsks.push(_ex);
    }
    _rowindex = 0;
    function rd(pid, lv) {
        var dt, i = 0, _tid, _pid, tmp;
        for (; dt = ctsks[i]; ++i) {
            _tid = dt.taskId; _pid = dt.nodePid; setv.push(_tid);
            if (_pid == pid) {
                self.stof[_tid] = _pid;
                self.ftos[_tid] = self.ftos[_tid] || [];
                self.ftos[_pid] = self.ftos[_pid] || [];
                if (self.ftos[_pid].indexOf(_tid) == -1) self.ftos[_pid].push(_tid);
                _rowindex++;
                dt = self.calcrs_(dt, lv);
                dt["rowindex"] = _rowindex;
                cc.push(tpl.compileTpl(dt));
                self.iRowCount++;
                rd(_tid, lv + 1);
            }
        }
    }

    rd(pid, lvl);
    cc = cc.join('');
    if ($(cc).attr('tasktype') == "") {
        cc=cc.replace(/Red/g,'#0066cb'); //修改新增节点的颜色
    }
    if (texp) {
        this.dt.append(cc); this.reOrder(true);
    } else if (ino > 0) {
        var $cc = $(cc);
        $cc.insertAfter($("#tr" + ino)); setone = true;
        this.reOrder(true);
    } else {
        this.dt.html(cc);
    } cc = null;
    if (setone) {
        for (m = 0; _ex = setv[m]; ++m) {
            if (self.ftos[_ex].length == 0) $("#img" + _ex).css("visibility", "hidden");
        }
    } else {
        for (var k in self.ftos) {
            if (self.ftos[k].length == 0) {
                $("#img" + k).css("visibility", "hidden");
            }
        }
    }
    setv = null;
    if (this.curCell) this.focusDiv.hide();
    f && $.each(f, function (i, n) {
        cc = n.split("=");
        if (cc.length) {
            var _nowC = cc[0], _cna = _nowC.charAt(0), _fd = ccodeToField[_cna],
                _tkid = _nowC.replace(/[se]/ig, '');
            self.formula[_nowC] = cc[1];
            $("#tr" + _tkid).find("td[field='" + _fd + "']").removeClass('dotorange').addClass('dotgreen');
            self.updatefRef(cc[1].match(/[seg]\d{1,}/ig), cc[0]);
        }
    });
    this.initEv();
};
a2DataGrid.prototype.createTask = function (frommenu, pos) { // 创建任务 pos: 1--创建任务，2--子任务，0--尾部插入
    var self = this, cell = self.curCell, curTaskId, nodePid = 0, cur = 0; // secdPlanId,projId,isExpLib
    if (frommenu) {
        curTaskId = cell.tid; cur = curTaskId;
        if (pos == 1) {
            nodePid = curTaskId > 0 ? self.stof[curTaskId] : 0;
        } else if (pos == 2) {
            nodePid = curTaskId; curTaskId = 0;
        }
    } else {
        curTaskId = 0;
    }

    this.grid.mask("数据处理中，请稍候...");

    $.ajax({
        type: 'POST',
        url: commApi.createTasks,
        data: { curTaskId: curTaskId, planId: self.secdPlanId, projId: self.projId, isExpLib: 0, taskId: 0, nodePid: nodePid,pageId:self.pageId },
        success: function (rs) {
            if (rs.Success) {
                self.insertRows(rs.htInfo, frommenu, pos, cur);
                self.grid.unmask();
            } else {
                $.tmsg("createtask", rs.Message, { infotype: 2 });
            }
        }
    });
};
a2DataGrid.prototype.setdiagram = function () {//设置决策节点
    var self = this, tid = self.curCell.tid;
    $.YH.box({
        target: '/PlanManage/ContextDiagramSelector?taskId=' + tid + "&r=" + Math.random(),
        title: "设置与产品决策流程图关联",
        width: 400,
        ok: function () {
            var obj = $(this).find("input[type=checkbox]:checked").first();
            $.ajax({
                url: "/Home/SavePostInfo",
                type: 'post',
                data: {
                    tbName: "DesignPlanTask",
                    queryStr: "db.DesignPlanTask.distinct('_id',{'taskId':'" + tid + "'})",
                    dataStr: "diagramPointId=" + $(obj).val()
                },
                dataType: 'json',
                error: function () {
                    $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
                },
                success: function (data) {
                    if (data.Success == false) {
                        $.tmsg("m_jfw", data.Message, { infotype: 2 });
                    }
                    else {
                        $.tmsg("m_jfw", "保存成功！", { infotype: 1 });
                    }
                }
            });
        }
    });
}
a2DataGrid.prototype.setsubmap = function () {
    var self = this, cell = self.curCell, tid = cell.tid;
    var taskData = this.getTaskData(tid);
    var swid = taskData.strTextPId;
    var t = taskData.pointName;
    subWayMap.viewPoint({ planId: self.secdPlanId,
        modal: true, swid: swid, nobutton: true, type: 'set',
        callback: function (swid, t, _ptId) {
            if (swid == "-1") {
            } else {
                self.saveSubWay(tid, swid);
                taskData.strTextPId = swid;
                taskData.strPointId = _ptId;
                $.tmsg("m_jfw", "关联成功！", { infotype: 1 });
            }
        },
        cancel: function () {
        }
    });
}
a2DataGrid.prototype.settasktype = function () {//设置节点类型
    var self = this, tid = self.curCell.tid;
    $.YH.box({
        target: '/PlanManage/TaskTypeSelector?taskId=' + tid + "&r=" + Math.random(),
        title: "设置节点类型",
        width: 300,
        ok: function () {
            var taskTypeIds = ""
            $(this).find("input[type=checkbox]:checked").each(function () {
                taskTypeIds = taskTypeIds == "" ? $(this).val() : (taskTypeIds + ',' + $(this).val());
            });
            if (taskTypeIds.indexOf("1") != -1 && taskTypeIds.split(',').length > 1) {
                var err = "标签和时间性类型具有唯一性，不可和其他节点类型一起选择！";
                $.tmsg("errs", err); return false;
            } else if (taskTypeIds.indexOf("5") != -1 && taskTypeIds.split(',').length > 1) {
                var err = "标签和时间性类型具有唯一性，不可和其他节点类型一起选择！";
                $.tmsg("errs", err); return false;
            }
            $.ajax({
                url: "/Home/SavePostInfo",
                type: 'post',
                data: {
                    tbName: "DesignPlanTask",
                    queryStr: "db.DesignPlanTask.distinct('_id',{'taskId':'" + tid + "'})",
                    dataStr: "taskTypeId=" + taskTypeIds
                },
                dataType: 'json',
                error: function () {
                    $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
                },
                success: function (data) {
                    if (data.Success == false) {
                        $.tmsg("m_jfw", data.Message, { infotype: 2 });
                    }
                    else {
                        $.tmsg("m_jfw", "设置成功！", { infotype: 1 });
                        $("#tr" + tid).attr("taskType", data.htInfo.taskTypeId);
                        $(".focusDiv").find("td[field=name]").attr("taskType", data.htInfo.taskTypeId);
                        self.updateFieldData(tid, "taskTypeId", data.htInfo.taskTypeId);
                        var result = self.getTaskData(tid);
                        if (data.htInfo.taskTypeId == "1") {
                            $("#tr" + tid).find("td[field=name]").find("a").attr("href", "javascript:;").attr("target", "");
                            $("#tr" + tid).find("td[field=status]").html('');
                        }
                        else {
                            var parameters = window.location.search;
                            if (parameters.indexOf("isEdit=1") != -1) {
                                $("#tr" + tid).find("td[field=name]").find("a").attr("href", "/PlanManage/ProjTaskInfo/" + data.htInfo.taskId + "?isEdit=1").attr("target", "_blank").addClass("p-j-taskLink");
                            } else {
                                $("#tr" + tid).find("td[field=name]").find("a").attr("href", "/PlanManage/ProjTaskInfo/" + data.htInfo.taskId).attr("target", "_blank").addClass("p-j-taskLink");
                            }
                            $("#tr" + tid).find("td[field=status]").html('<img src="' + commApi.imgUrl + commApi.taskStatImg[result.status] + '" alt="' + result.statusName + '" title="' + result.statusName + '" />');
                        }
                    }
                }
            });
        }
    });
}
a2DataGrid.prototype.setmilestone = function () {//设置节点类型
    var self = this, tid = self.curCell.tid;
    var result = self.getTaskData(tid);
    var curIsMilestone = result.isMilestone;
    var isMilestone = curIsMilestone == "1" ? "0" : "1";
    $.ajax({
        url: "/Home/SavePostInfo",
        type: 'post',
        data: {
            tbName: "DesignPlanTask",
            queryStr: "db.DesignPlanTask.distinct('_id',{'taskId':'" + tid + "'})",
            dataStr: "isMilestone=" + isMilestone
        },
        dataType: 'json',
        error: function () {
            $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
        },
        success: function (data) {
            if (data.Success == false) {
                $.tmsg("m_jfw", data.Message, { infotype: 2 });
            }
            else {
                $.tmsg("m_jfw", "保存成功", { infotype: 1 });
                if (isMilestone == "1") {
                    $("<img class='ml2' style='margin-top:-3px' text='' src='/Content/images/icon/31.png' alt=''>").appendTo($("#tr" + tid).find("td[field=name]").find("a"));
                    $(".focusDiv").find("td[field=name]").find("a").append("<img class='ml2' style='margin-top:-3px' text='' src='/Content/images/icon/31.png' alt=''>");
                }
                else {
                    $("#tr" + tid).find("td[field=name]").find("a").find("img").remove();
                    $(".focusDiv").find("td[field=name]").find("a").find("img").remove();
                }
                self.updateFieldData(tid, "isMilestone", isMilestone);
            }
        }
    });
}
a2DataGrid.prototype.setTaskStatus = function () {//设置节点类型
    var self = this, tid = self.curCell.tid;
    var result = self.getTaskData(tid);
    var curStatus = result.curStatus;
    var status;
    if (curStatus == "3") {
        status = 4;
    }
    else {
        status = 3;
    }
    var formData = {
        taskId: tid,
        status: status
    };

    $.ajax({
        url: "/Home/ChangeTaskStatusJHGL",
        type: 'post',
        data:formData,
        dataType: 'json',
        error: function () {
            $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
        },
        success: function (data) {
            if (data.Success == false) {
                $.tmsg("m_jfw", data.Message, { infotype: 2 });
            } else {
                $.tmsg("m_jfw", "保存成功！", { infotype: 1 });
                var re = new RegExp("/", "g");
                self.updateFieldData(tid, data.htInfo.factStartDate);
                self.updateFieldData(tid, data.htInfo.factEndDate);
                self.updateFieldData(tid, "curStatus", status);
                self.updateFieldData(tid, "status", data.htInfo.curTaskStatus);
                self.updateFieldData(tid, "statusName", data.htInfo.curStatusName);
                self.updateFieldData(tid, "delayDay", data.htInfo.delayDay);
                $("#tr" + tid).find("td[field=factEdDate]").html(data.htInfo.factEndDate);
                var html = '<img title="' + data.htInfo.curStatusName + '" alt="' + data.htInfo.curStatusName + '" src="/Content/images/icon/' + commApi.taskStatImg[data.htInfo.curTaskStatus] + '">';
                $("#tr" + tid).find("td[field=status]").html(html);
            }
        }
    });
}
a2DataGrid.prototype.pexe = function (frommenu) { // 流程豁免
    if (this.exempt) return false;
    var tpl = '<table cellpadding="3" cellspacing="5"><tr><td style="color:#ff0000;font-size:14px;font-weight:bold;">发起流程豁免操作，请明确说明发起原因。</td></tr><tr><td><textarea style="width:360px;height:150px;"></textarea></td></tr></table>', self = this, pneconfrm = $("#pneconfrm");
    $.YH.box({
        target: $(tpl),
        title: '申请流程豁免',
        width: 400,
        ok: function () {
            var newtxt = $.trim($(this).find("textarea").val());
            if (newtxt == '') {
                $.tmsg('m_exem', '发起豁免的原因必须填写！');
                return false;
            } else {
                var ft = self.grid.find('div.datagrid-ft:last'), of = ft.offset(),
                    h = parseInt(pneconfrm.outerHeight(), 10), w = ft.width(),
                    bt = 0, h = ft.height(), vph = YH.dom.getViewportHeight(), _v = 1, _org = 1;
                self.exempt = true;
                if (!frommenu) {
                    self.unSelRows();
                    self.focusDiv.hide();
                    YH.dom.fixedPosition();
                    YH.dom.elemFixedPos(pneconfrm);
                    if (of.top + h <= vph + $(document).scrollTop()) {
                        bt = vph - of.top - h - 10 + $(document).scrollTop(); _v = 1;
                    }
                    pneconfrm.css({ left: of.left, bottom: bt, width: w + 10 }).slideDown();

                    pneconfrm.find("input:first").unbind("click").bind("click", function () {
                        var selTasks = __doExemp(); // get sel rows
                        if (selTasks.length === 0) {
                            $.tmsg('m_exem', '至少选择一个任务！');
                            return false;
                        }
                        self.grid.mask();
                        __modifyDate(selTasks, newtxt);
                    });
                    pneconfrm.find("input:last").unbind("click").bind("click", function () {
                        self.exempt = false;
                        pneconfrm.slideUp();
                        self.unSelRows(); self.focusDiv.hide();
                    });
                    function __resetPos() {
                        var _of = ft.offset(), sct = $(document).scrollTop();
                        if (_of.top + h <= vph + sct) {
                            bt = vph - _of.top - h - 10 + sct; _v = 1; _org = 1;
                        } else {
                            bt = 0; _org = 2; _v = 2;
                        }
                        return bt;
                    }
                    $(window).bind("scroll", function () {
                        var _b = __resetPos();
                        if (_v == 1 || (_org == 2 && _v == 2)) {
                            pneconfrm.css("bottom", _b);
                            if (_org == 2) _v = 3;
                        }
                    }).bind("resize", function () {
                        vph = YH.dom.getViewportHeight();
                        var _b = __resetPos(), l = ft.offset().left;
                        pneconfrm.css({ "bottom": _b, "left": l });
                    });
                } else {
                    var selTasks = __doExemp(); // get sel rows
                    self.grid.mask();
                    __modifyDate(selTasks, newtxt);
                }
            }
        }
    });
    function __doExemp() {
        var tid, f = [];
        for (tid in self.selRows) {
            f.push(tid);
        }
        return f;
    }
    function __modifyDate(selTasks, newtxt) {
        pneconfrm.hide();
        var _tpl = '<form id="fexemp"><table cellpadding="0" class="gflist" id="seldlist" cellspacing="1"><thead class="thd"><th width="30"></th><th width="300">任务名称</th><th width="80">计划开始</th><th width="80">计划结束</th><th width="60">操作</th></thead><tbody></tbody></table></form>', i = 0, tid, str = '', dt;
        for (; tid = selTasks[i]; ++i) {
            dt = self.getTaskData(tid);
            str += '<tr tid="' + tid + '"><td>' + (i + 1) + '</td><td>' + dt['name'] + '<input type="hidden" name="exemptList[' + i + '].taskId" value="' + tid + '" /></td><td><input style="width:90px" type="text" name="exemptList[' + i + '].curStartData" value="' + dt['startDate'] + '" /></td><td><input type="text" name="exemptList[' + i + '].curEndData" style="width:90px" value="' + dt['endDate'] + '" /></td><td><a href="javascript:;" class="mols">移除</a></td></tr>';
        }
        $.YH.box({
            target: $(_tpl),
            title: '为选中的节点重新设置计划时间', width: 600,
            buttonNames: ['执行豁免申请', '取消'],
            open: function () {
                var $box = $(this);
                var sels = $('#seldlist'), zIndex = parseInt($box.css('zIndex'), 10) || 11050;
                sels.find('tbody').html(str);
                $('<input type="hidden" name="secdPlanId" value="' + self.secdPlanId + '" /><input type="hidden" name="remark" value="' + newtxt + '" />').insertAfter(sels);
                sels.find("a.mols").each(function () {
                    $(this).click(function () {
                        var p = this.parentNode.parentNode, tskid = p.getAttribute("tid"), _tr;
                        _tr = document.getElementById('tr' + tskid);
                        _tr.style.backgroundColor = ''; _tr.setAttribute("isSel", "0");
                        $(p).remove();
                        var inpts = sels.find("input"), k = 0;
                        inpts.each(function (i) {
                            this.name = this.name.replace(/exemptList\[\d{1,}\]/ig, "exemptList[" + k + "]");
                            if (i > 0 && i % 3 === 0) k++;
                        });
                    });
                });
                sels.find("input").each(function () {
                    $(this).css("ime-mode", "disabled");
                    var regexp = /^\d{1,4}([-\/](\d{1,2}([-\/](\d{1,2})?)?)?)?$/;
                    $(this).bind("keypress", function (e) {
                        var keyCode = e.keyCode || e.which;
                        if (keyCode == 32) return false;
                        var pos = DGUntil.getPositionForInput(this), inputstr = String.fromCharCode(keyCode),
                            v = $(this).val(), st = DGUntil.getSelectionText(), pos1 = v.length, _rmsel = '';
                        _rmsel = v.substr(0, pos).replace(st, '');
                        return regexp.test(_rmsel + inputstr + v.substr(pos));
                    }).bind("paste dragenter", function () {
                        return false;
                    }).bind("click", function () {
                        if ($('#wcalendar').length == 0) {
                            _calendar1 = $("<div class='wcalendar' id='wcalendar'></div>");
                            _calendar1.appendTo($('body'));
                        } else {
                            _calendar1 = $("#wcalendar");
                        }
                        var ofs = $(this).offset(), l = ofs.left, t = ofs.top, h = $(this).outerHeight(), ipt = this;
                        var str = $(this).val(), md = { el: this }, _calendar;
                        _calendar1.empty();
                        _calendar = $("<div style=\"margin:0;padding:0;width:200px;height:190px;line-height:20px;\"></div>").appendTo(_calendar1);
                        _calendar.calendar({ onSelect: function (d) {
                            $(ipt).val(DGUntil.dateformatter(d)).focus();
                            _calendar.hide();
                        }, weeks: ["日", "一", "二", "三", "四", "五", "六"], months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"], fit: true
                        });
                        if (DGUntil.isDate(str)) _calendar.calendar('moveTo', new Date(str.replace(/,/g, "/")));
                        _calendar.calendar("resize");
                        _calendar1.css({ left: l, top: t + h + 1, zIndex: zIndex + 50 }).show();
                    });
                });
            },
            ok: function () {
                var _rows = $('#seldlist').find('tbody')[0].rows;
                var $box = $(this);
                if (_rows.length === 0) {
                    $.tmsg('m_exem', '未选择任何任务！操作取消！');
                } else {
                    var s = $('#fexemp').serialize(), arr = {}, _tr, st = '', et = '';
                    for (i = 0; _tr = _rows[i]; ++i) {
                        tid = $(_tr).find('input:first').val();
                        st = $(_tr).find("input:eq(1)").val();
                        et = $(_tr).find("input:last").val();
                        arr[tid] = { 's': st, 'e': et }
                    }
                    if (confirm('确定执行豁免流程吗？\n此操作不可恢复！')) {
                        $box.mask('处理中，请稍候...');
                        $.ajax({
                            type: 'POST', url: commApi.doexem, data: s,
                            complete: function () { $box.unmask(); },
                            success: function (data) {
                                if (data.Success) {
                                    $.tmsg("m_exem", "申请豁免成功！", { infotype: 1 });
                                    for (var _tid in arr) {
                                        $("#tr" + _tid).find("div:last").append('<span>（申请豁免中）</span>');
                                        dt = self.getTaskData(_tid);
                                        dt['operateStatus'] = 3;
                                        //dt['startDate'] = arr[_tid].s; dt['endDate'] = arr[_tid].e;
                                        //self.updateView1(_tid, 'startDate', arr[_tid].s);
                                        //self.updateView1(_tid, 'endDate', arr[_tid].e);
                                    }
                                } else {
                                    $.tmsg("m_exem", data.ErrorMsg, { infotype: 2 });
                                }
                            }
                        });
                    }
                }
            },
            beforeDestroy: function () {
                cancelExemp();
            }
        });
//        box(_tpl, { boxid: 'mdt', title: '为选中的节点重新设置计划时间', width: 600, submit_BtnName: '执行豁免申请',
//            onOpen: function (o) {
//            },
//            submit_cb: function (o) {
//                
//            },
//            onDestroy: function () {
//                cancelExemp();
//            }
//        });
    }
    function cancelExemp() {
        $("#wcalendar").hide();
        self.exempt = false;
        self.unSelRows();
        self.grid.unmask();
    }
};
a2DataGrid.prototype.addRemark = function () { // 添加备注
    var tpl = '<div><textarea placeholder="请填写备注内容" class="m10 " style="width: 92%; height: 150px"></textarea></div>', self = this, tid = self.curCell.tid,
		dt = self.getTaskFieldData(tid, "remark") + "";
    $.YH.box({
        target: $(tpl),
        title: '添加备注',
        width: 400,
        open: function () {
            $(this).find("textarea").val(dt);
        },
        ok: function () {
            var newtxt = $(this).find("textarea").val();
            if (dt != newtxt) {
                self.rows[self.rowsindex[tid].index]['remark'] = newtxt;
                self.saveTask(tid);
            }
        }
    });
};
a2DataGrid.prototype.addDaily = function () { // 添加备忘录
    var tpl = '/PlanManage/TaskAddDailySetting', self = this, tid = self.curCell.tid;
    $.YH.box({
        target: tpl + '?taskId=' + tid,
        title: '任务备忘录',
        width: 550,
        buttonNames: [null, '关闭'],
        ok: function () {
            return false;
        }
    });
};
a2DataGrid.prototype.setForm = function () { // 添加关联表单
    var tpl = '/PlanManage/TaskFormSelect', self = this, tid = self.curCell.tid;
    $.YH.box({
        target: tpl + '?taskId=' + tid,
        title: '选择表单',
        width: 550,
        height: 550,
        ok: function () {
            var taskFormRelStr = "";
            $(this).find("input[type=checkbox]:checked").each(function () {
                var taskFormRel = "taskId=" + $(this).attr("taskId") + "&formId=" + $(this).val() + "&planId=" + $(this).attr("planId") + "&projId=" + $(this).attr("projId");
                var $select = $(this).closest("div").find("select");
                if ($select.length == 1) {
                    taskFormRel = taskFormRel + "&conditionKeyValue=" + $select.first().val();
                }
                taskFormRelStr = taskFormRelStr == "" ? taskFormRel : (taskFormRelStr + "|Y|" + taskFormRel);
            });
            $.ajax({
                url: "/Home/SaveTaskFormRelation",
                type: 'post',
                data: {
                    taskId: tid,
                    tbName: "TaskFormRelation",
                    taskFormRelStr: taskFormRelStr
                },
                dataType: 'json',
                error: function () {
                    $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
                },
                success: function (data) {
                    if (data.Success == false) {
                        $.tmsg("m_jfw", data.Message, { infotype: 2 });
                    }
                    else {
                        $.tmsg("m_jfw", "保存成功！", { infotype: 1 });
                    }
                }
            });
        }
    });
};
a2DataGrid.prototype.setPage = function () { // 添加关联表单
    var tpl = '/PlanManage/TaskPageSelect', self = this, tid = self.curCell.tid;

    $.YH.box({
        target: tpl + '?taskId=' + tid,
        title: '选择页面',
        width: 550,
        ok: function () {
            var formType = $(this).find("input[name=formType]:checked").val();
            var formTypeValue = "";
            $(this).find("#p-j-tableDiv :checkbox[checked]").each(function () {
                formTypeValue = formTypeValue == "" ? $(this).val() : (formTypeValue + ',' + $(this).val());
            });
            $.ajax({
                url: "/Home/SetTaskUserForm",
                type: 'post',
                data: {
                    taskId:tid,
                    formType: formType,
                    formTypeValue:formTypeValue
                },
                dataType: 'json',
                error: function () {
                    $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
                },
                success: function (data) {
                    if (data.Success == false) {
                        $.tmsg("m_jfw", data.Message, { infotype: 2 });
                    }
                    else {
                        $.tmsg("m_jfw", "保存成功！", { infotype: 1 });
                    }
                }
            });
        }
    });
};

a2DataGrid.prototype.addGuidRemark = function () { // 添加任务指导说明
    var tpl = '<div><textarea style="width:95%;height:150px;" placeholder="请填写指引内容"></textarea></div>',
        self = this, tid = self.curCell.tid,
	    dt = self.getTaskFieldData(tid, "guideRemark") + "";
    $.YH.box({
        title: "任务操作指引",
        width: 300,
        target: $(tpl),
        data: {},
        open: function () {
            var $this = $(this);
            $this.find("textarea").val(dt);
            var alDiv = $(this).parent();
            var alHeih = alDiv.height();
            var alTop = $(document).scrollTop() + $(window).height() / 2;
            alDiv.css({ "top": alTop - alHeih / 2 });
        },
        ok: function () {
            var newtxt = $(this).find("textarea").val();
            if (dt != newtxt) {
                self.rows[self.rowsindex[tid].index]['guideRemark'] = newtxt;
                self.saveTask(tid);
            }
        }
    });
};
a2DataGrid.prototype.addGuidFile = function () { // 上传任务指引文件
    var self = this, tid = self.curCell.tid;
    $.YH.box({
        title: "任务指引文件",
        width: 500,
        target: '/PlanManage/TaskFileAsax?taskId=' + tid,
        buttonNames: [null, '关闭']
    });
};

a2DataGrid.prototype.setISI = function () { // 是否首页显示
    var tpl = '<div style="width:360px;height:130px;"><ul style="display:block;margin:8px"></ul></div>', self = this, tid = self.curCell.tid,
		dt = self.getTaskFieldData(tid, "remark") + "", itc = "", itcRemark = "";
    $.YH.box({
        target: $(tpl),
        title: '任务设置显示(打钩表示设置成功)',
        width: 400,
        open: function () {
            getISI($(this));
        },
        ok: function () {
            var lId, lrId = 0, lrIndictor = 0, lrMaterial = 0, lrResult = 0, lrHomeOrdre = "", arr = {};
            var $box = $(this);
            if ($("input[name=isShowIndex]", $box).attr("checked") == "checked") {
                lrId = 1;
            } else {
                lrId = 0;
            }
            if ($("input[name=isIndicator]", $box).attr("checked") == "checked") {
                lrIndictor = 1;
            } else {
                lrIndictor = 0;
            }
            if ($("input[name=isMaterial]", $box).attr("checked") == "checked") {
                lrMaterial = 1;
            } else {
                lrMaterial = 0;
            }
            if ($("input[name=isResult]", $box).attr("checked") == "checked") {
                lrResult = 1;
            } else {
                lrResult = 0;
            }
            arr.isShowIndex = lrId;
            arr.isIndicator = lrIndictor;
            arr.isMaterial = lrMaterial;
            arr.isResult = lrResult;
            arr.indicatorRemark = $("input[name=indicatorRemark]", $box).val();
            arr.materialRemark = $("input[name=materialRemark]", $box).val();
            arr.resultRemark = $("select[name=resultRemark]", $box).val();
            if (lrId == 1) {
                arr.homeOrder = $("input[name=homeOrder]", $box).val();
            }
            else { arr.homeOrder = ""; }
            self.saveTask(tid, arr);
        }
    });

    function getISI(o) {
        $.post(commApi.projlinkData,
        {
            taskId: tid,
            projRank: "",
            isLink: ""
        }, function (data) {
            $(data).each(function (i, n) {
                //isLink 联动节点
                if (data[i].isShowIndex == "1") { itc = "checked=checked"; } else { itc = ""; } //阶段性成果Id
                htmlLi = '<li  style="display:block;padding:4px"><input type="checkbox" ' + itc + ' name="isShowIndex" onclick="showHomeOrder(this);" >设置为首页提醒任务： <strong>' + data[i].name + '</strong></li>';
                //增加首页显示排序
                if (data[i].isShowIndex == "1") {
                    htmlLi += '<li style="display:block;padding:4px">首页显示序号:<input type="text" name="homeOrder" value="'
                    if (typeof data[i].homeOrder != "undefined") { htmlLi += data[i].homeOrder; }
                    htmlLi += '"/></li>';
                }
                else {
                    htmlLi += '<li style="display:none;padding:4px">首页显示序号:<input type="text" name="homeOrder" value=""/></li>';
                }
                if (data[i].isIndicator == "1") { itc = "checked=checked"; } else { itc = ""; }
                if (typeof data[i].indicatorRemark != "undefined") { itcRemark = data[i].indicatorRemark; } else { itcRemark = ""; }
                htmlLi += '<li  style="display:block;padding:4px"><input type="checkbox" ' + itc + ' name="isIndicator">是否经济指标任务:<input type="text" name="indicatorRemark" value="' + itcRemark + '" ></li>';
                if (data[i].isMaterial == "1") { itc = "checked=checked"; } else { itc = ""; }
                if (typeof data[i].materialRemark != "undefined") { itcRemark = data[i].materialRemark; } else { itcRemark = ""; }
                htmlLi += '<li  style="display:block;padding:4px"><input type="checkbox" ' + itc + ' name="isMaterial">是否材料指标任务:<input type="text" name="materialRemark" value="' + itcRemark + '" ></li>';
                if (data[i].isResult == "1") { itc = "checked=checked"; } else { itc = ""; }
                if (typeof data[i].resultRemark != "undefined") { itcRemark = data[i].resultRemark; } else { itcRemark = ""; }
                var tempSelect = '<select name="resultRemark" ><option value="0">请选择</option>'
                $.ajax({ url: commApi.getLibInfo,
                    async: false,
                    type: "POST",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (data1) {
                        $(data1).each(function (q, p) {
                            tempSelect += '<option ';
                            if (data[i].resultRemark == data1[q].libId) {
                                tempSelect += ' selected ';
                            }
                            tempSelect += 'value="'
                            tempSelect += data1[q].libId;
                            tempSelect += '">';
                            tempSelect += data1[q].name;
                            tempSelect += '</option>';
                        });
                    }
                });
                tempSelect += '</select>'
                htmlLi += '<li  style="display:block;padding:4px"><input type="checkbox" ' + itc + ' name="isResult">是否成果案例录入任务:';
                htmlLi += tempSelect;
                htmlLi += '</li>';
            });
            o.find("ul").html(htmlLi);
        });
    }
}

a2DataGrid.prototype.getIDs_ = function (pid) { // 获取要移动、删除的taskID
    var arr = [], self = this;

    function getC_(_pid) {
        var _a = self.ftos[_pid], _n, i = 0;
        arr.push(_pid);
        for (; _n = _a[i]; ++i) {
            getC_(_n);
        }
    }
    getC_(pid);

    return arr;
};
a2DataGrid.prototype.checkChildRed_ = function (pid) { // 判断对应节点的子节点里面是否有与地铁图关联的节点存在
    var ret = false, self = this;

    function getC_(_pid) {
        var _a = self.ftos[_pid], _n, i = 0, red_;
        for (; _n = _a[i]; ++i) {
            red_ = self.getTaskFieldData(_n, 'strPointId');
            if (typeof red_ != 'undefined') {
                ret = true;
                break;
            } else {
                getC_(_n);
            }
        }
    }
    getC_(pid);

    return ret;
}
function __setParentImg(parentid) {
    var myo = $("#tr" + parentid), _img = $("#img" + parentid);
    _img.css("visibility", "visible");
    if (myo.attr("cp") == 0) _img.trigger("click");
    myo.find("td:eq(1)").css("font-weight", "bold");
}
a2DataGrid.prototype.insertRows = function (data, frommenu, pos, curTaskId) { // 创建任务

    var cell = this.curCell, isInsert = false, lkexp = false, lvl = 0,
        ao = curTaskId, pid = 0;
    if (frommenu && cell.tid > 0) {
        isInsert = true;
    }
    if (pos === 0 || curTaskId === 0) {
        lkexp = true;
    } else if (isInsert) {
        var _img = $("#img" + curTaskId), pad = parseInt(_img.parent().css("padding-left"), 10) || 0;
        lvl = pad / 16; pid = this.stof[curTaskId];
        if (pos === 2) { lvl += 1; pid = curTaskId; }
        var ids = this.getIDs_(curTaskId);
        if (ids.length > 1) {
            ao = ids[ids.length - 1];
        }
    }
    this.renderRows([data.taskInfo || 0], lkexp, pid, lvl, ao);
    if (pos === 2 && curTaskId > 0) __setParentImg(curTaskId);
};
a2DataGrid.prototype.delTasks = function () { // 删除任务
    var tid, self = this, ids = "", f = [], relConDiagId = -1, flag = false, exMsg = "";
    for (tid in self.selRows) {
        //        relConDiagId = self.getTaskFieldData(tid, 'strPointId');
        //        if (!relConDiagId || relConDiagId == -1) {
        //            if (!self.checkChildRed_(tid)) {
        ids += tid + ",";
        f.push(tid);
        //            } 
        //            else {
        //                flag = true;
        //            }
        //        } else {
        //            flag = true;
        //        }
    }

    //    if (flag) {
    //        exMsg = "\n注意：里面包含与地铁图关联的节点无法删除！";
    //    }
    //    var result = self.getTaskData(cell.tid);
    if (confirm("确定删除选中的任务吗？")) {
        if (f.length == 0) {
            return;
        }
        this.grid.mask("数据处理中，请稍候...");
        $.ajax({
            type: 'POST',
            url: commApi.delTask, data: { ids: ids },
            success: function (rs) {
                if (rs.Success) {
                    self.deleteRows(f);
                    self.grid.unmask();
                } else {
                    self.grid.unmask();
                    $.tmsg("m_task", rs.Message, { infotype: 2 });
                }
            }
        });
    }
};
a2DataGrid.prototype.deleteRows = function (f) { // 删除选中的任务
    var i = 0, tid, removeIds = [], togids = [], self = this, _tr;
    f.reverse();
    for (; tid = f[i]; ++i) {
        dodel(tid, tid);
    }

    function dodel(taskId, parentId) {
        var _pid, _tid, j = 0, ids = [];
        _pid = self.stof[taskId];
        removeIds.push(taskId);
        if (_pid && parentId != _pid) {
            ids = self.ftos[_pid]; // pid: [tid1, tid2...]
            ids.remove(taskId);
            delete self.stof[taskId];
            if (ids.length === 0) togids.push(_pid);
        }
        ids = self.ftos[taskId];
        ids.reverse();
        for (; _tid = ids[j]; ++j) {
            dodel(_tid, taskId);
        }
    }

    for (i = 0; tid = removeIds[i]; ++i) {
        _tr = $("#tr" + tid);
        if (_tr[0]) _tr.remove();
        self.iRowCount--;
    }
    for (i = 0; tid = togids[i]; ++i) { // 移除折叠
        _tr = $("#tr" + tid);
        if (_tr[0]) $("#img" + tid).css("visibility", "hidden");
    }

    this.focusDiv.hide();
    this.reOrder();
};
a2DataGrid.prototype.reOrder = function (incd) { // reOrder
    var k = 1;
    this.dt.find("div.datagrid-cell-rownumber").each(function (i) {
        if (incd) {
            this.innerHTML = String(k); k++;
        } else if (this.parentNode.parentNode.style.display != 'none') {
            this.innerHTML = String(k); k++;
        }
    });
};
function getbgc(obj) {
    return (function () {
        return rgb2hex(obj.style.backgroundColor);
    })();
}
a2DataGrid.prototype.onmd = function (tag, _idx) {
    this.curCell = {
        td: tag,
        rowindex: tag.parentNode.rowIndex - 1,
        colindex: _idx,
        rowspan: tag.rowSpan, colspan: tag.colSpan,
        tid: tag.parentNode.id.replace("tr", "") // 任务id
    };
    if (this.config.keynav) this.config.keynav.setxy(_idx, tag.parentNode.rowIndex - 2, this.dt, this);
};
function getTd(o) {
    var _tgn = o.tagName.toLowerCase(), tag = o;
    if (_tgn == 'a' || _tgn == 'div' || _tgn == 'img' || _tgn == 'span') {
        tag = tag.parentNode;
        if ((_tgn != 'div') && tag.tagName.toLowerCase() != 'td') tag = tag.parentNode;
    }
    return tag;
}
a2DataGrid.prototype.initEv = function () {
    var self = this, focusDiv = this.focusDiv, _menu = $("#wkmenu");
    this.dt.find("tr").unbind(".wkgrid").bind("mouseenter.wkgrid", function () {
        if (getbgc(this) != selbg) this.style.backgroundColor = hoverbg;
    }).bind("mouseleave.wkgrid", function () {
        if (getbgc(this) == hoverbg) this.style.backgroundColor = '';
    });
    this.dt.unbind(".wkgrid").bind("mousedown.wkgrid", function (ev) {
        var tag = ev.target, _idx, _tgn = tag.tagName.toLowerCase();
        if (_tgn == 'img' && tag.name != "cilist" && tag.parentNode.tagName.toLowerCase() != 'td') {
            self.ec(tag);
        }
        tag = getTd(tag);
        _idx = $(tag).index();
        if (self.isEdit) { // 编辑
            if (self.editFormula && self.columns[_idx].ccode) {
                self.createfpDiv(tag);
                return false;
            }
            var ck = self.checkSave();
            if (!ck) return false;
        }
        self.inputDiv.hide();
        $("#wcalendar").hide();
        self.onmd(tag, _idx);
        ev.preventDefault();
    }).bind("contextmenu.wkgrid", function (e) {
        var parameters = window.location.search;
        if (self.isEdit || self.setRelations || self.exempt) return false;
        var ccell = self.curCell, tag = ccell.td, tid = ccell.tid, $tag, hasSelected, _idx, _tr;
        var taskData = self.getTaskData(tid);
        var statusName = taskData.statusName;
        //项目中isEdit=0时屏蔽右键
        if (expLibId == 0) {
            if (parameters.indexOf("isEdit=1") == -1) return false;
        }

        self.menu(e);
        if (tag.tagName.toLowerCase() == 'td') {
            $tag = $(tag); _tr = tag.parentNode; _idx = $tag.index();
            hasSelected = (getbgc(_tr) == selbg);
            if (!hasSelected) self.unSelRows();
            self.SelRow_(_tr, ccell.tid);
            if (_idx == 0) {
                self.focusDiv.hide();
            } else {
                self.upFocusDiv();
            }
        }
        _menu.find(".menu-appro").removeAttr("disabled");

        return false;
    }).bind("click.wkgrid", function (ev) {
        var ccell = self.curCell, tag = ccell.td, _tgn = tag.tagName.toLowerCase(),
            $tag = $(tag), _idx = $tag.index(), _tr = tag.parentNode, _tid = ccell.tid;
        if (self.isEdit) { // 编辑
            if (self.editFormula && self.columns[_idx].ccode) {
                return false;
            }
            var ck = self.checkSave();
            if (!ck) return false;
        }
        if (tag.tagName.toLowerCase() == 'td') {
            if (ev.ctrlKey || ev.shiftKey || self.setRelations || self.exempt) {
                if (!ev.shiftKey) {
                    if (getbgc(_tr) == selbg) {
                        self.unSelRow_(_tr, _tid);
                    } else {
                        self.shiftSel['s'] = ccell.rowindex;
                        self.SelRow_(_tr, _tid);
                    }
                    self.shiftSel['sels'] = {};
                } else {
                    if (self.shiftSel['s'] === -1) self.shiftSel['s'] = ccell.rowindex;
                    self.shiftSel_(ccell.rowindex);
                }
                if (self.setRelations) taskRelations.setRS(self);
            } else {
                self.unSelRows();
                self.shiftSel['s'] = ccell.rowindex;
                self.SelRow_(_tr, _tid);
            }
        }
        if (_idx == 0) {
            self.focusDiv.hide();
        } else {
            if (!self.setRelations && !self.exempt) self.upFocusDiv();
        }
        if (!self.setRelations || !self.exempt) self.showColorpk();
    }).bind("dblclick.wkgrid", function (ev) {
        var cell = self.curCell, tid, ownerUserId;
        if (!cell) return;
        tid = cell.tid; ownerUserId = self.getTaskFieldData(tid, 'ownerUserId');
        if (!self.hasRight) {
            //if (ownerUserId != self._userId) {
            $.tmsg("m_jfw", "暂无编辑权限！", { infotype: 2 });
            return false;
            //}
        } 
        if (self.isEdit || self.exempt || self.setRelations) return false;
        var tag = $(getTd(ev.target));
        self.initEditor(tag);
    });
    self.initDrag_();
};
a2DataGrid.prototype.shiftSel_ = function (endRowIdx) {
    var s = this.shiftSel['s'], e, t, i, sels = this.shiftSel['sels'],
        tid, _tr, rows = this.dt[0].rows;
    if (s === -1 || !endRowIdx) return;
    e = endRowIdx - 1;
    if (s > e) {
        t = s - 1;
        s = e;
        e = t;
    }
    for (tid in sels) {
        this.unSelRow_(sels[tid], tid);
    }
    this.shiftSel['sels'] = {};
    for (i = s; i <= e; ++i) {
        _tr = rows[i];
        if (getbgc(_tr) != selbg) {
            tid = _tr.id.replace('tr', '');
            this.SelRow_(_tr, tid);
            this.shiftSel['sels'][tid] = _tr;
        }
    }
};
a2DataGrid.prototype.unSelRow_ = function (_tr, tid) {
    _tr.style.backgroundColor = ''; _tr.setAttribute("isSel", "0");
    delete this.selRows[tid];
};
a2DataGrid.prototype.SelRow_ = function (_tr, tid) {
    _tr.style.backgroundColor = selbg; _tr.setAttribute("isSel", "1");
    this.selRows[tid] = _tr;
};
a2DataGrid.prototype.unSelRows = function () { // 取消多行选中
    var tid, _tr;
    for (tid in this.selRows) {
        _tr = this.selRows[tid];
        if (_tr) {
            this.unSelRow_(_tr, tid);
        }
    }
    this.shiftSel = { 's': -1, 'sels': {} };
};
a2DataGrid.prototype.initDrag_ = function () {
    if (!this.hasRight) return;
    var moveid, tomoveid, movetype, self = this, trs = this.dt.find("tr"),
        _accp = "td", _1b, isOver = false, _1c, _top, _obj;
    try {
        trs.find("td:eq(1)").draggable("destroy").droppable("destroy");
    } catch (e) {
        //console.log(e);
    }
    trs.find("td:eq(1)").draggable({
        helper: function (event) {
            var _proxy = $('<div class="dp1"></div>').html($(event.target).text()).appendTo(document.body);
            return _proxy;
        },
        cursor: 'pointer', addClasses: false,
        cursorAt: { top: 0, left: 0 },
        revert: false, distance: 5, scroll: true,
        start: function (e, ui) {
            if (self.isEdit || self.setRelations || self.exempt) return false;
            isOver = false; self.focusDiv.hide();
            _1b = e.pageY;
        },
        drag: function (e, ui) {
            _1b = e.pageY;
            if (isOver && _obj[0]) {
                if (_1b > _top + (_1c - _top) / 2) {
                    if (_1c - _1b < 5) {
                        indicator1.css({ top: _1c - 1 }).show();
                        _obj.find("div:last")[0].style.backgroundColor = '';
                        movetype = "next";
                    } else {
                        _obj.find("div:last")[0].style.backgroundColor = '#009933';
                        movetype = "child";
                        indicator1.hide();
                    }
                } else {
                    if (_1b - _top < 5) {
                        indicator1.css({ top: _top - 1 }).show();
                        _obj.find("div:last")[0].style.backgroundColor = '';
                        movetype = "pre";
                    } else {
                        _obj.find("div:last")[0].style.backgroundColor = '#009933';
                        movetype = "child";
                        indicator1.hide();
                    }
                }
            }
        },
        stop: function () {
        }
    }).droppable({
        accept: _accp, tolerance: 'pointer', addClasses: false,
        over: function (e, ui) {
            _obj = $(this);
            var offs = _obj.offset();
            _top = offs.top;
            _1c = _top + _obj.outerHeight();
            indicator1.css({ left: offs.left, width: _obj.outerWidth() });
            isOver = true;
        },
        out: function (e, ui) {
            isOver = false;
            indicator1.hide();
            $(this).find("div:last")[0].style.backgroundColor = '';
        },
        drop: function (e, ui) {
            var tid = this.parentNode.id.replace("tr", ""), sf = this,
                cell = self.curCell, curId = cell.tid || 0;
            if (curId != tid) {
                if (confirm('确定移动到当前节点吗?')) {
                    self.moveTask_(curId, tid, movetype);
                    _clear();
                }
            }
            function _clear() {
                isOver = false;
                indicator1.hide();
                $(sf).find("div:last")[0].style.backgroundColor = '';
            }
        }
    });
};
a2DataGrid.prototype.showicon_ = function (pid) {
    var _ids = this.getIDs_(pid), myo = $("#tr" + pid), _img = $("#img" + pid);
    if (_ids.length == 1) {
        _img.css("visibility", "hidden");
        myo.find("td:eq(1)").css("font-weight", "normal");
    }
};
a2DataGrid.prototype.isAncestry_ = function (tomoveid, anc) {
    var __pid = parseInt(this.stof[tomoveid], 10);
    if (__pid > 0 && anc != __pid) {
        return this.isAncestry_(String(__pid), anc);
    } else {
        return __pid == anc;
    }
};
a2DataGrid.prototype.reCalcPadding_ = function (parentid, trid) {
    var x = 0;
    if (parentid != 0) {
        x = parseInt($("#tr" + parentid).find("td:eq(1)").find("div:first").css("padding-left"), 10);
    }
    x = x / 16;
    var arr = this.getIDs_(trid), bs = 1, xx, x1, c;
    xx = $("#tr" + trid).find("td:eq(1)").find("div:first");
    x1 = parseInt(xx.css("paddingLeft"), 10);
    x1 = x1 / 16;
    c = x > 0 ? x1 - x - 1 : (parentid == 0 ? x1 : x1 - 1);
    $.each(arr, function (i, n) {
        xx = $("#tr" + n).find("td:eq(1)").find("div:first");
        x1 = parseInt(xx.css("paddingLeft"), 10);
        x1 = x1 / 16;
        xx.css("paddingLeft", 16 * (x1 - c) + 'px');
        var xxx = $("#tr" + n).find("td:eq(1)").find("div:eq(1)");
        var x2 = parseInt(xxx.css("width"), 10);
        x2 = x2 / 16;
        xxx.css("width",16 * (x2 + c) + 'px');
    });
    
};
a2DataGrid.prototype.moveTask_ = function (moveid, tomoveid, type) {
    var self = this, ids = self.getIDs_(moveid),
        _pid = self.stof[moveid],
        parentid = type == "child" ? tomoveid : self.stof[tomoveid],
        _istop = self.isAncestry_(tomoveid, moveid);

    if (type == "child" && parentid == _pid) return false;
    if (_istop) {
        $.tmsg("m_task", "父节点不能移到子节点上！", { infotype: 2 });
        return false;
    }

    $.post(commApi.moveTask, { tbName: 'DesignPlanTask', moveId: moveid, moveToId: tomoveid, type: type }, function (data) {
        if (data.Success) {
            $.tmsg("m_task", "操作成功！", { infotype: 1 });
            if (parentid > 0) {
                __setParentImg(parentid);
            }
            var toids = self.getIDs_(tomoveid), i = 0, toobj;
            toids = $.grep(toids, function (n, i) {
                return ids.indexOf(n) == -1;
            });
            if (type != 'pre') ids = ids.reverse();
            for (; i < ids.length; ++i) {
                if (type == "pre") {
                    $("#tr" + ids[i]).insertBefore($("#tr" + tomoveid));
                } else {
                    toobj = $("#tr" + toids[toids.length - 1]);
                    $("#tr" + ids[i]).insertAfter(toobj);
                }
            }
            self.stof[moveid] = parentid;
            if (self.ftos[parentid].indexOf(moveid) == -1) self.ftos[parentid].push(moveid);
            self.ftos[_pid].remove(moveid);

            self.reCalcPadding_(parentid, moveid);
            self.reOrder();
            self.showicon_(_pid);
        } else {
            $.tmsg("m_task", data.Message, { infotype: 2 });
        }
    }, 'json');
};
a2DataGrid.prototype.ec = function (img) { // 展开折叠
    var _pading = img.parentNode, tr = _pading.parentNode.parentNode, self = this,
        pid = tr.id.replace("tr", ""), cp = tr.getAttribute("cp");

    if (cp == '1') {
        tr.setAttribute("cp", "0"); cp = 0;
        img.setAttribute("src", epcl[1]);
    } else {
        tr.setAttribute("cp", "1"); cp = 1;
        img.setAttribute("src", epcl[0]);
    }
    togec(pid, cp);

    function togec(parentId, _cpflag) {
        var ids, i = 0, tid, _tr, _cp;
        ids = self.ftos[parentId] || []; // pid: [tid1, tid2, tid3]
        for (; tid = ids[i]; ++i) {
            _tr = document.getElementById('tr' + tid);
            _cp = _tr.getAttribute("cp");
            if (_cpflag == 0) { // 折叠
                _tr.style.display = 'none';
                togec(tid, 0);
            } else {
                _tr.style.display = '';
                if (_cp == '1') togec(tid, 1);
            }
        }
    }
    return false;
};
a2DataGrid.prototype.menu = function (e) { // menu
    var self = this, cell = self.curCell, _ci = cell.colindex,
        _menu = $("#wkmenu"), dx = 206;
    _menu.find("div").show(); //每次初始化右键菜单时，都先把选项显示
    //    var nodel = false;
    var tid = cell.tid, ownerUserId = self.getTaskFieldData(tid, 'ownerUserId'), statusName = self.getTaskFieldData(tid, 'statusName');

    //    if ($.trim($("tr[id=tr" + tid + "]").find("td:eq(6)").html()) != "四级计划" && $.trim($("tr[id=tr" + tid + "]").find("td:eq(6)").html()) != "") {
    //        nodel = true;
    //    }
    if (!self.hasRight) {
        if (ownerUserId != self._userId) {
            $.tmsg("m_jfw", "暂无编辑权限！", { infotype: 2 });
            return false;
        }
    }

    var result = self.getTaskData(cell.tid);

    //节点类型判断
    var taskType = typeof (result.taskTypeId) == "undefined" ? "" : result.taskTypeId;
    if (taskType.indexOf("5") != -1 || taskType.indexOf("1") != -1) {
        _menu.find("div.menu-appro").hide();
    }
    else {
        _menu.find("div.menu-appro").show();
    }
    if (taskType.indexOf("4") != -1) {
        _menu.find("div.menu-jfw").show();
    }
    else {
        _menu.find("div.menu-jfw").hide();
    }
    if (taskType.indexOf("2") != -1) {
        _menu.find("div.menu-formNested").show();
    }
    else {
        _menu.find("div.menu-formNested").hide();
    }
    if (taskType.indexOf("3") != -1) {
        _menu.find("div.menu-pageNested").show();
    }
    else {
        _menu.find("div.menu-pageNested").hide();
    }
    //设为里程碑
    var curIsMilestone = typeof (result.isMilestone) == "undefined" ? "" : result.isMilestone;
    if (curIsMilestone == "1") {
        _menu.find("div.menu-delmilestone").show();
        _menu.find("div.menu-milestone").hide();
    }
    else {
        _menu.find("div.menu-delmilestone").hide();
        _menu.find("div.menu-milestone").show();
    }
    var curStatus = typeof (result.curStatus) == "undefined" ? "" : result.curStatus;
    //状态
    if (taskType != "") {

        var ownerUserId = typeof (result.ownerUserId) == "undefined" ? "" : result.ownerUserId.toString();
        if (ownerUserId.indexOf(userId) != -1) {
            if (curStatus == "3") {
                _menu.find("div.menu-startTask").hide();
                _menu.find("div.menu-endTask").show();
                _menu.find("div.menu-restartTask").hide();
            }
            else if (curStatus == "4") {
                _menu.find("div.menu-startTask").hide();
                _menu.find("div.menu-endTask").hide();
                _menu.find("div.menu-restartTask").show();
            }
            else {
                _menu.find("div.menu-startTask").show();
                _menu.find("div.menu-endTask").hide();
                _menu.find("div.menu-restartTask").hide();
            }
        }
        else {
            _menu.find("div.menu-startTask").hide();
            _menu.find("div.menu-endTask").hide();
            _menu.find("div.menu-restartTask").hide();
        }
    }
    else {
        _menu.find("div.menu-startTask").hide();
        _menu.find("div.menu-endTask").hide();
        _menu.find("div.menu-restartTask").hide();
    }
    //    if (curStatus <= 2) {
    //        _menu.find("div.menu-delTask").show();
    //    }
    //    else {
    //        _menu.find("div.menu-delTask").hide();
    //    }

    _menu.menu({ left: e.pageX, top: e.pageY,
        onClick: function (_nd) {
        },
        onShow: function () {

        }
    });
    _menu.find(".menu-insertTask").unbind("click").bind("click", function () {
        if (self.canDel || self.hasRight) {
            self.createTask.call(self, true, 1);
        } else {
            $.tmsg("power", "你没有权限进行此操作");
        }
        _menu.hide();
    });
    _menu.find(".menu-insertsubTask").unbind("click").bind("click", function () {
        if (self.canDel || self.hasRight) {
            self.createTask.call(self, true, 2);
        } else {
            $.tmsg("power", "你没有权限进行此操作");
        }
        _menu.hide();
    });
    _menu.find(".menu-jfw").unbind("click").bind("click", function () {
        var _ids = '';
        for (var tid in self.selRows) {
            _ids = tid;
            break;
        }
        if (_ids === '') return false;
        if (typeof PatternEdit != 'undefined' && $.isFunction(PatternEdit)) {
            var tid, ids = "", flag = false;
            var taskCount = 1;
            for (tid in self.selRows) {
                ids += tid + ",";
                taskCount++;
            }
            if (taskCount > 2) {
                flag = true;
                PatternEdit(_ids, self.projId, flag, ids);
            } else {
                flag = false;
                PatternEdit(_ids, self.projId);
            }
        }
        _menu.hide();
    });
    //调用方法
    _menu.find(".menu-fzr").unbind("click").bind("click", function (ev) {
        self.batchFuze.call(self, ev); _menu.hide();
    });
    _menu.find(".menu-CIList").unbind("click").bind("click", function (ev) {
        self.setCIList.call(self, cell.tid, 1); _menu.hide();
    });
    _menu.find(".menu-noCIList").unbind("click").bind("click", function (ev) {
        self.setCIList.call(self, cell.tid, 0); _menu.hide();
    });
    _menu.find('.menu-batchVal').unbind("click").bind("click", function (ev) {
        self.batchVal.call(self, ev); _menu.hide();
    });
    _menu.find(".menu-delTask").unbind("click").bind("click", function () {
        if (self.canDel || self.hasRight) {
            self.delTasks.call(self);
        } else {
            $.tmsg("power", "你没有权限进行此操作");
        }
        _menu.hide();
    });
    _menu.find(".menu-remark").unbind("click").bind("click", function () {
        self.addRemark.call(self); _menu.hide();
    });
    _menu.find(".menu-daily").unbind("click").bind("click", function () {
        self.addDaily.call(self); _menu.hide();
    });
    _menu.find(".menu-guidRemark").unbind("click").bind("click", function () {
        self.addGuidRemark.call(self); _menu.hide();
    });
    _menu.find(".menu-guidFile").unbind("click").bind("click", function () {
        self.addGuidFile.call(self); _menu.hide();
    });
    _menu.find(".menu-appro").unbind("click").bind("click", function () {
        apprSet.init.call(self, cell.tid); _menu.hide();
    });
    _menu.find(".menu-formNested").unbind("click").bind("click", function () {
        self.setForm.call(self, cell.tid); _menu.hide();
    })
    _menu.find(".menu-pageNested").unbind("click").bind("click", function () {
        self.setPage.call(self, cell.tid); _menu.hide();
    })
    _menu.find(".menu-lchm").unbind("click").bind("click", function () {
        self.pexe.call(self, true); _menu.hide();
    });

    _menu.find(".menu-ISI").unbind("click").bind("click", function () {
        self.setISI.call(self); _menu.hide();
    });

    //    if (nodel == true) {
    //        _menu.find(".menu-delTask").hide();

    //    } else {
    //        _menu.find(".menu-delTask").show();
    //    }

    _menu.find(".menu-preTask").unbind("click").bind("click", function () {//前置节点设置
        self.preTask.call(self); _menu.hide();
    });

    _menu.find(".menu-diagram").unbind("click").bind("click", function () {//决策节点设置
        self.setdiagram.call(self); _menu.hide();
    });

    _menu.find(".menu-submap").unbind("click").bind("click", function () {//地铁节点设置
        self.setsubmap.call(self); _menu.hide();
    });

    _menu.find(".menu-tasktype").unbind("click").bind("click", function () {//节点类型设置
        self.settasktype.call(self); _menu.hide();
    });

    _menu.find(".menu-milestone").unbind("click").bind("click", function () {//里程碑设置
        self.setmilestone.call(self); _menu.hide();
    });
    _menu.find(".menu-delmilestone").unbind("click").bind("click", function () {//里程碑设置
        self.setmilestone.call(self); _menu.hide();
    });
    _menu.find(".menu-startTask").unbind("click").bind("click", function () {//状态
        self.setTaskStatus.call(self); _menu.hide();
    });
    _menu.find(".menu-endTask").unbind("click").bind("click", function () {//状态
        self.setTaskStatus.call(self); _menu.hide();
    });
    _menu.find(".menu-restartTask").unbind("click").bind("click", function () {//状态
        self.setTaskStatus.call(self); _menu.hide();
    });

    if (_isexpLibId) dx = 206;
    if ($(document).scrollTop() + YH.dom.getViewportHeight() < YH.dom.getMouseY(e) + 230) {
        _menu.css("top", $(document).scrollTop() + YH.dom.getViewportHeight() - dx);
    }

    //已完成的任务节点，屏蔽事件
    if (statusName == "已完成" || statusName == "超期完成") {
        //        _menu.find("div.menu-delTask").hide();
        _menu.find("div.menu-jfw").hide();
        _menu.find("div.menu-preTask").hide();
        _menu.find("div.menu-appro").hide();
        _menu.find("div.menu-remark").hide();
        _menu.find("div.menu-daily").hide();
        _menu.find("div.menu-diagram").hide();
        _menu.find("div.menu-submap").hide();
        _menu.find("div.menu-tasktype").hide();
        _menu.find("div.menu-delmilestone").hide();
        _menu.find("div.menu-milestone").hide();
    }
    //计划未启动，则屏蔽开始按钮
    if (isPlanStart != null && isPlanStart == 0) {
        _menu.find("div.menu-startTask").hide();
    }
    if (e.stopPropagation) {
        e.preventDefault();
    } else if (window.event) {//IE
        window.event.cancelBubble = true;
    }
};
a2DataGrid.prototype.batchVal = function () { //批量设置值
    var ids = [], tid, self = this, rows = this.dt[0].rows;
    var cell = this.curCell;    //当前选中的单元格
    for (tid in self.selRows) { //获取选中行序号copyActive
        ids.push(tid);
    }
    if (ids.length == 0) return false;
    var _curTable = $('#tr' + ids[0]).closest('table');
    var copyTds = _curTable.find('.copyActive'); //数据源
    if (copyTds.length === 0) {
        $.tmsg("m_jfw", "请选中要复制的单元格！", { infotype: 2 });
        return false;
    }
    var fields, orignTaskId, fieldAry = [];
    orignTaskId = copyTds.first().closest('tr').prop('id').replace("tr", "");
    var tasktype = copyTds.first().closest('tr').attr("tasktype");
    copyTds.each(function () {
        var field = $(this).attr('field');
        fieldAry[fieldAry.length] = field;
    });
    fields = fieldAry.join(",");
    $.ajax({
        type: 'POST',
        url: commApi.batchVal,
        data: { taskIds: ids.join(','), fields: fields, orignTaskId: orignTaskId },
        success: function (data) {
            if (data.Success) {
                $.tmsg("m_user", "设置成功！", { infotype: 1 });
                copyTds.each(function () {
                    var $this = $(this), curField = $this.attr('field'), curVal = $this.html();
                    var i = 0, _id;
                    for (; _id = ids[i]; ++i) {
                        $('#tr' + _id).find('[field=' + curField + ']').html(curVal);
                        var result = self.getTaskData(orignTaskId);
                        self.updateFieldData(_id, curField, result[curField]);
                        //                        this.updateView(_id, curField, result[curField]);
                        if (fields.indexOf("taskTypeId") != -1) {
                            $('#tr' + _id).attr("tasktype", tasktype);
                        }
                    }
                });
            } else {
                $.tmsg("m_user", data.Message, { infotype: 2 });
            }
        }
    });
};
a2DataGrid.prototype.batchFuze = function (ev) { // 批量设置负责人
    var x = YH.dom.getMouseX(ev), y = YH.dom.getMouseY(ev),
        ids = [], rows = this.dt[0].rows, self = this, tid;
    for (tid in self.selRows) { //获取选中行序号
        ids.push(tid);
    }
    if (ids.length === 0) return false;

    //this.grid.mask("处理中，请稍候...");
    getTaskPeopleListForOneClick(x, y, this.projId, 2, function (_userId, _profId, _userName, userArr) {
        $.ajax({
            type: 'POST', url: commApi.batchFzr, data: { taskIds: ids.join(','), userId: _userId, profId: _profId },
            success: function (data) {
                if (data.Success) {
                    $.tmsg("m_user", "设置成功！", { infotype: 1 });
                    var i = 0, _id, _td;
                    for (; _id = ids[i]; ++i) {
                        self.updateFieldData(_id, 'ownerName', _userName);
                        self.updateFieldData(_id, 'ownerUserId', _userId);
                        self.updateFieldData(_id, 'ownerProfId', _profId);
                        self.updateFieldData(_id, "taskOwners", userArr); //[{userId:XX,userName:YY},{},...]
                        //self.updateView(_id, 'ownerName', _userName);
                        _td = document.getElementById('tr' + _id);
                        _td = _td.childNodes;
                        if (_td[6]) $(_td[6]).html(_userName);
                    }
                } else {
                    $.tmsg("m_user", data.Message, { infotype: 2 });
                }
                //self.grid.unmask();
            }
        });

    });
};
a2DataGrid.prototype.getCell = function (row, col) { // 根据行列获取cell dom
    if (row < 0 || row > this.iRowCount - 1) return false;
    var r = this.dt.find("tr").eq(row);
    return (r.find("td").get(col));
};
a2DataGrid.prototype.createfpDiv = function (td, nofill) {
    if (!td || $(td).attr('field') == "factEdDate") return;
    var self = this, n = this.grid.find(".fpd"), n1 = this.grid.find(".fpp"), inputfield = this.inputDiv.find("input"), v, nof = false || nofill, _col = this.columns[$(td).index()];
    if (!n[0] || !n1[0]) {
        n = $("<div/>").addClass("fpDiv fpd").appendTo(self.grid);
        n1 = $("<div/>").addClass("fpDiv fpp").appendTo(self.grid);
    }
    if (inputfield[0]) {
        if (_col.ccode == 'G' && !/g|([+-]$)/ig.test(inputfield.val())) return false;
        var ofset = $(td).position(), l = ofset.left, t = ofset.top, w = $(td).outerWidth(), h = $(td).outerHeight(), shown = _col.ccode == 'G' ? n1 : n;
        shown.css({ left: l - 1, top: t - 1, width: w, height: h, display: 'block' });
        if (nof) return;
        v = inputfield.val(); var np = _col.ccode + (td.parentNode.rowIndex - 1);
        if (_col.ccode != 'G') {
            v = v == '=' ? (v + np) : v.replace(/[se]\d{1,}|[se]/ig, np);
        } else {
            if (/g/i.test(v)) {
                v = v.replace(/[g]\d{1,}|g/ig, np);
            } else if (/[+-]$/i.test(v)) {
                v = v + np;
            }
        }
        inputfield.val(v).focus();
        window.setTimeout(function () {
            DGUntil.setCursorPosition(inputfield[0], v.length);
        }, 300);
    }
};
a2DataGrid.prototype.findfpDiv = function (er) {
    this.hidefpDiv(er);
    if (!/[seg]\d{1,}/i.test(er)) return false;
    var arr = DGUntil.refRowindex(er), rowindex = arr[2], e = arr[1].toUpperCase(), sf = this, colindex, td;
    $.each(sf.columns, function (i, n) {
        if (n.ccode && n.ccode == e) {
            colindex = i;
            return false;
        }
    });
    rowindex = parseInt(rowindex, 10) - 1;
    td = this.getCell(rowindex, colindex);
    return td;
};
a2DataGrid.prototype.hidefpDiv = function (dg) {
    dg = dg.toLowerCase(); var cls = 'fpd';
    if (dg == 'all') {
        cls = 'fpDiv';
    } else if (dg.indexOf('g') != -1) {
        cls = 'fpp';
    }
    this.grid.find("." + cls).length && this.grid.find("." + cls).hide();
};
a2DataGrid.prototype.initEditor = function (tag) {
    var ctd = tag || $(this.curCell.td), of = ctd.position(), l = of.left - 2, t = of.top - 2, w = ctd.outerWidth(), h = ctd.outerHeight();
    this.focusDiv.hide();
    this.showEditor(l, t, w, h);
};
function lvlFormatter(value) {
    var str = "", i = 0, isck = false;
    for (; i < zhhyLevel.length; i++) {
        if (value == zhhyLevel[i].lvlid) isck = true;
        str += '<option value="' + zhhyLevel[i].lvlid + '"' + (isck ? " selected" : "") + '>' + zhhyLevel[i].lvlname + '</option>';
        isck = false;
    }
    return str;
}

function nodeFormatter(value) {
    var str = "", i = 0, isck = false;
    for (; i < zhhynode.length; i++) {
        if (value == zhhynode[i].nodeid) isck = true;
        str += '<option value="' + zhhynode[i].nodeid + '"' + (isck ? " selected" : "") + '>' + zhhynode[i].nodename + '</option>';
        isck = false;
    }
    return str;
}
function signleFormatter(value, sourceList) {
    var str = "", i = 0, isck = false;
    for (; i < sourceList.length; i++) {
        if (value == sourceList[i].id) isck = true;
        str += '<option value="' + sourceList[i].id + '"' + (isck ? " selected" : "") + '>' + sourceList[i].name + '</option>';
        isck = false;
    }
    return str;
}

//多选框格式
function checkboxFormatter(value, sourceList) {
    var valueArr = value.split(",");
    var str = "", i = 0, isck = false;
    for (; i < sourceList.length; i++) {
        if (valueArr.indexOf(sourceList[i].id) != -1) isck = true;
        str += '<option value="' + sourceList[i].id + '"' + (isck ? " selected" : "") + '>' + sourceList[i].name + '</option>';
        isck = false;
    }
    return str;
}

a2DataGrid.prototype.showEditor = function (l, t, w, h) { // 编辑单元格
    var cell = this.curCell, td = cell.td, cellindex = cell.colindex, _col = this.columns[cellindex],
		_editor, inputfiled = null, self = this, td = $(td), _txt, relConDiagId, _taskId, taskData, taskOwners = [];
    _taskId = cell.tid; //获取任务id
    if (_col.editor) {
        _txt = self.getTaskFieldData(cell.tid, _col.field);
        relConDiagId = self.getTaskFieldData(cell.tid, 'relConDiagId');
        if (_col.field == 'name' && relConDiagId > 0) {
            $.tmsg('m_unedt', '与脉络图关联的节点的名称无法编辑！', { infotype: 3 });
            return false;
        }
        if (!self.setRelations) {
            self.isEdit = true;
            _editor = $.isPlainObject(_col.editor) ? _col.editor.type : _col.editor;
            if (/[se]/i.test(_col.ccode) && self.formula[_col.ccode + cell.tid]) {
                var _expr = self.formula[_col.ccode + cell.tid];
                if (_expr != "") {
                    _expr = _expr.replace(/[seg]\d{1,}/ig, function (o) {
                        return self.taskIdTorowId(o);
                    });
                    _txt = "=" + _expr;
                    self.editFormula = true;
                }
            }
            inputfiled = $("<input/>").addClass("inputField").css({ width: w - 2, height: 22 + 'px', 'line-height': 22 + 'px' }).val(_txt);
            this.inputDiv.html(inputfiled).css({ left: l, top: t, width: w, height: h, display: 'block' }).focus();
            if (_editor != "combobox") inputfiled.focus();
        }
        switch (_editor) {
            case "multiLineText":
                inputfiled = $("<textarea/>").addClass("txtarea").css({ width: w - 2, height: h - 2 });
                this.inputDiv.html(inputfiled);
                inputfiled.wkelastic().val(_txt);
                DGUntil.setCursorPosition(inputfiled[0], 0, inputfiled.val().length);
                break;
            case "combobox":
                inputfiled = $("<select/>").css({ width: td.width(), border: 'none' });
                var formatter = _col.formatter(self.getTaskFieldData(cell.tid, _col.field), self.getTaskFieldSourceData(cell.tid, _col.sourceData)) || "", _mh; inputfiled.html(formatter);
                this.inputDiv.html(inputfiled); inputfiled.focus();
                break;
            case "checkbox":
                inputfiled = $("<select multiple='multiple'  />").css({ width: +td.width()+15+"px", border: 'none', height: 90 });
                var formatter = _col.formatter(self.getTaskFieldData(cell.tid, _col.field), self.getTaskFieldSourceData(cell.tid, _col.sourceData)) || "", _mh; inputfiled.html(formatter);
                this.inputDiv.html(inputfiled); inputfiled.focus();
                break;
            case "singleLineText":
                DGUntil.setCursorPosition(inputfiled[0], 0, inputfiled.val().length);
                if (_col.field == 'ownerName') {
                    var up = $('<input type="hidden" class="data-uid" /><input type="hidden" class="data-profid" /><input type="hidden" class="data-username" />'), _o1, _o2, _o3;
                    this.inputDiv.append(up);
                    _o1 = this.inputDiv.find("input.data-uid"); _o2 = this.inputDiv.find("input.data-profid");
                    _o3 = this.inputDiv.find("input.data-username");
                    //bindASearchableInput(inputfiled, _o1, _o2, this.projId, 2, false, false);
                    taskData = this.getTaskData(_taskId); //获取任务参数，用于选人弹窗的预设值
                    if (!((taskOwners = taskData["taskOwners"]) instanceof Array)) {
                        taskOwners = [];
                    }
                    bindASearchableInput_ZHHY(inputfiled, _o1, _o2, _o3, this.projId, 2, false, false, taskOwners);
                }
                break;
            case "Date":
                inputfiled.css("ime-mode", "disabled");
                DGUntil.setCursorPosition(inputfiled[0], inputfiled.val().length);
                var regexp = /^\d{1,4}([-\/](\d{1,2}([-\/](\d{1,2})?)?)?)?$/,
					regFormula = /^=[se](\d{1,}([+-]((g(\d{1,}([+-](\d{1,})?)?)?)|(\d{1,}([+-](g(\d{1,})?)?)?))?)?)?$/i;
                inputfiled.bind("keyup", function (e) { //本来是keypress//2016.12.21
                    var keyCode = e.keyCode || e.which;
                    if (keyCode == 32) return false; //空格键
                    var pos = DGUntil.getPositionForInput(this), inputstr = String.fromCharCode(keyCode), v = $(this).val(),
						st = DGUntil.getSelectionText(), pos1 = v.length, _rmsel = '';
                    // 进入公式编辑 E15=E13+G13-20
                    if (keyCode !== 8) { //不限制删除
                        if (v == '=') {//!/^=/.test(v) && inputstr == '='   //2016.12.21
                            //$(this).val('');//2016.12.21
                            self.editFormula = true; $(".wcalendar").hide();
                        } else if (/^=/.test(v)) { //以等号开头而且有公式的
                            if (st) { pos1 = v.indexOf(st); v = v.replace(st, ""); pos = pos1; }
                            //inputstr + v.substr(pos)  此处这两个字符在FF等浏览器会使正则不匹配正确字符串  在IE 则无问题故在IE9及以上浏览器 去掉
                            v = (! -[1, ]) ? v.substr(0, pos) + inputstr + v.substr(pos) : v.substr(0, pos);
                            return regFormula.test(v);
                        } else {
                            var curVal = inputfiled.val();
                            if ((inputfiled.val().length >= 10 || (curVal.length >= 9 && curVal.charAt(6) == '-')) && keyCode !== 8) {
                                return false;
                            }
                            //self.editFormula = false;
                            //_rmsel = v.substr(0, pos).replace(st, '');
                            //console.log(_rmsel + inputstr + v.substr(pos));
                            //return regexp.test(_rmsel + inputstr + v.substr(pos));
                        }
                    }
                }).bind("paste dragenter", function () {
                    return false;
                }).bind("click", function () {
                    if (self.editFormula) return;
                    var ofs = $(this).offset(), l = ofs.left, t = ofs.top, h = $(this).outerHeight(), ipt = this;
                    if ($('#wcalendar').length == 0) {
                        _calendar1 = $("<div class='wcalendar' id='wcalendar'></div>");
                        _calendar1.appendTo($('body'));
                    } else {
                        _calendar1 = $("#wcalendar");
                    }
                    var str = $(this).val(), md = { el: this }, _calendar; //_calendar1 = $("#wcalendar")
                    _calendar1.empty();
                    _calendar = $("<div style=\"margin:0;padding:0;width:200px;height:190px;line-height:20px;\"></div>").appendTo(_calendar1);
                    _calendar.calendar({ onSelect: function (d) {
                        $(ipt).val(DGUntil.dateformatter(d)).focus();
                        _calendar.hide();
                    }, weeks: ["日", "一", "二", "三", "四", "五", "六"], months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"], fit: true, el: ipt
                    });
                    if (DGUntil.isDate(str)) _calendar.calendar('moveTo', new Date(str.replace(/,/g, "/")));
                    _calendar.calendar("resize");
                    _calendar1.css({ left: l, top: t + h + 1 }).show();
                    /*if(_col.ccode){
                    if(_col.ccode == 'S'){
                    md.maxDate = (self.getTaskFieldData(cell.tid, ccodeToField['E'])+"").replace("-", "/");
                    }else{
                    md.minDate = (self.getTaskFieldData(cell.tid, ccodeToField['S'])+"").replace("-", "/");
                    }
                    }
                    WdatePicker(md);*/
                }).bind("keyup", function (e) {
                    var keyCode = e.keyCode || e.which;
                    //非时间格式不进行判断
                    if (isNaN($(this).val().replace(/-/g, ""))) return false;

                    var separator = '-',
                        curVal = inputfiled.val();
                    if (keyCode !== 8 && (curVal.length == 4 || (curVal.charAt(6) != separator && curVal.length == 7))) {
                        inputfiled.val(curVal + separator);
                    }
                    if (curVal.length > 4 && curVal.charAt(4) != separator) {
                        inputfiled.val(curVal.substring(0, 4) + separator + curVal.substring(4));
                    }
                    if (curVal.length > 7 && curVal.charAt(7) != separator && curVal.charAt(6) != separator) {
                        inputfiled.val(curVal.substring(0, 7) + separator + curVal.substring(7));
                    }
                    if (!/^=/.test(this.value)) {
                        self.editFormula = false; self.hidefpDiv('all');
                        return;
                    }
                    __showfpDiv(this);
                });
                __showfpDiv(inputfiled[0]);
                break;
            case "numberbox":
                DGUntil.setCursorPosition(inputfiled[0], 0, inputfiled.val().length);
                //inputfiled.wknumberbox(); //旧限制只能输入数字（FF 上 因没有event 会报错）
                inputfiled.wknumberOnly();  //限制只能输入数字
                break;
            case "dummy":
                if (_col.field == "taskRelations") { // 前置任务
                    var _pretasks = '';
                    if (_txt && _txt.length) {
                        $.each(_txt, function (_i, _n) {
                            _pretasks += _n.relTaskIndex + _n.relTaskType + ',';
                        });
                        _pretasks = _pretasks.replace(/,$/g, '');
                    }
                    self.isEdit = false; this.inputDiv.html(_pretasks);
                    self.setRelations = true;
                    taskRelations.init(this, cell.tid);
                } else if (_col.field == "pointName") { // 对应地铁节点
                    var swid = td.attr("swid"); self.isEdit = false; this.inputDiv.html(_txt);
                    subWayMap.viewPoint({ planId: self.secdPlanId,
                        modal: true, swid: swid, nobutton: true, type: 'set',
                        callback: function (swid, t, _ptId) {
                            if (swid == "-1") {
                            } else {
                                var ck = self.checkModified(cell.tid, _col.field, swid);
                                if (ck) {
                                    self.updateFieldData(cell.tid, 'strTextPId', swid);
                                    self.updateFieldData(cell.tid, 'strPointId', _ptId);
                                    self.updateFieldData(cell.tid, _col.field, t);
                                    self.saveSubWay(cell.tid, swid);
                                    td.attr("swid", swid); td.text(t);
                                    td.attr("pointId", _ptId);
                                    if (t != "") { td.parent().find("td").eq(1).find("a").css("color", "Red"); }
                                    else {
                                        td.parent().find("td").eq(1).find("a").css("color", "");
                                    }
                                }
                            }
                            self.inputDiv.hide(); self.focusDiv.show();
                        },
                        cancel: function () {
                            self.inputDiv.hide(); self.focusDiv.hide(); //2016.9.12 显示会不适应 当前td的变动
                        }
                    });
                }
                break;
        }
        if (self.setRelations) return;
        if (_editor != "multiLineText" && _editor != "dummy") inputfiled.stcenter(h);
        if (_editor == 'Date' && !self.editFormula) inputfiled.trigger("click");
        _editor != "dummy" && inputfiled.keydown(function (ev) {
            var keyCode = ev.keyCode || ev.which;
            if ($(this).hasClass("wanted") && $.trim($(this).val() + String.fromCharCode(keyCode)) != "") $(this).removeClass("wanted");
            if (_editor == 'combobox') {
                ev.preventDefault();
                ev.stopPropagation();
            }
            if (keyCode == 13) {
                return self.checkSave(); //保存公式
            } else if (keyCode == 27) { // ESC
                self.cancelEdit();
            }
        }).blur(function (ev) {
            if (_editor == 'Date' || _col.field == 'ownerName') {
                return false;
            }
            self.checkSave();
        });
    }
    function __showfpDiv(obj) {
        var _cell = obj.value.match(/[seg]\d{1,}/ig) || [], _ntd = null;
        self.hidefpDiv('all');
        $.each(_cell, function (i, n) {
            _ntd = self.findfpDiv(n);
            _ntd && self.createfpDiv(_ntd, true);
        });
    }
};
a2DataGrid.prototype.checkSave = function () {
    var ck = this.checkField();
    if (!ck.success) {
        $.tmsg("errs", ck.err);
        return false;
    } else {
        if (ck.field == "pageId") {
            var self = this
            var taskId = ck.taskId;
            var pageId = ck.data.plvl;
            $.ajax({
                url: "/Home/SaveTaskPages",
                type: 'post',
                data: {
                    tbName: "DesignPlanTask",
                    taskId: taskId,
                    pageId: pageId,
                    planId: this.secdPlanId
                },
                dataType: 'json',
                error: function () {
                    $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
                },
                success: function (data) {
                    if (data.Success == false) {
                        $.tmsg("m_jfw", data.Message, { infotype: 2 });
                    } else {
                        $.tmsg("m_jfw", "保存成功！", { infotype: 1 });
                        $(data).each(function (i, n) {
                            var result = "";
                            var _select = self.inputDiv.find("select").find("option");
                            $(_select).each(function () {
                                if (data[i].pageId.split(',').indexOf($(this).val()) != -1) {
                                    result += "<span class='p-f_brown mr2'> ●</span>" + $(this).text() + "<br />";
                                }
                            });
                            if (result != "") {
                                result = result.substring(0, result.length - 6);
                            }
                            self.updateFieldData(data[i].taskId, "pageId", data[i].pageId);
                            self.updateFieldData(data[i].taskId, "pageName", result);
                            self.updateView(data[i].taskId, "pageId", result);
                        });
                        self.cancelEdit();
                    }
                }
            });
        } else {
            this.saveData(ck); // 任务保存处理
        }
    }
    return true;
};
a2DataGrid.prototype.checkField = function () { // 保存前检查
    var self = this, cell = this.curCell, td = cell.td, cellindex = cell.colindex, _col = this.columns[cellindex],
		_editor, inputfield = null, td = $(td), isobj = $.isPlainObject(_col.editor), flag = true, err = "", val, data = {}, modified = false, rtype = 'task', result = '', _taskId = cell.tid; // rtype: 'task' 'formula'
    _editor = isobj ? _col.editor.type : _col.editor;
    if (_editor == "multiLineText") {
        inputfield = this.inputDiv.find("textarea");
    } else if (_editor == "dummy") {
    } else if (_editor == "combobox" || _editor == "checkbox") {
        inputfield = this.inputDiv.find("select");
    } else {
        inputfield = this.inputDiv.find("input");
    }
    if (isobj && _col.editor.required) {
        inputfield.removeClass("wanted");
        if ($.trim(inputfield.val()) == "") {
            inputfield.addClass("wanted");
            flag = false; err = "请填写 " + _col.title;
        }
    }
    function __ckclo(formula, para) {
        var _bk;
        for (_bk in self.fRef) {
            if (self.formula[para] != '' && self.fRef[_bk].indexOf(para) != -1) {
                if (formula == _bk) return true;
                return __ckclo(formula, _bk);
            }
        }
        return false;
    }
    if (flag) {
        if (_editor == "Date") {
            val = $.trim(inputfield.val()); var _cr, formula, nowRowId = _col.ccode + _taskId, nr1 = _col.ccode + (cell.rowindex + 1), arrfRef = []; result = val;
            if (self.editFormula) {
                if (!/^=[se]\d{1,}(([+-]g\d{1,})?([+-]\d{1,})?|([+-]\d{1,})?([+-]g\d{1,})?)$/i.test(val)) {
                    flag = false; err = "输入的公式不正确！（公式格式，如：E3 或 E2-G2+1 或 S1-2 或 S1+G1）";
                } else {
                    _cr = val.match(/[seg]\d{1,}/ig);
                    for (var i = 0; i < _cr.length; ++i) {
                        var _ci = _cr[i].toUpperCase(), _rindex = _ci.replace(/[seg]/ig, ""), _bk = false;
                        if (_rindex > self.rows.length) {
                            flag = false; err = "<span style='color:#ff0000'>" + _ci + "</span> 不存在！";
                        } else {
                            formula = self.rowIdTotaskId(_ci);
                            if (/[se]/ig.test(formula)) _bk = __ckclo(nowRowId, formula);
                            if (nowRowId == formula) {
                                flag = false; err = "<span style='color:#ff0000'>" + _ci + "</span> 为自己！";
                            } else if (_bk) {
                                flag = false; err = "<span style='color:#ff0000'>不允许单元格 " + _ci + "和" + nr1 + "</span> 闭环引用！";
                            } else { arrfRef.push(formula); }
                        }
                    } //return false;
                    if (flag) {
                        var _expr = val.toUpperCase().replace(/[seg]\d{1,}/ig, function (o) {
                            return self.rowIdTotaskId(o);
                        }), calcF = this.calcFormula(nowRowId, arrfRef, _expr);
                        result = calcF.result;
                        rtype = 'formula';
                        data.formula = calcF.formula;
                    }
                }
            } else if (val && !DGUntil.isDate(val) && val.indexOf("=")!==0) {
                flag = false; err = "输入的日期不正确或者日期格式错误！（日期格式，如：2011-8-8）";
            } else {
                if ((self.formula)[nowRowId]) data.formula = { formula: nowRowId, opera: 'del' };
            }
            // check modified
            if (flag) {
                if (rtype == 'formula') {
                    modified = data.formula.modified;
                } else {
                    modified = self.checkModified(_taskId, _col.field, result);
                }
            }
        } else if (_editor == 'combobox') {
            var _select = inputfield.find("option:selected");
            result = _select.text();
            if (plvlStr.indexOf(_col.field) != -1) {
                data.plvl = _select.val();
            }
            modified = self.checkModified(_taskId, _col.field, _select.val());
        } else if (_editor == 'checkbox') {
            var _select = inputfield.find("option:selected");
            $(_select).each(function () {
                result += "<span class='p-f_brown mr2'> ●</span>" + $(this).text() + "<br />";
                if (data.plvl != undefined) {
                    data.plvl += "," + $(this).val();
                } else {
                    data.plvl = $(this).val();
                }
            });
            if (result != "") {
                result = result.substring(0, result.length - 6);
            }
            //标签类和时间性任务节点具有唯一性
            if (_col.field == "taskTypeId" && data.plvl) {
                if (data.plvl.indexOf("1") != -1 && data.plvl.length > 1) {
                    flag = false; err = "标签和时间性类型具有唯一性，不可和其他节点类型一起选择！";
                } else if (data.plvl.indexOf("5") != -1 && data.plvl.length > 1) {
                    flag = false; err = "标签和时间性类型具有唯一性，不可和其他节点类型一起选择！";
                }
            }
            modified = self.checkModified(_taskId, _col.field, data.plvl);
        } else {
            result = $.trim(inputfield.val());
            if (_col.field == 'ownerName') { // 负责人 用户id，专业id
                var uid = self.inputDiv.find("input.data-uid").val(), profid = self.inputDiv.find("input.data-profid").val();
                var usernames = self.inputDiv.find("input.data-username").val(), newTaskOwnerArr = [];
                // usernames:  1|Y|张三|H|2|Y|王五
                if (uid/* && profid*/) {
                    var nameGroup = usernames.split("|H|"), _group;
                    for (var i = 0; i < nameGroup.length; i++) {
                        _group = nameGroup[i].split("|Y|");
                        if (_group.length == 2) {
                            newTaskOwnerArr.push({ userId: _group[0], userName: _group[1] });
                        }
                    }
                    modified = self.checkModified(_taskId, _col.field, { tfzr_uid: uid, tfzr_profid: profid });
                    data.fzr = { uid: uid, profid: profid, taskOwners: newTaskOwnerArr };
                } else {
                    var _name = self.getTaskFieldData(_taskId, 'name');
                    if (result == '' && _name != '') {
                        modified = true; data.fzr = { uid: -1, profid: 0 };
                    } else {
                        modified = false;
                    }
                }
            } else {
                modified = self.checkModified(_taskId, _col.field, result);
            }
        }
    }
    return { success: flag, err: err, taskId: _taskId, field: _col.field, result: result, type: rtype, modified: modified, data: data };
};
a2DataGrid.prototype.checkModified = function (taskId, field, data) { // 判断字段修改否
    var flag = false, taskData = {};
    taskData = this.getTaskData(taskId);

    if (field == 'ownerName') { // 负责人判断，依据用户id，专业id
        if (data.tfzr_uid != taskData["ownerUserId"] || data.tfzr_profid != taskData["ownerProfId"]) flag = true;
    } else if (field == 'endDate' || field == 'startDate') {
        var _dte = taskData[field], endDate = taskData['endDate'], startDate = taskData['startDate'],  _t1, _t2;
        _dte = _dte ? _dte : '1911/1/1'; _dte = new Date(_dte.replace(/-/g, '/'));
        data = data ? data : '1911/1/1'; data = new Date(data.replace(/-/g, '/'));
        if (_dte.getTime() != data.getTime()) flag = true;

//        if (field == 'startDate' && endDate) {
//            _t1 = data;
//            _t2 = new Date(endDate.replace(/-/g, '/'));
//        } else if(field == 'endDate' && startDate) {
//            _t2 = data;
//            _t1 = new Date(startDate.replace(/-/g, '/'));
//        }

//        if (_t1 && _t2 && _t2 < _t1 && _t1 != data && _t2 != data) {
//            $.tmsg("saveTask", '结束日期不能小于开始日期', { infotype: 2 });
//            flag = false;
//        }
    } else {
        if (data != taskData[field]) flag = true;
    }
    return flag;
};
a2DataGrid.prototype.saveData = function (data) { // 保存 任务数据
    if (data.data.formula && data.data.formula.opera == 'del') {
        this.delFormula(data.data.formula); //删除公式
    }
    if (data.modified) {
        var ckdiff, needChgPeriod = false;
        if (data.type == 'formula') { // 进入公式保存处理
            this.updateFieldData(data.taskId, data.field, data.result);

            //            if (data.field == 'endDate' || data.field == 'startDate') { // bts 2817
            //                ckdiff = ckFunction.dateDiff(this.getTaskData(data.taskId));
            //                if (typeof ckdiff == 'number') { // 需要同时修改工期
            //                    this.updateFieldData(data.taskId, 'period', ckdiff);
            //                    needChgPeriod = true;
            //                }
            //            }
            this.saveFormula(data.data.formula, needChgPeriod, ckdiff); // 保存公式
        } else {
            // 任务数据
            var dt = data.result;
            if (plvlStr.indexOf(data.field) != -1) {
                dt = data.data.plvl;
            } else if (data.field == 'status') {
                dt = data.data.stat;
            } else if (data.field == 'ownerName') {
                this.updateFieldData(data.taskId, "ownerUserId", data.data.fzr.uid);
                this.updateFieldData(data.taskId, "ownerProfId", data.data.fzr.profid);
                this.updateFieldData(data.taskId, "taskOwners", data.data.fzr.taskOwners);
            }
            this.updateFieldData(data.taskId, data.field, dt);
            if (data.field == 'endDate' || data.field == 'startDate') { // bts 2817
                var curTr = this.rows[this.rowsindex[data.taskId].index]; //当前操作行

                var changePeriod = false; //是否需要变更工期
                var oldPeriod = curTr['period']; //旧工期
                ckdiff = ckFunction.dateDiff(this.getTaskData(data.taskId)); //新工期
                changePeriod = (!oldPeriod > 0) || ($('#tr' + data.taskId).attr('csr') == "1");
                if (typeof ckdiff == 'number') { // 需要同时修改工期
                    //修改工期：1  工期为空 2.旧工期 与 旧时间计算的工期相等（工期可自己修改）
                    if (changePeriod) {
                        $('#tr' + data.taskId).attr('csr', "1");
                        this.updateFieldData(data.taskId, 'period', ckdiff);
                    }
                    needChgPeriod = true;
                }
            }
            this.saveTask(data.taskId);

            if (needChgPeriod && changePeriod) { //更新视图
                this.updateView(data.taskId, 'period', ckdiff);
            }
        }
        this.updateView(data.taskId, data.field, data.result);
    }
    this.cancelEdit();
};
a2DataGrid.prototype.saveTask = function (taskId, options) { // ajax task
    var Dt = this.getTaskData(taskId), postDt = {},self = this;
    postDt['name'] = Dt.name; postDt['taskId'] = Dt.taskId; postDt['needInherit'] = "0";
    postDt['levelId'] = Dt.levelId; postDt['needSplit'] = "0"; postDt['splitUserId'] = "-1"; postDt['splitProfId'] = "0";
    postDt['nodeTypeId'] = Dt.nodeTypeId; postDt['needSplit'] = "0"; postDt['splitUserId'] = "-1";
    postDt['ownerUserId'] = Dt.ownerUserId; postDt['ownerProfId'] = Dt.ownerProfId;
    postDt['curStartData'] = Dt.startDate; postDt['curEndData'] = Dt.endDate; 
    postDt['remark'] = Dt.remark; postDt['guideRemark'] = Dt.guideRemark;
    postDt['period'] = Dt.period; postDt['taskProfId'] = Dt.taskProfId; postDt['taskOrgId'] = Dt.taskOrgId;
    postDt['tbName'] = 'DesignPlanTask'; postDt['taskTypeId'] = Dt.taskTypeId; postDt['pageId'] = Dt.pageId;
    if (typeof options != "undefined") {
        postDt['isShowIndex'] = options.isShowIndex;
        postDt['isIndicator'] = options.isIndicator;
        postDt['isMaterial'] = options.isMaterial;
        postDt['isResult'] = options.isResult;
        postDt['indicatorRemark'] = options.indicatorRemark;
        postDt['materialRemark'] = options.materialRemark;
        postDt['resultRemark'] = options.resultRemark;
        postDt['homeOrder'] = options.homeOrder;
    }
    postDt['queryStr'] = "db.DesignPlanTask.distinct('_id',{'taskId':'" + taskId + "'});";
    gAjaxQueue.add({
        type: 'POST', url: commApi.saveTask, data: postDt,
        success: function (rs) {
            if (!rs.Success) {
                $.tmsg("saveTask", rs.Message, { infotype: 2 });
            } else {
                var ck = ckFunction.rule(Dt), _tr = $("#tr" + taskId);
                _tr.attr("tasktype", postDt['taskTypeId']);
                $(".focusDiv").find("td[field=name]").attr("taskType", postDt['taskTypeId']);
                self.updateFieldData(taskId, "taskTypeId", postDt['taskTypeId']);
                if (postDt['taskTypeId'] == "1") {
                    _tr.find("td[field=name]").find("a").attr("href", "javascript:;").attr("target", "");
                }
                else {
                    var parameters = window.location.search;
                    if (parameters.indexOf("isEdit=1") != -1) {
                        _tr.find("td[field=name]").find("a").attr("href", "/PlanManage/ProjTaskInfo/" + taskId + "?isEdit=1").attr("target", "_blank").addClass("p-j-taskLink");
                    } else {
                        _tr.find("td[field=name]").find("a").attr("href", "/PlanManage/ProjTaskInfo/" + taskId).attr("target", "_blank").addClass("p-j-taskLink");
                    }
                }
                if (ck) {
                    for (var key in ccodeToField) {
                        _tr.find("td[field='" + ccodeToField[key] + "']").addClass("error");
                    }
                } else {
                    if (_tr.find("td.error").length) _tr.find("td.error").removeClass("error");
                }
                self.updateScheduleRight(taskId)
            }
        }
    });
};
//重新计算工期
a2DataGrid.prototype.countPeriod = function (taskId) {
    var self = this;
    var cur = self.getTaskData(taskId);

    var e = cur.endDate, s = cur.startDate, p = cur.period;

    if (s !== "" && e !== "" && ($('#tr' + taskId).attr('csr') == "1" || p == "")) {
        s = new Date(s.replace(/-/g, "/"));
        e = new Date(e.replace(/-/g, "/"));

        var np = parseInt(Math.abs(Date.parse(s) - Date.parse(e)) / 1000 / 60 / 60 / 24, 10) + 1;
        return np;
    }
    return false;
}
a2DataGrid.prototype.saveFormula = function (data, needChgPeriod, ckdiff) { // 保存公式
    // data = {formula:formula, fRef:fRef, expression:expression, modified:modified}}
    var self = this, formula;
    if (data.modified) {
        formula = data.formula; var expression = formula + "=" + data.expression, arr, _taskId;
        if (!data.mask) this.grid.mask("处理中，请稍候...");
        arr = DGUntil.refRowindex(formula);
        _taskId = arr[2];
        // ajax
        $.ajax({
            type: 'POST',
            url: commApi.editFormula, data: { taskId: arr[2], type: arr[1], formula: expression },
            complete: function () { if (!data.mask) self.grid.unmask(); },
            success: function (rs) {
            //console.log("请求中...")
                if (rs.Success) {
                    if (needChgPeriod || self.countPeriod(_taskId)) { // 保存工期变动
                        self.updateView(_taskId, 'period', self.countPeriod(_taskId) || 0);
                        self.updateFieldData(_taskId, 'period', self.countPeriod(_taskId) || 0)
                        self.saveTask(_taskId);
                    }
                    self.formula[formula] = data.expression;
                    self.updatefRef(data.fRef, formula);
                    var Dt = self.getTaskData(arr[2]), ck = ckFunction.rule(Dt), _tr = $("#tr" + arr[2]);
                    if (ck) {
                        for (var key in ccodeToField) {
                            _tr.find("td[field='" + ccodeToField[key] + "']").addClass("error");
                        }
                    } else {
                        if (_tr.find("td.error").length) _tr.find("td.error").removeClass("error");
                    }
                    _tr.find("td[field='" + ccodeToField[arr[1]] + "']").removeClass('dotorange').addClass('dotgreen');
                } else {
                    $.tmsg("editFormula", rs.Message, { infotype: 2 });
                }
            }
        });
    }
    this.cancelEdit();
};
a2DataGrid.prototype.saveColor = function (taskId, field, data, curCol) { // 保存 日期单元格底色
    var self = this, ck = self.checkModified(taskId, field, data),
        f = self.dt.find("#tr" + taskId).find("td[field='" + curCol + "']");
    if (ck) {
        var sd = '', ed = '', t;
        if (field.indexOf('start') != -1) {
            sd = data;
            t = 0; ed = self.getTaskFieldData(taskId, 'endDateBg');
        } else {
            t = 1;
            sd = self.getTaskFieldData(taskId, 'startDateBg'); ed = data;
        }
        gAjaxQueue.add({
            type: 'POST', url: commApi.saveBgColor + taskId, data: { startBg: sd, endBg: ed, type: t },
            success: function (rs) {
                if (!rs.Success) {
                    $.tmsg("cellbgcolor", rs.Message, { infotype: 2 });
                } else {
                    self.updateFieldData(taskId, field, data);
                    f[0].style.backgroundColor = data;
                }
            }
        });
    }
};
a2DataGrid.prototype.saveSubWay = function (taskId, swid) { // 保存选择的地铁图
    var self = this;
    gAjaxQueue.add({
        type: 'POST', url: commApi.saveSubWay, data: { taskId: taskId, pointId: swid, secdPlanId: self.secdPlanId },
        success: function (rs) {
            if (!rs.Success) {
                $.tmsg("saveTask", rs.Message, { infotype: 2 });
            }
        }
    });
};
a2DataGrid.prototype.setCIList = function (taskId, hasCIList) {
    var me = this;
    $.ajax({
        type: 'POST', url: commApi.setCIList,
        data: { tbName: "XH_DesignManage_Task", "queryStr": "db.XH_DesignManage_Task.distinct('_id',{'taskId':'" + taskId + "'})", "hasCIList": hasCIList },
        success: function (rs) {
            if (!rs.Success) {
                $.tmsg("saveTask", rs.Message, { infotype: 2 });
            } else {
                var _tr = $("#tr" + taskId),
                    f = _tr.find("div:last"), hasc = me.getTaskFieldData(taskId, 'hasCIList');
                if (hasCIList == 1 && hasc == 0) {
                    f.append('<img src="/content/images/icon/ico0006.png" title="有配置清单" style="vertical-align:middle;" name="cilist" />');
                } else if (hasCIList == 0) {
                    f.find('img[name="cilist"]').remove();
                }
                me.updateFieldData(taskId, 'hasCIList', hasCIList);
            }
        }
    });
};
a2DataGrid.prototype.updatefRef = function (fRef, formula) {
    var self = this;
    $.each(fRef, function (i, n) {
        if (!self.fRef[n]) self.fRef[n] = [];
        if (self.fRef[n].indexOf(formula) == -1) self.fRef[n].push(formula);
    });
};
a2DataGrid.prototype.delFormula = function (data) { // 删除公式
    // data = {formula:formula, opera:'del'}
    var fmn = data.formula, self = this, arr;
    arr = DGUntil.refRowindex(fmn);
    gAjaxQueue.add({
        type: 'POST', url: commApi.delFormula, data: { taskId: arr[2], type: arr[1] },
        success: function (rs) {
            if (rs.Success) {
                self.formula[fmn] = "";
                for (var key in self.fRef) {
                    self.fRef[key].remove(fmn);
                }
                $("#tr" + arr[2]).find("td[field='" + ccodeToField[arr[1]] + "']").removeClass('dotgreen').addClass('dotorange');
            } else {
                $.tmsg("delFormula", rs.Message, { infotype: 2 });
            }
        }
    });
};
a2DataGrid.prototype.updateView = function (taskId, field, data) { // 刷新视图
    var key = null;
    for (var k in ccodeToField) {
        if (ccodeToField[k] == field) {
            key = k; break;
        }
    }

    this.updateView1(taskId, field, data);

    if (key) { // 公式关联field
        this.upFormulaRelative(key + taskId);
    }
};
a2DataGrid.prototype.upFormulaRelative = function (key) { //更新公式关联项
    var self = this, frs = [];
    function _dg(k) {
        var formulas = self.fRef[k] || [], f, _cr, rs, ri;
        $.each(formulas, function (i, n) {
            f = self.formula[n];
            if (f != '') {
                _cr = f.match(/[seg]\d{1,}/ig); ri = DGUntil.refRowindex(n);
                rs = self.calcFormula(n, _cr, f);

                var fieldType = ccodeToField[ri[1].toUpperCase()];
                self.updateFieldData(ri[2], fieldType, rs.result); //更新关联项视图
                if (fieldType == 'endDate' || fieldType == 'startDate') {
                    var curTr = self.rows[self.rowsindex[ri[2]].index]; //当前操作行

                    var changePeriod = false; //是否需要变更工期
                    var oldPeriod = curTr['period']; //旧工期
                    ///////////////////////////////////////重新计算新工期 PS：dateDiff 算法引用的是旧日期数据
                    var s = curTr.startDate, e = curTr.endDate;
                    if (fieldType == 'endDate') {
                        e = rs.result;
                    } else {
                        s = rs.result;
                    }
                    s = new Date(s.replace(/-/g, "/"));
                    e = new Date(e.replace(/-/g, "/"));
                    ckdiff = parseInt(Math.abs(Date.parse(s) - Date.parse(e)) / 1000 / 60 / 60 / 24, 10) + 1;

                    ckdiff = ckdiff != oldPeriod ? ckdiff : false;//新工期
                    ///////////////////////////////////////
                    var changePeriod2 = (!oldPeriod > 0) || ($('#tr' + ri[2]).attr('csr') == "1");

                    if (typeof ckdiff == 'number') { // 需要同时修改工期
                        //修改工期：1  工期为空 2.旧工期 与 旧时间计算的工期相等（工期可自己修改）
                        if (changePeriod2 && !isNaN(ckdiff)) {
                            $('#tr' + ri[2]).attr('csr', "1");
                            self.updateFieldData(ri[2], 'period', ckdiff);
                            self.updateView(ri[2], 'period', ckdiff);
                        }
                    }
                }
                
                self.saveTask(ri[2]); //数据持久化

                frs.push({ 'taskId': ri[2], 'field': fieldType, 'result': rs.result });
                if (self.fRef[n] && self.fRef[n].length) {
                    _dg(n);
                }
            }
        });
    }

    _dg(key);
    var i = 0, _dt;
    for (; _dt = frs[i]; ++i) {
        var f = document.getElementById('tr' + _dt.taskId),
            idx = self.colIdxs[_dt.field], _t = _dt.result;
        f = f.childNodes[idx];
        _t = _t.replace(/\//g, "-");
        if (f) {
            var txt = f.childNodes[0];
            if (txt) {
                txt.nodeValue = _t;
            } else {
                txt = document.createTextNode(_t);
                f.appendChild(txt);
            }
        }
    }
};
a2DataGrid.prototype.updateView1 = function (taskId, c, data) { // 刷新视图1
    var field = ccodeToField[c] || c, _t = data, f = this.dt.find("#tr" + taskId).find("td[field='" + field + "']");
    if (field == 'name') {
        if (f.hasClass("gray")) f.removeClass("gray");
        //var _url = _isexpLibId ? '<a href="javascript:;">' : '<a href="' + commApi.taskUrl + taskId + '" target="_blank" class="p-j-taskLink">', exem = '';
        var _url = '<a href="' + commApi.taskUrl + taskId + '" target="_blank" class="p-j-taskLink">', exem = '';
        f = f.find("div:last");
        if (f.find('span')[0]) exem = '<span>' + f.find('span:first').text() + '</span>';
        if (f.find('img[name="cilist"]')[1]) exem += '<img src="/content/images/icon/ico0006.png" style="vertical-align:middle;" title="有配置清单" name="cilist" />';
        _t = _url + data.replace(/ /g, "&nbsp;") + '</a>' + exem;
    }
    if (field == 'startDate' || field == 'endDate') _t = _t.replace(/\//g, "-");
    f.html(_t);
    this.upFocusDiv();
};
a2DataGrid.prototype.cancelEdit = function () { // 按 ESC 取消编辑
    if (this.config.keynav) this.config.keynav.isEdit = false;
    this.inputDiv.children().remove();
    if (this.editFormula) this.hidefpDiv('all'); this.isEdit = false; this.editFormula = false;
    this.inputDiv.hide(); $("#wcalendar").hide();
    if (typeof hideAllTaskPeopleList == 'function') hideAllTaskPeopleList();
    this.focusDiv.show();
};
a2DataGrid.prototype.calcFormula = function (formula, fRef, expression) { // S37 [S32,G32] S32+G32-5
    var i = 0, flag = true, err = '', rr, fRefData, f, result = '', d, dt = {}, days;
    for (; i < fRef.length; ++i) {
        rr = DGUntil.refRowindex(fRef[i]); // SEG rr[1]  task/rowindex rr[2]
        fRefData = this.getTaskFieldData(rr[2], ccodeToField[rr[1].toUpperCase()]).toString().replace(/-/g, "/");
        dt[fRef[i].toUpperCase()] = fRefData;

        if (rr[1].toUpperCase() != 'G') d = new Date(fRefData || '1900/1/1');
    }
    expression = expression.replace("=", "");
    f = expression.replace(/[se]\d{1,}/ig, "").toUpperCase();
    if (f != "") {
        f = f.replace(/g\d{1,}/ig, function (_) {
            return dt[_] || 0
        });
        days = parseInt(eval(f), 10) || 0;
        d.addDays(days);
    }
    result = d.Format("yyyy-MM-dd");
    var fmd = !this.formula[formula] ? true : !(this.formula[formula] == expression);
    return { success: flag, result: result, err: err, formula: { formula: formula, fRef: fRef, expression: expression, modified: fmd} };
};
var ccodeToField = { 'S': 'startDate', 'E': 'endDate', 'G': 'period' };
var ckFunction = {
    "name": "checkdate",
    "rule": function (record) {
        var s = record[ccodeToField['S']], e = record[ccodeToField['E']], p = record[ccodeToField['G']], _f1 = false, _f2 = false, diff;
        if (s == '' || e == '') return false;
        s = new Date(s && s.replace(/-/g, "/")); e = new Date(e && e.replace(/-/g, "/")); p = parseInt(p, 10) || 0;
        if (s > e) _f1 = true;
        diff = parseInt(Math.abs(Date.parse(s) - Date.parse(e)) / 1000 / 60 / 60 / 24, 10) + 1;
        if (diff != p) _f2 = true;
        return _f1 || _f2
    },
    "dateDiff": function (record) {
        var recordClone = record;
        var s = record['startDate'], e = record['endDate'], p = record['period'], diff;
        if (s == '' || e == '') return false; //计算工期

        s = new Date(s.replace(/-/g, "/"));
        e = new Date(e.replace(/-/g, "/")); p = parseInt(p, 10) || 0;

        diff = parseInt(Math.abs(Date.parse(s) - Date.parse(e)) / 1000 / 60 / 60 / 24, 10) + 1;

        if (diff != p) return diff;
        return false;
    }
};
a2DataGrid.prototype.getTaskData = function (taskId) { // 获取单条任务数据
    var rowsindex = this.rowsindex[taskId].index, rs;
    rs = this.rows[rowsindex]; 
    return rs;
};
a2DataGrid.prototype.getTaskFieldData = function (taskId, field) { // 获取field数据
    var taskData = this.getTaskData(taskId);
    return taskData[field] || "";
};
a2DataGrid.prototype.getTaskFieldSourceData = function (taskId, objField) { // 获取field数据源 
    return sourceData[objField] || [];
};
a2DataGrid.prototype.updateFieldData = function (taskId, field, data) { // 更新field数据
    var self = this;
    if (field == 'endDate' || field == 'startDate') data = data.replace(/\//g, "-");
    self.rows[self.rowsindex[taskId].index][field] = data;
};
a2DataGrid.prototype.rowIdTotaskId = function (cr) { // E1 => E15
    var cd = cr.replace(/\d/g, ""), _rindex = parseInt(cr.replace(/[seg]/ig, ""), 10) - 1;
    _rindex = this.dt.find("tr:eq(" + _rindex + ")").attr("id").replace("tr", "");
    return (cd + _rindex);
};
a2DataGrid.prototype.taskIdTorowId = function (cr) { // E15 => E1
    var cd = cr.replace(/\d/g, ""), _tid = parseInt(cr.replace(/[seg]/ig, ""), 10);
    _tid = (this.dt.find("#tr" + _tid))[0].rowIndex - 1;
    return (cd + _tid);
};
a2DataGrid.prototype.upFocusDiv = function () { // focus单元格
    var self = this, td = self.curCell.td;
    var offset = $(td).position(),
		l = offset.left - 2, t = offset.top - 2, w = $(td).outerWidth() - 2, h = $(td).outerHeight() - 1;
    this.showFocusDiv(l, t, w, h, self.curCell.td);
};
a2DataGrid.prototype.showFocusDiv = function (l, t, w, h, td) { // focus单元格
    var This = this;
    This.focusDiv.children('[field=name]').remove();
    if ($(td).attr('field') === 'name') {
        var cloneTd = function () {
            var tasktype = $(td).closest('tr').attr('tasktype');
            return $(td).clone().attr('tasktype', tasktype).css({ height: h, verticalAlign: 'middle', background: '#fcf1a9' }).find('img[id^=img]').mousedown(function () {
                $(td).find('img[id^=img]').mousedown();
                This.focusDiv.children('[field=name]').remove().end().append(cloneTd());
            }).end();
        }
        This.focusDiv.append(cloneTd());
    }

    this.isEdit = false;
    this.focusDiv.css({ left: l, top: t, width: w, height: h, display: 'block' }).focus();
};
a2DataGrid.prototype.importExp = function () { // 导入经验
    var expData = [], _secdPlanId = -1, self = this, secdPlanId = self.secdPlanId, setoffset_year, setoffset_month, setoffset_day, isIgnorePerson, isIgnoreDate, isIgnorePassed, insertPlanName, planManager, planManagerId, planRemark;
    $.YH.box({
        target: commApi.importExp + secdPlanId + "?projId=" + self.projId,
        title: '载入模板',
        width: 450,
        buttonNames: ['确定导入', '取消'],
        afterLoaded: function () {
            var $box = $(this);
            var _o1 = $box.find("#manager"), _o2 = $box.find("#managerId");
            bindASearchableInput(_o1, _o2, null, secdPlanId, 2, false, false);
            $box.find("li[secdPlanId]").each(function () {
                $(this).click(function () {
                    _secdPlanId = $(this).attr("secdPlanId");
                    $box.find("li[secdPlanId]").removeClass("libg");
                    $(this).addClass("libg");
                    $box.mask("loading...");
                    $.ajax({
                        url: commApi.iExpLoad, data: { secdPlanId: _secdPlanId }, cache: false,
                        complete: function () { $box.unmask(); },
                        success: function (data) {
                            expData = data;
                            if ($.isArray(data)) {
                                data = data || [];
                            } else {
                                data = data.jsonGroupTaskList;
                            }
                            var cc = [], tpl = commApi.tplv.join(""), ct = 0;
                            function rd(pid, lv) {
                                var dt, i = 0, _tid, _pid, tmp;
                                for (; dt = data[i]; ++i) {
                                    _tid = dt.taskId; _pid = dt.nodePid;
                                    if (_pid === pid) {
                                        ct++;
                                        dt = self.calcrs_(dt, lv);
                                        dt["rowindex"] = ct;
                                        cc.push(tpl.compileTpl(dt));
                                        rd(_tid, lv + 1);
                                    }
                                }
                            }

                            rd(0, 0);
                            cc = cc.join('');
                            if (cc == "") cc = "<tr><td colspan='6'>暂无内容</td></tr>";
                            $("#viewExp").find("tbody").html(cc);
                        }
                    });
                });
            });
            $box.find("li[secdPlanId]").first().click();

            $("#searchexp").click(function () {
                var compname = $.trim($box.find("input[name='companyname']").val()),
					compexp = $.trim($box.find("input[name='companyexp']").val()), lastobj;
                $box.find(".cnclor").removeClass("cnclor");
                $box.find(".expbg").removeClass("expbg");
                compname && $box.find("div[data-orgname='1']").each(function () {
                    if ($(this).text().toLowerCase().indexOf(compname) != -1) {
                        $(this).addClass("cnclor");
                        lastobj = this;
                        if (compexp) {
                            $(this).next().find("li[data-expname='1']").each(function () {
                                if ($(this).text().toLowerCase().indexOf(compexp) != -1) {
                                    $(this).addClass("expbg");
                                    lastobj = this;
                                }
                            });
                        }
                    }
                });
                !compname && compexp && $box.find("li[data-expname='1']").each(function () {
                    if ($(this).text().toLowerCase().indexOf(compexp) != -1) {
                        $(this).addClass("expbg");
                        lastobj = this;
                    }
                });
                if (lastobj) {
                    YH.dom.scrollintoContainer(lastobj, $("#exp_clist"), true, true);
                    if (lastobj.tagName.toLowerCase() == "li") $(lastobj).trigger("click");
                }
            });
            setoffset_year = $box.find("input[name='OffSetYear']");
            setoffset_month = $box.find("input[name='OffSetMonth']");
            setoffset_day = $box.find("input[name='OffSetDay']");
            isIgnorePerson = $box.find("input[name='isIgnorePerson']");
            isIgnoreDate = $box.find("input[name='isIgnoreDate']");
            isIgnorePassed = $box.find("input[name='isIgnorePassed']");
            insertPlanName = $box.find("input[name='name']");
            planManager = $box.find("input[name='manager']");
            planManagerId = $box.find("input[name='managerId']");
            planRemark = $box.find("textarea[name='remark']");
            setoffset_year.onumberbox(); setoffset_month.onumberbox(); setoffset_day.onumberbox();
        },
        ok: function () {
            _secdPlanId = $("#selectExpLib").val();
            if (_secdPlanId == -1) {
                $.tmsg("m_loadexp", "请选择要载入的公司经验！");
                return false;
            }
            if (confirm("载入模板将删除已有任务及其数据,确定载入吗？")) {
                self.grid.mask("载入中...");
                var _str = '?OffSetYear=' + setoffset_year.val() + "&OffSetMonth=" + setoffset_month.val() + "&OffSetDay=" + setoffset_day.val() + "&name=" + encodeURI(insertPlanName.val()) + "&managerId=" + encodeURI(planManagerId.val());
                if (!isIgnorePerson.prop("checked")) {
                    _str += "&isIgnorePerson=1";
                } else {
                    _str += "&isIgnorePerson=0";
                }
                if (!isIgnoreDate.prop("checked")) {
                    _str += "&isIgnoreDate=1";
                } else {
                    _str += "&isIgnoreDate=0";
                }
                if (isIgnorePassed.length) {
                    if (!isIgnorePassed.prop("checked")) {
                        _str += "&isIgnorePassed=1";
                    } else {
                        _str += "&isIgnorePassed=0";
                    }
                }
                if (typeof zhhyPlanType == "string" && zhhyPlanType == "salesPlan") {
                    _str += "&isSalesPlan=1";
                }
                if (typeof zhhyPlanType == "string" && zhhyPlanType == "deliveryPlan") {
                    _str += "&isDeliveryPlan=1";
                }
                $.ajax({
                    url: commApi.iExpSave + _str, data: { copySecPlanId: _secdPlanId, sourceSecPlanId: self.secdPlanId, projId: self.projId, remark: planRemark.val() }, type: 'POST',
                    complete: function () { self.grid.unmask(); },
                    success: function (data) {
                        if (data.Success) {
                            //self.renderRows(expData, true);
                            self.resetData_();
                            self.loadData();
                            setTimeout('window.location.reload();', 300);
                            //$.tmsg("m_loadexp", "导入成功！",{infotype:1});
                        } else {
                            $.tmsg("m_loadexp", data.Message, { infotype: 2 });
                        }
                    }
                });
            }
        },
        beforeDestroy: function(){
            $(".ajs-layer").remove();
        }
    });
};
a2DataGrid.prototype.exportExp = function () { // 导出经验
    var self = this, secdPlanId = self.secdPlanId;
    box(commApi.exportExp + secdPlanId, { boxid: 'expExp', title: '导出为公司经验', contentType: 'ajax', modal: true, submit_BtnName: '确定导出', cls: 'shadow-container', width: 700,
        onLoad: function (o) {
            $("#validStartDate").click(function () {
                WdatePicker({ maxDate: $("#validEndDate").val().replace(/-/g, "/") });
            });
            $("#validEndDate").click(function () {
                WdatePicker({ minDate: $("#validStartDate").val().replace(/-/g, "/") });
            });
        },
        submit_cb: function (o) {
            var _name = $.trim(o.db.find("input[name='name']").val()), _orgId = $("#orgId option:selected").val(),
            isIgnorePassed = o.db.find("input[name='isIgnorePassed']"), _str = '', dt;
            //            _planTypeId = $("#planTypeId option:selected").val(), _isActive = $("radio[name=isActive]:checked").val(),
            if (!_name) {
                $.tmsg("m_exp", "名称不能为空！", { infotype: 2 });
                return false;
            }
            dt = { name: _name, orgId: _orgId };
            if (isIgnorePassed.length) {
                if (!isIgnorePassed.attr("checked")) {
                    dt = { name: _name, orgId: _orgId, isIgnorePassed: '1' };
                } else {
                    dt = { name: _name, orgId: _orgId, isIgnorePassed: '0' };
                }
            }
            $.ajax({ type: 'POST',
                url: commApi.exphasexist, data: dt, cache: false,
                success: function (data) {
                    if (data.Data.success) {
                        if (confirm("已经重名 是否继续覆盖")) {
                            __saveep(o);
                        } else {
                            $.tmsg("m_exp", "换个名称吧！");
                        }
                    } else {
                        __saveep(o);
                    }
                }
            });
            function __saveep(o) {
                $("#expLibForm").validate({
                    submitHandler: function (form) {
                        var dt = $("#expLibForm").serialize(), ids = "";
                        $("#patternIdArray option").each(function () {
                            ids += $(this).val() + ",";
                        });
                        o && o.fbox.mask("导出中...请稍后...");
                        $.ajax({ type: 'POST',
                            url: commApi.saveAsExp + '?' + dt, data: { patternIds: ids },
                            complete: function () { o && o.fbox.unmask(); },
                            success: function (data) {
                                if (data.Success) {
                                    $.tmsg("m_exp", "操作成功！", { infotype: 1 });
                                    o.destroy();
                                } else {
                                    $.tmsg("m_exp", data.Message, { infotype: 2 });
                                }
                            }
                        });
                    }
                });
                $("#expLibForm").submit();
            }
            return false;
        }
    });
};

a2DataGrid.prototype.preTask = function () { // 费用支付选择基本计划中的节点作为前置节点
    var self = this, tid = self.curCell.tid, nodeTypeId, relationType;
    $.YH.box({
        target: $("#projTaskNodeList"),
        title: "选择前置节点",
        width: 600,
        open: function () {
            var $this = $(this);
            $this.find(".nodeList").load("/PlanManage/ProjTaskSelectNode?taskId=" + tid + "&nodeTypeId=0&relationType=0&r=" + Math.random());
            $this.find(".nodeSearch").find("a[s]").each(function () {
                $(this).click(function () {
                    $(this).addClass("select").siblings().removeClass("select");
                    if ($(this).attr("s") == "s") {
                        $this.find(".nodeList").load("/PlanManage/ProjTaskSelectNode?taskId=" + tid + "&nodeTypeId=0&relationType=0&r=" + Math.random(), function () { });
                    } else {
                        $this.find(".nodeList").load("/PlanManage/ProjTaskSelectNode?taskId=" + tid + "&nodeTypeId=2&relationType=0&r=" + Math.random(), function () { });
                    }
                });
            });
            $this.find(".nodeSearch").find("a[t]").each(function () {
                $(this).click(function () {
                    if ($(this).attr("t") == "t") {
                        var keyword = $(this).parent().find("input").val();
                        $this.find(".nodeList").load("/PlanManage/ProjTaskSelectNode?taskId=" + tid
                            + "&nodeTypeId=0&relationType=0&keyWord=" + encodeURI(keyword) + "&r=" + Math.random());
                    } else {
                        if ($this.find("a.select").attr("s") == "s") {
                            nodeTypeId = 0;
                            relationType = 0;
                        } else {
                            nodeTypeId = 2;
                            relationType = 1;
                        }
                        $this.find(".nodeList").load("/PlanManage/ProjTaskSelectNode?taskId=" + tid + "&nodeTypeId=" + nodeTypeId + "&relationType=" + relationType + "&r=" + Math.random(), function () { });
                    }
                });
            });
        },
        ok: function () {
            var obj = $(this).find("form");
            var keys = "";
            $("input[name=key]:checked", $(this).db).each(function () {
                keys += $(this).val() + "|Y|"
            });
            $("input[name=saveKey]", $(this).db).val(keys);
            saveTaskRelationInfo(obj);
        }
    });


    //    box("#projTaskNodeList", { boxid: 'UpLoadDiv', title: '选择前置节点', contentType: 'selector', width: 600,
    //        onOpen: function (o) {
    //            o.fbox.find(".nodeList").load("/PlanManage/ProjTaskSelectNode?taskId=" + tid + "&nodeTypeId=0&relationType=0&r=" + Math.random());
    //            o.fbox.find(".nodeSearch").find("a[s]").each(function () {

    //                $(this).click(function () {
    //                    $(this).addClass("select").siblings().removeClass("select");
    //                    if ($(this).attr("s") == "s") {
    //                        o.fbox.find(".nodeList").load("/PlanManage/ProjTaskSelectNode?taskId=" + tid + "&nodeTypeId=0&relationType=0&r=" + Math.random(), function () {

    //                        });
    //                    } else {
    //                        o.fbox.find(".nodeList").load("/PlanManage/ProjTaskSelectNode?taskId=" + tid + "&nodeTypeId=2&relationType=0&r=" + Math.random(), function () {

    //                        });
    //                    }
    //                })

    //            })
    //            o.fbox.find(".nodeSearch").find("a[t]").each(function () {

    //                $(this).click(function () {
    //                    if ($(this).attr("t") == "t") {
    //                        var keyword = $(this).parent().find("input").val();
    //                        o.fbox.find(".nodeList").load("/PlanManage/ProjTaskSelectNode?taskId=" + tid
    //+ "&nodeTypeId=0&relationType=0&keyWord=" + escape(keyword) + "&r=" + Math.random(), function () {

    //});
    //                    } else {

    //                        if (o.fbox.find("a.select").attr("s") == "s") {
    //                            nodeTypeId = 0;
    //                            relationType = 0;
    //                        } else {
    //                            nodeTypeId = 2;
    //                            relationType = 1;
    //                        }

    //                        o.fbox.find(".nodeList").load("/PlanManage/ProjTaskSelectNode?taskId=" + tid + "&nodeTypeId=" + nodeTypeId + "&relationType=" + relationType + "&r=" + Math.random(), function () {

    //                        });
    //                    }
    //                })

    //            })


    //        },

    //        submit_cb: function (o) {
    //            var obj = o.fbox.find("form");
    //            var keys = "";
    //            $("input[name=key]:checked", o.db).each(function () {
    //                keys += $(this).val() + "|Y|"
    //            })
    //            $("input[name=saveKey]", o.db).val(keys);
    //            saveTaskRelationInfo(obj);
    //        }
    //    })

    function saveTaskRelationInfo(obj) {
        var formdata = $(obj).serialize();
        $.ajax({
            url: "/Home/QuickSaveTaskRelationJHGL",
            type: 'post',
            data: formdata,
            dataType: 'json',
            error: function () {
                $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
            },
            success: function (data) {
                if (data.Success == false) {
                    $.tmsg("m_jfw", data.Message, { infotype: 2 });
                }
                else {
                    $.tmsg("m_jfw", "保存成功！", { infotype: 1 });
                    // reloadContractDiv();
                }
            }
        });
    }
};

$.fn.a2DataGrid = function (config) {
    if (typeof expLibId != 'undefined') {
        if (expLibId > 0) {
            _isexpLibId = true;
        }
    }
    var l = $(this).length;
    return this.each(function () {
        new a2DataGrid($.extend({ el: $(this), cols: 7, plans: l, startindex: 1 }, config || {}));
    });
}


// 关注级别筛选
function trHide(tr, isortable) {
    if (tr.style.display == 'none') return;
    if (!isortable) {
        var td1, td2, rspan, cspan, ptd = null, l = 1, _cells = tr.cells, gid,
            canPlus = false, nexttr, prevtr, pl;
        td1 = _cells[1]; td2 = _cells[2];
        rspan = td1.getAttribute("rowSpan"); cspan = td1.getAttribute("colSpan");
        gid = td1.getAttribute("gid");

        if (td1.style.display == 'none') {
            nexttr = tr.nextSibling;
            if (!nexttr || nexttr.cells[1].getAttribute('gid') != gid) {
                prevtr = tr.previousSibling; ptd = prevtr.cells[1];
                while (prevtr && ptd.getAttribute('gid') == gid) {
                    if (prevtr.style.display != 'none') {
                        ptd = prevtr.cells[1];
                        if (!canPlus) {
                            canPlus = true; pl = prevtr;
                        }
                        if (ptd.style.display != 'none') {
                            break;
                        }
                    }
                    prevtr = prevtr.previousSibling;
                }
                if (canPlus) {
                    ptd = ptd.parentNode;
                    ptd.cells[1].setAttribute('rowSpan', pl.rowIndex - ptd.rowIndex + 1);
                }
            }
        } else if (rspan > 1) {
            nexttr = tr.nextSibling;
            while (nexttr && nexttr.cells[1].getAttribute('gid') == gid) {
                if (canPlus) l++;
                if (nexttr.style.display != 'none' && !canPlus) {
                    canPlus = true;
                    ptd = nexttr;
                }
                nexttr = nexttr.nextSibling;
            }
            if (ptd) {
                ptd = ptd.cells[1];
                ptd.setAttribute("rowSpan", l); ptd.style.display = '';
                if (cspan > 1) ptd.setAttribute("colSpan", cspan);
            }
        }

        rspan = td2.getAttribute("rowSpan"); canPlus = false; gid = td2.getAttribute("gid");
        l = 1; ptd = null;
        if (td2.style.display == 'none') {
            nexttr = tr.nextSibling;
            if (!nexttr || nexttr.cells[2].getAttribute('gid') != gid) {
                prevtr = tr.previousSibling; ptd = prevtr.cells[2];
                while (prevtr && ptd.getAttribute('gid') == gid) {
                    if (prevtr.style.display != 'none') {
                        ptd = prevtr.cells[2];
                        if (!canPlus) {
                            canPlus = true; pl = prevtr;
                        }
                        if (ptd.style.display != 'none') {
                            break;
                        }
                    }
                    prevtr = prevtr.previousSibling;
                }
                if (canPlus) {
                    ptd = ptd.parentNode;
                    ptd.cells[2].setAttribute('rowSpan', pl.rowIndex - ptd.rowIndex + 1);
                }
            }
        } else if (rspan > 1 && cspan == 1) {
            nexttr = tr.nextSibling;
            while (nexttr && nexttr.cells[2].getAttribute('gid') == gid) {
                if (canPlus) l++;
                if (nexttr.style.display != 'none' && !canPlus) {
                    canPlus = true;
                    ptd = nexttr;
                }
                nexttr = nexttr.nextSibling;
            }
            if (ptd) {
                ptd = ptd.cells[2];
                ptd.setAttribute("rowSpan", l); ptd.style.display = '';
            }
        }
    }
    tr.style.display = 'none';
}
function trShow(tr, isortable) {
    if (tr.style.display != 'none') return;
    if (!isortable) {
        var td1, td2, rspan, cspan = 1, ptd = null, l = 1,
            _cells = tr.cells, gid, prevtr, nexttr, canPlus = false;
        td1 = _cells[1]; td2 = _cells[2];
        gid = td1.getAttribute("gid");
        prevtr = tr.previousSibling;
        while (prevtr && prevtr.cells[1].getAttribute('gid') == gid) {
            if (prevtr.style.display != 'none') {
                ptd = prevtr;
                //break;
            }
            prevtr = prevtr.previousSibling;
        }

        cspan = td1.getAttribute("colSpan"); var _l1 = 1;
        //        if (ptd) {
        ////            var ocell = ptd.cells[1];
        ////            td1.style.display = 'none'; _l1 = tr.rowIndex - ptd.rowIndex + 1;
        ////            if (ocell.rowSpan < _l1) {
        ////                ocell.setAttribute("rowSpan", _l1);
        ////            }
        //        } else { // tr后面
        ////            nexttr = tr.nextSibling;
        ////            while (nexttr && nexttr.cells[1].getAttribute('gid') == gid) {
        ////                l++;
        ////                if (nexttr.style.display != 'none' && !canPlus) {
        ////                    canPlus = true; _l1 = l;
        ////                    ptd = nexttr;
        ////                }
        ////                nexttr = nexttr.nextSibling;
        ////            }
        ////            if (canPlus) _l1 += ptd.cells[1].rowSpan - 1;
        ////            td1.setAttribute("rowSpan", _l1);
        ////             td1.style.display = '';
        ////            if (canPlus) ptd.cells[1].style.display = 'none';
        //        }

        gid = td2.getAttribute("gid"); ptd = null; l = 1; canPlus = false; _l1 = 1;
        prevtr = tr.previousSibling;
        while (prevtr && prevtr.cells[2].getAttribute('gid') == gid) {
            if (prevtr.style.display != 'none') {
                ptd = prevtr;
                //break;
            }
            prevtr = prevtr.previousSibling;
        }
        //        if (ptd) {
        //            var ocell = ptd.cells[2];
        //            td2.style.display = 'none'; _l1 = tr.rowIndex - ptd.rowIndex + 1;
        //            if (ocell.rowSpan < _l1) {
        //                ocell.setAttribute("rowSpan", _l1);
        //            }
        //        } else { // tr后面
        //            nexttr = tr.nextSibling;
        //            while (nexttr && nexttr.cells[2].getAttribute('gid') == gid) {
        //                l++;
        //                if (nexttr.style.display != 'none' && !canPlus) {
        //                    canPlus = true; _l1 = l;
        //                    ptd = nexttr;
        //                }
        //                nexttr = nexttr.nextSibling;
        //            }
        //            if (cspan == 1) {
        //                if (canPlus) _l1 += ptd.cells[2].rowSpan - 1;
        //                td2.setAttribute("rowSpan", _l1);
        //                 td2.style.display = '';
        //                if (canPlus) ptd.cells[2].style.display = 'none';
        //            }
        //        }
    }
    tr.style.display = '';
}

function attmenu(p, o) { // 关注级别筛选
    var xmenu = $("#attrmenu");
    if (!xmenu[0]) return; $("#sortmenu").hide();
    var w = xmenu.width(), h = xmenu.height(), $tag = $(o), offset = $tag.offset(), _h = $tag.height(), _w = $tag.width(), _t = offset.top, _l = offset.left, tbody = p.dt[0], _idx = $tag.index(), str = "";
    if (xmenu.find("li").length == 3 && zhhyLevel) {
        var _arr = [];
        $.each(zhhyLevel, function (i, n) {
            if (n.lvlid != '-1') _arr.push('<li><input type="checkbox" name="lvlgrps" value="' + n.lvlname + '" />' + n.lvlname + '</li>');
        });
        $(_arr.join("")).insertAfter(xmenu.find("li:first"));
    }
    xmenu.find("input[type='checkbox']").unbind("click").bind("click", function () {
        if ($(this).parent().index() == 0) {
            if ($(this).attr("checked")) {
                xmenu.find("input[type='checkbox']").attr("checked", "checked");
            } else {
                xmenu.find("input[type='checkbox']").removeAttr("checked");
            }
        } else {
            if (!$(this).attr("checked")) xmenu.find("input[type='checkbox']:first").removeAttr("checked");
        }
    });

    if ($(document).scrollTop() + YH.dom.getViewportHeight() < _t + h) {
        _t = $(document).scrollTop() + YH.dom.getViewportHeight() - h - _h;
    }
    xmenu.css({ left: _l - w + _w, top: _t + _h + 6 }).show();
    $("#confirmlvl").unbind("click").bind("click", function () {
        str = "|YYY|";
        xmenu.find("input[type='checkbox']").each(function () {
            if ($(this).attr("checked")) str += $(this).val() + "|YYY|";
        });
        doFilterLevel(tbody, str, _idx, p.sortable);
        p.reOrder.call(p); p.focusDiv.hide();
    });
    $("#cancellvl").unbind("click").bind("click", function () {
        xmenu.hide();
    });
}
function doFilterLevel(tbody, str, idx, isortable) {
    $("#attrmenu").hide();
    var tr, lvl, i = 0, _rows = tbody.rows;
    for (; tr = _rows[i]; ++i) {
        lvl = tr.cells[idx].innerHTML;
        if (str == "|YYY|" || str.indexOf("|YYY|g_gall|YYY|") != -1) {
            trShow(tr, isortable);
        } else {
            if (lvl != "") {
                lvl = "|YYY|" + lvl + "|YYY|";
                if (str.indexOf(lvl) == -1) { // 移除
                    trHide(tr);
                } else if (str.indexOf(lvl) != -1) {
                    trShow(tr, isortable);
                }
            } else {
                if (str.indexOf("|YYY|g_gblank|YYY|") != -1) {
                    trShow(tr, isortable);
                } else {
                    trHide(tr);
                }
            }
        }
    }
}

function nodemenu(p, o) { // 关注节点筛选
    var xmenu = $("#nodemenu");
    if (!xmenu[0]) return; $("#sortmenu").hide();
    var w = xmenu.width(), h = xmenu.height(), $tag = $(o), offset = $tag.offset(), _h = $tag.height(), _w = $tag.width(), _t = offset.top, _l = offset.left, tbody = p.dt[0], _idx = $tag.index(), str = "";
    if (xmenu.find("li").length == 3 && zhhynode) {
        var _arr = [];
        $.each(zhhynode, function (i, n) {
            if (n.nodeid != '-1') _arr.push('<li><input type="checkbox" name="nodegrps" value="' + n.nodename + '" />' + n.nodename + '</li>');
        });
        $(_arr.join("")).insertAfter(xmenu.find("li:first"));
    }
    xmenu.find("input[type='checkbox']").unbind("click").bind("click", function () {
        if ($(this).parent().index() == 0) {
            if ($(this).attr("checked")) {
                xmenu.find("input[type='checkbox']").attr("checked", "checked");
            } else {
                xmenu.find("input[type='checkbox']").removeAttr("checked");
            }
        } else {
            if (!$(this).attr("checked")) xmenu.find("input[type='checkbox']:first").removeAttr("checked");
        }
    });

    if ($(document).scrollTop() + YH.dom.getViewportHeight() < _t + h) {
        _t = $(document).scrollTop() + YH.dom.getViewportHeight() - h - _h;
    }
    xmenu.css({ left: _l - w + _w, top: _t + _h + 6 }).show();
    $("#confirmnode").unbind("click").bind("click", function () {
        str = "|YYY|";
        xmenu.find("input[type='checkbox']").each(function () {
            if ($(this).attr("checked")) str += $(this).val() + "|YYY|";
        });
        doFilternode(tbody, str, _idx, p.sortable);
        p.reOrder.call(p); p.focusDiv.hide();
    });
    $("#cancellvlnode").unbind("click").bind("click", function () {
        xmenu.hide();
    });
}


function doFilternode(tbody, str, idx, isortable) {
    $("#nodemenu").hide();
    var tr, node, i = 0, _rows = tbody.rows;
    for (; tr = _rows[i]; ++i) {
        node = tr.cells[idx].innerHTML;
        if (str == "|YYY|" || str.indexOf("|YYY|g_gall|YYY|") != -1) {
            trShow(tr, isortable);
        } else {
            if (node != "") {
                node = "|YYY|" + node + "|YYY|";
                if (str.indexOf(node) == -1) { // 移除
                    trHide(tr);
                } else if (str.indexOf(node) != -1) {
                    trShow(tr, isortable);
                }
            } else {
                if (str.indexOf("|YYY|g_gblank|YYY|") != -1) {
                    trShow(tr, isortable);
                } else {
                    trHide(tr);
                }
            }
        }
    }
}

function statusmenu(p, o) { // 关注状态筛选
    var xmenu = $("#statusmenu");
    if (!xmenu[0]) return; $("#sortmenu").hide();
    var w = xmenu.width(), h = xmenu.height(), $tag = $(o), offset = $tag.offset(), _h = $tag.height(), _w = $tag.width(), _t = offset.top, _l = offset.left, tbody = p.dt[0], _idx = $tag.index(), str = "";
    if (xmenu.find("li").length == 3 && zhhystatu) {
        var _arr = [];
        $.each(zhhystatu, function (i, n) {
            if (n.staid != '-1') _arr.push('<li><input type="checkbox" name="statusgrps" value="' + n.statusname + '" />' + n.statusname + '</li>');
        });
        $(_arr.join("")).insertAfter(xmenu.find("li:first"));
    }
    xmenu.find("input[type='checkbox']").unbind("click").bind("click", function () {
        if ($(this).parent().index() == 0) {
            if ($(this).attr("checked")) {
                xmenu.find("input[type='checkbox']").attr("checked", "checked");
            } else {
                xmenu.find("input[type='checkbox']").removeAttr("checked");
            }
        } else {
            if (!$(this).attr("checked")) xmenu.find("input[type='checkbox']:first").removeAttr("checked");
        }
    });

    if ($(document).scrollTop() + YH.dom.getViewportHeight() < _t + h) {
        _t = $(document).scrollTop() + YH.dom.getViewportHeight() - h - _h;
    }
    xmenu.css({ left: _l - w + _w, top: _t + _h + 6 }).show();
    $("#confirmstatus").unbind("click").bind("click", function () {
        str = "|YYY|";
        xmenu.find("input[type='checkbox']").each(function () {
            if ($(this).attr("checked")) str += $(this).val() + "|YYY|";
        });
        doFilterstatus(tbody, str, _idx, p.sortable);
        p.reOrder.call(p); p.focusDiv.hide();
    });
    $("#cancelstatus").unbind("click").bind("click", function () {
        xmenu.hide();
    });
}
function doFilterstatus(tbody, str, idx, isortable) {
    $("#statusmenu").hide();
    var tr, lvl, i = 0, _rows = tbody.rows;
    for (; tr = _rows[i]; ++i) {
        lvl = tr.cells[idx].innerHTML;
        lvl = $(lvl).attr("alt");
        if (str == "|YYY|" || str.indexOf("|YYY|g_gall|YYY|") != -1) {
            trShow(tr, isortable);
        } else {
            if (lvl != "" && typeof lvl != "undefined") {
                lvl = "|YYY|" + lvl + "|YYY|";
                if (str.indexOf(lvl) == -1) { // 移除
                    trHide(tr);
                } else if (str.indexOf(lvl) != -1) {
                    trShow(tr, isortable);
                }
            } else {
                if (str.indexOf("|YYY|g_gblank|YYY|") != -1) {
                    trShow(tr, isortable);
                } else {
                    trHide(tr);
                }
            }
        }
    }
}

var taskRelations = (function () {
    var relStatus = [
    { relType: 'FS', relName: '完成-开始(FS)' },
    { relType: 'SS', relName: '开始-开始(SS)' },
    { relType: 'FF', relName: '完成-完成(FF)' },
    { relType: 'SF', relName: '开始-完成(SF)' }
    ], taskData = {}, nowTaskId;
    function relFormatter(value) {
        var str = "", i = 0, isck = false;
        for (; i < relStatus.length; ++i) {
            if (value == relStatus[i].relType) isck = true;
            str += '<option value="' + relStatus[i].relType + '"' + (isck ? " selected" : "") + '>' + relStatus[i].relName + '</option>';
            isck = false;
        }
        return str;
    }
    function showList(obj, taskId) {
        taskData = obj.getTaskData(taskId); nowTaskId = taskId;
        var tpl = [], _tr;
        box('<div style="padding:5px;"><div class="Reminder" style="margin:7px auto; width:250px;">点击任务列表选取需要的前置任务！</div><table id="grlist" class="tableborder" width="100%" bgcolor="#ffffff"><thead bgColor="#f7f7f7"><td>标识号</td><td>任务名称</td><td>类型</td><td>延隔时间</td><td>操作</td></thead><tbody></tbody></table></div>', { boxid: 'relts', title: '<span style="color:#009933">' + taskData.name + '</span> 的前置任务', contentType: 'html', cls: 'shadow-container3', submit_BtnName: "保 存", cancel_BtnName: "关 闭", pos: 'r-r', offset: [-50, 0],
            onOpen: function (o) {
                var _t = '', _d = '';
                if (taskData.taskRelations && taskData.taskRelations.length) {
                    obj.unSelRows();
                    $.each(taskData.taskRelations, function (i, n) {
                        _t = '<select>' + relFormatter(n.relTaskType) + '</select>';
                        _d = n.delayType == 0 ? 'd' : '%';
                        tpl.push('<tr tid="' + n.relTaskId + '"><td>' + n.relTaskIndex + '</td><td>' + n.relTaskName + '</td><td>' + _t + '</td><td><input type="text" style="width:30px;" value="' + n.delayCount + '" />' + _d + '</td><td><a href="javascript:;" class="mols">移除</a></td></tr>');
                        _tr = document.getElementById('tr' + n.relTaskId);
                        obj.SelRow_(_tr, n.relTaskId);
                    });
                }
                _t = tpl.join('');
                var _ct = $("#grlist tbody");
                _ct.html(_t);
                bindF(_ct, obj);
                _t = null;
            },
            submit_cb: function (o) {
                var _rows = $("#grlist tbody")[0].rows, str = '', // id，FS，112|Y|
                    _id, _tp, _dl, newrl = [], ri, uv = '';

                $.each(_rows, function (i, n) {
                    _id = n.getAttribute("tid"); _tp = $(n).find("select option:selected").val();
                    _dl = $(n).find("input").val();
                    ri = $(n).find("td:first").text(); var nm = $(n).find("td:eq(1)").text();
                    str += _id + ',' + _tp + ',' + _dl + '|Y|';
                    newrl.push({ "relTaskId": _id, "relTaskIndex": ri, "relTaskName": nm, "relTaskType": _tp, "delayType": 0, "delayCount": _dl });
                    uv += ri + _tp + ',';
                });

                obj.grid.mask(""); o.fbox.mask("处理中，请稍候...");
                $.ajax({
                    type: 'POST', url: commApi.saveTaskRelation,
                    data: { projId: obj.projId, planId: obj.secdPlanId, sucTaskId: nowTaskId, saveKey: str },
                    complete: function () { obj.grid.unmask(); o.fbox.unmask(); _reset(obj, taskId); },
                    success: function (rs) {
                        if (rs.Success) {
                            obj.updateFieldData(taskId, "taskRelations", newrl);
                            obj.updateView1(taskId, "taskRelations", uv.replace(/,$/g, ''));
                        } else {
                            $.tmsg("createRL", rs.Message, { infotype: 2 });
                        }
                    }
                });
            },
            onDestroy: function (o) {
                obj.setRelations = false;
                _reset(obj, nowTaskId);
            }
        })
    }
    function _reset(obj, taskId) {
        obj.unSelRows();
        $("#tr" + taskId).find("td[field='taskRelations']").trigger('click');
        obj.inputDiv.hide(); obj.focusDiv.hide();
    }
    function ckcycle(nowid, rl) {
        if (rl && rl.length) {
            var f = false;
            $.each(rl, function (i, n) {
                if (n.relTaskId == nowid) {
                    f = true;
                    return false;
                }
            });
            return f;
        }
        return false;
    }
    function reBuildList(obj, clicktaskid) {
        var _rows = obj.dt.find("tr[isSel='1']"), ct = $("#grlist tbody"), tpl = [], tid,
            ri, m = 0, tp, relTaskName, _t, relTaskType = 0, delayCount = 0, delayType = 0, _d, dt;
        if (!ct.length) return;
        $.each(_rows, function (i, n) {
            tid = n.id.replace('tr', '');
            dt = obj.getTaskData(tid);
            if (tid == nowTaskId || ckcycle(nowTaskId, dt.taskRelations)) return true;
            ri = $(n).find("td:eq(0)").text();
            relTaskName = dt.name;
            if (taskData.taskRelations) {
                for (; tp = taskData.taskRelations[m]; ++m) {
                    relTaskType = ''; delayCount = 0;
                    if (tp.relTaskId == tid) {
                        relTaskName = tp.relTaskName;
                        relTaskType = tp.relTaskType;
                        delayCount = tp.delayCount;
                        break;
                    }
                }
            }
            _d = delayType == 0 ? 'd' : '%';
            _t = '<select>' + relFormatter(relTaskType) + '</select>';
            tpl.push('<tr tid="' + tid + '"><td>' + ri + '</td><td>' + relTaskName + '</td><td>' + _t + '</td><td><input type="text" style="width:30px;" value="' + delayCount + '" />' + _d + '</td><td><a href="javascript:;" class="mols">移除</a></td></tr>');
        });
        tpl = tpl.join('');
        ct.html(tpl);
        bindF(ct, obj);
    }
    function bindF(c, obj) {
        c.find("a.mols").each(function () {
            $(this).click(function () {
                var p = this.parentNode.parentNode, tskid = p.getAttribute("tid"), _tr;
                _tr = document.getElementById('tr' + tskid);
                obj.unSelRow_(_tr, tskid);
                $(p).remove();
            });
        });
        c.find("input").each(function () {
            $(this).wknumberbox();
        });
    }
    return {
        init: function (obj, taskId) {
            showList(obj, taskId);
        },
        setRS: function (obj, clicktaskid) {
            reBuildList(obj, clicktaskid);
        }
    };
})();
function showHomeOrder(obj) {
    var orderObj = $(obj).parent().parent().find("input[name=homeOrder]");
    if ($(obj).attr("checked") == "checked") {
        orderObj.parent().css("display", "block");
    }
    else {
        orderObj.parent().css("display", "none");
    }
}

var zhhyPlanManage;
if (typeof zhhyPlanManage == "undefined") {
    zhhyPlanManage = {};
}
function PatternEdit(taskId, projId, flag, taskIds) {
    if (flag) {
        box('/PlanManage/PredefineFileSetting?taskId=' + taskId + '&projId=' + projId + '&expLibId=' + expLibId + '&r=' + Math.random(), { boxid: 'PredefineFileSetting', title: "任务附件上传批量设定", width: 800, contentType: 'ajax',
            onLoad: function (o) {
                o.db.find("#BtnaddGroup").click(function () {
                    var obj = o.fbox.find("#Form1");
                    //saveInfo(obj, taskId, projId);
                    zhhyPlanManage.saveInfoNew(obj, taskId, projId, taskIds);
                });
            },
            submit_cb: function (o) {
                    //return SaveAdd(o, taskId, projId);
            }
        });
    }
    else {
        box('/PlanManage/PredefineFileSetting?taskId=' + taskId + '&projId=' + projId + '&expLibId=' + expLibId + '&r=' + Math.random(), { boxid: 'PredefineFileSetting', title: "任务附件上传设定", width: 600, contentType: 'ajax',
            onLoad: function (o) {
                o.db.find("#BtnaddGroup").click(function () {
                    var obj = o.fbox.find("#Form1");
                    //saveInfo(obj, taskId, projId);
                    var flag = 1;
                    $.ajax({
                        url: "/home/GetSingleTableJson",
                        type: 'post',
                        async: false,
                        data: {
                            tbName: "ScheduledDeliver",
                            ps: -1,
                            cu: 1,
                            qu: 'db.ScheduledDeliver.distinct("_id",{"taskId":"' + taskId + '"})'
                        },
                        dataType: 'json',
                        error: function () {
                            $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
                        },
                        success: function (data) {
                            if (data.Success == false) {
                                alert(data.Message);
                            }
                            else {
                                $(data).each(function (i, n) {
                                    if ($("select[name=stageId]", o.db).val() == data[i].stageId && $("select[name=profId]", o.db).val() == data[i].profId && $("select[name=fileCatId]", o.db).val() == data[i].fileCatId) {
                                        flag = 2;
                                    }
                                });
                            } /// <reference path="sssubway.js" />

                        }
                    });
                    if (flag == 2) {
                        alert("已添加此组合！");
                        return false;
                    }

                    zhhyPlanManage.saveInfo(obj, taskId, projId);
                });
            }
                , submit_cb: function (o) {
                    //return SaveAdd(o, taskId, projId);
                }
        });
    }

}

zhhyPlanManage.saveInfo = function (obj, taskId, projId) {
    var formdata = $(obj).serialize();
    $.ajax({
        url: "/Home/SavePostInfo",
        type: 'post',
        data: formdata,
        dataType: 'json',
        error: function () {
            $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
        },
        success: function (data) {
            if (data.Success == false) {
                $.tmsg("m_jfw", data.Message, { infotype: 2 });
            }
            else {
                $.tmsg("m_jfw", "保存成功！", { infotype: 1 });
                PatternEdit(taskId, projId);
                // window.location.reload();
            }
        }
    });
}
zhhyPlanManage.saveInfoNew = function (obj, taskId, projId, taskIds) {
    var formdata = $(obj).serialize();
    $.ajax({
        url: "/Home/SaveDeliver?taskIds=" + taskIds,
        type: 'post',
        data: formdata,
        dataType: 'json',
        error: function () {
            $.tmsg("m_jfw", "未知错误，请联系服务器管理员，或者刷新页面重试", { infotype: 2 });
        },
        success: function (data) {
            if (data.Success == false) {
                $.tmsg("m_jfw", data.Message, { infotype: 2 });
            }
            else {
                $.tmsg("m_jfw", "保存成功！", { infotype: 1 });

                PatternEdit(taskId, projId, true, taskIds);
                // window.location.reload();
            }
        }
    });
}
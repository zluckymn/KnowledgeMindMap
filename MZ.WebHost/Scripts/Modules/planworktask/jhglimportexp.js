﻿/*
* importexp.js jhgl导入公司经验
* 2011-4-13 Qingbao.Zhao
*/
var oUntil = {
    getPositionForInput: function (ctrl) { // 单行文本框
        var CaretPos = 0;
        if (document.selection) { // IE Support
            ctrl.focus();
            var Sel = document.selection.createRange();
            Sel.moveStart('character', -ctrl.value.length);
            CaretPos = Sel.text.length;
        } else if (ctrl.selectionStart || ctrl.selectionStart == '0') {// Firefox support
            CaretPos = ctrl.selectionStart;
        }
        return (CaretPos);
    },
    getSelectionText: function () {
        if (window.getSelection) {
            return window.getSelection().toString();
        } else if (document.selection && document.selection.createRange) {
            return document.selection.createRange().text;
        }
        return '';
    }
};
$.fn.onumberbox = function (maxnum) {
    $(this).css({ imeMode: "disabled", textAlign: "center" });
    this.bind("keypress", function (e) {
        var kc = e.keyCode || e.which, inputstr = String.fromCharCode(kc), st = oUntil.getSelectionText(), v = this.value, pos = oUntil.getPositionForInput(this);
        if (st) {
            pos = v.indexOf(st); v = v.replace(st, "");
        }
        v = v.substr(0, pos) + inputstr + v.substr(pos);
        if (v.length > 1 && !/^(-)?\d+$/g.test(v) || v.length === 1 && !/^[-|\d]$/g.test(v) || /^0/.test(v)) return false;
    });
    this.bind("paste dragenter", function () {
        return false;
    });
};

var a3plan_impexp = (function () {
    var lck,
		urls = {
		    importExp: '/PlanManage/QuicklyLoadExperience/', // 导入公司经验
		    importExpFromPlan: '/PlanManage/QuicklyLoadExperienceJD/', // 导入公司经验
		    iExpLoad: '/home/PlanAndTaskList/', // 获取对应公司经验的任务结构
		    iExpSave: '/home/QuickyCreatePlanJHGL' // 导入到计划
		},
        taskStatus = ["待分解", "分解完成", "未开始", "进行中", "已完成"],
		tplv = '<tr><td>{rowindex}</td><td><div style="padding-left:{padleft}px;padding-right:5px;float:left"><img style="{icon}" src="/Content/images/DesignManage/ico-Expand.gif"></div><div style="float:left">{name}</div></td><td width="80">{ownerName}</td><td width="100">{planStartDate}</td><td width="100">{planEndDate}</td><td></td></tr>';
    function __initLoad(cfg) {
    }
    function __calcrs(dt, lvl, data) {
        var lck = 0, i = 0, len = data.length, hasChild = false;
        dt['statusName'] = taskStatus[dt['status']];
        dt['padleft'] = 16 * lvl;
        for (; i < len; ++i) {
            if (data[i].nodePid === dt.taskId) {
                hasChild = true;
                break;
            }
        }
        dt['icon'] = hasChild ? "cursor:pointer" : "visibility:hidden";
        if (dt['needSplit'] == 0) dt['spliterName'] = "";
        dt['lock'] = lck;
        return dt;
    }
    function __reOrder(tb) {
        var o = tb.find("span[name='cnum']");
        o.each(function (i) {
            $(this).text(i + 1);
        });
    }

    function __importExp(force, projID, fromPlan) { // 导入经验
        var isSalesPlan, isDeliveryPlan;
        var expData = [], _secdPlanId = -1, secdPlanId = 0, setoffset_year, setoffset_month, setoffset_day, isIgnorePerson, isIgnoreDate, isIgnorePassed, isContractPlan, planRemark;
        var _u = fromPlan ? urls.importExpFromPlan : urls.importExp;
        //
        isSalesPlan = false;
        isDeliveryPlan = false;
        if (typeof force == "string") {
            if (force == "isSalesPlan") {
                isSalesPlan = true;
                isDeliveryPlan = false;
            } else if (force == "isDeliveryPlan") {
                isSalesPlan = false;
                isDeliveryPlan = true;
            }
        }

        //typeof force == "string" ? zhhyMultiPlanManage.isSalesPlan = "isSalesPlan=1" : zhhyMultiPlanManage.isSalesPlan = "";

        var url = _u + secdPlanId + "?projID=" + projID;
        if (true == isSalesPlan) {
            url += "&isSalesPlan=1";
        }
        if (true == isDeliveryPlan) {
            url += "&isDeliveryPlan=1";
        }
        $.YH.box({
            target: url,
            title: '选择计划模板', width: 450,
            buttonNames: ['确定导入', '取消'],
            afterLoaded: function () {
                var $box = $(this);
                $box.find("li[secdPlanId]").each(function () {
                    $(this).click(function () {
                        _secdPlanId = $(this).attr("secdPlanId");
                        $box.find("li[secdPlanId]").removeClass("libg");
                        $(this).addClass("libg");
                        $box.mask("loading...");
                        $.ajax({
                            url: urls.iExpLoad, data: { secdPlanId: _secdPlanId }, cache: false,
                            success: function (data) {
                                $box.unmask();
                                data = data[0]
                                expData = data.taskList;
                                $("#manager").val(data.managerName);
                                $("#managerId").val(data.managerId);
                                $("#managerSysProfId").val(data.managerSysProfId);
                                if (data.managerId != curUserId) {
                                    $("#checkMe").attr("checked", "checked").val("1");
                                } else {
                                    $("#setMytoList").hide();
                                    $("#setMytoListProf").hide();
                                }
                                var tmp = "", _rs = expData, cc = [], _rowindex = 0;
                                function rd(pid, lv) {
                                    var dt, i = 0, _tid, _pid, tmp;
                                    for (; dt = _rs[i]; ++i) {
                                        _tid = dt.taskId; _pid = dt.nodePid;
                                        if (_pid === pid) {
                                            _rowindex++;
                                            var _cls = "", clrs = '', clre = '', pretasks = '', _url;

                                            dt["pretasks"] = pretasks; dt["cls"] = _cls;
                                            dt['clrs'] = clrs; dt['clre'] = clre;
                                            dt['padleft'] = 16 * lv;
                                            dt['icon'] = "cursor:pointer";
                                            dt["rowindex"] = _rowindex;
                                            cc.push(tplv.compileTpl(dt));
                                            rd(_tid, lv + 1);
                                        }
                                    }
                                }
                                rd(0, 0);
                                tmp = cc.join('');
                                if (tmp == "") tmp = "<tr><td colspan='3'>暂无内容</td></tr>";
                                $("#viewExp").find("tbody").html(tmp);
                            }
                        });
                    });
                });
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
                        YH.dom.scrollintoContainer(lastobj, $("#exp_clist"), true, true, {});
                        if (lastobj.tagName.toLowerCase() == "li") $(lastobj).trigger("click");
                    }
                });

                bindASearchableInput($("#manager"), $("#managerId"), $("#managerSysProfId"), projId, 0, true);
                $("#checkMe").click(function () {
                    if ($(this).attr("checked")) {
                        $(this).parent().parent().next().show();
                        $(this).val("1");
                    } else {
                        $(this).parent().parent().next().hide(); $(this).val("0");
                    }
                });

                var _cfirst = $box.find("li[secdPlanId]:first");
                _cfirst[0] && _cfirst.trigger("click");
                setoffset_year = $box.find("input[name='OffSetYear']");
                setoffset_month = $box.find("input[name='OffSetMonth']");
                setoffset_day = $box.find("input[name='OffSetDay']");
                isIgnorePerson = $box.find("input[name='isIgnorePerson']");
                isIgnoreDate = $box.find("input[name='isIgnoreDate']");
                isIgnorePassed = $box.find("input[name='isIgnorePassed']");
                planRemark = $box.find("textarea[name='remark']");
                setoffset_year.onumberbox(); setoffset_month.onumberbox(); setoffset_day.onumberbox();
            },
            ok: function () {
                var $box = $(this);
                if ($("#managerId").val() == -1) {
                    $.tmsg("m_loadexp", "请选择计划负责人！");
                    return false;
                }
                if ($("#takeTime").length > 0) {
                    if ($("#takeTime").val() == "") {
                        $.tmsg("m_loadexp", "请选择拿地时间！");
                        return false;
                    }
                }
                $("#newplan").validate({
                    submitHandler: function (form) {
                        $box.mask("载入中...");
                        var ser = $("#newplan").serialize(), _str = '';
                        if (!isIgnorePerson.prop("checked")) {
                            _str = "&isIgnorePerson=1";
                        }
                        if (!isIgnoreDate.prop("checked")) {
                            _str += "&isIgnoreDate=1";
                        }
                        if (isIgnorePassed.length && !isIgnorePassed.attr("checked")) {
                            _str += "&isIgnorePassed=1";
                        }
                        _secdPlanId = $("#selectExpLib").val();
                        $.ajax({
                            url: urls.iExpSave + "?" + ser + _str, data: { copySecPlanId: _secdPlanId, projId: projId, sourceSecPlanId: secdPlanId, remark: planRemark.val() }, type: 'POST',
                            error: function () {
                                hiAlert('未知错误，请联系服务器管理员，或者刷新页面重试', '保存失败');
                            },
                            success: function (data) {
                                if (data.Success) {
                                    $.tmsg("m_loadexp", "操作成功！页面跳转中...", { infotype: 1 });
                                    window.location.reload();
                                } else {
                                    $box.unmask();
                                    $.tmsg("m_loadexp", data.Message, { infotype: 2 });
                                }
                            }
                        });
                    }
                });
                $("#newplan").submit();
                return false;
            }
        });
        //******************************************************************
    }
    return {
        init: function (cfg) {
            __initLoad(cfg || {});
        },
        importExp: function (force, projID) { // 导入公司经验
            __importExp(force, projID, false);
        },
        importExpFromPlan: function (force, projID) { // 直接从计划导入
            __importExp(force, projID, true);
        }
    }
})();


var zhhya3plan = (function () {
    var urls = {
        planInfo: '/PlanManage/PlanEdit',
        savePlanInfo: '/Home/SavePlanInfo',
        changestatus: '/Home/ChangePlanStatus',
        hasCompleted: '/Home/HasIncompleteTask'
    };
    return {
        createPlan: function (t, pos, force, isJD) {
            function __smit(o, tt) {
                $("#planForm").validate({
                    submitHandler: function (form) {
                        var dt = $("#planForm").serialize(), _e = $("#endData").val(),
							_name = $("#name").val(), _manager = $("#manager").val(), _s = $("#startData").val();
                        o.fbox.mask("保存中，请稍候...");
                        $.ajax({
                            type: 'POST',
                            url: urls.savePlanInfo + "?r=" + Math.random(),
                            data: dt,
                            error: function () {
                                $.tmsg('cplan1', '未知错误，请联系服务器管理员，或者刷新页面重试', { infotype: 2 });
                            },
                            success: function (data) {
                                if (data.Success) {
                                    $.tmsg("cplan1", "操作成功！", { infotype: 1 });
                                    if (pos) {
                                        $("#editpname" + t).text(_name);
                                        $("#edituname" + t).html(_manager);
                                        $("#editsdate" + t).html(_s);
                                        $("#editedate" + t).html(_e);
                                        o.fbox.unmask();
                                        o.destroy();
                                        //window.location.href = '/DesignManage/MultiPlanManage?projId=' + projId;
                                        window.location.reload();
                                    } else {
                                        $.tmsg("m_loadexp", "操作成功！页面跳转中...", { infotype: 1 });
                                        window.location.reload();
                                        //window.location.href = '/DesignManage/MultiPlanManage?projId=' + projId;
                                        //o.fbox.unmask();
                                    }
                                } else {
                                    $.tmsg("cplan1", data.Message, { infotype: 2 });
                                    o.fbox.unmask();
                                }
                            }
                        });
                    }
                });
                $("#planForm").submit();
                return false;
            }
            var isTempContractPlan = "";

            if (typeof isContractPlan != "undefined") {
                isTempContractPlan = isContractPlan;
            }
            var isSalesPlan = false;
            var isDeliveryPlan = false;
            if (typeof force == "string") {
                if (force == "isSalesPlan") {
                    isSalesPlan = true;
                    isDeliveryPlan = false;
                } else if (force == "isDeliveryPlan") {
                    isSalesPlan = false;
                    isDeliveryPlan = true;
                }
            }
            var url = urls.planInfo + "?projId=" + projId + "&secdPlanId=" + t + "&isContractPlan=" + isTempContractPlan + "&_t=" + new Date().getTime();
            if (isSalesPlan) {
                url += "&isSalesPlan=1";
            }
            if (isDeliveryPlan) {
                url += "&isDeliveryPlan=1";
            }
            //url = urls.planInfo + "?projId=" + projId + "&secdPlanId=" + t + "&isContractPlan=" + isTempContractPlan + "&_t=" + new Date().getTime()
            box(url, { boxid: 'a3_plan', title: '计划基本信息', contentType: 'ajax', modal: true, fixable: false, submit_BtnName: "保存", cls: 'shadow-container', width: 400,
                onLoad: function (o) {
                    var _o1 = o.fbox.find("#managerIds"), _o2 = -1, inputfiled = _o1.prev();
                    bindASearchableInput(inputfiled, _o1, _o2, projId, 2, false, false);

                    //var _userid = $("#g_userId").val(); // 当前我的用户id
                    $("#startData").click(function () {
                        WdatePicker({ maxDate: $("#endData").val().replace("-", "/") });
                    });
                    $("#endData").click(function () {
                        WdatePicker({ minDate: $("#startData").val().replace("-", "/") });
                    });
                    $("#actualStartDate").click(function () {
                        WdatePicker();
                    });
                    if ($("#isNewPlan").val() == true) {
                        bindASearchableInput($("#manager"), $("#managerId"), $("#managerProfId"), projId, 0, true);
                    } else {
                        bindASearchableInput($("#manager"), $("#managerId"), $("#managerProfId"), projId, 0);
                        $("#managerProfId").parent().parent().hide();
                    }
                    //});
                    $("#checkMe").click(function () {
                        if ($(this).attr("checked")) {
                            $(this).parent().parent().next().show();
                        } else {
                            $(this).parent().parent().next().hide();
                        }
                    });
                },
                submit_cb: function (o) {
                    var ids = $("#managerIds").val();
                    if (ids == -1 || ids == "undefined" || ids == 0) {
                        $.tmsg("cplan1", "请选择负责计划人！");
                        return false;
                    }
                    __smit(o, false);
                    return false;
                },
                onDestroy: function (o) {
//                    if (force) {
//                        if (isJD) {
//                            newbox3(projId, true);
//                        } else {
//                            newbox(projId, true);
//                        }
//                    }
                }
            });
        },
        changeStatus: function (obj, xd) {
            var secdPlanId = $(obj).attr("data-planid"), onowstat = $("#nowstats" + secdPlanId), nst = onowstat.attr("nst"), newstat = $(obj).attr("newstat"), tip = "";
            var tpl = '<div class="contain"><form id="planChangeForm1" method="post" action=""><div style="font-size:14px;font-weight:bold;margin:5px 8px" id="chgstitle"></div><table width="100%" style=" margin:8px"><tr><td align="left" valign="top"><font color="#FF3300">*</font>计划状态变更说明:</td><td><textarea name="reason" id="reason" class="textarea_01" title="计划状态变更说明" style="width:250px; height:100px"></textarea></td></tr></table></form></div>',
				strRS = '<table width="100%" bgcolor="#FFFFFF" style="margin-bottom:20px"><tr><td width="60" valign="top"><div class="picdivus"><img src="{imgSrc}" width="50" height="50" /></div></td><td valign="top"><div style="line-height:23px; background-color:#f2f2f2; padding-left:5px">发起人：<font color="#0187dc">{changeUser}</font>&nbsp;&nbsp;&nbsp;&nbsp;时间：<font color="#0187dc">{date}</font></div><div class="hb-main">{reason}</div></td></tr></table>', btn = "", _tp = "";
            $.ajax({
                url: urls.hasCompleted + "?_t=" + Math.random(), data: { planId: secdPlanId, status: newstat },
                success: function (data) {
                    data = data.Data;
                    if (data.success) {
                        var flag = false, batchFis = false;
                        if (data.hasIncompleteTask) { // 存在未完成
                            if (newstat == "Completed") {
                                tip = "该计划下尚有任务未完成！无法完成计划！";
                                flag = true;
                            } else {
                                tip = "该计划下尚有待分解的任务！确定强制启动计划吗？"; btn = "强制启动计划"; _tp = "启动";
                                batchFis = true;
                            }
                        } else {
                            if (newstat == "Completed") {
                                tip = "确定完成计划吗？"; btn = "确定完成计划"; _tp = "完成";
                            } else {
                                if (nst == "2") {
                                    tip = "确定重启计划吗？"; btn = "确定重启计划"; _tp = "重启";
                                } else {
                                    tip = "确定启动计划吗？"; btn = "确定启动计划"; _tp = "启动";
                                    batchFis = true;
                                }
                            }
                        }
                        if (flag) {
                            $.tmsg("m_stat", tip);
                            return false;
                        }
                        box(tpl, { boxid: 'changePlan1', title: btn, contentType: 'html', cls: 'shadow-container', width: 400, submit_BtnName: btn, modal: true,
                            onOpen: function (o) {
                                o.db.find("#chgstitle").html(tip);
                                var d = new Date(), _y = d.getFullYear(), _m = d.getMonth() + 1, _d = d.getDate();
                                o.db.find("textarea").val(_y + "年" + _m + "月" + _d + "日 " + _tp + "计划：\r\n");
                            },
                            submit_cb: function (o) {
                                $("#planChangeForm1").validate({
                                    submitHandler: function (form) {
                                        var dt = $("#planChangeForm1").serialize();
                                        o.fbox.mask("处理中，请稍候...");
                                        $.ajax({
                                            type: 'POST',
                                            url: urls.changestatus,
                                            data: dt + "&planId=" + secdPlanId + "&status=" + newstat,
                                            success: function (data) {
                                                o.fbox.unmask();
                                                if (data.Success) {
                                                    $.tmsg("m_cgplan", "操作成功！", { infotype: 1 });
                                                    onowstat.attr("nowstat", newstat).html(a3Stat.plan[newstat]);
                                                    $(obj).attr("newstat", "Completed").val("完成");
                                                    if (newstat == 'Completed') {
                                                        $(obj).val("修订").attr("newstat", "Processing");
                                                    }
                                                    // $("#cgst_factstart" + secdPlanId).text(data.plan.actualStartDate);
                                                    // $("#cgst_factend" + secdPlanId).text(data.plan.actualEndDate);

                                                } else {
                                                    $.tmsg("m_cgplan", data.Message, { infotype: 2 });
                                                }
                                                o.destroy();
                                            }
                                        });
                                    }
                                });
                                $("#planChangeForm1").submit();
                                return false;
                            }
                        });
                    } else {
                        $.tmsg("m_stat", data.Message, { infotype: 2 });
                    }
                }
            });
        }
    }
})();
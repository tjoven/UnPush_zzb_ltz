var device = '';// 苹果打包用
var mei = '';// 苹果打包用
var sys_ctx = '';// 苹果打包用
// 服务器端oainfo的名称
var oainfo = "/oainfo";
// 文件目录，电脑端开发用，替换掉不用加载的js文件，否则报错
var sys_gcml = "/wap_html_ltz";
// 是否安卓系统
var isAndriod = (/android/gi).test(navigator.appVersion);
// 是否ios系统
var isIphone = (/iPad|iphone/gi).test(navigator.userAgent);
//开发使用、、、、、、、、、、、、、、、
isAndriod=true;
isIphone=false;
//、、、、、、、、、、、、、、、、、、、、、、、、、
if (isAndriod) {
	sys_ctx = window.hosturl.getHostUrl(); // 安卓打包
} else if (isIphone) {
	device = '%@';// 苹果打包用
	mei = '%@';// 苹果打包用
	sys_ctx = '%@';// 苹果打包用
} else {
    sys_ctx = window.location.protocol + "//" + window.location.host + "/ltzfwpt2";// 电脑端
}
// 是否是pad，如果是pad需要转换页面,外壳自动赋值
var isPad = false;
// 是否pc
var isPC = !(isAndriod || isIphone || isPad);
isPC = false;

// 当前访问页面url（pad端从壳上加载无法获取url参数）
var sys_URLParams = "";
// 是否是桌面 用于pad端桌面
var isDesk = false;

// 是否是聊天页面
var isChatPage = false;
// 回话id
var sys_imYhid = "";

// 页面基础js，动态加载的时候不加载以下css
var sys_BaseJs = "../gmu/js/gmu.js,../js/ict.js,../js/local.js,../js/list.js,../js/pad.js";
var sys_BaseCss = "../gmu/css/gmu.css,../css/base.css,../css/list.css";

// 在页面底部自动添加菜单
var sys_addMeun = true;

// 手机端页面底部添加按钮id与url对应关系，url要全路径，进入某个页面下方亮色
var sys_bottomMenuURL = {
	'div_index' : {
		url : 'main.html',
		mc : '首页'
	},
//	'div_firstAid' : {
//		url : 'main.html',
//		mc : '急救'
//	},
	'div_org' : {
		url : 'ltz/address/lxr.html',
		mc : '电话簿'
	},
	'div_notice' : {
		url : 'ltz/notice/block.html',
		mc : '通知公告'
	},
//	'div_org' : {
//		url : "ltz/address/lxr.html",
//		mc : '通讯录'
//	},
	'div_setting' : {
		url : 'oa/system/grzx.html',
		mc : '设置'
	}
};
// pad端菜单信息
var sys_padMenuInfo = {
	'客户' : {
		url : 'pad.html?left=' + escape('crm/client/list.html') + "&right="
				+ escape('crm/client/add.html'),
		img : 'img/left_gzjh.png'
	}
};
// 桌面的URL
var phoneDeskURL = "main.html";

var padDeskUrl = 'pad.html?left=' + escape('crm/client/list.html') + "&right="
		+ escape('crm/client/add.html');

var text2face = {
	"/微笑" : 1,
	"/撇嘴" : 2,
	"/色" : 3,
	"/发呆" : 4,
	"/得意" : 5,
	"/流泪" : 6,
	"/害羞" : 7,
	"/闭嘴" : 8,
	"/睡" : 9,
	"/大哭" : 10,
	"/尴尬" : 11,
	"/发怒" : 12,
	"/调皮" : 13,
	"/呲牙" : 14,
	"/惊讶" : 15,
	"/晕" : 16,
	"/难过" : 17,
	"/酷" : 18,
	"/冷汗" : 19,
	"/抓狂" : 20,
	"/吐" : 21,
	"/偷笑" : 22,
	"/可爱" : 23,
	"/白眼" : 24,
	"/傲慢" : 25,
	"/饥饿" : 26,
	"/困" : 27,
	"/惊恐" : 28,
	"/流汗" : 29,
	"/憨笑" : 30,
	"/大兵" : 31,
	"/糗大了" : 32,
	"/奋斗" : 33,
	"/咒骂" : 34,
	"/疑问" : 35
};
var face2text = {
	1 : "/微笑",
	2 : "/撇嘴",
	3 : "/色",
	4 : "/发呆",
	5 : "/得意",
	6 : "/流泪",
	7 : "/害羞",
	8 : "/闭嘴",
	9 : "/睡",
	10 : "/大哭",
	11 : "/尴尬",
	12 : "/发怒",
	13 : "/调皮",
	14 : "/呲牙",
	15 : "/惊讶",
	16 : "/晕",
	17 : "/难过",
	18 : "/酷",
	19 : "/冷汗",
	20 : "/抓狂",
	21 : "/吐",
	22 : "/偷笑",
	23 : "/可爱",
	24 : "/白眼",
	25 : "/傲慢",
	26 : "/饥饿",
	27 : "/困",
	28 : "/惊恐",
	29 : "/流汗",
	30 : "/憨笑",
	31 : "/大兵",
	32 : "/糗大了",
	33 : "/奋斗",
	34 : "/咒骂",
	35 : "/疑问"
};
var textJson = [ "/微笑", "/撇嘴", "/色", "/发呆", "/得意", "/流泪", "/害羞", "/闭嘴", "/睡",
		"/大哭", "/尴尬", "/发怒", "/调皮", "/呲牙", "/惊讶", "/晕", "/难过", "/酷", "/冷汗",
		"/抓狂", "/吐", "/偷笑", "/可爱", "/白眼", "/傲慢", "/饥饿", "/困", "/惊恐", "/流汗",
		"/憨笑", "/大兵", "/糗大了", "/奋斗", "/咒骂", "/疑问" ];

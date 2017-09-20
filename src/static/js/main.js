function fn(){
	console.log('It works!!');
}

function getAdminInfo() {
	$.post('/adminDongfangSHEN/isLogin',{},function(res){
		console.log(res);
	},'json');
}

$(document).ready(function(){
	getAdminInfo();
});
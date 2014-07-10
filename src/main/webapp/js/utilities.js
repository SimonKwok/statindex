//扩展String.format函数
if (!String.prototype.format) {
	String.prototype.format = function() {
		var args = arguments;
		return this.replace(/{(\d+)}/g, function(match, number) {
			return typeof args[number] != 'undefined' ? args[number] : match;
		});
	};
}
//经纬度字符串转换为path数组
function parseLatLng(latLngs){
	var paths = [], latLng = "";
	if (!!latLngs && latLngs.length>0){
		for (var idx = latLngs.length - 1; idx >= 0; idx--) {
			var list = latLngs[idx].split(";");
			for (var i = list.length - 1; i >= 0; i--) {
				latLng = list[i].split(",");
				var lat = latLng[1], lng = latLng[0];
				if ((!isNaN(lat)) && (!isNaN(lng))) {
					paths.push(new google.maps.LatLng(lat, lng));
				}
			}
		}
	}
	return paths;
}
//string to LatLng
function createLatLngObject(latLng) {
	var latlngStr = latLng.split(",");
	var lat = parseFloat(latlngStr[1]);
	var lng = parseFloat(latlngStr[0]);
    return new google.maps.LatLng(lat, lng);
}
//
function getByProp(array,prop,val){
	for ( var i = 0, n = array.length; i < n; i++) {
		if (cityDatas[i][prop] == val) {
			return cityDatas[i];
		}
	}
	return null;
}
//从数组里根据字段名和值定位
function indexByProp(array,prop,val){
	for ( var i = 0, n = array.length; i < n; i++) {
		if (cityDatas[i][prop] == val) {
			return i;
		}
	}
	return -1;
}
//排序，排序字段prop，flag降序为1，升序为-1
function sortByProp(array,prop,flag){
	flag = flag || 1;
	array.sort(function(a,b){return (b[prop]-a[prop]) * flag;});
}
//根据字段过滤
function filtByProp(array,prop,vals){
	var tmpCityNames = [];
	for ( var i = 0, n = array.length; i < n; i++) {
		if (vals.indexOf(array[i][prop])>-1) {
			tmpCityNames.push(array[i]);
		}
	}
	return tmpCityNames;
}
//根据城市名称获取同级城市名称: 正负diff%
function getSameLevelCitiesByPercent(array,city,indexcode,lvs,diff){
	var data = getByProp(array,"NAME",city);
	var val = data[indexcode];
	if(val==0) return null;
	var min = val * (1 - diff);
	var max = val * (1 + diff);
	var cities = [];
	for (i = 0, n = array.length; i < n; i++) {
		var v = array[i][indexcode];
		if(array[i].NAME==city||
			(lvs.indexOf(array[i]["LV"])>-1 && min<=v && v<=max)){
			cities.push(array[i].NAME);
		}
	}
	return cities;
}

//查询url
var QueryString = function() {
	var query_string = {};
	var query = window.location.search.substring(1);
	var vars = query.split("&");
	for ( var i = 0; i < vars.length; i++) {
		var pair = vars[i].split("=");
		// If first entry with this name
		if (typeof query_string[pair[0]] === "undefined") {
			query_string[pair[0]] = pair[1];
			// If second entry with this name
		} else if (typeof query_string[pair[0]] === "string") {
			var arr = [ query_string[pair[0]], pair[1] ];
			query_string[pair[0]] = arr;
			// If third or later entry with this name
		} else {
			query_string[pair[0]].push(pair[1]);
		}
	}
	return query_string;
}();



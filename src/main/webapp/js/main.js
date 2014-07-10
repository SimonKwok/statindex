//常量区
var ENTITY_TYPE_PROVINCE = 0;
var ENTITY_TYPE_CITY = 1;
var ENTITY_TYPE_DISTRICT = 2;
//变量区(prezoom=之前的缩放比例；idx=当前指标号)
var map,infoBubble,datumcity='深圳',prezoom=1,idx=0,phase=0;
var allProvinces = {},allCities = {};
var allEntities = [];

// entity
function MyEntity(loc,d,mvc,t){
	this.location = loc;
	this.data = d;
	this.mvcObject = mvc;
	this.type = t;
	this.selected = false;
	this.hover = false;
	this.relatedType = null;
	this.relatedMvcObject = null;
}
MyEntity.prototype.updateUI = function(){
	var i = (this.selected||this.hover)?1:0;
	this.mvcObject.setOptions(EntityUIOptions[this.type][i]);
	if(this.relatedMvcObject){
		this.relatedMvcObject.setOptions(EntityUIOptions[this.relatedType][i]);
	}
}

//创建省份多边形
function createProvincePolygon(province,latLngs) {
	if (!latLngs || latLngs.length == 0) {
		return null;
	}
	var paths = parseLatLng(latLngs);
	var provincePolygon = new google.maps.Polygon(UIOptions.provinceOptions);
	var entity = new MyEntity(province,getByProp(cityDatas,"NAME",province.n),provincePolygon,ENTITY_TYPE_PROVINCE);
	provincePolygon["USER-OBJECT"] = entity;
	provincePolygon.setPaths(paths);
	provincePolygon.setMap(map);
	provincePolygon["center"] = createLatLngObject(province.g);
	google.maps.event.addListener(provincePolygon, "click", cityMouseClick);
	google.maps.event.addListener(provincePolygon, "mousemove", cityMouseOver);
	google.maps.event.addListener(provincePolygon, "mouseout", cityMouseOut);
	return entity;
}
//创建城市圆圈
function createCityCircle(cityData){
	var loc = getCityLocation(cityData["PROVINCE"],cityData["NAME"]);
	if (!!loc) {
		var cityCircle = new google.maps.Circle(UIOptions.cityOptions);
		var entity = new MyEntity(loc,cityData,cityCircle,ENTITY_TYPE_CITY);
		cityCircle["USER-OBJECT"] = entity;
		cityCircle.setOptions({
			map : map,
			center : createLatLngObject(loc.g),
			radius : calcCityRadius(cityData,getCityRadiusCoef())
		});
		google.maps.event.addListener(cityCircle, "click", cityMouseClick);
		google.maps.event.addListener(cityCircle, "mousemove", cityMouseOver);
		google.maps.event.addListener(cityCircle, "mouseout", cityMouseOut);
		
		if(!!loc.districts){
			for (i = 0, n = loc.districts.length; i < n; i++) {
				var districtEntity = createProvincePolygon(loc.districts[i],loc.districts[i].b);
				if(!!districtEntity){
					//districtEntity.mvcObject.setMap(null);
					districtEntity.type = ENTITY_TYPE_DISTRICT;
					allEntities.push(districtEntity);
				}
			}
		}
		//直辖市
		if(loc.bb){
			var provinceEntity = createProvincePolygon(loc,loc.bb);
			if(!!provinceEntity){
				entity.relatedType = provinceEntity.type;
				entity.relatedMvcObject = provinceEntity.mvcObject;
				entity.relatedMvcObject["USER-OBJECT"] = entity;
			}
		}
		return entity;
	}
	return null;
}
//城市点击事件
function cityMouseClick(event){
	var entity = this["USER-OBJECT"];
	entity.selected = !entity.selected;
	entity.updateUI();
	hideAllDropdownList();
}
//城市鼠标上移
function cityMouseOver(event){
	var entity = this["USER-OBJECT"];
	entity.hover = true;
	updateInfoBubble(this.center,calcInfoHTML(entity));
	entity.updateUI();
}
//城市鼠标下移
function cityMouseOut(event){
	var entity = this["USER-OBJECT"];
	entity.hover = false;
	entity.updateUI();
}
//更新城市图标半径
function updateCityRadius(){
	var coef = getCityRadiusCoef();
	for ( var i = 0, n = allEntities.length; i < n; i++) {
		var entity = allEntities[i];
		if(entity.type == ENTITY_TYPE_CITY){
			var cityCircle = entity.mvcObject;
			cityCircle.setOptions({
				radius : calcCityRadius(entity.data,coef)
			});
		}
	}
}
//更新信息框
function updateInfoBubble(loc,msg){
	if (!infoBubble.isOpen()) {
		infoBubble.open(map);
	}
	infoBubble.setPosition(loc);
	infoBubble.setContent(msg);
	infoBubble.updateContent_();
	infoBubble.redraw_();
}
//计算城市图标半径系数
function getCityRadiusCoef(){
	return indexes[idx].R_COEF / Math.max(1,(map.getZoom()-5));
}
//计算城市图标半径
function calcCityRadius(data,coef){
	var val = getDataValue(data,indexes[idx],phase);
	return Math.sqrt(val)* coef;
}
//计算信息框内容
function calcInfoHTML(entity){
	var data = entity.data;
	var index = indexes[idx];
	var val = getDataValue(data,index,phase);
	var phasenm = isNaN(phase)?"":("("+phase+index.PHASENAME+")");
	var isDatum = data.NAME==datumcity;
	var content = '<div class="phoney-text"><span class="phoney-title">'+data.NAME + '</span><br/>';
	content += '<nobr><span class="phoney-label">'+index.NAME+phasenm+':  </span><span class="phoney-number">'+val+'</span><span class="phoney-label">'+index.UNIT+'</span></nobr>';
	if(!!datumcity){
		var datumval = getDataValue(getByProp(cityDatas,"NAME",datumcity),index,phase);
		if(!!datumval){
			if(index.UNIT == '%'){
				content += '<div><span class="phoney-label">比{0}{1}{2}{3}%</span></div>'.format(datumcity,isNaN(phase)?"":"同期",val<datumval?'低':'高',(val-datumval).toFixed(2));
			}else{				
				content += '<div><span class="phoney-label">相当于{0}{1}的{2}%</span></div>'.format(datumcity, isNaN(phase)?"":"同期",(100.0 * val/datumval).toFixed(2) );
			}
		}
	}
	content += '</div>';
	
	var chart = '<div class="phoney-toolbar">';
	if(!isNaN(phase)){
		chart += '<a id="trendbtn" target="_blank" href="trendchart.html?t={0}&n={1}&i={2}" title="趋势图" ></a>'.format(entity.type, data.NAME,idx)
	}else{
		chart += '<img src="./images/trend.png" style="margin-right:5px"/>'
	}
	chart +='<a id="comparebtn" target="_blank" href="comparechart.html?i={0}&p={1}&n={2}" title="相近省市对比图" ></a>'.format(idx,phase,data.NAME);
	chart +='<a id="datumbtn" style="display:{0}" href="javascript:datumBtnClick(\'datumbtn\',\'{1}\');" title="设置为基准" ></a>'.format(isDatum?"none":"inline-block",data.NAME);
	chart +='<a id="datumbtn-selected" style="display:{0}" href="javascript:datumBtnClick(\'datumbtn-selected\',\'{1}\');" title="取消基准设置" ></a>'.format(isDatum?"inline-block":"none",data.NAME);
	chart +='</div>';
	return content+ chart;
}
//
function datumBtnClick(datumbtnid,city){
	if(datumbtnid=='datumbtn'){
		datumcity = city;
		document.getElementById("datumbtn").style.display = "none";
		document.getElementById("datumbtn-selected").style.display = "inline-block";
	}else{
		datumcity = null;
		document.getElementById("datumbtn-selected").style.display = "none";
		document.getElementById("datumbtn").style.display = "inline-block";
	}
}
//显示深圳行政区划
function showShenzhenDistricts(){
	var szEntity = allCities["深圳"];
	szEntity.mvcObject.setMap(null);
	/*for (i = 0, n = allEntities.length; i < n; i++) {
		var entity = allEntities[i];
		if(entity.type == ENTITY_TYPE_PROVINCE){
			entity.mvcObject.setMap(null);
		}else if(entity.type == ENTITY_TYPE_DISTRICT){
			entity.mvcObject.setMap(map);
		}
	}*/
}
//隐藏深圳行政区划
function hideShenzhenDistricts(){
	var szEntity = allCities["深圳"];
	szEntity.mvcObject.setMap(map);
	/*for (i = 0, n = allEntities.length; i < n; i++) {
		var entity = allEntities[i];
		if(entity.type == ENTITY_TYPE_PROVINCE){
			entity.mvcObject.setMap(map);
		}else if(entity.type == ENTITY_TYPE_DISTRICT){
			entity.mvcObject.setMap(null);
		}
	}*/
}
//创建控制栏
function createToolbar() {
	createIndexDropdown();
	createPhaseDropdown();
	createCityDropdown();
	//createOptionDropdown();
}
function hideAllDropdownList(){
	hideDropdownList('idxControl');
	hideDropdownList('phaseControl');
	hideDropdownList('cityControl');
}
//创建指标下拉框
function createIndexDropdown() {
	var optionDivs = [];
	for (i = 0, n = indexes.length; i < n; i++) {
		var indexItem = indexes[i];
		var divOptions = {
			gmap : map,
			name : indexItem.NAME,
			title : indexItem.NAME,
			id : "idx-" + i,
			action : indexItemClick
		}
		optionDivs.push(new optionDiv(divOptions));
	}
	
	return new dropDownControl({
		gmap : map,
		position : google.maps.ControlPosition.TOP_CENTER,
		name : 'GDP',
		id : 'idxControl',
		title : '点击选择指标',
		width : "150px",
		dropDown : new dropDownOptionsDiv({
			items : optionDivs,
			id : "idxControlDiv"
		})
	});
}
//点击指标选项
function indexItemClick(event){
	var label = document.getElementById('idxControl-label');
	if(!!label)label.innerHTML = this.innerHTML;
	hideDropdownList('idxControl');
	var idx0 = this.id.substr(4);
	if(idx!=idx0){
		idx = idx0;
		fireIndexChanged();
	}
}
//指标变更
function fireIndexChanged(){
	updatePhaseDowndown();
	updateCityRadius();
}
//创建阶段下拉框
function createPhaseDropdown() {
	for (var j = 0, n = indexes.length; j < n; j++) {
		var index = indexes[j];
		createphaseControlOptionDivs(index);
	}
	var optionDivs = indexes[idx]["phaseControlOptionDivs"];
	new dropDownControl({
		gmap : map,
		position : google.maps.ControlPosition.TOP_CENTER,
		name : optionDivs[0].innerHTML,
		id : 'phaseControl',
		title : '点击选择'+indexes[idx].PHASENAME,
		width : "70px",
		dropDown : new dropDownOptionsDiv({
			items : optionDivs,
			id : "phaseControlDiv"
		})
	});
	phase = optionDivs[0].id.substr(6);
}
function createphaseControlOptionDivs(index) {
	index["phaseControlOptionDivs"] = [];
	for (var i = index.PHASES.length-1; i >=0 ; i--) {
		var phs = index.PHASES[i];
		var optionName = isNaN(phs)?phs:(phs+index.PHASENAME);
		var divOptions = {
				gmap : map,
				name : optionName,
				title : optionName,
				id : "phase-" + phs,
				action : phaseItemClick
		}
		index["phaseControlOptionDivs"].push(new optionDiv(divOptions));
	}
}
//更新阶段下拉框选项
function updatePhaseDowndown(){
	document.getElementById('phaseControl').title = '点击选择'+indexes[idx].PHASENAME;
	var phaseControlDiv = document.getElementById('phaseControlDiv');
	phaseControlDiv.innerHTML = "";
	var optionDivs = indexes[idx]["phaseControlOptionDivs"];
	for (var j = 0, n = optionDivs.length; j < n; j++) {
		phaseControlDiv.appendChild(optionDivs[j]);
	}
	updatePhaseItem(optionDivs[0]);
}
//点击阶段选项
function phaseItemClick(event){
	updatePhaseItem(this);
}
function updatePhaseItem(item){
	var label = document.getElementById('phaseControl-label');
	if(!!label)label.innerHTML = item.innerHTML;
	hideDropdownList('phaseControl');
	var phase0 = item.id.substr(6);
	if(phase!=phase0){
		phase = phase0;
		firePhaseChanged();
	}
}
//阶段变更
function firePhaseChanged(){
	updateCityRadius();
}

function createCityDropdown(){
	var optionDivs = [];
	optionDivs.push(new separator());
	optionDivs.push(new optionDiv({
		gmap : map,
		name : '地区对比',
		title : '点击查看地区对比图',
		id : "btn-index-compare",
		action : compareIndex
	}));
	
	return new dropDownControl({
		gmap : map,
		position : google.maps.ControlPosition.TOP_CENTER,
		name : '地区对比',
		id : 'cityControl',
		title : '点击选择地区',
		width : "100px",
		dropDown : new dropDownOptionsDiv({
			items : optionDivs,
			id : "cityControlDiv"
		}),
		action : cityControlClick
	});
}
function cityControlClick(){
	var phaseControlDiv = document.getElementById('cityControlDiv');
	if(phaseControlDiv.style.display == 'block') {
		phaseControlDiv.style.display = 'none';
	}else{
		while(phaseControlDiv.firstChild){
			if(phaseControlDiv.firstChild.className == 'separatorDiv')break;
			phaseControlDiv.removeChild(phaseControlDiv.firstChild);
		}
		for ( var i = 0, n = allEntities.length; i < n; i++) {
			var entity = allEntities[i];
			if(entity.selected){
				phaseControlDiv.insertBefore(new checkBox({
					gmap : map,
					title : "点击选择/取消"+entity.location.n,
					id : entity.location.n+"-"+entity.type,
					label : entity.location.n,
					selected : true,
					ENTITY : entity,
					action : cityItemClick
				}),phaseControlDiv.firstChild);
			}
		}
		phaseControlDiv.style.display = 'block';
	}
}

function cityItemClick(){
	var entity = this.ENTITY;
	entity.selected = !entity.selected;
	entity.updateUI();
}

function compareIndex(){
	var cities = [];
	for ( var i = 0, n = allEntities.length; i < n; i++) {
		var entity = allEntities[i];
		if(entity.selected){
			cities.push(entity.location.n);
		}
	}
	if(cities.length==0){
		alert("请选择要对比的省市.");
		return;
	}
	var uri = 'comparechart.html?i={0}&p={1}&ns={2}'.format(idx,phase,cities)
	window.open(uri,'_blank');
	hideDropdownList('cityControl');
}


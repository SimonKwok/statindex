/************
 Classes to set up the drop-down control
 ************/

function optionDiv(options) {
	var control = document.createElement('DIV');
	control.className = "dropDownItemDiv";
	control.title = options.title;
	control.id = options.id;
	control.innerHTML = options.name;
	google.maps.event.addDomListener(control, 'click', options.action);
	return control;
}

function checkBox(options) {
	//first make the outer container
	var container = document.createElement('DIV');
	container.className = "checkboxContainer";
	container.title = options.title;

	var span = document.createElement('SPAN');
	span.role = "checkbox";
	span.className = "checkboxSpan";

	var bDiv = document.createElement('DIV');
	bDiv.className = "blankDiv";
	bDiv.id = options.id;
	bDiv.style.display = (!!options.selected)?'block':'none';

	var image = document.createElement('IMG');
	image.className = "blankImg";
	image.src = "http://maps.gstatic.com/mapfiles/mv/imgs8.png";

	var label = document.createElement('LABEL');
	label.className = "checkboxLabel";
	label.innerHTML = options.label;

	bDiv.appendChild(image);
	span.appendChild(bDiv);
	container.appendChild(span);
	container.appendChild(label);

	google.maps.event.addDomListener(container, 'click', function() {
		(bDiv.style.display == 'block') ? bDiv.style.display = 'none' : bDiv.style.display = 'block';
		options.action();
	})
	return container;
}
function separator() {
	var sep = document.createElement('DIV');
	sep.className = "separatorDiv";
	return sep;
}

function dropDownOptionsDiv(options) {
	//alert(options.items[1]);
	var container = document.createElement('DIV');
	container.className = "dropDownOptionsDiv";
	container.id = options.id;

	for (i = 0; i < options.items.length; i++) {
		//alert(options.items[i]);
		container.appendChild(options.items[i]);
	}

	//for(item in options.items){
	//container.appendChild(item);
	//alert(item);
	//}        
	return container;
}

function dropDownControl(options) {
	var container = document.createElement('DIV');
	container.className = 'container';
	if(options.width){
		container.style.width = options.width;
	}
	var control = document.createElement('DIV');
	control.id = options.id;
	control.className = 'dropDownControl';
	if(options.title){
		control.title = options.title;
	}
	control.innerHTML = '<span id="'+options.id+'-label">'+options.name+'</span>';
	var arrow = document.createElement('IMG');
	arrow.src = "http://maps.gstatic.com/mapfiles/arrow-down.png";
	arrow.className = 'dropDownArrow';
	control.appendChild(arrow);
	container.appendChild(control);
	container.appendChild(options.dropDown);

	if(!!options.gmap){
		options.gmap.controls[options.position].push(container);
	}
	google.maps.event.addDomListener(control, 'click', options.action || function() {
		toggleDropdownList(this.id);
//		setTimeout(function() {
//			div.style.display = 'none';
//		}, 1500);
	})
	return container;
}

function toggleDropdownList(id){
	var div = document.getElementById(id + 'Div');
	(div.style.display == 'block') ? div.style.display = 'none' : div.style.display = 'block';
}

function showDropdownList(id){
	var div = document.getElementById(id + 'Div');
	div.style.display = 'block';
}

function hideDropdownList(id){
	var div = document.getElementById(id + 'Div');
	div.style.display = 'none';
}

function buttonControl(options) {
	var control = document.createElement('DIV');
	control.innerHTML = options.name;
	control.className = 'button';
	control.index = 1;

	// Add the control to the map
	if(!!options.gmap)options.gmap.controls[options.position].push(control);
	google.maps.event.addDomListener(control, 'click', options.action);
	return control;
}
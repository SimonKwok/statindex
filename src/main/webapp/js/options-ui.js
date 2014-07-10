UIOptions = {
	provinceOptions : {
		strokeColor : "#8E8D61",
		strokeWeight : 1,
		fillColor : "#FFFFE1",
		fillOpacity : 0.6,
		clickable : true,
		zIndex : 1
	},
	provinceHoverOptions : {
		strokeColor : "#3F4937",
		fillColor : "#F0F978"
	},
	provinceResetOptions : {
		strokeColor : "#8E8D61",
		fillColor : "#FFFFE1"
	},
	cityOptions : {
		strokeWeight : 0,
		fillColor : "#16998F",
		fillOpacity : 0.9,
		zIndex : 2
	},
	cityHoverOptions : {
		fillColor : "#A04800"
	},
	cityResetOptions : {
		fillColor : "#16998F"
	},
	infoBubbleOptions : {
		minWidth : 100,
		maxWidth : 400,
		shadowStyle : 1,
		padding : 4,
		backgroundColor : "#FFFFFF",
		borderRadius : 4,
		borderWidth : 1,
		borderColor : '#555555',
		disableAutoPan : true,
		hideCloseButton : false,
		arrowSize : 20,
		arrowPosition : 20,
		backgroundClassName : 'phoney',
		arrowStyle : 2
	}
};
//省、市、区 X 选中、正常
EntityUIOptions = [
	[UIOptions.provinceOptions,UIOptions.provinceHoverOptions],
	[UIOptions.cityOptions,UIOptions.cityHoverOptions],
	[UIOptions.provinceOptions,UIOptions.provinceHoverOptions]
];


//Chart title settings
function doTitle(chart, text) {
    var td = new cfx.TitleDockable();
    td.setText(text);
    td.setDock(cfx.DockArea.Top);
    chart.getTitles().add(td);
    return td;
}
//Chart axis setting
function settingAxis(axis,u){
	if(u=='%'){
		axis.getDataFormat().setFormat(cfx.AxisFormat.Percentage);
		axis.getLabelsFormat().setFormat(cfx.AxisFormat.Percentage);
    }else{
    	axis.getLabelsFormat().setFormat(cfx.AxisFormat.Number);
    	axis.getLabelsFormat().setCustomFormat("#,##0.#");
		axis.getTitle().setText(u);
    }
	axis.getDataFormat().setDecimals(1);
}
//Setting the tooltip as Pie chart
function pieChart(chart) {
    var myPie = (chart.getGalleryAttributes());
    myPie.setStacked(true);
    myPie.setShadows(true);
    myPie.setShowLines(true);
    chart.setGallery(cfx.Gallery.Pie);
    chart.getLegendBox().setDock(cfx.DockArea.Bottom);
    chart.getLegendBox().setContentLayout(cfx.ContentLayout.Center);
    chart.getLegendBox().setVisible(true);
    chart.getAllSeries().getPointLabels().setVisible(true);
    chart.getAxisY().getLabelsFormat().setDecimals(2);
    chart.getPlotAreaMargin().setTop(1);
    chart.getPlotAreaMargin().setBottom(1);
    chart.getPlotAreaMargin().setLeft(1);
    chart.getPlotAreaMargin().setRight(1);
}
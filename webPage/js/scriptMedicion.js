var $table = $('#table')
var $remove = $('#remove')
var selections = []

var margin = {
	top : 10,
	right : 60,
	bottom : 30,
	left : 60
}, width = 340,
height = 360;

var svg2 = d3.select("#divGraph2").append("svg").attr('width', '100%').attr(
		"viewBox", `0 0 460 400`).append("g").attr("transform",
		"translate(" + margin.left + "," + margin.top + ")");


var rango = [];

var rectaFija;
var rectaFija2;

var guardaOnda;
var guardaEC;

var configuration= new Object();

var rectasD1;
var rectasD2;
var id;
var i;

var a0=-5.3/100;
var a1=2.92/100;
var a2=-5.5/10000;
var a3=4.3/1000000;

var selectionId; 

$(document).ready(function() {
	muestra();
	initTable();
});




// ----------------------------Evento import data

(function(){
    
    function onChange(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
    }

    function onReaderLoad(event){
    	if (window.confirm("This will add the data to localStorage. Import data?")) {
	        var obj = JSON.parse(event.target.result);
	        for(key in obj){
	        	localStorage.setItem(key, obj[key]);
	        }
	        muestra();
	    	initTable();
    	}
    	
    }
    
    document.getElementById('files').addEventListener('change', onChange);
}());




// ----------------------------------------- Eventos muestra de la onda


$("#firstPeakMostrar").change(function() {
	configuration.firstPeak=$("#firstPeakMostrar").val();
	mostrarFirstPeak(($("#firstPeakMostrar").val() - configuration.cableLength) * 340 / configuration.windowLength, rectaFija);
	/*
	 * if($('#valor2ndPeakMostrar').val()!="Not calculated" &&
	 * $('#valor2ndPeakMostrar').val()!="" &&
	 * $('#valor2ndPeakMostrar').val()!="Clic Calculate"){
	 * $("#valorHumedadMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val()))[0].toFixed(3));
	 * $("#valorEpsilonMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val()))[1].toFixed(3)); }
	 * Si se descomenta esto, calcula la humedad automáticamente al cambiar el
	 * valor
	 */
});


$("#valor2ndPeakMostrar").change(function() {
	mostrarSecondPeak(($("#valor2ndPeakMostrar").val() - configuration.cableLength) * 340 / configuration.windowLength, rectaFija2);
	/*
	 * $("#valorHumedadMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val()))[0].toFixed(3));
	 * $("#valorEpsilonMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val()))[1].toFixed(3));
	 * Si se descomenta esto, calcula la humedad automáticamente al cambiar el
	 * valor
	 */
});



window.operateEvents = {
	'click .mostrar' : function(e, value, row, index) {
		var polinomio=new Object();
		$('#muestraConfigForm').hide();
		$("#configOndaMostrar").html('Show configuration');
		$("#guardarBtnConfigMostrar").hide();
		id=row.id;
		svg2.remove();
		$("#divGraph2").html("");
		svg2 = d3.select("#divGraph2").append("svg").attr('width', '100%')
				.attr("viewBox", `0 0 460 400`).append("g").attr("transform",
						"translate(" + margin.left + "," + margin.top + ")");
		
		guardaOnda = row.onda;
		configuration=row.configuration;
		if(configuration.polinomial==undefined ){
			polinomio.a0=a0;
			polinomio.a1=a1;
			polinomio.a2=a2;
			polinomio.a3=a3;
			configuration.polinomial=polinomio;
		}
		
		rellenarMostrar(row);
		graficar(row.onda, svg2, row.configuration.cableLength, row.configuration.windowLength);
		if (row.configuration.firstPeak != "" && row.configuration.firstPeak != undefined) {
			rectaFija = svg2.append("line");
			mostrarFirstPeak((row.configuration.firstPeak - row.configuration.cableLength) * 340 / row.configuration.windowLength, rectaFija);
		}
		if (row.secondPeak != "" && row.secondPeak != undefined && row.secondPeak!="Not calculated") {
			rectaFija2 = svg2.append("line");
			mostrarSecondPeak((row.secondPeak - row.configuration.cableLength) * 340 / row.configuration.windowLength,
					rectaFija2);
		}
		if (row.graphEC != ""  && row.graphEC!=undefined) {
			graficaEC(row.graphEC, svg2);
		}

	},
	'click .remove' : function(e, value, row, index) {
		$table.bootstrapTable('remove', {
			field : 'id',
			values : [ row.id ]
		})
		initTable();
	}
}

$("#xMostrar").click(function() {
	rectasD1 = undefined;
	rectaFija = undefined;
	rectaFija2 = undefined;
	rectasD2 = undefined;
	siguienteModal();
});

$("#calculate2ndMostrar").click(
		function() {
			if ($('#firstPeakMostrar').val() == ""
					|| $('#firstPeakMostrar').val() == 'Not calculated'
					|| $('#firstPeakMostrar').val() == 'Click Graph') {
				alert('Define Firts peak before');
			} else {
				$('#checkBoxMostrarDiv').show();
				$("#valor2ndPeakMostrar").attr("readonly", false);
				var posInFirstPeak = ($('#firstPeakMostrar').val() - configuration.cableLength)
						* 251 / configuration.windowLength;
				if (rectasD1 == undefined) {
					rectasD1 = svg2.append("line");
				}
				if (rectasD2 == undefined) {
					rectasD2 = svg2.append("line");
				}
				if($("#checkBoxMostrar").prop("checked"))
					x=$('#valor2ndPeakMostrar').val();
				else{
					x = tangentes(posInFirstPeak);
					$("#valor2ndPeakMostrar").val(x.toFixed(3));
				}
				$('#valorHumedadMostrar').val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat(x))[0].toFixed(3));
				$('#valorEpsilonMostrar').val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat(x))[1].toFixed(3));
			}

		});




$("#guardarBtn2").click(function() {
	rectasD1 = undefined;
	rectaFija = undefined;
	rectaFija2 = undefined;
	rectasD2 = undefined;
	data=JSON.parse(localStorage.getItem(id));
	data.configuration.firstPeak = $('#firstPeakMostrar').val();
	data.secondPeak = $('#valor2ndPeakMostrar').val();
	data.info = $('#informacion2').val();
	data.humedad=$('#valorHumedadMostrar').val();
	data.epsilon=$('#valorEpsilonMostrar').val();
	data.ec=$('#valorECMostrar').val();
	localStorage.setItem(id, JSON.stringify(data));
	siguienteModal();
	initTable();
});

$("#cerrarBtn2").click(function() {
	rectasD1 = undefined;
	rectaFija = undefined;
	rectaFija2 = undefined;
	rectasD2 = undefined;
	siguienteModal();
});

$("#eliminarBtn2").click(function() {
	rectasD1 = undefined;
	rectaFija = undefined;
	rectaFija2 = undefined;
	rectasD2 = undefined;
	localStorage.removeItem(id);
	$table.bootstrapTable('remove', {
		field : 'id',
		values : id
	})
	siguienteModal();
});



					// -------------Oculto del modal de mostrar




$("#configOndaMostrar").click(function() {
	if($("#muestraConfigForm").is(':hidden')){
			$("#configOndaMostrar").html('Hide configuration');
			$("#muestraConfigForm").show();
			$("#guardarBtnConfigMostrar").show();
			data=JSON.parse(localStorage.getItem(id));
			$('#cableLengthCM').val(configuration.cableLength);
			$('#windowLengthCM').val(configuration.windowLength);
			$('#constantKCM').val(configuration.constantK);
			$('#rhoSCCM').val(configuration.rhoSC);
			$('#rhoAirCM').val(configuration.rhoAir);
			$('#averagePointsCM').val(configuration.averagePoints);
			$('#probeLengthCM').val(configuration.probeLength);
			$('#vpCM').val(configuration.vp);
			$('#firstPeakCM').val(configuration.firstPeak);
			configuration=data.configuration;
			if(configuration.polinomial==undefined || configuration.polinomial==''){
				$('#consta0').val(a0);
				$('#consta1').val(a1);
				$('#consta2').val(a2);
				$('#consta3').val(a3);
			}else{
				$('#consta0').val(configuration.polinomial.a0);
				$('#consta1').val(configuration.polinomial.a1);
				$('#consta2').val(configuration.polinomial.a2);
				$('#consta3').val(configuration.polinomial.a3);
			}
	}else{
		$("#configOndaMostrar").html('Show configuration');
			$("#guardarBtnConfigMostrar").hide();
			$("#muestraConfigForm").hide();
	}


	});

$("#guardarBtnConfigMostrar").click(function() {
	var polinomio=new Object();
	data=JSON.parse(localStorage.getItem(id));
	
	data.configuration.constantK=$('#constantKCM').val();
	configuration.constantK=$('#constantKCM').val();
	data.configuration.rhoSC=$('#rhoSCCM').val();
	configuration.rhoSC=$('#rhoSCCM').val();
	data.configuration.rhoAir=$('#rhoAirCM').val();
	configuration.rhoAir=$('#rhoAirCM').val();
	data.configuration.probeLength=$('#probeLengthCM').val();
	configuration.probeLength=$('#probeLengthCM').val();
	
	polinomio.a0=$('#consta0').val();
	polinomio.a1=$('#consta1').val();
	polinomio.a2=$('#consta2').val();
	polinomio.a3=$('#consta3').val();
	configuration.polinomial=polinomio;
	data.configuration=configuration;
	
	if(data.secondPeak!="Not calculated" && data.secondPeak!=''){
		data.humedad=waterContent(parseFloat(data.configuration.firstPeak),parseFloat(data.secondPeak))[0];
		data.epsilon=waterContent(parseFloat(data.configuration.firstPeak),parseFloat(data.secondPeak))[1];
	}
		
	if(data.graphEC!="Not calculated" && data.graphEC!='' && data.graphEC!=undefined){
		data.ec=valorEC(data.graphEC, parseFloat(data.configuration.rhoAir), parseFloat(data.configuration.rhoSC));
	}
	localStorage.setItem(id, JSON.stringify(data));
	
	if($('#valorHumedadMostrar').val()!='' && $('#valorHumedadMostrar').val()!='Not calculated'){
		$('#valorHumedadMostrar').val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val()))[0].toFixed(3));
		$('#valorEpsilonMostrar').val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val()))[1].toFixed(3));
		}
	if($('#valorECMostrar').val()!='' && $('#valorECMostrar').val()!=undefined && !isNaN($('#valorECMostrar').val())){
		$('#valorECMostrar').val(valorEC(data.graphEC, parseFloat(data.configuration.rhoAir), parseFloat(data.configuration.rhoSC)).toFixed(3));
		
	}
});




					// ---------------------boton export

	
$('#volcarConfigParcial').click(function() {
	volcarConfigParcial();
});

$('#guardarCSV').click(function() {
	if(guardarCSV()) alert('Nothing exported ');
	
});



// ----------------------boton calcularSelec

$('#calcularSelec').click(function() {
	var id = getIdSelections();
	id.forEach(function(el) {
		data=JSON.parse(localStorage.getItem(el));
		configuration=data.configuration;
		if(data.secondPeak=="Not calculated" || data.secondPeak==''){
			data.secondPeak=valor2ndPeak(data);
			data.humedad=waterContent(parseFloat(configuration.firstPeak) ,parseFloat(data.secondPeak))[0];
			data.epsilon=waterContent(parseFloat(configuration.firstPeak) ,parseFloat(data.secondPeak))[1];
			localStorage.setItem(el, JSON.stringify(data));
		}
// initTable(); Preguntar a David
	});
	
});



$('#openSelected').click(function() {
	selectionId = getIdSelections();
	siguienteModal();
	});
	
// ------------------------btn eliminar----------------

$remove.click(function() {
	eliminarElto();
	initTable();
})



// --------------------------resto funciones


function eliminarElto() {
	if (window.confirm("Are you sure?")) {
		var id = getIdSelections()
		$table.bootstrapTable('remove', {
			field : 'id',
			values : id
		})
		$remove.prop('disabled', true);
		$('#calcularSelec').prop('disabled', true);
		$('#openSelected').prop('disabled', true);
		$('#volcarConfigParcial').prop('disabled', true);
		id.forEach(function(el) {
			localStorage.removeItem(el);
		});

	}
}

function muestra() {
	if (localStorage.length != 0) {
		$("#muestraNo").hide();
		$("#tablaBootstrap").show();
		$("#remove").show();
	} else {
		$("#muestraSi").hide();
		$("#remove").hide();
		$("#tablaBootstrap").hide();

	}

}

function rellenarMostrar(row) {

	$("#informacion2").val(row.info);
	$("#labelOnda").html("<font color='white'> Project: </font>" +row.configuration.name +"<font color='white'> &nbsp;&nbsp;&nbsp;&nbsp;Date:  </font>"   +row.fecha);

	$("#checkBoxMostrar").prop("checked", false);
	if (row.ec != "") {
		$('#valorECMostrar').val( parseFloat(row.ec).toFixed(3) );
	} else {
		$('#valorECMostrar').val('Not Calculated');
	}
	if (row.configuration.firstPeak != "") {
		$('#firstPeakMostrar').val(row.configuration.firstPeak);
		configuration.firstPeak=$('#firstPeakMostrar').val();
	} else {
		$('#firstPeakMostrar').val('Not calculated');
	}
	if (row.secondPeak == "" || row.secondPeak == undefined) {
		$("#valor2ndPeakMostrar").attr("readonly", true);
		$('#valor2ndPeakMostrar').val('Not calculated');
		$('#valorHumedadMostrar').val('Not calculated');
		$('#valorEpsilonMostrar').val('Not calculated');
		$('#checkBoxMostrarDiv').hide();
	} else {
		$("#valor2ndPeakMostrar").attr("readonly", false);
		$('#valor2ndPeakMostrar').val(parseFloat(row.secondPeak).toFixed(3));
		$('#valorHumedadMostrar').val(waterContent(row.configuration.firstPeak,row.secondPeak)[0].toFixed(3));
		$('#valorEpsilonMostrar').val(waterContent(row.configuration.firstPeak,row.secondPeak)[1].toFixed(3));																			// que
																				
		$('#checkBoxMostrarDiv').show();

	}

}



function waterContent(first,second){
	var ks=1.01*(100*(second-first)/10)*(100*(second-first)/(configuration.probeLength*100));   
	
	if(configuration.polinomial==undefined || configuration.polinomial==''){
		return ([ a0+ks*a1+ks*ks*a2+ks*ks*ks*a3, ks]);
	}
	return ([ parseFloat(configuration.polinomial.a0)+ks*parseFloat(configuration.polinomial.a1)+
		ks*ks*parseFloat(configuration.polinomial.a2)+ks*ks*ks*parseFloat(configuration.polinomial.a3), ks]);

}


function valorEC(puntosEC,rhoAir,rhoSC){
	rhoAir=parseFloat(rhoAir);
	rhoSC=parseFloat(rhoSC);
	var rho = 0;// Calculamos rho como media de los últimos 5 puntos
	var i = puntosEC.length - 5;
	for (; i < puntosEC.length; i++) {
		rho += puntosEC[i];
	}
	rho=rho/5;
	var rhoInf=(2*( ((rhoAir-rhoSC)*(rho)-rhoAir) / ((1+rhoSC)*(rho-rhoAir) +(rhoAir-rhoSC)*(1+rhoAir)) )+1);
	return ((parseFloat(configuration.constantK))/50*(1-rhoInf)/(1+rhoInf));
}





function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/csv;charset=utf-8,'
			+ encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}



function crearDesplegableCheckBox(id){
	var texto="";
	var j=0;
	$('#checkBoxDinamico').empty();
	for(var el in JSON.parse(localStorage.getItem(id[0]))){
		 if(j%3==0)  texto+="<div class='form-row col-md-12'>";
		 if(el!="graphEC"){
		 	texto+="<div class='col-4'>"
		 		texto+="<label>";
		 			texto+='<input type="checkbox" id="elementoCheckbox' + j + '" value="'+el+'">';
		 			if(el=="onda") texto+=' Waveform';
		 			else if(el=="fecha") texto+=' Date';
		 			else if(el=="humedad") texto+= " &theta; (m³ m⁻³)";
		 			else if(el=="secondPeak") texto+= " Polinomial const";
		 			else if(el=="id") texto+="Project name ";
		 			else texto+=' '+ el.charAt(0).toUpperCase()+ el.slice(1);
		 		texto+="</label>";
		 	texto+="</div>";
		 	j++;
		 }
		 	
		 if((j)%3==0 )  texto+="</div>";
		
	}
	 texto+="</div>";
	 $('#checkBoxDinamico').html(texto);
}
		 
	        


function volcarConfigParcial() {
	var id = getIdSelections()
	crearDesplegableCheckBox(id);
	
}

function siguienteModal(){
	if(selectionId==undefined || selectionId==''){
		$('#modal2').modal('toggle');
		muestra();
		initTable();
		$('#calcularSelec').prop('disabled', true);
		$('#openSelected').prop('disabled', true);
		$('#volcarConfigParcial').prop('disabled', true);
		$('#remove').prop('disabled', true);
	}
	else if(selectionId.length>0){
		$('#modal2').modal('show');
		$('#muestraConfigForm').hide();
		$("#configOndaMostrar").html('Show configuration');
		$("#guardarBtnConfigMostrar").hide();
		svg2.remove();
		$("#divGraph2").html("");
		svg2 = d3.select("#divGraph2").append("svg").attr('width', '100%')
				.attr("viewBox", `0 0 460 400`).append("g").attr("transform",
						"translate(" + margin.left + "," + margin.top + ")");
		row=JSON.parse(localStorage.getItem(selectionId[0]));
		id=selectionId[0];
		guardaOnda = row.onda;
		configuration=row.configuration;
		if(configuration.polinomial==undefined){
			var polinomio=new Object;
			polinomio.a0=a0;
			polinomio.a1=a1;
			polinomio.a2=a2;
			polinomio.a3=a3;
			configuration.polinomial=polinomio;
		}
		rellenarMostrar(row);
		graficar(row.onda, svg2, row.configuration.cableLength, row.configuration.windowLength);
		if (row.configuration.firstPeak != "" && row.configuration.firstPeak != undefined) {
			rectaFija = svg2.append("line");
			mostrarFirstPeak((row.configuration.firstPeak - row.configuration.cableLength) * 340 / row.configuration.windowLength, rectaFija);
		}
		if (row.secondPeak != "" && row.secondPeak != undefined && row.secondPeak!="Not calculated") {
			rectaFija2 = svg2.append("line");
			mostrarSecondPeak((row.secondPeak - row.configuration.cableLength) * 340 / row.configuration.windowLength,
					rectaFija2);
		}
		if (row.graphEC != ""  && row.graphEC!=undefined) {
			graficaEC(row.graphEC, svg2);
		}

		selectionId.shift();
	}
	
}


function guardarCSV(){
	var id = getIdSelections();
	var lon=0;
	for(var el in JSON.parse(localStorage.getItem(id[0]))){lon++;}
	var csv="";
	for(var j=0; j<lon;j++){
		if($("#elementoCheckbox"+j).is(':checked')){
			if($("#elementoCheckbox"+j).val()=="onda") csv+='Waveform ,';
 			else if($("#elementoCheckbox"+j).val()=="fecha") csv+='Date ,';
 			else if($("#elementoCheckbox"+j).val()=="humedad") csv+=' Water content ,';
 			else if($("#elementoCheckbox"+j).val()=="id") csv+=' Project Name ,';
 			else if($("#elementoCheckbox"+j).val()=="secondPeak") csv+='Polinomial constants ,';
 			else csv+=$("#elementoCheckbox"+j).val().charAt(0).toUpperCase()+ $("#elementoCheckbox"+j).val().slice(1)+',';
		}
	}
	if(csv=="") return true; 
	csv=csv.slice(0,-1);
	csv+='\n';
	id.forEach(function(el) {
		for(var j=0; j<lon;j++){
			if($("#elementoCheckbox"+j).is(':checked')){
				if($("#elementoCheckbox"+j).val()=="id"){
					csv+=JSON.stringify(JSON.parse(localStorage.getItem(el)).configuration.name).replace(/,/g, '|')+ ',';
				}else if($("#elementoCheckbox"+j).val()=="secondPeak"){
					if(JSON.parse(localStorage.getItem(el)).configuration.polinomial==undefined){
						var polinomio=new Object;
						polinomio.a0=a0;
						polinomio.a1=a1;
						polinomio.a2=a2;
						polinomio.a3=a3;
						csv+=JSON.stringify(polinomio).replace(/,/g, '|')+ ',';
					}
					else csv+=JSON.stringify(JSON.parse(localStorage.getItem(el)).configuration.polinomial).replace(/,/g, '|')+ ',';
				}
				else if($("#elementoCheckbox"+j).val()=="onda"){
					csv+=JSON.stringify(JSON.parse(localStorage.getItem(el))[$("#elementoCheckbox"+j).val()]).replace(/,/g, '|').replace(/[\[\]']+/g,'')+ ',';
				}
				else{
					csv+=JSON.stringify(JSON.parse(localStorage.getItem(el))[$("#elementoCheckbox"+j).val()]).replace(/,/g, '|')+ ',';
				}
			}
		}
		csv=csv.slice(0,-1);
		csv+='\n';
	});
	var nombre = prompt("Please enter download filename: ", "Config");
	if (nombre == null || nombre == "") {
	  alert("User cancelled the prompt.");
	} else {
		  download(nombre+'.csv', csv); 
	}
}



// --------------------------------------Bootstrap table----------------

var datosBootstrap = []; // Datos de la bootstrap Table

function actualizaDatos() {
	datosBootstrap = [];
	for (var i = 0, len = localStorage.length; i < len; ++i) {
		datosBootstrap.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
	}
}

function getIdSelections() {
	return $.map($table.bootstrapTable('getSelections'), function(row) {
		return row.id
	})
}

function responseHandler(res) {
	$.each(res.rows, function(i, row) {
		row.state = $.inArray(row.id, selections) !== -1
	})
	return res
}

function detailFormatter(index, row) {
	var html = []
	$.each(row, function(key, value) {
		html.push('<p><b>' + key + ':</b> ' + value + '</p>')
	})
	return html.join('')
}

function operateFormatter(value, row, index) {
	return [
			'<a class="mostrar" href="javascript:void(0)" title="Mostrar">',
			'<i class="fa fa-bar-chart fa-2x" data-toggle="modal" data-backdrop="static" data-keyboard="false" data-target="#modal2"></i> ',
			'</a>  ', ].join('')
}

function totalTextFormatter(data) {
	return 'Total'
}

function totalNameFormatter(data) {
	return data.length
}

function totalPriceFormatter(data) {
	var field = this.field
	return '$' + data.map(function(row) {
		return +row[field].substring(1)
	}).reduce(function(sum, i) {
		return sum + i
	}, 0)
}
function altura(datos){
	if (datos.length>8) return 180+58*8;
	return 180+58*datos.length;
}

function initTable() {
	actualizaDatos();
	$table.bootstrapTable('destroy').bootstrapTable({
		height : altura(datosBootstrap),
		data : datosBootstrap,
		locale : $('#locale').val(),
		columns : [ [ {
			field : 'state',
			checkbox : true,
			align : 'center',
			valign : 'middle'
		}, {
			field : 'configuration.name',
			title : 'Proyect',
			sortable : true,
			align : 'center',
			footerFormatter : totalPriceFormatter
		}, {
			title : 'Date',
			field : 'fecha',
			align : 'center',
			valign : 'middle',
			sortable : true,
			footerFormatter : totalTextFormatter
		}, {
			field : 'operate',
			title : 'Results',
			align : 'center',
			clickToSelect : false,
			events : window.operateEvents,
			formatter : operateFormatter
		},{
			field: 'info',
			visible : false,
			} ] ]
	})

	$table.on('check.bs.table uncheck.bs.table '
			+ 'check-all.bs.table uncheck-all.bs.table', function() {
		$remove.prop('disabled',!$table.bootstrapTable('getSelections').length)
		$('#volcarConfigParcial').prop('disabled', !$table.bootstrapTable('getSelections').length)
		$('#calcularSelec').prop('disabled', !$table.bootstrapTable('getSelections').length)
		$('#openSelected').prop('disabled', !$table.bootstrapTable('getSelections').length)
		selections = getIdSelections()
	})

}
// ----------Gráfica-------------

function graficar(onda, svg, cL, wL) {

	var wlf = parseFloat(wL);
	var clf = parseFloat(cL);
	var data = [];

	i = 0;
	while (i < onda.length) {
		punto = new Object();
		punto.x = i / 251 * wlf + clf;
		punto.y = onda[i];
		data.push(punto);
		i++;
	}

	// Add X axis --> it is a date format
	var x = d3.scaleLinear().domain([ clf, clf + wlf ]).range([ 0, width ]);
	svg.append("g").attr("transform", "translate(0," + height + ")").call(
			d3.axisBottom(x));

	// var miny=d3.min(data, function (d) { return d.y + -0.1; }); ---->>>Así
	// estaba escalado
	// var maxy= d3.max(data, function (d) { return d.y + 0.1; });
	miny = -1.1;
	maxy = 1.3;

	// Add Y axis
	var y = d3.scaleLinear().domain([ miny, maxy ]).range([ height, 0 ]);
	svg.append("g").call(d3.axisLeft(y));

	// This allows to find the closest X index of the mouse:
	var bisect = d3.bisector(function(d) {
		return d.x;
	}).left;

	// Create the circle that travels along the curve of chart
	var focus = svg.append('g').append('circle').style("fill", "none").attr(
			"stroke", "black").attr('r', 8.5).style("opacity", 0)

	// Create the text that travels along the curve of chart
	var focusText = svg.append('g').append('text').style("opacity", 0).attr(
			"text-anchor", "left").attr("alignment-baseline", "middle")

	// Create a rect on top of the svg area: this rectangle recovers mouse
	// position
	svg.append('rect').style("fill", "none").style("pointer-events", "all")
			.attr('width', width).attr('height', height).on('mouseover',
					mouseover).on('mousemove', mousemove).on('click', onclickF)
			.on('mouseout', mouseout);

	// Crea una recta
	var recta = svg.append("line").attr("stroke", "red")

	rectaFija = svg.append("line")
	rectaFija2 = svg.append("line")

	// Add the line
	svg.append("path").data([ data ]).attr("fill", "none").attr("stroke",
			"steelblue").attr("stroke-width", 1.5).attr("d",
			d3.line().x(function(d) {
				return x(d.x)
			}).y(function(d) {
				return y(d.y)
			}))

	// What happens when the mouse move -> show the annotations at the right
	// positions.
	function mouseover() {
		focus.style("opacity", 1)
		focusText.style("opacity", 1)
		if ($('#checkBoxMostrar').prop('checked')
				|| $('#checkBoxGuardar').prop('checked')) {
			recta.style("opacity", 1).attr("stroke", "yellow")
		} else {
			recta.style("opacity", 1).attr("stroke", "red")
		}
	}
	
	
function onclickF() {
	var equis = x.invert(d3.mouse(this)[0]);
	if (!($('#checkBoxMostrar').prop('checked') || $('#checkBoxGuardar')
			.prop('checked'))) {
		mostrarFirstPeak((equis - cL) * 340 / wL, rectaFija);
		$("#firstPeak").val(equis.toFixed(2));
		$("#firstPeakMostrar").val(equis.toFixed(2));
		configuration.firstPeak=$("#firstPeakMostrar").val();
		$("#firstPeakConfig").val(equis.toFixed(2));
		/*
		 * if($('#valor2ndPeakMostrar').val()!="Not calculated" &&
		 * $('#valor2ndPeakMostrar').val()!="" &&){
		 * $("#valorHumedadMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val()))[0].toFixed(3));
		 * $("#valorEpsilonMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val()))[1].toFixed(3));
		 * Si se descomenta esto, se calcula el valor de humedad al hacer click }
		 */
	} else {
		mostrarSecondPeak((equis - cL) * 340 / wL, rectaFija2);
		$("#valor2ndPeakGuardar").val(equis.toFixed(2));
		$("#valor2ndPeakMostrar").val(equis.toFixed(2));
		/*
		 * $("#valorHumedadMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val()))[0].toFixed(3));
		 * $("#valorEpsilonMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val()))[1].toFixed(3));
		 * Si se descomenta esto, se calcula el valor de humedad al hacer click
		 */
	}
}


	function mousemove() {
		var x0 = x.invert(d3.mouse(this)[0]);
		var i = bisect(data, x0, 1);
		selectedData = data[i]
		focus.attr("cx", x(selectedData.x)).attr("cy", y(selectedData.y))
		focusText.html(selectedData.x.toFixed(3) )
				.attr("x", x(selectedData.x) - 20).attr("y",
						y(selectedData.y) - 15)
		recta.attr("x1", x(selectedData.x)).attr("y2", 0).attr("x2",
				x(selectedData.x)).attr("y1", 365);
	}
	function mouseout() {
		focus.style("opacity", 0)
		focusText.style("opacity", 0)
		recta.style("opacity", 0)
	}
	return [ miny, maxy ]
}

function graficaEC(onda, svg) {
	var data = [];
	var i = 0;
	while (i < onda.length) {
		punto = new Object();
		punto.x = i;
		punto.y = onda[i];
		data.push(punto);
		i++;
	}
	var x = d3.scaleLinear().domain([ 1, data.length ]).range([ 0, width ]);

	var y = d3.scaleLinear().domain([ -1.1, 1.3 ]).range([ height, 0 ]);

	svg.append("path").data([ data ]).attr("fill", "none").attr("stroke",
			"green").attr("stroke-width", 1.5).attr("d",
			d3.line().x(function(d) {
				return x(d.x)
			}).y(function(d) {
				return y(d.y)
			}))

}

function mostrarFirstPeak(equis, variable) {
	variable.attr("stroke", "red").attr("x1", equis).attr("y2", 0).attr("x2",
			equis).attr("y1", 365);
}

function mostrarSecondPeak(equis, recta) {
	recta.attr("stroke", "yellow").attr("x1", equis).attr("y2", 0).attr("x2",
			equis).attr("y1", 365);
}

function valor2ndPeak(row){
	configuration=row.configuration;
	onda=row.onda;
	var posFirstPeak = (row.configuration.firstPeak - configuration.cableLength)* 251 / configuration.windowLength;
	var posminV = parseInt(Math.round(posFirstPeak));
	var minV = onda[posminV];
	var posmaxD = 0;
	var maxD = onda[posminV + 10] - onda[posminV];
	for (var i = posminV; i < onda.length - 1; i++) {
		if (onda[i] < minV) {
			minV = onda[i];
			posminV = i;
		}
	}
	for (var i = posminV; i < onda.length - 10; i++) {
		if ((onda[i + 10] - onda[i]) > maxD) {
			maxD = onda[i + 10] - onda[i];
			posmaxD = i;
		}
	}

	x = valorInter(posmaxD, onda[posmaxD], posmaxD + 10,
			onda[posmaxD + 10], minV, rectasD2);
	return (x / 340 * configuration.windowLength + parseFloat(configuration.cableLength));
	
}

function valorInter(p0x, p0y, p1x, p1y, valor, recta) {
	p0 = new Object();
	p0.x = p0x * 340 / 251;
	p0.y = (p0y + 1.1) * 360 / 2.4;
	p1 = new Object();
	p1.x = p1x * 340 / 251;
	p1.y = (p1y + 1.1) * 360 / 2.4;
	p2 = new Object();
	p2.x = 0;
	p2.y = 360;
	p3 = new Object();
	p3.x = 340;
	p3.y = 360;
	p4 = new Object();
	p4.x = 0;
	p4.y = 0;
	p5 = new Object();
	p5.x = 340;
	p5.y = 0;
	pRecta1 = getIntersection(p0, p1, p2, p3);
	if (pRecta1.x > 340) {
		pRecta1 = getIntersection(p0, p1, p5, p3);
	}
	pRecta2 = getIntersection(p0, p1, p5, p4);
	if (pRecta2.x < 0) {
		pRecta2 = getIntersection(p0, p1, p2, p4);
	}
	p6 = new Object();
	p6.x = 0;
	p6.y = (valor + 1.1) * 360 / 2.4;
	p7 = new Object();
	p7.x = 340;
	p7.y = (valor + 1.1) * 360 / 2.4;

	inter = getIntersection(pRecta1, pRecta2, p6, p7);

	return inter.x;

}


function tangentes(posFirstPeak) {
	var posminV = parseInt(Math.round(posFirstPeak));
	// posfirstPeak es un valor entre 1 y 255. Se recorre el vector a partir de
	// ese
	// punto para calcular tangentes y más
	var minV = guardaOnda[posminV];
	var posmaxD = 0;
	var maxD = guardaOnda[posminV + 10] - guardaOnda[posminV];
	for (var i = posminV; i < guardaOnda.length - 1; i++) {
		
		if (guardaOnda[i] < minV) {
			minV = guardaOnda[i];
			posminV = i;
		}
	}
	for (var i = posminV; i < guardaOnda.length - 10; i++) {
		if ((guardaOnda[i + 10] - guardaOnda[i]) > maxD) {
			maxD = guardaOnda[i + 10] - guardaOnda[i];
			posmaxD = i;
		}
	}

	muestraT1(minV, rectasD1);
	x = muestraT2(posmaxD, guardaOnda[posmaxD], posmaxD + 10,
			guardaOnda[posmaxD + 10], minV, rectasD2);
	mostrarSecondPeak(x, rectaFija2);
	return (x / 340 * configuration.windowLength + parseFloat(configuration.cableLength));
	// Devuelve el valor numérico del 2nd Peak

}

function muestraT2(p0x, p0y, p1x, p1y, valor, recta) {
	p0 = new Object();
	p0.x = p0x * 340 / 251;
	p0.y = (p0y + 1.1) * 360 / 2.4;
	p1 = new Object();
	p1.x = p1x * 340 / 251;
	p1.y = (p1y + 1.1) * 360 / 2.4;
	p2 = new Object();
	p2.x = 0;
	p2.y = 360;
	p3 = new Object();
	p3.x = 340;
	p3.y = 360;
	p4 = new Object();
	p4.x = 0;
	p4.y = 0;
	p5 = new Object();
	p5.x = 340;
	p5.y = 0;
	pRecta1 = getIntersection(p0, p1, p2, p3);
	if (pRecta1.x > 340) {
		pRecta1 = getIntersection(p0, p1, p5, p3);
	}
	pRecta2 = getIntersection(p0, p1, p5, p4);
	if (pRecta2.x < 0) {
		pRecta2 = getIntersection(p0, p1, p2, p4);
	}

	recta.attr("stroke", "yellow").attr("x1", pRecta1.x).attr("x2", pRecta2.x)
			.attr("y1", 360 - pRecta1.y).attr("y2", 360 - pRecta2.y);

	p6 = new Object();
	p6.x = 0;
	p6.y = (valor + 1.1) * 360 / 2.4;
	p7 = new Object();
	p7.x = 340;
	p7.y = (valor + 1.1) * 360 / 2.4;

	inter = getIntersection(pRecta1, pRecta2, p6, p7);

	return inter.x;

}

function muestraT1(y, recta) {
	recta.attr("stroke", "yellow").attr("x1", 0).attr("y2",
			360 - (y + 1.1) / 2.4 * 360).attr("x2", 340).attr("y1",
			360 - (y + 1.1) / 2.4 * 360);

}

function getIntersection(p0, p1, p2, p3) {
	s1_x = p1.x - p0.x;
	s1_y = p1.y - p0.y;
	s2_x = p3.x - p2.x;
	s2_y = p3.y - p2.y;

	s = (-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y))
			/ (-s2_x * s1_y + s1_x * s2_y);
	t = (s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x))
			/ (-s2_x * s1_y + s1_x * s2_y);

	inter = new Object();
	inter.x = p0.x + (t * s1_x);
	inter.y = p0.y + (t * s1_y);
	return inter;

}

/*TODO
 * Que redibuje 1st peak al cambiar en el campo numérico en configuración y refresh  -- falta comprobar con tdr
 * * EC debajo de water content (que va debajo de 1st peak)  Dejar todos los botones alienados a la izda con letra mas pequeña1st peak --OK
 * Botones close delete save config + pequeños --OK
 * En configuración falta una constante k para calcular ec. Al cambiar el nombre, que se borre el primer pico automáticamente. Aviso si no se define 1st paeak. Quitar probe offset y probe cell y No puntos
 * Rho_sc --> Como el ec en cortocircuito (añadirlos con posiblidad de cambio) -1
 * Rho_air -->  +1
 * Rho --> Es el que se mide con ec y la fórmula
 * Cambiar Boton de 2nd Peak por water content y que calcule la humedad
 
 * --------En todas las ventanas-------------
 * Para 2nd peak, que calcule la máxima tangente buscando a partir del primer pico  -----A partir del mínimo después del primer pico?
 * Al exportar, poder decir dónde se guarda y renombrar archivo
 * En la web, en la ventana de mostrar, añadir icono de configuración que muestre los datos y que sólo se pueda modificar probe length, k, rho_sc y rho_air
 * 
 */

 /* 
 actualizarLabel(onda) pasarle la configuracion (configMedicion.val)
 arreglar añadirF() ---> No guarda los datos de la gráfica
 */

var $table = $('#table')
var $remove = $('#remove')
var selections = []

var margin = {
	top : 10,
	right : 60,
	bottom : 30,
	left : 60
}, width = 340, // 460 - margin.left - margin.right,
height = 360;// 400 - margin.top - margin.bottom;

var svg2 = d3.select("#divGraph2").append("svg").attr('width', '100%').attr(
		"viewBox", `0 0 460 400`).append("g").attr("transform",
		"translate(" + margin.left + "," + margin.top + ")");

var svg1 = d3.select("#divGraph1").append("svg").attr('width', '100%').attr(
		"viewBox", `0 0 460 400`).append("g").attr("transform",
		"translate(" + margin.left + "," + margin.top + ")");

var svg3 = d3.select("#divGraphConfig").append("svg").attr('width', '100%')
		.attr("viewBox", `0 0 460 400`).append("g").attr("transform",
				"translate(" + margin.left + "," + margin.top + ")");

var rectaFija;
var rectaFija2;
var guardaOnda;

var guardaCL;
var guardaWL;
var guardaEC;
var guardaVp;
var guardaProbeLength;
var guardaAvgPoints;
var guardaRhoAir;
var guardaRhoSC;
var guardaConstantK;

var guardaFirstPeak;
var rectasD1;
var rectasD2;
var id; 

var i;

var a0=-5.3/100;
var a1=2.92/100;
var a2=5.5/10000;
var a3=4.3/1000000;

$(document).ready(function() {
	muestra();
	initTable();
	selectConfig("configMedicion");
	selectConfig("configModal");
	selectConfig("selectObtenerModal");
});


// ----------------------------Evento import data

(function(){
    
    function onChange(event) {
        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
    }

    function onReaderLoad(event){
        // console.log(event.target.result);
    	if (window.confirm("This will add the data to localStorage. Import data?")) {
	        var obj = JSON.parse(event.target.result);
	        for(key in obj){
	        	localStorage.setItem(key, obj[key]);
	        }
	        initTable();
    	}
    }
    
    document.getElementById('files').addEventListener('change', onChange);
}());


// -----------------------------Eventos configuracion onda


$('#configName').change(function() { 
	$("#firstPeakConfig").val('');
});
	
$('#configOnda').click(function() {
	i = 0;
	$("#checkBoxGuardar").prop("checked", false);
	$("#checkBoxMostrar").prop("checked", false);
	rellenarConfig("configMedicion");
});

$( "#firstPeakConfig" ).change(function() { 
	mostrarFirstPeak(($("#firstPeakConfig").val() - guardaCL) * 340 / guardaWL, rectaFija);
	});

$('#configModal').change(function() {
	rellenarConfig("configModal");
});

$("#refreshConfig").click(function() {
	i = 0;
	actualizarLabelConfig();
});

$("#guardarBtnConfig").click(function() {
	i = 0;
	guardarConfig();
	selectConfig("configMedicion");
	selectConfig("selectObtenerModal");
	selectConfig("configModal");
	rellenarConfig("configMedicion");
});

$("#borrarBtnConfig").click(function() {
	i = 0;
	eliminarConfig();
	selectConfig("configMedicion")
	selectConfig("selectObtenerModal");
	selectConfig("configModal");
	rellenarConfig("configMedicion");
});

$("#cerrarBtnConfig").click(function() {
	i = 0;
});

$('#xConfig').click(function() {
	i = 0;
});

// ------------------------------------- Eventos refresh

$("#firstPeak").change(function() {
	mostrarFirstPeak(($("#firstPeak").val() - guardaCL) * 340 / guardaWL, rectaFija);
	if($('#valor2ndPeakGuardar').val()!="Not calculated" && $('#valor2ndPeakGuardar').val()!="" && $('#valor2ndPeakGuardar').val()!="Clic Calculate")
		$("#valorHumedadGuardar").val(waterContent(parseFloat($('#firstPeak').val()),parseFloat($('#valor2ndPeakGuardar').val())));
		
});


$("#valor2ndPeakGuardar").change(function() {
	mostrarSecondPeak(($("#valor2ndPeakGuardar").val() - guardaCL) * 340 / guardaWL, rectaFija2);
	$("#valorHumedadGuardar").val(waterContent(parseFloat($('#firstPeak').val()),parseFloat($('#valor2ndPeakGuardar').val())));
});



$("#añadir").click(function() {
	i = 0;
	cargarConfig();
	$("#checkBoxGuardar").prop("checked", false);
	$("#checkBoxMostrar").prop("checked", false);
	$('#checkBoxGuardarDiv').hide();
	$("#valor2ndPeakGuardar").attr("readonly", true);
	$('#valor2ndPeakGuardar').val('Not calculated');
	$('[name=selectObtenerModal] option').filter(function() {
		return ($(this).text() == String($('#configMedicion').val()));
	}).prop('selected', true);
	$("#informacion").val('').blur();
	$("#valorEC").val('').blur();
	$("#firstPeak").val('').blur();
	guardaEC=undefined;// guardaEC='';
	actualizarLabel();
});

$("#xGuardar").click(function() {
	rectasD1 = undefined;
	// rectaFija=undefined; Veamos si no hace falta. TODO:quitar si no es
	// necesario
	// rectaFija2=undefined;
	rectasD2 = undefined;
});

$("#refresh").click(function() {
	i = 0;
	rectasD1 = undefined;
	rectasD2 = undefined;
	$("#valorEC").val('').blur();
	$("#firstPeak").val('').blur();
	actualizarLabel();
});

$("#calculateEC").click(function() {
	i = 0;
	rectasD1 = undefined;
	rectasD2 = undefined;
	añadirEC(rango);
});

$("#calculate2ndGuardar").click(
		function() {
			if ($('#firstPeak').val() == ""
					|| $('#firstPeak').val() == 'Not calculated'
					|| $('#firstPeak').val() == 'Click Graph') {
				alert('Define Firts peak before');
			} else {
				$('#checkBoxGuardarDiv').show();
				$("#valor2ndPeakGuardar").attr("readonly", false);
				var posInFirstPeak = ($('#firstPeak').val() - guardaCL) * 251 
						/ guardaWL;

				if (rectasD1 == undefined) {
					rectasD1 = svg1.append("line");
				}
				if (rectasD2 == undefined) {
					rectasD2 = svg1.append("line");
				}
				x = tangentes(posInFirstPeak);
				$("#valor2ndPeakGuardar").val(x.toFixed(3));
				$("#valorHumedadGuardar").val(waterContent($('#firstPeak').val(),x));
				
			}
		});

$("#guardar").click(function() {
	añadirF();
	initTable();
	rectasD1 = undefined;
	// rectaFija=undefined;
	// rectaFija2=undefined;
	rectasD2 = undefined;
});

$("#cerrarBtn").click(function() {
	rectasD1 = undefined;
	// rectaFija=undefined;
	// rectaFija2=undefined;
	rectasD2 = undefined;
});

// ----------------------------------------- Eventos muestra de la onda


$("#firstPeakMostrar").change(function() {
	guardaFirstPeak=$("#firstPeakMostrar").val();
	mostrarFirstPeak(($("#firstPeakMostrar").val() - guardaCL) * 340 / guardaWL, rectaFija);
	if($('#valor2ndPeakMostrar').val()!="Not calculated" && $('#valor2ndPeakMostrar').val()!="" && $('#valor2ndPeakMostrar').val()!="Clic Calculate")
		$("#valorHumedadMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val())).toFixed(3));
});


$("#valor2ndPeakMostrar").change(function() {
	mostrarSecondPeak(($("#valor2ndPeakMostrar").val() - guardaCL) * 340 / guardaWL, rectaFija2);
	$("#valorHumedadMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val())).toFixed(3));
});



window.operateEvents = {
	'click .mostrar' : function(e, value, row, index) {
		id=row.id;
		svg2.remove();
		$("#divGraph2").html("");
		svg2 = d3.select("#divGraph2").append("svg").attr('width', '100%')
				.attr("viewBox", `0 0 460 400`).append("g").attr("transform",
						"translate(" + margin.left + "," + margin.top + ")");

		rellenarMostrar(row);
		guardaOnda = row.onda;
		guardaCL = row.cL;
		guardaWL = row.wL;
		graficar(row.onda, svg2, row.cL, row.wL);
		if (row.firstPeak != "" && row.firstPeak != undefined) {
			rectaFija = svg2.append("line");
			mostrarFirstPeak((row.firstPeak - row.cL) * 340 / row.wL, rectaFija);
		}
		if (row.secondPeak != "" && row.secondPeak != undefined) {
			rectaFija2 = svg2.append("line");
			mostrarSecondPeak((row.secondPeak - row.cL) * 340 / row.wL,
					rectaFija2);
		}
		if (row.graphEC != "") {
			graficaEC(row.graphEC, svg2);
		}

	},
	'click .remove' : function(e, value, row, index) {
		$table.bootstrapTable('remove', {
			field : 'id',
			values : [ row.id ]
		})
	}
}

$("#xMostrar").click(function() {
	rectasD1 = undefined;
	rectaFija = undefined;
	rectaFija2 = undefined;
	rectasD2 = undefined;
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
				var posInFirstPeak = ($('#firstPeakMostrar').val() - guardaCL)
						* 251 / guardaWL;
				if (rectasD1 == undefined) {
					rectasD1 = svg2.append("line");
				}
				if (rectasD2 == undefined) {
					rectasD2 = svg2.append("line");
				}
				x = tangentes(posInFirstPeak);
				$("#valor2ndPeakMostrar").val(x.toFixed(3));
				$('#valorHumedadMostrar').val(waterContent($('#firstPeakMostrar').val(),x).toFixed(3));
			}

		});

$("#guardarBtn2").click(function() {
	rectasD1 = undefined;
	rectaFija = undefined;
	rectaFija2 = undefined;
	rectasD2 = undefined;
	data=JSON.parse(localStorage.getItem(id));
	data.firstPeak = $('#firstPeakMostrar').val();
	guardaFirstPeak=$('#firstPeakMostrar').val();
	data.secondPeak = $('#valor2ndPeakMostrar').val();
	data.info = $('#informacion2').val();
	data.humedad=$('#valorHumedadMostrar').val();
	localStorage.setItem(id, JSON.stringify(data));
	initTable();
});

$("#cerrarBtn2").click(function() {
	rectasD1 = undefined;
	rectaFija = undefined;
	rectaFija2 = undefined;
	rectasD2 = undefined;
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
});

					//-------------modal del modal de mostrar


$("#configOndaMostrar").click(function() {
	$('#cableLengthCM').val(guardaCL);
	$('#windowLengthCM').val(guardaWL);
	$('#constantKCM').val(guardaConstantK);
	$('#rhoSCCM').val(guardaRhoSC);
	$('#rhoAirCM').val(guardaRhoAir);
	$('#averagePointsCM').val(guardaAvgPoints);
	$('#vpCM').val(guardaVp);
	$('#firstPeakCM').val(guardaFirstPeak);
	
});



					//---------------------boton export
	
$('#volcarConfig').click(function() {
	volcarConfig();
});




//					--------------------------resto funciones
var rango = [];

function rellenarConfig(nombre) {
	$('#loadingConfig').hide();
	$.getJSON('datosConfig', function(datos) {
		var config = datos[$("#" + nombre).val()];
		$('[name=configModal] option').filter(function() {
			return ($(this).text() == String($("#" + nombre).val()));
		}).prop('selected', true);
		$('#configName').val(config['configName']);
		$('#cableLength').val(config['cableLength']);
		$('#windowLength').val(config['windowLength']);
		$('#numberPoints').val(config['numberPoints']);
		$('#probeCell').val(config['probeCell']);
		$('#probeOffset').val(config['probeOffset']);
		$('#probeLength').val(config['probeLength']);
		$('#constantK').val(config['constantK']);
		$('#rhoSC').val(config['rhoSC']);
		$('#rhoAir').val(config['rhoAir']);
		$('#firstPeakConfig').val(config['firstPeak']);
	});

}

function cargarConfig(){
	$.getJSON('datosConfig', function(datos) {
		var config = datos[$("#configMedicion").val()];

		guardaCL=config['cableLength'];
		guardaWL=config['windowLength'];
		guardaProbeLength=config['probeLength'];
		guardaConstantK=config['constantK'];
		guardaRhoSC=config['rhoSC'];
		guardaRhoAir=config['rhoAir'];
		guardaAvgPoints=config['averagePoints'];
	});
}

function selectConfig(nombre) { // Crea despleglable de seleccion desde el
	// fichero de configuracion
	$.getJSON('datosConfig', function(datos) {
		$("#" + nombre).empty();
		for ( var element in datos) {
			var x = document.createElement("OPTION");
			x.setAttribute(String(element), String(element));
			var t = document.createTextNode(String(element));
			x.appendChild(t);
			document.getElementById(nombre).appendChild(x);
		}
	});

}

$remove.click(function() {
	eliminarElto();
})

function waterContent(first,second){
	var ks=1.01*(100*(second-first)/10)*(100*(second-first)/10);  // lo que
																	// ahora
																	// pone 10
																	// debera
																	// ser el
																	// tamaño de
																	// la
																	// varilla?
	return (a0+ks*a1+ks*ks*a2+ks*ks*ks*a3);
	
}

function eliminarElto() {
	if (window.confirm("Sure?")) {
		var id = getIdSelections()
		$table.bootstrapTable('remove', {
			field : 'id',
			values : id
		})
		$remove.prop('disabled', true);
		id.forEach(function(el) {
			localStorage.removeItem(el);
		});

	}
}

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/json;charset=utf-8,'
			+ encodeURIComponent(text));
	// element.setAttribute('href', 'data:text/json;charset=utf-8,' + text);
	element.setAttribute('download', filename);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
}

function volcarConfig() {
	download("config.json", JSON.stringify(localStorage)); // Cuando es
	// JSON
	// const headers = {
	// id: 'Identificador',
	// fecha: 'Fecha',
	// info: 'Informacion',
	// config: 'Configuration',
	// firstPeak: 'First Peak',
	// ec: "EC",
	// onda: "Wave",
	// wL: "Window Length",
	// cL: "Cable Length"
	// };
	// data=JSON.stringify(localStorage);
	// exportCSVFile(headers, data, 'nombres');
}

function añadirF() {

	var clave = String(Math.floor((Math.random() * 100000000) + 1));
	var obj = new Object();
	obj.id = clave;
	var date = new Date();
	obj.fecha = date.getFullYear()
			+ "-"
			+ (date.getMonth() + 1)
			+ "-"
			+ date.getDate()
			+ " "
			+ date.getHours()
			+ ":"
			+ ((date.getMinutes() < 10) ? ("0" + date.getMinutes()) : date
					.getMinutes())
			+ ":"
			+ ((date.getSeconds() < 10) ? ("0" + date.getSeconds()) : date
					.getSeconds());
	obj.info = $('#informacion').val();
	obj.config = $('#selectObtenerModal').val();
	obj.firstPeak = $('#firstPeak').val();
	guardaFirstPeak=$('#firstPeak').val();
	obj.ec = $('#valorEC').val();
	obj.onda = guardaOnda;
	obj.graphEC = guardaEC;
	cargarConfig();
	obj.wL = guardaWL;
	obj.cL = guardaCL;
	obj.rhoAir = guardaRhoAir;
	obj.rhoEC = guardaRhoSC;
	obj.probeLenght=guardaProbeLength;
	obj.avgPoints=guardaAvgPoints;
	obj.constantK = guardaConstantK;
	obj.secondPeak = $('#valor2ndPeakGuardar').val();
	obj.humedad=$('#valorHumedadGuardar').val();
	localStorage.setItem(clave, JSON.stringify(obj));

}

function añadirEC(rango) {
	$('#textoSpin').html('<strong > <h4>Obtaining EC... </h4> </strong>');
	$('#loading').show();

	svg1.remove();
	$("#divGraph1").html("");
	svg1 = d3.select("#divGraph1").append("svg").attr('width', '100%').attr(
			"viewBox", `0 0 460 400`).append("g").attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");
	graficar(guardaOnda, svg1, guardaCL, guardaWL);
	mostrarFirstPeak(($('#firstPeak').val()-guardaCL)*340/guardaWL,rectaFija);

	$.getJSON('json/ec.json', function(data) {
		if(data.error=="" || data.error==undefined){
			guardaEC = data.wave;
			graficaEC(guardaEC, svg1);
			$('#valorEC').val(valorEC(guardaEC, parseFloat(guardaRhoAir), parseFloat(guardaRhoSC)));
			$('#loading').hide();
		}else return añadirEC(rango);
		
	});

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
	return (guardaConstantK/50)*(1-rhoInf)/(1+rhoInf);
}

function actualizarLabel() {
	$('#calculateEC').prop('disabled', true);
	$('#textoSpin').html('<strong > <h4>Aquaring waveform... </h4> </strong>');
	$('#loading').show();

	svg1.remove();
	$("#divGraph1").html("");
	svg1 = d3.select("#divGraph1").append("svg").attr('width', '100%').attr(
			"viewBox", `0 0 460 400`).append("g").attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	$.post(
			'json/onda.json',
			// 'https://examples.wenzhixin.net.cn/examples/bootstrap_table/data',
			{
				myData : $('#selectObtenerModal').val()
			},
			function(data) {
				if (data.error == "" || data.error == undefined) {
					$('#calculateEC').prop('disabled', false);
					rango = graficar(data.wave, svg1, data.cL, data.wL);
					guardaOnda = data.wave;
					guardaWL = data.wL;
					guardaCL = data.cL;
					$('#loading').hide();
					if (data.firstPeak != "" && data.firstPeak != undefined) {
						mostrarFirstPeak((data.firstPeak - data.cL) * 340/ data.wL, rectaFija);
						$("#firstPeak").val(data.firstPeak);
					}
				} else {
					if (i <= 5) {
						return actualizarLabel();
						i++;
					} else
						alert('Cant recive wave. So many tryes. Error'
								+ str(data.error));
				}
			}).fail(function() {
		alert('Cant recive wave. Maybe not connected');
		$('#loading').hide();
	});
}

function actualizarLabelConfig(onda) {

	$('#loadingConfig').show();

	var config = new Object();
	config.windowLength = $('#windowLength').val();
	config.cableLength = $('#cableLength').val();
	config.numberPoints = $('#numberPoints').val();
	config.probeCell = $('#probeCell').val();
	config.probeOffset = $('#probeOffset').val();
	config.probeLength = $('#probeLength').val();
	config.averagePoints = $('#averagePoints').val();
	config.vp = $('#vp').val();

	svg3.remove();
	$("#divGraphConfig").html("");
	svg3 = d3.select("#divGraphConfig").append("svg").attr('width', '100%')
			.attr("viewBox", `0 0 460 400`).append("g").attr("transform",
					"translate(" + margin.left + "," + margin.top + ")");
	$.post(
		'/config',
		{
			myData : JSON.stringify(config)
		},
		function(data) {
			if (data.error == "" || data.error==undefined) {
				rango = graficar(data.wave, svg3, config.cableLength,config.windowLength);
				$('#loadingConfig').hide();
			} else {
				if (i <= 5) {
					return actualizarLabelConfig();
					i++;
				} else
					alert('Cant recive wave. So many tryes. Error'
							+ str(data.error));
			}
		}).fail(function() {
			alert('Cant recive wave. Maybe not connected');
			$('#loadingConfig').hide();
		});
}


function guardarConfig() {
	if ($('#configName').val() == "") {
		alert('Set name configName please')
	} else if (!(String($('#configName').val()).search(/^[0-9a-zA-Z]+$/) != -1) ) {
		alert('Please, use only letters and numbers to save configuration on project name');
	} else if(String($('#configName').val())[0]>= '0' && String($('#configName').val())[0] <= '9')
	{
		alert('First element of project name should be a letter');
	}else if($('#firstPeakConfig').val()==''){
		alert('Define value for first peak');
	}
	else{
		var config = new Object();
		config.configName = $('#configName').val();
		config.windowLength = $('#windowLength').val();
		config.cableLength = $('#cableLength').val();
		config.numberPoints = $('#numberPoints').val();
		config.probeCell = $('#probeCell').val();
		config.probeOffset = $('#probeOffset').val();
		config.probeLength = $('#probeLength').val();
		config.averagePoints = $('#averagePoints').val();
		config.vp = $('#vp').val();
		config.firstPeak = $('#firstPeakConfig').val();
		config.constantK=$('#constantK').val();
		config.rhoAir=$('#rhoAir').val();
		config.rhoSC=$('#rhoSC').val();

		$.post('/saveConfig', {
			myData : JSON.stringify(config)
		}, function(data) {
			alert(data)
		}).fail(function() {
			alert('Problem saving configuration');
		});
	}
	// $('#modalConfig').hide();
	// $('body').removeClass('modal-open');
	// $('.modal-backdrop').hide();
}

function eliminarConfig() {
	if ($('#configModal').val() == "Default") {
		alert('Can not be deleted Default configuration. ');
	} else if (window.confirm("Sure to delete config "
			+ $('#configModal').val() + "?")) {
		$.post('/deleteConfig', // url
		{
			myData : $('#configModal').val()
		}, // data to be submit
		function(data, status, jqXHR) {
			alert(data)
		}).fail(function(jqxhr, settings, ex) {
			alert('Problem saving configuration' + ex);
		});
	}
}

function rellenarMostrar(row) {

	$("#informacion2").val(row.info);
	$("#labelOnda").html("<font color='white'> Project: </font>" +row.config +"<font color='white'> &nbsp;&nbsp;&nbsp;&nbsp;Date:  </font>"   +row.fecha);

	$("#checkBoxMostrar").prop("checked", false);
	if (row.ec != "") {
		$('#valorECMostrar').html('<h5>' + row.ec + '</h5>');
	} else {
		$('#valorECMostrar').html('<h5>Not Calculated</h5>');
	}
	if (row.firstPeak != "") {
		$('#firstPeakMostrar').val(row.firstPeak);
		guardaFirstPeak=$('#firstPeakMostrar').val();
	} else {
		$('#firstPeakMostrar').val('Not calculated');
	}
	if (row.secondPeak == "" || row.secondPeak == undefined) {
		$("#valor2ndPeakMostrar").attr("readonly", true);
		$('#valor2ndPeakMostrar').val('Not calculated');
		$('#valorHumedadMostrar').val('Not calculated');
		$('#checkBoxMostrarDiv').hide();
	} else {
		$("#valor2ndPeakMostrar").attr("readonly", false);
		$('#valor2ndPeakMostrar').val(row.secondPeak);
		$('#valorHumedadMostrar').val(waterContent(row.firstPeak,row.secondPeak).toFixed(3));// Convendrá
																					// que
																					// sea
																					// row.watercontent
																					// o lo
																					// que
																					// sea
		$('#checkBoxMostrarDiv').show();

	}

	// $("#valorECMostrar").empty();
	// $("#valorEC").append("some Text");
	// if(row.firstPeak!=0 && row.firstPeak!=undefined){
	// $("#firstPeak").text('First peak : ' + row.firstPeak.toFixed(2));
	// }

}

function muestra() {
	if (localStorage.length != 0) {
		$("#muestraNo").hide();

	} else {
		$("#muestraSi").hide();
		$("#remove").hide();
		$("#tablaBootstrap").hide();

	}

}

var datos = []; // Datos de la bootstrap Table

function actualizaDatos() {
	datos = [];
	for (var i = 0, len = localStorage.length; i < len; ++i) {
		datos.push(JSON.parse(localStorage.getItem(localStorage.key(i))));
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
			'<button type="button" class="btn btn-warning btn-sm" data-toggle="modal"  data-backdrop="static" data-keyboard="false" data-target="#modal2">Icono</button>',
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

function initTable() {
	actualizaDatos();
	$table.bootstrapTable('destroy').bootstrapTable({
		height : 448,
		data : datos,
		locale : $('#locale').val(),
		columns : [ [ {
			field : 'state',
			checkbox : true,
			align : 'center',
			valign : 'middle'
		}, {
			field : 'config',
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
		} ] ]
	})

	$table.on('check.bs.table uncheck.bs.table '
			+ 'check-all.bs.table uncheck-all.bs.table', function() {
		$remove
				.prop('disabled',
						!$table.bootstrapTable('getSelections').length)
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
			guardaFirstPeak=$("#firstPeakMostrar").val();
			$("#firstPeakConfig").val(equis.toFixed(2));
			if($('#valor2ndPeakGuardar').val()!="Not calculated" && $('#valor2ndPeakGuardar').val()!="" && $('#valor2ndPeakGuardar').val()!="Clic Calculate"
				|| $('#valor2ndPeakMostrar').val()!="Not calculated" && $('#valor2ndPeakMostrar').val()!="" && $('#valor2ndPeakMostrar').val()!="Clic Calculate"){
					$("#valorHumedadGuardar").val(waterContent(parseFloat($('#firstPeak').val()),parseFloat($('#valor2ndPeakGuardar').val())));
					$("#valorHumedadMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val())).toFixed(3));
				}
		} else {
			mostrarSecondPeak((equis - cL) * 340 / wL, rectaFija2);
			$("#valor2ndPeakGuardar").val(equis.toFixed(2));
			$("#valor2ndPeakMostrar").val(equis.toFixed(2));
			$("#valorHumedadGuardar").val(waterContent(parseFloat($('#firstPeak').val()),parseFloat($('#valor2ndPeakGuardar').val())));
			$("#valorHumedadMostrar").val(waterContent(parseFloat($('#firstPeakMostrar').val()),parseFloat($('#valor2ndPeakMostrar').val())).toFixed(3));
		}
	}

	function mousemove() {
		// recover coordinate we need
		var x0 = x.invert(d3.mouse(this)[0]);
		var i = bisect(data, x0, 1);
		selectedData = data[i]
		focus.attr("cx", x(selectedData.x)).attr("cy", y(selectedData.y))
		focusText.html("x:" + selectedData.x + "  -  " + "y:" + selectedData.y)
				.attr("x", x(selectedData.x) - 40).attr("y",
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

function tangentes(posFirstPeak) {
	var posminV = parseInt(Math.round(posFirstPeak));
	// posfirstPeak es un valor entre 1 y 255. Se recorre el vector a partir de
	// ese
	// punto para calcular tangentes y más
	var minV = guardaOnda[posminV];
	var posmaxD = 0;
	var maxD = guardaOnda[posminV + 1] - guardaOnda[posminV];
	for (var i = posminV; i < guardaOnda.length - 1; i++) {
		
		if (guardaOnda[i] < minV) {
			minV = guardaOnda[i];
			posminV = i;
		}
	}
	for (var i = posminV; i < guardaOnda.length - 1; i++) {
		if ((guardaOnda[i + 1] - guardaOnda[i]) > maxD) {
			maxD = guardaOnda[i + 1] - guardaOnda[i];
			posmaxD = i;
		}
	}

	muestraT1(minV, rectasD1);
	x = muestraT2(posmaxD, guardaOnda[posmaxD], posmaxD + 1,
			guardaOnda[posmaxD + 1], minV, rectasD2);
	mostrarSecondPeak(x, rectaFija2);
	return (x / 340 * guardaWL + parseFloat(guardaCL));

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

// function convertToCSV(objArray) {
// const array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
// let str = "";
//
// for (let i = 0; i < array.length; i++) {
// let line = "";
// for (let index in array[i]) {
// if (line != "") line += ",";
//
// line += array[i][index];
// }
//
// str += line + "\r\n";
// }
//
// return str;
// }
//
//
// function exportCSVFile(headers, items, fileName) {
// // if (headers) {
// // items.unshift(headers);
// // }
//
// const jsonObject = JSON.stringify(items);
//
// const csv = convertToCSV(jsonObject);
//
// const exportName = fileName + ".csv" || "export.csv";
//
// const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// if (navigator.msSaveBlob) {
// navigator.msSaveBlob(blob, exportName);
// } else {
// const link = document.createElement("a");
// if (link.download !== undefined) {
// const url = URL.createObjectURL(blob);
// link.setAttribute("href", url);
// link.setAttribute("download", exportName);
// link.style.visibility = "hidden";
// document.body.appendChild(link);
// link.click();
// document.body.removeChild(link);
// }
// }
// }

/*
 * $(function() { initTable() $('#locale').change(initTable) })
 */


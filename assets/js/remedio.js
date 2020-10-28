var elementName = function(nome){
    return document.querySelector("[name='"+ nome + "']");
}

function maiorCard(){
    var maior = 0;
    document.querySelectorAll(".card").forEach(function(e){
        if(e.clientHeight > maior){
            maior = e.clientHeight;
        }
    })

    return maior;
}


var renderTemplate = function (data, horariosArray, dadosUsuario){
    var templateCompleto = `<div class="col m4 s12 "><article class="card">
        <h4>${data}</h4>
        <div class="row">
            <div class="col s4 gray">Nome:</div>
            <div class="col s8 hard-gray">${dadosUsuario.nome}</div>
        </div>
        <div class="row">
            <div class="col s4 gray">Dozagem:</div>
            <div class="col s8 hard-gray">${dadosUsuario.dosagem}</div>
        </div>
        <div class="row">
            <div class="col s4 gray">Horários:</div>
            <div class="col s8 hard-gray">${horariosArray} </div>
        </div>
    </article><div>`;

    var templateReduzido=`<div style="margin-top:15px">
        <div class="row">
            <div class="col s4 gray">Nome:</div>
            <div class="col s8 hard-gray">${dadosUsuario.nome}</div>
        </div>
        <div class="row">
            <div class="col s4 gray">Dozagem:</div>
            <div class="col s8 hard-gray">${dadosUsuario.dosagem}</div>
        </div>
        <div class="row">
            <div class="col s4 gray">Horários:</div>
            <div class="col s8 hard-gray">${horariosArray}</div>
        </div>
    <div>`
    
    var diasTela = document.querySelectorAll("#container__dados_remedio h4");

    if(diasTela.length === 0){
        document.querySelector("#container__dados_remedio .conteudo__remedios").innerHTML += templateCompleto;
        return false;
    }

    for(var d=0; d < diasTela.length; d++){
        var diaTela = diasTela[d].textContent.trim();

        if(data.trim() === diaTela){
            diasTela[d].parentElement.innerHTML += templateReduzido;
            return false;
        }
    }
        
    document.querySelector("#container__dados_remedio .conteudo__remedios").innerHTML += templateCompleto;

    document.querySelectorAll(".card").forEach(function(e){
        e.style.height = maiorCard() + "px";
     })
}


function transformDate(tipo, data){
    if(tipo == "br"){
        [d,m,y] = data.split("/");

        return y + "/" + m + "/" + d;
    }

    if(tipo == "eua"){
        [y,m,d] = data.split("/");

        return d + "/" + m + "/" + y;
    }
}

function validateFields(){
    var nodeList = document.querySelectorAll("#container__dados_usuario input");
    var passaValidation = true;

    nodeList.forEach(function(e){
        e.classList.remove("error");

        if(e.value === ''){
            e.classList.add("error");
            passaValidation = false;
        }
    })
    
    return passaValidation;
}

function retornaDadosUsuario(){
     
    if(validateFields() === false){
        return false;
    }
    
    var dadosUsuario ={
        nome:elementName("nome_remedio").value,
        dosagem:elementName("dosagem").value,
        intervalo:elementName("intervalo-tempo").value,
        qntDias:elementName("qnt-dias").value,
        dataInicio:elementName("dataInicio").value,
        horaInicio:elementName("horaInicio").value,
        totalComprimidos:function(){
            
            var qntComprimidos = (this.qntDias * 24) / this.intervalo;
            
            return qntComprimidos;
        }
    }

    console.log(dadosUsuario);
    return dadosUsuario;
}



function calcularTerapia(dadosUsuario){
   
    if(dadosUsuario === false){
        return false;
    }

    document.querySelector("#container__dados_remedio").classList.remove("onshow");

    document.querySelectorAll(".card").forEach(function(e){
        e.style.height = "auto";
     });
     
     setTimeout(function(){
        document.querySelector("#container__dados_remedio").classList.add("onshow");
     }, 10)

    var startDate = new Date(transformDate('eua', dadosUsuario.dataInicio));

    [h, m] = dadosUsuario.horaInicio.split(":");
    
    if(m === undefined){
        m = "00";
    }
    
    startDate.setHours(h);
    startDate.setMinutes(m);

    var dia = startDate.toDateString();

    var horariosArray = [];
    for(var i = 1; i < dadosUsuario.totalComprimidos(); i++){

        if(i === dadosUsuario.totalComprimidos().length){
            renderTemplate(startDate.toLocaleDateString("bt-br"), horariosArray, dadosUsuario);

            return false;
        }
        
        if( horariosArray == ""){
            m === "00"?  horariosArray.push(" " + startDate.getHours() + "h") : horariosArray.push(" " + startDate.getHours() + ":" + startDate.getMinutes());
            var diaRender = new Date(dia).toLocaleDateString('pt-br');

            startDate.setHours( startDate.getHours() + parseFloat(dadosUsuario.intervalo))

            if( startDate.toDateString() != dia ){
                        
                renderTemplate(diaRender, horariosArray, dadosUsuario);

                horariosArray = [];
                dia=startDate.toDateString();
            }
        }else{
            m === "00"? horariosArray.push(" " + startDate.getHours() + "h") : horariosArray.push(" " + startDate.getHours() + ":" + startDate.getMinutes());
            startDate.setHours( startDate.getHours() + parseFloat(dadosUsuario.intervalo))

            if( startDate.toDateString() != dia ){
                        
                renderTemplate(diaRender, horariosArray, dadosUsuario);
                horariosArray = [];
                dia=startDate.toDateString();
            }
        }
    }

    //deleta dados inputs
    document.querySelectorAll("input").forEach(function(e){
        e.value="";
     });

     window.location.hash = "";
     window.location.hash = "#container__dados_remedio";

     $('.date').mask('00/00/0000');
     $('.horario').mask('00:00');
     $('.number').mask('00');
}



function novaTerapia(){
    document.querySelector(".conteudo__remedios").innerHTML = "";
    document.querySelector("#container__dados_remedio").classList.remove("onshow")
}

window.onload=function(){
    $('.date').mask('00/00/0000');
    $('.horario').mask('00:00');
    $('.number').mask('00');
}


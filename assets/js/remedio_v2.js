var environment = "dev";
/*
$("#nome_remedio").val("Tylenol");
$("#dosagem").val("1 comprimido");
$("#intervalo-tempo").val("8");
$("#qnt-dias").val("3");
$("#dataInicio").val("11/02/2021");
$("#horaInicio").val("13");
*/
var config = {
    dev:{
        getTherapy:"http://localhost:3000/terapia/v1/main",
        getUser:"http://localhost:3000/terapia/v1/login/getlogueduser",
        createTherapy:"http://localhost:3000/terapia/v1/main/create-therapy",
        removeTherapy:"http://localhost:3000/terapia/v1/main/remove-therapy"
    },
    prod:{
        getTherapy:"https://www.vilawebserver.com/terapia/v1/main",
        getUser:"https://www.vilawebserver.com/terapia/v1/login/getlogueduser",
        createTherapy:"https://www.vilawebserver.com/terapia/v1/main/create-therapy",
        removeTherapy:"https://www.vilawebserver.com/terapia/v1/main/remove-therapy"
    }
}

var modalOpen = false;

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

var renderTemplate = function (terapiaCompleta){

    document.querySelector("#container__dados_remedio .conteudo__remedios").innerHTML = "";

    for(var i = 0; i < terapiaCompleta.length; i++){

        var dia = "";

        if(terapiaCompleta[i].dia.split("-").length > 1){
            [y,m,d] = terapiaCompleta[i].dia.split("-")
            m.length == 1? m="0" + m : void(0);
            dia = d + "/" + m + "/" + y
        }else{
            dia = terapiaCompleta[i].dia
        }

        var template = `<div class="col m4 s12 "><article class="card">
            <h4>${dia}</h4>`;
            
            for(var s = 0; s < terapiaCompleta[i].terapia.length; s++ ){
                var horarios = "";
                template+= `<article data-idterapia='${terapiaCompleta[i].terapia[s].idTerapia}'><div class="row therapy-name">
                    <div class="col s4 gray">Nome:</div>
                    <div class="col s8 hard-gray">${terapiaCompleta[i].terapia[s].nome}</div>
                </div>
                <div class="row">
                    <div class="col s4 gray">Dozagem:</div>
                    <div class="col s8 hard-gray">${terapiaCompleta[i].terapia[s].dosagem}</div>
                </div>`

                    for(var h = 0; h < terapiaCompleta[i].terapia[s].horas.length; h++){
                        var [hora, minuto] = terapiaCompleta[i].terapia[s].horas[h].split(":");
                        minuto == "0" ? minuto = "00" : minuto = minuto;

                        var horario = hora + ":" + minuto;

                        h == terapiaCompleta[i].terapia[s].horas.length -1?   horarios += horario : horarios += horario + ", ";
                    }
                
                template+= `<div class="row">
                    <div class="col s4 gray">Horários:</div>
                    <div class="col s8 hard-gray">${horarios} </div>
                </div>
                    <article class="edit-container">
                        <span class="material-icons" onclick="displayModalRemoverTerapia('${terapiaCompleta[i].terapia[s].idTerapia}')">
                            delete_forever
                        </span>
                        <span class="material-icons" onclick="statusCheck(this, '${terapiaCompleta[i].terapia[s].idTerapia}')">
                            check_box_outline_blank
                        </span>
                    </article>
                </article>`
            }
            
            template+= `</article><div>`;

            document.querySelector("#container__dados_remedio .conteudo__remedios").innerHTML += template;
    }

    document.querySelector("#container__dados_remedio").classList.add("onshow");

    document.querySelectorAll(".card").forEach(function(e){
        e.style.height = maiorCard() + "px";
     })

     window.location.hash = "";
     window.location.hash = "#container__dados_remedio";
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
    }

    //console.log(dadosUsuario);
    return dadosUsuario;
}

async function obterTerapia(dadosUsuario, token){
    var createTherapyUrl = config[environment].createTherapy;
    
    var responseData = await fetch(createTherapyUrl, {
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token':token
        },
        body:JSON.stringify(dadosUsuario)

    });

    data = await responseData.json();

    //get and render therapies
    if(data.success == true){
        var therapies = await getTherapies(config[environment].getTherapy, token);
        renderTemplate(therapies.terapia)
    }
    //console.log("data", data);
}

//TODO
async function removerTerapia(idTerapia){
    //TODO - chamar back remover terapia
    console.log("IDTERAPIA", idTerapia);
    var token  = localStorage.getItem('t-acess-token');
    var removerTerapia = await fetch(config[environment].removeTherapy + "/" + idTerapia, {
        method:'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'x-access-token':token
        }
    })

    data = await removerTerapia.json();

    if(data.success == true){
        var therapies = await getTherapies(config[environment].getTherapy, token);

        if(therapies.terapia.length > 0){
            renderTemplate(therapies.terapia);
            window.location.hash = "";
            window.location.hash = "#container__dados_remedio";
        }else{
            window.location.hash = "";
            window.location.hash = "#container__dados_usuario";
            document.querySelector("#container__dados_remedio").classList.remove("onshow");
        }

        //gravarTakedLocal();
        takedRender(JSON.parse(localStorage.getItem('taked')))

        openCloseModal();
    }
}

function novaTerapia(){
    closeModalNovaTerapia();
    
    document.querySelector("#container__dados_remedio").classList.remove("onshow");

    
    window.location.hash = "";
    window.location.hash = "#container__dados_usuario";

    

    var idsArray = []
    document.querySelectorAll("article").forEach((el)=>{
        
        if(el.hasAttribute('data-idterapia')){
            console.log("exec", el);
            var idterapia = el.getAttribute('data-idterapia');
            idsArray.includes(idterapia)? void(0) : idsArray.push(idterapia);
        }

        for(var i = 0; i < idsArray.length; i++){
            console.log("deleteTerapia", idsArray[i]);
            removerTerapia(idsArray[i]);
        }
    })

    document.querySelector(".conteudo__remedios").innerHTML = "";
    localStorage.removeItem('taked');
}

function displayModalTerapia(){
    document.querySelectorAll(".modal-terapia__display").forEach(function(el){
        el.style.display="block";
    })
}
function openCloseModal(){

    if(modalOpen == false){
        document.querySelector("#fundo-terapia-modal").style.display="block";
        document.querySelector(".modal__container").style.display="block";

        window.location.hash = "";
        window.location.hash = "#container__dados_usuario";
        
    }else{
        document.querySelector("#fundo-terapia-modal").style.display="none";
        document.querySelector(".modal__container").style.display="none";

        window.location.hash = "";
        window.location.hash = "#container__dados_remedio";
    }

    modalOpen = !modalOpen
}
function displayModalNovaTerapia(){
    var templateModal = `<div class="title">
    <h4>Importante!</h4>
</div>
<div>
    <p>Ao clicar em sim os dados da terapia serão perdidos.</p>
    <p> Deseja Continuar?</p>
</div>
<div class="btn__container">
    <button class="btn-small sm-mar--right" onclick="novaTerapia()">Sim</button>
    <button class="btn-small sm-mar--left" onclick="openCloseModal()">Não</button>
</div>`

    document.querySelector("#conteudo-modal").innerHTML = templateModal
    openCloseModal();
}

function displayModalRemoverTerapia(idTerapia){
    var templateModal = `<div class="title">
    <h4>Remover Medicamento</h4>
</div>
<div>
    <p>Ao clicar em sim os dados do remédio selecionado serão removidos</p>
    <p> Deseja Continuar?</p>
</div>
<div class="btn__container">
    <button class="btn-small sm-mar--right" onclick="removerTerapia(${idTerapia})">Sim</button>
    <button class="btn-small sm-mar--left" onclick="openCloseModal()">Não</button>
</div>`

    document.querySelector("#conteudo-modal").innerHTML = templateModal
    openCloseModal();
}

function statusCheck(element){
    console.log("CLICK");
    //console.log("INFO", info);
    console.log("el", element.textContent.trim())
    var icon = element.textContent.trim() === 'check_box_outline_blank' ? "check_box" : "check_box_outline_blank";
    element.textContent = icon;

    if(icon === "check_box"){
        element.parentElement.parentElement.style.opacity="0.3";
    }else{
        element.parentElement.parentElement.style.opacity="1";
    }

    gravarTakedLocal();
}

function closeModalNovaTerapia(){
    document.querySelector(".modal-terapia__display").style.display="none";
    document.querySelector(".modal__container").style.display="none";

    window.location.hash = "";
    window.location.hash = "#container__dados_remedio";
}

async function getTherapies(url, token){
    var response = await fetch(url, {
        method:"GET",
        headers:{
            'Content-Type': 'application/json',
            'x-access-token':token
        }
    })

    var data = await response.json();

    return data;
}

async function getUserName(url, token){
    console.log("url:", url);
    console.log("token:", token);
    var response = await fetch(url, {
        method:"GET",
        headers:{
            'x-access-token':token,
            'Content-Type': 'application/json'
        }
    })

    console.log("response", response)
    if(response.status != 200){
        //console.log(response.statusText);
        return "login"
    }

    var data = await response.json();

    return data.userName;
}

function logout(){
    localStorage.removeItem("t-acess-token");
    localStorage.removeItem("taked", "")
    location.assign('login_terapia.html', '_self');
}

//localstorage API
function gravarTakedLocal(){
    //executar se o objeto taked não existir no localStorage
    var taked = [];
    document.querySelectorAll(".card").forEach((card)=>{
        var pill = {
            dia: card.firstElementChild.textContent ,
            medicin:[]
        }

        for(var i = 0; i < card.children.length; i++){
            if(card.children[i].getAttribute('data-idterapia') != null){
                var med = {
                    id: card.children[i].getAttribute('data-idterapia'),
                    done: card.children[i].lastElementChild.children[1].textContent.trim() === 'check_box_outline_blank'? false : true
                }

                pill.medicin.push(med);
            }
        }

        taked.push(pill);
    })


    localStorage.setItem('taked', JSON.stringify(taked));
}

function takedRender(takedObj){
    takedObj.map((el, idx)=>{
        el.medicin.map((med, medIdx)=>{
            var medIdx = medIdx;
            if(med.done === true){
                for(var i = 0; i < document.querySelectorAll(".card")[idx].children.length; i++){
                    if(document.querySelectorAll(".card")[idx].children[i].getAttribute('data-idterapia') === med.id){
                        console.log(document.querySelectorAll(".card")[idx].children[i].lastElementChild.children[1])
                        statusCheck(document.querySelectorAll(".card")[idx].children[i].lastElementChild.children[1]);
                    
                    }
                }
            }

        })
    })
}

function localstorageAPIGravarERenderizar(){
    gravarTakedLocal();
    takedRender(JSON.parse(localStorage.getItem('taked')))
}

window.onload= async function(){
    
    var token = localStorage.getItem("t-acess-token");

    $('.date').mask('00/00/0000');
    $('.horario').mask('00:00');
    $('.number').mask('00');

    /** logued user name*/
    var nome =await getUserName(config[environment].getUser, token);
    if(nome === 'login'){
        location.assign("login_terapia.html", "_self");
        return false;
    }else{
        document.querySelector("#user-name").innerHTML = nome;
    }
    
    /**Check for therapies */
    console.log("token", token)
    var therapies = await getTherapies(config[environment].getTherapy, token);
    if(therapies.terapia){
        renderTemplate(therapies.terapia)
    }
    console.log(therapies.terapia)

    //verificando arquivo taked local
    if(localStorage['taked'] == null){
        gravarTakedLocal();
    }

    takedRender(JSON.parse(localStorage.getItem('taked')))
}


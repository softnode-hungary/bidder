import printPDF from './print';

const basePrintData = {
    'addressSender': {
        'person':'Horváth Péter E.V.',
        'street':'9561 Tokorcs',
        'city':'Szabadság utca 45.',
        'email':'horvathkapuk@gmail.com',
        'phone':'+36 20 260 2082'
    },
    'address': {
        'company':'Kiss András',
        'person':'+36 20 123 4567',
        'street':'9673 Káld',
        'city':'Deák Ferenc utca 49.',
    },
    'personalInfo': {
        'website': 'https://horvathkapuk.hu/',
        'bank': {
            'person':'Horváth Péter',
            'name':'OTP Bank',
            'Banszámlaszám':'11747037-21452512'
        },
        'taxoffice': {
            'number':'68419343-1-38'
        }
    },
    'label': {
        'invoicenumber':'Ajánlat azonosító:',
        'invoice':'Árajánlat',
        'tableItems':'Szolgáltatás/Termék',
        'tableQty':'Mennyiség',
        'tableSinglePrice':'Ár',
        'tableSingleTotal':'Összesen',
        'totalGrand':'Végösszeg',
        'contact':'Elérhetőségek',
        'bank':'Bankszámlaszám',
        'taxinfo':'Adószám',
    }
};
let today = new Date();
let dd = today.getDate();
let mm = today.getMonth()+1; 


let now=Date.now();
let afterday = ((60*1000)*60)*24;
let afterDate = new Date(now+(afterday*3)).toISOString().slice(0, 10);
    afterDate = afterDate.replaceAll('-', '. ');
    afterDate += '.'
    

const longPrintData = {
    'invoice': {
        'number':'00'+dd+'-00'+mm+'-1',
        'location':'Tokorcs',
        'date':'2021.09.05.',
        'subject':'Kerítés gyártására',
        'total':'6.724,00 €',
        'mainText':`\n\nEzen összeg tartalmazza a munkavégzés során felmerülő, gyártással, szereléssel, szállítással járó összes költséget. A munka megkezdése az árajánlat elfogadása, visszaigazolása után, ill. az előleg összegének bankszámlánkon történő jóváírása napjával, vagy készpénzbeni átvételének napjával kezdődik, 180 napos átadási határidővel. Az előleg összege a kialkudott végösszeg 50%-a. A felszerelés, átadás befejezését követően esedékes a végszámla kiegyenlítése a fennmaradó összeggel, amely a teljes összegről kerül kiállításra.`,
        'garancia': `Az általunk gyártott termékre 60 hónap garanciát vállalunk. A gyártás során vásárolt és beszerelt kész termékekre az eladó által biztosított garancia érvényes.`,
        'argarancia': `Vállaljuk, hogy az árajánlatban adott árainktól nem térünk el, ami többletköltséget jelentene  tisztelt megrendelőinknek. A szerződés utáni esetleges árváltozások többletkiadásait átvállaljuk. Az árajánlatban rögzített ártól eltérően csak a Megrendelő által kért külön munkáért számolunk fel plusz költséget, egy előzetesen kialkudott összegben.`,
        'nyilatkozat': `Kinyilatkozzuk, az általunk leírt árajánlat elfogadásra kerülés esetén minden pontjáért teljes körű felelősséget vállalunk.Az árajánlat elfogadása és aláírással történő hitelesítése esetén a továbbiakban szerződésként funkcionál.`,
        'szerzodes': `Az árajánlat elfogadása és aláírással történő hitelesítése esetén a továbbiakban szerződésként funkcionál.`,
        'kieg': `Az árajánlat megváltozott érvényessége a naponta frissülő anyagárak miatt: ${afterDate}`
    },
    'items': {
    }
};

let globalTotal = 0;
let idCount = 0;
let itemData = [];
import * as telepules from "./telepules.mjs";
let telepulesek = telepules.telepules;

function setMeta(key, val) {
    if (typeof(Storage) !== "undefined") { return window.localStorage.setItem(key, val); } 
}

function getMeta(key) {
    if (typeof(Storage) !== "undefined") { return window.localStorage.getItem(key); } 
}

function clearMeta(key) {
    if (typeof(Storage) !== "undefined") { return window.localStorage.removeItem(key); } 
}

function deleteMetas() {
    if (typeof(Storage) !== "undefined") { return window.localStorage.clear(); } 
}

function hasMeta(key)
{
    if (typeof(Storage) !== "undefined") { return (getMeta(key) !== undefined) ? getMeta(key) : null; } 
}

function saveMetas()
{
    setMeta('arajanlat-items', JSON.stringify(itemData));
    setMeta('arajanlat-customer', JSON.stringify({
        boxname: document.getElementById("box-name").value,
        boxcontact: document.getElementById("box-contact").value,
        myInput: document.getElementById("myInput").value,
        boxstreet: document.getElementById("box-street").value,
        boxsubject: document.getElementById("box-subject").value
    }));
}

window.onload = function() {
    init();    
};

async function init()
{
    let hasItems = hasMeta('arajanlat-items');
    if(hasItems !== null)
    {
        itemData = JSON.parse(hasItems);
        if(itemData.length > 0)
        {
            for(let i = 0; i < itemData.length; i++)
            {
                addItem(i, itemData[i].name, itemData[i].desc, itemData[i].amount, itemData[i].qty)
            }
        }
        refreshItemDivData();
    }

    let customer = hasMeta('arajanlat-customer');
    if(customer !== null)
    {
        let a = JSON.parse(customer)
        document.getElementById("box-name").value = a.boxname;
        document.getElementById("box-contact").value = a.boxcontact,
        document.getElementById("myInput").value = a.myInput;
        document.getElementById("box-street").value = a.boxstreet;
        document.getElementById("box-subject").value = a.boxsubject;
    }
}

function addItem(id, title, desc, amount, qty)
{
    let total = (qty*amount);
    longPrintData['items'][id] = {
        'title':title,
        'description':desc,
        'amount':amount,
        'qty':qty,
        'total': total
    }
    addGlobalTotal(amount*qty)
}

function addGlobalTotal(amount)
{
    globalTotal += amount;
}

document.getElementById('long').onclick = () => {
    globalTotal = 0;
    for(let i = 0; i < itemData.length; i++)
    {
        addItem(i, itemData[i].name, itemData[i].desc, Number(itemData[i].amount), Number(itemData[i].qty))
    }
    let todayDate = new Date().toISOString().slice(0, 10);
    todayDate = todayDate.replaceAll('-', '. ');
    todayDate += '.'
    basePrintData['address']['company'] = document.getElementById("box-name").value;
    basePrintData['address']['person'] = document.getElementById("box-contact").value;
    basePrintData['address']['street'] = document.getElementById("myInput").value;
    basePrintData['address']['city'] = document.getElementById("box-street").value;
    longPrintData['invoice']['subject'] = document.getElementById("box-subject").value;
    longPrintData['invoice']['date'] = todayDate.toString();
    longPrintData['invoice']['total'] = globalTotal.toLocaleString('hu') + " Ft";
    deleteMetas();
    printPDF(Object.assign(basePrintData, longPrintData));
};

document.getElementById('kisbut').onclick = () => {
    let name = document.getElementById("item-name").value;
    let desc = document.getElementById("item-desc").value;
    let qty = document.getElementById("item-qty").value;
    let amount = document.getElementById("item-amount").value;
    //addItem(idCount, name, desc, Number(amount), Number(qty))
    addGlobalTotal(amount*qty)
    itemData.push({name: name, desc: desc, qty: qty, amount: amount});
    refreshItemDivData();
    document.getElementById("item-name").value = '';
    document.getElementById("item-desc").value = '';
    document.getElementById("item-qty").value = '';
    document.getElementById("item-amount").value = '';
    saveMetas();
    idCount++;
};

function refreshItemDivData()
{
    var div = document.getElementById('itemtotal');
    div.innerHTML = "";
    for(let i = 0; i < itemData.length; i++)
    {
        
        div.innerHTML = div.innerHTML + `<div class="itemhehe"> ${i} <i class="far fa-times-circle deletebtn" style="color:#a81818;" onclick='deleteItem(${i})'></i> | <span class="itemhehe-2" id='itemname-${i}' contenteditable="true" oninput="setItemName(${i})">${itemData[i].name}</span> | <span class="itemhehe-2" contenteditable="true" id='itemdesc-${i}' oninput="setItemDesc(${i})">${itemData[i].desc}</span> | <span class="itemhehe-2"  id='itemqty-${i}' contenteditable="true" oninput="setItemQty(${i})">${itemData[i].qty}</span>x<span class="itemhehe-2" id='itemamount-${i}' contenteditable="true" oninput="setItemAmount(${i})">${itemData[i].amount}</span> |Összesen: <span class="itemhehe-2 infotext" id='itemtotal-${i}'">${itemData[i].amount * itemData[i].qty}</span> Ft</div>`;
    }
    let total = document.getElementById('totalval');
    total.innerHTML = `Végösszeg: ${globalTotal} Ft`;
}

global.setItemName = function(id)
{
    let newName = document.getElementById(`itemname-${id}`).innerHTML;
    longPrintData['items'][id].title = newName;
    itemData[id].name = newName;
    saveMetas();
}

global.setItemDesc = function(id)
{
    let newDesc = document.getElementById(`itemdesc-${id}`).innerHTML;
    longPrintData['items'][id].description = newDesc;
    itemData[id].desc = newDesc;
    saveMetas();
}

global.setItemQty = function(id)
{
    let newQty = document.getElementById(`itemqty-${id}`).innerHTML;
    itemData[id].qty = newQty;
    document.getElementById(`itemtotal-${id}`).innerHTML = newQty * itemData[id].amount;
    recalculateGlobalTotal();
    saveMetas();
}

global.setItemAmount = function (id)
{
    console.log(`${id} DATA: ${JSON.stringify(itemData)}`)
    let newAmount = document.getElementById(`itemamount-${id}`).innerHTML;

    itemData[id].amount = newAmount;
    document.getElementById(`itemtotal-${id}`).innerHTML = newAmount * itemData[id].qty;
    recalculateGlobalTotal();    
    saveMetas();
}

global.saveMetaChange = function()
{
    saveMetas();
}

function refreshGlobalData()
{
    let total = document.getElementById('totalval');
    total.innerHTML = `Végösszeg: ${globalTotal} Ft`
}

function recalculateGlobalTotal()
{
    globalTotal = 0;
    for(let i = 0; i < itemData.length; i++)
    {
        globalTotal += (itemData[i].qty * itemData[i].amount);
    }
    refreshGlobalData();
}

function deleteLastItem()
{
    idCount--;
    globalTotal -= (itemData[itemData.length - 1].amount*itemData[itemData.length - 1].qty);
    itemData.pop();
    refreshItemDivData()
    saveMetas();
}

global.deleteItem = function(i)
{
    idCount--;

    globalTotal -= (itemData[i].amount*itemData[i].qty);


    itemData.splice(i, 1);
    delete longPrintData['items'][i]

    refreshItemDivData()
    saveMetas();
}

function getUsedSlots()
{
    let freeSlots = [];
    if(itemData.length == 0) return 0;
    for(let i = 0; i < 100; i++)
    {
        if(!itemData[i]) freeSlots.push(i)
    }
    return (freeSlots.length == 0) ? false : freeSlots;
}
// SECTION IRSZ
const searchcountry = async searchBox => {
    let fits = telepulesek.filter(country => {
      const regex = new RegExp(`^${searchBox}`, 'gi');
      return country["Település"].match(regex) || country["IRSZ"].match(regex);
    });
    
    if (searchBox.length === 0) {
      fits = [];
    }
};

document.getElementById('myInput').addEventListener('input', () => searchcountry(myInput.value));
// !SECTION 
function autocomplete(inp, arr) {
    var currentFocus;
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        closeAllLists();
        if (!val) {
            return false;
        }
        currentFocus = -1;
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(a);
        for (i = 0; i < arr.length; i++) {
            if (arr[i]["Település"].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                b = document.createElement("DIV");
                b.innerHTML = "<strong>" + arr[i]["IRSZ"] + ' ' + arr[i]["Település"].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i]["Település"].substr(val.length);
                b.innerHTML += "<input type='hidden' value='" + arr[i]["IRSZ"] + ' ' + arr[i]["Település"] + "'>";
                b.addEventListener("click", function (e) {
                    inp.value = this.getElementsByTagName("input")[0].value;
                    closeAllLists();
                    saveMetas();
                });
                a.appendChild(b);
            }
        }
    });
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            currentFocus++;
            addActive(x);
        } else if (e.keyCode == 38) { //up
            currentFocus--;
            addActive(x);
        } else if (e.keyCode == 13) {
            e.preventDefault();
            if (currentFocus > -1) {
                if (x) x[currentFocus].click();
            }
        }
    });

    function addActive(x) {
        if (!x) return false;
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        x[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(x) {
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }

    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}
autocomplete(document.getElementById("myInput"), telepulesek);





//  DEBUG  

const https = require('https')

const cheerio = require('cheerio')

const options = {mode: "no-cors"}; // Ezt én raktam bele

const fetch = (method, url, payload=undefined) => new Promise((resolve, reject) => {
    https.get(
        url,
        {mode: "no-cors"}, // Zharko
        (res) => {
            
            const dataBuffers = []
            res.on('data', data => dataBuffers.push(data.toString('utf8')))
            res.on('end', () => resolve(dataBuffers.join('')))

        }
        
    ).on('error', reject)
})

const scrapeHtml = (url) => new Promise((resolve, reject) =>{

  fetch('GET', url)
  .then( (html) => {

    const cheerioPage = cheerio.load(html)

    const productTable = cheerioPage('table .basic')

    const cheerioProductTable = cheerio.load(productTable)
    const productRows = cheerioProductTable('tr')

    let i = 0
    let cheerioProdRow, prodRowText
    const productsTextData = []
    while(i < productRows.length) {
      cheerioProdRow = cheerio.load(productRows[i])
      prodRowText = cheerioProdRow.text().trim()
      productsTextData.push(prodRowText)
      i++
    }
    resolve(productsTextData)
  })
  .catch(reject)
})

scrapeHtml("https://www.tolnayvasker.hu/termekek/aceltermekek/horganyzott-zartszelveny/").then((data) => {

  console.log('data: ', data)
}).catch(err => console.log('err: ', err))

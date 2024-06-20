//my variables

var homeNav = document.querySelector('#home-nav');
var savedLocationsNav = document.querySelector('#saved-locations-nav');
var mainSection = document.querySelector('#main-section');
var savedLocationsSection = document.querySelector('#saved-locations-section');
var singleDaySection = document.querySelector('#single-day-section');
var textInput = document.querySelector('#city-search');
var findCityBtn = document.querySelector('#find-city-btn');
var mainInfoBox = document.querySelector('#main-info-box');
var savedLocationsBox = document.querySelector('#saved-locations-box');
var searchCol = mainInfoBox.children[0];
var mainURL = 'https://api.weatherapi.com/v1/forecast.json?key=cb410ecc28974ee8bc5140744241106&q=auto:ip&days=3';
var fullData;
var savedData;
var tempSaved = document.createElement('div');

//init
var cities = getSavedCities();
getWeather();
processSavedCities();
//functions


function getSavedCities() {
    var cities = localStorage.getItem('savedCities');
    if (cities != null) cities = JSON.parse(cities);
    else cities = [];
    return cities;
}

function setSavedCities() {
    localStorage.setItem('savedCities', JSON.stringify(cities));
}

textInput.addEventListener('keyup',function(e){
    if(e.key=='Enter'){
        removeElementsFromRow(mainInfoBox, 1);
        addLoader(mainInfoBox);
        var city = textInput.value;
        var url = `https://api.weatherapi.com/v1/forecast.json?key=cb410ecc28974ee8bc5140744241106&q=${city}&days=3`;
        textInput.blur();
        getWeatherByCity(url);
    }
})

findCityBtn.addEventListener('click', function () {
    removeElementsFromRow(mainInfoBox, 1);
    addLoader(mainInfoBox);
    var city = textInput.value;
    var url = `https://api.weatherapi.com/v1/forecast.json?key=cb410ecc28974ee8bc5140744241106&q=${city}&days=3`;
    getWeatherByCity(url);
});

homeNav.addEventListener('click', function () {
    homeNav.classList.add('active');
    savedLocationsNav.classList.remove('active');
    mainSection.classList.remove('d-none');
    savedLocationsSection.classList.add('d-none');
    singleDaySection.classList.add('d-none');
});

document.querySelector('.navbar-brand').addEventListener('click',function(){
    homeNav.classList.add('active');
    savedLocationsNav.classList.remove('active');
    mainSection.classList.remove('d-none');
    savedLocationsSection.classList.add('d-none');
    singleDaySection.classList.add('d-none');
    getWeather();
});

savedLocationsNav.addEventListener('click', function () {
    homeNav.classList.remove('active');
    savedLocationsNav.classList.add('active');
    mainSection.classList.add('d-none');
    savedLocationsSection.classList.remove('d-none');
    singleDaySection.classList.add('d-none');
})

async function fetchWeather(URL) {
    var url = await fetch(URL);
    if (!url.ok) {
        var data = await url.json();
        throw new Error(data.error.message);
    }
    var data = await url.json();
    fullData = data;
}

async function fetchWeatherForSavedLocations(URL) {
    var url = await fetch(URL);
    if (!url.ok) {
        var data = await url.json();
        throw new Error(data.error.message);
    }
    var data = await url.json();
    savedData = data;
}

function getWeatherByCity(url) {
    var weatherPromise = fetchWeather(url);
    weatherPromise.then(function () {
        textInput.value = '';
        display();
    }).catch(function (e) {
        displayError(locationNotFound(), mainInfoBox);
        document.getElementById('return-home').addEventListener('click', function () {
            removeElementsFromRow(mainInfoBox, 1);
            addLoader(mainInfoBox);
            textInput.value='';
            getWeather();
        });
    });
}

function getWeatherDataWithoutDisplay(city) {
    var url = `https://api.weatherapi.com/v1/forecast.json?key=cb410ecc28974ee8bc5140744241106&q=${city}&days=3`;
    var weatherPromise = fetchWeatherForSavedLocations(url);
    weatherPromise.then(function () {
        var obj = {
            temp: savedData.current.temp_c,
            condCode: savedData.current.condition.code,
            condText: savedData.current.condition.text,
            country: savedData.location.country
        }
        tempSaved.append(createSavedCityElement(city, obj));
        if (tempSaved.children.length == cities.length) {
            displaySavedCities();
        }
    }).catch(function (e) {
        var obj = {
            temp: '_',
            condCode: 5000,
            condText: '',
            country: ''
        }
        tempSaved.append(createSavedCityElement(city, obj));
        if (tempSaved.children.length == cities.length) {
            displaySavedCities();
        }
    });
}

function getWeather() {
    var weatherPromise = fetchWeather(mainURL);
    weatherPromise.then(function () {
        display();
    }).catch(function (e) {
        displayError(mainError(), mainInfoBox);
    });
}

function displayError(e, row) {
    removeElementsFromRow(row, 1);
    row.append(e);
}

function display() {
    removeElementsFromRow(mainInfoBox, 1);
    mainInfoBox.append(createCityElement());
    mainInfoBox.append(createTodayElement());
    mainInfoBox.append(createDayElement(1));
    mainInfoBox.append(createDayElement(2));
}

function createTodayElement() {
    var ele = document.createElement('div');
    ele.classList.add('col-lg-4');
    ele.style.cursor='pointer';
    ele.setAttribute('onclick',`viewDayDetails(0)`);
    ele.innerHTML = `
                    <div class="weather-card px-3 pb-5 pt-3">
                        <p class="text-center fs-4 week-day">${getDayOfTheWeek(fullData.current.last_updated)}, Today</p>
                        <h1 class="display-3 fw-semibold weather-degree">${fullData.current.temp_c}<sup>o</sup>c<span class="ms-4 fs-5 fw-normal">Now</span></h1>
                        <div class="bottom mt-4 mb-2">
                            <div class="row d-flex justify-content-center align-items-center">
                                <div class="col-sm-12 mb-3">
                                    <div class="icon-box" style="width: 60px;">
                                        <img src="https:${fullData.current.condition.icon}" class="w-100 condition-icon" alt="">
                                    </div>
                                    <p class="condition-text">${fullData.current.condition.text}</p>
                                </div>
                                <div class="col-sm-6 text-center">
                                    <p class="hi-lo">H: ${fullData.forecast.forecastday[0].day.maxtemp_c}<sup>o</sup>c</p>
                                </div>
                                <div class="col-sm-6 text-center">
                                    <p class="hi-lo">L: ${fullData.forecast.forecastday[0].day.mintemp_c}<sup>o</sup>c</p>
                                </div>
                            </div>
                        </div>
                    </div>
    `
    ele.children[0].style.backgroundImage = `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)),url('${getWeatherBackground(fullData.current.condition.code, fullData.current.condition.text, parseDateTime(fullData.location.localtime).time, fullData.forecast.forecastday[0].astro.sunset, fullData.forecast.forecastday[0].astro.sunrise)}')`;
    return ele;
}

function createDayElement(idx) {
    var ele = document.createElement('div');
    ele.classList.add('col-lg-4');
    ele.style.cursor='pointer';
    ele.setAttribute('onclick',`viewDayDetails(${idx})`);
    ele.innerHTML = `
                    <div class="weather-card px-3 pb-5 pt-3">
                        <p class="text-center fs-4 week-day">${getDayOfTheWeek(fullData.forecast.forecastday[idx].date)}</p>
                        <h1 class="display-3 fw-semibold weather-degree">${fullData.forecast.forecastday[idx].day.avgtemp_c}<sup>o</sup>c<span class="ms-4 fs-5 fw-normal">Average</span></h1>
                        <div class="bottom mt-4 mb-2">
                            <div class="row d-flex justify-content-center align-items-center">
                                <div class="col-sm-12 mb-3">
                                    <div class="icon-box" style="width: 60px;">
                                        <img src="https:${fullData.forecast.forecastday[idx].day.condition.icon}" class="w-100 condition-icon" alt="">
                                    </div>
                                    <p class="condition-text text-truncate">${fullData.forecast.forecastday[idx].day.condition.text}</p>
                                </div>
                                <div class="col-sm-6 text-center">
                                    <p class="hi-lo">H: ${fullData.forecast.forecastday[idx].day.maxtemp_c}<sup>o</sup>c</p>
                                </div>
                                <div class="col-sm-6 text-center">
                                    <p class="hi-lo">L: ${fullData.forecast.forecastday[idx].day.mintemp_c}<sup>o</sup>c</p>
                                </div>
                            </div>
                        </div>
                    </div>
    `
    ele.children[0].style.backgroundImage = `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)),url('${getWeatherBackground(fullData.forecast.forecastday[idx].day.condition.code, fullData.forecast.forecastday[idx].day.condition.text)}')`;
    return ele;
}

function removeElementsFromRow(row, index = 0) {
    while (row.children.length > index)
        row.removeChild(row.children[index]);
}

function addLoader(row) {
    var ele = document.createElement('div');
    var inner = document.createElement('div');
    var load = document.createElement('div');
    ele.classList.add('col-12');
    inner.classList.add('d-flex', 'justify-content-center', 'p-5', 'm-5');
    load.classList.add('loader');
    inner.append(load);
    ele.append(inner);
    row.append(ele);
}
function displayNosaved(row) {
    var ele = document.createElement('div');
    var inner = document.createElement('div');
    var p = document.createElement('h3');
    p.style.color='#eee'
    ele.classList.add('col-12');
    inner.classList.add('d-flex', 'justify-content-center', 'p-5', 'm-5');
    p.textContent='Your saved locations will be shown here';
    inner.append(p);
    ele.append(inner);
    row.append(ele);
}

function locationNotFound() {
    var ele = document.createElement('div');
    var inner = document.createElement('div');
    var errMsg = document.createElement('p');
    var btn = document.createElement('button');
    ele.classList.add('col-12');
    inner.classList.add('d-flex', 'flex-column', 'justify-content-center', 'p-5', 'm-5');
    errMsg.classList.add('err-msg', 'text-center', 'fs-3');
    errMsg.innerHTML = `
    Location not found</br>Make sure you type the location correctly
    `;
    btn.innerText = 'Use current location';
    btn.classList.add('rounded-pill', 'px-4', 'mt-3', 'btn', 'btn-outline-primary');
    btn.setAttribute('id', 'return-home');
    inner.append(errMsg);
    inner.append(btn);
    ele.append(inner);
    return ele;
}

function mainError() {
    var ele = document.createElement('div');
    var inner = document.createElement('div');
    var errMsg = document.createElement('p');
    ele.classList.add('col-12');
    inner.classList.add('d-flex', 'flex-column', 'justify-content-center', 'p-5', 'm-5');
    errMsg.classList.add('err-msg', 'text-center', 'fs-3');
    errMsg.innerHTML = `
    Something went wrong</br>Please try again later
    `;
    inner.append(errMsg);
    ele.append(inner);
    return ele;
}

function createCityElement() {
    var city = fullData.location.name;
    var ele = document.createElement('div');
    ele.classList.add('col-12');
    var inner = document.createElement('div');
    inner.classList.add('rounded-pill', 'd-flex', 'flex-md-row', 'flex-column', 'justify-content-between', 'align-items-center', 'p-3', 'align-items-center', 'bg-white');
    var cityName = document.createElement('p');
    cityName.classList.add('city-name', 'my-auto', 'text-black', 'fw-semibold');
    cityName.innerHTML = `<i class="fa-solid fa-map-pin me-2 text-danger"></i>${city}, ${fullData.location.country}`;
    var date = document.createElement('p');
    date.classList.add('today-date', 'my-auto', 'text-black', 'fw-semibold');
    var dateString = parseDateTime(fullData.location.localtime);
    date.innerHTML = dateString.date + '&nbsp;&nbsp;&nbsp;' + dateString.time;
    var saveBtn = document.createElement('span');
    saveBtn.style.cursor = 'pointer';
    var state = 'not-saved';
    var caption = 'Save this location';
    if (cities.includes(city)) state = 'saved', caption = 'Unsave this location';
    saveBtn.setAttribute('title', caption);
    saveBtn.classList.add('ms-4')
    saveBtn.innerHTML = `<i class="fa-solid fa-bookmark ${state}"></i>`;
    inner.append(cityName);
    inner.append(date);
    date.append(saveBtn);
    ele.append(inner);
    saveBtn.addEventListener('click', function () {
        var url = `https://api.weatherapi.com/v1/forecast.json?key=cb410ecc28974ee8bc5140744241106&q=${city}&days=3`;
        var arr = [];
        if (!cities.includes(city)) cities.push(city);
        else {
            for (let i = 0; i < cities.length; i++) {
                if (cities[i] == city) continue;
                arr.push(cities[i]);
            }
            cities = arr;
        }
        setSavedCities();
        removeElementsFromRow(mainInfoBox, 1);
        addLoader(mainInfoBox);
        getWeatherByCity(url);
        processSavedCities();
    });
    return ele;
}

function goToWebPage(url) {
    open(url);
}

function createSavedCityElement(city, obj) {
    var ele = document.createElement('div');
    ele.style.cursor = 'pointer';
    ele.classList.add('col-12', 'saved-city-element');
    ele.style.backgroundImage = `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url(${getWeatherBackground(obj.condCode, obj.condText)})`;
    ele.innerHTML = `
                    <div class="inner p-3">
                        <p class="display-5 fw-semibold mb-3 text-truncate" style="text-shadow: 2px 4px 3px rgba(0,0,0,0.3);">${city}, ${obj.country}</p>
                        <p class="h3" style="text-shadow: 2px 4px 3px rgba(0,0,0,0.3);">${obj.temp}<sup> o </sup>c</p>
                    </div>
    `
    ele.setAttribute('onclick',`viewCityFromSaved('${city}')`);
    return ele;
}

function viewCityFromSaved(city) {
    var url = `https://api.weatherapi.com/v1/forecast.json?key=cb410ecc28974ee8bc5140744241106&q=${city}&days=3`;
    homeNav.classList.add('active');
    savedLocationsNav.classList.remove('active');
    mainSection.classList.remove('d-none');
    savedLocationsSection.classList.add('d-none');
    singleDaySection.classList.add('d-none');
    getWeatherByCity(url);
}

function processSavedCities() {
    removeElementsFromRow(savedLocationsBox);
    addLoader(savedLocationsBox);
    for (let i = 0; i < cities.length; i++) {
        getWeatherDataWithoutDisplay(cities[i]);
    }
    removeElementsFromRow(savedLocationsBox);
    if(cities.length==0) displayNosaved(savedLocationsBox);
}


function displaySavedCities() {
    removeElementsFromRow(savedLocationsBox);
    savedLocationsBox.innerHTML = tempSaved.innerHTML;
    tempSaved = document.createElement('div');
}

function viewDayDetails(idx){
    homeNav.classList.remove('active');
    savedLocationsNav.classList.remove('active');
    mainSection.classList.add('d-none');
    savedLocationsSection.classList.add('d-none');
    singleDaySection.classList.remove('d-none');
    var myDay = fullData.forecast.forecastday[idx];
    var locName = document.querySelector('#location-name');
    var titleBox = document.querySelector('#title-box');
    var dateBox = document.querySelector('#date-box');
    var avgTemp = document.querySelector('#avg-temp');
    var condText = document.querySelector('#cond-text');
    var iconForSingleDay = document.querySelector('#icon-for-single-day');
    var someDetails = document.querySelector('#some-details').children;
    var astro = document.querySelector('#astro').children;
    var perHour = document.querySelector('#hourly').children;
    locName.innerHTML = fullData.location.name+', '+fullData.location.country;
    dateBox.innerHTML=parseDate(myDay.date);
    avgTemp.innerHTML=myDay.day.avgtemp_c+'<sup>o</sup>c';
    iconForSingleDay.setAttribute('src',`https:${myDay.day.condition.icon}`);
    condText.innerHTML = myDay.day.condition.text;
    titleBox.style.backgroundImage=`linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)),url('${getWeatherBackground(myDay.day.condition.code, myDay.day.condition.text)}`;
    someDetails[0].children[1].innerHTML=myDay.day.avgtemp_c+`<sup>o</sup>c`;
    someDetails[1].children[1].innerHTML=myDay.day.maxtemp_c+`<sup>o</sup>c`;
    someDetails[2].children[1].innerHTML=myDay.day.mintemp_c+`<sup>o</sup>c`;
    someDetails[3].children[1].innerHTML=myDay.day.daily_chance_of_rain+'%';
    someDetails[4].children[1].innerHTML=myDay.day.maxwind_kph+' kph';
    someDetails[5].children[1].innerHTML=myDay.day.avghumidity;
    someDetails[6].children[1].innerHTML=myDay.day.uv;
    astro[1].children[2].innerHTML = myDay.astro.sunrise;
    astro[2].children[2].innerHTML = myDay.astro.sunset;
    astro[3].children[2].innerHTML = myDay.astro.moonrise;
    astro[4].children[2].innerHTML = myDay.astro.moonset;
    for(let i = 0; i < perHour.length; i++){
        perHour[i].children[0].innerHTML=parseDateTime(myDay.hour[i].time).time;
        perHour[i].children[1].innerHTML=myDay.hour[i].temp_c+'<sup>o</sup>c';
        var src = 'https:'+myDay.hour[i].condition.icon;
        perHour[i].children[2].innerHTML=`
            <div class=" d-flex justify-content-start align-items-center">
            <div style="width: 35px" class="me-2"><img src="${src}" class="w-100"></div>
            ${myDay.hour[i].condition.text}
            </div>
        `;
        perHour[i].children[3].innerHTML = myDay.hour[i].humidity;
        perHour[i].children[4].innerHTML = myDay.hour[i].wind_kph+' kph';
    }
}

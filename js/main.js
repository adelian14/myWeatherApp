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
var timeSaved = getSavedTimes();
if(cities.length!=timeSaved.length){
    while(timeSaved.length < cities.length){
        timeSaved.push(1000000000+timeSaved.length);
    }
    setSavedCities();
}
tryPreciseLocation();
processSavedCities();
//functions


function tryPreciseLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (p) {
            let lat = roundStr(p.coords.latitude);
            let lon = roundStr(p.coords.longitude);
            let city = lat + ',' + lon;
            url = `https://api.weatherapi.com/v1/forecast.json?key=cb410ecc28974ee8bc5140744241106&q=${city}&days=3`;
            getWeatherByCity(url);
        }, function (err) {
            getWeather();
        })
    }
    else {
        getWeather();
    }
}

function getSavedCities() {
    var cities = localStorage.getItem('savedCities');
    if (cities != null) cities = JSON.parse(cities);
    else cities = [];
    return cities;
}

function getSavedTimes() {
    var times = localStorage.getItem('savedTimes');
    if (times != null) times = JSON.parse(times);
    else times = [];
    return times;
}

function setSavedCities() {
    localStorage.setItem('savedCities', JSON.stringify(cities));
    localStorage.setItem('savedTimes', JSON.stringify(timeSaved));
}

textInput.addEventListener('keyup', function (e) {
    if (e.key == 'Enter') {
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
    if(mainInfoBox.children.length > 3){
        var saveBtn = document.querySelector('.save-btn');
        var lookupCity = saveBtn.getAttribute('citykey');
        var state = 'not-saved';
        var caption = 'Save this location';
        if (cities.includes(lookupCity)) state = 'saved', caption = 'Unsave this location';
        saveBtn.setAttribute('title', caption);
        saveBtn.innerHTML = `<i class="fa-solid fa-bookmark ${state}"></i>`;
    }
});

document.querySelector('.navbar-brand').addEventListener('click', function () {
    homeNav.classList.add('active');
    savedLocationsNav.classList.remove('active');
    mainSection.classList.remove('d-none');
    savedLocationsSection.classList.add('d-none');
    singleDaySection.classList.add('d-none');
    removeElementsFromRow(mainInfoBox, 1);
    addLoader(mainInfoBox);
    tryPreciseLocation();
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
            textInput.value = '';
            tryPreciseLocation();
        });
    });
}

function getWeatherDataWithoutDisplay(lookupCity,lookupTime) {
    var url = `https://api.weatherapi.com/v1/forecast.json?key=cb410ecc28974ee8bc5140744241106&q=${lookupCity}&days=3`;
    var weatherPromise = fetchWeatherForSavedLocations(url);
    weatherPromise.then(function () {
        var obj = {
            time: lookupTime,
            city: savedData.location.name,
            temp: savedData.current.temp_c,
            condCode: savedData.current.condition.code,
            condText: savedData.current.condition.text,
            country: savedData.location.country
        }
        tempSaved.append(createSavedCityElement(lookupCity, obj));
        if (tempSaved.children.length == cities.length) {
            displaySavedCities();
        }
    }).catch(function (e) {
        var obj = {
            time: lookupTime,
            city: lookupCity,
            temp: '_',
            condCode: 5000,
            condText: '',
            country: ''
        }
        console.log(e);
        tempSaved.append(createSavedCityElement(lookupCity, obj));
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
    ele.classList.add('col-lg-4', 'col-md-6');
    ele.innerHTML = `
                    <div class="weather-card px-3 pb-lg-3 pt-3">
                        <button class="cssbuttons-io-button m-auto fs-5 mb-4 fw-semibold rounded-pill" onclick="viewDayDetails(0)">
                        ${getDayOfTheWeek(fullData.current.last_updated)}, Today
                        <div class="icon rounded-pill">
                            <svg
                            height="24"
                            width="24"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path d="M0 0h24v24H0z" fill="none"></path>
                            <path
                                d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                                fill="currentColor"
                            ></path>
                            </svg>
                        </div>
                        </button>

                        <!-- <p class="text-center fs-4 week-day rounded-pill px-4" onclick="viewDayDetails(0)">${getDayOfTheWeek(fullData.current.last_updated)}, Today<span class="arrow-icon"><i class="fa-solid fa-arrow-right"></i></span></p> -->
                        <h1 class="display-3 fw-semibold weather-degree">${fullData.current.temp_c}<sup>o</sup>c<span class="ms-4 fs-5 fw-normal">Now</span></h1>
                        <div class="bottom mt-4 mb-2">
                            <div class="row d-flex justify-content-center align-items-center">
                                <div class="col-lg-12 col-4 mb-3">
                                    <div class="icon-box" style="width: 60px;">
                                        <img src="https:${fullData.current.condition.icon}" class="w-100 condition-icon" alt="">
                                    </div>
                                    <p class="condition-text">${fullData.current.condition.text}</p>
                                </div>
                                <div class="col-lg-6 col-4 text-center">
                                    <p class="hi-lo">H: ${fullData.forecast.forecastday[0].day.maxtemp_c}<sup>o</sup>c</p>
                                </div>
                                <div class="col-lg-6 col-4 text-center">
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
    ele.classList.add('col-lg-4', 'col-md-6');
    ele.innerHTML = `
                    <div class="weather-card px-3 pb-lg-3 pt-3">
                        <button class="cssbuttons-io-button m-auto fs-5 mb-4 fw-semibold rounded-pill" onclick="viewDayDetails(${idx})">
                        ${getDayOfTheWeek(fullData.forecast.forecastday[idx].date)}
                        <div class="icon rounded-pill">
                            <svg
                            height="24"
                            width="24"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                            >
                            <path d="M0 0h24v24H0z" fill="none"></path>
                            <path
                                d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z"
                                fill="currentColor"
                            ></path>
                            </svg>
                        </div>
                        </button>
                        <!--<p class="text-center fs-4 week-day rounded-pill px-4" onclick="viewDayDetails(${idx})">${getDayOfTheWeek(fullData.forecast.forecastday[idx].date)}<span class="arrow-icon"><i class="fa-solid fa-arrow-right"></i></span></p>-->
                        <h1 class="display-3 fw-semibold weather-degree">${fullData.forecast.forecastday[idx].day.avgtemp_c}<sup>o</sup>c<span class="ms-4 fs-5 fw-normal">Average</span></h1>
                        <div class="bottom mt-4 mb-2">
                            <div class="row d-flex justify-content-center align-items-center">
                                <div class="col-lg-12 col-4 mb-3">
                                    <div class="icon-box" style="width: 60px;">
                                        <img src="https:${fullData.forecast.forecastday[idx].day.condition.icon}" class="w-100 condition-icon" alt="">
                                    </div>
                                    <p class="condition-text text-truncate">${fullData.forecast.forecastday[idx].day.condition.text}</p>
                                </div>
                                <div class="col-lg-6 col-4 text-center">
                                    <p class="hi-lo">H: ${fullData.forecast.forecastday[idx].day.maxtemp_c}<sup>o</sup>c</p>
                                </div>
                                <div class="col-lg-6 col-4 text-center">
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
    load.classList.add('container-loader');
    load.innerHTML = `
                            <div class="cloud front">
                                <span class="left-front"></span>
                                <span class="right-front"></span>
                            </div>
                            <span class="sun sunshine"></span>
                            <span class="sun"></span>
                            <div class="cloud back">
                                <span class="left-back"></span>
                                <span class="right-back"></span>
                            </div>
    `
    inner.append(load);
    ele.append(inner);
    row.append(ele);
}
function displayNosaved(row) {
    removeElementsFromRow(row);
    var ele = document.createElement('div');
    var inner = document.createElement('div');
    var p = document.createElement('h3');
    p.style.color = '#eee'
    ele.classList.add('col-12');
    inner.classList.add('d-flex', 'justify-content-center', 'p-2', 'm-2');
    p.textContent = 'Your saved locations will be shown here';
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
    var lookupCity = fullData.location.lat + ',' + fullData.location.lon;
    var lookupTime = fullData.location.localtime_epoch;
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
    if (cities.includes(lookupCity)) state = 'saved', caption = 'Unsave this location';
    saveBtn.setAttribute('title', caption);
    saveBtn.setAttribute('citykey',lookupCity);
    saveBtn.classList.add('save-btn');
    saveBtn.classList.add('ms-4')
    saveBtn.innerHTML = `<i class="fa-solid fa-bookmark ${state}"></i>`;
    inner.append(cityName);
    inner.append(date);
    date.append(saveBtn);
    ele.append(inner);
    saveBtn.addEventListener('click', function () {
        var url = `https://api.weatherapi.com/v1/forecast.json?key=cb410ecc28974ee8bc5140744241106&q=${lookupCity}&days=3`;
        var arr = [];
        var t = [];
        if (!cities.includes(lookupCity)) cities.push(lookupCity),timeSaved.push(lookupTime);
        else {
            for (let i = 0; i < cities.length; i++) {
                if (cities[i] == lookupCity) continue;
                arr.push(cities[i]);
                t.push(timeSaved[i]);
            }
            cities = arr;
            timeSaved = t;
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

function deleteCityFromSaved(cityKey) {
    var arr = [];
    var t = [];
    for (let i = 0; i < cities.length; i++) {
        if (cities[i] == cityKey) continue;
        arr.push(cities[i]);
        t.push(timeSaved[i]);
    }
    cities = arr;
    timeSaved = t;
    setSavedCities();
    processSavedCities();
}

function createSavedCityElement(lookupCity, obj) {
    var ele = document.createElement('div');
    ele.classList.add('col-12', 'saved-city-element', 'd-flex', 'justify-content-between', 'align-items-center');
    ele.setAttribute('time', `${obj.time}`);
    ele.style.backgroundImage = `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)), url(${getWeatherBackground(obj.condCode, obj.condText)})`;
    ele.innerHTML = `
                    <div class="inner p-lg-3 p-1 flex-grow-1 overflow-hidden">
                        <p class="h2 fw-semibold mb-3 text-truncate" style="text-shadow: 2px 4px 3px rgba(0,0,0,0.3);">${obj.city}, ${obj.country}</p>
                        <p class="h4" style="text-shadow: 2px 4px 3px rgba(0,0,0,0.3);">${obj.temp}<sup> o </sup>c</p>
                    </div>
                    <div>
                    <button class="bin-button me-lg-4" onclick="deleteCityFromSaved('${lookupCity}')">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 39 7"
    class="bin-top"
  >
    <line stroke-width="4" stroke="white" y2="5" x2="39" y1="5"></line>
    <line
      stroke-width="3"
      stroke="white"
      y2="1.5"
      x2="26.0357"
      y1="1.5"
      x1="12"
    ></line>
  </svg>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 33 39"
    class="bin-bottom"
  >
    <mask fill="white" id="path-1-inside-1_8_19">
      <path
        d="M0 0H33V35C33 37.2091 31.2091 39 29 39H4C1.79086 39 0 37.2091 0 35V0Z"
      ></path>
    </mask>
    <path
      mask="url(#path-1-inside-1_8_19)"
      fill="white"
      d="M0 0H33H0ZM37 35C37 39.4183 33.4183 43 29 43H4C-0.418278 43 -4 39.4183 -4 35H4H29H37ZM4 43C-0.418278 43 -4 39.4183 -4 35V0H4V35V43ZM37 0V35C37 39.4183 33.4183 43 29 43V35V0H37Z"
    ></path>
    <path stroke-width="4" stroke="white" d="M12 6L12 29"></path>
    <path stroke-width="4" stroke="white" d="M21 6V29"></path>
  </svg>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 89 80"
    class="garbage"
  >
    <path
      fill="white"
      d="M20.5 10.5L37.5 15.5L42.5 11.5L51.5 12.5L68.75 0L72 11.5L79.5 12.5H88.5L87 22L68.75 31.5L75.5066 25L86 26L87 35.5L77.5 48L70.5 49.5L80 50L77.5 71.5L63.5 58.5L53.5 68.5L65.5 70.5L45.5 73L35.5 79.5L28 67L16 63L12 51.5L0 48L16 25L22.5 17L20.5 10.5Z"
    ></path>
  </svg>
</button>

                    </div>
    `
    ele.children[0].style.cursor = 'pointer';
    ele.children[0].setAttribute('onclick', `viewCityFromSaved('${lookupCity}')`);
    return ele;
}

function viewCityFromSaved(city) {
    var url = `https://api.weatherapi.com/v1/forecast.json?key=cb410ecc28974ee8bc5140744241106&q=${city}&days=3`;
    homeNav.classList.add('active');
    savedLocationsNav.classList.remove('active');
    mainSection.classList.remove('d-none');
    savedLocationsSection.classList.add('d-none');
    singleDaySection.classList.add('d-none');
    removeElementsFromRow(mainInfoBox, 1);
    addLoader(mainInfoBox);
    getWeatherByCity(url);
}

function processSavedCities() {
    removeElementsFromRow(savedLocationsBox);
    addLoader(savedLocationsBox);
    for (let i = 0; i < cities.length; i++) {
        getWeatherDataWithoutDisplay(cities[i],timeSaved[i]);
    }
    if (cities.length == 0) displayNosaved(savedLocationsBox);
}


function displaySavedCities() {
    removeElementsFromRow(savedLocationsBox);
    var arr=[];
    for(let i = 0; i < tempSaved.children.length; i++){
        arr.push(tempSaved.children[i]);
    }
    arr.sort((a,b)=>{
        let x = +a.getAttribute('time');
        let y = +b.getAttribute('time');
        return y-x;
    });
    for(let i = 0; i < arr.length; i++) savedLocationsBox.append(arr[i]);
}

function viewDayDetails(idx) {
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
    locName.innerHTML = fullData.location.name + ', ' + fullData.location.country;
    dateBox.innerHTML = parseDate(myDay.date);
    avgTemp.innerHTML = myDay.day.avgtemp_c + '<sup>o</sup>c';
    iconForSingleDay.setAttribute('src', `https:${myDay.day.condition.icon}`);
    condText.innerHTML = myDay.day.condition.text;
    titleBox.style.backgroundImage = `linear-gradient(rgba(0,0,0,.5),rgba(0,0,0,.5)),url('${getWeatherBackground(myDay.day.condition.code, myDay.day.condition.text)}`;
    someDetails[0].children[1].innerHTML = myDay.day.avgtemp_c + `<sup>o</sup>c`;
    someDetails[1].children[1].innerHTML = myDay.day.maxtemp_c + `<sup>o</sup>c`;
    someDetails[2].children[1].innerHTML = myDay.day.mintemp_c + `<sup>o</sup>c`;
    someDetails[3].children[1].innerHTML = myDay.day.daily_chance_of_rain + '%';
    someDetails[4].children[1].innerHTML = myDay.day.maxwind_kph + ' kph';
    someDetails[5].children[1].innerHTML = myDay.day.avghumidity;
    someDetails[6].children[1].innerHTML = myDay.day.uv;
    astro[1].children[2].innerHTML = myDay.astro.sunrise;
    astro[2].children[2].innerHTML = myDay.astro.sunset;
    astro[3].children[2].innerHTML = myDay.astro.moonrise;
    astro[4].children[2].innerHTML = myDay.astro.moonset;
    for (let i = 0; i < perHour.length; i++) {
        perHour[i].children[0].innerHTML = parseDateTime(myDay.hour[i].time).time;
        perHour[i].children[1].innerHTML = myDay.hour[i].temp_c + '<sup>o</sup>c';
        var src = 'https:' + myDay.hour[i].condition.icon;
        perHour[i].children[2].innerHTML = `
            <div class=" d-flex justify-content-start align-items-center">
            <div style="width: 35px" class="me-2"><img src="${src}" class="w-100"></div>
            ${myDay.hour[i].condition.text}
            </div>
        `;
        perHour[i].children[3].innerHTML = myDay.hour[i].humidity;
        perHour[i].children[4].innerHTML = myDay.hour[i].wind_kph + ' kph';
    }
}

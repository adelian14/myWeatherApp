var monthsArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
var dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function roundStr(x){
    x=''+x;
    let y = '';
    for(let i = 0; i < x.length; i++){
        y+=x[i];
        if(x[i]=='.'){
            for(let j = i+1; j < Math.min(x.length,i+3); j++){
                y+=x[j];
            }
            return y;
        }
    }
    return y;
}

var weatherPictures = {
    night: {
        clear: './images/night/default.jpg',
        cloudy: './images/night/cloudy.jpg',
        partlyCloudy: './images/night/partlyCloudy.jpg',
        overCast: './images/night/overcast.jpg',
        mist: './images/night/mist.jpg',
        fog: './images/night/fog.jpg',
        rain: './images/night/rain.jpg',
        heavyRain: './images/night/rain2.jpg',
        snow: './images/night/snow.jpg',
        thunder: './images/night/thunder3.webp',
        default: './images/night/default2.jpg'
    },
    day: {
        clear: './images/day/clear.jpg',
        cloudy: './images/day/cloudy.jpg',
        partlyCloudy: './images/day/partlyCloudy2.jpg',
        overCast: './images/day/overcast.jpg',
        mist: './images/day/mist.jpg',
        fog: './images/day/fog.jpg',
        rain: './images/day/rain2.jpg',
        heavyRain: './images/day/rain2.jpg',
        snow: './images/day/snow.jpg',
        thunder: './images/day/thunder3.webp',
        default: './images/day/default.jpg'
    },
    dawn: {
        clear: './images/dawn/clear.jpg',
        cloudy: './images/dawn/cloudy.jpg',
        partlyCloudy: './images/dawn/cloudy.jpg',
        overCast: './images/dawn/overcast.jpg',
        mist: './images/dawn/mist.jpg',
        fog: './images/dawn/fog.jpg',
        rain: './images/dawn/rain2.jpg',
        heavyRain: './images/dawn/rain2.jpg',
        snow: './images/dawn/snow.jpg',
        thunder: './images/dawn/thunder3.webp',
        default: './images/dawn/default.jpg'
    },
    sunset: {
        clear: './images/sunset/clear.jpg',
        cloudy: './images/sunset/cloudy.jpg',
        partlyCloudy: './images/sunset/cloudy.jpg',
        overCast: './images/sunset/overcast.jpg',
        mist: './images/sunset/mist.jpg',
        fog: './images/sunset/fog.jpg',
        rain: './images/sunset/rain2.jpg',
        heavyRain: './images/sunset/rain2.jpg',
        snow: './images/sunset/snow.jpg',
        thunder: './images/sunset/thunder3.webp',
        default: './images/sunset/default.jpg'
    }
}
var parseDate = (str) => {
    var arr = str.split('-');
    var temp = arr[0];
    arr[0] = arr[2];
    arr[2] = temp;
    arr[1] = monthsArray[+arr[1] - 1];
    var sp = ' ';
    return arr.join(sp);
}
var parseTime = (str) => {
    var arr = str.split(':');
    arr[0] = +arr[0];
    arr[1] = +arr[1];
    if (arr[0] >= 12) arr[0] -= 12, arr.push('PM');
    else arr.push('AM');
    if (arr[0] == 0) arr[0] = 12;
    if (arr[0] < 10) arr[0] = '0' + arr[0];
    if (arr[1] < 10) arr[1] = '0' + arr[1];
    return arr[0] + ':' + arr[1] + ' ' + arr[2];
}
var parseDateTime = (str) => {
    var arr = str.split(' ');
    return {
        date: parseDate(arr[0]),
        time: parseTime(arr[1])
    }
}
var convertToMinutes = (time) => {
    var arr = time.split(' ');
    var t = arr[0].split(':');
    t[0] = +t[0];
    t[1] = +t[1];
    if (arr[1] == 'PM') t[0] += 12;
    return t[0] * 60 + t[1];
}
var absDiff = (x, y) => {
    if (x > y) return x - y;
    return y - x;
}
var getTimeOfDay = (time, sunset, sunrise) => {
    var x = convertToMinutes(time);
    var y = convertToMinutes(sunset);
    var z = convertToMinutes(sunrise);
    if(absDiff(x,y) <= 30) return weatherPictures.sunset;
    if(x >= z && absDiff(x,z) <= 30) return weatherPictures.dawn;
    if(x <= y && x >= z) return weatherPictures.day;
    return weatherPictures.night;
}
var getWeatherBackground = (weatherCode, condition , time = '01:00 PM', sunset = '07:00 PM', sunrise = '05:00 AM') => {
    var pics = getTimeOfDay(time,sunset,sunrise);
    condition = condition.toLocaleLowerCase();
    if(weatherCode==1000) return pics.clear;
    if(weatherCode==1003) return pics.partlyCloudy;
    if(weatherCode==1006) return pics.cloudy;
    if(weatherCode==1009) return pics.overCast;
    if(weatherCode==1030) return pics.mist;
    if(weatherCode==1135 || weatherCode==1147) return pics.fog;
    if(condition.includes('snow') || condition.includes('ice')) return pics.snow;
    if(condition.includes('thunder')) return pics.thunder;
    if(condition.includes('rain') && (condition.includes('heavy') || condition.includes('shower'))) return pics.heavyRain;
    if(condition.includes('rain')) return pics.rain;
    return pics.default;
}
var getDayOfTheWeek=(time)=>{
    var x = new Date(time);
    return dayNames[x.getDay()];
}

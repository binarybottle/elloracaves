var homedomain = window.location.origin+'/';
// function getLocation() {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(showPosition);
//     } else { 
      // console.log("Geolocation is not supported by this browser.");
//       weatherBalloon();
//     }
//   }

// var lat = 19.0760,
//     long = 72.8777;
// function showPosition(position) {
//     lat = position.coords.latitude ;
//     long = position.coords.longitude;
//     weatherBalloon();
// }
// getLocation();
var lat = 19.0760,
    cityname = 'Mumbai-',
    long = 72.8777;
    // $.get("https://ipinfo.io", function (response) {
    //     cityname =  response.city;
    //     lat =  response.loc.split(',')[0];
    //     long =  response.loc.split(',')[1];
    //     weatherBalloon();
    //     apipollution()
    //     $('.cityname').html(cityname);
    //     if(cityname!='Mumbai'){
    //         $('.cityhref').removeAttr('href');
    //     }
    // }, "jsonp");

// function weatherBalloon() {
//     fetch("https://api.openweathermap.org/data/2.5/forecast?lat="+lat+"&lon="+long+"&units=metric&appid=9fcf6f30b6aef921768d835ce661294f")
//         .then(function (e) {
//             return e.json();
//         })
//         .then(function (e) {
//             var n = Math.round(e.list[0].main.temp),
//                 t = Math.round(e.list[0].main.temp_max),
//                 a = Math.round(e.list[0].main.temp_min),
//                 weatherid = Math.round(e.list[0].weather[0].id),
//                 weatherdesc = e.list[0].weather[0].description,
//                 i = e.city.name,
//                 m = e.city.country,
//                 o = e.list[0].weather[0].main;
//                 // changeweather(weatherid,weatherdesc);
//                 (document.getElementById("temp").innerHTML = n),
//                 (document.getElementById("temp").innerHTML = n),
//                 (document.getElementById("max").innerHTML = t),
//                 (document.getElementById("min").innerHTML = a),
//                 (document.getElementById("name").innerHTML = i + " , " + m),
//                 $("#weather_types").val(o);
                
//         })
//         .catch(function () {});
// }

function changeweather(weatherid,weatherdesc) {
    if (weatherdesc == 'moderate rain'){
        $('.weathergif').attr('title','light rain');
    }else{
        $('.weathergif').attr('title',weatherdesc);
    }
    // console.log(weatherid);
    if (200 <= weatherid && weatherid < 299){
        // console.log('thunderstorm');
        $('.weathergif').attr('src','/assets/images/Thunderstrom.gif');
    }else if (502 <= weatherid && weatherid < 531){
        // console.log('rain');
        $('.weathergif').attr('src','/assets/images/Rain.gif');
    }else if (500 <= weatherid && weatherid < 900 || (300 <= weatherid && weatherid < 502)){
        // console.log('clear');
        $('.weathergif').attr('src','/assets/images/Sunny.gif');
    }else{
        console.log('not valid Weather ID');
    }
}


var quality,aqi,qualityMix;
function apipollution() {
    fetch("https://api.openweathermap.org/data/2.5/air_pollution?lat="+lat+"&lon="+long+"&appid=9fcf6f30b6aef921768d835ce661294f")
        .then(function (e) {
            return e.json();
        })
        .then(function (e) {
            aqi = e.list[0].main.aqi
            switch (aqi) {
                case 1:
                    quality = "Good";
                    qualityMix= "Good"
                    Recommended_Precautions = "Air Quality : Good (Everyone can continue their outdoor activities normally.)";
                    backgrounColor = "#29E13B";
                    break;
                case 2:
                    quality = "Fair";
                    qualityMix= "Good"
                    Recommended_Precautions = "Air Quality : Good (Everyone can continue their outdoor activities normally.)";
                    backgrounColor = "#29E13B";
                    break;
                case 3:
                    quality = "Moderate";
                    qualityMix= "Fair"
                    Recommended_Precautions = "Air Quality : Fair (Only very few hypersensitive people should reduce outdoor activities.)";
                    backgrounColor = "#FFDF04";
                    break;
                case 4:
                    quality = "Poor";
                    qualityMix= "Moderate"
                    Recommended_Precautions = "Air Quality : Moderate (Children, seniors and individuals with respiratory or heart diseases should reduce sustained and high-intensity outdoor exercises.)";
                    backgrounColor = "#FE9E2D";
                    break;
                case 5:
                    quality = "Very Poor";
                    qualityMix= "Poor"
                    Recommended_Precautions = "Air Quality : Poor (Children, seniors and individuals with respiratory or heart diseases should avoid sustained and high-intensity outdoor exercises. General population should moderately reduce outdoor activities.)";
                    backgrounColor = "#FF1B24";
                    break;
                case 6:
                    quality = "Very Poor";
                    qualityMix= "Very Poor"
                    Recommended_Precautions = "Air Quality : Very Poor (Children, seniors and individuals with heart or lung diseases should stay indoors and avoid outdoor activities. General population should reduce outdoor activities.)";
                    backgrounColor = "#AE0108";
                    break;
                default:
                    quality = "No Data";
                    qualityMix= "good"
                    Recommended_Precautions = "No Data";
                    backgrounColor = "#AE0108";
            }
            // console.log('quality : '+quality ,'\n' +'Recommended_Precautions : '+Recommended_Precautions);
            // document.querySelector('.pollution_image').src = image_url;
            // document.querySelector('.pollution_image').title = Recommended_Precautions;
            $('.aqi-text').text('Air Quality : '+qualityMix )
            $('.aqi-text').css('background-color',backgrounColor )
            $('.aqi-text-href').attr('title',  Recommended_Precautions )
            // $('.pollution_image').attr('title',  Recommended_Precautions )
            // $('.mobiletitle').html( Recommended_Precautions )
        })
        .catch(function () {});
    }

$('.mobiletitlepop').click(function(){
    $(this).find('span').show();
    setTimeout(function(){$('.mobiletitlepop').find('span').hide()}, 3000);
})
// weatherBalloon();
apipollution()

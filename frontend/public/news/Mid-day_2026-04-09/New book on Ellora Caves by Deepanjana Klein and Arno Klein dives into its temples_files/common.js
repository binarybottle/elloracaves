setTimeout(function() {
    const swiperalsoread = new Swiper('.also-read-swiper', {
        navigation: {
            nextEl: '.also-read-main .swiper-button-next',
            prevEl: '.also-read-main .swiper-button-prev',
        },
        slidesPerView: 1.15,
        breakpoints: {
            640: {
                slidesPerView: 3,
                spaceBetween: 40
            },
        },
    });
}, 1000);
// $(".desk-ser-click-dk").click(function() {
//     $(".form-inline-ct-dk").fadeToggle()
// }), $(".desk-ser-click-top").click(function() {
//     $(".form-inline-ct-top").fadeToggle()
// }), $(".mobile-sr").click(function() {
//     $(".form-inline-ct-dk").fadeToggle()
// });

function detectmob() {
    if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
        return true;
    } else {
        return false;
    }
}
$(document).ready(function() {
    setTimeout(function() {
        $("a:not([data-toggle='tab'])").on('click', function(event) {
            if (this.hash !== "") {
                event.preventDefault();
                var hash = this.hash;
                //console.log($(hash).offset().top);
                if($(hash).offset().top > 4800 && $(hash).offset().top < 5000){
                    var offsetTop = $(hash).offset().top - 920;    
                }else if($(hash).offset().top > 5100 && $(hash).offset().top < 5300){
                    var offsetTop = $(hash).offset().top - 300;    
                }else if($(hash).offset().top > 9000 && $(hash).offset().top < 9400){
                    var offsetTop = $(hash).offset().top - 150;    
                }else if($(hash).offset().top > 9450 && $(hash).offset().top < 9600){
                    var offsetTop = $(hash).offset().top - 400;
                }else{
                    var offsetTop = $(hash).offset().top - 450;
                }
                //console.log(offsetTop);
                $('html, body').animate({
                    scrollTop: offsetTop
                }, 1000, function() {});
            }
        });
        var x = window.matchMedia("(max-width: 700px)")
        if (x.matches == false) {
            sameHeightTitle()
            sameHeight();
            sameHeightHoroscope();
            sameHeightAll();
            sameHeightByline();
            makeAdspaceResize();
            sameHeightAuthDesc();
            sameHeightTitleother()
        }
    }, 1000);
    $('[data-toggle="tooltip"]').tooltip();
    $(".blog-close").click(function() {
        $(".close-contend").fadeOut();
    })
    setTimeout(function() {
        var SwiperTop = new Swiper('.swiperTop', {
            observer: true,
            spaceBetween: 0,
            loop: true,
            centeredSlides: true,
            autoplay: {
                delay: 1,
            },
            slidesPerView: 'auto',
            allowTouchMove: false,
            speed: 5000,
            disableOnInteraction: false
        });
        $(".swiperTop.swiper-container").hover(function() {
            $(".swiperTop.swiper-container .swiper-wrapper").css('transition', '');
            $(".swiperTop.swiper-container .swiper-wrapper").css('transition-timing-function', 'linear');
        }, function() {
            $(".swiperTop.swiper-container .swiper-wrapper").css('transition', 'all 5000ms ease 0s');
            (this).swiper.autoplay.start();
        });
    }, 1000);
    setTimeout(function() {
        fun_TriggerAll();
    }, 500);
    function getDrLove(date){
         $.ajax({
            type:"GET",
            url:domain2 + '/api/DrLoveData.php?date='+date+'&param=',
            success: function(response){
                var parse_drlove_data = JSON.parse(response);
                var drlovedata = parse_drlove_data.drlovedata;
                $('.dr-love-div').html('');
                for(var i=0; i<drlovedata.length; i++){
                    $('.dr-love-div').html('<div class="col-md-4"> <div class="border-bottom pb-3 mb-3"> <h3 class="title-news-heading big-title">'+drlovedata[i]['dr_love_title']+'</h3> <div class="img2"> <img data-src="'+drlovedata[i]['Images']['Image1']+'" alt="'+drlovedata[i]['dr_love_image_caption']+'" title="'+drlovedata[i]['dr_love_image_caption']+'" class="w-100 lozad"> </div><span class="small-txt-news mt-3"></span> </div></div><div class="col-md-4"> <div> <div class="news-section-txt mt-md-2 mb-0"><img src="'+domain2+'/assets/images/Timepass/dr-love.jpg" class="float-left mb-wid dr-love-position"/> <img src="'+domain2+'/assets/images/quote-03.svg" class="blockqute-ct pb-2"> <p class="news-section-txt color-purpule-light">'+drlovedata[i]['question']+'</p></div></div></div><div class="col-md-4 p-0 mb-pd"> <p class="news-section-txt mt-md-2 mb-0">'+drlovedata[i]['answer']+'</p><div class="small-txt-news">'+drlovedata[i]['Date']+' '+drlovedata[i]['Time']+' IST | '+drlovedata[i]['location']+' <br><a href="javascript:void(0);" class="color-blue">'+drlovedata[i]['dr_love_byline']+'</a></div></div>');
                }
                refreshLazyLoad();
            }
        });
    }
    var domainNamePath = window.location.href;
    if ($('.modify-calendar').length != 0) {
        $(".modify-calendar").datepicker({
            showOn: "button",
            buttonImage:"https://www.mid-day.com/assets/images/dropdown-arrow-02.svg",
            buttonImageOnly: true,
            buttonText: "Select date",
            dateFormat: 'd MM yy',
        }).on('change', function(e) {
            var date = $(this).datepicker('getDate'),
                day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear();
            var dateu = $(this).val().slice(0, -4)
            $(this).val(dateu).addClass('sbold');
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            var changedate = [year, month, day].join('-');
            var domaint = window.location.href;
            var datepickerclass = $(this).attr('class');
            if (datepickerclass.indexOf('dr-love') != -1) {
                //angular.element(document.getElementById('drlovesection')).scope().getDrLove(date);
                getDrLove(changedate);
            }
            if (datepickerclass.indexOf('horoscope') != -1) {
                angular.element(document.getElementById('horoscopelist')).scope().getHoroscope(date);
            }
            if (datepickerclass.indexOf('lifestylehoro') != -1) {
                var  months = [null, "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                var monthName=day+' '+months[month]; // "July" (or current month)
                var dd = changedate;
                getHoroscopeDataByDate(dd,monthName);
            }
        });
    }
    function getComminsData(lable,date,classname){
         $.ajax({
            type:"GET",
            url:domain2 + '/api/ComicData.php?date='+date+'&Label='+lable+'&param=',
            success: function(response){
                var parse_commins_data = JSON.parse(response);
                var comminsdata = parse_commins_data.comicData;
                $('.'+classname).html('');
                for(var i=0; i<comminsdata.length; i++){
                    if(comminsdata[i]['Flag'] == 'Not Found'){

                    }else{
                       $('.'+classname).html('<div class="img11"> <img data-src="'+comminsdata[i]['time_pass_master_image']+'" class="w-100 timepassComic lozad" alt="'+comminsdata[i]['time_pass_master_lable']+'" title="'+comminsdata[i]['time_pass_master_lable']+'"> </div><div class="mt-3 Horoscope-title"> <a href="'+comminsdata[i]['url']+'"><h2 class="d-inline mr-3 color-purpule-light">'+comminsdata[i]['time_pass_master_lable']+'</h2></a> </div><div class="small-txt-news">'+comminsdata[i]['Date']+' '+comminsdata[i]['Time']+' IST | '+comminsdata[i]['time_pass_master_location']+'<br></div><div class="pt-2"> <a href="'+comminsdata[i]['url']+'" class="color-purpule-light"><span class="icon-menu"></span><span class="ml-3 txt-light-headline color-purpule-light">View</span></a> </div>'); 
                    }
                    
                }
                refreshLazyLoad();
            }
        });
    }
    if ($('.firstcomicdatepicker').length != 0) {
        $(".firstcomicdatepicker").datepicker({
            showOn: "button",
            buttonImage: "https://www.mid-day.com/assets/images/dropdown-arrow-02.svg",
            buttonImageOnly: true,
            buttonText: "Select date",
            dateFormat: 'd MM yy',
        }).on('change', function(e) {
            var date = $(this).datepicker('getDate'),
                day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear();
            var dateu = $(this).val().slice(0, -4)
            $(this).val(dateu).addClass('sbold');
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            var changedate = [year, month, day].join('-');
            if ($(this).hasClass('firstcomicdatepicker')) {
                //angular.element(document.getElementById('comicsection')).scope().getFirstComicData('The brilliant mind of Edison Lee', date);
                getComminsData('The brilliant mind of Edison Lee',changedate,'first-commins');
            }
        });
    }
    if ($('.secondcomicdatepicker').length != 0) {
        $(".secondcomicdatepicker").datepicker({
            showOn: "button",
            buttonImage: "https://www.mid-day.com/assets/images/dropdown-arrow-02.svg",
            buttonImageOnly: true,
            buttonText: "Select date",
            dateFormat: 'd MM yy',
        }).on('change', function(e) {
            var date = $(this).datepicker('getDate'),
                day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear();
            var dateu = $(this).val().slice(0, -4)
            $(this).val(dateu).addClass('sbold');
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            var changedate = [year, month, day].join('-');
            if ($(this).hasClass('secondcomicdatepicker')) {
                //angular.element(document.getElementById('comicsection')).scope().getSecondComicData('Calvin and Hobbs', date);
                getComminsData('Calvin and Hobbs',changedate,'second-commins');
            }
        });
    }
    if ($('.thirdcomicdatepicker').length != 0) {
        $(".thirdcomicdatepicker").datepicker({
            showOn: "button",
            buttonImage: "https://www.mid-day.com/assets/images/dropdown-arrow-02.svg",
            buttonImageOnly: true,
            buttonText: "Select date",
            dateFormat: 'd MM yy',
        }).on('change', function(e) {
            var date = $(this).datepicker('getDate'),
                day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear();
            var dateu = $(this).val().slice(0, -4)
            $(this).val(dateu).addClass('sbold');
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            var changedate = [year, month, day].join('-');
            if ($(this).hasClass('thirdcomicdatepicker')) {
                //angular.element(document.getElementById('comicsection')).scope().getThirdComicData('Zits', date);
                getComminsData('Zits',changedate,'third-commins');
            }
        });
    }
    if ($('.forthcomicdatepicker').length != 0) {
        $(".forthcomicdatepicker").datepicker({
            showOn: "button",
            buttonImage: "https://www.mid-day.com/assets/images/dropdown-arrow-02.svg",
            buttonImageOnly: true,
            buttonText: "Select date",
            dateFormat: 'd MM yy',
        }).on('change', function(e) {
            var date = $(this).datepicker('getDate'),
                day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear();
            var dateu = $(this).val().slice(0, -4)
            $(this).val(dateu).addClass('sbold');
            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;
            var changedate = [year, month, day].join('-');
            if ($(this).hasClass('forthcomicdatepicker')) {
                //angular.element(document.getElementById('comicsection')).scope().getForthComicData('Between friends', date);
                getComminsData('Between friends',changedate,'fourth-commins');
            }
        });
    }
    var path = window.location.pathname;
    var page = path.split("/").pop();
    if (page == 'timepass') {
        $(".modify-calendar-manjul").MonthPicker({
            dateFormat: "MM",
            Button: '<img class="icon" src="https://www.mid-day.com/assets/images/dropdown-arrow-02.svg" style="width:15px !important"/>',
            OnAfterMenuClose: function() {
                getMonthName(this)
            }
        });
    }
    setTimeout(function() {
        var swiper = new Swiper('.breaking-news-swiper', {
            navigation: {
                nextEl: '.breaking-news-swiper-nav .slider-right-arrow',
                prevEl: '.breaking-news-swiper-nav .slider-left-arrow',
            },
        });
        var swiper = new Swiper('.author-news-swiper', {
            navigation: {
                nextEl: '.author-news-swiper-nav .slider-right-arrow',
                prevEl: '.author-news-swiper-nav .slider-left-arrow',
            },
        });
    }, 300);
    var options_swiper = new Swiper('.options-news-swiper', {
        navigation: {
            nextEl: '.slider-right-arrow_01',
            prevEl: '.slider-left-arrow_01',
        },
    });
    var highlight_slider = new Swiper('.highlight-slider', {
        slidesPerView: "auto",
        centeredSlides: true,
        roundLengths: true,
        loop: true,
        spaceBetween: 30,
        navigation: {
            nextEl: '.highlight-slider .swiper-button-next',
            prevEl: '.highlight-slider .swiper-button-prev',
        },
    });
    setTimeout(function() {
        var swiper1 = new Swiper('.small-slider-sidebar', {
            autoHeight: true,
            navigation: {
                nextEl: '.small-slider-sidebar .swiper-button-next',
                prevEl: '.small-slider-sidebar .swiper-button-prev',
            },
        });
    }, 500)
    var swiper1 = new Swiper('.timepass-slider-sidebar', {
        slidesPerView: 5,
        navigation: {
            nextEl: '.timepass-slider-sidebar .swiper-button-next',
            prevEl: '.timepass-slider-sidebar .swiper-button-prev',
        },
    });
    var photo_gallery_slider = new Swiper('.photo-gallery-slider', {
        spaceBetween: 10,
        navigation: {
            nextEl: '.photo-gallery-slider .swiper-button-next',
            prevEl: '.photo-gallery-slider .swiper-button-prev',
        },
    });
    var swiper2 = new Swiper('.drLove-news-swiper .swiper-container', {
        navigation: {
            nextEl: '.drLove-news-swiper  .slider-right-arrow',
            prevEl: '.drLove-news-swiper  .slider-left-arrow',
        },
    });
    var swiper3 = new Swiper('.horoscope-slider-wrapper .swiper-container', {
        navigation: {
            nextEl: '.horoscope-slider-wrapper  .slider-right-arrow',
            prevEl: '.horoscope-slider-wrapper  .slider-left-arrow',
        },
    });
    setTimeout(function() {
        var swiper4 = new Swiper('.recommended-slider .swiper-container', {
            autoHeight: true,
            navigation: {
                nextEl: '.recommended-slider .swiper-button-next',
                prevEl: '.recommended-slider .swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });
        var swiper7 = new Swiper('.covid-slider .swiper-container', {
            navigation: {
                nextEl: '.covid-slider .swiper-button-next',
                prevEl: '.covid-slider .swiper-button-prev',
            },
        });
        var swiper_4_desk = new Swiper('.swiper_4_desk', {
            slidesPerView: 4,
            spaceBetween: 30,
            navigation: {
                nextEl: '.swiper_4_desk .swiper-button-next',
                prevEl: '.swiper_4_desk .swiper-button-prev',
            },
            breakpoints: {
                320: {
                    slidesPerView: "auto",
                    spaceBetween: 20
                },
                480: {
                    slidesPerView: "auto",
                    spaceBetween: 20
                },
                640: {
                    slidesPerView: 4,
                    spaceBetween: 30
                }
            }
        });
        var manjulswiper = new Swiper('.manjul-details-swiper', {
            navigation: {
                nextEl: '.manjul-details-swiper-nav .slider-right-arrow',
                prevEl: '.manjul-details-swiper-nav .slider-left-arrow',
            },
        });
        var horoscopeswiper3 = new Swiper('.horoscope-slider-wrapper-map .swiper-container', {
            navigation: {
                nextEl: '.horoscope-slider-wrapper-map  .slider-right-arrow-nav',
                prevEl: '.horoscope-slider-wrapper-map  .slider-left-arrow-nav',
            },
        });
    }, 300);
    var swiper5 = new Swiper('.timepass_slider_1 .swiper-container', {
        autoHeight: false,
        navigation: {
            nextEl: '.timepass_slider_1 .swiper-button-next',
            prevEl: '.timepass_slider_1 .swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });
    var swiper6 = new Swiper('.timepass_slider_2 .swiper-container', {
        navigation: {
            nextEl: '.timepass_slider_2 .swiper-button-next',
            prevEl: '.timepass_slider_2 .swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });
    var weather_widget = new Swiper('.weather-widget', {
        navigation: {
            nextEl: '.weather-widget .swiper-button-next',
            prevEl: '.weather-widget .swiper-button-prev',
        },
        pagination: false,
    });
    var galleryThumbs = new Swiper('.election_vote_01 .swiper_pl_top .swiper-container', {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        navigation: {
            nextEl: '.election_vote_01 .swiper_pl_top .swiper-button-next',
            prevEl: '.election_vote_01 .swiper_pl_top .swiper-button-prev',
        },
    });
    var galleryTop = new Swiper('.election_vote_01 .swiper_pl_bottom .swiper-container', {
        spaceBetween: 10,
        thumbs: {
            swiper: galleryThumbs
        }
    });
    var galleryThumbs2 = new Swiper('.election_vote_02 .swiper_pl_top .swiper-container', {
        spaceBetween: 10,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
        navigation: {
            nextEl: '.election_vote_02 .swiper_pl_top .swiper-button-next',
            prevEl: '.election_vote_02 .swiper_pl_top .swiper-button-prev',
        },
    });
    var galleryTop2 = new Swiper('.election_vote_02 .swiper_pl_bottom .swiper-container', {
        spaceBetween: 10,
        thumbs: {
            swiper: galleryThumbs2
        }
    });
    var swiper7 = new Swiper('.covid-slider .swiper-container', {
        navigation: {
            nextEl: '.covid-slider .swiper-button-next',
            prevEl: '.covid-slider .swiper-button-prev',
        },
    });
    var swiper_4_desk = new Swiper('.swiper_4_desk', {
        slidesPerView: 4,
        spaceBetween: 30,
        navigation: {
            nextEl: '.swiper_4_desk .swiper-button-next',
            prevEl: '.swiper_4_desk .swiper-button-prev',
        },
        breakpoints: {
            320: {
                slidesPerView: "auto",
                spaceBetween: 20
            },
            480: {
                slidesPerView: "auto",
                spaceBetween: 20
            },
            640: {
                slidesPerView: 4,
                spaceBetween: 30
            }
        }
    });
    setTimeout(function() {
        var swiper_video = new Swiper('.videos-stip-slider .swiper-container', {
            observer: true,
            slidesPerView: 5,
            spaceBetween: 30,
            navigation: {
                nextEl: '.l1',
                prevEl: '.l2',
            },
            breakpoints: {
                320: {
                    slidesPerView: "auto",
                    spaceBetween: 20
                },
                480: {
                    slidesPerView: "auto",
                    spaceBetween: 20
                },
                640: {
                    slidesPerView: 5,
                    spaceBetween: 30
                }
            }
        });
    }, 1000);
    setTimeout(function() {
        var swiper_video = new Swiper('.sports-stip-slider .swiper-container', {
            slidesPerView: 4,
            spaceBetween: 30,
            navigation: {
                nextEl: '.l1',
                prevEl: '.l2',
            },
            breakpoints: {
                320: {
                    slidesPerView: "auto",
                    spaceBetween: 20
                },
                480: {
                    slidesPerView: "auto",
                    spaceBetween: 20
                },
                640: {
                    slidesPerView: 4,
                    spaceBetween: 30
                }
            }
        });
    }, 500);
    $(".loadmore_commnet").on("click", function(e) {
        e.preventDefault();
        $(".main-comment-section-wrapper").toggleClass("hide");
    });
    var swiper_img_gallery_txt = new Swiper('.text-slider-detail-pg', {
        navigation: {
            nextEl: '.text-slider-detail-pg .swiper-button-next',
            prevEl: '.text-slider-detail-pg .swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            type: 'fraction',
            renderFraction: function(currentClass, totalClass) {
                return '<span class="' + currentClass + '"></span>' + ' of ' + '<span class="' + totalClass + '"></span>';
            },
        },
    });
    var swiper_img_gallery_heading = new Swiper('.txt-top-slider', {});
    var swiper_img_gallery = new Swiper('.swiper-img-gallary', {
        autoplay: false,
        navigation: {
            nextEl: '.swiper-img-gallary .swiper-button-next',
            prevEl: '.swiper-img-gallary .swiper-button-prev',
        },
    });
    var top_fe_slider = new Swiper('.swiper-container.entertainment_slider', {
        slidesPerView: 2,
        spaceBetween: 30,
        navigation: {
            nextEl: '.ts-l',
            prevEl: '.ts-r',
        },
        breakpoints: {
            320: {
                slidesPerView: "auto",
                spaceBetween: 20
            },
            480: {
                slidesPerView: "auto",
                spaceBetween: 20
            },
            640: {
                slidesPerView: 2,
                spaceBetween: 30
            }
        }
    });
    if ($('.swiper-img-gallary').length != 0) {
        swiper_img_gallery.controller.control = swiper_img_gallery_txt;
        swiper_img_gallery_txt.controller.control = swiper_img_gallery;
    }
    if ($(window).width() <= 768) {
        if ($('.sticky-title').length != 0) {
            var sticky2 = new Waypoint.Sticky({
                element: $('.sticky-title')[0]
            });
        }
    }
    $('.scroll_to_top a').on('click', function(e) {
        e.preventDefault();
        var target = this.hash;
        $target = $(target);
        $('html, body').stop().animate({
            'scrollTop': $target.offset().top - 100
        }, 1000, );
    });
    $('.scroll_to_list li a').on('click', function(e) {
        e.preventDefault();
        var target = this.hash;
        $target = $(target);
        if ($target.length) {
            $('html, body').stop().animate({
                'scrollTop': $target.offset().top - 100
            }, 1000, );
        }
    });
    setTimeout(function() {
        var cat_latest_slider = new Swiper('.swiper-container.cat-latest-slider', {
            navigation: {
                nextEl: '.right-cat-slider',
                prevEl: '.left-cat-slider',
            },
        });
    }, 500);
    var top_fe_slider = new Swiper('.swiper-container.top_fe_slider', {
        slidesPerView: 4,
        spaceBetween: 30,
        navigation: {
            nextEl: '.ts-l',
            prevEl: '.ts-r',
        },
        breakpoints: {
            320: {
                slidesPerView: "auto",
                spaceBetween: 20
            },
            480: {
                slidesPerView: "auto",
                spaceBetween: 20
            },
            640: {
                slidesPerView: 4,
                spaceBetween: 30
            }
        }
    });
    var photp_gallery_fe_slider = new Swiper('.swiper-container.photp-gallery-fe-slider', {
        navigation: {
            nextEl: '.photp-gallery-fe-slider .swiper-button-next',
            prevEl: '.photp-gallery-fe-slider .swiper-button-prev',
        },
    });
    setTimeout(function() {
        $(".sharelink_act .circle-small").hover(function() {
            $(".share-vertical").addClass("show");
        }, function() {
            setTimeout(function() {
                $(".share-vertical").removeClass("show");
            }, 1500)
        });
    }, 1000);
    var top_fe_slider = new Swiper('.swiper-container.top_listing_slider', {
        slidesPerView: 5,
        spaceBetween: 30,
        navigation: {
            nextEl: '.ts-l',
            prevEl: '.ts-r',
        },
        breakpoints: {
            320: {
                slidesPerView: "auto",
                spaceBetween: 20
            },
            480: {
                slidesPerView: "auto",
                spaceBetween: 20
            },
            640: {
                slidesPerView: 6,
                spaceBetween: 30
            }
        }
    });
    if ($('.swiper-img-gallary .swiper-slide').length != 0) {
        setTimeout(function() {
            $('.swiper-img-gallary .swiper-slide').magnificPopup({
                delegate: 'a',
                type: 'image',
                gallery: {
                    enabled: true
                },
                image: {
                    titleSrc: function(item) {
                        return '<div class="share-mg-popup"><ul class="social-icons-inline inline-menu d-inline-block"><li>Share:</li><li><a href=""><span class="icon-facebook-logo"></span></a></li><li><a href=""><span class="icon-twitter"></span></a></li><li><a href=""><span class="icon-youtube"></span></a></li><li><a href=""><span class="icon-telegram"></span></a></li></ul></div>';
                    }
                }
            });
        }, 500)
    }
    timepassSliderInit();
    articleDetailsPageLoader();
});
$(document).click(function() {
    outsite();
});

function outsite() {
    var container = $(".outsiteclick");
    var containernew = $(".desktop-trends");
    var containernewmobile = $(".clickoutside");
    var subbutton = $(".mobilesub");
    console.log(!container.is(event.target));
    if (!container.is(event.target) && !container.has(event.target).length && !containernew.is(event.target) && !containernew.has(event.target).length && !containernewmobile.is(event.target) && !containernewmobile.has(event.target).length && !subbutton.is(event.target) && !subbutton.has(event.target).length) {
        $(".form-inline-ct").fadeOut(); 
        $(".mobilesub .mdsubpopparent").hide();
        $("#trending_keywords").hide()
    }
}


function openNav() {
    $('body').css('overflow-y','hidden');
    $("#menu").css("left", "0%");
}

function closeNav() {
    $("#menu").css("left", "-100%");
    $('.targetDiv').removeClass('secondiv');
    $('body').css('overflow-y','');
}
$(document).on('click', '.dropdown-menu', function(e) {
    e.stopPropagation();
});
var hoverOrClick = function() {
    $(this).addClass('selected').siblings().removeClass('selected');
    $('.targetDiv').hide();
    $('#div' + $(this).attr('target')).show().addClass('secondiv');
}
$('ul.itemshow li').click(hoverOrClick).hover(hoverOrClick);

function increaseTxtFontSize(self) {
    var curSize = parseInt($(self).parents(".article-left").find(".articleHeading").css('font-size')) + 2;
    var artcle_txt_size = parseInt($(self).parents(".article-left").find(".article_txt").css('font-size')) + 2;
    var KeycurSize = parseInt($(self).parents(".key-highlight-section").find("h5").css('font-size')) + 2;
    var Keyartcle_txt_size = parseInt($(self).parents(".key-highlight-section").find("p").css('font-size')) + 2;
    var Keyartcle_txt_size1 = parseInt($(self).parents(".key-highlight-section").find("h4").css('font-size')) + 2;
    var PincurSize = parseInt($(self).parents(".blog-bg-mg").find("h5").css('font-size')) + 2;
    var Pinartcle_txt_size = parseInt($(self).parents(".blog-bg-mg").find("p").css('font-size')) + 2;
    var Pinartcle_txt_size1 = parseInt($(self).parents(".blog-bg-mg").find("h4").css('font-size')) + 2;
    var maincurSize = parseInt($(self).parents(".single-article-main").find("h5").css('font-size')) + 2;
    var maincurSize1 = parseInt($(self).parents(".single-article-main").find("h1").css('font-size')) + 2;
    var mainartcle_txt_size = parseInt($(self).parents(".single-article-main").find("p.ng-binding").css('font-size')) + 2;
    var mainartcle_txt_size1 = parseInt($(self).parents(".single-article-main").find("h4").css('font-size')) + 2;
    $(self).parents(".article-left").find(".articleHeading").css('font-size', curSize);
    $(self).parents(".article-left").find(".article_txt").css('font-size', artcle_txt_size);
    $(self).parents(".article-left").find(".article_txt p").css('font-size', artcle_txt_size);
    $(self).parents(".key-highlight-section").find("h5").css('font-size', KeycurSize);
    $(self).parents(".key-highlight-section").find("h4").css('font-size', Keyartcle_txt_size);
    $(self).parents(".key-highlight-section").find("p").css('font-size', Keyartcle_txt_size1);
    $(self).parents(".blog-bg-mg").find("h5").css('font-size', PincurSize);
    $(self).parents(".blog-bg-mg").find("h4").css('font-size', Pinartcle_txt_size1);
    $(self).parents(".blog-bg-mg").find("p").css('font-size', Pinartcle_txt_size);
    $(self).parents(".single-article-main").find("h5").css('font-size', maincurSize);
    $(self).parents(".single-article-main").find("h1").css('font-size', maincurSize1);
    $(self).parents(".single-article-main").find("h4").css('font-size', mainartcle_txt_size1);
    $(self).parents(".single-article-main").find("p.ng-binding").css('font-size', mainartcle_txt_size);
}

function resetTxtFontSize(self) {
    var curSize = parseInt($(self).parents(".article-left").find(".articleHeading").css('font-size')) - 2;
    var artcle_txt_size = parseInt($(self).parents(".article-left").find(".article_txt").css('font-size')) - 2;
    var KeycurSize = parseInt($(self).parents(".key-highlight-section").find("h5").css('font-size')) - 2;
    var Keyartcle_txt_size = parseInt($(self).parents(".key-highlight-section").find("p").css('font-size')) - 2;
    var Keyartcle_txt_size1 = parseInt($(self).parents(".key-highlight-section").find("h4").css('font-size')) - 2;
    var PincurSize = parseInt($(self).parents(".blog-bg-mg").find("h5").css('font-size')) - 2;
    var Pinartcle_txt_size = parseInt($(self).parents(".blog-bg-mg").find("p").css('font-size')) - 2;
    var Pinartcle_txt_size1 = parseInt($(self).parents(".blog-bg-mg").find("h4").css('font-size')) - 2;
    var maincurSize = parseInt($(self).parents(".single-article-main").find("h5").css('font-size')) - 2;
    var maincurSize1 = parseInt($(self).parents(".single-article-main").find("h1").css('font-size')) - 2;
    var mainartcle_txt_size = parseInt($(self).parents(".single-article-main").find("p.ng-binding").css('font-size')) - 2;
    var mainartcle_txt_size1 = parseInt($(self).parents(".single-article-main").find("h4").css('font-size')) - 2;
    $(self).parents(".article-left").find(".articleHeading").css('font-size', curSize);
    $(self).parents(".article-left").find(".article_txt").css('font-size', artcle_txt_size);
    $(self).parents(".article-left").find(".article_txt p").css('font-size', artcle_txt_size);
    $(self).parents(".key-highlight-section").find("h5").css('font-size', KeycurSize);
    $(self).parents(".key-highlight-section").find("h4").css('font-size', Keyartcle_txt_size);
    $(self).parents(".key-highlight-section").find("p").css('font-size', Keyartcle_txt_size1);
    $(self).parents(".blog-bg-mg").find("h5").css('font-size', PincurSize);
    $(self).parents(".blog-bg-mg").find("h4").css('font-size', Pinartcle_txt_size1);
    $(self).parents(".blog-bg-mg").find("p").css('font-size', Pinartcle_txt_size);
    $(self).parents(".single-article-main").find("h5").css('font-size', maincurSize);
    $(self).parents(".single-article-main").find("h1").css('font-size', maincurSize1);
    $(self).parents(".single-article-main").find("h4").css('font-size', mainartcle_txt_size1);
    $(self).parents(".single-article-main").find("p.ng-binding").css('font-size', mainartcle_txt_size);
}

function articleDetailsPageLoader() {
    $(".sharelink_act .circle-small").hover(function() {
        $(".share-vertical").addClass("show");
    }, function() {
        setTimeout(function() {
            $(".share-vertical").removeClass("show");
        }, 1500)
    });
    var swiper1 = new Swiper('.small-slider-sidebar', {
        autoHeight: true,
        navigation: {
            nextEl: '.small-slider-sidebar .swiper-button-next',
            prevEl: '.small-slider-sidebar .swiper-button-prev',
        },
    });
    var swiper = new Swiper('.breaking-news-swiper', {
        navigation: {
            nextEl: '.breaking-news-swiper-nav .slider-right-arrow',
            prevEl: '.breaking-news-swiper-nav .slider-left-arrow',
        },
    });
}

function timepassSliderInit() {
    var top_fe_slider = new Swiper('.swiper-container.timepass_slider', {
        slidesPerView: 4,
        spaceBetween: 30,
        autoHeight: false,
        navigation: {
            nextEl: '.timepass_slider_1 .swiper-button-next',
            prevEl: '.timepass_slider_1 .swiper-button-prev',
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        autoHeight: true,
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 0
            },
            480: {
                slidesPerView: 1,
                spaceBetween: 0
            },
            640: {
                slidesPerView: 4,
                spaceBetween: 30
            }
        }
    });
    sameHeightHoroscope();
}

function sameHeightTitleother() {
    var heights = $(".sameheightparent").find(".sameheightotherar").map(function() {
        return $(this).height();
    }).get();
    maxHeight = Math.max.apply(null, heights);
    $(".sameheightparent").find(".sameheightotherar").css("height", maxHeight + "px");
}

function sameHeightTitle() {
    var heights = $(".ByLineArticle").find(".sameHeightTitle").map(function() {
        return $(this).height();
    }).get();
    maxHeight = Math.max.apply(null, heights);
    $(".ByLineArticle").find(".sameHeightTitle").css("height", maxHeight + "px");
}

function sameHeight() {
    var heights = $(".newsTitleBlk").find(".sameHeight").map(function() {
        return $(this).height();
    }).get();
    maxHeight = Math.max.apply(null, heights);
    $(".newsTitleBlk").find(".sameHeight").css("height", maxHeight + "px");
}

function sameHeightHoroscope() {
    var heights = $(".sameHoroscopeDiv").find(".sameHoroscope").map(function() {
        return $(this).height();
    }).get();
    maxHeight = Math.max.apply(null, heights);
    $(".sameHoroscopeDiv").find(".sameHoroscope").css("height", maxHeight + "px");
}

function sameHeightAll() {
    var heights = $(".sameHeightParent").find(".sameHeight").map(function() {
        return $(this).height();
    }).get();
    maxHeight = Math.max.apply(null, heights);
    $(".sameHeightParent").find(".sameHeight").css("height", maxHeight + "px");
}

function sameHeightByline() {
    var heights = $(".ByLineArticle").find(".sameHeight").map(function() {
        return $(this).height();
    }).get();
    maxHeight = Math.max.apply(null, heights);
    $(".ByLineArticle").find(".sameHeight").css("height", maxHeight + "px");
}

function sameHeightAuthDesc() {
    var heights = $(".autorTxtDescDiv").find(".autorTxtDesc").map(function() {
        return $(this).height();
    }).get();
    maxHeight = Math.max.apply(null, heights);
    $(".autorTxtDescDiv").find(".autorTxtDesc").css("height", maxHeight + "px");
}

function getMonthName(self) {
    var monthName;
    var selectedMonth = $(self).val().split("/");
    if (selectedMonth[0] == '01') {
        monthName = 'January'
    } else if (selectedMonth[0] == '02') {
        monthName = 'February'
    } else if (selectedMonth[0] == '03') {
        monthName = 'March'
    } else if (selectedMonth[0] == '04') {
        monthName = 'April'
    } else if (selectedMonth[0] == '05') {
        monthName = 'May'
    } else if (selectedMonth[0] == '06') {
        monthName = 'Jun'
    } else if (selectedMonth[0] == '07') {
        monthName = 'July'
    } else if (selectedMonth[0] == '08') {
        monthName = 'August'
    } else if (selectedMonth[0] == '09') {
        monthName = 'September'
    } else if (selectedMonth[0] == '10') {
        monthName = 'October'
    } else if (selectedMonth[0] == '11') {
        monthName = 'November'
    } else if (selectedMonth[0] == '12') {
        monthName = 'December'
    } else {}
    $(self).val(monthName)
    var domain = window.location.href;
    var aURLSplitArr = [];
    aURLSplitArr = domain.split('/');
    var lastpart = aURLSplitArr.pop();
    /*if (lastpart == 'manjul') {
        angular.element(document.getElementById('manjuldetails')).scope().getPosts('', monthName, selectedMonth[1]);
    }*/
    if (lastpart == 'the-brilliant-mind-of-edison-lee' || lastpart == 'calvin-and-hobbs' || lastpart == 'zits' || lastpart == 'between-friends' || lastpart == 'manjul') {
        //angular.element(document.getElementById('comicstrips')).scope().getCommicStrips('', monthName, selectedMonth[1]);
        getComminsDetailsData('js', lastpart, monthName, selectedMonth[1]);
    }
}

function fun_submitVote(formId, selfId) {
    $('#correct_answer_span').css('display', 'none');
    $('#wrong_answer_span').css('display', 'none');
    $('#submitques').css('display', 'block');
    $('#submitvote').css('display', 'none');
    var ansSelected = $("#" + formId).find(".questionList.active").find("input[type=radio]:checked").length;
    var selected_ans = $("#" + formId).find(".questionList.active").find("input[type=radio]:checked").next('span').text();
    var correct_answer = $("#" + formId).find(".questionList.active").find('.correct_answer').val();
    $('#answer_given').val(parseInt($('#answer_given').val()) + 1);
    if (selected_ans == correct_answer) {
        $('#correct_answer_count').val(parseInt($('#correct_answer_count').val()) + 1);
    }
    if ($('#answer_given').val() == 10) {
        $('#submitvote').css('display', 'none');
        $('#submitques').css('display', 'none');
        $('#final_result').empty().text('You answered ' + $('#correct_answer_count').val() + ' out of ' + $('#answer_given').val() + ' correct.');
        $('#final_result_div').css('display', 'block');
    }
    if (ansSelected > 0) {
        $("#" + selfId).removeAttr('disabled');
        var $current = $('.questionList.active');
        $('.questionList').removeClass('active');
        $current.next().addClass('active');
    } else {}
}

function fun_submitQues(formId, selfId) {
    var ansSelected = $("#" + formId).find(".questionList.active").find("input[type=radio]:checked").length;
    var selected_ans = $("#" + formId).find(".questionList.active").find("input[type=radio]:checked").next('span').text();
    var correct_answer = $("#" + formId).find(".questionList.active").find('.correct_answer').val();
    $("#" + formId).find(".questionList.active").find("input[type=radio]").each(function() {
        var iz_checked = $(this).is(':checked');
        if (!iz_checked) {
            $(this).prop("disabled", true);
        }
    });
    if (parseInt(ansSelected) == 0) {
        $('#wrong_answer_span').empty().text('Please select answer.');
        $('#wrong_answer_span').css('display', 'block');
        return false;
    }
    $('#correct_answer_span').empty().text('Correct answer is : ' + correct_answer);
    $('#wrong_answer_span').empty().text('Your answer is : ' + selected_ans);
    $('#correct_answer_span').css('display', 'block');
    $('#wrong_answer_span').css('display', 'block');
    $('#submitques').css('display', 'none');
    $('#submitvote').css('display', 'block');
}

function openCrosswordModal() {
    $('#modal1').modal({
        backdrop: 'static',
        keyboard: false
    });
    $("#modal1").modal("show");
}

function fun_TriggerAll() {
    $("section").find("ul.inline-menu.tab-menu-list").each(function() {
        var path = window.location.pathname;
        if (path.charAt(path.length - 1) == '/') {
            path = path.substr(0, path.length - 1);
        }
        var pathArr = path.split("/");
        if (path.split("/").pop().split('-')[0] != 'Coronavirus' && path.split("/").pop() != 'opinion' && typeof pathArr[3] === 'undefined' && pathArr[1] != 'search') {
            var allMenuId = $(this).find("li:first a");
            $(allMenuId).addClass('active');
        }
    });
}

function makeAdspaceResize() {
    $(".horizontalBannerAd").each(function() {
        var result = parseInt($(this).find("iframe").attr('height'));
        $(this).css("height", result);
        $(this).css("background", "#fff");
        $(this).css("vertical-align", "center");
    })
    $(".ads-space-01").each(function() {
        var result = parseInt($(this).find("iframe").attr('height'));
        $(this).css("height", result);
        $(this).css("background", "#fff");
        $(this).css("vertical-align", "center");
    })
    $(".horizontalBannerAdPhotoVideo").each(function() {
        var result = parseInt($(this).find("iframe").attr('height'));
        $(this).css("height", result);
        $(this).css("background", "#fff");
        $(this).css("vertical-align", "center");
    })
}

function removeDashFromAuthor() {
    $('.small-txt-news a').each(function() {
        if ($(this).attr('href').indexOf("author-detail") > -1) {
            var href_html = $(this).text();
            if (href_html.indexOf("-") > -1) {
                $(this).html($(this).text().replace(/\d+/g, '').replace(/-([^-]*)$/, '$1'))
            }
        }
    });
    $('.author-info-details h5.author-info-details-bottom').each(function() {
        var href_html = $(this).text();
        if (href_html.indexOf("-") > -1) {
            $(this).html($(this).text().replace(/\d+/g, '').replace(/-([^-]*)$/, '$1'))
        }
    });
    $('.txt-below-title a').each(function() {
        if ($(this).attr('href').indexOf("author-detail") > -1) {
            var href_html = $(this).text();
            if (href_html.indexOf("-") > -1) {
                $(this).html($(this).text().replace(/\d+/g, '').replace(/-([^-]*)$/, '$1'))
            }
        }
    });
}

function getQuizWidgetData(quiz_id = '') {
    $.ajax(domain2 + '/api/getQuizWidget.php?quiz_id=' + quiz_id, {
        success: function(data, status, xhr) {
            if (data.length > 0) {
                var response = JSON.parse(data);
                $('#quiz-widget-title').empty().html(response.quiz_title);
                $('#quiz-widget-url').attr('href', response.quiz_url);
                if (response.quiz_prev_id != '' && response.quiz_prev_id != null) {
                    setTimeout(function() {
                        $('#quiz-widget-previous').attr('onclick', 'getQuizWidgetData( " ' + response.quiz_prev_id + ' " )');
                    }, 500);
                    if ($("#quiz-widget-previous").css('opacity') == '0') {
                        $('#quiz-widget-previous').css('opacity', '1');
                    }
                } else {
                    $('#quiz-widget-previous').css('opacity', '0');
                }
                if (response.quiz_next_id != '' && response.quiz_next_id != null) {
                    setTimeout(function() {
                        $('#quiz-widget-next').attr('onclick', 'getQuizWidgetData( " ' + response.quiz_next_id + ' " )');
                    }, 500);
                    if ($("#quiz-widget-next").css('opacity') == '0') {
                        $('#quiz-widget-next').css('opacity', '1');
                    }
                } else {
                    $('#quiz-widget-next').css('opacity', '0');
                }
            } else {}
        }
    });
}
var u = window.location.href.replace('https://', '').split('/');
if (u[1] == 'mumbai' || u[1] == 'news') {
    getQuizWidgetData();
} 
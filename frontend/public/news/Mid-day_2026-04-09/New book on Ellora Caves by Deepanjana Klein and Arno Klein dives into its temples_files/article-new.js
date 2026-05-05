(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){ 
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o), 
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m) 
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
var displayMode = 'browser';
var dimensionValue="browser";       
var mqStandAlone = '(display-mode: standalone)';
if (navigator.standalone || window.matchMedia(mqStandAlone).matches) {
    displayMode = 'standalone';                    
}
if(window.location.hostname =='stageorigin.mid-day.com' || window.location.hostname =='stage.mid-day.com'){
    if(displayMode=='standalone'){
        ga('create', 'UA-212207284-1', 'auto');//PWA
    }else{
        ga('create', 'UA-213648248-1', 'auto');//stageorigin
    }
} else {
    if(displayMode=='standalone'){
        ga('create', 'G-0L1JN6H4MQ', 'auto');//PWA
    }else{
        ga('create', 'G-RDEK79CX92', 'auto');//live
    }
}
var basepath  = window.location.origin+'/';
function checkIsMobile() {
    var clevertapisMobile = false;
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
        clevertapisMobile = true;
    }
    return clevertapisMobile;
}

function sticky_relocate() {
    if ($(".mgidAdss").length) {
        var window_top = $(window).scrollTop();
        var footer_top = $(".mgidAdss").offset().top;
        var div_top = $('.sticky-anchors').offset().top;
        var div_height = $(".stickys").height();
        if (window_top + div_height > footer_top) {
            $('.stickys').removeClass('sticks');
            $('.stickys').addClass('statics');
        } else if (window_top > div_top) {
            $('.stickys').removeClass('statics');
            $('.stickys').addClass('sticks');
        } else {
            $('.stickys').removeClass('sticks');
        }
    }
}
if ($(window).width() >= 768) {
    $(function() {
        $(window).scroll(sticky_relocate);
        sticky_relocate();
    });
}

function savePoll(PollId) {
    var vote_value = $('input[name="radioname' + PollId + '"]:checked').val();
    if (vote_value == '' || typeof vote_value == 'undefined') {
        $('#error' + PollId).text('Please select at least one answer.');
        $('#error' + PollId).css('display', 'block');
        return false;
    } else {
        $('.error').text('');
        $('.error').css('display', 'none');
    }
    if (domain.substr(domain.length - 2) == '//') {
        domain = domain.substring(0, domain.length - 1);
    }
    if (domain.substr(domain.length - 1) != '/') {
        domain = domain + '/';
    }
    $.ajax({
        type: "POST",
        url: domain + 'common-detail-pages/poll-section-new.php',
        data: {
            'poll_id': PollId,
            'radioname': vote_value
        },
        success: function(response) {
            $('#poll-section').empty().html(response);
            setTimeout(function(){
                ga('set', {
                    location: window.location.href.split('?')[0].replace(basepath,''),
                    page: window.location.href.split('?')[0].replace(basepath,'')
                });
                ga('send', 'click'); 
                ga('send', { 
                   'hitType': 'event', 
                   'eventCategory': 'Articlepoll', 
                   'eventAction': 'click', 
                   'eventLabel': 'article-poll-submit-click', 
                   //'eventValue': 1, 
                   'hitCallback': function() { 
                        console.log('Sent!!'); 
                        //callback function 
                   }, 
                  'hitCallbackFail' : function () { 
                        console.log("Unable to send Google Analytics data"); 
                        //callback function 
                  } 
                });
            },500);

            setTimeout(function(){
               gtag('event', 'click', {
                page_title: 'article-poll-submit-click',
                page_location: window.location.href.split('?')[0].replace(basepath,'')
              });
            },500);
        }
    });
}

var scrollend = true;
var authors_scroll = true;
$(window).scroll(function(){
    function elementScrolled(elem)
    {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;
        return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
    }
    function loadOtherArticles(article_tags,article_id,category_id,sub_category_id)
    {
        $.ajax({
            url: window.location.origin+"/common-detail-pages/other-articles.php", 
            method: "get",
            data: { 
                article_tags: article_tags, 
                article_id: article_id, 
                category_id: category_id,
                sub_category_id: sub_category_id
            },
            success: function(result)
            {
                $("#other-article-widgets").html(result);
            }
        });
    }
    function loadrelatedGallery(article_tags,category_id,sub_category_id)
    {
        $.ajax({
            url: window.location.origin+"/common-detail-pages/related-gallery.php", 
            method: "get",
            data: { 
                article_tags: article_tags,
                category_id: category_id,
                sub_category_id: sub_category_id
            },
            success: function(result)
            {
                $("#gallery-widgets").html(result);
            }
        });
    }
    function loadrelatedVideo(article_tags,category_id,sub_category_id)
    {
        $.ajax({
            url: window.location.origin+"/common-detail-pages/related-video.php", 
            method: "get",
            data: { 
                article_tags: article_tags,
                category_id: category_id,
                sub_category_id: sub_category_id
            },
            success: function(result)
            {
                $("#video-widgets").html(result);
            }
        });
    }
    function loadrelatedArticles(article_tags,article_id,category_id,sub_category_id)
    {
        $.ajax({
            url: window.location.origin+"/common-detail-pages/related-articles.php", 
            method: "get",
            data: { 
                article_tags: article_tags, 
                article_id: article_id, 
                category_id: category_id,
                sub_category_id: sub_category_id
            },
            success: function(result)
            {
                $("#related-article-widgets").html(result);
            }
        });
    }
    function loadsidebarAuthors()
    {
        $.ajax({
            url: window.location.origin+"/common-detail-pages/author-sidebar.php", 
            method: "get",
            success: function(result)
            {
                $("#top-authors").html(result);
            }
        });
    }
    if(elementScrolled('.nextcall') && scrollend) {
        $('.other-widgets-loader').show();
        var article_tags = $('#article_tags').val();
        var article_id = $('#article_id').val();
        var category_id = $('#category_id').val(); 
        var sub_category_id = $('#sub_category_id').val(); 
        setTimeout(function(){
            getMDShortDataLatest();
            loadOtherArticles(article_tags,article_id,category_id,sub_category_id);
            loadrelatedGallery(article_tags,category_id,sub_category_id);
            loadrelatedVideo(article_tags,category_id,sub_category_id);
            if(category_id != '8'){
                loadrelatedArticles(article_tags,article_id,category_id,sub_category_id);
            }
            scrollend = false;
            $('.other-widgets-loader').hide();
        },1000);
    }
    if(elementScrolled('.author-top') && authors_scroll) {
        loadsidebarAuthors();
        authors_scroll = false;
        $('.author-top-loader').hide();
    }
});

var scrollForMDShortheight = 9000;
if(checkIsMobile() == true){
    var scrollForMDShortheight = 11000;
}
let mdShortFlag=1; 
let similarArticleFlag=1;
window.addEventListener("scroll", function() {
    if(document.body.offsetHeight - window.pageYOffset < scrollForMDShortheight && mdShortFlag==1){
        getMDShortData();
        mdShortFlag=0;
    } 

    if(document.body.offsetHeight - window.pageYOffset < scrollForMDShortheight && similarArticleFlag==1){
        similarArticleFlag=0;
        //getloadSimilarArticles();
        getPollData();
    } 
}); 
function getMDShortData(){
    var id = $('#gallery_id').val();
    if(id != '0' && id != ""){
            $.ajax({
            url: window.location.origin+"/api/getWebstoryPhotogalleryInArticleDetails.php?gallery_id="+id, 
            method: "GET",
            success: function(result)
            {
                var resultMD =  JSON.parse(result);
                var htmlMD = ""; 
                if(resultMD['AllData'].length >= 0){
                    for (var i=0; i<resultMD['AllData'].length; i++){
                        var style="";
                        var type='PHOTO GALLERY';
                        if(resultMD['AllData'][i]['Flag'] == "webstory"){
                            style="object-fit: contain !important;";
                            type='WEBSTORY';
                        }

                        var htmlMD = '<div class="col-12 pt-2"><div class="card cardparent" style="border-color:black;"><div class="card-body sameHeightcardpoll py-3"><div class="d-flex no-gutters lt-img-wtxt last-div-border"><div class="col-4"><div class="imgInnerArticle position-relative"><a href="'+resultMD['AllData'][i]['URL']+'" class="thumb photo" target="_blank"><img data-src="'+resultMD['AllData'][i]['Images']+'" class="lozad cut_sportElemHomeBtmImg fade" alt="'+resultMD['AllData'][i]['Homeheadline']+'" src="'+resultMD['AllData'][i]['Images']+'" data-loaded="true" style="height: 135px !important; '+style+'"></a></div></div><div class="col-md-8 pl-md-3 pl-2"><h3 class="title-news-heading"><a href="'+resultMD['AllData'][i]['URL']+'" class="healine-web-photo" target="_blank">'+resultMD['AllData'][i]['Homeheadline']+'</a></h3><span class="small-txt-news">'+resultMD['AllData'][i]['Time1']+'</span><a href="'+resultMD['AllData'][i]['URL']+'" class="small-txt-news-web-story">'+type+'</a></div></div></div></div></div><br>';
                        $("#photoandwebstorypara_"+i).html(htmlMD);
                    } 
                }
            } 
        });
    }
} 

function getMDShortDataLatest(){
    $.ajax({
        url: window.location.origin+"/api/getVisualPhotosHome", 
        method: "GET",
        success: function(result)
        {
            var resultMD =  JSON.parse(result);
            var htmlMD = ""; 
            if(resultMD !=""){
                var loopVal = 5;
                var mdshortid = 'mdshortlatestdesktop';
                if(checkIsMobile() == true){ loopVal = 4; mdshortid = 'mdshortlatestismobile'; }
                for (var i=0; i<loopVal; i++){
                    var keys = 'allCategoryData_'+i;
                    var htmlMD = htmlMD+'<div class="col-shorts-home my-3"><a href="'+resultMD[keys][0]['URL']+'"><div class="bg-white rounded shortbox"><div class="position-relative"><img src="'+resultMD[keys][0]['Images']+'" alt="'+resultMD[keys][0]['Homeheadline']+'" class="shorts-image"><i class="imageovericon"></i></div><h6 class="m-2 lineclamp2 ng-binding">'+resultMD[keys][0]['Homeheadline']+'</h6><p class="text px-2 text-secondary mb-2">'+resultMD[keys][0]['Time1']+'</p></div></a></div>';
                }
                $("#"+mdshortid).html(htmlMD); 
            }
        } 
    });
} 

function getloadSimilarArticles()
{
    var firstHyperText = $('#firstHyperText').val();
    var article_id = $('#article_id').val();
    var category_id = $('#category_id').val(); 
    var sub_category_id = $('#sub_category_id').val(); 
    var photoWebstoryid = $('#gallery_id').val();
    $.ajax({
        url: window.location.origin+"/api/similar-article.php", 
        method: "post",
        data: { 
            keyword: firstHyperText, 
            article_id: article_id, 
            category_id: category_id,
            sub_category_id: sub_category_id
        },
        success: function(result)
        {
            var obj = JSON.parse(result);
            if(obj.length > 0){
                var html= '';
                var classMT = '';
                if(photoWebstoryid != '0'){
                    classMT = 'pt-0 pt-md-3';
                }
                 
                for(var x=0; x<obj.length; x++){
                    html = html+'<div class="swiper-slide"><div class="position-relative"><a href="'+obj[x]['URL']+'"><img src="'+obj[x]['Images']+'" alt="" title="" class="" style="border-radius:7.57px"><div class="also-read-image-background"></div><p class="also-read-img-text">'+obj[x]['Homeheadline']+'</p></a></div><div class="also-read-border-right"></div></div>'; 
                } 


                var html1 = '<div class="row also-read-parent background-color-alignment"><div class="col-md-12 background-color-position"><div class="card"><p class="also-read-title">ALSO READ</p><div class="also-read-border-top"></div><div class="bottomSliderSwiper mt-4 position-relative"><div class="swiper-container AlsoreadarticleSwiper mx-md-5"><div class="swiper-wrapper">'+html+'</div></div><div class="swiper-button-prev d-none d-md-block"></div><div class="swiper-button-next d-none d-md-block"></div><div class="also-read-border-bottom"></div><div class="swiper-pagination"></div></div></div></div></div>';
                $(".also_read_widget").html(html1); 
                var alsoreadarticleswiper = new Swiper(".AlsoreadarticleSwiper", {
                    observer: true,
                    observeParents: true,
                    watchSlidesProgress: true,
                    slidesPerView: 1.45,
                    spaceBetween: 30,
                    observer: true,
                    observeParents: true,
                    pagination: {
                        el: ".bottomSliderSwiper .swiper-pagination",
                        type: "progressbar",
                    },
                    navigation: {
                        nextEl: '.bottomSliderSwiper .swiper-button-next',
                        prevEl: '.bottomSliderSwiper .swiper-button-prev',
                    },
                    breakpoints: {
                            // when window width is >= 640px
                            640: {
                                slidesPerView: 3,
                                spaceBetween: 30,
                        }
                    }
                }); 
            }
        }
    });
}  


function subscriptionUserFunction() {
    var consumption_id = $("#is_user_logedin").val();
    var is_paid = $("#is_paid").val();
    if((consumption_id != "" || consumption_id != 0 ) && is_paid == 'Y'){
        $('.conscent-loader').show();
        var content_id = $('#article_id').val();
        jQuery.ajax({
            type:"POST", 
            url:window.location.origin+"/subscription/api/article-decription-after-payment.php", 
            data: {
                consumption_id: consumption_id,
                content_id: content_id
            },success:function(response) {
                var res=JSON.parse(response);
                if(res.msg != "false") {
                    $('.article_txt').next('p').remove();
                    $('.conscent-loader').hide();
                    $('.article_txt').html(res.description_new);
                    getMDShortData();
                    //getloadSimilarArticles();
                    getPollData();
                }
            }
        });
    } 
} 


function getPollData() {
    var poll_id = $("#poll_id").val();
    var is_paid = $("#is_paid").val();
    if(poll_id != "" || poll_id != 0 ){
        jQuery.ajax({
            type:"POST", 
            url:window.location.origin+"/common-detail-pages/poll-section-ajax.php", 
            data: {
                poll_id: poll_id,
                is_paid: is_paid
            },success:function(response) {
                if(response !=  "") {
                    $('#poll-section').html(response);
                }
            }
        });
    }
} 
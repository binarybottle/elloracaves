  var relatedData = true;
var inBtwData = true;
var trendingData = true;
var wpWebStoryData = true;
var wpWebStoriesHtml = false;
let key = 0;
let highlightObj = {};
let articleObj = {};
var highlightBtn;
var highlightContainer;
var main_article = document.querySelector('.main-article_post');
let related_div = false;
let inBtw_div = false;
let trending_div = false;
inBtw_div = document.getElementById("inbtw_content_maindiv");
trending_div = document.getElementById("trnd-cnt");
related_div = document.getElementById("reltd-cnt");
 console.log("CI/CD Testing for  Master 15-DEC-2025 22:38");
let base_url = "";
if(typeof(baseurl) != 'undefined'){ //baseurl from mainlayout.js
    base_url = baseurl;
}

let guid_track = {};

console.log("initializing article.js");

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function getCarousalForInBtwArticles(posts, post_id,inbtw_label) {
    var html = '';
    if(posts.length == 1 && posts[0].guid == post_id){
        return html;
    }
    
    html += '<div class="alsoRead-article"><div class="read-bw-article">';
    html +=`<div class="in-bw-heading" style="color:${theme_color}">${inbtw_label}</div>`
    let loop_count = posts.length > inbtw_count ? inbtw_count : posts.length;
    for(let i=0; i<loop_count; i++) {       
        let post = posts[i];
        let review_class = post.review&& post.review.review_type?post.review.review_type:"";
        if(post.guid == post_id) continue;

        articleUrl = post.article_url+'?utm=inbtwarticles';    
        articleUrl = articleUrl.replace("?=", "");
        html+=`<article class="card-df ${review_class}_review"><div class="thumb-img"><a href="${articleUrl}"><picture><img src="${post.image_thumb}"alt="Flowers" style="width:auto;"></picture></a></div>`;
            html+=`<div class="entry-content">`;
            if (post.category.name){
                html+= `<h4 style="color:${theme_color}"><a href="${post.category.url}" style="color:${theme_color}">${post.category.name}</a></h4>`;
            }
            html+=  `<div class="h2-title"><h2><a href="${articleUrl}">${post.t}'</a></h2></div>`;
            html+=  `<span class="v-more"><a href="${post.category.url}" style="color:${theme_color}">View More <img src="/images/right-arrow.svg" alt="right-arrow"></a></span></div></article>`;
        break;
    }
    html += '</div></div>';
    return html;
}

function inBtwPostsLisitingArticle(posts, post_id,inbtw_label){
    var html = '';
    if(posts.length == 1 && posts[0].guid == post_id){
        return html;
    }

    html += `<div class="in-bw-heading" style="color:${theme_color}">${inbtw_label}</div>`;
    html += '<div class="alsoRead-article"><div class="read-bw-article">';
    let loop_count = posts.length > inbtw_count ? inbtw_count : posts.length;
    for(let i=0; i<loop_count; i++) {
        let post = posts[i];
        if(post.guid == post_id) continue;
        articleUrl = post.article_url+'?utm=inbtwarticles';    
        articleUrl = articleUrl.replace("?=", "");
        html+=`<article class="card-df">
            <div class="thumb-img">
                <a href="${articleUrl}">
                    <picture>
                        <img src="${post.image_thumb}"
                            alt="Flowers" style="width:auto;">
                    </picture>
                </a>
            </div>
            <div class="entry-content">
                <h4>Also Read</h4>
                <div class="h2-title">
                    <h2><a href="${articleUrl}">${post.t}'</a></h2>
                </div>
                <span class="v-more"><a href="">View More <img src="/images/right-arow.svg" alt="right-arow"></a></span>
            </div>
        </article>`
        break;
    }
    html += '</div></div>';
    return html;
 } 

function inBtwPostsBoldLinkArticle(posts, post_id, inbtw_label) {
  console.log("inBtwPostsBoldLinkArticle called", posts.length, "ewe",inbtw_count);
  var html = "";
  if (posts.length == 1 && posts[0].guid == post_id) {
    return html;
  }

  html += '<div class="alsoRead-article"><div class="read-bw-article">';
  html += `<div class="in-bw-heading">${inbtw_label}</div>`;
  html += `<ul style="list-style-type: disc;padding-left: 20px;">`;
  let loop_count = posts.length > inbtw_count ? inbtw_count : posts.length;
  for (let i = 0; i <loop_count; i++) {
    let post = posts[i];
    if (post.guid == post_id) continue;
    articleUrl = post.article_url + "?utm=inbtwarticles";
    articleUrl = articleUrl.replace("?=", "");
    html += `<li style="font-size: 19px; font-weight: 700; color:${theme_color}">
        <a href="${articleUrl}">${post.t}'</a>
    </li>`;
  }
  html += `</ul>`;
  html += `</div></div>`;
  return html;
}


function getListingForRelatedArticles(posts) {
    var html = '';
    if(reltd_cardName == "") {
        reltd_cardName = 'Related News';
    }
    if(posts.length) {
        html += ' <h2 class="reltd-head">'+reltd_cardName+'</h2>';
        html += '<div class="reltd-posts">';
        let loop_count = posts.length > reltd_count ? reltd_count : posts.length;
        for(let i=0; i<loop_count; i++) {
            let post = posts[i];
            articleUrl = post.article_url+'?utm=relatedarticles';    
            var article_friendly_url = articleUrl.replace("?=", "");
            html += '<div class="reltd-art"> ';
            html += '<a class="reltd-link" href="'+article_friendly_url+'">';
            html += '<div class="reltd-card">';     
            html += `<picture style="height: 80px;" class="reltd-img"><source type="image/webp" srcset="${post.image_thumb}"><source type="image/jpeg" srcset="${post.fallback_image}"><img style="object-fit: cover;height: inherit;" alt="${post.alt_title}" height="80" src="${post.image_thumb}" loading="lazy" /></picture>`;
            html += '<div class="reltd-cntnt"> ';
            html += '<article class="reltd-article">';
            html += '<h2> '+post['t']+' </h2>';
            html += '</article>';
            html += '</div>';
            html += '</div>';
            html += '</a>';
            html += '</div>';
        }
        html += '</div>';
    }
    html += '</div>';
    return html;
}

function getCarousalForRelatedArticles(posts) {
    var html = '';
    if(reltd_cardName == "") {
        reltd_cardName = 'Related News';
    }
    if(posts.length) {
        html += '<span class="reltd-head">'+reltd_cardName+'</span>';
        html += '<div class="reltd_inbtw_content" style="border-left: 10px solid {{widgets.reltd_color}};">';
    
        let loop_count = posts.length > reltd_count ? reltd_count : posts.length;
        for(let i=0; i<loop_count; i++) {
            let post = posts[i];
            articleUrl = post.article_url+'?utm=relatedarticles';
            articleUrl = articleUrl.replace("?=", "");
            html += '<div class="reltd_art">';
            html += ' <a class="reltd_item" href="'+articleUrl+'">';
            html += '  <div class="reltd_card">';
            html += `<picture><source type="image/webp" srcset="${post.image_thumb}"><source type="image/jpeg" srcset="${post.fallback_image}"><img height=80 width="100%" class="reltd-imgcrsl" alt="${post.alt_title}" src="${post.image_thumb}" loading="lazy" /></picture>`;
            if (post.category[0].n){
                html+=`<h3 class="post_catdet hfcrt" style="margin:0px"><span class="cat_name"style="color:${theme_color}">${post.category[0].n}</span></h3>`;
                }
            html += '   <div class="reltd_content"> '+post['t']+' </div>';
            html += '  </div>';
            html += `<div class="reltd_content" style="font-size:14px;font-weight: 400">`;
            if(post.bl){
                html+=`<span class="tfc_min_list" style="color: #989595;">by </span><span class="tfc_min_list hfc_auth" style="color: #989595;"> ${post.bl} </span>`;
            }
            html+=`<div class="tfc_min_list hmltfc_min_list sincetime"  style="color: #989595; margin-top:4px">${post.hldSince_time}</div>`;
            html+=`</div>`;
            html += ' </a>';
            html += '</div>';
        }
        html += '</div>';
    }
    return html;
}
function getReadMoreForRelatedArticles(posts, theme_color) {
    let html = '';
    if(reltd_cardName === "") {
        reltd_cardName = "Related News";
    }
    if(posts.length) {

        html += '<span class="reltd-head"><h3>'+reltd_cardName+'</h3></span>';
        html += '<div class="reltd_read_more">';
        let loop_count = posts.length > reltd_count ? reltd_count : posts.length;
        for(let i=0; i<loop_count; i++) {
            let post = posts[i];
            let articleUrl = post.article_url+'?utm=relatedarticles';
            articleUrl = articleUrl.replace("?=","");
            let category = post.category ? post.category[0] : "";
            html += `
            <a style="float:left;width:100%;color:inherit;" href="${articleUrl}">    
                <div class="reltd_art">
                    <div class="reltd_art_img">
                        <div style="width:100%;float:left;height:100%;">
                            <picture>
                                <source type="image/webp" srcset="${post.image_thumb}">
                                <source type="image/jpeg" srcset="${post.fallback_image}">
                                <img class="reltd-imgcrsl" alt="${post.alt_title}" src="${post.image_thumb}" loading="lazy" />
                            </picture>
                        </div>
                    </div>
                    <div class="reltd_t_dt">
                        <h3>${post.t}</h3>
                        <span style="color:${theme_color};"> ${category.n} </span>
                        <p>${post.since_time}</p>
                    </div>
                    <div class="reltd_cont">
                        <p>${post.intro}</p>
                        <span class="reltd_read_more_btn"><span style="background:${theme_color};padding: 5px 10px; color: white; font-weight: 600; border-radius: 6px;">Read More</span></span>
                    </div>
                </div>
            </a>
            `;
        }
        html += '</div>'

    }
    return html;
}

function getListingForTrendingArticles(posts, trnd_color) {
    var html = '';
    if(trnd_cardName == "") {
        trnd_cardName = 'Trending';
    }
    if(posts.length) {
        html += ` <h2 class="trnd-head" style="color:${trnd_color}">` + trnd_cardName + '</h2>';
        html += '<div class="trnd-posts">';
        let loop_count = posts.length > trnd_count ? trnd_count : posts.length;
        for(let i=0; i<loop_count; i++) {
            let post = posts[i];
            articleUrl = post.article_url+'?utm=trendingarticles';    
            var article_friendly_url = articleUrl.replace("?=", "");
            html += '<div class="trnd-art"> ';
            html += '<a class="trnd-link" href="'+article_friendly_url+'">';
            html += '<div class="trnd-card">';     
            html += `<picture  style="height: 80px;" class="trnd-img"><source type="image/webp" srcset="${post.image_thumb}"><source type="image/jpeg" srcset="${post.fallback_image}"><img style="object-fit: cover;" height=80 alt="${post.alt_title}" src="${post.image_thumb}" loading="lazy" /></picture>`;
            html += '<div class="trnd-cntnt"> ';
            html += '<article class="trnd-article">';
            html += '<h2> '+post['t']+' </h2>';
            html += '</article>';
            html += '</div>';
            html += '</div>';
            html += '</a>';
            html += '</div>';
        }
        html += '</div>';
    }
    html += '</div>';
    return html;
}

function getCarousalForTrendingArticles(posts, trnd_color) {
    var html = '';
    if(posts.length) {
        html += `<span class="trnd-head" style="color:${trnd_color}">`+trnd_cardName+'</span>';
        html += `<span> <a class="trnd_viewall" style="color:${trnd_color}" href="/trendingnews"> ➔ </a> </span>`;
        html += `<div class="trnd_inbtw_content" style="border-left: 10px solid ${trnd_color};">`;
    
        let loop_count = posts.length > trnd_count ? trnd_count : posts.length;
        for(let i=0; i<loop_count; i++) {
            let post = posts[i];
            articleUrl = post.article_url+'?utm=trendingarticles';
            articleUrl = articleUrl.replace("?=", "");
            html += '<div class="trnd_art">';
            html += ' <a class="trnd_item" href="'+articleUrl+'">';
            html += '  <div class="trnd_card">';
            html += `<picture class="trnd_img"><source type="image/webp" srcset="${post.image_thumb}"><source type="image/jpeg" srcset="${post.fallback_image}"><img height=80 width="100%" style="object-fit:cover" alt="${post.alt_title}" src="${post.image_thumb}" loading="lazy" /></picture>`;
            html += '   <div class="trnd_content"> '+post['t']+' </div>';
            html += '  </div>';
            html += ' </a>';
            html += '</div>';
        }
        html += '</div>';
    }
    return html;
}

function getCarousalWithNumberForTrendingArticles( posts, trnd_color){
  let html="";

  if(posts.length){
    html=`<div id="hwpc"class="trd_wdg_wrp" style="background-color:${theme_color}; ">
    <a title="TRENDING" href="/trendingnews"
          <h2 id="hwcc_{{data.id}}"class="bg_ttl_wdg" style="background-color:${theme_color}; 
          style="text-decoration: none; color:${trnd_color};" >${trnd_cardName}</h2></a>`;
      html+=`<div class="swiper swiper-initialized swiper-horizontal swiper-backface-hidden" >`;
      html+=`<div class="swiper-wrapper" id="swiper-wrapper-c41a792fed13c197" aria-live="polite">`;

      let loop_count = posts.length > trnd_count ? trnd_count : posts.length;
        for(let i=0; i<loop_count; i++) {
            let post = posts[i];
            articleUrl = post.article_url+'?utm=trendingarticles';
            articleUrl = articleUrl.replace("?=", "");
            html +=`<div class="swiper-slide swiper-slide-active" role="group" aria-label="1/5"style="width: 350.667px; margin-right: 60px;">`;
            html += `<a class="trd_itm_wrp" title="{{t}}" href="${articleUrl}"><span class="cn_trd_itm_img">`;
            html += `<span class="cn_trd_itm_img"><source type="image/webp" srcset=${post.image_thumb}>`;
            html += `<source type="image/jpeg" srcset=${post.fallback_image}>`;
            html += ` <img width="290" height="163" title="{{t}}" class=" lazyloaded" src=${post.image_thumb}" alt="{{alt_title}}" height="100%" style=" width:100%;object-fit: cover; border-radius: 10px; " loading="lazy">`;
            html += ` </picture></span>`;
            html +=`<span class="number">${i+1}</span>`;
            html += `<h3><span class="trd_itm_ttl" style="color:${trnd_color}">${post['t']}</span></h3>`;
            html += `</a></div>`;
        }
       html+= `</div>`
       html+=` <span class="swiper-notification" aria-live="assertive" aria-atomic="true"></span>`;
       html+=`</div>`
       html+=`<div class="mrk_box_ftr"> <a class="mrk_box_lnk_btn" title="view more" href="/trendingnews">`;
       html+=`<span class="mrk_lnk_txt" style=" color:${trnd_color};">view more</span> </a> </div>`
       html+=`</div>`;

  }
  return html
}

function getStoryCarousal(posts) {
    var html = '';
    if(posts.length) {
        html += `<span class="trnd-head" id="wptrnd-head" style="font-size:20px;font-weight: 700; padding: 5px 5px; float: left;">`+wp_ws_cardName+'</span>';
        html += '<div class="c_scrsl">';
        html += `<style>.fpt_scrsl{background:linear-gradient(to top,${wp_ws_background},rgba(0,0,0,.44),transparent);}</style>`
        let loop_count = posts.length;
        for(let i=0; i<loop_count; i++) {
            let post = posts[i];
            let image = '/images/image_thumb.jpeg';
            if(post['image'] != "") {
                image = post['image'];
            }
            html += '<div class="fs_scrsl">';
            html += ' <a href="'+post['share_url']+'">';
            html += '  <div class="e_scrsl">';
            html += `    <div class="g_scrsl"> </div>`;
            html += `    <picture class="img_scrsl" >`;
            html += `       <source type="image/webp" srcset=`+image+`>`;
            html += `       <source type="image/jpeg" srcset=`+image+`>`;
            html += `       <img alt=`+post['title']+` src="`+image+`" height="100%" style=" width:100%;object-fit: cover;" loading="lazy" /> `;
            html += `     </picture>`;
            html += '    <div class="fpt_scrsl">';
            html += '       <div class="h_scrsl" style="color:' + wp_ws_text_color + ';"> '+post['title']+' </div>';
            html += '    </div>';
            html += '  </div>';
            html += ' </a>';
            html += '</div>';
        }
        html += '</div>';
    }
    return html;
}

function getStoryShort(posts) {
    var html = '';
    if(posts.length) {
        html += `<span class="trnd-head" id="wptrnd-head" style="font-size:20px;">`+wp_ws_cardName+'</span>';   
        html += '<div class="wp_class_33_ssr" id="wp_class_33_ssr">';
        html += `<div class="wp_sr_main">`;
        html += `<style>.wp_sr_span2{border: 4px solid ${wp_ws_background};}</style>`
        for(let i = 0; i < posts.length; i++){
            let post = posts[i];
            let image = '/images/image_thumb.jpeg';
            if(post["image"] != ""){
                image = post['image'];
            }
            html += `<a class="wp_sr_a" href="${post["share_url"]}?utm=wpwebstories">`;
            html += `    <span class="wp_sr_span"></span>`;
            html += `     <picture class="wp_sr_span2" style="overflow: hidden;">`;
            html += `        <source type="image/webp" srcset=${image}>`;
            html += `        <img alt='${post["title"]}' src=${image} height="100%" style=" width:100%;object-fit: cover;" loading="lazy" />`; 
            html += `    </picture>`;
            html += `    <span class="wp_sr_span3" style="color:${wp_ws_text_color};"> ${post["title"]} </span>`;
            html += `</a>`;
        }
        html += '</div>';
        html += '</div>';
    }
    return html;
}

function loadPageResources() {

    var image_count =gallery.split(',').length;  
    var gallery_url = window.location.href.split('/');

    var gallery_index = 1;
    if ( gallery_url[7] !== void 0 ) {
        if (!isNaN(gallery_url[7])) {
            gallery_index = gallery_url[7];
        }
    } 

    if(document.getElementById("add_div_"+gallery_index) !== null){
        document.getElementById("add_div_"+gallery_index).style.display = "";

        var href = gallery_url[0]+'//'+gallery_url[1]+gallery_url[2]+'/article/'+gallery_url[4]+'/'+gallery_url[5]+'/item/';

        var next_gallery_index = parseInt(gallery_index)+1;
        var prev_gallery_index = parseInt(gallery_index)-1;
        var next_action = '<a href="'+href+next_gallery_index+'"> Next » </a>';
        var prev_action = '<a href="'+href+prev_gallery_index+'"> « Previous </a>';
        var next_arrow = '<a href="'+href+next_gallery_index+'"> <span> &#10142; </span></a>';
        var prev_arrow = '<a href="'+href+prev_gallery_index+'"> <span> &#10142; </span></a>';

        document.getElementById('gallery_placeholder').style.display = 'none';

        if (gallery_index == 1) {
            document.getElementById("next_gallery_"+gallery_index).innerHTML += next_action;
        } 
        else if(gallery_index == image_count){
            document.getElementById("prev_gallery_"+gallery_index).innerHTML += prev_action;
        }
        else if(gallery_index > 1) {
            document.getElementById("next_gallery_"+gallery_index).innerHTML += next_action;
            document.getElementById("prev_gallery_"+gallery_index).innerHTML += prev_action;
        }
    }

    var showTextToSpeech = true
    window.onscroll = function changeClass() {
        var scrollPosY = window.pageYOffset | document.body.scrollTop;
        var scrollTop = window.pageYOffset;
        var docHeight = document.body.offsetHeight;
        var winHeight = window.innerHeight;
        var scrollPercent = (scrollTop) / (docHeight - winHeight);
        var scrollPercentRounded = Math.round(scrollPercent*100);
        let inbtw_call = false;
        let trending_call = false;
        let related_call = false;
        if(inBtwData && inBtw_div){
        let rect_inbtw = inBtw_div.getBoundingClientRect();

            // inbtw_call = (
            //     rect_inbtw.top >= 0 &&
            //     rect_inbtw.left >= 0 &&
            //     rect_inbtw.bottom <= ((window.innerHeight || document.documentElement.clientHeight) + 200) &&
            //     rect_inbtw.right <= (window.innerWidth || document.documentElement.clientWidth)
            // );

            inbtw_call = (
                rect_inbtw.top >= 0 &&
                rect_inbtw.left >= 0 &&
                rect_inbtw.bottom <= ((window.innerHeight || document.documentElement.clientHeight) + 200) 
            );
          
        }
        if(trendingData && trending_div){
            let rect_trending = trending_div.getBoundingClientRect();
            trending_call = (
                rect_trending.top >= 0 &&
                rect_trending.left >= 0 &&
                rect_trending.bottom <= ((window.innerHeight || document.documentElement.clientHeight) + 200)
            );
            
        }
        if(relatedData && related_div){
            let rect_related = related_div.getBoundingClientRect();
            related_call = (
                rect_related.top >= 0 &&
                rect_related.left >= 0 &&
                rect_related.bottom <= ((window.innerHeight || document.documentElement.clientHeight) + 200) 
            );


        }
        
        var scroll = document.getElementById('scrolltotop');
        var converttext= document.getElementById("converttext");
        if(scroll != undefined) {
            //if(scrollPosY > 300) {
            if(scrollPercentRounded > 30) {
                scroll.style.display = 'block';              
            } else {
                scroll.style.display = 'none';
            }
        }
        if(scrollPercentRounded > 30 && showTextToSpeech && converttext!=null){
            showTextToSpeech = false;
            converttext.style.display="block"; 
        }

        if(widgets_wp_webstories) { 
            if(wpWebStoryData) {
                var xhttp_inbtw = new XMLHttpRequest();
                xhttp_inbtw.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var posts = JSON.parse(this.responseText);
                        var html = wp_ws_layout === "wpWebstoriesCarousal" ? getStoryCarousal(posts) : getStoryShort(posts);
                        if(document.getElementById("wp_webstories_cnt1") != null) {
                            document.getElementById("wp_webstories_cnt1").innerHTML += html;
                            wpWebStoriesHtml = html;
                        }
                    }

                };

                var inbtw_endpoint = `${base_url}/widgets/wpwebstories`;
                xhttp_inbtw.open("GET", inbtw_endpoint, true);
                xhttp_inbtw.send();
                wpWebStoryData = false;
            }
        }

        //if(scrollPosY > 600 && inBtwData) {
        if(inbtw_call && inBtwData) { 
            if(widgets_inbtw && document.getElementById("inbtw_content_maindiv") && !isLiveBlog) {
                var xhttp_inbtw = new XMLHttpRequest();
                xhttp_inbtw.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var posts = JSON.parse(this.responseText);
                        let html='';
                        if(widgets_inbtw && posts.length>0){
                            switch(inbtw_layout) {
                                case "inBtwPostsCarousal":
                                     html = getCarousalForInBtwArticles(posts, postId ,inbtw_label);
                                    break;
                                case "inBtwPostsLisiting":
                                    html = inBtwPostsLisitingArticle(posts, postId,inbtw_label);
                                    break;
                                case "inBtwPostsBoldLink":
                                  html = inBtwPostsBoldLinkArticle(posts, postId,inbtw_label);
                                    break;

                            }
                            document.getElementById("inbtw_content_maindiv").innerHTML = html;    
                        }  
                    }

                };

                var inbtw_endpoint = `${base_url}/widgets/inbtwarticles/`+category_id+'/'+inbtw_count;
                xhttp_inbtw.open("GET", inbtw_endpoint, true);
                xhttp_inbtw.send();
                inBtwData = false;
            }
        }

        //if(scrollPosY > 900 && trendingData) {
        if(trending_call && trendingData) { 
            if(widgets_trnding) {
                var xhttp_trnding = new XMLHttpRequest();
                xhttp_trnding.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var posts = JSON.parse(this.responseText);
                        var html = '';
                        switch(trnd_layout) {
                            case 'trendingListing' :
                                html = getListingForTrendingArticles(posts, typeof(trnd_color) === 'undefined' ? "" : trnd_color);
                                break;
                            case 'trendingCarousal' :
                                html = getCarousalForTrendingArticles(posts, typeof(trnd_color) === 'undefined' ? "" : trnd_color);
                                break;
                            case 'trendingCarousalWithNumber':
                                html = getCarousalWithNumberForTrendingArticles(posts, typeof(trnd_color) === 'undefined' ? "" : trnd_color);

                        }
                        document.getElementById("trnd-cnt").innerHTML += html; 
                    }
                };

                var trnding_endpoint = `${base_url}/widgets/trendingarticles/`+trnd_count;
                xhttp_trnding.open("GET", trnding_endpoint, true);
                xhttp_trnding.send();
                trendingData = false;
            }
        }

        //if(scrollPosY > 1000 && relatedData) {
        if(related_call && relatedData) { 
            if(widgets_related) {
                var xhttp_related = new XMLHttpRequest();
                xhttp_related.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var posts = JSON.parse(this.responseText);
                        if(pwa_infinitescroll_enabled) {
                            var articleLinks = posts.filter((post,idx) => idx < 4);
                            posts.forEach((post)=>{guid_track[post.guid] = post.type;});
                            guid_track[postId] = false;
                            articleLinks = articleLinks.map(post=>post.article_url);;
                            initInfiniteScroll(articleLinks);
                            console.log('Infinite Scroll added');
                        } else {
                            var html = '';
                            switch(related_layout) {
                                case 'relatedListing' :
                                    html = getListingForRelatedArticles(posts);
                                    break;
                                case 'relatedCarousal' :
                                    html = getCarousalForRelatedArticles(posts);
                                    break;
                                case 'relatedReadMore' :
                                    html = getReadMoreForRelatedArticles(posts, theme_color);
                                    break;
                            }
                            document.getElementById("reltd-cnt").innerHTML += html; 
                            console.log('related added');
                        }
                        
                    }
                };
                
                var related_endpoint = `${base_url}/widgets/relatedarticles/`+post_id;
                xhttp_related.open("GET", related_endpoint, true);
                xhttp_related.send();
                relatedData = false;
            }
        }  
    };
}

// Removed on load because file is loaded on scroll 
console.log('loading page resources')
loadPageResources();

triggerPageDepthAnalytics(main_article,0);

if(enable_highlighter) {
    highlightBtn = document.getElementById("highlightBtn"); 
    highlightContainer = document.getElementById("highlightContainer");
    function addKey(element) {
        if (element.children.length > 0) {
            Array.prototype.forEach.call(element.children, function(each, i) {
                each.dataset.key = key++;
                addKey(each);
            });
        }
    };
    addKey(document.getElementById('story-detail'));
    initHighlighter();
}

function scrollArticleToView() {
    var hash = window.location.hash;
    if(hash) {
        hash = hash.substring(1,17);
        document.getElementById(hash).scrollIntoView({
            behavior: 'smooth'
        });
    }
}

                            /*******HIGHLIGHTER TRIGGER LISTENERS****** */

if (enable_highlighter ) {
    highlightBtn.addEventListener('click' ,() => {
        var body = highlightContainer.getElementsByClassName('modal-content')[0].getElementsByClassName('modal-body')[0];
        body.innerHTML = '';
        for( let articleId in highlightObj) {
            for(let id in highlightObj[articleId]){
                var image = highlightObj[articleId][id].image;
                var title = highlightObj[articleId][id].title;
                var dispText = highlightObj[articleId][id].dispText;
                var slug = highlightObj[articleId][id].slug;
                var url = `${base_url}/article/${slug}/${articleId}#${id}?utm=highlighter`;
                var savedAt = new Date(highlightObj[articleId][id].savedAt);
                var time = savedAt.toLocaleString('en-US', { timeStyle:'short',hour12: true }).toUpperCase().replace(/^0/, "");
                var date = savedAt.toLocaleString('default', {dateStyle:"medium" }).toUpperCase();
                body.innerHTML += `<div class="highlight-card"><a href="${url}" onclick="highlightContainer.style.display = 'none';scrollArticleToView()"><div class="dispText"><span>${dispText}...</span></div><div style="position: relative;border-radius:15px;overflow:hidden"><img style="height:15vh" src="${image}" alt="Avatar" style="width:100%"></div><div class="container"><h4><b>${title}</b></h4><span style="color:grey;font-size: 14px;line-height: 2em;">${time} | ${date}</span></div></a></div> `; 
            }
        }
        highlightContainer.style.display = "block";
    });

    window.onclick = function(event) {
        if (event.target == highlightContainer) {
            highlightContainer.style.display = "none";
        }
    }
    document.addEventListener('selectionchange', () => {
        let selection = window.getSelection();
        if(!selection.toString().length){
            var tooltips = document.getElementsByClassName('tooltip');
            if(tooltips.length){
                tooltips[0].remove();
            }
        }
    });
    document.getElementById('story-detail').addEventListener('contextmenu', event => { 
        removeTooltip(event);
        event.preventDefault(); 
        let selection = window.getSelection();
        if(selection.toString().length){
            var range = selection.getRangeAt(0);
            var rangeObj = rangeToObj(range);
            rangeObj = checkOverlap(rangeObj);
            var tooltipWrap = createTooltip(range);
            if(rangeObj){
                tooltipWrap.onclick = ()=>highlightText(rangeObj,'','updateCookie');
            } else {
                tooltipWrap.innerText = "Already Highlighted";
                tooltipWrap.onclick = ()=>removeTooltip(event);
            }
            tooltipWrap.addEventListener("click",()=>{
                console.log("Highlight Text Record");
                if(analytics_id !== '') {
                    console.log(app_name);
                    ga('pubTracker.send', {
                        hitType: 'event',
                        eventCategory: 'Track_Highlight_Text ::',
                        eventAction: 'Track_Highlight_Text ::',
                        eventLabel: 'Track_Highlight_Text ::',
                    });
                    ga('masterTracker.send', {
                        hitType: 'event',
                        eventCategory: 'Track_Highlight_Text ::'+app_name,
                        eventAction: 'Track_Highlight_Text ::'+app_name,
                        eventLabel: 'Track_Highlight_Text ::'+app_name,
                    });
                }
            });
            
            document.getElementById('story-detail').append(tooltipWrap);
            
        }
    }); 
}

                                    /*****HIGHLIGHTER FUNCTIONS******/
function initHighlighter() {
    var cookie = getCookie('SortDHighlight');
    if (cookie) {
        highlightObj = JSON.parse(cookie);
        // check if cookie present for current article
        if(highlightObj) { 
            if(Object.keys(highlightObj).length) { 
                if(highlightObj[postId]) {
                    articleObj = highlightObj[postId]; // assign article's highlights to main object
                } else {
                    articleObj = {};
                }
                checkHighlightBtn();
            }

            for(let id in articleObj){
                highlightText(articleObj[id]['rangeObj'], id,'');
            }
            scrollArticleToView();
        }
    }
}

function checkHighlightBtn() {
    Object.keys(highlightObj).every(articleId=> {
        let article = highlightObj[articleId] ;
        if(Object.keys(article).length){
            highlightBtn.style.display = 'block';
            return false;
        } else {
            highlightBtn.style.display = 'none';
            return true;
        }

    });
}
// function that checks overlap on elements and paragraph 
function checkOverlap(rangeObj) {   
    if (!rangeObj.startKey||!rangeObj.endKey) { 
        return false;
    } else if(rangeObj.startKey === rangeObj.endKey && rangeObj.startTextIndex===rangeObj.endTextIndex){ // perfect condition for highlight
        return rangeObj; 
    } else {
        return false;
    }
}

/*TOOLTIP RELATED FUNCTIONS*/

function createTooltip(range) {
    // creat tooltip element
    let tooltipWrap = document.createElement("span"); 
    tooltipWrap.className = 'tooltip'; 
    // check if already selected text is present
    tooltipWrap.innerText = `HIGHLIGHT TEXT`;
    // get selection co ordinates
    const { top: selTop, left: selLeft, width: selWidth } = range.getBoundingClientRect();
    // get tooltip position
    const { newTipLeft,newTipBottom, tipCorrection }= getTooltipPosition(selTop,selLeft,selWidth);
    // tooltip position 
    tooltipWrap.style.left = newTipLeft + 'px';
    tooltipWrap.style.bottom = newTipBottom + 'px';
    tooltipWrap.style.setProperty("--side-correction",tipCorrection );
    // console.log(tooltipWrap.after())
    return tooltipWrap;
}
function removeTooltip(event){
    var tooltips = document.getElementsByClassName('tooltip');
    // if existing tooltip and tooltip not clicked 
    if(tooltips.length && !tooltips[0].contains(event.target) ){
        tooltips[0].remove();
    }
}
function getTooltipPosition (selTop,selLeft,selWidth) {
    let newTipLeft = selLeft + (selWidth / 2) - window.scrollX;
    let tipWidth = 157;
    const buffer = 4;
    let newTipBottom = window.innerHeight - selTop - window.scrollY ;
    const tipHalfWidth = tipWidth / 2;
    const realTipLeft = newTipLeft - tipHalfWidth;
    const realTipRight = realTipLeft + tipWidth;
    let tipCorrection = '50%';
    if (realTipLeft < buffer) {
        // Correct for left edge overlap
        newTipLeft = buffer + tipHalfWidth;
        tipCorrection = '12%' ;
    } else if (realTipRight > window.innerWidth - buffer) {
        // Correct for right edge overlap
        newTipLeft = window.innerWidth - buffer - tipHalfWidth;
        tipCorrection = '78%';
    }
    return {
        newTipLeft,
        newTipBottom,
        tipCorrection
    };
}


/*HIGHLIGHT/ UNHIGHLIGHT FUNCTION*/

function highlightText(rangeObj, id,task){
    
    var highlightWrapper = document.createElement('span');
    highlightWrapper.className = 'highlight';
    highlightWrapper.style.background = '#feff5b';
    highlightWrapper.style.boxShadow = "0px 0px 2px 0px";
    highlightWrapper.style.padding = "4px";
    if (id) {
        highlightWrapper.id =  id;
    } else {
        highlightWrapper.id =  getRandomString();
    }
    var range = objectToRange(rangeObj);
    var unhighlightBtn = document.createElement('span');
    unhighlightBtn.className = 'unhighlight';
    unhighlightBtn.style.cursor = 'pointer';
    unhighlightBtn.onclick = ()=>{unHighlightText(highlightWrapper,rangeObj)}
    unhighlightBtn.innerHTML = '*';
    range.surroundContents(highlightWrapper);
    if(task === 'updateCookie') {
        highlightBtn.style.display = 'block';
        updateCookie(rangeObj,highlightWrapper.id );
        removeTooltip({target: highlightWrapper});
        highlightBtn.click();
    }
    highlightWrapper.appendChild(unhighlightBtn);
}
function unHighlightText(element,unhighlightRangeObj) {
    console.log('Unhighlighted');
    articleObj = highlightObj[postId]; 
    var parent = document.querySelector('[data-key="' + unhighlightRangeObj.startKey + '"]');
    var nodeList = parent.childNodes;
    unhighlightRangeObj.realTextIndex = Array.prototype.indexOf.call(nodeList,element)
    nodeList[unhighlightRangeObj.realTextIndex-1].textContent += element.innerText.slice(0,element.innerText.length-1);
    document.getElementById(element.id).remove();
    delete articleObj[element.id];
    parent.normalize();
    checkHighlightBtn();
    for(let id in articleObj){
        if(articleObj[id].rangeObj.startKey === unhighlightRangeObj.startKey && (articleObj[id].rangeObj.startTextIndex > unhighlightRangeObj.startTextIndex) ){

            let length = articleObj[id].rangeObj.endOffset - articleObj[id].rangeObj.startOffset;
            if(articleObj[id].rangeObj.startTextIndex === unhighlightRangeObj.startTextIndex + 2){
                articleObj[id].rangeObj.startOffset = nodeList[unhighlightRangeObj.realTextIndex-1].textContent.length ;
                articleObj[id].rangeObj.endOffset = nodeList[unhighlightRangeObj.realTextIndex-1].textContent.length + length;
            }
            articleObj[id].rangeObj.startTextIndex -= 2 ;
            articleObj[id].rangeObj.endTextIndex -= 2;
        }
    }


    highlightObj[postId] = articleObj;
    setCookie('SortDHighlight', JSON.stringify(highlightObj),99);
}


/*UTILITY RELATED FUNCTIONS*/

function getRandomString() {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( const element of randomChars ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    result = `${result.substr(0,16)}`;
    return result;
}
function objectToRange(rangeStr) {
    range = document.createRange();
    var start = document.querySelector('[data-key="' + rangeStr.startKey + '"]');
    var end = document.querySelector('[data-key="' + rangeStr.endKey + '"]');

    range.setStart(start.childNodes[rangeStr.startTextIndex], rangeStr.startOffset);
    range.setEnd(end.childNodes[rangeStr.endTextIndex], rangeStr.endOffset);


    
    return range;
}
function rangeToObj(range) {
    let rangeObj = {
        startKey: range.startContainer.parentNode.dataset.key,
        endKey: range.endContainer.parentNode.dataset.key,
        startTextIndex: Array.prototype.indexOf.call(range.startContainer.parentNode.childNodes, range.startContainer),
        endTextIndex: Array.prototype.indexOf.call(range.endContainer.parentNode.childNodes, range.endContainer),
        startOffset: range.startOffset,
        endOffset: range.endOffset
    };
    if (rangeObj.startKey && rangeObj.endKey) {
        return rangeObj;
    } else if(!rangeObj.startKey && !rangeObj.endKey) {
        console.log('starts and ends in highlighted');
        rangeObj.startTextIndex = Array.prototype.indexOf.call(range.startContainer.parentNode.parentNode.childNodes, range.startContainer.parentNode);
        rangeObj.endTextIndex = Array.prototype.indexOf.call(range.endContainer.parentNode.parentNode.childNodes, range.endContainer.parentNode);
        return rangeObj;
    } else if (!rangeObj.startKey) {
        console.log('starts in highlighted');
        rangeObj.startTextIndex = Array.prototype.indexOf.call(range.startContainer.parentNode.parentNode.childNodes, range.startContainer.parentNode);
        return rangeObj;
    } else {
        console.log('ends in highlighted');
        rangeObj.endTextIndex = Array.prototype.indexOf.call(range.endContainer.parentNode.parentNode.childNodes, range.endContainer.parentNode);
        return rangeObj;
    }
        
    
}   


/*COOKIE RELATED FUNCTIONS*/

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
function updateCookie(rangeObj, id){
    var elm = document.getElementById(id);
    var dispText = elm.innerText.length > 60 ? elm.innerText.substring(0,60):elm.innerText ;
    if(!highlightObj[postId]) { // if cookie not present for this article, initialise it 
        highlightObj[postId] = {};
    } 
    let newCookie = {
        rangeObj:rangeObj,
        title: post_title,
        image: post_image_medium,
        dispText:dispText,
        slug: slug,
        savedAt:new Date()
    }
    //storing rangeObj as span's id
    highlightObj[postId][id] = newCookie;
    articleObj[id] = newCookie;
    setCookie('SortDHighlight', JSON.stringify(highlightObj),99);
}

/*INFINITE SCROLL FUNCTIONS*/

function initInfiniteScroll(articleLinks) {
    articleLinks = articleLinks.map(e=> e+='?utm=infinitescroll');

    let infScroll = new InfiniteScroll(main_article, 
        {   path: getLinkForArticle, 
            append: '.main-article_post', 
            scrollThreshold: 400,
            status: '.page-load-status'
        });

    function getLinkForArticle() {
        let link = articleLinks[ this.loadCount ];
        if ( link ) return `${link}`;
    }
    function removeDeferScripts() {
        var _scripts = document.querySelectorAll('script[type="sortdDeferScript"]');

        for(var i=0,l=_scripts.length;i<l;i++){
            var _type = _scripts[i].getAttribute("type");

                var _s = document.createElement('script');
                
                if(_scripts[i].defer){
                    _s.defer = true;
                }
                
                if(_scripts[i].src.length) {
                    if(_scripts[i].src.includes('/dyn/')) {
                        _s.async = true;
                    }
                    _s.src= _scripts[i].src;
                } else {
                    if(_scripts[i].getAttribute('sortd_type')){
                        _s.type = _scripts[i].getAttribute('sortd_type');
                    } else {
                        _s.type = 'text/javascript';
                    } 
                    _s.innerHTML = _scripts[i].innerHTML;
                }
                
                _scripts[i].parentNode.replaceChild(_s, _scripts[i]);
                
        }
    }
   

    infScroll.on( 'append', function( path, fetchPromise ) {
        console.log('article appended');
        removeDeferScripts();
        console.log(analytics_id);
        console.log(app_name);
        if(analytics_id !== '') {
            // analytics trigger
            ga('create', analytics_id , 'auto','pubTracker');
            ga('create', 'UA-86303243-48', 'auto','masterTracker');
            ga('masterTracker.send', 'pageview');
            ga('pubTracker.send', 'pageview');
        }
        var articles = document.querySelectorAll(".main-article_post");
        var storyContent = document.querySelectorAll('#story-detail');
        var inbtw_content_maindiv = document.querySelectorAll('#inbtw_content_maindiv');
        var donation_widget = document.querySelectorAll('#razorpay_donation');
        let loader_ellips = document.getElementsByClassName('loader-ellips')[0];
        let wpWebStoriesDiv = document.querySelectorAll('#wp_webstories_cnt1');
        let cricketWidget = document.querySelectorAll("#cricket_widget_wc");
        loadGalleryPost();
        if(inbtw_content_maindiv[this.loadCount]) {
            inbtw_content_maindiv[this.loadCount].style.display = "none";
            console.log('in_between widget removed');
        }
        
        if(donation_widget[this.loadCount]) {
            donation_widget[this.loadCount].style.display = "none";
            console.log("donation widget removed")
        }

        if(cricketWidget[this.loadCount]){
            cricketWidget[this.loadCount].style.display = "none";
        }
        
        storyContent = storyContent[this.loadCount]; // incoming story content
        
        // add instagram embed
        if (storyContent.innerHTML.includes('www.instagram.com')) {
           window.instgrm.Embeds.process();
        }

         //add wpwebstories in appended article
         if(wpWebStoriesDiv[this.loadCount] && wpWebStoriesHtml){
            wpWebStoriesDiv[this.loadCount].innerHTML = wpWebStoriesHtml;
        }
        
        //addNextArticleTag
        var newNode = document.createElement("div");
        newNode.className = 'nextStory';
        let parentDiv = articles[this.loadCount].parentNode;
        var innerHtml = `Next Article <span class="triangle_down"> </span>`;
        newNode.innerHTML = innerHtml;
        parentDiv.insertBefore(newNode,articles[this.loadCount]);
        
        //remove share button on mobile
        var shareButtons = document.querySelectorAll("#shareButton");
        var currentButton = shareButtons[this.loadCount];
        if (currentButton ){
          currentButton.addEventListener("click", async () => {
            console.log("native_share");
            try {
              await navigator.share({ title: post_title, url: "" });
              console.log("Data was shared successfully");
            } catch (err) {
              console.error("Share failed:", err.message);
            }
        });
        if (navigator.share === undefined)
            currentButton.hidden = true;
        }

        //remove loader for last article
        if(this.loadCount === 3){
            loader_ellips.remove();
        }
        
        triggerPageDepthAnalytics(articles[this.loadCount],window.scrollY) 


        var articles_data = document.querySelectorAll('#story-detail');
        var previous_article = this.loadCount - 1;
        refreshAds(articles_data[this.loadCount], articles_data[previous_article]);
        //removeAdDivs(articles[this.loadCount]);
    });
    
}

function loadGalleryPost() {
    const getAllGallery = document.querySelectorAll('section.main-content-section.gallery.main-article_post');
    if (getAllGallery.length === 0) return;
    const getGallery = getAllGallery[getAllGallery.length - 1];
    const postGuid = getGallery.dataset.guid;
    if (postGuid && guid_track[postGuid] == "gallery") {
        PhotoGallery();
        guid_track[postGuid] = false;
    }
}

function removeAdDivs(element) {
    console.log('removing ad divs')
    const adDivs = element.querySelectorAll('div[class^="ad_div"]');
    console.log(adDivs);
    adDivs.forEach((adDiv) => {
        adDiv.remove();
    });
}

function fetchAdCodes(element) {
    console.log('fetching adcodes for current page -----');
    return element.querySelectorAll('div[id^="div-gpt-ad-"]');
}

function replaceExistingAdcodes(existingAds) {
    //replace exisiting adcodes starting with div-gpt-id and add new placeholder with class adPlaceholder
    console.log('replacing current page ads divs with placeholder -----');
    existingAds.forEach((adDiv, index) => {
        const newAdDiv = document.createElement('div');
        newAdDiv.classList.add('ad_placeholder');
        adDiv.parentNode.replaceChild(newAdDiv, adDiv);
    });
}

function removeAllAdcodes(element, previous_article) {
    console.log('removing all ad divs from page ------ ');
    var currentUrl = window.location.href;
    
    var stories = document.querySelectorAll('#story-detail');
    var lastElement = stories[stories.length - 1];
    var className = lastElement.className;
    var currentGuid = className.replace("story_detail", "");
    console.log(currentGuid);
    var story_ad = 'div.ad_div:not(.story_detail'+currentGuid+' div.ad_div)';
    console.log(story_ad);
    //const adDivs = document.querySelectorAll(story_ad); 
    const adDivs = previous_article.querySelectorAll(story_ad);
    console.log(adDivs);
    adDivs.forEach((adDiv) => {
        console.log('removing ad div');
        adDiv.remove();
    });
}

function addNewAdCodes(existingAds, adPlaceholder) {
    console.log(' adding new adcode for current page -------');
    adPlaceholder.forEach((newAdDiv, index) => {
        const adCode = existingAds[index];
        newAdDiv.appendChild(adCode);
      });
  
}

function refreshAds(element, previousArticle) {
    console.log('refreshing ad codes-----');

    const existingAds = fetchAdCodes(element);
    console.log(existingAds);
    
    if(existingAds.length) {
        
        replaceExistingAdcodes(existingAds);
        
        removeAllAdcodes(element, previousArticle);

        const adPlaceholder = element.querySelectorAll('.ad_placeholder');
        console.log('ad placeholders --------------');
        console.log(adPlaceholder);

        addNewAdCodes(existingAds, adPlaceholder);
        googletag.cmd.push(function() {
            console.log('finally calling googletag.pubads.refresh ----- ');
            googletag.pubads().refresh();
            //googletag.display();
        });
    }    
}


function triggerPageDepthAnalytics(element, oldHeight) {
    var trackerEvent=0;
    if(analytics_id !== '') {

        element.addEventListener("touchmove", function(ev) {
            if ((window.innerHeight + window.scrollY - oldHeight) >=((( element.offsetHeight)/100)*50) && trackerEvent==0 ) {
                ga('pubTracker.send', {
                                hitType: 'event',
                                eventCategory: "Track_Page_Depth_Article_Page_50%  ",
                                eventAction: "Track_Page_Depth_Article_Page_50%  ",
                                eventLabel: "Track_Page_Depth_Article_Page_50%  "
                                });
                ga('masterTracker.send', {
                                hitType: 'event',
                                eventCategory: "Track_Page_Depth_Article_Page_50% :: "+app_name,
                                eventAction: "Track_Page_Depth_Article_Page_50% :: "+app_name,
                                eventLabel: "Track_Page_Depth_Article_Page_50% :: "+app_name
                                });
                console.log("Track_Page_Depth_Article_Page_50%  ");
                trackerEvent=1;
            }
            if ((window.innerHeight + window.scrollY - oldHeight) >=((( element.offsetHeight)/100)*75) && trackerEvent==1) {
                ga('pubTracker.send', {
                                hitType: 'event',
                                eventCategory: "Track_Page_Depth_Article_Page_75%  ",
                                eventAction: "Track_Page_Depth_Article_Page_75%  ",
                                eventLabel: "Track_Page_Depth_Article_Page_75%  "
                                });
                ga('masterTracker.send', {
                                hitType: 'event',
                                eventCategory: "Track_Page_Depth_Article_Page_75% "+app_name,
                                eventAction: "Track_Page_Depth_Article_Page_75% "+app_name,
                                eventLabel: "Track_Page_Depth_Article_Page_75% "+app_name
                                });
                console.log("Track_Page_Depth_Article_Page_75%  ");
                trackerEvent=2;
            }
        });
    }

}
//add code for text-to-speech

var pauseBtn = document.getElementById("pause");
var playBtn = document.getElementById("play");
var resumeBtn = document.getElementById("resume");
var speechtext = new SpeechSynthesisUtterance();

function getTextToSpeak() {
    var list = audio_content.split('.');
    console.log(list.unshift(post_title));
    console.log(list);
    return list;
}

function speak(list) {
    if (list.length) {
      speechtext.text = list[0];	
      speechtext.onstart = function() {
        console.log('speech started!')
      };
      speechtext.onend=function(){
        console.log('speech ended!')
        speechSynthesis.cancel();
        speak(list.slice(1));
      }
      speechtext.lang='hi';
      speechtext.volume = 1;
      speechSynthesis.cancel();  
      speechSynthesis.speak(speechtext);
    }
    else{
        window.speechSynthesis.cancel();  
        pauseBtn.style.display="none";
        playBtn.style.display="block";
    }
  }
if(pauseBtn!=null){
    pauseBtn.addEventListener("click", () => { 
        // Pause the speechSynthesis instance 
         window.speechSynthesis.pause();
         pauseBtn.style.display="none";
         playBtn.style.display="block";                         
     });
}
if(resumeBtn!=null){
resumeBtn.addEventListener("click", () => { 
    pauseBtn.style.display="block";
    resumeBtn.style.display="none";
    window.speechSynthesis.cancel(); 
    var textList = getTextToSpeak();
    speak(textList);  
});
}
if(playBtn!=null){
playBtn.addEventListener("click", () => { 
    pauseBtn.style.display="block";
    playBtn.style.display="none";
    var scrollcontent = document.getElementById("story-detail");
    scrollcontent.scrollIntoView({behavior: 'smooth' });
    var textList = getTextToSpeak();
    speak(textList);  
}); 
}
// pauses the voice when you switch to another tab and minimize browser and click any articles
if(pauseBtn && playBtn && resumeBtn) {
    (function() {
        'use strict';
        // Set the name of the "hidden" property and the change event for visibility
        var hidden, visibilityChange; 
        if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
          hidden = "hidden";
          visibilityChange = "visibilitychange";
        } else if (typeof document.mozHidden !== "undefined") { // Firefox up to v17
          hidden = "mozHidden";
          visibilityChange = "mozvisibilitychange";
        } else if (typeof document.webkitHidden !== "undefined") { // Chrome up to v32, Android up to v4.4, Blackberry up to v10
          hidden = "webkitHidden";
          visibilityChange = "webkitvisibilitychange";
        }
        function handleVisibilityChange() {
          if (document[hidden]) {
           window.speechSynthesis.pause();
            
          } else {
            playBtn.style.display="block";
            pauseBtn.style.display="none";
          }
        }
        // Warn if the browser doesn't support addEventListener or the Page Visibility API
        if (typeof document.addEventListener === "undefined" || typeof document[hidden] === "undefined") {
          console.log("This functionalities a modern browser that supports the Page Visibility API.");
        }
         else {
          // Handle page visibility change hidden,visible  
          document.addEventListener(visibilityChange, handleVisibilityChange, false);
    
        }
    })();
}


//Paid articles code
if(is_paid_article_enabled){
    if(is_article_paid && !show_paid_article.status){

        //display handle
        // let pymntpopup = document.getElementById("paid_article");
        let mobinput = document.getElementById("login_number");
        // let scrltop = this.document.getElementById("scrolltotop");
        let vrfybtn = document.getElementById("loginid_submit");
        let validation = document.getElementById("login_number_validation");
        let article_content = document.getElementById("story-detail");
        let inputdiv = document.getElementById("lg_disply");
        // let bg_blur = document.getElementById("blur_screen");
        let otp_div = document.getElementById('otp_div');
        let alert_para = document.getElementById('alert_para');
        let otp = document.getElementById('otp');
        let otp_resend = document.getElementById('otp_resend');
        let otp_attempt = document.getElementById('otp_attempt');
        // window.addEventListener("scroll", function() {
        //     if(window.pageYOffset >= 200){
        //         pymntpopup.style.display = "block";
        //         scrltop.style.display = "none";
        //         bg_blur.style.display = 'block';
        //         //otp_div.style.display = 'none';
        //     }else{
        //         pymntpopup.style.display = "none";
        //         inputdiv.style.display = "none";
        //         bg_blur.style.display = 'none';
        //         validation.innerHTML = '';
        //         alert_para.innerText = 'Verify your mobile number.';
        //         vrfybtn.classList.remove('wiggle_once');
        //     }
        // })

        // document.getElementById("close_paymntblck").onclick = function () {
        //     pymntpopup.style.display = "none";
        //     inputdiv.style.display = "none";
        //     bg_blur.style.display = 'none';
        //     validation.innerHTML = '';
        //     alert_para.innerText = 'Verify your mobile number.';
        //     vrfybtn.classList.remove('wiggle_once');
        // }
        
        
        document.getElementById("paid_article_para").onclick = function () {
            if(inputdiv.style.display === 'none'){
                inputdiv.style.display = 'block';
            }else{
                inputdiv.style.display = 'none';
                alert_para.innerText = 'Verify your mobile number.';
                validation.innerHTML = '';
            }
        }
        mobinput.onkeyup = function() {
            vrfybtn.classList.remove('wiggle_once');
            validation.innerHTML = '';
            let login_phone = mobinput.value;
            if(!login_phone){
                vrfybtn.style.background = theme_color;
                return;
            }
            let filter = 
            /^[0-9]{10}$/;   
            if (!filter.test(login_phone)) {
                vrfybtn.style.background = '#d90b0b';
            }
            else{
                vrfybtn.style.background = '#045e04';
                vrfybtn.classList.add("wiggle_once");
            }
        }

        //Payment handle

        document.getElementById("article_pay_button").onclick = function() {
            validation.innerHTML = "";
            document.getElementById("article_pay_button").disabled = true;
            let amount = article_price * 100;
            //create order api call
            var xhttp_create_order = new XMLHttpRequest(); 
            xhttp_create_order.onreadystatechange = function () {
                if(this.readyState == 4 && this.status == 200){
                    var order_response = JSON.parse(this.responseText);
                    if(order_response.status){ //order successfully created
                        //razorpay checkout
                        var options = order_response.options;
                        options['theme'] = {
                            'color':theme_color,
                        }
                        options.handler = function (response) { //callback function after successful payment
                            response['amount'] = amount
                            response['currency'] = 'INR';
                            response['option'] = 'paid_article';
                            response['id'] = paid_article_cookie_name;
                            var xhttp_verify = new XMLHttpRequest();

                            //verification on successful payment
                            xhttp_verify.onreadystatechange = function(){
                                if(this.readyState == 4 && this.status == 200){
                                    //check verification, set credentials and cookies
                                    var verification_response = JSON.parse(this.responseText);
                                    if(verification_response.status){
                                        // let credentials = {
                                        //     'payment_id': response.razorpay_payment_id,  //handle payment id exposure
                                        // };
                                        //let cookie_data = JSON.stringify(credentials);
                                        //setCookie(paid_article_cookie_name,cookie_data,30);
                                        show_paid_article.status = false;
                                        disCutCopyPaste();
                                        //getPaidArticleData(cookie_data);
                                        display_excerpt();
                                        getPaidArticleContent(verification_response.article);
                                        let payment_notification = document.getElementById("paid_article_payment_message"); 
                                        payment_notification.innerHTML = verification_response.message;
                                        const payment_notification_timeout = setTimeout( ()=>{
                                            payment_notification.style.display = "none";
                                        }, 20000);
                                        window.scrollTo({top: 0, behavior: 'smooth'});
                                        console.log('removing overflow hidden');
                                    
                                    }
                                    else{
                                        //verification failed => not a authentic payment
                                        validation.innerHTML = verification_response.message;
                                    }
                                }
                            }
                            xhttp_verify.open("POST",`${base_url}/post-actions/razorpay/verify_signature`, true);
                            xhttp_verify.setRequestHeader("content-type", "application/json");
                            xhttp_verify.send(JSON.stringify(response));
                        }
                        options.modal = {
                            ondismiss : function() {
                                document.getElementById("article_pay_button").disabled = false;
                            }
                        }
                        var rzp1 = new Razorpay(options);
                        rzp1.on('payment.failed', function (response){
                            //article_content.innerHTML = element.innerHTML = "Error description:\n" + response.error.description + "\npayment id:\n" + response.error.metadata.payment_id;
                            document.getElementById("article_pay_button").disabled = false;
                            var xhttp_failed = new XMLHttpRequest();

                            //verification on successful payment
                            xhttp_failed.onreadystatechange = function(){
                                if(this.readyState == 4 && this.status == 200){
                                } else{
                                        //verification failed => not a authentic payment
                                        validation.innerHTML = "Payment Failed";
                                }
                            }
                            response.razorpay_signature = false;
                            response.option = 'paid_article';
                            response.razorpay_order_id = response.error.metadata.order_id;
                            response.razorpay_payment_id = response.error.metadata.payment_id;
                            response.article_guid = paid_article_cookie_name;
                            xhttp_failed.open("POST",`${base_url}/post-actions/razorpay/verify_signature`, true);
                            xhttp_failed.setRequestHeader("content-type", "application/json");
                            xhttp_failed.send(JSON.stringify(response));
                        });
                        rzp1.open();//checkout for payment
                    }
                    else{ //payment failed
                        article_content.innerHTML = order_response.message;
                    }
                }
            }
            xhttp_create_order.open("POST", `${base_url}/post-actions/razorpay/create_order`, true);
            xhttp_create_order.setRequestHeader("content-type", "application/json"); 
            let req = {
                'amount':amount,
                'currency':"INR",
                'article_guid': paid_article_cookie_name,
                'type': "paid_article"
            }
            req = JSON.stringify(req);
            xhttp_create_order.send(req);
        }

        //otp handle
        function sendOtp(object) {
            let {
                mobinput,
                validation,
                otp,
                otp_div,
                vrfybtn,
                alert_para,
                otp_resend,
                otp_attempt
            } = object;

            let login_phone = mobinput.value;
            validation.innerHTML = "";
            otp.value = "";
            //phone number validation
            if(!login_phone){ //case when input feild is empty
                validation.innerHTML = '*Please input a valid mobile number before submitting.';
                vrfybtn.style.background = '#d90b0b';
                vrfybtn.classList.add("wiggle_once");
                return;
            }else{ //case when phone no is wrong
                let filter = /^[0-9]{10}$/; 
                if (!filter.test(login_phone)) {
                    validation.innerHTML = "*Invalid phone number. Please provide a valid phone number";
                    vrfybtn.classList.add("wiggle_once");
                    return;
                }
            }

            //on successful validation
            let login = {
                'mobile':login_phone,
                //'article_guid': postId,
            };
            var xhttp_otp = new XMLHttpRequest();
            xhttp_otp.onreadystatechange = function () {
                if(this.readyState == 4 && this.status == 200) {
                    let otp_response = JSON.parse(this.responseText);
                    if(otp_response.status && otp_response.otp_status){
                        let left_attempt = otp_response.left_attempt;
                        //display otp box
                        if(left_attempt === 0 || left_attempt){
                            alert_para.innerText = 'Please enter the otp.';
                            otp_div.style.display = 'flex';
                            otp_resend.style.display = 'block';
                            otp_attempt.innerHTML = `You have ${left_attempt} attempts left for OTP generation.`;
                            otp_attempt.style.display = 'block';
                            document.getElementById("loginid_submit").disabled = false;
                        }else{
                            otp_resend.style.display = 'none';
                            otp_attempt.style.display = 'none';
                            validation.innerHTML = 'You have reached maximum limit to generate OTP. Please try again after sometime.';
                            otp_div.style.display = 'none !important';
                            document.getElementById("loginid_submit").disabled = true;
                        }
                    }
                    else{
                        otp_div.style.display = 'none';
                        if(otp_response.message){
                            validation.innerHTML = otp_response.message;
                        }else{
                            validation.innerHTML = 'Server error. Please try again after sometime.';
                        }
                    }
                }
            }
            xhttp_otp.open("POST", `${base_url}/post-actions/otp/send`,true);
            xhttp_otp.setRequestHeader("content-type", "application/json");
            xhttp_otp.send(JSON.stringify(login));
        }
        document.getElementById("loginid_submit").onclick = function() { 
            let object = {
                mobinput,
                validation,
                otp,
                otp_div,
                vrfybtn,
                alert_para,
                otp_resend,
                otp_attempt
            }
            otp_resend.style.display = 'none';
            otp_attempt.style.display = 'none';
            sendOtp(object);
        }
        
        //resend otp
        document.getElementById('otp_resend').onclick = function () {
            let object = {
                mobinput,
                validation,
                otp,
                otp_div,
                vrfybtn,
                alert_para,
                otp_resend,
                otp_attempt
            }
            sendOtp(object);
        }


        //login handle 
        document.getElementById('otp_submit').onclick = function () {
            let login_phone = mobinput.value;
            let otp_value = otp.value;
            validation.innerHTML = '';

            //phone number validation
            if(!login_phone){ //case when input feild is empty
                validation.innerHTML = '*Please input a valid mobile number before submitting.';
                vrfybtn.style.background = '#d90b0b';
                vrfybtn.classList.add("wiggle_once");
                return;
            }else{ //case when phone no is wrong
                let filter = /^[0-9]{10}$/; 
                if (!filter.test(login_phone)) {
                    validation.innerHTML = "*Invalid phone number. Please provide a valid phone number";
                    vrfybtn.classList.add("wiggle_once");
                    return;
                }
            }

            //otp validation
            if(!otp_value){ //case when input feild is empty
                validation.innerHTML = '*Please enter OTP before submitting.';
                vrfybtn.style.background = '#d90b0b';
                vrfybtn.classList.add("wiggle_once");
                return;
            }else{ //case when phone no is wrong
                let filter = /^[0-9]{6}$/; 
                if (!filter.test(otp_value)) {
                    validation.innerHTML = "*Invalid OTP.";
                    vrfybtn.classList.add("wiggle_once");
                    return;
                }
            }

            //on successful validation
            let login = {
                'mobile':login_phone,
                'otp': otp_value,
                'article_guid': postId
            };

            //get article content
            var xhttp_login = new XMLHttpRequest();
            xhttp_login.onreadystatechange = function (){
                if(this.readyState == 4 && this.status == 200){
                    let login_response = JSON.parse(this.responseText);
                    if(login_response.isvaliduser){
                        validation.innerHTML = null;
                        //let login_data = login_response.paid_list;
                        let login_notification = true;
                        //login_data.forEach(element => {
                        //    let cookie_data = JSON.stringify(element.cookie_data);
                        //    setCookie(element.cookie_name,cookie_data,30);
                        //    if(paid_article_cookie_name === element.cookie_name){
                        //        login_notification = false;
                        //    }
                        //});
                        if(login_response.article_content){
                            display_excerpt();
                            getPaidArticleContent(login_response.article_content);
                            login_notification = false;
                        }
                        if(login_notification){
                            validation.innerHTML = "You didn't puchased this article. Please pay to access the content of this article."
                            vrfybtn.style.background = '#d90b0b';
                            vrfybtn.classList.add("wiggle_once");
                            return;
                        }
                        window.scrollTo(0,0);
                        //location.reload();
                    }else{
                        if(login_response.message){
                            validation.innerHTML = login_response.message; //message from otp api
                        }else{
                            validation.innerHTML = "*Invalid User. Please pay to read the article";
                        }
                        vrfybtn.style.background = '#d90b0b';
                        vrfybtn.classList.add("wiggle_once");
                    }
                }
            }
            xhttp_login.open("POST",`${base_url}/post-actions/login`,true);
            xhttp_login.setRequestHeader("content-type", "application/json");
            xhttp_login.send(JSON.stringify(login));

        }
    }
}



shareButton = document.getElementById('shareButton');

if (shareButton ){
  shareButton.addEventListener("click", async () => {
    console.log("native_share");
    try {
      await navigator.share({ title: post_title, url: "" });
      console.log("Data was shared successfully");
    } catch (err) {
      console.error("Share failed:", err.message);
    }
});

if (navigator.share === undefined)
    shareButton.hidden = true;

}
 var reg;
var sub;
var isSubscribed = false;
var deferredPrompt;
console.log('header.js');
console.log("headlessAlpha");
var islivetv = false
var livetv_title = "";

if(typeof (source) !== 'undefined' && typeof(isEnable) !== 'undefined' && typeof(title) !== 'undefined'){ // it come from live tv,
  islivetv = true;
  livetv_title = title;
}


let addtoHomescreen = document.getElementById('addtoHomescreen');
let cookieName = 'addToHomeScreen=';
let ca = document.cookie;

if (typeof firebase !== 'undefined') {
  if (firebase.messaging && firebase.messaging.isSupported()) {
    var messaging = firebase.messaging();
  }
}

if (navigator.userAgent.indexOf('UCBrowser/') >= 0) {
  console.log('Service Worker is not supported');
} else {
  if ('serviceWorker' in navigator) {
    var swName = '/../service_worker.js';
    navigator.serviceWorker.register(swName, {
      scope: '/'
    }).then(function (serviceWorkerRegistration) {
      reg = serviceWorkerRegistration;
      // showing ATH just after service worker is registered
      if(typeof(athLayout)=="undefined" || !athLayout || athLayout=='button'){ // when no layout value or button, button shown 
        console.log('Adding ATH button');
        if(document.getElementById('installBtn')){
          document.getElementById('installBtn').style.display = 'block';
        }
      } else { // if layout present and it is footer or fullscreen
          if(ca && !ca.includes(cookieName) ) { // if cookie present and it does not have blocked present then show bodyy
            //when ath is footer remove Scroll To Top
            if(athLayout=='footer') {
              var scroll = document.getElementById('scrolltotop');
              if(scroll){ //prevented breaking of service worker with this check
                scroll.style.visibility = 'hidden';
              }
            }
            if(addtoHomescreen){

              addtoHomescreen.style.display = 'block';
            }
            console.log('Adding ATH Body');
          } else { // if cookie name present then don't show anything
            if(!(athLayout=='button')) {
              console.log('ATH body not shown intentionally');
            }
          }
      }
      // ATH end
      console.log('Service Worker is supported');
      if (typeof firebase !== 'undefined') {
        if(firebase.messaging && firebase.messaging.isSupported()) {
          messaging.useServiceWorker(reg);
          serviceWorkerRegistration.pushManager.getSubscription().then(
            function (pushSubscription) {
              if (pushSubscription) {
                isSubscribed = true;
              } else {
                subscribeFCM();
              }
            });
        }
      }
    }).catch(function (error) {
      console.log('Service Worker Error :^(', error);
    });
  }
}

function subscribeFCM() {
  console.log('subscrbefcm')
  if (!isSubscribed) {
    messaging.requestPermission()
      .then(function () {
        messaging.getToken()
          .then(function (currentToken) {
            console.log("currentToken",currentToken)
            if (currentToken) {
              sendTokenToServer(currentToken);
              isSubscribed = true;
            } else {
              isSubscribed = false;
              setTokenSentToServer(false);
            }
          })
          .catch(function (err) {
            console.log(err);
            isSubscribed = false;
            setTokenSentToServer(false);
          });
      })
      .catch(function (err) {
        console.log('Unable to get permission to notify.', err);
      });
  }
}

function sendTokenToServer(fcmToken) {
  if (!isTokenSentToServer()) {

    console.log("sending token")

    var xhr = new XMLHttpRequest();
    var url = "/notification/subscribe-fcm/" + fcmToken;
    xhr.open("GET", url, true);

    xhr.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        console.log(this.responseText);
      }
    }
    xhr.send();
    setTokenSentToServer(true);
  }
}

function isTokenSentToServer() {
  return window.localStorage.getItem('sentToServer') == 1;
}

function setTokenSentToServer(sent) {
  window.localStorage.setItem('sentToServer', sent ? 1 : 0);
}

function unsubscribeFCM() {
  messaging.getToken()
    .then(function (currentToken) {
      messaging.deleteToken(currentToken)
        .then(function () {
          console.log('Token deleted.');
          setTokenSentToServer(false);
          var xhr = new XMLHttpRequest();
          var url = "/notification/unsubscribe-fcm/" + currentToken;
          xhr.open("GET", url, true);
          xhr.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
              console.log(this.responseText);
            }
          }
          
          xhr.send();
          isSubscribed = false;
        })
        .catch(function (err) {
          console.log('Unable to delete token. ', err);
        });
    })
    .catch(function (err) {
      console.log('Error retrieving Instance ID token. ', err);
    });
}

function closeHomescreen() {
    addtoHomescreen.style.display = 'none';
    const d = new Date();
    d.setTime(d.getTime() + (24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = `addToHomeScreen=close;expires=${expires};path=/`;
}


if(islivetv){

  function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Function to display or hide the live TV based on device type and last closed time
  function manageLiveTV() {
    let isVisble = true;
    let tvBut = document.getElementById('tv-close');
    if (isMobileDevice()) {
      isVisble = false;
      let lastClosedTime = localStorage.getItem('liveTvClosedTime');
      let currentTime = new Date().getTime();
      let timeDifference = (currentTime - lastClosedTime) / (1000 * 60 * 60 * 24); // Calculate time difference in days
      if (!lastClosedTime || timeDifference >= 7) {
        isVisble = true;
        if(tvBut){
          tvBut.style.display = "block";
        }
      }
    }

    let element = document.getElementById('liveTvCard');
    
    console.log(tvBut)
    if (element && isVisble) {
      let html = `<span id="tv-close" class="tv-close-btn" onclick="removeTV(event)">&times;</span><div class="post-type-heading" style="background-color:#fff"><h2 style="color:#000;border-bottom:4px solid #e21e23">${livetv_title}</h2></div>`;
      html += `<iframe id="tvIframe" src=${source} frameborder="0" width="100%" height="100%" allow="autoplay" allowfullscreen="" mozallowfullscreen="" webkitallowfullscreen="" scrolling="no" loading='lazy'></iframe>`;
      element.innerHTML += html;
      console.log("Live TV added");
  }
  }
  manageLiveTV();
  function removeTV(event) {
    event.preventDefault();
    let closebtn = document.getElementById("tv-close");
    closebtn.parentNode.style.display = "none"; // Assuming "tv-close" is the ID of the close button's span
    let iframe = document.getElementById("tvIframe");
    iframe.parentNode.removeChild(iframe); // Remove the iframe directly from its parent
    if (isMobileDevice()) {
        localStorage.setItem('liveTvClosedTime', new Date().getTime());
    }
  }
} 